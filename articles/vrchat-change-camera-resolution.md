---
title: VRChat のカメラ解像度をレジストリで変更する
emoji: 📷
type: tech
topics: ["vrchat"]
published: true
---

VRChat では、VRChat 内で撮影できるカメラがあり、撮影した画像は PNG ファイルとして保存されます。  
このとき、以下のように保存できる画像の解像度が設定可能です。

![](https://storage.googleapis.com/zenn-user-upload/839d6997fa69-20241231.png)

自撮りのお写真を撮るときとかは 8K で撮影するのですが、集合写真など数十人単位のお写真を撮るときは 8K で撮ると私のパソコンではフリーズします。  
起動時などに 4K などの別解像度に初期化できないかなと思い、いろいろ試していたらレジストリを変更することで変更できたため、備忘として残します。

:::message alert
この記事に記載されている内容を実行し、発生したいかなる問題について一切責任を負いません。自己責任でお願いします。
:::

## 環境

- Windows 11 23H2 (Build 22631.4602)
- VRChat Build ID: 16713778

## 該当するレジストリ

以下のキー・値が、VRChat 内でのカメラ解像度設定になっています。

- キー: `HKCU\Software\VRChat\VRChat`
- 値: `USER_CAMERA_RESOLUTION_h3942642307`
- 種類: `REG_BINARY`

このキー・値には、以下のデータを入れることができます。

| 解像度 | バイナリデータ | 文字列 |
| :- | :- | :- |
| 720p | `52 65 73 5F 37 32 30 00` | `Res_720` |
| 1080p | `52 65 73 5F 31 30 38 30 00` | `Res_1080` |
| 1440p | `52 65 73 5F 31 34 34 30 00` | `Res_1440` |
| 2160p | `52 65 73 5F 32 31 36 30 00` | `Res_2160` |
| 4320p | `52 65 73 5F 34 33 32 30 00` | `Res_4320` |
| Config File | `43 6F 6E 66 69 67 46 69 6C 65 00` | `ConfigFile` |

![](https://storage.googleapis.com/zenn-user-upload/41b641c8a471-20241231.png)

このデータは VRChat 内で解像度変更の操作をした場合（最初の画像で、4K やら 8K ボタンを押したとき）は即時にレジストリに反映されます。  
逆に、レジストリを手動編集した場合の反映は、VRChat を起動したときのみなようです。インスタンス移動などでは読み込まない様子。

## コマンドでカメラ解像度を変更

コマンドでのレジストリの変更は、reg add コマンド、または New-ItemProperty コマンドレットで編集ができます。

```powershell
# 4K (2160p) に変更
reg add HKCU\Software\VRChat\VRChat /v USER_CAMERA_RESOLUTION_h3942642307 /t REG_BINARY /d 5265735F3231363000 /f

New-ItemProperty -Path "HKCU:\Software\VRChat\VRChat" -Name "USER_CAMERA_RESOLUTION_h3942642307" -PropertyType Binary -Value ([byte[]](0x52, 0x65, 0x73, 0x5F, 0x32, 0x31, 0x36, 0x30, 0x00)) -Force
```

## パソコン起動時にカメラ解像度を変更

上記 reg add コマンドを実行する bat ファイルをスタートアップに登録することで、パソコン起動時にカメラの解像度を変更可能です。

```bat:set-camera-4k.bat
@echo off
reg add HKCU\Software\VRChat\VRChat /v USER_CAMERA_RESOLUTION_h3942642307 /t REG_BINARY /d 5265735F3231363000 /f
```

Win + R で「ファイル名を指定して実行」を開き、`shell:startup` と入力し、OK をクリック。  
`C:\Users\<ユーザー名>\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup` が開くので、そこに先ほど作成した bat ファイルをおいてあげれば完了。

## VRCX を用いて VRChat 起動時にカメラ解像度を変更

[VRCX](https://github.com/vrcx-team/VRCX) という VRChat の外部ツールがあり、これには VRChat 起動時に特定アプリを起動する機能があります。  
この機能を使うことで、VRChat 起動時にカメラ解像度の変更が可能です。

1. 先ほどの `set-camera-4k.bat` を任意の場所（ユーザーフォルダなど）に作成
2. VRCX の設定画面から、詳細タブ → `アプリケーションの自動起動` にある `フォルダー` をクリック
3. 開いたフォルダ（VRCX のスタートアップフォルダ）に、`set-camera-4k.bat` のショートカットを作成

![](https://storage.googleapis.com/zenn-user-upload/53ba63d9a27b-20241231.png)

:::message
VRCX のスタートアップフォルダに bat ファイルをそのまま置いても起動しないようです。ショートカットファイルを置くことで回避できます。
:::
