export default function VerifyEmailPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">
          メールアドレスを確認してください
        </h1>
        <p className="text-gray-700 mb-4">
          登録いただきありがとうございます。確認メールを送信しました。
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-6">
          <li>
            メールに記載されたリンクをクリックして認証を完了してください。
          </li>
          <li>届かない場合は迷惑メールフォルダもご確認ください。</li>
          <li>
            数分待っても届かない場合は、少し時間をおいて再度お試しください。
          </li>
        </ul>
        <div className="text-center text-sm text-gray-600">
          認証が完了したら、
          <a href="/login" className="text-blue-600 hover:underline">
            ログイン
          </a>
          してください。
        </div>
      </div>
    </div>
  );
}
