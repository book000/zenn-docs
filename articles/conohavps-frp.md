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
  - 攻撃の影響で自宅のネットワークが死んだ場合、直接自宅ルーターにアクセスされる環境下にあると手に負えなくなる

そこで、この記事では ConoHa VPS で [fatedier/frp](https://github.com/fatedier/frp) というアプリケーションを用いてリバースプロキシサーバを立て、簡単にサーバを公開する環境を構築してみようと思います。

## 環境

- 作業日: 2024/12/20
- ConoHa VPS Ver.3.0
  - 512 MB プラン
  - Ubuntu 20.04 LTS
  - [fatedier/frp](https://github.com/fatedier/frp) v0.61.1
- Windows 11 23H2 Build 22631.4602

## frp というソフトウェアとは

今回、リバースプロキシサーバを構築するにあたり [fatedier/frp](https://github.com/fatedier/frp) というアプリケーションを利用します。  
NAT やファイヤーウォールでポート開放が難しい環境であっても、VPS など外部サーバを経由する形で簡単にアクセス可能にできるという優れものです。

frp は、サーバの役割を持つ frps と、クライアントの役割を持つ frpc の 2 つがあります。今回は、ConoHa VPS に frps を導入し、ローカル端末で frpc を利用して実現します。

README にいろいろな使用例が載っているので、見てみると面白いです。

https://github.com/fatedier/frp?tab=readme-ov-file#example-usage

## なぜ ConoHa VPS？

せっかく ConoHa のアドベントカレンダーに参加しているのに、frp の紹介だけだと「なぜ ConoHa VPS を選ぶのか？」という疑問が当然出てきます。  
私が ConoHa VPS を選定している理由は以下です。

- ある程度信頼が置ける他社 VPS サービスと比較し、価格が安い
- 最低利用期間がないため、いつでも解約可能
- 従量課金ではないため、気が付いたらとんでもない請求が来る心配がない
- このはちゃんカワイイ！

## 実際に構築・公開する

以下の手順で、frp のサーバを構築します。

1. ConoHa コントロールパネルでセキュリティグループを作成
2. ConoHa VPS を契約
3. VPS の基本的なセットアップを実施
4. frp のサーバ（frps）をセットアップ
5. frp のクライアント（frpc）をセットアップ
6. 実際にサーバを公開する

### 1. ConoHa コントロールパネルでセキュリティグループを作成

先に、セキュリティグループを作成します。とりあえず全部の In / Out 通信を許可したいのですがどうやら default グループだと全拒否されるようなため、以下のように作成しました。  
なお、ポート開放設定は Uncomplicated Firewall（ufw）を利用して設定することにします。

- セキュリティグループ名: `IPv4v6-AllAllow`
- ルール: 以下の表を参照

| 通信方向 | イーサタイプ | プロトコル | ポート範囲 | IP/CIDR |
| :- | :- | :- | :- | :- |
| IN | IPv4 | All | | |
| IN | IPv4 | All | | |
| OUT | IPv4 | All | | |
| OUT | IPv4 | All | | |

:::message
IPv4 + IPv6 × プロトコル All（すべて）のルールを定義したセキュリティグループとなります。  
セキュリティグループ `default` と同じように見えるのですが、なぜかこれで全許可になるようです。`default` が特殊なんですかね？
:::

![](https://storage.googleapis.com/zenn-user-upload/0d78708a18ab-20241220.png)

### 2. ConoHa VPS を契約

次に、ConoHa VPS を契約します。

今回は以下を選択しました。

- イメージタイプ: Ubuntu 22.04 (x86_64)
- プラン: 512 MB (CPU 1 Core / SSD 30 GB)

512 MB プランで Ubuntu OS を選択する場合、22.04 や 24.04 は選択できないため注意です。  
すでに 2 年くらい frp を 512 MB プランでホストしていますが、特に問題は出ていないので十分かなと思います。

セキュリティグループは、先ほど作成した `IPv4v6-AllAllow` を選択します。  
以下のスクリーンショットでは見切れてしまっていますが、下にスクロールし「オプションを見る」をクリック、出てくる「セキュリティグループ」の欄を選択してください。

![](https://storage.googleapis.com/zenn-user-upload/7b69720b8f33-20241220.png)

### 3. VPS の基本的なセットアップを実施

サーバ追加が完了したら、VPS の基本的なセットアップを実施しておきます。  
ここではあまり詳しく説明しませんが、以下を実施しました。自分用に Ubuntu サーバのセットアップ手順をまとめたページ [Ubuntu Setup](https://memo.tomacheese.com/os/linux/ubuntu-setup/) があるので、よければご参照ください。

- 作業ユーザーの作成
- SSH の設定
- `sudo apt update`
- `sudo apt upgrade`

### 4. frp のサーバ（frps）をセットアップ

VPS の基本的なセットアップが終わったので、実際に frp のサーバとなる frps を構築します。  
今回は、`/var/frp/` 以下に構築します。

インストール手順として [リリースページ](https://github.com/fatedier/frp/releases) からダウンロードして…という手順を踏んでもいいのですが、アップデートなども簡単にしたいのでスクリプト化しました。

@[gist](https://gist.github.com/book000/4083adcd8202e523fbf4993beea65b2b)

以下を実行することでカレントディレクトリに frps をインストールします。

```bash
wget -O - https://gist.github.com/book000/4083adcd8202e523fbf4993beea65b2b/raw/frps-installer.sh | bash
```

その後、frps の設定ファイルである `frps.toml` を作成します。  
いくつもの設定項目があるのですが、とりあえずは以下の 4 つだけで良いと思います。

- `bindAddr`: `0.0.0.0` を指定
- `bindPort`: 任意のポート番号を指定。frpc クライアントから通信を待ち受けるポートになります。
- `auth.method`: `token` を指定
- `auth.token`: 任意の値を指定。frps と frps 間の認証用トークン（キー）となります。

上記について、以下のように `frps.toml` に書き込みます。

```toml:/var/frp/frps.toml
bindAddr = "0.0.0.0"
bindPort = 7000

auth.method = "token"
auth.token = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

あとは Systemd あたりを書いて常時起動させておきます。以下を作成し、`sudo systemctl start frps` します。

```ini:/etc/systemd/system/frps.service
[Unit]
Description=frps

[Service]
WorkingDirectory=/var/frp/
User=root
Group=root
Restart=always

ExecStart=/var/frp/frps -c /var/frp/frps.toml

[Install]
WantedBy=multi-user.target
```

また、ufw で frps のポートを許可しておきます。

```shell
ufw allow 7000
```

### 5. frp のクライアント（frpc）をセットアップ

今回は、ローカル端末が Windows であるため、Windows 版の frpc クライアントをダウンロードします。

以下のリリースページにアクセスし、最新の `frp_{X}.{Y}.{Z}_windows_amd64.zip` をダウンロードし、展開します。

https://github.com/fatedier/frp/releases

![](https://storage.googleapis.com/zenn-user-upload/f6d554e6f5c0-20241220.png)

中身の `frpc.exe` を任意の場所に格納しておいてください。パスを通しておくとよいかもしれません。

### 6. 実際にサーバを公開する

Minecraft サーバを公開するとして解説します。Minecraft サーバは TCP 25565 ポートなので、これを転送するように設定します。

`frpc.toml` ファイルを作成し、以下を記載します。  
なお以下の部分は適切に変更する必要があります。

- `serverAddr`: frps をインストールしたサーバの IP アドレスを指定
- `serverPort`: frps の待ち受けポートを指定
- `auth.token`: frps.toml で設定したトークンを指定
- `[[proxies]]`
  - `name`: frps サーバ内で重複しない名前を指定
  - `localPort`: ローカル端末で稼働しているサーバのポート
  - `remotePort`: frps で公開するポート

```toml
serverAddr = "XXX.XXX.XXX.XXX"
serverPort = 7000

auth.method = "token"
auth.token = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

[[proxies]]
name = "minecraft"
type = "tcp"
localIP = "127.0.0.1"
localPort = 25565
remotePort = 25565
```

その後、`start.bat` などを作成し以下のように記載し、実行することで VPS へポートを転送できます。

```bat:start.bat
@echo off
.\frpc.exe -c frpc.toml
```

また、frps をインストールした VPS にて、対象のポートを開放する必要があります。

```shell
ufw allow 25565
```

これで、VPS の IP + ポート番号（`XXX.XXX.XXX.XXX:25565`）で外部から接続できるようになったはずです🎉🎉🎉

複数のポートを開ける必要があるゲームの場合は、`[[proxies]]` セクションを増やす必要があります。

## Docker で frp を使う

Docker で frp を使うことも可能です。  
Docker Hub を眺めていると frp のイメージはいくつかあるのですが、追従したアップデートがされていることと、中身が GitHub で公開されていることから [snowdreamtech/frp](https://github.com/snowdreamtech/frp) を利用しています。

- [snowdreamtech/frps](https://hub.docker.com/r/snowdreamtech/frps)
- [snowdreamtech/frpc](https://hub.docker.com/r/snowdreamtech/frpc)

```toml:frps/compose.yaml
services:
  frps:
    image: snowdreamtech/frps
    container_name: frps
    volumes:
      - ./frps.toml:/etc/frp/frps.toml
    restart: always
    network_mode: host
```

```toml:frpc/compose.yaml
services:
  frpc:
    image: snowdreamtech/frpc
    volumes:
      - ./frpc.toml:/etc/frp/frpc.toml
    restart: always
```
