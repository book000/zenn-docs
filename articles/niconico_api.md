---
title: ニコニコAPI備忘録
emoji: 📝
type: tech
topics: ["api", "niconico"]
published: true
---

ニコニコ動画・ニコニコ生放送などの内部 API の備忘録。使用したことによるアカウント凍結などの責任は負いません。

## ニコニコ動画

[ニコニコ動画](https://nicovideo.jp/) 関連

### ニコレポ

ニコニコ動画やニコニコ生放送のレポート

#### EndPoint

- **GET** `public.api.nicovideo.jp/v1/timelines/nicorepo/last-1-month/my/pc/entries.json`

ログイン必須。(旧: `www.nicovideo.jp/api/nicorepo/timeline/my/all`)

#### 備考

この API を叩いたことがないので、具体的に何が返ってくるかはよくわからない

## ニコニ広告

[ニコニ広告](https://nicoad.nicovideo.jp/)関連

### ニコニ広告の無料福引情報を取得

別記事にて解説。[ニコニ広告の無料福引を取得する](/blog/get_nicoad_lottery/)

### ニコニ広告に関する動画情報を取得

#### EndPoint

**GET** `api.nicoad.nicovideo.jp/v1/contents/video/{VID}`

VID には `sm32684885` などの `sm` などが入った VideoID を入力。ログイン不要。

#### Parameter

無し（未特定の可能性あり）

#### Example Result

```json
{
  "meta": {
    "status": 200 // HTTPのステータスコードと同じ。
  },
  "data": {
    "id": "sm32684885", // vid
    "title": "ポプテピピックの豆知識BB", // 動画タイトル
    "targetUrl": "https://www.nicovideo.jp/watch/sm32684885", // 動画URL
    "thumbnailUrl": "https://tn.smilevideo.jp/smile?i=32684885.M", // 動画サムネイルURL
    "nonSchemeThumbnail": "//tn.smilevideo.jp/smile?i=32684885.M", // プロトコル(スキーム)無し動画サムネイルURL
    "tags": [
      // 設定されているタグ
      "アニメ",
      "ポプテピピック",
      "BB素材"
    ],
    "totalPoint": 100, // 動画に送られたすべてのニコニ広告ポイント
    "activePoint": 100, // 広告期間中ポイント数 (動画なら7日間)
    "publishable": true, // falseに出会ったことがない。広告できるかどうかとか？
    "ownerId": 41586021, // 動画投稿者のID
    "ownerName": "Tomachi", // 動画投稿者名
    "ownerIcon": "https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/4158/41586021.jpg?1497273633", // 動画投稿者アイコン
    "decoration": "normal" // 動画枠。silverとかgoldとか。
  }
}
```

### ニコニ広告をしたユーザーのリスト取得

**GET** `api.nicoad.nicovideo.jp/v1/contents/video/{VID}/thanks`

VID には `sm32684885` などの `sm` などが入った VideoID を入力。ログイン不要。

#### Parameter

- `limit`
  - `1` 〜 `2147483647` を指定可能。デフォルト値は `10`。この数値外だと `400` が返り、`1` 未満の場合は `errorCode: INVALID_PARAMETER` が、`2147483648` 以上の場合は `400` 以外に何も返らない（エラーコードもなし）

#### Example Result

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

#### 動画へのニコニ広告の履歴

GET `api.nicoad.nicovideo.jp/v1/contents/video/{VID}/histories`

VID には `sm32684885` などの `sm` などが入った VideoID を入力。ログイン不要。

#### Parameter

- `limit`
  - `1` 〜 `2147483647` を指定可能。デフォルト値は `10` 。この数値外だと `400` が返り、1 未満の場合は `errorCode: INVALID_PARAMETER` が、 `2147483648` 以上の場合は `400` 以外に何も返らない（エラーコードもなし）

#### Example Result

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
