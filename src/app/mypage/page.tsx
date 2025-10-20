import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function MyPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">マイページ</h1>

        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 font-semibold">✓ 認証に成功しました</p>
          </div>

          <div className="border-t pt-4">
            <h2 className="text-xl font-semibold mb-3 text-gray-700">プロフィール情報</h2>

            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-gray-600 font-medium w-32">メールアドレス:</span>
                <span className="text-gray-800">{user.email}</span>
              </div>

              <div className="flex items-center">
                <span className="text-gray-600 font-medium w-32">ユーザーID:</span>
                <span className="text-gray-800 text-sm font-mono">{user.id}</span>
              </div>

              <div className="flex items-center">
                <span className="text-gray-600 font-medium w-32">登録日時:</span>
                <span className="text-gray-800">{new Date(user.created_at || "").toLocaleDateString("ja-JP")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
