# GEMINI.md

## 目的
- Gemini CLI 向けのコンテキストと作業方針を定義する。

## 出力スタイル
- 言語: 日本語
- トーン: 簡潔で事実ベース
- 形式: Markdown

## 共通ルール
- 会話は日本語で行う。
- PR とコミットは Conventional Commits に従う。
- PR タイトルとコミット本文の言語: PR タイトルは Conventional Commits 形式（英語推奨）。PR 本文は日本語。コミットは Conventional Commits 形式（description は日本語）。
- 日本語と英数字の間には半角スペースを入れる。

## プロジェクト概要
Documentation repository for Zenn.dev that contains technical articles and books with Japanese language linting and quality checks.

### 技術スタック
- **言語**: Markdown, YAML
- **フレームワーク**: Zenn CLI
- **パッケージマネージャー**: pnpm
- **主要な依存関係**:
  - zenn-cli@0.4.0
  - textlint@15.5.1
  - textlint-rule-preset-ja-technical-writing@12.0.2
  - textlint-rule-preset-ja-spacing@2.4.3
  - @textlint-ja/*
  - markdownlint (implied)

## コーディング規約
- フォーマット: 既存設定（ESLint / Prettier / formatter）に従う。
- 命名規則: 既存のコード規約に従う。
- コメント言語: 日本語
- エラーメッセージ: 英語

### 開発コマンド
```bash
# install
pnpm install

# dev
zenn preview --host 0.0.0.0

# lint
textlint articles/ books/

# fix
textlint --fix articles/ books/

```

## 注意事項
- 認証情報やトークンはコミットしない。
- ログに機密情報を出力しない。
- 既存のプロジェクトルールがある場合はそれを優先する。

## リポジトリ固有
- **note**: Zenn.dev documentation with Japanese content
- **platform**: Zenn.dev publishing platform
**content_types:**
  - articles
  - books
- **language_focus**: Japanese
**quality_focus:**
  - Japanese grammar and spacing
  - Technical writing standards
  - Consistency and accessibility