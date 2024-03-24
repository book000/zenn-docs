---
title: ngrokでMinecraftサーバを公開する
emoji: 🎮
type: tech
topics: ["minecraft", "ngrok", "windows"]
published: true
---

:::message
2024/03/24 に記事を書き直しました。
:::

おもに Minecraft Java Edition のマルチプレイをしたいけどポート開放が面倒とか、ネットワーク上の問題でポート開放ができないなどで困っている人向けに ngrok というサービスを使って **一時的に** 公開する方法の解説です。

Minecraft サーバの立て方などは説明しません。  
Minecraft でなくても、TCP というプロトコルで通信する場合は ngrok が利用できます。統合版の場合は UDP なので、localtonet などがおすすめかもしれません。[このへんの記事](https://zenn.dev/hrtk92/articles/mc-server-localtonet) がよさそうです。

:::message alert
仕組み上、`0.tcp.jp.ngrok.io:<ポート>` の `<ポート>` 部分を変えながらアタックすることで誰でもサーバに入れてしまう状態になります。  
ホワイトリストやプラグインによる IP 制限などを実施し、知らない人が入ってきたり荒らされたりしないように十分注意しましょう。

この記事に記載されている内容を実行し、発生したいかなる問題について執筆者は一切責任を負いません。自己責任でお願いします。
:::

## 環境

- Windows 11 Pro 23H2 (Build 22631.3296)
- ngrok 3.8.0

## やり方

## 1. ngrok へ登録

まず、[ngrok.com](https://ngrok.com/) へアクセスします。  
[Sign Up](https://dashboard.ngrok.com/signup) にて、以下の項目を入力し、**Sign up** をクリックしてください。

- **Name**: 適当な名前（ハンネなどでよい）を入力
- **Email**: 受信可能・有効なメールアドレスを入力
- **Password**: 任意のパスワードを入力
- ロボット認証を実施
- **I accept the terms of service and privacy policy**: チェックをいれる

## 2. ngrok のコマンドラインツールをダウンロード

ngrok は exe のインストーラーに加え、chocolatey や Scoop でもインストールが可能です。

### インストーラーでのインストール

### chocolatey でのインストール

### Scoop でのインストール

## 3. ngrok のアカウントを連携
