---
title: Vue.jsでライブラリを使わずに長押し機能を作る
emoji: 👆
type: tech
topics: ["vue"]
published: true
---

スマホ・タブレットでよくありがちな「長押しで何かの動作をさせる」機能を Vue.js でライブラリを使わずに作ってみます。

ライブラリを使う場合は以下のスクラップに適当にまとめているので参考にできるかと。

https://zenn.dev/book000/scraps/21294f2f758cc5

---

## 環境

- Windows 10 21H2 (Build 19044.2130)
- iPhone SE 第 3 世代 - iOS 16.0
- iPad Pro 第 3 世代 - iPadOS 15.7
- Google Pixel 3a - Android 12
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
import Vue, { PropType } from 'vue'

export default Vue.extend({
  props: {
    onLongPress: {
      type: Function as PropType<() => void>,
      required: true,
    },
    delay: {
      type: Number,
      default: 500,
    },
  },
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
        this.onLongPress()
      }, this.delay)
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

  /* stylelint-disable-next-line property-no-vendor-prefix */
  -webkit-user-select: none;
}
</style>
```

```vue:index.vue
<template>
  <VLongPress :on-long-press="onLongPress" :delay="1000">
    <img src="https://picsum.photos/300/100">
  </VLongPress>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  methods: {
    onLongPress(): void {
      alert("long-pressed")
    },
  },
})
</script>
```

実際に試せる CodePen は以下から。画像を長押しするとアラートが出てくるはずです。

@[codepen](https://codepen.io/book000/pen/YzLooLP)

## 注意するべき点

この機能を実装する時に注意すべき事項として、「スマホ・タブレットの OS 機能としての長押し機能」と「スマホ・タブレットでのスクロール」があります。

### スマホ・タブレットの OS 機能としての長押し機能

iOS や Android といったスマートフォン・タブレットの主要 OS では、OS として「長押し」に対して機能を設けています。マウスとキーボードで操作するパソコンとは異なり、左クリックの概念がないからですね。

iOS, Android 共に、文字列を長押しすると画像のようなポップアップが表示され、文字列をコピーしたり検索することができます。

|                                     iPadOS                                     |                                    Android                                     |
| :----------------------------------------------------------------------------: | :----------------------------------------------------------------------------: |
| ![](https://storage.googleapis.com/zenn-user-upload/777de43dc62f-20221021.png) | ![](https://storage.googleapis.com/zenn-user-upload/93f4ac74e918-20221021.png) |

Web ページとして長押しで何かをするといった機能を提供する場合、OS の長押し機能を無効化しないと Web ページ側の長押し機能が動かないか、Web ページ・OS 両方の長押し機能が動いてしまうおそれがあります。

したがって、Web ページ側で OS の長押し機能を無効化します。しかし、ブラウザによって対応が異なります。  
以下に示すいくつかの CSS プロパティと JavaScript コードの組み合わせで無効化できます。リンク先は日本語の MDN です。

- CSS: [`user-select: none`](https://developer.mozilla.org/ja/docs/Web/CSS/user-select)
- CSS: `-webkit-user-select: none`
- CSS: [`-webkit-touch-callout: none`](https://developer.mozilla.org/ja/docs/Web/CSS/-webkit-touch-callout)
- CSS: [`pointer-events: none`](https://developer.mozilla.org/ja/docs/Web/CSS/pointer-events)
- JavaScript: [`contextmenu.prevent`](https://developer.mozilla.org/ja/docs/Web/API/Element/contextmenu_event) (`contextmenu` イベントが発行されたときに `preventDefault()` でキャンセルすることを指しています)

これらに関する記事は昔から多くあるのですが、インターネット上の情報のみを参考にして実装すると、各種アップデートによって仕様が変わっており期待通りに動作しない恐れがあります。  
ここでは、CodePen で適当なコードを書き、実機で検証しながら確認します。

@[codepen](https://codepen.io/book000/pen/poVmaOw)

実際に検証した結果が以下の通りです。（一応 PC での検証もしました）  
OS 毎の環境情報は [#環境](#環境) を参照ください。

「デフォルト」というのは、何も CSS や JavaScript を要素に対して割り当てないそのままの状態のことを指しています。

#### テキストの選択可否

ここでは、各テキスト要素を選択・長押しすることでテキストが選択できるかどうかを確認します。

| ブラウザ                      | デフォルト | user-select | -webkit-user-select | -webkit-touch-callout | pointer-events | contextmenu.prevent |
| :---------------------------- | :--------: | :---------: | :-----------------: | :-------------------: | :------------: | :-----------------: |
| Windows Chrome 106.0.5249.119 |     ○      |    **×**    |        **×**        |           ○           |       ○        |          ○          |
| Windows Firefox 106.0.1       |     ○      |    **×**    |        **×**        |           ○           |       ○        |          ○          |
| iOS Safari                    |     ○      |      ○      |        **×**        |           ○           |       ○        |          ○          |
| iOS Chrome 106.0.5249.92      |     ○      |      ○      |        **×**        |           ○           |       ○        |          ○          |
| iOS Firefox 106.0 (20303)     |     ○      |      ○      |        **×**        |           ○           |       ○        |          ○          |
| iPadOS Safari                 |     ○      |      ○      |        **×**        |           ○           |       ○        |          ○          |
| iPadOS Chrome 106.0.5249.92   |     ○      |      ○      |        **×**        |           ○           |       ○        |          ○          |
| iPadOS Firefox 105.1 (19787)  |     ○      |      ○      |        **×**        |           ○           |       ○        |          ○          |
| Android Chrome 106.0.5249.126 |     ○      |    **×**    |        **×**        |           ○           |       ○        |          ○          |
| Android Firefox 105.2 (20159) |     ○      |    **×**    |        **×**        |           ○           |     △[^1]      |        △[^1]        |

iOS / iPadOS Chrome での検証の際、当たり判定が大きすぎるのかテキスト部分を長押ししているのに画像部分を選択していることになって困りました…。img 要素を一時的に消すことで対応しました。

#### テキスト選択でのメニュー表示有無

ここでは、各テキスト要素を選択して右クリック・長押ししたときにテキストに対してのメニューが表示されるかを確認します。

| ブラウザ                      | デフォルト | user-select | -webkit-user-select | -webkit-touch-callout | pointer-events | contextmenu.prevent |
| :---------------------------- | :--------: | :---------: | :-----------------: | :-------------------: | :------------: | :-----------------: |
| Windows Chrome 106.0.5249.119 |     ○      |    △[^2]    |        △[^2]        |           ○           |       ○        |        **×**        |
| Windows Firefox 106.0.1       |     ○      |    △[^2]    |        △[^2]        |           ○           |       ○        |        **×**        |
| iOS Safari                    |     ○      |      ○      |      **×**[^3]      |           ○           |       ○        |          ○          |
| iOS Chrome 106.0.5249.92      |     ○      |      ○      |      **×**[^3]      |           ○           |       ○        |          ○          |
| iOS Firefox 106.0 (20303)     |     ○      |      ○      |      **×**[^3]      |           ○           |       ○        |          ○          |
| iPadOS Safari                 |     ○      |      ○      |      **×**[^3]      |           ○           |       ○        |          ○          |
| iPadOS Chrome 106.0.5249.92   |     ○      |      ○      |      **×**[^3]      |           ○           |       ○        |          ○          |
| iPadOS Firefox 105.1 (19787)  |     ○      |      ○      |      **×**[^3]      |           ○           |       ○        |          ○          |
| Android Chrome 106.0.5249.126 |     ○      |  **×**[^3]  |      **×**[^3]      |           ○           |       ○        |        **×**        |
| Android Firefox 105.2 (20159) |     ○      |  **×**[^3]  |      **×**[^3]      |           ○           |       ○        |          ○          |

#### 画像選択でのメニュー表示有無

ここでは、各画像要素を右クリック・長押ししたときに画像に対してのメニューが表示されるかを確認します。

| ブラウザ                      | デフォルト | user-select | -webkit-user-select | -webkit-touch-callout | pointer-events | contextmenu.prevent |
| :---------------------------- | :--------: | :---------: | :-----------------: | :-------------------: | :------------: | :-----------------: |
| Windows Chrome 106.0.5249.119 |     ○      |      ○      |          ○          |           ○           |       ○        |        **×**        |
| Windows Firefox 106.0.1       |     ○      |      ○      |          ○          |           ○           |       ○        |        **×**        |
| iOS Safari                    |     ○      |      ○      |          ○          |         △[^4]         |     **×**      |          ○          |
| iOS Chrome 106.0.5249.92      |     ○      |      ○      |          ○          |         △[^4]         |     **×**      |          ○          |
| iOS Firefox 106.0 (20303)     |     ○      |      ○      |          ○          |         △[^4]         |     **×**      |          ○          |
| iPadOS Safari                 |     ○      |      ○      |          ○          |         △[^4]         |     **×**      |          ○          |
| iPadOS Chrome 106.0.5249.92   |     ○      |      ○      |          ○          |         △[^4]         |     **×**      |          ○          |
| iPadOS Firefox 105.1 (19787)  |     ○      |      ○      |          ○          |         △[^4]         |     **×**      |          ○          |
| Android Chrome 106.0.5249.126 |     ○      |      ○      |          ○          |           ○           |     **×**      |        **×**        |
| Android Firefox 105.2 (20159) |     ○      |      ○      |          ○          |           ○           |       ○        |        **×**        |

---

この検証結果をもとにすると、`-webkit-user-select: none` と `pointer-events: none`、`contextmenu.prevent` を適用すればテキストでも画像でも長押し関連の OS 機能を無効化できそうです。  
とはいえ、もし画像をコピー・ダウンロードしてほしくないからこれらを適用するという発想を安直にする場合はやめた方がいいと思います。どうせ開発ツールから解除できるので…。

### スマホ・タブレットでのスクロール

安直に実装しようとすると、「クリック・タップされたあと、数ミリ秒後にまだタップし続けてたら長押しってことでいいや！」と考えます。  
対象要素が「スクロールする時に間違いなくタップしない」要素なら良いのですが、そうでない場合スクロールのたびに長押し機能が動作し、滅茶苦茶にイライラすることになります。（一敗）

スマホ・タブレットでは、スクロールする際に Web ページ上の任意の箇所をタップしてから指を上または下に動かします。  
「タップした時」と「タップをやめた時」のイベントだけを使うと、「スクロールを始める時」にタップをし、「スクロールをやめた時」にタップをやめるので、長押しと同じ状態が起きます。  
なので、「タッチして指を移動した」場合に長押しと判断しないよう、`pointermove` イベントを受け取る必要があります。

### その他

この記事では、昔からある `mousedown` などの [MouseEvent](https://developer.mozilla.org/ja/docs/Web/API/MouseEvent) や `touchstart` などの [TouchEvent](https://developer.mozilla.org/ja/docs/Web/API/TouchEvent) を使わずに `pointerdown` など [PointerEvent](https://developer.mozilla.org/ja/docs/Web/API/PointerEvent) を利用しています。  
PointerEvent を利用する理由として、純粋な記述量が少なくなるだけでなく、TouchEvent と MouseEvent は[両方同時発生しうる](https://developer.mozilla.org/ja/docs/Web/API/TouchEvent#addeventlistener_および_preventdefault_の使用)ためです。

2019 年初期ごろまでは [Safari が PointerEvent をサポートしていなかった](https://caniuse.com/mdn-api_pointerevent) ので使うべきではなかったのですが、少なくとも 2022 年現在は主要ブラウザで利用可能なので、気にせず使ってしまって良いと考えています。

[^1]: 対象テキスト要素の長押しでは選択できないものの、ダブルタップでは選択できます。もちろん、「デフォルト」なら長押しでも選択できます。（Chrome ではダブルタップで選択することはできません）
[^2]: そもそも対象要素の選択ができないので、テキストに対するメニューは表示されませんがその要素上で選択することはできます（ページに対するメニューが表示される）
[^3]: そもそも対象要素の選択ができないので、要素に対するメニューすら開くことができません
[^4]:
    非常に特殊な挙動をします。他の ○ のケースでは画像を長押しすると「画像の保存」や「画像のコピー」ができるメニューが開くのですが、このケースではそれは開きません。
    その代わり、[iPad のマルチタスク機能](https://support.apple.com/ja-jp/HT207582) が動作して、「画面から少し浮き上がって見える」ようになります。
    参考までに、動画を撮影して Google ドライブにアップしておきました: [vue-long-click-ipad-multi-task.mp4](https://drive.google.com/file/d/1CvVOBiJLbwoCp5p7-pEeEd6VCo9uTXV5/view?usp=sharing)
    なお、`pointer-events` の場合はマルチタスク機能も動作しないようです。
