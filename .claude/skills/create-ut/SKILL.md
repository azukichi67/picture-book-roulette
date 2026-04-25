---
name: create-ut
description: えほんガチャプロジェクトの単体テスト（Vitest）を作成するスキル。古典派テスト・振る舞い駆動・テーブルテストの方針に基づき、hooks / services / utils / components のテストを生成し、`npm test` 実行までを行う。「UTを作って」「ユニットテストを書いて」「○○のテスト追加して」「単体テスト書いて」などの自然言語、ソース編集後の追加テスト依頼、`/create-ut` 明示呼び出しで発動する。E2E（Playwright）は対象外。
---

# create-ut — 単体テスト作成スキル

## 基本思想（古典派テスト）

参考: https://zenn.dev/tko_kasai/articles/3f5863e3407891

- **振る舞いを検証する**: 入力に対する出力、または状態の変化をテストする。内部実装の手順や呼び出し回数ではなく「何をするか」を検証する。
- **リファクタリング耐性を最優先**: 内部実装が変わっても、振る舞いが同じならテストは通るべき。
- **カバレッジ100%を目指さない**: 量より質。実装詳細までテストしない。
- **重複テストを避ける**: 同じ振る舞いを複数階層で二重保証しない。集約のテストで担保した観点を依存先で再検証しない。
- **シンプルなCRUDは統合テスト寄りで**: ビジネスロジックが薄い場合は単体テスト個別追加より、統合テストで一括検証を選ぶ。複雑な条件分岐や計算がある場合のみ単体テストを厚くする。

## テスト構造（必須ルール）

**2階層 `describe` + 日本語観点 `it` で書く。**

```ts
describe("対象モジュール名", () => {       // フック/サービス/関数群の名前
  describe("対象メソッド名", () => {        // 必ずメソッド単位で括る
    it("そのメソッドでの観点を日本語で書く", () => {
      // Arrange / Act / Assert
    });
  });
});
```

### 命名規則

- **`it` の名前はビジネス上の意味で書く**。非開発者にも伝わる日本語にする。
- **メソッド名を `it` に含めない**（メソッド名は外側 `describe` で表現済み）。
- **観点を1文で言い切る**: 「○○の場合は××になる」「○○すると△△が記録される」など。

良い例:
```ts
describe("Store", () => {
  describe("purchase", () => {
    it("在庫がある場合は購入成功し在庫が減る", () => {});
    it("在庫不足の場合は購入失敗し在庫は変わらない", () => {});
    it("在庫と同数の購入で在庫が0になる", () => {});
  });
});
```

悪い例:
```ts
it("purchase メソッドが正しく動く", () => {});       // メソッド名を含めるな
it("test purchase success", () => {});                // 英語/曖昧
it("returns true", () => {});                         // 振る舞いではなく実装詳細
```

## ケース設計

各メソッドに対して以下の観点を網羅する（不要なものは省略）：

1. **正常系の代表ケース** — 期待される最も基本的な振る舞い
2. **境界値** — 0 / 空 / 同数 / 上限/下限の遷移
3. **異常系** — 不正入力、依存先のエラー、状態整合性違反
4. **状態の不変性** — 失敗時に副作用が起きないこと（例: エラー時に state が変更されない）

**1メソッドあたり3〜6ケースが目安**。それより多くなる場合は対象を分割するか、テーブルテストにまとめる。

## テーブルテスト（`it.each`）の使い分け

**境界値や同じ振る舞いの複数バリエーションは `it.each` でテーブル化する**。

```ts
describe("PriceCalculator", () => {
  describe("calculate", () => {
    it.each([
      { name: "税率10%で1000円の場合1100円になる", taxRate: 0.10, price: 1000, expected: 1100 },
      { name: "税率8%で500円の場合540円になる", taxRate: 0.08, price: 500, expected: 540 },
      { name: "価格が0の場合は0のまま", taxRate: 0.10, price: 0, expected: 0 },
    ])("$name", ({ taxRate, price, expected }) => {
      const calc = new PriceCalculator(taxRate);
      expect(calc.calculate(price)).toBe(expected);
    });
  });
});
```

**個別 `it` で書くケース**:
- 前提（Given）の組み立てがケースごとに大きく違う
- アサーションの形が違う（例: エラー文言の正規表現マッチと等価比較）
- ケース間で全く別の操作（add → delete → update など）

迷ったら、**入力と期待値だけが違う**なら `it.each`、**Given や操作シーケンスが違う**なら個別 `it`。

## AAA パターン（Arrange-Act-Assert）の明示

各テスト本体は `// Arrange` / `// Act` / `// Assert` のコメントで段階を区切る。短いケースなら省略可だが、フィクスチャ準備や複数 act がある場合は必ず書く。

- **Arrange**: テスト対象の準備（フィクスチャ作成、モック設定、初期状態の構築）
- **Act**: テスト対象の操作（メソッド呼び出し、ユーザー操作）— 1テストにつき主目的の Act は原則1つ
- **Assert**: 結果の検証（戻り値・状態・副作用）

```ts
it("addBook で localStorage と state が更新され、id / createdAt が付与される", () => {
  // Arrange
  const { result } = renderHook(() => useBooks());

  // Act
  act(() => {
    result.current.addBook("てぶくろ", "data:image/png;base64,BBBB");
  });

  // Assert
  expect(result.current.books).toHaveLength(1);
  expect(result.current.books[0].title).toBe("てぶくろ");
});
```

## モック方針

**古典派なので原則モックしない**。本物のオブジェクト・関数を使い、結果（戻り値・状態）を検証する。

モックを使ってよい例外:
- **外部I/Oの異常系を再現する場合**: localStorage の `QuotaExceededError`、fetch のネットワークエラー等は `vi.spyOn` で限定的にスタブ。
- **時刻・乱数など非決定要素**: `vi.useFakeTimers()` / `vi.spyOn(Math, "random")` 等。
- **DB / 外部 API**: 本プロジェクトには未存在だが、出てきたら境界でスタブ化。

**モックしてはいけないもの**:
- テスト対象モジュール内のヘルパー関数
- 同一プロジェクト内の純粋関数（utils, services の純粋ロジック）
- React コンポーネントが内部で使う子コンポーネント（必要ならテスト範囲を見直す）

`vi.restoreAllMocks()` を `afterEach` で呼んでクリーンアップすること。

## プロジェクト固有のお作法

### 環境
- **Vitest 4** + **@testing-library/react 16** + **jsdom**
- セットアップファイル: [app/test/setup.ts](app/test/setup.ts)
- グローバル無効（`globals: false`）→ 必ず `import { describe, it, expect, vi } from "vitest"`
- パスエイリアス `~/` が有効（`vite-tsconfig-paths`）

### ファイル配置
- テストファイルは **対象ファイルと同じディレクトリ**に `<元ファイル>.test.ts(x)` で置く
  - 例: `app/hooks/useBooks.ts` → `app/hooks/useBooks.test.ts`
  - 例: `app/utils/date.ts` → `app/utils/date.test.ts`
- ルート系コンポーネント（`app/routes/*.tsx`）も同階層に `*.test.tsx`

### コーディング規約
- **アロー関数優先**: ヘルパー・ファクトリ関数は `const fn = () => {}` で書く（`function` 宣言は使わない）
- **インポート順序**: biome に任せる（`npm run lint:fix`）
- **日本語コメント・テスト名OK**: ビジネス意味の優先のため

### よく使う import パターン

純粋関数 / サービス:
```ts
import { describe, it, expect } from "vitest";
import { todayYmd } from "./date";
```

カスタムフック:
```ts
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
```

React コンポーネント:
```ts
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
```

### React コンポーネントテストの方針
- **ユーザー視点で書く**: `getByRole` / `getByLabelText` 優先、`getByTestId` は最後の手段。
- **`userEvent` を使う**（`fireEvent` ではなく）
- ルーティング依存のコンポーネントは React Router のテストヘルパー（`createMemoryRouter` 等）でラップする
- shadcn/ui のコンポーネントを使うものは Radix の Portal を考慮（`screen` で `body` 全体を見る）

## ワークフロー（このスキルが発動したらこの順で実行する）

1. **対象ファイルを Read する**
   - 対象が指定されていなければ、ユーザーに確認する。
   - 同階層に既存 `*.test.ts(x)` がある場合は読み込んで既存ケースを把握する（重複を避けるため）。

2. **公開 API と振る舞いを洗い出す**
   - export されている関数 / フックの戻り値 / 副作用 / 状態遷移を列挙。
   - 内部関数（非 export）は直接テストしない。公開 API 経由で間接的に検証する。

3. **テストケース設計**
   - メソッドごとに「正常系 / 境界値 / 異常系 / 不変性」の観点でケース名（日本語）を先に書き出す。
   - ユーザーに見せて方針合意を取る（特に新規ファイルや観点が多い場合）。

4. **テスト実装**
   - 上記の構造ルール（2階層 describe・it.each 使い分け・Given-When-Then）に従って実装。
   - フィクスチャは `const sampleX = (overrides = {}) => ({ ...defaults, ...overrides })` のファクトリ関数で書く（既存 [app/hooks/useBooks.test.ts](app/hooks/useBooks.test.ts) 参照）。

5. **テスト実行**
   - `npm test -- <テストファイルパス>` で対象テストのみ実行。
   - 全体への影響確認が必要なら `npm test` で全体実行。

6. **失敗時の対応**
   - **テスト記述ミスを最初に疑う**（期待値の誤り、import 漏れ、async 不足）。
   - 実装側のバグが見つかった場合はユーザーに報告し、修正方針を確認する（勝手に実装を変えない）。
   - 失敗が「実装詳細に依存しすぎ」なら、テストの抽象度を上げて書き直す。

7. **lint**
   - `npm run lint:fix` を実行してフォーマット統一。

8. **完了報告**
   - 何をテストしたか、何を意図的に省いたか、未カバーの観点を簡潔に報告。
   - カバレッジ数値を強調しない。

## 既存コードのリファレンス

良いお手本として参照する：
- [app/hooks/useBooks.test.ts](app/hooks/useBooks.test.ts) — フックのテスト、ファクトリ関数、エラー系の `vi.spyOn`、不変性検証
- [app/hooks/useFirstLaunch.test.ts](app/hooks/useFirstLaunch.test.ts) — シンプルなフック、再マウント時の永続性検証

## やってはいけないこと

- ❌ `it("○○メソッドが動く")` のような曖昧/実装依存の名前
- ❌ メソッド名を `describe` で括らずフラットに `it` を並べる
- ❌ 内部関数の呼び出し回数 / 引数を `toHaveBeenCalledWith` で検証する（古典派的に NG）
- ❌ カバレッジ目標のために意味のないテストを足す
- ❌ 日付や乱数を fake せずに「たまたま今日通る」テストを書く
- ❌ 1つの `it` に複数の振る舞いを詰め込む（観点が複数なら分ける）
- ❌ `function` 宣言でヘルパーを書く（アロー関数で）
