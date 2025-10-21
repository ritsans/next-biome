"use client";

import { useActionState, useFormStatus } from "react";
import { updateProfile } from "@/actions/profile";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "処理中..." : "プロフィールを設定"}
    </button>
  );
}

export default function OnboardingForm({
  initialUsername,
  initialBio,
  initialAvatarUrl,
}: {
  initialUsername: string;
  initialBio: string;
  initialAvatarUrl: string;
}) {
  const [state, formAction] = useActionState(updateProfile, null);

  return (
    <form action={formAction} className="mt-8 space-y-6">
      {state?.error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">{state.error}</div>}

      <div className="rounded-md shadow-sm space-y-4">
        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            ユーザー名 <span className="text-red-600 font-bold">*</span>
          </label>
          <input
            id="username"
            name="username"
            type="text"
            defaultValue={initialUsername}
            required
            pattern="^[a-z0-9_]{3,30}$"
            className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="例: user_name123"
          />
          <p className="mt-1 text-xs text-gray-500">3〜30文字の小文字英数字とアンダースコア</p>
          <p className="mt-1 text-xs text-red-600 font-semibold">⚠️ ユーザー名は後から変更できません</p>
        </div>

        {/* Display Name */}
        <div>
          <label htmlFor="display_name" className="block text-sm font-medium text-gray-700">
            表示名 <span className="text-red-600 font-bold">*</span>
          </label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            required
            className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="例: 田中太郎"
          />
          <p className="mt-1 text-xs text-gray-500">後から変更できます</p>
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
            自己紹介 <span className="text-gray-500 text-xs">(任意)</span>
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            defaultValue={initialBio}
            className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="あなたについて教えてください"
          />
        </div>

        {/* Avatar URL */}
        <div>
          <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700">
            アバター画像URL <span className="text-gray-500 text-xs">(任意)</span>
          </label>
          <input
            id="avatar_url"
            name="avatar_url"
            type="url"
            defaultValue={initialAvatarUrl}
            className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="https://example.com/avatar.jpg"
          />
        </div>
      </div>

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
