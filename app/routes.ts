import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
  index("routes/roulette.tsx"), // S-01: ルーレット画面（ホーム）
  route("register", "routes/register.tsx"), // S-02: 絵本登録画面
  route("collection", "routes/collection.tsx"), // S-03: 図鑑画面
  route("result", "routes/result.tsx"), // S-04: 決定画面
] satisfies RouteConfig;
