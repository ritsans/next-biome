import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function LogoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.auth.signOut();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">ログアウトしました</h1>

        <p className="text-gray-600 mb-8">
          ログアウトが完了しました。
          <br />
          ご利用ありがとうございました。
        </p>

        <Link
          href="/"
          className="inline-block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          サイトトップへ戻る
        </Link>
      </div>
    </div>
  );
}
