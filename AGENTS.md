# AI エージェント共通作業方針

## 目的

このドキュメントは、一般的な AI エージェントがこのリポジトリで作業する際の共通の作業方針を定義します。

## 基本方針

### 言語ルール

- **会話言語**: 日本語
- **コード内コメント**: 日本語
- **エラーメッセージ**: 英語
- **日本語と英数字の間**: 半角スペースを挿入

### コミット規約

- **コミットメッセージ**: [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) に従う
  - 形式: `<type>(<scope>): <description>`
  - `<description>` は英語で記載
  - 例: `docs(articles): add article about Docker setup`

## 判断記録のルール

すべての判断について、以下を記録してください：

1. **判断内容**: 何を決定したか
2. **代替案**: どのような選択肢があったか
3. **採用理由**: なぜこの案を選んだか
4. **前提条件**: 判断の前提となる事実
5. **不確実性**: 不明な点や仮定

**重要**: 前提・仮定・不確実性を明示し、仮定を事実のように扱わないでください。

## プロジェクト概要

このリポジトリは、[Zenn.dev](https://zenn.dev/book000) で公開する技術記事・書籍を管理するためのリポジトリです。

- **目的**: 日本語の技術記事・書籍の執筆・管理
- **プラットフォーム**: Zenn.dev
- **主な機能**: Markdown 形式での記事作成、textlint による品質管理、プレビューサーバーでの確認

## 技術スタック

- **言語**: Markdown（日本語）、Node.js
- **パッケージマネージャー**: pnpm v10.28.1
- **Node.js バージョン**: v24.13.0
- **主要ツール**: zenn-cli v0.4.0、textlint v15.5.1

## 開発手順（概要）

### 1. プロジェクト理解

リポジトリの構造と目的を理解してください：

- `/articles/` ディレクトリに技術記事が格納されています
- `/books/` ディレクトリに書籍コンテンツが格納されています（現在は空）
- `.textlintrc` に日本語文章の品質ルールが定義されています

### 2. 依存関係インストール

```bash
pnpm install
```

**重要**: npm や yarn は使用しないでください。必ず pnpm を使用してください。

### 3. 変更実装

記事を作成・編集する際は、以下のフォーマットに従ってください：

#### ファイル命名規則

- ファイル名: `kebab-case.md`
- 例: `docker-setup-guide.md`

#### 記事メタデータ

```yaml
---
title: "記事タイトル"
emoji: "📝"
type: "tech"           # tech / idea
topics: ["javascript", "docker"]
published: true
---
```

#### 文章スタイル

- ですます調で統一
- 句読点は「、」「。」を使用
- 日本語と英数字の間には半角スペースを挿入

### 4. テストと Lint/Format 実行

```bash
# 自動修正
pnpm run fix

# 品質チェック
pnpm run lint
```

**重要**: `pnpm run fix` で自動修正された後、文章が正しい意味を保っているか手動で確認してください。

## セキュリティ / 機密情報

### 認証情報のコミット禁止

- API キーや認証情報は Git にコミットしない
- `.env.local` などの環境変数ファイルで管理する

### ログへの機密情報出力禁止

- ログに個人情報や認証情報を出力しない
- デバッグ情報も公開リポジトリでは慎重に扱う

## Zenn 独自 Markdown 記法

以下の Zenn 独自記法を使用できます：

### 画像

```markdown
![alt text](URL =250x)  # サイズ指定
![](URL)
*キャプション*           # キャプション
```

### コードブロック

```markdown
```js:filename.js      # ファイル名表示
const code = "example";
```

```diff js:file.js     # 差分表示
+ 追加行
- 削除行
```
```

### メッセージボックス

```markdown
:::message
通常のメッセージ
:::

:::message alert
警告メッセージ
:::
```

### アコーディオン

```markdown
:::details タイトル
折りたたみ内容
:::
```

### 外部コンテンツ埋め込み

```markdown
@[card](URL)           # リンクカード
@[tweet](URL)          # ツイート
@[youtube](ID)         # YouTube
@[gist](URL)           # Gist
```

## リポジトリ固有

### パッケージマネージャー

- **必須**: pnpm v10.28.1（`package.json` の `packageManager` フィールドで指定）
- npm や yarn を使用した場合、生成されたロックファイル（`package-lock.json`、`yarn.lock`）を削除してください

### Node.js バージョン

- **必須**: v24.13.0（`.node-version` で指定）

### テキスト処理ワークフロー

1. Markdown ファイルを編集
2. `pnpm run fix` で自動修正可能な問題を修正
3. `pnpm run lint` で品質確認
4. **手動レビュー**: 自動修正で文章の意味が変わっていないか確認

### textlint ルール

170 以上の textlint ルールが設定されています：

- い抜き言葉チェック
- フィラー禁止（ええと、あの、など）
- サ抜き・サ入れ検査
- 専門用語の表記統一（例: "Cloudflare" not "CloudFlare"）
- 日本語と英数字の間にスペース

### markdownlint ルール

120 以上の markdownlint ルールが設定されています：

- 見出しレベルの段階的インクリメント
- リストのインデント統一（2 スペース）
- コードブロックの言語指定必須
- 行末の不要なスペース除去

### Renovate

このリポジトリでは Renovate bot が依存関係を自動更新します。Renovate が作成したプルリクエストには追加のコミットを行わないでください。

## 参考リンク

- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
- [Zenn CLI ガイド](https://zenn.dev/zenn/articles/zenn-cli-guide)
- [Zenn Markdown ガイド](https://zenn.dev/zenn/articles/markdown-guide)
- [textlint](https://textlint.github.io/)
