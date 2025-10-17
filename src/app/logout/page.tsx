import { signOut } from "@/actions/auth";

export default function LogoutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">ログアウト</h1>

        <p className="text-gray-600 mb-6">ログアウトしますか?</p>

        <form action={signOut}>
          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
          >
            ログアウトする
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          <a href="/mypage" className="text-blue-600 hover:underline">
            マイページに戻る
          </a>
        </p>
      </div>
    </div>
  );
}
