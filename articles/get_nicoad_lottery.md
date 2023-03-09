---
title: ニコニ広告の無料福引を取得する
emoji: 🎈
type: tech
topics: ["api", "php", "niconico"]
published: true
---

ニコニコ動画へ投稿された動画に広告を設定できる [ニコニ広告](https://nicoad.nicovideo.jp) ですが、いちいち毎日無料で回せる福引を確認しに行くことが面倒だったので、通信コンソールを見ながら API を見つけてきたので備忘録です。

## 注意

**この記事では、公開されていない API を使用しています。そのため、予告なく API が使用できなくなったり、アカウントが停止される可能性が大いにあります。使用する際は自己責任でお願いします。何か問題が発生しても執筆者は責任を一切負いません。**  
また不正にキャンペーンに参加する行為は禁止となっています。この記事で解説する内容はあくまで開催されているキャンペーンを取得するだけなので問題はないと思いますが、応用的に自動で福引を回すような動作をさせるのはやめましょう。API に連続して接続し、ニコニコ側に負荷をかける行為も絶対にやめましょう。

## 目次

## API EndPoint

さっそく、API のエンドポイントを記載しておきます。ログインが必要なので後述する方法などを用いてログインしてください。

**GET** `https://api.nicoad.nicovideo.jp/v1/conductors?conductorFrameId=6`

## 実践

今回は、以下のような流れで通知するシステムを構築します。
言語は `PHP` を使用しますが、難しいシステムではないのである程度の知識があれば移植も簡単にできると思います。

1. ニコニコにログインします。
2. API を使用して現在実施されている福引のリストを取得します。
3. API で取得したデータから、URL を取り出し接続・取得後、スクレイピングで必要な情報を取り出します。
4. Slack や Discord を通じて通知します。

### 1. ニコニコにログイン

今回は [私が自作した niconico クラス](https://github.com/book000/etc/blob/master/niconico.class.php) を使用して、ログイン作業をします。
以下のようなプログラムを書き、ログイン作業をしましょう。

```php
<?php
require_once("niconico.class.php"); // niconicoクラスをロード

try{
   $niconico = new niconico("MAIL_ADDRESS", "PASSWORD"); // ログイン
}catch(Exception $e){
   exit("Error: " . $e->getMessage()); // ログインに失敗したら終了
}
```

### 2. 現在実施されている福引のリストを取得

上記で書いた API のエンドポイントを使用して、福引のリストを取得しましょう。

```php
$conductors = $niconico->getJSON("https://api.nicoad.nicovideo.jp/v1/conductors?conductorFrameId=6"); // JSON形式でAPIを叩く
if($conductors["meta"]["status"] != 200){ // ステータスが200でなければ
   exit("取得に失敗しました。"); // 処理を終了
}
```

取得してきたデータは以下のようになります。

```json
{
  "meta": {
    "status": 200
  },
  "data": {
    "conductors": [
      {
        "bannerImageUrl": "https://secure-dcdn.cdn.nimg.jp/nicoad/res/conductors/free_beginner.png",
        "text": "null",
        "url": "http://blog.nicovideo.jp/niconews/69156.html"
      },
      {
        "bannerImageUrl": "https://secure-dcdn.cdn.nimg.jp/nicoad/res/conductors/free_jackpot_chance_1805.png",
        "text": "null",
        "url": "http://blog.nicovideo.jp/niconews/74511.html"
      },
      {
        "bannerImageUrl": "https://secure-dcdn.cdn.nimg.jp/nicoad/res/conductors/nicoad_month_end_201805.png",
        "text": "null",
        "url": "http://blog.nicovideo.jp/niconews/74510.html"
      }
    ]
  }
}
```

### 3. データから必要な情報を取り出す

配列分繰り返す中で、福引のニコニコインフォページの URL が `["data"]["conductors"][*]["url"]` で取得できるので、取得しタイトルなどを接続・取得しましょう。

```php
<?php
require_once("DiscordEmbed.class.php"); // DiscordEmbedクラスをロード

function getInnerHtml($node)
{
    $children = $node->childNodes;
    $html = '';
    foreach ($children as $child) {
        $html .= $node->ownerDocument->saveHTML($child);
    }
    return $html;
}

function br2nl($string)
{
    return preg_replace('/<br[[:space:]]*\/?[[:space:]]*>/i', "\n", $string);
}

foreach ($conductors["data"]["conductors"] as $i => $conductor) { // 福引のイベント数分繰り返す(①)
    $url = $conductor["url"];
    $data = file_get_contents($url); // URLから接続します。
    preg_match("/<title>([^<]++)<\/title>/i", $data, $m); // タイトルをスクレイピング
    $title = $m[1]; // タイトルがなかった場合の処置をしていませんが、本来はisset($m[1])やcount($m)などでチェックすべきでしょう。
    $title = str_replace("|ニコニコインフォ", "", $title); // 無駄な「|ニコニコインフォ」というテキストを消してしまいます。


    $dom = new DOMDocument(); // PHP5あたりからあるDOMDocumentを使用します。
    @$dom->loadHTML($html); // HTMLをロード。何かHTML構文が間違ってるだけでエラー吐くので@を使用して抑制します。
    $xpath = new DOMXPath($dom); // スクレイピングできるようにします。
    $content = $xpath->query('//*[@class="article-body"]')->item(0); // classがarticle-bodyという要素を取得します。
    $content = getInnerHtml($content); // 要素のHTMLを取得します。
    $content = br2nl($content); // brタグを改行に変換します。
    $content = strip_tags($content); // HTMLタグを削除します。

    preg_match("/ニコニ広告(.+)実施します。/", $content, $enforcement); // おおざっぱな実施内容を取得
    $enforcement = $enforcement[0]; // タイトル同様本来は存在しなかった場合の処置をすべき

    preg_match("/キャンペーン内容([\s\S]+?)　/", $content, $campaign); // 詳しいキャンペーン内容を取得
    $campaign = $campaign[1]; // タイトル同様本来は存在しなかった場合の処置をすべき

    // ここまで取得したデータをお好きなように加工
} // ①に戻る
```

### 4. 各種サービスを使って通知する

Discord や Slack などを使って、通知するようにプログラミングしてください。

## 結果

![](https://storage.googleapis.com/zenn-user-upload/6u4y5xyn5ol7x3yluuql1l2nlkjv)

画像のような形で通知されます。crontab 等で毎日動作させるとよいでしょう。なお、00:00 に実行すると前日の情報を取得してくるようなので、ちょっと遅らせて取得したほうが良いと思います。
