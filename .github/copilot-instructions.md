# GitHub Copilot Instructions

このリポジトリは [Zenn.dev](https://zenn.dev/book000) で公開する技術記事・書籍を管理するためのリポジトリです。

## プロジェクト概要

- 目的は日本語の技術記事・書籍の執筆・管理
- プラットフォームは Zenn.dev
- 主要言語は日本語。ただし例外あり
- フォーマットは Markdown（Zenn 独自記法を含む）
- パッケージマネージャーは pnpm。Node.js も必要。コマンドがない場合はインストールすること

## ディレクトリ構造

```text
.
├── articles/           # 技術記事（Markdownファイル）
├── books/             # 書籍コンテンツ
├── .textlint/         # textlintカスタムルール
├── .textlintrc        # textlint設定
└── .markdownlint.jsonc # markdownlint設定
```

## 開発ガイドライン

### コミュニケーション言語

- 記事内容は日本語
- PR 説明文・レビューコメント・Issue 対応は日本語
- PR タイトルは英語
- コミットメッセージは英語（Conventional Commits 準拠）

### Conventional Commits

コミットメッセージと PR タイトルは以下の形式に従う。

```text
<type>(<scope>): <description>

feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
style: コードスタイル修正
refactor: リファクタリング
test: テスト追加・修正
chore: その他のメンテナンス
```

例。

- `feat(articles): add new article about Docker setup`
- `fix(textlint): update custom rules for better Japanese detection`
- `docs: update README with latest Zenn markdown syntax`

## コンテンツ作成ガイドライン

### Zenn記法

基本的な Markdown に加えて、以下の Zenn 独自記法を使用できます。

#### 画像

```markdown
![alt text](URL =250x)  # サイズ指定
![](URL)
*キャプション*           # キャプション
```

#### コードブロック

```markdown
```js:filename.js      # ファイル名表示
const code = "example";
```

```diff js:file.js     # 差分表示
+ 追加行
- 削除行

#### メッセージボックス

```markdown
:::message
通常のメッセージ
:::

:::message alert
警告メッセージ
:::
```

#### アコーディオン

```markdown
:::details タイトル
折りたたみ内容
:::
```

#### 外部コンテンツ埋め込み

```markdown
@[card](URL)           # リンクカード
@[tweet](URL)          # ツイート
@[youtube](ID)         # YouTube
@[gist](URL)           # Gist
```

### 文章品質基準

textlint による自動チェックが設定済み。以下の観点で品質を維持。

- 日本語文法はい抜き言葉・サ抜き表現・敬語の誤用をチェック
- 技術文書品質は 7 つの C 原則に準拠
- 表記統一は漢字・ひらがな・全角・半角・句読点を統一
- 専門用語は IT 用語の正確な表記を徹底（例：Cloudflare）

## 利用可能なコマンド

npm や npx は使用しないこと。

```bash
# 依存関係インストール
pnpm install

# プレビューサーバー起動
pnpm run dev           # http://localhost:8000

# 文章校正
pnpm run lint          # textlint実行
pnpm run fix           # 自動修正可能な問題を修正
```

## ファイル命名規則

### 記事ファイル（articles/）

- ファイル名: `kebab-case.md`
- 例: `docker-setup-guide.md`, `javascript-async-await.md`

### 記事メタデータ

各記事の先頭に以下のメタデータを記載。

```yaml
---
title: "記事タイトル"
emoji: "📝"
type: "tech"           # tech / idea
topics: ["javascript", "docker"]
published: true        # true / false
---
```

- title は日本語で、記事の内容をわかりやすく端的に説明する
- emoji は記事の内容に則し、1 文字の絵文字で表現する
- type は、Zenn.dev のルールに基づき、プログラミングやソフトフェア、ハードウェア、インフラなどの技術に関する具体的な内容が主となる記事は tech を選ぶ。キャリアやマネジメントなど技術に直接関係しないトピックや、技術に関する抽象的な考え方・情報のまとめ記事は idea を選ぶ
- topics は、記事の内容に則し、関連するトピックを配列形式で記載する
- published は、原則 true とする

## コード品質基準

### Markdownフォーマット

- 見出しレベルの段階的インクリメント
- リストのインデント統一（2 スペース）
- コードブロックの言語指定必須
- 行末の不要なスペース除去

### 日本語文章

- ですます調で統一
- 句読点は「、」「。」を使用
- 全角文字と半角文字の間にスペース
- 専門用語の表記統一

## レビュープロセス

1. **PR作成**: 英語タイトル、日本語説明文
2. **自動チェック**: GitHub Actions（textlint）
3. **レビュー**: 日本語でのコミュニケーション
4. **修正対応**: 日本語での議論・説明

Markdown ファイルの編集後は、必ず、コミットしたあとで、pnpm fix + pnpm lint + 手動修正によって textlint や markdownlint のルールに則した記述内容とすること。自動チェックは最後の砦とする。

なお、pnpm fix によって自動修正されたことにより、文章として不成立な状態・意味不明な文章になっていないかはよく確認すること。
特に、"。" が禁止されていることによって、"。" に置き換わるが、これによって違和感のある文章となっていないかは確認する。
例えば「例。」が「例。」になることがあるが、これは「以下は例。」と文章として成立させること。

## トラブルシューティング

### よくある問題

1. **textlintエラー**:
   - 専門用語の表記確認
   - `.textlintrc` の `allowlist` に追加検討

2. **Zenn記法エラー**:
   - 公式ドキュメント確認: https://zenn.dev/zenn/articles/markdown-guide

3. **プレビューエラー**:
   - メタデータの記載確認
   - ファイル名の形式確認

### 設定ファイル

重要な設定ファイルを変更する際は影響範囲を慎重に検討。

- `.textlintrc`: 日本語文章の校正ルール
- `.markdownlint.jsonc`: Markdown 構文ルール
- `package.json`: 依存関係とスクリプト

誤って npm など別のパッケージマネージャーを使用したことにより、ロックファイルが生成された場合は削除すること。

## 参考リンク

- [Zenn CLIガイド](https://zenn.dev/zenn/articles/zenn-cli-guide)
- [Zenn Markdownガイド](https://zenn.dev/zenn/articles/markdown-guide)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [textlint](https://textlint.github.io/)
