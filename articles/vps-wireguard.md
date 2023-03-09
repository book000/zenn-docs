---
title: Raspberry Pi で WireGuard + VPS
emoji: 🔐
type: tech
topics: ["wireguard", conohavps", "raspberrypi", "frp"]
published: true
---

Raspberry Pi 4 model B で VPN アプリケーションである [WireGuard](https://www.wireguard.com/) を立て、[ConoHa VPS](https://www.conoha.jp/vps/) を経由して VPN 環境を構築します。

**自宅ルータのポートを開けずに** 自宅外から自宅内のサーバや PC にアクセスしたい、フリー Wi-Fi でもある程度安全に通信できる環境を作りたいと思い構築しています。

:::message
もともと [自分のメモサイト](https://memo.tomacheese.com) に上げようと思っていた内容を途中で持ってきたので、わかりにくい部分があったらすみません。
:::

## 期待する結果

最終的に、以下のように動作するよう構成します。

```mermaid
sequenceDiagram
  autonumber
  actor User
  participant frps as 【VPS】<br>frps
  participant frpc as 【ラズパイ】<br>frpc
  participant wireguard as 【ラズパイ】<br>WireGuard
  participant pihole as 【ラズパイ】<br>Pi-hole
  participant lan as LAN
  participant internet as Internet

  Note over frps: frpsコンテナ起動
  frps-->>frps: 接続待ち

  Note over frpc,wireguard: WireGuardコンテナ起動
  frpc->>frps: 接続確立

  Note over User,internet: VPN接続確立
  User->>+frps: WireGuardクライアントを<br>用いて接続
  frps->>+frpc: 転送
  frpc->>+wireguard: 転送
  wireguard->>-frpc: OK
  frpc->>-frps: 転送
  frps->>-User: レスポンス

  Note over User,internet: LAN内HTTPリクエスト
  User->>+frps: 192.168.0.1に<br>HTTPリクエスト
  frps->>+frpc: 転送
  frpc->>+wireguard: 転送
  wireguard->>+lan: HTTPリクエスト
  lan->>-wireguard: レスポンス
  wireguard->>-frpc: 転送
  frpc->>-frps: 転送
  frps->>-User: 192.168.0.1からの<br>レスポンス

  Note over User,internet: google.comに接続: DNSリクエスト
  User->>+frps: google.comを正引き
  frps->>+frpc: 転送
  frpc->>+wireguard: 転送
  wireguard->>+pihole: 正引きリクエスト
  pihole->>-wireguard: レスポンス: 172.217.26.228
  wireguard->>-frpc: 転送
  frpc->>-frps: 転送
  frps->>-User: レスポンス

  Note over User,internet: google.comに接続: 172.217.26.228にHTTPリクエスト
  User->>+frps: 172.217.26.228に<br>HTTPリクエスト
  frps->>+frpc: 転送
  frpc->>+wireguard: 転送
  wireguard->>+internet: HTTPリクエスト
  internet->>-wireguard: レスポンス
  wireguard->>-frpc: 転送
  frpc->>-frps: 転送
  frps->>-User: レスポンス
```

## 環境

Raspberry Pi と VPS 間のポートフォワーディングに [fatedier/frp](https://github.com/fatedier/frp) を利用します。  
そのうえで、Docker Hub にあるもののうち **ユーザー数がある程度いて**、**GitHub Actions などで fatedier/frp のアップデートに追従しているもの** として [snowdreamtech/frp](https://github.com/snowdreamtech/frp) を選定しています。

:::message alert
Pi-hole と frp の利用には Docker を利用していますが、WireGuard は Docker 内で動作させません。また、PiVPN を利用しません。  
[linuxserver/wireguard](https://hub.docker.com/r/linuxserver/wireguard) を試したのですが、接続後 1 分程経過したタイミングでコンテナ内から LAN への通信がタイムアウトするようになりやめました。  
PiVPN を利用しない理由は途中のネットワークデバイス選択画面で Docker ネットワークが大量に表示され進めなくなったからです。
:::

もちろん、frp や Pi-hole を Docker で構築せずホスト OS にインストールしてもかまいません。  
WireGuard では Peer to Peer で双方がサーバにもクライアントにもなりうるので、ピア（Peer）と書くのが正しいのですがこの記事ではっきりとサーバ・クライアントが存在するので、「クライアント」と表記します。

- Raspberry Pi 4 model B
  - Raspberry Pi OS 64bit (Bullseye)
  - WireGuard 1.0.20210223-1
  - [snowdreamtech/frps](https://hub.docker.com/r/snowdreamtech/frps) 0.47.0
  - [pi-hole/pi-hole](https://hub.docker.com/r/pi-hole/pi-hole) 2023.02.2
  - Ethernet の NIC として `eth0` を利用
- ConoHa VPS
  - 512 MB プラン
  - Ubuntu 20.04.5 LTS
  - [snowdreamtech/frpc](https://hub.docker.com/r/snowdreamtech/frpc) 0.47.0

## 作業

1. frps の構築
2. WireGuard のインストール
3. frpc の構築
4. Pi-hole の構築

### 1. frps の構築

まず始めに、VPS 側の frp サーバソフトウェアである frps のインストール作業をします。

VPS 上の任意の場所に以下の `compose.yaml` を作成します。

```yaml
services:
  frps:
    image: snowdreamtech/frps
    container_name: frps
    volumes:
      - ./frps.ini:/etc/frp/frps.ini
    ports:
      - 7000:7000
      - 12345:12345/udp
    restart: always
```

その後、`compose.yaml` を置いた同じディレクトリに `frps.ini` を作成し以下を設定します。

```ini
[common]
bind_port = 7000
token = "任意の文字列"
```

`token` はポートフォワーディング時の認証トークンとなるので、固有のある程度長い推測不能な文字列にしてください。

設定を終えたら、`docker compose up --build -d` で立ち上げます。  
`7000` ポートの開放も忘れずに。

:::message
最小のコード量で動作するように書いているので、`7000` 番ポート以外への変更作業や frps のダッシュボードの設定などは記述していません。必要に応じて実施してください。
:::

### 2. WireGuard のインストール

VPN サーバとなる WireGuard を Raspberry Pi 4 model B にインストールします。

WireGuard のインストールでは、以下の手順を踏んでいきます。

1. `sysctl` の設定
2. APT で WireGuard をインストール
3. サーバサイド鍵ペアの作成
4. WireGuard の設定ファイル作成
5. クライアントに配布する接続設定ファイルの作成
6. WireGuard のクライアント設定を更新
7. WireGuard の起動

このうち、5, 6, 7 はクライアントを追加するごとに実施するのでシェルスクリプトで再利用可能にします。（`クライアント追加用のシェルスクリプト作成` にセクションをまとめます）

#### sysctl の設定

追加設定をしない限り、異なる NIC 間でのパケットのやりとりができません。WireGuard はデフォルトで `wg0` という NIC を追加するので、これと `eth0` 間でパケット転送ができない場合 VPN をつないでも LAN ネットワークやインターネットと通信できません。  
（という理解なのですが、間違ってたらすみません）

というわけで、IP 転送（フォワーディング）を有効にするため sysctl を編集します。  
お好みのエディタで `/etc/sysctl.conf` を開き、末尾に以下を追記し保存します。

```ini
net.ipv4.ip_forward=1
```

すでに `net.ipv4.ip_forward` に関する記述がある場合は当該行をコメントアウトするなどしてください。

その後、編集した内容を反映するため以下のコマンドを実行します。

```shell
sudo sysctl -p
```

#### APT で WireGuard をインストール

以下のコマンドを実行し、WireGuard をインストールします。

```shell
sudo apt update
sudo apt install wireguard
```

#### サーバサイド鍵ペアの作成

#### WireGuard の設定ファイル作成

#### クライアント追加用のシェルスクリプト作成

### 3. frpc の構築

### 4. Pi-hole の構築

## クライアントの設定

### iOS

### Android

### Windows

## トラブルシューティング
