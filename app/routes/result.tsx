import { Link } from "react-router";

export default function Result() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-4">
      <h1 className="mb-8 text-2xl font-bold">これにきまり！</h1>
      <p className="mb-8 text-gray-500">S-04: 決定画面</p>
      <div className="flex gap-4">
        <Link to="/" className="rounded border px-4 py-2">
          けってい
        </Link>
        <Link to="/" className="rounded border px-4 py-2">
          もういちど
        </Link>
      </div>
    </div>
  );
}
