import { createClient } from "@/utils/supabase/server";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="bg-blue-600 text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            <a href="/">Next.js + Biome</a>
          </h1>
          <nav>
            <ul className="flex gap-6">
              <li>
                <a href="/" className="hover:underline">
                  ホーム
                </a>
              </li>
              {user ? (
                <>
                  <li>
                    <a href="/mypage" className="hover:underline">
                      マイページ
                    </a>
                  </li>
                  <li>
                    <a href="/logout" className="hover:underline">
                      ログアウト
                    </a>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <a href="/login" className="hover:underline">
                      ログイン
                    </a>
                  </li>
                  <li>
                    <a href="/signup" className="hover:underline">
                      新規登録
                    </a>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
