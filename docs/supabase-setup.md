# Supabase セットアップまとめ

このドキュメントは、本プロジェクトで Supabase 側に実施した設定と、その背景・意図をチーム/AI が素早く把握できるようにまとめたものです。

## 目的
- 認証ユーザーにプロフィール情報を紐づける（`profiles` テーブル）
- プロフィールの公開/非公開をユーザーが選べるようにする（`is_public`）
- 人間可読な URL を実現するための一意な `username` を導入する

## 実施内容（確定）
- `profiles` テーブルの作成（`auth.users(id)` に外部キー）
  - カラム: `id uuid`（PK, FK）, `display_name text`, `avatar_url text`, `bio text`,
    `created_at timestamptz default now()`, `updated_at timestamptz default now()`
  - `updated_at` 自動更新トリガーを作成
- RLS（行レベルセキュリティ）の有効化と本人のみ操作ポリシー
  - 本人のみ `select/insert/update` 可能（条件: `auth.uid() = id`）
- 既存ユーザーのバックフィル
  - 既存の `auth.users` に対して `profiles` の初期行を作成
  - `username` をメールのローカル部（@より前）から初期化し、空の場合は `user_<id先頭8桁>` を付与

## 追加実装（導入済み/導入想定）
- 公開設定
  - `profiles.is_public boolean not null default false` を追加
  - 公開プロフィール（`is_public = true`）は匿名/認証ユーザーいずれからも参照可能にする select ポリシーを追加
- `username` の導入
  - `username` カラム（推奨: `citext` 型）
  - 一意制約と形式制約（`^[a-z0-9_]{3,30}$`）
  - バックフィル完了後、将来的に `NOT NULL` 化（安全条件を満たした上で）

> 注: `NOT NULL` 化は「全レコードが埋まった」「重複なし」「新規作成時に必ず生成できる（例: DBトリガー）」が満たされてから適用します。

## 推奨（任意・今後）
- 新規ユーザー自動作成トリガー（`auth.users` への insert 後に `profiles` 行を自動作成）
  - RLS の影響を受けないよう `security definer set search_path = public` で実装
  - 可能なら `raw_user_meta_data` から `display_name`/`avatar_url`/`username` を自動初期化
- `username` の運用
  - 予約語のブロック（例: `admin`, `support`, `api` など）
  - 変更頻度制限（例: 30日に1回）
  - 旧 `username` からのリダイレクト履歴が必要なら履歴テーブルを別途用意

---

## 実行 SQL（参考）

### 1) テーブル作成 + `updated_at` トリガー
```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.handle_updated_at();
```

### 2) RLS ポリシー（本人のみ）
```sql
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
```

### 3) 公開設定（任意: 公開プロフィールの参照許可）
```sql
alter table public.profiles
add column if not exists is_public boolean not null default false;

create policy profiles_select_public_anon
on public.profiles
for select
to anon
using (is_public is true);

create policy profiles_select_public_auth
on public.profiles
for select
to authenticated
using (is_public is true);
```

### 4) `username` カラムと制約（推奨）
```sql
create extension if not exists citext with schema public;

alter table public.profiles
  add column if not exists username citext;

alter table public.profiles
  add constraint if not exists profiles_username_unique unique (username);

alter table public.profiles
  add constraint if not exists profiles_username_format_check
  check (username is null or username ~ '^[a-z0-9_]{3,30}$');
```

### 5) 既存ユーザーの `username` 初期化
- メールローカル部 → 小文字化 → 許可外文字削除。空なら `user_<id先頭8桁>` にフォールバック。
```sql
update public.profiles as p
set username = coalesce(
  nullif(lower(regexp_replace(split_part(u.email,'@',1),'[^a-z0-9_]','','g')), ''),
  'user_' || substr(p.id::text,1,8)
)
from auth.users as u
where p.id = u.id
  and p.username is null;
```

### 6) 将来的な `NOT NULL` 化（条件を満たした後）
```sql
-- 確認: すべて埋まっているか
select count(*) from public.profiles where username is null;

-- 問題なければ必須化
alter table public.profiles
  alter column username set not null;
```

### 7) 新規ユーザー自動作成トリガー（任意・推奨）
```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
```

---

## 動作確認（例）
- 認証済み本人のプロフィール取得
```sql
-- 例: Supabase SQL エディタで JWT を自分のものに切替えて実行
select id, display_name, username, is_public from public.profiles where id = auth.uid();
```
- 公開プロフィールの匿名参照
```sql
-- 例: 匿名ロールで is_public = true の行が返ること
select id, username from public.profiles where is_public is true limit 10;
```
- `username` の一意性と形式
```sql
-- 一意制約エラーや形式チェックエラーが期待通りに出るか確認
insert into public.profiles (id, username) values ('00000000-0000-0000-0000-000000000000', 'NG!');
```

---

## 補足
- アプリ側では、マイページで `profiles` を join して `display_name`/`bio`/`avatar_url`/`username`/`is_public` を取得・表示します。
- 公開プロフィールページ（例: `/u/[username]`）は、RLS により `is_public = true` の行のみ匿名参照可能です。
- 今後、`username` の予約語/重複解消/変更頻度制限をアプリ層で追加すると運用が安定します。

