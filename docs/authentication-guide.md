# ユーザー認証とバリデーションの仕組み

このアプリでは、**Supabase** という認証サービスを使って、ユーザーの新規登録やログインを安全に管理しています。また、**Zod** というライブラリを使って、ユーザーが入力したデータが正しい形式かどうかをチェックしています。

この文書では、それぞれの仕組みをわかりやすく解説します！

---

## 📋 目次

1. [バリデーション（入力チェック）の仕組み](#バリデーション入力チェックの仕組み)
2. [認証システムの全体像](#認証システムの全体像)
3. [各機能の詳しい解説](#各機能の詳しい解説)
4. [エラーメッセージの日本語化](#エラーメッセージの日本語化)
5. [セキュリティ保護の仕組み](#セキュリティ保護の仕組み)

---

## バリデーション（入力チェック）の仕組み

### バリデーションって何？

**バリデーション**とは、ユーザーが入力したデータが「正しい形式」「安全な内容」かどうかをチェックすることです。

例えば：
- メールアドレスに「@」が含まれているか
- パスワードが十分な長さか
- ユーザー名に使えない文字が含まれていないか

これをチェックすることで、データベースに変なデータが保存されるのを防ぎます。

### Zodを使ったバリデーション

このアプリでは **Zod** というライブラリを使って、入力データのルールを定義しています。

#### 定義場所
`src/lib/validations.ts` にすべてのバリデーションルールが書かれています。

#### ログインのルール（`signInSchema`）

```typescript
export const signInSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});
```

- **email**: メールアドレス形式かチェック（`@`が含まれているか等）
- **password**: 1文字以上入力されているかチェック

#### 新規登録のルール（`signUpSchema`）

```typescript
export const signUpSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(6, "パスワードは6文字以上で入力してください"),
});
```

- ログインと違って、パスワードは **6文字以上** 必要

#### プロフィールのルール（`profileSchema`）

```typescript
export const profileSchema = z.object({
  username: z
    .string()
    .min(3, "ユーザー名は3文字以上で入力してください")
    .max(30, "ユーザー名は30文字以下で入力してください")
    .regex(/^[a-z0-9_]+$/, "ユーザー名は小文字英数字とアンダースコアのみ使用できます"),
  display_name: z.string().min(1, "表示名を入力してください").max(50, "表示名は50文字以下で入力してください"),
  bio: z.string().max(500, "自己紹介は500文字以下で入力してください").optional(),
  avatar_url: z.string().url("有効なURLを入力してください").optional().or(z.literal("")),
});
```

- **username**: 3〜30文字、小文字英数字とアンダースコアのみ
- **display_name**: 1〜50文字
- **bio**: 500文字以内（入力は任意）
- **avatar_url**: URL形式、または空欄（入力は任意）

### バリデーションの流れ

#### 1. クライアント側でのチェック（ブラウザ内）

ユーザーがフォームを送信する前に、ブラウザ上でバリデーションを行います。

例：`src/app/login/page.tsx:23-36`

```typescript
const validation = signInSchema.safeParse({ email, password });

if (!validation.success) {
  // エラーがあれば、各入力欄の下に赤字でエラーメッセージを表示
  const fieldErrors: { email?: string; password?: string } = {};
  for (const error of validation.error.errors) {
    const field = error.path[0] as "email" | "password";
    if (!fieldErrors[field]) {
      fieldErrors[field] = error.message;
    }
  }
  setErrors(fieldErrors);
  setIsPending(false);
  return; // ここで処理を中断
}
```

**メリット**：
- サーバーに送る前にエラーがわかるので、ユーザーはすぐに修正できる
- サーバーへの無駄な通信を減らせる

#### 2. サーバー側でのチェック（再確認）

クライアント側でチェックしても、悪意のあるユーザーが直接サーバーにリクエストを送る可能性があります。そのため、サーバー側でも必ずチェックを行います。

例：`src/app/login/actions.ts:12-16`

```typescript
const validation = signInSchema.safeParse({ email, password });

if (!validation.success) {
  return { error: validation.error.errors[0].message };
}
```

**メリット**：
- 不正なデータがデータベースに保存されるのを防ぐ
- セキュリティが強化される

---

## 認証システムの全体像

### 使っている技術

- **Supabase Auth**: Googleが作ったFirebase認証に似た、認証専用のサービス
- **Next.js Server Actions**: サーバー側で実行される関数（`"use server"` で定義）
- **Middleware**: ページにアクセスする前にチェックを行う仕組み

### 認証の流れ（ログインの場合）

```
1. ユーザーがログインフォームに入力
   ↓
2. 【ブラウザ】Zodでバリデーションチェック
   ↓（エラーがあればここで止まる）
3. 【ブラウザ】Server Action（signIn）を呼び出し
   ↓
4. 【サーバー】再度Zodでバリデーションチェック
   ↓
5. 【サーバー】Supabaseに「このメールアドレスとパスワードで認証できる？」と問い合わせ
   ↓
6. 【Supabase】データベースで照合
   ↓（認証成功）
7. 【サーバー】セッションCookie（ログイン状態を保存）を設定
   ↓
8. 【サーバー】マイページ（/mypage）にリダイレクト
```

---

## 各機能の詳しい解説

### 1. 新規登録（Sign Up）

#### ファイル
- フォーム: `src/app/signup/page.tsx`
- Server Action: `src/app/signup/actions.ts`

#### 処理の流れ

1. **フォーム送信**
   - ユーザーがメールアドレスとパスワードを入力

2. **クライアント側バリデーション**
   - メールアドレスが正しい形式か
   - パスワードが6文字以上か

3. **Server Action実行** (`signUp`)
   ```typescript
   export async function signUp(formData: FormData) {
     // 1. フォームからデータを取得
     const email = formData.get("email") as string;
     const password = formData.get("password") as string;

     // 2. サーバー側でもバリデーション
     const validation = signUpSchema.safeParse({ email, password });
     if (!validation.success) {
       return { error: validation.error.errors[0].message };
     }

     // 3. Supabaseで新規登録
     const { error } = await supabase.auth.signUp({
       email: validation.data.email,
       password: validation.data.password,
       options: {
         emailRedirectTo: `${siteUrl}/auth/callback`,
       },
     });

     // 4. 成功したら確認ページへリダイレクト
     redirect("/signup/verify");
   }
   ```

4. **メール確認**
   - Supabaseから確認メールが届く
   - メール内のリンクをクリックすると認証が完了

### 2. ログイン（Sign In）

#### ファイル
- フォーム: `src/app/login/page.tsx`
- Server Action: `src/app/login/actions.ts`

#### 処理の流れ

1. **フォーム送信**
   - メールアドレスとパスワードを入力

2. **クライアント側バリデーション**
   - メールアドレスが正しい形式か
   - パスワードが入力されているか

3. **Server Action実行** (`signIn`)
   ```typescript
   export async function signIn(formData: FormData) {
     // 1. バリデーション
     const validation = signInSchema.safeParse({ email, password });

     // 2. Supabaseで認証
     const { error } = await supabase.auth.signInWithPassword({
       email: validation.data.email,
       password: validation.data.password,
     });

     // 3. 成功したらマイページへ
     redirect("/mypage");
   }
   ```

4. **セッション作成**
   - ログイン成功すると、ブラウザにCookieが保存される
   - このCookieがあれば「ログイン済み」とわかる

### 3. パスワードリセット

#### ファイル
- リセット要求: `src/app/forgot-password/`
- リセット実行: `src/app/reset-password/`

#### 処理の流れ

**ステップ1: リセット要求**

1. ユーザーがメールアドレスを入力
2. `requestPasswordReset` Server Actionが実行される
3. Supabaseがリセット用のメールを送信
4. メールにはリセット用のリンク（`/reset-password?token=xxx`）が含まれる

**ステップ2: 新しいパスワード設定**

1. メール内のリンクをクリック
2. 新しいパスワードを入力（6文字以上）
3. `resetPassword` Server Actionが実行される
4. Supabaseでパスワードが更新される

### 4. プロフィール更新

#### ファイル
- フォーム: `src/app/onboarding/form.tsx`
- Server Action: `src/actions/profile.ts`

#### 処理の流れ

1. **フォーム入力**
   - ユーザー名（username）
   - 表示名（display_name）
   - 自己紹介（bio）
   - アバターURL（avatar_url）

2. **バリデーション**
   - ユーザー名: 3〜30文字、小文字英数字とアンダースコアのみ
   - 表示名: 1〜50文字

3. **Server Action実行** (`updateProfile`)
   ```typescript
   export async function updateProfile(prevState, formData) {
     // 1. バリデーション
     const validation = profileSchema.safeParse({ ... });

     // 2. 認証確認
     const { data: { user } } = await supabase.auth.getUser();
     if (!user) {
       return { error: "認証されていません" };
     }

     // 3. データベース更新
     await supabase.from("profiles").update({ ... }).eq("id", user.id);

     // 4. 成功したらマイページへ
     redirect("/mypage");
   }
   ```

---

## エラーメッセージの日本語化

### なぜ日本語化が必要？

Supabaseは英語のエラーメッセージを返します。例えば：
- `"Invalid login credentials"` → ユーザーには意味がわからない

そこで、`src/lib/errors.ts` でエラーコードを日本語に変換しています。

### 変換の仕組み

```typescript
export function errorToJP(error: { code?: string; message?: string }): string {
  if (error.code) {
    switch (error.code) {
      case "invalid_credentials":
        return "メールアドレスまたはパスワードが正しくありません";
      case "email_exists":
        return "このメールアドレスは既に登録されています";
      // ... 他のエラーコード
    }
  }
  // フォールバック: エラーメッセージから推測
  if (error.message?.includes("invalid login credentials")) {
    return "メールアドレスまたはパスワードが正しくありません";
  }
  // デフォルト
  return error.message || "エラーが発生しました";
}
```

### 使い方

すべてのServer Actionで使われています：

```typescript
const { error } = await supabase.auth.signIn(...);

if (error) {
  return { error: errorToJP(error) }; // 日本語に変換して返す
}
```

---

## セキュリティ保護の仕組み

### Middleware（門番）の役割

`src/middleware.ts` は、ページにアクセスする**前**に実行される特別な関数です。

#### 主な役割

1. **認証が必要なページの保護**
   ```typescript
   if (!user && (pathname.startsWith("/mypage") || pathname.startsWith("/logout") || pathname.startsWith("/onboarding"))) {
     // ログインしていなければ、ログインページへリダイレクト
     return NextResponse.redirect("/login");
   }
   ```

2. **プロフィール未完了チェック**
   ```typescript
   if (user && pathname.startsWith("/mypage")) {
     const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).single();

     if (!profile || !profile.display_name) {
       // プロフィール未設定なら、オンボーディングページへ
       return NextResponse.redirect("/onboarding");
     }
   }
   ```

3. **セッションの自動更新**
   ```typescript
   // トークンの有効期限が切れそうなら、自動的に更新
   const { data: { user } } = await supabase.auth.getUser();
   ```

### Row Level Security（RLS）

データベース側でも保護されています。

#### プロフィールテーブルのルール

- **自分のプロフィール**: 読み取り・更新可能
- **他人のプロフィール**: `is_public = true` なら読み取り可能、更新は不可

これにより、悪意のあるユーザーが他人のプロフィールを勝手に変更できないようになっています。

---

## まとめ

### データの流れ（復習）

```
ユーザー入力
  ↓
【ブラウザ】クライアント側バリデーション（Zod）
  ↓（エラーがあれば即座にフィードバック）
【サーバー】Server Action実行
  ↓
【サーバー】サーバー側バリデーション（Zod） ← セキュリティのため再確認
  ↓
【サーバー】Supabase認証 or データベース操作
  ↓
【Middleware】ページ保護・セッション管理
  ↓
結果を表示 or リダイレクト
```

### セキュリティのポイント

1. **2段階バリデーション**: クライアント側とサーバー側の両方でチェック
2. **Middleware保護**: 認証が必要なページは自動的にガード
3. **RLS**: データベースレベルでアクセス制御
4. **エラーメッセージの適切な処理**: 日本語化してユーザーにわかりやすく

### 拡張のヒント

今後、新しい機能を追加する場合：

1. **新しいフォームを作る**
   - `src/lib/validations.ts` にZodスキーマを追加
   - クライアント側とサーバー側の両方でバリデーション

2. **新しい認証ページを作る**
   - Middlewareの`config.matcher`に追加
   - 必要なら保護ロジックを追加

3. **エラーメッセージを日本語化**
   - `src/lib/errors.ts` に新しいエラーコードを追加

---

**このアプリの認証システムは、ユーザーにとって使いやすく、開発者にとって保守しやすく、そして何よりセキュアに設計されています！** 🎉
