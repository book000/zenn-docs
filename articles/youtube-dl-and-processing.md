---
title: YouTubeから音楽をダウンロードしてスマホに転送するアプリの知見まとめ
emoji: 👥
type: tech
topics: ["youtube", "ytdlp", "mp3tag", "lastfm", "foldersync"]
published: true
---

YouTube に上がっている「歌ってみた」や、YouTube Music の音楽をスマホにダウンロードして聞きたいなあという需要があった。  
さらに、Mp3tag をつけたりアートワークを付けたり音量調整したりを自動でやる機能を加えたアプリケーション [tomacheese/fetch-youtube-bgm](https://github.com/tomacheese/fetch-youtube-bgm) を作ったので、もろもろの知見をまとめておく。

## フロー図

以下のような流れでスマホに音楽ファイルが格納される仕組みとしている。

```mermaid
flowchart TD
```

## YouTubeからの情報取得

- ログインせずにプレイリストを取得する。yt-dlp
- oembedで動画の概要を取る
- サムネイル

## ダウンロード後のファイル処理

- いちいちダウンロードする理由: アップロード後でも動画がいじれること
- mp3tag
- echoprint
- プレイリストの作成

## ビュアー

- アーティスト情報の入力 etc
- Last.fm ScrobblerにあったJSONファイルの出力

## mp3ファイルの同期

- FolderSync
- Poweramp プレイリスト
