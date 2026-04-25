---
name: create-e2e
description: えほんガチャプロジェクトの E2E テスト（Playwright）を作成するスキル。ユーザーストーリーベースで重要フローを検証し、アクセシビリティロケータ優先・1テスト1シナリオ・各テスト独立の方針で `e2e/*.spec.ts` を生成し、`npm run test:e2e` 実行までを行う。「E2Eテスト書いて」「シナリオテスト追加して」「○○のフローをE2Eで検証して」「Playwrightテスト追加して」などの自然言語、機能実装後の追加シナリオ依頼、`/create-e2e` 明示呼び出しで発動する。単体テスト（Vitest）は対象外。
---

# create-e2e — E2E テスト作成スキル

## 基本思想（ユーザーストーリー駆動）

参考:
- https://zenn.dev/shunsuke_stack/articles/e2e-testing-fundamentals
- https://zenn.dev/yuu104/articles/what-is-e2e-test

- **ユーザーストーリーを検証する**: 「親子が絵本を登録してルーレットを回す」のように、ユーザーが達成したい目的単位でテストを書く。個別のボタン挙動やバリデーション分岐は対象外（それは Vitest で）。
- **テストピラミッドの頂点**: 重要フローに絞る。網羅は単体テスト・統合テストに任せる。
- **「生きたドキュメント」**: テスト名・ステップを読めば「このアプリで何ができるか」が伝わるように書く。
- **壊れにくさを最優先**: 内部実装・スタイル変更で落ちないテストにする。リファクタリング耐性 > カバレッジ。
- **1 spec = 1 シナリオ**: 失敗時の原因特定を容易にする。複数シナリオを 1 ファイルに混在させない。

## テスト構造（必須ルール）

**`test()` で 1 シナリオ、複雑なら `test.step()` で段階を区切る。**

```ts
import { expect, test } from "./support/fixtures";

test("親が絵本を登録するとコレクションに表示される", async ({ page }) => {
  await test.step("ホームから登録画面へ遷移する", async () => {
    await page.goto("/");
    await page.getByRole("link", { name: "絵本を登録" }).click();
  });

  await test.step("タイトルと表紙画像を入力して登録する", async () => {
    await page.getByLabel("絵本のタイトル").fill("てぶくろ");
    await page.getByLabel("表紙画像").setInputFiles("e2e/fixtures/cover.png");
    await page.getByRole("button", { name: "登録する" }).click();
  });

  await test.step("コレクション画面に追加した絵本が表示される", async () => {
    await expect(page.getByRole("heading", { name: "コレクション" })).toBeVisible();
    await expect(page.getByText("てぶくろ")).toBeVisible();
  });
});
```

### テスト名の命名規則

- **ユーザー視点・ビジネス意味で書く**。非開発者にも伝わる日本語にする。
- 主語（誰が）+ 動作 + 結果 が分かる文にする。
  - 良い: `"親が絵本を登録するとコレクションに表示される"`
  - 良い: `"絵本が3冊以上ある状態でルーレットを回すと結果画面に遷移する"`
  - 悪い: `"登録テスト"` / `"register flow"` / `"button works"`
- メソッド名・URL・セレクタ名をテスト名に含めない。

## ロケータ戦略（壊れにくさの肝）

**優先順位（上から順に検討）**:

1. `getByRole(role, { name })` — アクセシビリティ属性ベース。第一選択。
2. `getByLabel(text)` — フォーム入力で最強。
3. `getByPlaceholder(text)` — ラベルがない場合のみ。
4. `getByText(text)` — 表示テキストの確認用途。クリック対象のロケートには避ける。
5. `getByTestId("...")` — **最後の手段**。上記で書けない場合のみ。`data-testid` を新規付与する場合はユーザーに確認する。

**禁止**:
- ❌ CSS セレクタ・クラス名依存（`.btn-primary`、`#submit` 等）
- ❌ DOM 階層依存（`nth-child`、`>` セレクタ）
- ❌ XPath
- ❌ コンポーネントの内部構造に依存する複雑なロケータ

## 待機戦略（不安定さ撲滅）

- **`page.waitForTimeout(ms)` 禁止**。固定 sleep は flaky の温床。
- Playwright の **auto-wait** を信頼する（`click` / `fill` / `expect(locator).toBeVisible()` は要素出現を自動で待つ）。
- 非同期描画は **`expect(...).toBeVisible()` / `toHaveText()` / `toHaveURL()`** で待つ。
- ナビゲーションは `page.waitForURL("/result")` などで明示的に待つ。
- アニメーション完了が必要な場合は `expect(locator).toHaveCSS("opacity", "1")` 等で状態を待つ。

## テスト独立性（必須）

- **state は持ち越さない**。各 `test` は単独で実行できること。
- localStorage は [`e2e/support/fixtures.ts`](e2e/support/fixtures.ts) の `addInitScript` で `page.goto` 前にクリア済み。**新規 spec も必ずこの `test` を import すること**（素の `@playwright/test` から import しない）。
- テスト間で順序依存させない（並列実行されるため）。

```ts
// ✅ 必ずこちらを使う
import { expect, test } from "./support/fixtures";

// ❌ これは使わない
import { expect, test } from "@playwright/test";
```

## データ準備

- **テストデータは spec 内で完結させる**。共有フィクスチャに状態を持たせない。
- 画像など外部ファイルが必要な場合は `e2e/fixtures/` 配下に置き、`setInputFiles` で読み込む。
- 「絵本が登録済みの状態」を作るには **UI から登録するシナリオを書く** か、`page.evaluate` で localStorage に直接書き込むヘルパーを使う（後者は事前条件のセットアップ用途のみ。検証フローでは UI 操作で）。

## プロジェクト固有のお作法

### 環境
- **Playwright** + **mobile-chrome プロジェクトのみ**（iPhone SE 375x667 / `isMobile: true` / `hasTouch: true`）
- 設定: [playwright.config.ts](playwright.config.ts)
- `webServer` で `npm run dev` が自動起動するため、手動で dev サーバーを立ち上げる必要はない。
- baseURL は `http://localhost:5173`。`page.goto("/")` のように **相対パス**で書く。

### ファイル配置
- 全 spec は **`e2e/` 直下**に `<シナリオ>.spec.ts` で置く。
  - 例: `e2e/register-book.spec.ts`、`e2e/spin-roulette.spec.ts`
- ルートごとではなく **ユーザーストーリーごと**に分ける。
- 共通ヘルパーは [`e2e/support/`](e2e/support/) に追加する。

### コーディング規約
- **アロー関数優先**（`async ({ page }) => { ... }`）
- **インポート順序**: biome に任せる（`npm run lint:fix`）
- **日本語テスト名・コメント OK**

### モバイル UI ならではの注意
- `click` でも動くが、タッチ前提なら `tap()` を使うとより実機に近い。
- スクロールが必要な要素は `locator.scrollIntoViewIfNeeded()` を挟む。
- shadcn/ui の Dialog 等は Portal で `body` 直下に描画される。`page.getByRole(...)` は document 全体を探すため通常は問題ないが、複数開いている場合はスコープを絞る。

## ワークフロー（このスキルが発動したらこの順で実行する）

1. **対象シナリオを特定する**
   - ユーザーが「○○のフローをE2Eで」と指定していなければ、検証したいユーザーストーリーをユーザーに確認する。
   - 既存 spec（[e2e/](e2e/) 配下）を読み、重複や近接シナリオの有無を確認する。

2. **シナリオを言語化する**
   - 「誰が」「何をして」「何を達成するか」を 1 文で書く（= テスト名の原型）。
   - 操作手順を `test.step()` 単位で箇条書きにする。
   - **ユーザーに見せて方針合意を取る**（特に新規シナリオ）。

3. **ロケータ設計**
   - 各操作対象を `getByRole` / `getByLabel` で書けるか確認する。
   - 書けない場合、対象コンポーネントを Read して `aria-label` / 適切な `role` の付与で解決できないか検討する（実装側の改善が壊れにくいテストに繋がる）。
   - `data-testid` を新規付与する場合はユーザーに確認する。

4. **spec 実装**
   - [`e2e/support/fixtures.ts`](e2e/support/fixtures.ts) の `test` を import。
   - 上記の構造ルール（`test.step` / auto-wait / 相対パス / アクセシビリティロケータ）に従って実装。
   - フィクスチャファイルが必要なら `e2e/fixtures/` に追加。

5. **テスト実行**
   - 該当 spec のみ実行: `npm run test:e2e -- e2e/<filename>.spec.ts`
   - 全体実行: `npm run test:e2e`
   - 失敗時は `npx playwright show-report` で trace を確認する（`trace: "retain-on-failure"` で自動収集される）。

6. **失敗時の対応**
   - **テスト記述ミスを最初に疑う**（ロケータ誤り、await 漏れ、URL 誤り）。
   - flaky に見える場合は **固定 sleep を足さない**。代わりに `expect().toBeVisible()` 等の auto-wait で待つ条件を見直す。
   - 実装側のバグが見つかった場合はユーザーに報告し、修正方針を確認する（勝手に実装を変えない）。
   - ロケータが取れない場合は実装側の `aria-*` 改善を提案する。

7. **lint**
   - `npm run lint:fix` を実行してフォーマット統一。

8. **完了報告**
   - 何のユーザーストーリーをカバーしたか、何を意図的に省いたか（= Vitest 側で見るべき範囲）を簡潔に報告。
   - 実装側に改善提案がある場合（aria 不足など）も併せて伝える。

## 既存コードのリファレンス

良いお手本として参照する：
- [e2e/home.spec.ts](e2e/home.spec.ts) — シンプルな表示確認、`getByRole` の使用、fixtures 経由の import
- [e2e/support/fixtures.ts](e2e/support/fixtures.ts) — localStorage クリアの仕組み

## やってはいけないこと

- ❌ `page.waitForTimeout(1000)` のような固定 sleep
- ❌ CSS セレクタ・クラス名・nth-child でのロケート
- ❌ `@playwright/test` から直接 `test` を import（fixtures 経由必須）
- ❌ 1 つの `test` に複数のユーザーストーリーを詰め込む
- ❌ テスト間で localStorage や順序に依存する書き方
- ❌ バリデーションメッセージや細かい分岐を E2E で網羅する（→ Vitest で）
- ❌ `getByTestId` を最初から使う（`getByRole` / `getByLabel` を先に検討）
- ❌ 絶対 URL（`http://localhost:5173/...`）でアクセスする（相対パスで書く）
- ❌ テスト名にメソッド名・URL・セレクタを書く（ユーザー視点の日本語で）
