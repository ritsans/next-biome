"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn } from "./actions";
import { signInSchema } from "@/lib/validations";

export default function LoginPage() {
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setServerError("");

    const validation = signInSchema.safeParse({ email, password });

    if (!validation.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      for (const error of validation.error.errors) {
        const field = error.path[0] as "email" | "password";
        if (!fieldErrors[field]) {
          fieldErrors[field] = error.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const result = await signIn(formData);
    if (result?.error) {
      setServerError(result.error);
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">ログイン</h1>

        {message && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">{message}</div>
        )}

        {serverError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{serverError}</div>
        )}

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

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              パスワード
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            ログイン
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          <a href="/forgot-password" className="text-blue-600 hover:underline">
            パスワードを忘れた場合
          </a>
        </div>

        <p className="mt-4 text-center text-sm text-gray-600">
          アカウントをお持ちでない方は{" "}
          <a href="/signup" className="text-blue-600 hover:underline">
            新規登録
          </a>
        </p>
      </div>
    </div>
  );
}
