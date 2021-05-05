---
title: TP-Link cloud APIを使ってみる
emoji: 
type: tech
topics: ["api"]
---

以前、Amazon Echo 第2世代を買ったときに一緒に付いてきたTP-Link(Kasa)のHS105という、スマートプラグスイッチなるものがあって、これがかなりの優れものだったので、さらに2個入りを買って現在家にこれが3つある。  
[TP-Linkの商品ページ](https://www.tp-link.com/jp/home-networking/smart-plug/hs105/)

## 何が優れているか

とりあえず、本題に入る前にこれをわざわざ追加で買ったほどの理由を書いておく

- Google Home, Amazon Echo対応
- **IFTTT対応**
- 価格の割に割と安定していて、使いやすい

まあ、この中で言えばIFTTT対応という点が無茶苦茶良い。  
IFTTTのWebhookと組み合わせてPC起動時にこたつの電源を入れる…という風に使える。

### でも「今動作しているか分からない」

Google HomeとかAmazon Echoでの口頭なら「OK Google, ライトはついてる？」と聞けば「ライトはついています」って返事が来るのだが、IFTTTは仕様上(仕方ないのだろうけど)特定動作からのオン・オフ、またはトグルしか使えない。  
  
IFTTTの「Then」でTP-Link Kasaを選択することはできないから、イベント駆動というわけにもいかない。  
そんなわけで、何か別の手段を使って「スイッチがオンになっているか」を取得する方法はないかとネットの海を探した。

## まず見つかったのはtplink-smarthome-api

まず、[plasticrake/tplink-smarthome-api](https://github.com/plasticrake/tplink-smarthome-api)というのが見つかった。  
Linux Mintの入っている自宅鯖機でCLIの機能つかって試したら、確かに動作はした。

### つける

`tplink-smarthome-api sendCommand 192.168.0.xxx:9999 '{"system":{"set_relay_state":{"state":1}}}'`

### けす

`tplink-smarthome-api sendCommand 192.168.0.xxx:9999 '{"system":{"set_relay_state":{"state":0}}}'`

### 情報を見る

`tplink-smarthome-api getInfo 192.168.0.xxx:9999`  
しかし、これはローカルでのみしか使えない。私の自宅鯖は常時つけているわけではないのでこれはNG。

## (多分)非公開のTP-Link cloud API

次に見つけたのは [How to control your TP-Link HS100 smartplug from Internet | IT Nerd Space](https://itnerd.space/2017/01/22/how-to-control-your-tp-link-hs100-smartplug-from-internet/) なる記事。  
適当に流し読みしているとネットワーク経由で操作できるようであると書いてあった。  
まあずらずら書いてても仕方ないので結論を書く

### 注意事項

このAPIは多分非公開です。最悪の場合BANなどを食らう場合があるかもしれません。  
この記事に記載されている内容を実行し、発生したいかなる問題について当サイト管理者は一切責任を負いません。自己責任でお願いします。

### API仕様

#### トークン取得

まず、トークンを入手する必要がある。上記記事ではADBのバックアップファイルから出力するとか書いてあるけど、アップデートで出来なくなっているのでAPI経由から取得するしかない。  
必要なものは「TP-Linkのアカウントメールアドレス」と「パスワード」と、適当なUUIDv4。  
UUIDv4は[Online UUID Generator](https://www.uuidgenerator.net/version4)とかから適当に取得。  
で、ターミナルから下のcurlコマンドを叩く。該当するところに当てはまるデータを埋める。(例: `"<メールアドレス>"` → `"info@example.com"`)

```
curl -X POST -H "Content-Type: application/json" -d '{"method": "login", "params": {"appType": "Kasa_Android", "cloudUserName": "<メールアドレス>", "cloudPassword": "<パスワード>", "terminalUUID": "<UUIDv4>"}}' https://wap.tplinkcloud.com/
```

返却データの「token」がトークン。  
PHPでやるなら以下。

```
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

PHPでUUIDのv4を生成する手段は [php uuid v4 generator - Google検索](https://www.google.com/search?q=php+uuid+v4+generator) あたりで。

#### デバイス一覧・簡易デバイス情報

```
curl -X POST -H "Content-Type: application/json" -d '{"method": "getDeviceList"}' https://wap.tplinkcloud.com/?token=<トークン>
```

jqとかで整えると見やすい。

```
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

`deviceList`の中の配列がそれぞれのデバイスで、その中の`deviceId`がデバイス固有のID。デバイスを操作(オン・オフ)するときはこの`deviceId`が必要になるので、メモなり変数に入れるなりする。  
この後、`<デバイスID>`と記す場合上記`deviceId`を指す。

#### 詳しいデバイス情報

`getDeviceList`でも簡単な情報は見れるけど、「今オン・オフになってるか」とか「オンになってからどのくらい経ったか」を調べるにはデバイスに対してリクエストしなければならない。  
メソッドにパススルーを設定すると、多分リクエストデータをそのままデバイスに送ってレスポンスを返すらしい。  
curlでワンライナーしようとするとここらへんからわかりにくくなるので、それなりのプログラミング言語で書いたほうが絶対的に見やすい。別にワンライナーしたいならいいけど。

```
curl -X POST -H "Content-Type: application/json" -d '{"method":"passthrough", "params": {"deviceId": "<デバイスID>", "requestData": "{\"system\":{\"get_sysinfo\":null},\"emeter\":{\"get_realtime\":null}}"}}' https://wap.tplinkcloud.com/?token=<トークン>
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

`result` -&gt; `responseData`にデバイスからの返却データが入る。この中のデータもJSONなので、さらにデコードする。

##### responseDataの中身

- `sw_ver`: デバイスのファームウェアバージョン。Kasaアプリでデバイス選んで、「端末情報」開くと同じようなデータがある。
- `hw_ver`: デバイスのハードウェアバージョン。Kasaアプリでデバイス選んで、「端末情報」開くと同じようなデータがある。
- `type`: デバイスのタイプ。`IOT.SMARTPLUGSWITCH`とか。
- `model`: モデル名。`HS105(JP)`とか。
- `mac`: MACアドレス
- `dev_name`: モデルの開発名称？`Smart Wi-Fi Plug Mini`とか。
- `alias`: ユーザーが指定する端末名。
- `relay_state`: オンかオフか。オンなら`1`、オフなら`0`
- `on_time`: オンになってから何秒経過したか。オフの場合一律`0`
- `active_mode`: `none`、`schedule`、`count_down`のいずれか。`schedule`より`count_down`のほうが優先。
- `feature`: `TIM`。よくわからない。
- `updating`: 多分アップデート中か否か。
- `icon_hash`: 不明。アイコンのハッシュ値かとおもったが私の環境では空。
- `rssi`: Wi-FiのRSSI(Received signal strength indication)値。小さいほど強い
- `led_off`: LED？スマートライトだと使えるのかも。
- `longitude_i`: 現在地点の経度
- `latitude_i`: 現在地点の緯度
- `hwId`: ハードウェアID？
- `fwID`: ファームウェアID？
- `deviceId`: デバイスID。
- `oemId`: oemのID…？
- `tid`: ？
- `err_code`: エラーコード。エラーがなければ`0`

#### デバイスをつける・けす

set\_relay\_stateの中のstateに1か0を設定する。1ならオン、0ならオフ。

```
curl -X POST -H "Content-Type: application/json" -d '{"method":"passthrough", "params": {"deviceId": "<デバイスID>", "requestData": "{\"system\":{\"set_relay_state\":{\"state\":1}}}"}}' https://wap.tplinkcloud.com/?token=<トークン>
curl -X POST -H "Content-Type: application/json" -d '{"method":"passthrough", "params": {"deviceId": "<デバイスID>", "requestData": "{\"system\":{\"set_relay_state\":{\"state\":0}}}"}}' https://wap.tplinkcloud.com/?token=<トークン>
```

上がオン、下がオフ

```
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

スイッチをつけて4時間経過したら消す。

```
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

### リージョンによるAPIサーバ

この記事で紹介しているAPIサーバはすべて`wap.tplinkcloud.com`を使っていますが、リージョンを指定してサーバを選ぶこともできます。

- USリージョン: `use1-wap.tplinkcloud.com`
- Asia Pacificリージョン: `aps1-wap.tplinkcloud.com`
- Europeリージョン: `eu-wap.tplinkcloud.com`

なお、日本で使っている場合`aps1-wap`が選択されます。その状態で`use1-wap`とかから繋ごうとしてもデバイスが見つかりません、と言われますのでご注意。

### 注意事項

繰り返して書いておきます。  
この記事に記載されている内容を実行し、発生したいかなる問題について当サイト管理者は一切責任を負いません。自己責任でお願いします。

## あとがき

実は、ちょっと前にコストコに行きました。んで、SiMPNiCの「スマート・ホーム スターターキット」とやらが売っていたので試しに買ってみましたが非常にゴミでした。  
確かにAmazon AlexaやGoogleアシスタントと連携はします。ただ、アプリはちょっと操作しただけで強制的に落ちるしプラグはさすと異音がするし、モーションセンサーは無茶苦茶ビカビカ光るし…。なんといってもそりゃ書いてないからできないのはそうなんですけど、IFTTTと連携しないってのが一番使えない部分だった…。  
まあ、そういう意味ではTP-Linkは有名どころではあるので、やはり値段がそれなりにする分いいのかもしれませんね。

## 参考サイト

- [plasticrake/tplink-smarthome-api](https://github.com/plasticrake/tplink-smarthome-api)
- [How to control your TP-Link HS100 smartplug from Internet | IT Nerd Space](https://itnerd.space/2017/01/22/how-to-control-your-tp-link-hs100-smartplug-from-internet/)
- [TP-Link スマートコンセントHS-105をAPIから操作（１）– LM Labo](https://lmjs7.net/blog/gadget10252018/)

よくよく調べてみたらnpmにAPIのライブラリまで落ちてますね。

- [tplink-cloud-api - npm](https://www.npmjs.com/package/tplink-cloud-api)