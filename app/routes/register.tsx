import { Link } from "react-router";

export default function Register() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-4">
      <h1 className="mb-8 text-2xl font-bold">絵本を登録する</h1>
      <p className="mb-8 text-gray-500">S-02: 絵本登録画面</p>
      <Link to="/" className="rounded border px-4 py-2">
        ← 戻る
      </Link>
    </div>
  );
}
