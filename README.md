# Zenn Contents

https://zenn.dev/book000

- [📘 How to use](https://zenn.dev/zenn/articles/zenn-cli-guide)
- [📘 Markdown guide](https://zenn.dev/zenn/articles/markdown-guide)

## 記法メモ

Markdown の基本的な記法と合わせて、Zenn.dev 独自の記法がある。だいたいは [Markdown guide](https://zenn.dev/zenn/articles/markdown-guide) の引用（2021/05/24 現在）

### 画像のサイズ指定

URL の後に `=数値x` (e.g. `![altテキスト](https://画像のURL =250x)`) と入れることで px 単位で指定できる

### 画像キャプション

画像記法の次行に `*` で囲んだテキストを書くことで、画像にキャプションを設定できる

```text
![](https://画像のURL)
*キャプション*
```

### コードでのファイル名の表示

`言語:ファイル名` とコードブロックに指定することでコードブロックのファイル名を指定できる。

````text
```js:test.js
const test = ""
```
````

### 差分シンタックスハイライト

````text
```diff js:test.js
@@ -4,6 +4,5 @@
+    const foo = bar.baz([1, 2, 3]) + 1;
-    let foo = bar.baz([1, 2, 3]);
```
````

### インフォメーションメッセージ

インフォメーションアラート的なメッセージを出せる

```text
:::message
メッセージ内容
:::
```

警告の場合は `:::message alert`

### アコーディオン

長いコードとか

```text
:::details 最初に表示するタイトル
開いたときに表示する内容
:::
```

### コンテンツ埋め込み

#### リンク・ツイート・YouTube

URL のみ張り付ければリンクカードとなるが、アンダースコアを含む場合は以下の記法で書く必要がある。

- リンクカード: `@[card](ターゲットURL)`
- ツイート: `@[tweet](ツイートのURL)`
- YouTube: `@[youtube](YouTubeの動画ID)`（そのまま URL を貼り付けても良い）

#### Gist, CodePen, SlideShare など

```text
@[gist](GistのページURL)
@[gist](GistのページURL)
@[codepen](ページのURL)
@[slideshare](スライドのkey)
@[speakerdeck](スライドのID)
@[jsfiddle](ページのURL)
@[codesandbox](embed用のURL)
@[stackblitz](embed用のURL)
```

- Gist の場合、特定のファイルのみの場合はクエリで `file` を指定 (e.g. `?file=example.json`)
- CodePen の場合、デフォルト表示タブはクエリで `default-tab` を指定 (e.g. `?default-tab=html,css`)
