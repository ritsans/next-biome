import { updateProfile } from "@/actions/profile";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 現在のプロフィールを取得
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, bio, avatar_url")
    .eq("id", user.id)
    .single();

  // すでにプロフィールが完了している場合はマイページへ
  //   [開発中のためコメントアウト]
  //   if (profile?.display_name) {
  //     redirect("/mypage");
  //   }
  //   [/開発中のためコメントアウト]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">ようこそ！</h2>
          <p className="mt-2 text-center text-sm text-gray-600">プロフィールを設定して始めましょう</p>
        </div>

        <OnboardingForm
          initialUsername={profile?.username || ""}
          initialBio={profile?.bio || ""}
          initialAvatarUrl={profile?.avatar_url || ""}
        />
      </div>
    </div>
  );
}

function OnboardingForm({
  initialUsername,
  initialBio,
  initialAvatarUrl,
}: {
  initialUsername: string;
  initialBio: string;
  initialAvatarUrl: string;
}) {
  return (
    <form action={updateProfile} className="mt-8 space-y-6">
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
        <button
          type="submit"
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          プロフィールを設定
        </button>
      </div>
    </form>
  );
}
