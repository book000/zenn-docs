---
title: Logicool のキーボードで SetPoint を使うと再生・停止ボタンが使えなくなるのを改善する
emoji: ⌨️
type: tech
topics: ["logicool", "setpoint"]
published: true
---

普段、Logicool のワイヤレスキーボード、K295 を使っている。  
このキーボードには上部にショートカットキーがついており、メディアの再生・停止であったり音量調整が可能になっている。

https://www.logicool.co.jp/ja-jp/products/keyboards/k295-silent-wireless-keyboard.920-009780.html

これらのショートカットキーの一部は、SetPoint という Logicool が出しているソフトウェアでカスタムできる。

https://support.logi.com/hc/ja/articles/360025141274-SetPoint

しかし、これでカスタムするとメディアの再生・停止ボタンがまったく反応しなくなる症状がある[^1]。  
この症状を改善するための方法を記事としてまとめておく。

## 環境

- Windows 11 23H2 (Build 22631.4317)
- SetPoint
  - ソフトウェア バージョン: 6.90.66
  - 最終更新：2023-01-19
- Logicool Wireless Keyboard K295

## 手順

1. SetPoint が認識しているデバイス名を確認
2. SetPoint を停止
3. デバイス定義フォルダを VS Code で開き、デバイス名で検索
4. `MM Play` のボタン定義を削除し、保存
5. SetPoint を起動

### 1. SetPoint が認識しているデバイス名を確認

SetPoint は実際の製品名と異なる名前でデバイスを認識することがある。  
あとで使うので、認識しているデバイス名を確認しておく。

まず、タスクバーから SetPoint を起動する。SetPoint のアイコンを右クリックし、「マウスおよびキーボードの設定」を開く。  
もしくは、「マウスおよびキーボードの設定」アプリケーションをそのまま開いてもよい。

![](https://storage.googleapis.com/zenn-user-upload/1f8c391e575f-20241020.png)

`SetPoint の設定` ウィンドウが開く。赤枠で示した箇所に SetPoint が認識しているデバイス名が表示されるので、これをメモする。  
K295 の場合、`Wireless Keyboard K270` と表示された。

![](https://storage.googleapis.com/zenn-user-upload/1b2ba54dd23c-20241020.png)

### 2. SetPointを停止

タスクバーから SetPoint を終了する。SetPoint のアイコンを右クリックし、「終了」をクリックする。

![](https://storage.googleapis.com/zenn-user-upload/f910e451fea1-20241020.png)

### 3. デバイス定義フォルダを VS Code で開き、デバイス名で検索

Visual Studio Code で、デバイスの定義フォルダを開く。  
`C:\ProgramData\Logishrd\SetPointP\Devices\Keyboard\` がキーボードの定義フォルダなので、以下の手順で開く。

1. `ファイル` → `フォルダーを開く` をクリック
2. `フォルダー:` 欄に、`C:\ProgramData\Logishrd\SetPointP\Devices\Keyboard\` を入力
3. `フォルダーの選択` をクリック
4. 画像のように、Visual Studio Code 上でフォルダが開けたら OK。

![](https://storage.googleapis.com/zenn-user-upload/b44d054fae5f-20241020.png)

その後、検索タブから先ほどのデバイス名で検索する。

![](https://storage.googleapis.com/zenn-user-upload/354c0532ec2a-20241020.png)

### 4. `MM Play` のボタン定義を削除し、保存

以下の手順で、メディアの再生・停止ボタンのバインディングを無効化する。

1. `HandlerSet="MM PLAY"` が含まれている Button 要素を選択
2. F1 キーを押下
3. `comment` を入力、「行コメントの切り替え」をクリック
4. 選択箇所がコメントアウトされる

![](https://storage.googleapis.com/zenn-user-upload/1000b6c827f1-20241021.png)

編集したら、Ctrl+S で保存する。このとき管理者権限を求められることがあるので、承認する。

### 5. SetPointを起動

「マウスおよびキーボードの設定」アプリケーションを開き、メディアの再生・停止ボタンが機能することを確認する。

## 参考文献

以下のページによれば、SetPoint が一度ショートカットキーを受け取って再送信する仕様で、再送信先の制約が厳しいことが原因らしい。

- [Support for media keys when using Logitech Setpoint software](https://github.com/MarshallOfSound/Google-Play-Music-Desktop-Player-UNOFFICIAL-/issues/1306)

[^1]: ただし、発生しない環境もある。同じキーボードを使っているが、社用パソコンでは発生し、自宅パソコンでは発生しなかった。

## 余談

別の理由として、Chrome の拡張機能 [Hotkeys for YouTube Music™](https://chromewebstore.google.com/detail/hotkeys-for-youtube-music/ggjkoecdjegahefiaibfnjgkebhijgpf) などがショートカットキーを握っていることがあるようです。

[キーボードショートカット設定画面](chrome://extensions/shortcuts) にアクセスし、メディアキー関連のショートカット（メディアの再生/一時停止、メディアの停止 など）のショートカットを外すとうまく動作することがあります。
ショートカットは該当のショートカットの右側鉛筆ボタンをクリック、Escキーで外せます。
