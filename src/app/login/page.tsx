"use client";

import type { User } from "@supabase/supabase-js";
import { useState } from "react";
import { supabase } from "@/utils/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<User | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(`❌ エラー: ${error.message}`);
      } else {
        const { data: me } = await supabase.auth.getUser();
        setUserInfo(me.user);
        setMessage(
          `✅ ログイン成功: ${
            me.user?.email ?? data.user?.email ?? "(no email)"
          }`
        );
      }
    } catch (error) {
      setMessage(
        `❌ エラー: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold">ログインテスト</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                パスワード
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>

          {message && (
            <div className="mt-4 p-4 rounded-md bg-gray-100">
              <p className="text-sm text-gray-800">{message}</p>
            </div>
          )}

          {userInfo && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700">User JSON</p>
              <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                {JSON.stringify(userInfo, null, 2)}
              </pre>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
