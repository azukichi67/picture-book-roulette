# モック段階別 実装指針

## 段階1: ワイヤーフレーム

**目的:** レイアウトと情報構造の方向性確認

### CSSスタイル方針
- 背景: `#fff`（白）
- 要素の枠線: `1px solid #000` または `2px solid #333`
- テキスト色: `#000`
- ボタン: 枠線のみ（`border: 2px solid #000; background: transparent`）
- 画像プレースホルダー: グレーの四角 + 対角線（`background: #ddd`）
- フォント: システムデフォルト（serif/sans-serif 問わず）
- 装飾なし（影・グラデーション・角丸なし）

### HTML構造方針
- セマンティックなタグを使う（`header`, `main`, `nav`, `section`）
- 各画面は `<section class="screen">` で区切る
- 画面タイトルを `<h2>` で明記する
- 画面間の遷移矢印を `→` などのテキストで表現する

### サンプルCSS
```css
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: sans-serif; color: #000; }
.screen { border: 2px solid #000; margin: 32px auto; padding: 16px; max-width: 375px; }
.screen-title { font-size: 12px; color: #666; border-bottom: 1px solid #ccc; margin-bottom: 12px; padding-bottom: 4px; }
.btn { border: 2px solid #000; background: transparent; padding: 8px 16px; cursor: pointer; }
.img-placeholder { background: #ddd; display: flex; align-items: center; justify-content: center; }
.flow-arrow { text-align: center; font-size: 24px; margin: 8px 0; }
```

---

## 段階2: ローファイモック

**目的:** 要件定義での合意形成。レイアウトと機能の確認

### CSSスタイル方針
- 背景: `#f5f5f5`（薄いグレー）
- カード/パネル: `#fff` + `box-shadow: 0 1px 4px rgba(0,0,0,0.1)`
- ボタン: `background: #999` または `#666`（グレー系）
- アクセントカラー: `#555`（濃いグレー）
- 角丸: `border-radius: 4px` 程度（控えめ）
- テキストは実際のコンテンツに近いもの
- アイコンはシンプルなテキスト絵文字またはFont Awesome（CDN）

### HTML構造方針
- 段階1と同様のセクション分け
- ナビゲーションバー・フッターを実装する
- フォーム要素はラベル付きで実装する
- 状態バリエーション（正常・エラー・空）を別セクションで示す

### サンプルCSS
```css
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: sans-serif; background: #f5f5f5; color: #333; }
.screen { background: #fff; border-radius: 4px; margin: 24px auto; max-width: 375px; box-shadow: 0 1px 4px rgba(0,0,0,0.1); overflow: hidden; }
.screen-label { background: #eee; padding: 4px 8px; font-size: 11px; color: #888; }
.btn-primary { background: #555; color: #fff; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
.btn-secondary { background: #fff; color: #555; border: 1px solid #999; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
.empty-state { text-align: center; padding: 40px 16px; color: #aaa; }
.error-msg { background: #fee; color: #c33; padding: 8px 12px; border-radius: 4px; font-size: 13px; }
```

---

## 段階3: ハイファイモック

**目的:** 最終確認・デザイン承認。実際に近い見た目

### CSSスタイル方針
- アプリのブランドカラーを使用する（要件定義書・コンセプトから取得）
- タイポグラフィ: Google Fonts を使用可（CDN経由）
- 実際の画像がなければ `https://picsum.photos/` などのプレースホルダー画像を使用
- アニメーション: `transition` を使った hover/focus 効果
- モバイルアプリなら `max-width: 390px` でスマートフォン枠を表示
- グラデーション・影・角丸を積極的に使う

### HTML構造方針
- 段階2と同様のセクション分け + 状態バリエーション
- 実際のアプリに近いコンポーネント（モーダル、トースト通知など）を含める
- タッチ操作を想定した要素サイズ（最小タップエリア 44px）
- アクセシビリティ属性（`aria-label`, `role`）を付与する

### サンプルCSS（モバイルアプリ向け）
```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Noto Sans JP', sans-serif; background: #f0f4f8; }
.device-frame { border: 8px solid #222; border-radius: 40px; margin: 24px auto; max-width: 390px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
.screen { background: #fff; min-height: 844px; }
.btn-primary { background: linear-gradient(135deg, #FF6B6B, #FF8E53); color: #fff; border: none; padding: 14px 24px; border-radius: 24px; font-size: 16px; font-weight: 700; cursor: pointer; transition: opacity 0.2s; }
.btn-primary:hover { opacity: 0.85; }
```

---

## 共通: 画面構成テンプレート

どの段階でも、HTMLファイルの構成は以下の順序で作成する:

```
1. ページタイトル（h1）+ 作成日・段階の記載
2. 画面フロー図（テキストベースの矢印図）
3. 各画面（正常系）
4. 状態バリエーション（エラー・空状態・ローディング）
5. 備考・未確定事項のメモ
```

### 状態バリエーションの必須パターン

| パターン | 例 |
|---------|-----|
| データ0件 | 「まだ絵本が登録されていません」 |
| エラー | 「読み込みに失敗しました。もう一度お試しください」 |
| 入力バリデーション | 「タイトルを入力してください」 |
| ローディング | スピナーまたはスケルトン表示 |
| 処理成功 | トースト通知またはサクセス画面 |

### リアルなダミーデータの例（えほんガチャ向け）

```
絵本タイトル: 「ねないこだれだ」「おおきなかぶ」「はらぺこあおむし」
著者: せなけいこ、内田麟太郎
読み時間: 5分、10分
おすすめ年齢: 3歳〜5歳
```
