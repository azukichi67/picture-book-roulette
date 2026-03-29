import { Link } from "react-router";

export default function Roulette() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-4">
      <h1 className="mb-8 text-2xl font-bold">えほんガチャ</h1>
      <p className="mb-8 text-gray-500">S-01: ルーレット画面</p>
      <div className="flex gap-4">
        <Link to="/register" className="rounded border px-4 py-2">
          + 登録する
        </Link>
        <Link to="/collection" className="rounded border px-4 py-2">
          ずかん
        </Link>
      </div>
    </div>
  );
}
