/**
 * Supabaseエラーを日本語メッセージに変換
 */
export function errorToJP(error: { code?: string; message?: string }): string {
  // error.codeベースの変換（推奨）
  if (error.code) {
    switch (error.code) {
      // Auth errors
      case "invalid_credentials":
        return "メールアドレスまたはパスワードが正しくありません";
      case "email_exists":
        return "このメールアドレスは既に登録されています";
      case "user_not_found":
        return "ユーザーが見つかりません";
      case "weak_password":
        return "パスワードが弱すぎます";
      case "over_request_rate_limit":
        return "リクエストが多すぎます。しばらく待ってから再試行してください";
      case "anonymous_provider_disabled":
        return "匿名ログインは無効になっています";
      case "bad_code_verifier":
        return "認証コードの検証に失敗しました";
      case "bad_jwt":
        return "認証トークンが無効です";
      case "signup_disabled":
        return "新規登録は現在無効になっています";

      // PostgreSQL errors
      case "23505":
        return "このユーザー名は既に使用されています";

      default:
        break;
    }
  }

  // error.messageベースのフォールバック
  if (error.message) {
    const message = error.message.toLowerCase();

    if (message.includes("invalid login credentials") || message.includes("invalid credentials")) {
      return "メールアドレスまたはパスワードが正しくありません";
    }
    if (message.includes("email already registered") || message.includes("user already registered")) {
      return "このメールアドレスは既に登録されています";
    }
    if (message.includes("user not found")) {
      return "ユーザーが見つかりません";
    }
    if (message.includes("password") && message.includes("weak")) {
      return "パスワードが弱すぎます";
    }
    if (message.includes("rate limit")) {
      return "リクエストが多すぎます。しばらく待ってから再試行してください";
    }
  }

  // デフォルトメッセージ
  return error.message || "エラーが発生しました";
}
