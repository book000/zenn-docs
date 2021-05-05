---
title: AutoMuteUsの使い方まとめ
emoji: 
type: tech
topics: ["application","windows"]
---

AutoMuteUsを使うにあたってよくわからんところがあったので自分用まとめ。

## 環境

- [AmongMuteUs](https://github.com/denverquane/automuteus) [2.4.3](https://github.com/denverquane/automuteus/releases/tag/2.4.3)
- [AmongUsCapture](https://github.com/denverquane/amonguscapture) [2.8.4](https://github.com/automuteus/amonguscapture/releases/tag/2.8.4)

とりあえず両方のWindows版を落としてきて同一のフォルダに配置。

## AutoMuteUsだけでは動かない

AutoMuteUsを使うにはAmongUsCaptureも必要。

## AutoMuteUsにはトークンを入れる必要がない

AutoMuteUsにDiscordBotトークンを入れなくても動くっぽい。  
ただしAmongUsCaptureの設定にはconfig.txtへの入力が必要

## 使うBotアカウントは運用するGuild(サーバ)はひとつのみのものを使う

Botが入ってるGuildのすべてに絵文字を突っ込まれる(？)ので、`Missing Permission`のエラーが大量に出る(or勝手に絵文字を入れられる)  
おまけに25個もの絵文字が勝手に入れられるので、絵文字スロットがそれ以上あるGuildを選ぶ。

## BotにはGuildから必要な権限を与えておく必要がある

次の権限がBotには必要

- サーバ全般
  - **ニックネームの管理**: ゲーム内ネームと併せてニックネームが変更される
  - **絵文字の管理**: 絵文字が大量に追加される(25個・画像参照)。これら絵文字は`.au new`時のリアクションのために使われるっぽい
  - **テキストチャンネルの閲覧&amp;ボイスチャンネルの表示**: それ自体が見えないと動かないはずなので追加。
- テキスト
  - **メッセージを送信**: `.au new`とかのときにメッセージ送信が必要になるので必要。
  - **メッセージを管理**: `.au new`とかのときに不適切なリアクションがつけられたときにBotが自分で外すのに必要。
  - **埋め込みリンク**: メッセージ送信のときにEmbedを使うので必要。
  - **リアクションの追加**: `.au new`とかのときにBotが自分が送ったメッセージに対してリアクションをつけるので必要。
- 音声
  - **メンバーをミュート**: ディスカッション以外の時にBotがサーバミュートするので必要。
  - **メンバーのスピーカーをミュート**: ディスカッション以外の時にBotがサーバミュートするので必要。

## Botはゲームホストの人が立てる必要がある？

これはよくわからないけど、ホストじゃないとBotがまともに動かなかったように見えた。

## ホストはゲームを変えた際、.au newをしてかつDMのリンクを押す必要がある

  
`.au new`をするとこういうメッセージが送られてくるので、`aucapture://localhost:****/**********?insecure`を押す。  
なお、Botをフレンド登録していてもGuild(サーバ)にいるメンバーからのDMを許可してないと届かないことがあるので注意。