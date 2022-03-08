---
title: MediaWiki 1.34.4 に VisualEditor を導入する。
emoji: 🖊️
type: tech
topics: ["php", "mediawiki", "visualeditor", "nginx"]
published: true
---

MediaWiki に VisualEditor と Parsoid を導入するにあたり、（さまざまな制約が相まって）手間どったので備忘録。そもそも日本語による VisualEditor の解説記事はもちろん、英語ですらトラブルシューティング的な記事も少なく解決するのに時間がかかった…。

## 環境

環境としては以下の通り。実際に `wiki.jaoafa.com` で運用している MediaWiki に導入しています。この記事ではドメインを `example.com`、kusanagi のプロビジョン名を `example.com` として解説しますので、必要に応じて読み替えてください。

- CentOS 7
- MediaWiki 1.34.4
- PHP 7.2.9
- nginx
- Kusanagi

### 構成

- MediaWiki は Kusanagi のプロビジョン（複数サイト運用）から LAMP で作り、通常通り MediaWiki 自体をダウンロード・インストールしています。これらの方法に関しては解説記事がいくつかネット上にあるので省略します。
- nginx で Parsoid をリバースプロキシ設定し、ポート指定による外部からのアクセスをしません。
  - Parsoid のポートは内部通信のみに使うという解説をなされている記事もあった為、この作業が必要だったかについては不明。

### 制約

- CloudFlare によるサーバ IP アドレスの秘匿をしているので、この為に生 IP アドレス経由による Parsoid へのアクセスは不能。

## やり方

基本的な流れは以下の通り。

1. VisualEditor 導入に必須となる Parsoid をインストール・設定する。
2. nginx の設定を編集し、`/parsoid/` でリバースプロキシするように設定。(当然ほかの文字列でも ok)
3. VisualEditor をダウンロード・インストール、設定する。

実際には、**VisualEditor → nginx リバースプロキシ → Parsoid** というように通信される

### 1. Parsoid のインストール

yum や APT からインストールする方法もあるようですが、yum update とかで大量のアップデートが行われてほしくなかったことやサーバの環境を汚したくなかったのでソースコードをクローンし npm でインストールします。
ダウンロード・インストール先ディレクトリは `/var/parsoid/` とします。

```shell
cd /var/parsoid/
git clone https://github.com/wikimedia/parsoid.git .
cp config.example.yaml config.yaml
```

ここまできれば、`config.yaml` を編集すれば Parsoid の設定を行えます。`localsettings.js` を編集する方法もあるようですが、今回は `config.yaml` のみを編集します。編集箇所は以下の通り。

```yaml
uri: "http://localhost/w/api.php"
domain: "localhost" # optional
#serverPort: 8000
```

それぞれ、`uri` は `https://example.com/api.php`、`domain` に MediaWiki のインストール先ドメイン（`example.com`）を設定します。`uri` は `/parsoid/` 以外であるならそれを設定してください。`serverPort` は 8000 ポート以外にする場合はコメントを外し変更してください。ここでは 8000 ポートのまま設定します。
設定が完了したら、`node bin/server.js` で起動しておいてください。systemd への登録・常時動作化はこの時にやってもよいですし後ですべて終わってからやっても良いと思います。
起動後、動作しているかどうかの確認をしたい場合は別ターミナルから `curl http://localhost:8000` にアクセスし正常にアクセスできるかの確認ができます。

### 2. nginx の設定を編集しリバースプロキシを設定する

この記事では、Kusanagi を用いて運用しているため、`/etc/nginx/conf.d/example.com_ssl.conf` を設定します。生の nginx を設定している場合は `/etc/nginx/nginx.conf` など別のファイルを必要に応じて編集してください。 リバースプロキシの詳しい解説等は省きます。基本的には、該当ドメインの `server` ブロックの中に

```nginx
location ^~ /parsoid/ {
    proxy_pass http://127.0.0.1:8000/;
}
```

を設定します。これにより、location に `/parsoid/` が前方一致しているかをチェックし、マッチする場合は 8000 ポートにリバースプロキシ（通信を転送）します。
設定したら `nginx -t` でコンフィグにミスがないかを確認し `systemctl restart nginx` で nginx を再起動します。
これで、`https://example.com/parsoid/` で Parsoid にアクセスできるようになったはずです。ブラウザからアクセスすると `Welcome to the Parsoid web service.` と表示されます。

### 3. VisualEditor をダウンロード・インストール、設定する

まず、MediaWiki のインストール先にある `extensions` ディレクトリの中に VisualEditor をダウンロードします。
[MediaWiki の VisualEditor ダウンロードページ](https://www.mediawiki.org/wiki/Special:ExtensionDistributor/VisualEditor) にアクセスし、MediaWiki のバージョンを選び（今回は 1.34.4）ダウンロードし extensions ディレクトリにアップロードしてください。「`Continue`」を押すと「`The URL for this snapshot is:`」と URL が出てくるので、これを wget してもよいです。
ダウンロード・アップロード後、`tar xvf` で展開します。展開が完了すると、`extensions/VisualEditor/` ディレクトリが作られるはずです。
MediaWiki のインストール先にある `LocalSettings.php` に VisualEditor のロード設定とそのほか設定をします。以下の記述をします。

```php
wfLoadExtension( 'VisualEditor' );

$wgVirtualRestConfig["modules"]["parsoid"] = [
    "url" => "https://example.com/parsoid",
    "domain" => "example.com",
    "prefix" => ""
];
```

この設定をすると、`Special:Version`（`https://example.com/Special:Version`）に VisualEditor が表示されます。（エディタカテゴリの中）
これが表示されなかったり、PHP のエラーが発生する、またはアクセスしても真っ白な画面になる場合は設定に問題があると思われます。

### 4. VisualEditor を試す

適当なページの編集画面に行き、右上の鉛筆マークから「ビジュアル編集」から編集すると VisualEditor で編集できます。
