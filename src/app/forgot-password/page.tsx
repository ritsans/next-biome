"use client";

import { useState } from "react";
import { requestPasswordReset } from "./actions";
import { resetPasswordRequestSchema } from "@/lib/validations";

export default function ForgotPasswordPage() {
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [serverError, setServerError] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setServerError("");
    setSuccess(false);

    const validation = resetPasswordRequestSchema.safeParse({ email });

    if (!validation.success) {
      const fieldErrors: { email?: string } = {};
      for (const error of validation.error.errors) {
        const field = error.path[0] as "email";
        if (!fieldErrors[field]) {
          fieldErrors[field] = error.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    const formData = new FormData();
    formData.append("email", email);

    const result = await requestPasswordReset(formData);
    if (result?.error) {
      setServerError(result.error);
    } else if (result?.success) {
      setSuccess(true);
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">パスワードリセット</h1>

        {success ? (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            パスワードリセット用のメールを送信しました。メールをご確認ください。
          </div>
        ) : (
          <>
            {serverError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{serverError}</div>
            )}

            <p className="mb-6 text-sm text-gray-600">
              登録されているメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス
                </label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                リセットメールを送信
              </button>
            </form>
          </>
        )}

        <p className="mt-4 text-center text-sm text-gray-600">
          <a href="/login" className="text-blue-600 hover:underline">
            ログインページに戻る
          </a>
        </p>
      </div>
    </div>
  );
}
