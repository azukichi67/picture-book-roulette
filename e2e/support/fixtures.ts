import { test as base } from "@playwright/test";

// Vitest 側 (app/test/setup.ts) と意図を揃え、各テストで localStorage をクリアする。
// addInitScript を使い page.goto 前に必ず実行させ state 汚染を防ぐ。
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });
    await use(page);
  },
});

export { expect } from "@playwright/test";
