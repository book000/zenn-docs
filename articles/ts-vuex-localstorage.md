---
title: TypeScript で Vuex を使う + localStorage で永続化する
emoji: 🗂️
type: tech
topics: ["nuxtjs", "typescript", "vue", "vuex", "localstorage"]
published: true
---

Nuxt.js + TypeScript + Vuex + vuex-persistedstate でがんばる。

## すること

- [Nuxt.js](https://nuxtjs.org/) で
- [TypeScript](https://www.typescriptlang.org/) 環境で
- [Vuex](https://vuex.vuejs.org/) で状態管理して
- [vuex-persistedstate](https://npm.im/vuex-persistedstate) を使って localStorage に状態を永続保持させる。

## 環境

- Node.js: v16.12.0
- `nuxt`: v2.15.8
- `nuxt-typed-vuex`: v0.3.1
- `vuex-persistedstate`: v4.1.0

---

本記事では、以下のリポジトリで作業しています。

https://github.com/book000/vuex-ts

- GitHub Pages: https://book000.github.io/vuex-ts/

## 方法

作業内容を大きく以下の 3 つに分割します。

1. TypeScript 環境で Nuxt.js プロジェクトを作成する
2. Vuex を TypeScript サポートさせる (`nuxt-typed-vuex`)
3. Vuex の「状態」を [localStorage](https://developer.mozilla.org/docs/Web/API/Window/localStorage) に保存するように設定する (`vuex-persistedstate`)

### TypeScript 環境で Nuxt.js プロジェクトを作成する

この記事では、超簡単なインクリメントしかしないカウンタを作ります。

`yarn create nuxt-app` (Npm であれば `npx create-nuxt-app`)を用いて Nuxt.js のプロジェクトを作成します。

![](https://storage.googleapis.com/zenn-user-upload/a12a2f9f0a93-20220610.png)

ここでやることは簡単です。`Programming language` の選択肢で `TypeScript` を選んでください。

### Vuex を TypeScript サポートさせる

`nuxt-typed-vuex` を用いて、Vuex を Typed な Vuex にします。

まず、`nuxt-typed-vuex` を依存関係に追加します。

```bash
yarn add nuxt-typed-vuex
```

---

次に、`nuxt.config.js` (TypeScript 化している場合は `nuxt.config.ts`)を編集します。
`buildModules` に先ほど依存関係に追加した `nuxt-typed-vuex` を追加してください。

```diff:nuxt.config.js
-buildModules: ["@nuxt/typescript-build", "@nuxtjs/vuetify"],
+buildModules: ["@nuxt/typescript-build", "@nuxtjs/vuetify", "nuxt-typed-vuex"],
```

---

さらに、`store/index.ts` を作成します。

https://github.com/book000/vuex-ts/blob/master/store/index.ts

---

カウンタの状態管理ストアを作るため、`store/counter.ts` を作成します。

https://github.com/book000/vuex-ts/blob/master/store/counter.ts

これ以外にストアを作成する場合は、適宜 `store/index.ts` の `getAccessorType` にある `modules` に追加してください。

---

最後に、型推論してもらうためには、`$accessor` でアクセスする必要があります。適当なところに d.ts を作成しておきましょう。

https://github.com/book000/vuex-ts/blob/master/types/accessor.d.ts

```diff
 {
   "compilerOptions": {
+    "typeRoots": ["types"]
   }
 }
```

---

`$accessor.counter.count` で取得、`$accessor.counter.setCount` で変更できます。

[Vue.js devtools](https://chrome.google.com/webstore/detail/nhdogjmejiglipccpnnnanhbledajbpd) を用いて Vuex を覗いてみると、きちんと記録されていることが確認できます。

![](https://storage.googleapis.com/zenn-user-upload/1960fdfeb962-20220610.png)

### Vuex の「状態」を localStorage に保存するように設定する

`vuex-persistedstate` を用いて、Vuex の中身を [localStorage](https://developer.mozilla.org/docs/Web/API/Window/localStorage) に自動保存・復元するようにします。

まず、`vuex-persistedstate` を依存関係に追加します。

```bash
yarn add vuex-persistedstate
```

---

次に、`plugins/counter.ts` を作成して先ほどの `counter` を localStorage に保存してもらうように設定します。

https://github.com/book000/vuex-ts/blob/master/plugins/counter.ts

---

最後に、`nuxt.config.js` (TypeScript 化している場合は `nuxt.config.ts`)を編集します。先ほど作成した `plugins/counter.ts` を読み込むように設定します。

```diff
- plugins: [],
+ plugins: [{ src: "~/plugins/counter", ssr: false }],
```

---

`count` を変更させてみたあと、再読み込みしてもきちんと数値が復元されることを確認できたら成功です。

## 参考

この記事は以下の 2 つを組み合わせてできあがっています。ありがとうございます。

- [NuxtJS + Vuex でいい感じの Typescript 環境をあまり頑張らないで構築する - Qiita](https://qiita.com/shindex/items/a90217b9e4c03c5b5215)
- [Nuxt.js にて plugins/localStorage に VuexStoter を保存する方法 - Qiita](https://qiita.com/shindex/items/a90217b9e4c03c5b5215)
