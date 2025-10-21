"use client";

import { useState } from "react";
import { resetPassword } from "./actions";
import { resetPasswordSchema } from "@/lib/validations";

export default function ResetPasswordPage() {
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [serverError, setServerError] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isPending, setIsPending] = useState<boolean>(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setServerError("");
    setIsPending(true);

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "パスワードが一致しません" });
      setIsPending(false);
      return;
    }

    const validation = resetPasswordSchema.safeParse({ password });

    if (!validation.success) {
      const fieldErrors: { password?: string } = {};
      for (const error of validation.error.errors) {
        const field = error.path[0] as "password";
        if (!fieldErrors[field]) {
          fieldErrors[field] = error.message;
        }
      }
      setErrors(fieldErrors);
      setIsPending(false);
      return;
    }

    const formData = new FormData();
    formData.append("password", password);

    const result = await resetPassword(formData);
    if (result?.error) {
      setServerError(result.error);
      setIsPending(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">新しいパスワード設定</h1>

        {serverError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{serverError}</div>
        )}

        <p className="mb-6 text-sm text-gray-600">新しいパスワードを入力してください。</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              新しいパスワード
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

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              新しいパスワード（確認）
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "処理中..." : "パスワードを変更"}
          </button>
        </form>
      </div>
    </div>
  );
}
