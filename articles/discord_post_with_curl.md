---
title: curlでDiscordにBotを用いてメッセージをポストする
emoji: 💬
type: tech
topics: ["windows", "discord"]
published: true
---

少しハマったので備忘録。

## 概要

Windows 10 の「April 2018 Update (RS4)」で追加された curl を使って Discord に **Bot を使って** メッセージを送信しようとしたときに `"` と `'` を活用してエスケープを避けて実行するとハマります。
かなりの有名な話だそうで、[Qiita にも記事](https://qiita.com/tocoteron/items/291b463e45f422abd425)がありました
で、Webhook を用いたメッセージの投稿はあっても、Bot のトークンを用いたメッセージ投稿が見当たらないので記事を書いてます。

## 環境

- OS: Windows 10 1809 (Build 17763.557)（`winver` コマンドで確認）
- curl コマンドの場所: `C:\Windows\System32\curl.exe`（`where curl` コマンドで確認）
- curl のバージョン: curl 7.55.1 (Windows) libcurl/7.55.1 WinSSL（`curl --version` コマンドで確認）

## やり方

Discord の Bot トークン取得の方法は省略します。**使用可能な Bot のトークン** と **送信先のチャンネル ID** が手元にあることを前提として話を進めます。
コマンドは以下の通りです。

```shell
curl -X POST -H "Authorization: Bot <TOKEN>" -d "{\"content\":\"aaa\"}" https://discordapp.com/api/channels/<CHANNELID>/messages
```

`<TOKEN>` に Bot のトークンを、`<CHANNELID>` に送信先のチャンネル ID を置き換えて実行してください。
Linux 系（CentOS 7.6.1810 で確認）では、`"{\"content\":\"aaa\"}"` を `'{"content":"aaa"}'` に置き換えても動作します。Windows の curl では動作しません。
実行に成功すると、以下のような JSON テキストが表示されます。

```json
{"nonce": null, "attachments": [], "tts": false, "embeds": [], "timestamp": "2019-07-03T05:23:51.255000+00:00", "mention_everyone": false, "id": "595847151637233676", "pinned": false, "edited_timestamp": null, "author": {"username": "jaotan", "discriminator": "6066", "bot": true, "id": "222018383556771840", "avatar": "75b9921bc266b3c75dc25c4d52e2a2a2"}, "mention_roles": [], "content": "aaa", "channel_id": "317161193175515137", "mentions": [], "type": 0}
```
