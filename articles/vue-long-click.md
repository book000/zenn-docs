---
title: Vue.jsでライブラリを使わずに長押し機能を作る
emoji: 🫵
type: tech
topics: ["vue"]
published: true
---

スマホ・タブレットでよくありがちな「長押しで何かの動作をさせる」機能を Vue.js でライブラリを使わずに作ってみます。

ライブラリを使う場合は以下のスクラップに適当にまとめているので参考にできるかと。

https://zenn.dev/book000/scraps/21294f2f758cc5

---

## 環境

- Firefox XXXXX
- Chrome XXXXX
- Chrome for Android XXXXX
- Safari 15.6
- Vue.js 2.7.10
- Nuxt.js 2.15.8

長押し機能を導入したかったプロジェクトで Nuxt を使っていたので便宜上環境一覧に入れていますが、Nuxt を利用していない環境でも利用可能です。

## コード

コンポーネントとして利用できます。

```vue:VLongPress.vue
<template>
  <div
    class="long-press-wrapper"
    @pointerdown="startPress"
    @pointerup="endPress"
    @pointermove="endPress"
    @pointercancel="endPress"
    @click="endPress"
    @contextmenu.prevent
  >
      <slot />
    </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  // propsで関数とミリ秒delayを受け取る
  data(): {
    pressTimer: NodeJS.Timeout | null
  } {
    return {
      pressTimer: null,
    }
  },
  methods: {
    startPress(): void {
      this.pressTimer = setTimeout(() => {
        // 処理
      }, 500) // delay prop
    },
    endPress(): void {
      if (!this.pressTimer) return
      clearTimeout(this.pressTimer)
      this.pressTimer = null
    },
  },
})
</script>

<style scoped>
.long-press-wrapper {
  user-select: none;
}
</style>
```

```vue:index.vue
<template>
  <VLongPress :func="onLongPress" :delay="1000" />
</template>

<script lang="ts">
  ...
</script>
```

## 注意するべき点

この機能を実装する時に注意すべき事項として、「スマホ・タブレットのOS機能としての長押し機能」と「スマホ・タブレットでのスクロール」があります。

### スマホ・タブレットのOS機能としての長押し機能

iOS や Android といったスマートフォン・タブレットの主要OSでは、OSとして「長押し」に対して機能を設けています。マウスとキーボードで操作するパソコンとは異なり、左クリックの概念がないからですね。

iOS, Android 共に、文字列を長押しすると画像のようなポップアップが表示され、文字列をコピーしたり検索することができます。

<!-- 画像を追加 -->

Web ページとして長押しで何かをするといった機能を提供する場合、OSの長押し機能を無効化しないと Web ページ側の長押し機能が動かないか、Webページ・OS両方の長押し機能が動いてしまうおそれがあります。

したがって、Webページ側でOSの長押し機能を無効化します。

iOS では、CSS で以下のように [`user-select`](https://developer.mozilla.org/ja/docs/Web/CSS/user-select) を `none` にすることで機能を無効化できます。

```css
.target {
  user-select: none;
}
```

記事によっては [`-webkit-touch-callout`](https://developer.mozilla.org/ja/docs/Web/CSS/-webkit-touch-callout) も `none` にする必要があるという記事があるのですが、手元の環境（iPadOS 15.7）では `user-select` のみで足りているのでとりあえず適用していません。

Android では `contextmenu` の prevent でこの機能を無効化できます。

### スマホ・タブレットでのスクロール

安直に実装しようとすると、「クリック・タップされたあと、数ミリ秒後にまだタップし続けてたら長押しってことでいいや！」と考えます。  
対象要素が「スクロールする時に間違いなくタップしない」要素なら良いのですが、そうでない場合スクロールのたびに長押し機能が動作し、滅茶苦茶にイライラすることになります。（一敗）

スマホ・タブレットでは、スクロールする際に Web ページ上の任意の箇所をタップしてから指を上または下に動かします。  
「タップした時」と「タップをやめた時」のイベントだけを使うと、「スクロールを始める時」にタップをし、「スクロールをやめた時」にタップをやめるので、長押しと同じ状態が起きます。  
なので、「タッチして指を移動した」場合に長押しと判断しないよう、`pointermove` イベントを受け取る必要があります。

### その他

この記事では、昔からある `mousedown` などの [MouseEvent](https://developer.mozilla.org/ja/docs/Web/API/MouseEvent) や `touchstart` などの [TouchEvent](https://developer.mozilla.org/ja/docs/Web/API/TouchEvent) を使わずに `pointerdown` など [PointerEvent](https://developer.mozilla.org/ja/docs/Web/API/PointerEvent) を利用しています。  
PointerEvent を利用する理由として、純粋な記述量が少なくなるだけでなく、TouchEvent と MouseEvent は[両方同時発生しうる](https://developer.mozilla.org/ja/docs/Web/API/TouchEvent#addeventlistener_および_preventdefault_の使用)ためです。

2019年初期ごろまでは [Safari が PointerEvent をサポートしていなかった](https://caniuse.com/mdn-api_pointerevent) ので使うべきではなかったのですが、少なくとも 2022 年現在は主要ブラウザで利用可能なので、気にせず使ってしまって良いと考えています。

