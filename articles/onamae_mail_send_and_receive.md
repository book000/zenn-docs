---
title: お名前.comのドメインでメールを送受信する
emoji: 📫
type: tech
topics: ["onamae", "domain", "mail"]
published: true
---

本来、独自ドメインを用いたメールの送受信はメールサーバを契約するか、自力で VPS などを借りて立てるのが普通だが、今回 Gmail とお名前.com(と Cloudflare)のみでメールを送受信できることが分かったので備忘録として記事にしておく。

## 注意事項

**この記事に記載されている内容を実行し、発生したいかなる問題について執筆者は一切責任を負いません。自己責任でお願いします。**

## 必要なもの

- お名前.com で取得した独自ドメイン
- Google アカウント (Gmail)
- Cloudflare（DNS を Cloudflare で管理しているならば。今回は Cloudflare を使用しているものとして解説する）

※のちのち分かったことですが、お名前.com でメール転送設定をすると「`DNS 追加オプション(有料)`」として登録され、月 100 円（税抜き）が徴収されるようです。（なので私は自分でメールサーバを立て運用しています）

## やり方

### お名前.com にログインする

![](https://storage.googleapis.com/zenn-user-upload/gra2umwiapnhj10i5d4z1pmerb2e)

1. [お名前.com Navi](https://navi.onamae.com/login) から、お名前.com にログインする。
2. ログイン後、「`ドメイン契約更新`」の画面が表示されるが、無視して右上の「`オプション設定`」をクリックする。

### メール転送設定をする

![](https://storage.googleapis.com/zenn-user-upload/ml37ro833m82q1609hotyvs2i7ce)

1. 左側のナビゲーションバーか、中央のリストから「`転送 Plus`」にある「`メール転送設定`」をクリックする。
2. メールアドレスにしたいドメインを選び、そのドメインの隣にある「`設定する`」をクリックする。
3. 「`転送元メールアドレス`」に「`@より前のアドレス(admin, info, mail, owner など)`」、「`転送先メールアドレス`」に「`Gmail のアドレス`」、「`状態`」を「`有効`」にする。
4. 「`ドメインのネームサーバーを変更`」はチェックを入れなくてよい。（Cloudflare で DNS 管理しているなら）
5. 「`転送ネームサーバー設定確認`」の欄はメモを取っておく。(`ホスト名`・`TYPE`・`VALUE`・`優先`)
6. すべて入力したら、「`確認画面に進む`」をクリックして設定内容を確認して「`設定する`」を押して設定する。

### DNS に登録する

![](https://storage.googleapis.com/zenn-user-upload/qgkl69nybz0gk2h2ay2jm58q87hr)

![](https://storage.googleapis.com/zenn-user-upload/s7vqp2e5shimpoz56t6vbf4t42zy)

1. [Login to Cloudflare](https://dash.cloudflare.com/login) で Cloudflare にログインする。
2. ログイン後、上側のナビゲーションバーの「`DNS`」をクリック、「`DNS Records`」とある `DNS` の設定画面を開く。
3. 画像のように、「`MX`」を選択、「`Name`」欄に先ほどメモをとった「`ホスト名`」を入力、「`Click to Configure`」をクリックして、「`Server`」欄に先ほどメモをとった「`VALUE`」、「`Priority`」に先ほどメモをとった「`優先`」を入力し、「`Save`」をクリック。
   私の場合は、「Name」に「`tomacheese.com`」、「Server」に「`mailforward.dnsv.jp`」、「Priority」に「`10`」を入力した。
4. 入力できたら、「Add Record」をクリックして、DNS にレコードを登録する。

ここまで作業ができたら、メールの受信は可能になる。ただし、DNS が浸透しないとメールの受信に失敗する場合があるので、半日～ 1 週間は待つ。

### Gmail の設定をする

![](https://storage.googleapis.com/zenn-user-upload/h4kb1rntmn3ru7pkgnfhd22ntl55)

1. [Gmail](https://mail.google.com/) を開き、右上の歯車アイコンをクリックして設定を開く。
2. 設定が開いたら、「`アカウントとインポート`」をクリックし、「`名前`」のところにある「`他のメール アドレスを追加`」をクリックする。
3. 別ウィンドウで「`自分のメールアドレスを追加`」が開いたら、「`名前`」に任意の名前（ニックネームなど。送信先に公開される）、「`メール アドレス`」に先ほど設定した「`転送元メールアドレス`」と「`ドメイン名`」をくっつけたメールアドレス（例: `example@tomacheese.com`）を入力。「`エイリアスとして扱います`」はオンにしておく（チェックをつけておく）。
4. 「`次のステップ`」を押し、「`SMTP サーバー`」に「`smtp.gmail.com`」、ユーザー名に「`Gmail のメールアドレス`」の「`@gmail.comより前`」を入力。(例: `example@gmail.com` なら `example` )
5. 「`パスワード`」には後述する方法で取得したアプリケーションパスワードを入力。「ポート」は「`587`」を選択。
6. 「`TLS を使用したセキュリティで保護された接続`」を選択して「`アカウントを追加`」。

### メールが来るのを待つ

「`gmail-noreply@google.com`」から「`Gmail からのご確認`」というメールが届くので、記載されている URL（リンク）を踏んで「確認」を行う。
もしくは、「確認コード」を入力する方法もあるが、URL を踏んだ方が楽なので私はこちらを使った。

ここまで作業すると、メールの送信も可能になる。
試しに関係ないメールアドレスから送信してみて、受信できるか、送信できるか試してみることをお勧めする。

#### アプリケーションパスワードの取得方法

![](https://storage.googleapis.com/zenn-user-upload/tuvnmsuzlwe95ttqaqw3o621ueu5)

1. [Google のアプリ パスワード](https://myaccount.google.com/not-supported) で、アプリケーションパスワードを生成。
2. 「アプリケーションを選択」で「そのほか」を選択、そのあと出てくる入力欄に適当な名前（メールアドレスなど）を入力して「生成」をクリック。
   **発行されたパスワードは再度表示できないので、必ずメモをとっておくこと。**
