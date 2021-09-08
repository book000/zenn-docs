---
title: Nuxt.js の SSR モードかつサブディレクトリで動作させる
emoji: 📝
type: tech
topics: ["nuxtjs", "ssr", "nginx"]
published: true
---

Nuxt.js の SSR、つまり Node.js サーバ環境下（リバースプロキシ）でかつサブディレクトリで動かす場合に手こずったので備忘録がてら記事にします。

## 環境・状況

- Nuxt.js v2.15.6
- SSR (Server-side rendering / Node.js Server)
- `https://example.com/test/` で公開させたい
- Nginx を使って、`example.com/test/` から `localhost:3000` にリバースプロキシして動作させている

## 結論

最初からだらだら経緯を書くのも読むのも嫌いなので、先に結論を書いておきます。

まず、`nginx.conf` を以下のように設定します（リバースプロキシの設定）※重要

```nginx
http {
    server {
        location ^~ /test/ {
            proxy_set_header Host $http_host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_pass http://127.0.0.1:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_next_upstream error timeout http_502 http_503 http_504;
        }
    }
}
```

次に、`nuxt.config.ts` または `nuxt.config.js` を以下のように設定します。（TypeScript で書いているので、JavaScript の場合は必要に応じて調整してください）

```typescript
{
  router: {
    base: '/test/'
  },
}
```

## 経緯

さて、結論は書いたのでここまでの経緯をちょこっと。

基本的にやったことは [Nuxt.js のディスカッション](https://github.com/nuxt/nuxt.js/discussions/9310) で質問した情報の通りです。（自己解決しましたが）  
とはいえ、完全に理解しきっているわけではないのでもし間違いがあればコメントなどで指摘していただけると幸いです。

純粋に、何も考えずに `router.base` や `build` の設定をせずにサーバを立てると、以下のようになってしまいます。

- `https://example.com/test/` にホストされる
- `_nuxt` へのスクリプトリンクがルート、つまり `/_nuxt/` になってしまう

そこで、`router.base` を設定したのですが私の環境下では解決せず、ネットの海を漁ってもまともな情報が出てこなかったので、Nuxt.js のディスカッションに質問しました。
しかし、後から思えばディスカッションでの質問は情報不足だったと思います…。nginx の設定内容を示さずに質問していたのでそりゃ返信がひとつも帰ってこないんだなと考えたり…。

つまり、nginx 側の設定においてリバースプロキシの設定が適当だったのが原因でした。質問する前は以下のように `nginx.conf` を設定していました。

```nginx
http {
    server {
        location ^~ /test/ {
            proxy_set_header Host $http_host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_pass http://127.0.0.1:3000/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_next_upstream error timeout http_502 http_503 http_504;
        }
    }
}
```

おわかりいただけるでしょうか、`proxy_pass` のアドレス部分の末尾にスラッシュが入っています。（`trailing slash` と呼ばれるらしい）
つまり、いくら Nuxt.js ないし Node.js サーバ側で `/test/` で受け付けていてもユーザーは `/test/` にアクセスできないのです

どういうことかというと、

- スラッシュ有の場合
  - `https://example.com/test/` -> `http://127.0.0.1:3000/`
  - `https://example.com/test/aaa` -> `http://127.0.0.1:3000/aaa`
- スラッシュ無の場合
  - `https://example.com/test/` -> `http://127.0.0.1:3000/test/`
  - `https://example.com/test/aaa` -> `http://127.0.0.1:3000/test/aaa`

になる…ということらしいのですが、うーん。よくわからない。

というわけで、むしろ Nuxt.js の問題というより Nginx にやられた、という備忘録でした。Nginx わからない…。

## 参考文献

- [I want to use Nuxt in a subdirectory and SSR · Discussion #9310 · nuxt/nuxt.js](https://github.com/nuxt/nuxt.js/discussions/9310)
- [nginx で proxy_pass の trailing slash には特に気をつけるべきという話 | Cosnomi Blog](https://blog.cosnomi.com/posts/674/)
