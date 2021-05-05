---
title: MediaWiki 1.34.4にVisualEditorを導入する。
emoji: 
type: tech
topics: ["php"]
---

MediaWikiにVisualEditorとParsoidを導入するにあたり、(様々な制約が相まって)手間取ったので備忘録。そもそもVisualEditorの日本語解説記事はもちろん、英語ですらトラブルシューティング的な記事も少なく解決するのに時間がかかった…。

## 環境

環境としては以下の通り。実際に`wiki.jaoafa.com`で運用しているMediaWikiに導入しています。この記事ではドメインを`example.com`、kusanagiのプロビジョン名を`example.com`として解説しますので、必要に応じて読み替えてください。

- CentOS 7
- MediaWiki 1.34.4
- PHP 7.2.9
- Nginx
- Kusanagi

### 構成

- MediaWikiはKusanagiのプロビジョン(複数サイト運用)からLAMPで作り、通常通りMediaWiki自体をダウンロード・インストールしています。これらの方法に関しては解説記事がいくつかネット上にあるので省略します。
- NginxでParsoidをリバースプロキシ設定し、ポート指定による外部からのアクセスをしません。
  - Parsoidのポートは内部通信のみに使うという解説をなされている記事もあった為、この作業が必要だったかについては不明。

### 制約

- CloudflareによるサーバIPアドレスの秘匿をしているので、この為に生IPアドレス経由によるParsoidへのアクセスは不能。

## やり方

基本的な流れは以下の通り。

1. VisualEditor導入に必須となるParsoidをインストール・設定する。
2. Nginxの設定を編集し、`/parsoid/`でリバースプロキシするように設定。(当然他の文字列でもok)
3. VisualEditorをダウンロード・インストール、設定する。

  
実際には、**VisualEditor → Nginxリバースプロキシ → Parsoid** というように通信される

### 1. Parsoidのインストール

yumやaptからインストールする方法もあるようですが、yum updateとかで大量のアップデートが行われて欲しくなかったことやサーバの環境を汚したくなかったのでソースコードをクローンしnpmでインストールします。  
ダウンロード・インストール先ディレクトリは`/var/parsoid/`とします。

```
cd /var/parsoid/
git clone https://github.com/wikimedia/parsoid.git .
cp config.example.yaml config.yaml
```

ここまでできれば、`config.yaml`を編集すればParsoidの設定を行えます。`localsettings.js`を編集する方法もあるようですが、今回は`config.yaml`のみを編集します。編集箇所は以下の通り。

```
uri: 'http://localhost/w/api.php'
domain: 'localhost'  # optional
#serverPort: 8000
```

それぞれ、`uri`は`https://example.com/api.php`、`domain`にMediaWikiのインストール先ドメイン(`example.com`)を設定します。uriは`/parsoid/`以外であるならそれを設定してください。`serverPort`は8000ポート以外にする場合はコメントを外し変更してください。ここでは8000ポートのまま設定します。  
設定が完了したら、`node bin/server.js`で起動しておいてください。systemdへの登録・常時動作化はこの時にやってもいいですし後で全て終わってからやっても良いと思います。  
起動後、動作しているかどうかの確認をしたい場合は別ターミナルから`curl http://localhost:8000`にアクセスし正常にアクセスできるかの確認ができます。

### 2. Nginxの設定を編集しリバースプロキシを設定する。

この記事では、Kusanagiを用いて運用しているため、`/etc/nginx/conf.d/example.com_ssl.conf`を設定します。生のnginxを設定している場合は/etc/nginx/nginx.conf`など別のファイルを必要に応じて編集して下さい。  
リバースプロキシの詳しい解説等は省きます。基本的には、該当ドメインの`server`ブロックの中に

```
location ^~ /parsoid/ {
    proxy_pass http://127.0.0.1:8000/;
}
```

を設定します。これにより、locationに`/parsoid/`が前方一致しているかをチェックし、マッチする場合は8000ポートにリバースプロキシ(通信を転送)します。  
設定したら`nginx -t`でコンフィグにミスがないかを確認し`systemctl restart nginx`でnginxを再起動します。  
これで、`https://example.com/parsoid/`でParsoidにアクセス出来るようになったはずです。ブラウザからアクセスすると`Welcome to the Parsoid web service.`と表示されます。

### 3. VisualEditorをダウンロード・インストール、設定する。

まず、MediaWikiのインストール先にある `extensions`ディレクトリの中にVisualEditorをダウンロードします。  
[MediaWikiのVisualEditorダウンロードページ](https://www.mediawiki.org/wiki/Special:ExtensionDistributor/VisualEditor)にアクセスし、MediaWikiのバージョンを選び(今回は1.34.4)ダウンロードしextensionsディレクトリにアップロードしてください。「Continue」を押すと「The URL for this snapshot is:」とURLが出てくるので、これをwgetしてもいいです。  
ダウンロード・アップロード後、`tar xvf`で展開します。展開が完了すると、`extensions/VisualEditor/`ディレクトリが作られるはずです。  
MediaWikiのインストール先にある`LocalSettings.php`にVisualEditorのロード設定とその他設定を行います。以下の記述をします。

```
wfLoadExtension( 'VisualEditor' );

$wgVirtualRestConfig["modules"]["parsoid"] = [
    "url" => "https://example.com/parsoid",
    "domain" => "example.com",
    "prefix" => ""
];
```

この設定を行うと、`Special:Version`(`https://example.com/Special:Version`)にVisualEditorが表示されるようになります。(エディターカテゴリの中)  
これが表示されなかったり、PHPのエラーが発生する、またはアクセスしても真っ白な画面になる場合は設定に問題があると思われます。

### 4. VisualEditorを試す

適当なページの編集画面に行き、右上の鉛筆マーク()から「ビジュアル編集」から編集するとVisualEditorで編集できます。