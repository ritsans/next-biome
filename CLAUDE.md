# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 15.5アプリケーション（App Router使用）で、Biomeをリンターおよびフォーマッターとして使用しています。

## Key Technologies

- **Next.js 15.5** with Turbopack enabled
- **React 19.1**
- **TypeScript**
- **Tailwind CSS v4**
- **Biome** (ESLintとPrettierの代替として使用)
- **Zod** (バリデーションライブラリ)

## Essential Commands

### Development
```bash
npm run dev          # 開発サーバーを起動 (Turbopack使用、http://localhost:3000)
npm run build        # 本番用ビルドを実行 (Turbopack使用)
npm start            # 本番サーバーを起動
```

### Code Quality
```bash
npm run lint         # Biomeでコードをチェック
npm run format       # Biomeでコードを自動フォーマット
```
30行以上コードを出力した場合にのみ、自動でLintを実行させること

## Architecture

### Code Organization Principles
**Server-side と Client-side のロジックは明確に分離し、関連するファイルはできるだけ同じディレクトリに配置する**

- **コロケーションパターン**: ページディレクトリ内に関連するServer ActionsとClient Componentsを配置
  ```
  src/app/login/
  ├── page.tsx       (Client Component - フォームなどのUI)
  └── actions.ts     (Server Actions - 認証処理など)
  ```
- **Server Actions**: 各ページディレクトリ内の `actions.ts` に配置
  - ページ固有のロジック（login, signup, forgot-password, reset-password）
  - **例外**: 複数ページで共有するロジックは `src/actions/` に配置（例: `profile.ts`）
- **Client Components**: ページ内で分離が必要な場合は同ディレクトリ内に配置
  - ファイル名: `form.tsx`, `client-component.tsx` など簡潔な名前
  - 例: `onboarding/form.tsx` - オンボーディング専用のフォームコンポーネント
- **再利用可能なコンポーネント**: `src/components/` に配置
  - 複数ページで使用されるUI部品のみ

### Validation System
- **Zod** (`^3.25.76`) を使用したバリデーション
- **スキーマ定義**: `src/lib/validations.ts`
  - `signUpSchema` - 新規登録（email形式チェック、password 6文字以上）
  - `signInSchema` - ログイン（email形式チェック、password 1文字以上）
  - `profileSchema` - プロフィール（username、display_name、bio、avatar_url）
- **実装パターン**:
  - Server Actions: Zodで`safeParse()`し、エラーは`{ error: string }`形式で返却
  - Server Actionsで`useActionState`を使う場合は`(prevState, formData) => Promise<{error: string} | null>`の型シグネチャを使用
  - Client Components: フィールドごとに状態管理（controlled components）
  - HTML5バリデーション無効化（`type="text"`, `required`属性なし）
  - `onSubmit`で`e.preventDefault()`を使用
  - 各入力欄直下に赤色テキストでエラー表示（`text-red-600`）
  - サーバーエラーはフォーム上部に表示

### Authentication System
- **Supabase Auth**を使用した認証システムを実装
- **Server Actions** - 各ページディレクトリ内の `actions.ts` に配置
  - `login/actions.ts`: `signIn()` - ログイン処理
  - `signup/actions.ts`: `signUp()` - 新規登録処理
  - `forgot-password/actions.ts`: `requestPasswordReset()` - パスワードリセット要求
  - `reset-password/actions.ts`: `resetPassword()` - パスワードリセット実行
  - `src/actions/profile.ts`: `updateProfile()` - プロフィール更新（複数ページで共有）
- **Middleware** (`src/middleware.ts`) で認証保護とセッション管理
  - `/mypage`、`/logout`、`/onboarding`は認証必須
  - 未認証時は自動的に`/login`へリダイレクト
  - セッションの自動更新（トークンリフレッシュ）

### Supabase Client Configuration
- **Client-side**: `src/utils/supabase/client.ts` - ブラウザ用クライアント
- **Server-side**: `src/utils/supabase/server.ts` - Server Components/Actions用クライアント
- **環境変数必須**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `NEXT_PUBLIC_SITE_URL` (ユーザー登録に必要、例: `http://localhost:3000`)

### Database Schema
- **`profiles` テーブル** (`auth.users` に外部キー)
  - `id uuid` (PK, FK to auth.users)
  - `display_name text` - 表示名
  - `avatar_url text` - アバター画像URL
  - `bio text` - 自己紹介
  - `username citext` - 一意なユーザー名（形式: `^[a-z0-9_]{3,30}$`）
  - `is_public boolean default false` - プロフィール公開設定
  - `created_at timestamptz`, `updated_at timestamptz` (自動更新トリガー付き)
- **RLS (Row Level Security)**
  - 認証ユーザーは自分のプロフィールのみ select/insert/update 可能
  - `is_public = true` のプロフィールは匿名ユーザーも参照可能
- **新規ユーザー自動作成**: `auth.users` への insert 時に `profiles` レコードを自動生成

### Directory Structure
- `src/app/` - Next.js App Routerのルートディレクトリ
  - `layout.tsx` - ルートレイアウト（Header/Footer含む）
  - `page.tsx` - ホームページ
  - `login/` - ログインページ
    - `page.tsx` - Client Component（フォームUI、Zodバリデーション実装済み）
    - `actions.ts` - Server Actions（`signIn`）
  - `signup/` - 新規登録ページ
    - `page.tsx` - Client Component（フォームUI、Zodバリデーション実装済み）
    - `actions.ts` - Server Actions（`signUp`）
  - `forgot-password/` - パスワードリセット要求ページ
    - `page.tsx` - Client Component
    - `actions.ts` - Server Actions（`requestPasswordReset`）
  - `reset-password/` - パスワードリセット実行ページ
    - `page.tsx` - Client Component
    - `actions.ts` - Server Actions（`resetPassword`）
  - `mypage/` - 認証保護されたマイページ
  - `logout/` - ログアウト処理（Server Component、即座にログアウト→トップページへ）
  - `onboarding/` - 初回プロフィール設定ページ
    - `page.tsx` - Server Component（データ取得）
    - `form.tsx` - Client Component（フォームUI）
- `src/actions/` - 共有Server Actions
  - `profile.ts` - プロフィール管理（`updateProfile`、複数ページで使用）
- `src/components/` - 再利用可能なコンポーネント
  - `Header.tsx` - 認証状態とパスに応じてナビゲーション切り替え
    - 未ログイン（ホーム）: 「ログイン」リンク表示
    - ログイン/新規登録ページ: 「ホーム」リンクのみ表示
    - ログイン済み: 「マイページ」「ログアウト」リンク表示
    - middlewareから`x-pathname`ヘッダーを受け取りページ判定
- `src/lib/` - 共通ライブラリ
  - `validations.ts` - Zodバリデーションスキーマ定義
- `src/utils/` - ユーティリティ関数
- `src/middleware.ts` - Next.js Middleware（認証チェック）
  - 認証保護: `/mypage`, `/logout`, `/onboarding`へのアクセス制御
  - プロフィール未完了チェック: display_nameが未設定なら`/onboarding`へリダイレクト
  - `x-pathname`ヘッダーをレスポンスに追加（Header.tsxで使用）

### Path Aliases
- `@/*` は `./src/*` にマップされています（例: `import Component from '@/components/Button'`）

### Biome Configuration
- **Formatter**: 2スペースインデント
- **Linter**: 推奨ルール有効、Next.jsとReactドメイン最適化
- **Auto-organize imports**: 保存時にimport文を自動整理
- Git連携が有効（.gitignoreを尊重）
- **重要**: non-null assertion (`!`) は禁止。環境変数は必ずnullチェックを行う
- **重要**: `forEach`内でreturnしない（`for...of`を使用）

## Important Notes

- このプロジェクトはESLintやPrettierの代わりにBiomeを使用しています
- TurbopackがdevとbuildコマンドでデフォルトON
- TypeScriptのstrictモードが有効
- 認証システムはSupabase Authを使用（セッションベース）
- Server ComponentsとClient Componentsを適切に使い分ける
  - 認証チェック: Server Componentsで`createClient()`を使用
  - フォーム送信: Client Componentsで`"use client"`ディレクティブ
