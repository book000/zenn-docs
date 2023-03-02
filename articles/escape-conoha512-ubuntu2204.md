---
title: ConoHaVPS 512MB で Ubuntu 22.04 から逃げ出す
emoji: 💨
type: tech
topics: ["conoha", "conohavps"]
published: true
---

昨年12月に [ConoHaVPS + Cloudflare で IPv6 に対応する](https://zenn.dev/book000/articles/conohavps-cloudflare-ipv6) というタイトルで [ConoHa Advent Calendar 2022](https://qiita.com/advent-calendar/2022/conoha) に参加しました。  
その際に、ちょろっと脚注に以下のようなことを書きました。

> ConoHa さん、RAM 512 MB で Ubuntu 22.04 を立てると Kernel Panic する問題をなんとか解決していただけると非常にうれしいです…。参考: [Twitter での検索結果](https://twitter.com/search?q=512MB%20ConoHa%20Ubuntu&src=typed_query&f=live)

この記述が原因となったのかそうでないのかはよくわかりませんが、ひっそりと [ConoHa VPS の仕様ページ](https://www.conoha.jp/vps/pricing/) に以下の記載が追加されました。

> ※Ubuntu 22.04は、512MBプランではご利用いただけません。1GB以上でのご利用を推奨しています。

ちなみに、さくらの VPS では 2022/09/12 に [さくらのVPS 512MBプラン「Ubuntu 22.04」にて最新のカーネルを用いて起動できない事象について](https://vps.sakura.ad.jp/news/vps-os-ubuntu22_04-kerneltrouble/) というアナウンスと共に 512 MB プランでの Ubuntu 22.04 の選択ができなくなっていたようで、ConoHa もこれと同様の対応をとったようです。

---

と、ここまではまあ妥当な対応だと思い良かったのですが、2023/03/01 に月初めだしサーバの各種アップデートでもするか〜と思い RAM 512MB の Ubuntu 22.04 サーバを `apt upgrade` したらまたカーネルパニックを起こしました。`linux-*` 系のパッケージアップデートしないようにしてたつもりなのになあ…。  
GRUB のコマンドラインに入って `/boot/` 以下にある古いイメージとかを使ってブートすることを試しましたが、まともに起動せず頭を抱えるはめに。

そんなわけで、前置きが長くなりましたが **ConoHa VPS 512 MB プラン** で **Ubuntu 22.04 を立てた上**で、**`apt upgrade` したらカーネルパニックの無限ループに吸い込まれてしまった方** 向けの逃亡方法記事です。（対象読者があまりにも狭すぎる！）

:::message
なお、この環境で VPS を立てた直後に `apt upgrade` して再起動するとカーネルパニックを起こすのですが、GRUB で vmlinuz を `5.15.0-52-generic` から `vmlinuz-5.15.0-25-generic` にダウングレードすると起動する場合があります。  
私の場合は契約直後にこの作業を行い、今回のトラブル発生時点で `vmlinuz-5.15.0-25-generic` だったにも関わらず起きたので、また別の問題なんだろうと推測しています。

なお、この時 `apt upgrade` でアップデート対象となったパッケージ一覧は [こちら](https://github.com/book000/book000/issues/6#issuecomment-1449279306) に記録しています。あとからこうやって見ると、`linux-firmware` あたりが怪しい気しますよね…。
:::

## 環境と留意事項

- ConoHa VPS 512 MB プラン
- Ubuntu 22.04 → Ubuntu 20.04
- vmlinuz-5.15.0-25-generic
- 作業日: 2023/03/01

この記事に記載されている内容を実行し、発生したいかなる問題について執筆者は一切責任を負いません。自己責任でお願いします。

## 作業

作業内容は大したことなく、以下の通りに進みます。

1. Ubuntu 22.04 のイメージを保存する
2. 作成したイメージをもとに、リカバリ用の VPS を立てる
3. リカバリ用の VPS から必要なデータをダウンロードする
4. 元々の VPS で、Ubuntu 20.04 を用いてサーバ再構築する
5. がんばる

### 1. イメージを作成する

### 2. リカバリ用の VPS を立てる

### 3. 必要なデータをダウンロードする

### 4. サーバ再構築をする

## 5. がんばる

