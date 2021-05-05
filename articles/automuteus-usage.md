---
title: AutoMuteUsの使い方まとめ
emoji: 
type: tech
topics: ["application","windows"]
---

AutoMuteUs を使うにあたってよくわからんところがあったので自分用まとめ。

## 環境

- [AmongMuteUs](https://github.com/denverquane/automuteus) [2.4.3](https://github.com/denverquane/automuteus/releases/tag/2.4.3)
- [AmongUsCapture](https://github.com/automuteus/amonguscapture) [2.8.4](https://github.com/automuteus/amonguscapture/releases/tag/2.8.4)

とりあえず両方の Windows 版を落としてきて同一のフォルダに配置。

## AutoMuteUsだけでは動かない

AutoMuteUs を使うには AmongUsCapture も必要。

## AutoMuteUsにはトークンを入れる必要がない

AutoMuteUs に DiscordBot トークンを入れなくても動くっぽい。  
ただし AmongUsCapture の設定には config.txt への入力が必要

## 使うBotアカウントは運用するGuild(サーバ）はひとつのみのものを使う

Bot が入っている Guild のすべてに絵文字を突っ込まれる（？)ので、`Missing Permission` のエラーが大量に出る（or 勝手に絵文字を入れられる）  
おまけに 25 個もの絵文字が勝手に入れられるので、絵文字スロットがそれ以上ある Guild を選ぶ。

## BotにはGuildから必要な権限を与えておく必要がある

次の権限が Bot には必要

- サーバ全般
  - **ニックネームの管理**: ゲーム内ネームと併せてニックネームが変更される
  - **絵文字の管理**: 絵文字が大量に追加される（25 個・画像参照）。これら絵文字は `.au new` 時のリアクションのために使われるっぽい
  - **テキストチャンネルの閲覧&amp;ボイスチャンネルの表示**: それ自体が見えないと動かないはずなので追加。
- テキスト
  - **メッセージを送信**: `.au new` とかのときにメッセージ送信が必要になるので必要。
  - **メッセージを管理**: `.au new` とかのときに不適切なリアクションがつけられたときに Bot が自分で外すのに必要。
  - **埋め込みリンク**: メッセージ送信のときに Embed を使うので必要。
  - **リアクションの追加**: `.au new` とかのときに Bot が自分が送ったメッセージに対してリアクションをつけるので必要。
- 音声
  - **メンバーをミュート**: ディスカッション以外の時に Bot がサーバミュートするので必要。
  - **メンバーのスピーカーをミュート**: ディスカッション以外の時に Bot がサーバミュートするので必要。

## Botはゲームホストの人が立てる必要がある？

これはよくわからないけど、ホストじゃないと Bot がまともに動かなかったように見えた。

## ホストはゲームを変えた際、.au newをしてかつDMのリンクを押す必要がある

  
`.au new` をするとこういうメッセージが送られてくるので、`aucapture://localhost:****/**********?insecure` を押す。  
なお、Bot をフレンド登録していても Guild(サーバ）にいるメンバーからの DM を許可してないと届かないことがあるので注意。