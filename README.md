# Zenn Contents

https://zenn.dev/book000

- [📘 How to use](https://zenn.dev/zenn/articles/zenn-cli-guide)
- [📘 Markdown guide](https://zenn.dev/zenn/articles/markdown-guide)

## 記法メモ

Markdown の基本的な記法と合わせて、Zenn.dev独自の記法がある。大体は [Markdown guide](https://zenn.dev/zenn/articles/markdown-guide) の引用 (2021/05/24現在)

### 画像のサイズ指定

URLの後に `=数値x` (e.g. `![altテキスト](https://画像のURL =250x)`) と入れることで px 単位で指定できる

### 画像キャプション

画像記法の次行に `*` で囲んだテキストを書くことで、画像にキャプションを設定できる

```
![](https://画像のURL)
*キャプション*
```

### コードでのファイル名の表示

`言語:ファイル名` とコードブロックに指定することでコードブロックのファイル名を指定できる。

````
```js:test.js
const test = ""
```
````

### 差分シンタックスハイライト

````
```diff js:test.js
@@ -4,6 +4,5 @@
+    const foo = bar.baz([1, 2, 3]) + 1;
-    let foo = bar.baz([1, 2, 3]);
```
````

### インフォメーションメッセージ

インフォメーションアラート的なメッセージを出せる

```
:::message
メッセージ内容
:::
```

警告の場合は `:::message alert`

### アコーディオン

長いコードとか

```
:::details 最初に表示するタイトル
開いたときに表示する内容
:::
```

### コンテンツ埋め込み

#### リンク・ツイート・YouTube

URLのみ張り付ければリンクカードとなるが、アンダースコアを含む場合は以下の記法で書く必要がある。  

- リンクカード: `@[card](ターゲットURL)`
- ツイート: `@[tweet](ツイートのURL)` 
- YouTube: `@[youtube](YouTubeの動画ID)` (基本不要)

#### その他 Gist, CodePen, SlideShare

```
@[gist](GistのページURL)
@[gist](GistのページURL)
@[codepen](ページのURL)
@[slideshare](スライドのkey)
@[speakerdeck](スライドのID)
@[jsfiddle](ページのURL)
@[codesandbox](embed用のURL)
@[stackblitz](embed用のURL)
```

- Gistの場合、特定のファイルのみの場合はクエリで `file` を指定 (e.g. `?file=example.json`)
- CodePenの場合、デフォルト表示タブはクエリで `default-tab` を指定 (e.g. `?default-tab=html,css`)

