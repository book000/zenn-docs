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

主に Minecraft Java Edition のマルチプレイをしたいけどポート開放が面倒とか、ネットワーク上の問題でポート開放ができないなどで困っている人向けに ngrok というサービスを使って **一時的に** 公開する方法の解説です。

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

### 1. ngrok へ登録

まず、[ngrok.com](https://ngrok.com/) へアクセスします。  
[Sign Up](https://dashboard.ngrok.com/signup) にて、以下の項目を入力し、**Sign up** をクリックしてください。

- **Name**: 適当な名前（ハンネなどでよい）を入力
- **Email**: 受信可能・有効なメールアドレスを入力
- **Password**: 任意のパスワードを入力
- ロボット認証を実施
- **I accept the terms of service and privacy policy**: チェックをいれる

### 2. ngrok のコマンドラインツールをダウンロード

ngrok は exe ファイルそのもののダウンロードに加え、chocolatey や Scoop でもインストールが可能です。

#### exe ファイルダウンロードによるインストール

[ダッシュボードのセットアップページ](https://dashboard.ngrok.com/get-started/setup/windows) にて、**Download** タブをクリックし、**Download for Windows (64-Bit)** をクリックします。

![](https://storage.googleapis.com/zenn-user-upload/c9ae787ac596-20240328.png)

Zip ファイルがダウンロードされるので展開し、中身の exe ファイルを任意の場所に移動してください。

#### chocolatey でのインストール

以下のコマンドでインストールできます。

```powershell
choco install ngrok
```

#### Scoop でのインストール

以下のコマンドでインストールできます。

```powershell
scoop install ngrok
```

### 3. ngrok のアカウントを連携

自分のパソコンに ngrok の認証情報を保存する必要があるので、アカウント連携をしなければなりません。

先ほどの [ダッシュボードのセットアップページ](https://dashboard.ngrok.com/get-started/setup/windows) にて、`ngrok config add-authtoken` から始まるコマンドをコピーします。  
右側にあるコピーアイコンをクリックすると、簡単にコピーできます。

![](https://storage.googleapis.com/zenn-user-upload/f44960c85829-20240328.png)

次に、コピーしたコマンドを自分のパソコンで実行します。

exe ファイルをダウンロードした場合は、以下の手順で PowerShell を起動し、コマンドを実行します。

`ngrok.exe` ファイルを置いたフォルダをエクスプローラーで開き、何もないところを「Shift + 右クリック」します。  
するとメニューが出てくるので、「PowerShell ウィンドウをここで開く」をクリックします。

![](https://storage.googleapis.com/zenn-user-upload/2f2904c2a7f9-20240328.png)

PowerShell が開いたら、先ほどコピーしたコマンドの `ngrok` という文字を `.\ngrok.exe` に置き換えつつ入力してください。  
たとえば、`ngrok config add-authtoken XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` とコピーしていたら `.\ngrok.exe config add-authtoken XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` と書き換えます。  
入力し終えたら Enter で実行します。

![](https://storage.googleapis.com/zenn-user-upload/08121a00f3c1-20240328.png)

chocolatey や Scoop でインストールした場合は、PATH に登録されているかと思うので、PowerShell などを起動してコピーしたコマンドをそのまま（`.\ngrok.exe` に書き換えずに）実行してください。

### 4. ngrok でサーバ（ポート）を公開

アカウント連携ができたら、いよいよサーバを公開します。

Minecraft のサーバを立ち上げたうえで、先ほどと同じように PowerShell を起動し、以下のコマンドを実行します。  
exe ファイルでインストールした方は `ngrok` を `.\ngrok.exe` に書き換えて実行してください。

```powershell
ngrok tcp 25565
```

以下のように表示され、**Session Status** 欄で `online` になれば接続できます！

サーバアドレスは、 **Forwarding** 欄にある `0.tcp.jp` から始まるアドレスがそれにあたります。下記の画像であれば、`0.tcp.jp.ngrok.io:15826` です。

![](https://storage.googleapis.com/zenn-user-upload/64701119a8b1-20240328.png)

### 5. ログインできれば完了

実際に確認したアドレスでログインしてみて、ログインできれば成功です🎉

![](https://storage.googleapis.com/zenn-user-upload/caed24cb3a04-20240328.png)

## 2回目以降

2 回目以降は、先ほどと同じように `ngrok tcp 25565` のコマンドを実行することで、同じようにサーバを公開できます。  
しかし、いちいち PowerShell を開くのも面倒なのでこのコマンドを実行できるファイルを作っておきます。

まず、拡張子を表示させるための設定をします。エクスプローラーで、以下のように **表示** → **表示** と進み、**ファイル名拡張子** の箇所にチェックが入るようにクリックしてください。

![](https://storage.googleapis.com/zenn-user-upload/1d49c80ceaca-20240328.png)

テキストファイルを作成し、`start.bat` というファイルを作成します。

![](https://storage.googleapis.com/zenn-user-upload/8ce9a54caaa7-20240328.png)

以下のように、「ファイルが使えなくなる可能性があります」という画面が出たら「はい」をクリックしてください。

![](https://storage.googleapis.com/zenn-user-upload/e2765dbd534c-20240328.png)

`start.bat` ファイルを右クリックし、**編集** を押します。

![](https://storage.googleapis.com/zenn-user-upload/9af4f28fd32c-20240328.png)

メモ帳アプリが開くので、以下を入力し保存します。  
exe ファイルでインストールした方は `ngrok` を `.\ngrok.exe` に書き換えて実行してください。

```powershell
ngrok tcp 25565
pause
```

ここまで準備できれば、あとは作成した `start.bat` をダブルクリックするだけで、サーバが公開できるようになります💪

## 公開ドメインについて

## 有償版で利用できること

## バージョン2とバージョン3の違い

## ほかの関連アプリとの違い
