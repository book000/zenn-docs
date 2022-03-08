---
title: ngrokでMinecraftサーバを公開する
emoji: 🎮
type: tech
topics: ["minecraft", "ngrok", "windows"]
published: true
---

マルチプレイをしたいけどポート開放が面倒とか、ネットワーク上の問題でポート開放ができないとかで困っている人向けに ngrok を使って一時的に公開する方法。  
ngrok でポートフォワーディングします。Minecraft サーバ自体の立て方については解説しません。

## 注意

この方法は `0.tcp.ap.ngrok.io:<PORT>` で `<PORT>` を変えてアタックしまくれば誰でもサーバに入れてしまう環境になります。ホワイトリストやプラグインによる IP 制限などを実施し、知らない人が入ってきたり荒らされたりしないように十分注意しましょう。
この記事に記載されている内容を実行し、発生したいかなる問題について執筆者は一切責任を負いません。自己責任でお願いします。  
今回は説明のために割と画像やら GIF を多用します。

## 環境

Windows 以外の OS の場合は適量読み替えてください。

- OS: Windows 10 2004 (Build 19041.630)
- `winver`
- ngrok version 2.3.35

## やり方

### ngrok へ登録

ああ [ngrok.com](https://ngrok.com/) へアクセス、右上の `Sign up` から適当な名前（ハンネとかで良い）、有効な E-mail アドレス、パスワードを入れロボット認証をし「Sign Up」をクリック。

### ngrok のコマンドラインツールをダウンロード

![](https://storage.googleapis.com/zenn-user-upload/xtjam9o1xif79ni4u0oeo8n3uw3v)

「`Download for Windows`」をクリックして、Windows 版の ngrok をダウンロードします。ZIP ファイルがダウンロードされるので展開して中にある `ngrok.exe` をデスクトップとかサーバのフォルダとかに移動させておきます。
もし PATH を通すという作業ができるのであれば、適当なところにおいて PATH を通すとどこをカレントディレクトリにしても使えるので楽ですが、この記事では PATH を通さない前提で話を進めます。  
とりあえず、ここではデスクトップに「`test`」というフォルダを作りそこに `ngrok.exe` を移動させました。

### ngrok のアカウントを連携

自分の PC に ngrok の認証情報を保存する必要があるので、アカウント連携をしなければなりません。この記事では PowerShell を使ってコマンドを入力・実行しますが、コマンドプロンプト（`cmd`）でもかまいません。

![](https://storage.googleapis.com/zenn-user-upload/l5mqp39ip5jb66qzm41vep1nw5oi)

まず、先ほど `ngrok.exe` を移動させた先のフォルダで「`Shift + 右クリック`」し、「`PowerShell ウィンドウをここで開く`」をクリックします。

![](https://storage.googleapis.com/zenn-user-upload/q5v25tjviurfrc1x7tg1qkg124c8)

もしくは、エクスプローラーのアドレス欄をクリックし、`powershell` と入力して開いてもかまいません。

![](https://storage.googleapis.com/zenn-user-upload/atviovin5kmnb07i4q1t44cwqv0w)

PowerShell が開いたら、先ほど ngrok をダウンロードしたページに戻り `Connect your account` の欄を確認しましょう。`./ngrok authtoken <TOKEN>` とトークンが書かれているので、`<TOKEN>` にあたる部分をコピーします。

![](https://storage.googleapis.com/zenn-user-upload/398zivesisdv7e91tc35x08p2eep)

PowerShell に戻り、`.\ngrok.exe authtoken <TOKEN>` と実行します。当然実行する前に `<TOKEN>` の部分はページに記載されているコピーしたトークンに置き換えること。
`Authtoken saved to configuration file:` と表示されれば成功です。

### ngrok でサーバ（ポート）を公開する

最終工程として、Minecraft サーバのデフォルトポートである `25565` ポートを ngrok で公開し外部からログイン可能にします。

![](https://storage.googleapis.com/zenn-user-upload/9tlsnk9ldn2hhaprm0tnairvvh5k)

先ほどの PowerShell で `.\ngrok.exe tcp --region ap 25565` と実行しましょう。
`Session Status` が `online` と表示され、`Forwarding` 欄にアドレスが表示されていれば成功です。
サーバにログインする人にアドレスを教える場合は `tcp://0.tcp.ap.ngrok.io:<PORT>` の `0.tcp.ap.ngrok.io:<PORT>` の部分、上記画像で言えば `0.tcp.ap.ngrok.io:13915` を教えましょう。
ちなみに、ほかの記事では `--region ap` を付けていないケースが多いですがデフォルトだとアメリカの鯖が選ばれてしまうので無茶苦茶遅いです。`--region ap` をつけて asia を選ぶことをお勧めします。

### 完了

![](https://storage.googleapis.com/zenn-user-upload/5zubmorwvvrhxgru6p1f50uxpbsm)

実際にログインできれば成功です。サーバを立ている自分自身はわざわざネットワーク上のサーバを介する必要はないので、`localhost:25565` でログインしましょう。

## 2 回目以降

2 回目以降は、`.\ngrok.exe tcp --region ap 25565` を実行するだけで同じようにサーバ（ポート）を公開できます。しかし、いちいち PowerShell を開くのも面倒なのでこのコマンドを実行できるファイルを作っておきます。

![](https://storage.googleapis.com/zenn-user-upload/jjeyz9ot7kpf1ioebvbicht6fvqg)

`start.bat` というファイルを作成し、以下のコマンドを入力し保存してください。

```powershell
ngrok.exe tcp --region ap 25565
pause
```

保存したら、あとはこのファイルをダブルクリックするだけでサーバ（ポート）を公開できます。

## 備考

- serveo というサービスもありますが、難易度は高めです（生 SSH 接続でポートフォワーディングするので）
- 独自ドメインとか VPS とか持っているなら、SSH ポートフォワーディングして独自ドメイン経由でやったほうがいちいちアドレスも変わらないのでそららを選べるならそっちの方が…。
