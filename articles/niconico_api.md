---
title: ニコニコAPI備忘録
emoji: 📝
type: tech
topics: ["api", "niconico"]
published: true
---

ニコニコ動画・ニコニコ生放送などの内部 API の備忘録。エンドポイントのプロトコルはすべて HTTPS。

## 注意

**この記事では、公開されていない API を使用しています。そのため、予告なく API が使用できなくなったり、アカウントが停止される可能性が大いにあります。使用する際は自己責任でお願いします。何か問題が発生しても執筆者は責任を一切負いません。**  
ニコニコのサーバに負荷を掛けるようなリクエストはやめましょう。本社が爆破されるんじゃなくてあなたが爆破されてしまう恐れがありますよ。

使ったことのあるエンドポイントしか書いていない上に、継続して使っていないエンドポイント（ニコニ広告とか）は変更があっても更新抜けがあるかも。  
もしよければページ下部の `GitHub で編集を提案` から Pull Request を投げていただけると非常に助かります。

---

各エンドポイントの `Parameters` セクションで表記する `Type` は以下の意味を示しています。

- `Path`: URL パスパラメータ。エンドポイント内で `#{KEY}` として表記
- `Query`: URL クエリパラメータ
- `Form`: フォームパラメータ。`Content-Type: application/x-www-form-urlencoded` でリクエストすること
- `JSON`: JSON リクエストボディパラメータ。`Content-Type: application/json` でリクエストすること

## 全体

### ニコニコ関連へのログイン

- **POST** `secure.nicovideo.jp/secure/login`

`Content-Type: application/x-www-form-urlencoded` でリクエストすること。

#### Parameters

| Required | Type  | Key        | Description            | Notes                                                                                                                                         |
| :------: | ----- | ---------- | ---------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- |
|          | Query | `site`     | ログイン対象サイト     | ニコニコ動画であれば `niconico`, ニコニコ静画であれば `seiga`, ニコニコ生放送であれば `nicolive` だが、返ってくるユーザーセッション自体は共通 |
|          | Form  | `next_url` | ログイン後の遷移先パス | スラッシュ以降のパス。ドメインは `site` クエリに基づく                                                                                        |
|    ✅    | Form  | `mail`     | メールアドレス         |                                                                                                                                               |
|    ✅    | Form  | `password` | パスワード             |                                                                                                                                               |

`site` を指定しない場合、リダイレクト先のドメインは `secure.nicovideo.jp` になる。

#### Response

ログインに成功しても失敗しても `302 Found` が返る。  
ログインに失敗したかどうかの判定はリダイレクト先を示す `Location` レスポンスヘッダに `message=cant_login` が入っているかどうかで判断。

ログイン状態を継続するためには、`Set-Cookie` レスポンスヘッダの `user_session` キーの値を保持してリクエストの Cookie として付与すること。`user_session` は `Set-Cookie` レスポンスヘッダで 2 回現れる（1 回目は `user_session=deleted`）ので、2 度目の値を保持すること。

## ニコニコ動画

[ニコニコ動画](https://www.nicovideo.jp) 関連。

### ニコレポ

ニコニコ動画やニコニコ生放送のレポート。

#### EndPoint

- **GET** `public.api.nicovideo.jp/v1/timelines/nicorepo/last-1-month/my/pc/entries.json`

ログイン必須。(旧: `www.nicovideo.jp/api/nicorepo/timeline/my/all`)  
よくわかっていないが、`last-1-month` を `last-6-months` に変えることで過去 6 ヵ月とかスパンを変えられるらしい…？

#### Parameters

| Required | Type  | Key            | Description           | Notes                                                                      |
| :------: | ----- | -------------- | --------------------- | :------------------------------------------------------------------------- |
|          | Query | `object[type]` | メイン種別            | 動画、生放送などの種別                                                     |
|          | Query | `type`         | サブ種別              | メイン種別のうち、動画だったらアップロードとか生放送だったら生放送開始とか |
|          | Query | `list`         | 表示対象              |                                                                            |
|          | Query | `untilId`      | ページネーション用 ID | 前回のレスポンスの `.meta.minId` を指定                                    |

`object[type]` と `type` に入る値は以下のとおり。

| Name             | `object[type]` | `type`      |
| ---------------- | -------------- | ----------- |
| **すべて**       | _undefined_    | _undefined_ |
| **動画投稿**     | `video`        | `upload`    |
| **生放送開始**   | `program`      | `onair`     |
| **イラスト投稿** | `image`        | `add`       |
| **マンガ投稿**   | `comicStory`   | `add`       |
| **記事投稿**     | `article`      | `add`       |
| **ゲーム投稿**   | `game`         | `add`       |

`list` に入る値は以下のとおり。

| Name         | `list`               |
| ------------ | -------------------- |
| すべて       | _undefined_          |
| 自分         | `self`               |
| ユーザー     | `followingUser`      |
| チャンネル   | `followingChannel`   |
| コミュニティ | `followingCommunity` |
| マイリスト   | `followingMylist`    |

## ニコニコ生放送

### 予約中タイムシフト一覧

- **GET** `live.nicovideo.jp/embed/timeshift-reservations`

#### Parameters

パラメータなし。

#### Response

HTML で返却されるが、`script#embedded-data` の `data-props` の値を JSON としてパースするとスクレイピングせずともデータを取得できる。
キー `reservations` のデータを拾えばよい。TypeScript での型定義は [このへん](https://github.com/tomacheese/niconico-timeshift/blob/16b37076e892495b57d53088a470a085cdada9e1/register/src/model/timeshift-reservations.ts#L448) を参照。

#### Notes

以前は `live.nicovideo.jp/api/watchingreservation` というエンドポイントがあったのだが、2022 年 11 月 24 日に削除。公式としての移行先なし。ニコ生ワークショップ Slack で告知があった。

### タイムシフト予約

- **POST** `live2.nicovideo.jp/api/v2/programs/#{programId}/timeshift/reservation`

#### Parameters

| Required | Type | Key         | Description              | Notes |
| :------: | ---- | ----------- | ------------------------ | :---- |
|    ✅    | Path | `programId` | `lv` から始まる生放送 ID |       |

#### Response

正常に予約できた場合は `200 OK`  
レスポンスに含まれる `.data.expiryTime` はタイムシフトの視聴期限日時。

```json
{
  "meta": {
    "status": 200
  },
  "data": {
    "expiryTime": "2023-01-31T00:00:00+09:00"
  }
}
```

対象の生放送が存在しない場合は `404 Not Found`

```json
{
  "meta": {
    "status": 404,
    "errorCode": "PROGRAM_NOT_FOUND"
  }
}
```

すでにタイムシフト予約の期限を過ぎている場合など、権利がない場合は `403 Forbidden`

```json
{
  "meta": {
    "status": 403,
    "errorCode": "EXPIRED_GENERAL"
  },
  "data": {
    "expiryTime": "2023-01-20T00:00:00+09:00"
  }
}
```

### タイムシフト削除

- **DELETE** `live2.nicovideo.jp/api/v2/timeshift/reservations`

#### Parameters

| Required | Type  | Key          | Description                                          | Notes |
| :------: | ----- | ------------ | ---------------------------------------------------- | :---- |
|    ✅    | Query | `programIds` | `lv` から始まる生放送 ID。カンマ区切りで複数指定可能 |       |

### Response

対象の生放送を予約していてもいなくても `200 OK`。なんなら対象の生放送が存在しなくても `200 OK`

## ニコニ広告

[ニコニ広告](https://nicoad.nicovideo.jp/) 関連。

### ニコニ広告の無料福引情報を取得

別記事にて解説。[ニコニ広告の無料福引を取得する](https://zenn.dev/book000/articles/get_nicoad_lottery)

### ニコニ広告に関する動画情報を取得

#### EndPoint

- **GET** `api.nicoad.nicovideo.jp/v1/contents/video/{VID}`

VID には `sm32684885` などの `sm` などが入った VideoID を入力。ログイン不要。

#### Parameter

無し（未特定の可能性あり）

#### Response

```json
{
  "meta": {
    "status": 200 // HTTPのステータスコードと同じ。
  },
  "data": {
    "id": "sm32684885", // vid
    "title": "ポプテピピックの豆知識BB", // 動画タイトル
    "targetUrl": "https://www.nicovideo.jp/watch/sm32684885", // 動画URL
    "thumbnailUrl": "https://nicovideo.cdn.nimg.jp/thumbnails/32684885/32684885.M", // 動画サムネイルURL
    "nonSchemeThumbnail": "//nicovideo.cdn.nimg.jp/thumbnails/32684885/32684885.M", // プロトコル(スキーム)無し動画サムネイルURL
    "tags": ["アニメ", "ポプテピピック", "BB素材"], // 設定されているタグ
    "lockTags": ["アニメ", "ポプテピピック", "BB素材"], // 投稿者によってロックされているタグ
    "totalPoint": 100, // 動画に送られたすべてのニコニ広告ポイント
    "activePoint": 0, // 広告期間中ポイント数 (動画なら7日間)
    "publishable": true, // ?
    "publishButtonVisible": true, // ?
    "publishingStatus": {
      "instream": "available" // ?
    },
    "ownerId": 41586021, // 動画投稿者のID
    "ownerName": "Tomachi", // 動画投稿者名
    "ownerIcon": "https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/4158/41586021.jpg?1497273633", // 動画投稿者アイコン
    "decoration": "normal", // 動画枠。silverとかgoldとか。
    "genre": {
      // 動画のジャンル
      "key": "anime",
      "label": "アニメ"
    }
  }
}
```

### ニコニ広告をしたユーザーのリスト取得

- **GET** `api.nicoad.nicovideo.jp/v1/contents/video/#{vid}/thanks`

#### Parameters

| Required | Type  | Key     | Description        | Notes                                                                                                                                                                                                          |
| :------: | ----- | ------- | ------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|    ✅    | Path  | `vid`   | 動画 ID            |                                                                                                                                                                                                                |
|          | Query | `limit` | 返却するユーザー数 | `1` 〜 `2147483647` を指定可能。デフォルト値は `10`。この数値外だと `400` が返り、`1` 未満の場合は `errorCode: INVALID_PARAMETER` が、`2147483648` 以上の場合は `400` 以外に何も返らない（エラーコードもなし） |

#### Response

```json
{
  "meta": {
    "status": 200 // HTTPのステータスコードと同じ
  },
  "data": {
    "sponsors": [
      {
        "userId": 41586021, // 広告者ユーザーID
        "advertiserName": "Tomachi", // 広告者名
        "message": "メッセージ", // 広告メッセージ
        "contribution": 100, // 広告貢数 (投入ポイント数とは異なる？)
        "auxiliary": {
          "bgColor": "#FFC100" // 指定した背景色
        }
      }
    ]
  }
}
```

広告期間内の広告がない場合は `404 Not Found` が返る。

### 動画へのニコニ広告の履歴

GET `api.nicoad.nicovideo.jp/v1/contents/video/#{vid}/histories`

#### Parameter

| Required | Type  | Key     | Description        | Notes                                                                                                                                                                                                          |
| :------: | ----- | ------- | ------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|    ✅    | Path  | `vid`   | 動画 ID            |                                                                                                                                                                                                                |
|          | Query | `limit` | 返却するユーザー数 | `1` 〜 `2147483647` を指定可能。デフォルト値は `10`。この数値外だと `400` が返り、`1` 未満の場合は `errorCode: INVALID_PARAMETER` が、`2147483648` 以上の場合は `400` 以外に何も返らない（エラーコードもなし） |

#### Response

```json
{
  "meta": {
    "status": 200 // HTTPのステータスコードと同じ
  },
  "data": {
    "count": 1, // データ数
    "serverTime": 1547405280, // ニコニコのサーバの時刻(Unixtime)
    "histories": [
      {
        "advertiserName": "Tomachi", // 広告者名
        "nicoadId": 27222283, // ニコニ広告のID
        "message": "メッセージ", // 広告メッセージ
        "adPoint": 100, // 投入ポイント
        "contribution": 100, // 広告貢数
        "startedAt": 1547404266, // 広告開始時刻
        "endedAt": 1548009066, // 広告有効期限
        "userId": 41586021 // 広告者ユーザーID
      }
    ]
  }
}
```
