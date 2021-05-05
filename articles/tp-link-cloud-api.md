---
title: TP-Link cloud APIを使ってみる
emoji: 🕹️
type: tech
topics: ["api", "tplink"]
---

以前、Amazon Echo 第 2 世代を買ったときに一緒に付いてきた TP-Link(Kasa)の HS105 という、スマートプラグスイッチなるものがあって、これがかなりの優れものだったので、さらに 2 個入りを買って現在家にこれが 3 つある。
[TP-Link の商品ページ](https://www.tp-link.com/jp/home-networking/smart-plug/hs105/)

## 何が優れているか

とりあえず、本題に入る前にこれをわざわざ追加で買ったほどの理由を書いておく

- Google Home, Amazon Echo 対応
- **IFTTT 対応**
- 価格の割に割と安定していて、使いやすい

まあ、この中で言えば IFTTT 対応という点が無茶苦茶良い。
IFTTT の Webhook と組み合わせて PC 起動時にこたつの電源を入れる…という風に使える。

### でも「今動作しているか分からない」

Google Home とか Amazon Echo での口頭なら「OK Google, ライトはついている？」と聞けば「ライトはついています」って返事が来るのだが、IFTTT は仕様上（しかたないのだろうけど）特定動作からのオン／オフ、またはトグルしか使えない。

IFTTT の「Then」で TP-Link Kasa を選択できないので、イベント駆動というわけにもいかない。
そんなわけで、何か別の手段を使って「スイッチがオンになっているか」を取得する方法はないかとネットの海を探した。

## まず見つかったのは tplink-smarthome-api

まず、[plasticrake/tplink-smarthome-api](https://github.com/plasticrake/tplink-smarthome-api)というのが見つかった。
Linux Mint の入っている自宅鯖機で CLI の機能つかって試したら、たしかに動作はした。

### つける

`tplink-smarthome-api sendCommand 192.168.0.xxx:9999 '{"system":{"set_relay_state":{"state":1}}}'`

### けす

`tplink-smarthome-api sendCommand 192.168.0.xxx:9999 '{"system":{"set_relay_state":{"state":0}}}'`

### 情報を見る

`tplink-smarthome-api getInfo 192.168.0.xxx:9999`
しかし、これはローカルでのみしか使えない。私の自宅鯖は常時つけているわけではないのでこれは NG。

## (多分）非公開の TP-Link cloud API

次にみつけたのは [How to control your TP-Link HS100 smartplug from Internet | IT Nerd Space](https://itnerd.space/2017/01/22/how-to-control-your-tp-link-hs100-smartplug-from-internet/) なる記事。
適当に流し読みしているとネットワーク経由で操作できるようであると書いてあった。
まあずらずら書いてもしかたないので結論を書く

### 注意事項

この API は多分非公開です。最悪の場合 BAN などを食らう場合があるかもしれません。
この記事に記載されている内容を実行し、発生したいかなる問題について執筆者は一切責任を負いません。自己責任でお願いします。

### API 仕様

#### トークン取得

まず、トークンを入手する必要がある。上記記事では ADB のバックアップファイルから出力するとか書いてあるけど、アップデートによってできなくなっているので API 経由から取得するしかない。
必要なものは「TP-Link のアカウントメールアドレス」と「パスワード」と、適当な UUIDv4。
UUIDv4 は [Online UUID Generator](https://www.uuidgenerator.net/version4) とかから適当に取得。
で、ターミナルから下の curl コマンドをたたく。該当するところに当てはまるデータを埋める。(例: `"<メールアドレス>"` → `"info@example.com"`)

```shell
curl -X POST -H "Content-Type: application/json" -d '{"method": "login", "params": {"appType": "Kasa_Android", "cloudUserName": "<メールアドレス>", "cloudPassword": "<パスワード>", "terminalUUID": "<UUIDv4>"}}' https://wap.tplinkcloud.com/
```

返却データの「token」がトークン。
PHP でやるなら以下。

```php
function getToken($mail_address, $password, $uuid){
    $data = [
        "method" => "login",
        "params" => [
            "appType" => "Kasa_Android",
            "cloudUserName" => $mail_address,
            "cloudPassword" => $password,
            "terminalUUID" => $uuid
        ]
    ];
    $data = json_encode($data);
    $options = [
        "http" => [
            "method"=> "POST",
            "header"=> "Content-Type: application/json",
            "content" => $data,
            "ignore_errors" => true
        ]
    ];
    $context = stream_context_create($options);
    $contents = file_get_contents("https://wap.tplinkcloud.com", false, $context);
    $res = json_decode($contents, true);
    if($res["error_code"] != 0){
        echo "ERROR: ";
        print_r($res);
        return null;
    }
    return $res["result"]["token"];
}
$uuid = generateUUIDv4();
$token = getToken("<メールアドレス>", "<パスワード>", $uuid);
```

PHP で UUID の v4 を生成する手段は [php uuid v4 generator - Google 検索](https://www.google.com/search?q=php+uuid+v4+generator) あたりで。

#### デバイス一覧・簡易デバイス情報

```shell
curl -X POST -H "Content-Type: application/json" -d '{"method": "getDeviceList"}' https://wap.tplinkcloud.com/?token=<トークン>
```

jq とかで整えると見やすい。

```php
function getDeviceList($token){
    $data = [
        "method" => "getDeviceList"
    ];
    $data = json_encode($data);
    $options = [
        "http" => [
            "method"=> "POST",
            "header"=> "Content-Type: application/json",
            "content" => $data,
            "ignore_errors" => true
        ]
    ];
    $context = stream_context_create($options);
    $contents = file_get_contents("https://wap.tplinkcloud.com/?token=" . $token, false, $context);
    $res = json_decode($contents, true);
    if($res["error_code"] != 0){
        echo "ERROR: ";
        print_r($res);
        return -1;
    }
    return $res;
}
print_r(getDeviceList("<トークン>"));
```

`deviceList` の中の配列がそれぞれのデバイスで、その中の `deviceId` がデバイス固有の ID。デバイスを操作（オン／オフ）するときはこの `deviceId` が必要になるので、メモなり変数に入れるなりする。
この後、`<デバイスID>` と記す場合上記 `deviceId` を指す。

#### 詳しいデバイス情報

`getDeviceList` でも簡単な情報は見られるけど、「今オン／オフになっているか」とか「オンになってからどのくらい経ったか」を調べるにはデバイスに対してリクエストしなければならない。
メソッドにパススルーを設定すると、多分リクエストデータをそのままデバイスに送ってレスポンスを返すらしい。
curl でワンライナーしようとするとここらへんからわかりにくくなるので、それなりのプログラミング言語で書いたほうが絶対的に見やすい。別にワンライナーしたいならよいけど。

```shell
curl -X POST -H "Content-Type: application/json" -d '{"method":"passthrough", "params": {"deviceId": "<デバイスID>", "requestData": "{\"system\":{\"get_sysinfo\":null},\"emeter\":{\"get_realtime\":null}}"}}' https://wap.tplinkcloud.com/?token=<トークン>
```

```php
function getSysInfo($token, $deviceID){
    $requestData = [
        "system" => [
            "get_sysinfo" => null,
            "emeter" => [
                "get_realtime" => null
            ]
        ]
    ];
    $requestData = json_encode($requestData);
    $data = [
        "method" => "passthrough",
        "params" => [
            "deviceId" => $deviceID,
            "requestData" => $requestData
        ]
    ];
    $data = json_encode($data);
    $options = [
        "http" => [
            "method"=> "POST",
            "header"=> "Content-Type: application/json",
            "content" => $data,
            "ignore_errors" => true
        ]
    ];
    $context = stream_context_create($options);
    $contents = file_get_contents("https://wap.tplinkcloud.com/?token=" . $token, false, $context);
    $res = json_decode($contents, true);
    if($res["error_code"] != 0){
        echo "ERROR: ";
        print_r($res);
        return -1;
    }
    return $res;
}
print_r(getSysInfo("<トークン>", "<デバイスID>"));
```

`result` -&gt; `responseData` にデバイスからの返却データが入る。この中のデータも JSON ですので、さらにデコードする。

##### responseData の中身

- `sw_ver`: デバイスのファームウェアバージョン。Kasa アプリケーションでデバイス選んで、「端末情報」開くと同じようなデータがある。
- `hw_ver`: デバイスのハードウェアバージョン。Kasa アプリケーションでデバイス選んで、「端末情報」開くと同じようなデータがある。
- `type`: デバイスのタイプ。`IOT.SMARTPLUGSWITCH` とか。
- `model`: モデル名。`HS105(JP)` とか。
- `mac`: MAC アドレス
- `dev_name`: モデルの開発名称？`Smart Wi-Fi Plug Mini` とか。
- `alias`: ユーザーが指定する端末名。
- `relay_state`: オンかオフか。オンなら `1`、オフなら `0`
- `on_time`: オンになってから何秒経過したか。オフの場合一律 `0`
- `active_mode`: `none`、`schedule`、`count_down` のいずれか。`schedule` より `count_down` のほうが優先。
- `feature`: `TIM`。よくわからない。
- `updating`: 多分アップデート中か否か。
- `icon_hash`: 不明。アイコンのハッシュ値かと思ったが私の環境では空。
- `rssi`: Wi-Fi の RSSI(Received signal strength indication)値。小さいほど強い
- `led_off`: LED？スマートライトだと使えるのかも。
- `longitude_i`: 現在地点の経度
- `latitude_i`: 現在地点の緯度
- `hwId`: ハードウェア ID？
- `fwID`: ファームウェア ID？
- `deviceId`: デバイス ID。
- `oemId`: oem の ID…？
- `tid`: ？
- `err_code`: エラーコード。エラーがなければ `0`

#### デバイスをつける・けす

set_relay_state の中の state に 1 か 0 を設定する。1 ならオン、0 ならオフ。

```shell
curl -X POST -H "Content-Type: application/json" -d '{"method":"passthrough", "params": {"deviceId": "<デバイスID>", "requestData": "{\"system\":{\"set_relay_state\":{\"state\":1}}}"}}' https://wap.tplinkcloud.com/?token=<トークン>
curl -X POST -H "Content-Type: application/json" -d '{"method":"passthrough", "params": {"deviceId": "<デバイスID>", "requestData": "{\"system\":{\"set_relay_state\":{\"state\":0}}}"}}' https://wap.tplinkcloud.com/?token=<トークン>
```

上がオン、下がオフ

```php
function changeState($token, $deviceID, $state){ // state = 1 or 0
    $requestData = [
        "system" => [
            "set_relay_state" => [
                "state" => $state
            ]
        ]
    ];
    $requestData = json_encode($requestData);
    $data = [
        "method" => "passthrough",
        "params" => [
            "deviceId" => $deviceID,
            "requestData" => $requestData
        ]
    ];
    $data = json_encode($data);
    $options = [
        "http" => [
            "method"=> "POST",
            "header"=> "Content-Type: application/json",
            "content" => $data,
            "ignore_errors" => true
        ]
    ];
    $context = stream_context_create($options);
    $contents = file_get_contents("https://wap.tplinkcloud.com/?token=" . $token, false, $context);
    $res = json_decode($contents, true);
    if($res["error_code"] != 0){
        echo "ERROR: ";
        print_r($res);
        return -1;
    }
    return $res;
}
changeState("<トークン>", "<デバイスID>", 1); // オン
changeState("<トークン>", "<デバイスID>", 0); // オフ
```

### 応用

スイッチをつけて 4 時間経過したら消す。

```php
$mail_address = "<メールアドレス>";
$password = "<パスワード>";
$deviceID = "<デバイスID>";
$uuid = "<適当なUUIDv4>";

// トークンはTP-LINK_KASA_TOKEN.datに保存しておく

if(file_exists(__DIR__ . "/TP-LINK_KASA_TOKEN.dat")){
    $token = file_get_contents(__DIR__ . "/TP-LINK_KASA_TOKEN.dat");
}else{
    $token = login($mail_address, $password, $uuid);
    if($token == null){
        exit("ERROR");
    }
    file_put_contents(__DIR__ . "/TP-LINK_KASA_TOKEN.dat", $token);
}
$info = getSysInfo($token, $deviceID);
if($info == -1){
    // 取得できなかったらトークン取得しなおして再チャレンジ
    $token = login($mail_address, $password, $uuid);
    if($token == null){
        exit("ERROR");
    }
    file_put_contents(__DIR__ . "/TP-LINK_KASA_TOKEN.dat", $token);
    $info = getSysInfo($token, $deviceID);
}
$sys_info = json_decode($info["result"]["responseData"], true)["system"]["get_sysinfo"];
$relay_state = $sys_info["relay_state"];
$on_time = $sys_info["on_time"];

if($relay_state === 1 && $on_time >= 60 * 60 * 4){ // 4 hours
    changeState($token, $deviceID, 0);
}
```

### リージョンによる API サーバ

この記事で紹介している API サーバはすべて `wap.tplinkcloud.com` を使っていますが、リージョンを指定してサーバを選ぶこともできます。

- US リージョン: `use1-wap.tplinkcloud.com`
- Asia Pacific リージョン: `aps1-wap.tplinkcloud.com`
- Europe リージョン: `eu-wap.tplinkcloud.com`

なお、日本で使っている場合 `aps1-wap` が選択されます。その状態で `use1-wap` とかからつなごうとしてもデバイスが見つかりません、と言われますのでご注意。

### 注意事項

繰り返して書いておきます。
この記事に記載されている内容を実行し、発生したいかなる問題について執筆者は一切責任を負いません。自己責任でお願いします。

## あとがき

実は、ちょっと前にコストコにいきました。んで、SiMPNiC の「スマート・ホーム スターターキット」とやらが売っていたので試しに買ってみましたが非常にゴミでした。
たしかに Amazon Alexa や Google アシスタントと連携はします。ただ、アプリケーションはちょっと操作しただけで強制的に落ちるしプラグはさすと異音がするし、モーションセンサは無茶苦茶ビカビカ光るし…。なんといってもそりゃ書いてないからできないのはそうなんですけど、IFTTT と連携しないってのが一番使えない部分だった…。
まあ、そういう意味では TP-Link は有名どころではあるので、やはり値段がそれなりにする分よいのかもしれませんね。

## 参考サイト

- [plasticrake/tplink-smarthome-api](https://github.com/plasticrake/tplink-smarthome-api)
- [How to control your TP-Link HS100 smartplug from Internet | IT Nerd Space](https://itnerd.space/2017/01/22/how-to-control-your-tp-link-hs100-smartplug-from-internet/)
- [TP-Link スマートコンセント HS-105 を API から操作（１）– LM Labo](https://lmjs7.net/blog/gadget10252018/)

よく調べてみたら npm に API のライブラリまで落ちてますね。

- [tplink-cloud-api - npm](https://www.npmjs.com/package/tplink-cloud-api)
