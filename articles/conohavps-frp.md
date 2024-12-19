---
title: ConoHa VPS で frp を使ったリバースプロキシサーバのススメ
emoji: 🔃
type: tech
topics: ["conoha", "conohavps", "frp"]
published: true
---

:::message
この記事は [ConoHa Advent Calender 2024](https://qiita.com/advent-calendar/2024/conoha) 21 日目（12 月 21 日）の記事です。

2 年前にはじめて参加し、昨年はドタバタで参加できなかったため今年はなにも考えずに参加したのですが、前々日まで一文字たりとも書けていませんでした…。
:::

この記事を読んでいるような一般的なご家庭の方なら、おそらく一度はなにかしらのサーバを立てたことがあると思います。  
よくあるケースは、Minecraft などのゲームを友人とプレイするときにマルチプレイサーバを立てるときでしょうか。

こうしたとき、以下のような問題が出てきます。

- 専用のサーバを契約して一から構築するのは面倒くさい
  - ローカルだったら割と簡単に立てられるのに…
  - たまに Dedicated Server が Windows でしか動作しないゲームというのがあります
- ルーターや契約回線の都合で、ポート開放ができない or 面倒くさい
  - たとえば、IPv4 over IPv6（DS-Lite）の場合 NAT 変換の都合でポート開放ができません
- ポート開放できる環境でも、万が一攻撃の対象にされたときにすぐ切り離せるようにしたい
  - 攻撃の影響で自宅のネットワークが死んだ場合のことは考えたくない…

そこで、この記事では ConoHa VPS で [fatedier/frp](https://github.com/fatedier/frp) というアプリケーションを用いて、リバースプロキシサーバを立て、簡単にサーバを公開する環境を構築してみようと思います。

## 環境

- 作業日: 2024/12/20
- ConoHa VPS
  - 512 MB プラン
  - Ubuntu XX.XX.X LTS
  - [fatedier/frp](https://github.com/fatedier/frp) v0.61.1
- Windows 11 24H2 Build XXXXX.XXXX

## 作業

1. ConoHa VPS を契約
2. frp のサーバ（frps）をセットアップ
3. frp のクライアント（frpc）をセットアップ
4. 接続確認

### 1. ConoHa VPS を契約

### 2. frp のサーバ（frps）をセットアップ

### 3. frp のクライアント（frpc）をセットアップ

### 4. 接続確認

## Docker で frp を使う
