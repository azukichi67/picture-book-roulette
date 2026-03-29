import { Link } from "react-router";

export default function Collection() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-4">
      <h1 className="mb-8 text-2xl font-bold">図鑑</h1>
      <p className="mb-8 text-gray-500">S-03: 図鑑画面</p>
      <div className="flex gap-4">
        <Link to="/" className="rounded border px-4 py-2">
          ← 戻る
        </Link>
        <Link to="/register" className="rounded border px-4 py-2">
          + 登録する
        </Link>
      </div>
    </div>
  );
}
