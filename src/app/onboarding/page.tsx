import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import OnboardingForm from "./OnboardingForm";

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
