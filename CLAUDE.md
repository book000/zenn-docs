# CLAUDE.md

このリポジトリで Claude Code が作業する際の方針を示します。

## プロジェクト概要

[Zenn.dev](https://zenn.dev/book000) で公開する日本語の技術記事・書籍を管理するリポジトリです。コンテンツは Markdown（Zenn 独自記法を含む）で書き、textlint で文章品質を担保します。アプリケーションコードはなく、成果物は記事・書籍そのものです。

## 開発コマンド

```bash
pnpm install            # 依存関係のインストール（npm / yarn は使わない）
pnpm run dev            # zenn preview を起動（http://localhost:8000）
pnpm run lint           # textlint で articles/ books/ を検査
pnpm run fix            # textlint で自動修正
```

**重要**: `pnpm run fix` は文末に「。」を補うなどの自動修正を行うため、修正後に文意が壊れていないか必ず目視確認してください。例えば「例」が「例。」になった場合は「以下は例。」のように文として成立する形へ直します。

## ディレクトリ構成と主要ファイル

```text
.
├── articles/            # 技術記事（Markdown、1 記事 1 ファイル）
├── books/               # 書籍コンテンツ（現在は .keep のみで空）
├── .textlintrc          # textlint 設定（presets + prh + カスタム）
├── .textlint/
│   └── smarthr-custom.yml  # prh 用の表記統一辞書
├── .markdownlint.jsonc  # markdownlint 設定（エディタ拡張用。後述）
├── .node-version        # Node.js バージョン指定
└── package.json         # scripts と devDependencies
```

## 技術スタックと固定バージョン

バージョンは `package.json` / `.node-version` を正とし、記述が古くなったら実ファイルに合わせて更新してください。

- パッケージマネージャー: `pnpm@11.10.0`（`packageManager` フィールドで固定）
- Node.js: `.node-version` で固定（Dev Container が自動採用）
- 主要ツール: zenn-cli、textlint（`.textlintrc` で `preset-ja-technical-writing` / `preset-ja-spacing` / `preset-ai-writing` / `prh`（SmartHR カスタム辞書 `.textlint/smarthr-custom.yml` を併用）ほかを有効化）

## コンテンツ規約

### 記事メタデータ（フロントマター）

```yaml
---
title: "記事タイトル"      # 日本語で内容を端的に
emoji: "📝"               # 1 文字の絵文字
type: "tech"              # tech（技術）/ idea（考え方・キャリア等）
topics: ["docker", "js"]  # 関連トピックの配列
published: true           # 原則 true
---
```

### 文章スタイル

- ですます調で統一。句読点は「、」「。」。
- 日本語と英数字の間に半角スペースを挿入。
- い抜き言葉・サ抜き・フィラー（「ええと」等）は禁止（textlint が検出）。
- 技術用語の表記統一（例: "Cloudflare"、"CloudFlare" は不可）。

### Markdown / Zenn 記法

- ファイル名は `kebab-case.md`（スペース・CamelCase・アンダースコア不可）。
- コードブロックには必ず言語を指定。HTML タグは `<br>` 以外禁止。
- Zenn 独自記法（`:::message` / `:::details` / `@[card]` / `![](URL =250x)` 等）は `README.md` と [Zenn Markdown ガイド](https://zenn.dev/zenn/articles/markdown-guide) を参照。

## テスト・CI

- 品質チェックは `pnpm run lint`（= textlint）。CI は book000/templates の再利用ワークフロー（`.github/workflows/nodejs-ci-pnpm.yml`）で実行されます。
- markdownlint は `.markdownlint.jsonc` を持ちますが、`pnpm run lint` や CI では実行されず、VS Code 拡張（`DavidAnson.vscode-markdownlint`、Dev Container 同梱）によるエディタ内チェックのみです。
- 記事の追加・編集時は、(1) `pnpm run fix` → (2) `pnpm run lint` → (3) 自動修正結果の目視確認、を必ず行ってください。

## コミット・ブランチ

- コミットメッセージ: [Conventional Commits](https://www.conventionalcommits.org/)（`<type>(<scope>): <description>`）。description は日本語で記載します。
- ブランチ: [Conventional Branch](https://conventional-branch.github.io) の短縮形（`feat`, `fix`, `docs` など）。

## リポジトリ固有ルール

- npm / yarn を誤用してロックファイル（`package-lock.json` / `yarn.lock`）が生成された場合は削除してください。
- Renovate が作成した PR には追加コミットしないでください。
- API キーや認証情報をコミットしない。ログにも出力しない（公開リポジトリです）。

## ドキュメント更新ルール

技術スタック・開発コマンド・ディレクトリ構成が変わったら、`CLAUDE.md`・`.github/copilot-instructions.md`・`README.md` を合わせて更新してください。
