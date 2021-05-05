---
title: curlでDiscordにBotを用いてメッセージをポストする
emoji: 
type: tech
topics: ["windows","discord"]
---

少しハマったので備忘録。

## 概要

Windows 10の「April 2018 Update (RS4)」で追加されたcurlを使ってDiscordに**Botを使って**メッセージを送信しようとしたときに`"`と`'`を活用してエスケープを避けて実行するとハマります。  
かなりの有名な話だそうで、[Qiitaにも記事](https://qiita.com/ida1ten0/items/291b463e45f422abd425)がありました  
で、Webhookを用いたメッセージの投稿はあっても、Botのトークンを用いたメッセージ投稿が見当たらないので記事を書いてます。

## 環境

- OS: Windows 10 1809 (Build 17763.557)
- (`winver`コマンドで確認)
- curlコマンドの場所: `C:\Windows\System32\curl.exe`
- (`where curl`コマンドで確認)
- curlのバージョン: curl 7.55.1 (Windows) libcurl/7.55.1 WinSSL
- (`curl --version`コマンドで確認)

## やり方

DiscordのBotトークン取得の方法は省略します。**使用可能なBotのトークン**と**送信先のチャンネルID**が手元にあることを前提として話を進めます。  
コマンドは以下の通りです。

```
curl -X POST -H "Authorization: Bot <TOKEN>" -d "{\"content\":\"aaa\"}" https://discordapp.com/api/channels/<CHANNELID>/messages
```

`<TOKEN>`にBotのトークンを、`<CHANNELID>`に送信先のチャンネルIDを置き換えて実行してください。  
Linux系(CentOS 7.6.1810で確認)では、`"{\"content\":\"aaa\"}"`を`'{"content":"aaa"}'`に置き換えても動作します。Windowsのcurlでは動作しません。  
実行に成功すると、以下のようなテキストが表示されます。

```
{"nonce": null, "attachments": [], "tts": false, "embeds": [], "timestamp": "2019-07-03T05:23:51.255000+00:00", "mention_everyone": false, "id": "595847151637233676", "pinned": false, "edited_timestamp": null, "author": {"username": "jaotan", "discriminator": "6066", "bot": true, "id": "222018383556771840", "avatar": "75b9921bc266b3c75dc25c4d52e2a2a2"}, "mention_roles": [], "content": "aaa", "channel_id": "317161193175515137", "mentions": [], "type": 0}
```