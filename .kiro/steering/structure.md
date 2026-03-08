# プロジェクト構造

## 組織方針

機能ベース（feature-first）のディレクトリ構成を採用。3つの主要画面（登録・ルーレット・図鑑）を中心に整理する。

## ディレクトリパターン

### 画面 / 機能モジュール

**場所**: `src/features/`
**目的**: 各画面・機能に関連するコンポーネント・ロジック・型を格納
**例**: `src/features/registration/`, `src/features/roulette/`, `src/features/library/`

### 共通UIコンポーネント

**場所**: `src/components/ui/`
**目的**: 機能に依存しない再利用可能なUIプリミティブ
**例**: `Button`, `Modal`, `ImageCard`

### 共通ユーティリティ

**場所**: `src/lib/` または `src/utils/`
**目的**: 横断的なヘルパー関数・定数・型定義
**例**: 日付フォーマット、画像処理ユーティリティ

### データ層

**場所**: `src/data/` または `src/store/`
**目的**: ローカルデータの永続化・状態管理
**例**: 絵本データのCRUD、IndexedDB操作

## 命名規則

- **ファイル**: kebab-case（`book-card.tsx`）
- **コンポーネント**: PascalCase（`BookCard`）
- **関数 / 変数**: camelCase（`getBookList`）
- **型 / インターフェース**: PascalCase（`Book`, `RouletteState`）

## インポート規則

```typescript
// 外部ライブラリ
import { useState } from 'react'

// 絶対パス（パスエイリアス）
import { Button } from '@/components/ui/button'

// 相対パス（同一機能内）
import { BookForm } from './book-form'
```

**パスエイリアス**:
- `@/`: `src/` にマッピング

## コード組織の原則

- 各機能モジュールは自己完結型（コンポーネント + ロジック + 型）
- 共通コンポーネントにはビジネスロジックを含めない
- 型定義は使用箇所の近くに配置（グローバル型は `src/types/`）

---
_パターンを記述し、ファイルツリーの網羅的な列挙は避ける。パターンに従う新規ファイルはsteering更新不要_
