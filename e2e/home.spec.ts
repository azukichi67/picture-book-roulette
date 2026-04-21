import { expect, test } from "./support/fixtures";

test("トップページ（ルーレット画面）にアクセスできる", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "えほんガチャ" }),
  ).toBeVisible();
});
