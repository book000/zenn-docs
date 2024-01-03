---
title: 「A start job is running for Create Volatile Files...」で起動しないとき
emoji: 🛠️
type: tech
topics: ["linux", "raspberrypi", "ubuntu"]
published: true
---

長時間起動していた Raspberry Pi 4 model B を再起動したとき、以下のログで起動処理が進んでいませんでした。

```text
A start job is running for Create Volatile Files and Directories
```

これの改善策記録です。

:::message
この記事では Raspberry Pi での作業について記載していますが、Ubuntu のサーバであればこの作業内容で解消できるかと思われます。（シングルユーザーモードで入るところは違うかと思いますが…）

いつものことですが、自己責任でお願いします。
:::

## 環境

- Raspberry Pi 4 model B
- Ubuntu 20.04.3 LTS

## 作業概要

原因は、`/tmp` の中身が肥大化したことでこのサービスの処理に時間がかかりすぎていることが原因なようです。

そのため、とりあえずの回避策としてシングルユーザーモードで入り、`/tmp` を別ディレクトリに退避する方法を取ります。

### 作業

Raspberry Pi の場合、シングルユーザーモードで入るためには SD カードにある `cmdline.txt` を編集する必要があります。

本来は `init=/bin/sh` を追記するだけで入れるはずなのですが、なぜか `Can't open splash` のエラーで Kernel panic になってしまったため、`systemd.unit` を `emergency.target` に変えることで対応します。

#### 1. SD カードをパソコンに差し込む

Raspberry Pi に差してある SD カードを取り出し、適当なパソコンに差し込みます。  
`system-boot` として認識されるはずなので、これを開きます。

![](https://storage.googleapis.com/zenn-user-upload/43aa36720ac2-20240103.png)

#### 2. cmdline.txt ファイルを編集する

`cmdline.txt` というファイルがあるので、これを Visual Studio Code などのエディターで開きます。

![](https://storage.googleapis.com/zenn-user-upload/c1eb6e9105d4-20240103.png)

1 行目の末尾にスペースを空けて、`systemd.unit=emergency.target` と入力します。（間違っても、2 行目に書いてはいけません）  
バージョンによって `cmdline.txt` の中身は違うため、画像と同じ内容でなくても問題ありません。

![](https://storage.googleapis.com/zenn-user-upload/901d945a94e4-20240103.png)

書き込めたら、取り外します。

#### 3. Raspberry Pi を起動する

取り出した SD カードを Raspberry Pi に差し込みます。  
キーボードとモニターを用意し、HDMI ケーブルで接続し、起動してください。

:::message
起動前にキーボードとモニターを接続しておかないと、認識しないようなのでご注意。
:::

起動すると、以下のように `You are in emergency mode.` と、緊急モードで入れます。

![](https://storage.googleapis.com/zenn-user-upload/366cb4ea9d02-20240103.png)

#### 4. / を書き込み可能にする

緊急モードで起動させた場合、ディスクは読み取り専用（Read-only）でマウントされます。  
書き込み可能にするために、以下のコマンドで再マウントします。

```shell
mount -o remount,rw /dev/mmcblk0p2 /
```

#### 5. /tmp を退避させる

mv コマンドで `/tmp` を退避させます。

```shell
mv /tmp /tmp_old_20240103
```

日付部分は作業日など、わかりやすい名前にしておくことをお勧めします。

#### 6. /tmp を作り直す

以下のコマンドで、`/tmp` を作ります。

```shell
mkdir /tmp
chmod 1777 /tmp
```

`1777` にしているのは [スティッキービット](https://ja.wikipedia.org/wiki/スティッキービット) といって、特殊なパーミッションを設定しているためです。  
スティッキービットを立てることで、「すべてのユーザーが読み取り・書き込みできるが、所有者しか削除できない」状態になります。

#### 7. cmdline.txt ファイルを戻す

このままでは再起動しても緊急モードで起動してしまうため、`cmdline.txt` を戻します。  
Raspberry Pi をシャットダウンさせたあと、Raspberry Pi に差してある SD カードを取り出し、適当なパソコンに差し込みます。

先ほどと同様、`system-boot` として認識されたドライブにある `cmdline.txt` を開き、先ほど追記した `systemd.unit=emergency.target` を削除して保存します。

![](https://storage.googleapis.com/zenn-user-upload/c1eb6e9105d4-20240103.png)

書き込めたら、取り外します。

#### 8. Raspberry Pi をもう一度起動する

取り出した SD カードを Raspberry Pi に差し込み、起動しなおします。

通常起動できたら成功です。

## 原因調査

原因調査をする中で、わかったことを箇条書きで書いておきます。

- `Create Volatile Files and Directories` サービスの設定ファイルは `/usr/lib/systemd/system/systemd-tmpfiles-setup.service` にある
- このサービスは `systemd-tmpfiles --create --remove --boot --exclude-prefix=/dev` コマンドを実行する
  - `create` オプション: `/etc/tmpfiles.d/*.conf` の内容に基づいて、作成すべきファイルやディレクトリを作成
  - `remove`: `/etc/tmpfiles.d/*.conf` の内容に基づいて、削除すべきファイルやディレクトリを削除（排他または共有ロックがされていない限り）
  - `boot`: `/etc/tmpfiles.d/*.conf` の内容について、`!` がついた行も実行する
- 要するに、起動時に一時ファイル・ディレクトリを処理するのに時間がかかっていた
- 起動中の一時ファイル・ディレクトリは `systemd-tmpfiles-clean.service` が処理する
  - `systemd-tmpfiles-clean.service` は起動から 15 分後、そのあと1 日おきに実行
- 今回問題になったマシンの `/tmp` (`/tmp_old_20240103`) の中には、`yarn--` から始まる Yarn の一時フォルダが大量にあった
- [Issue](https://github.com/yarnpkg/yarn/issues/6685#issuecomment-503028465) によれば、Yarn v1 では修正されることはないらしい（Yarn v2 以降では修正されている）

## 参考

- [linux - Boot stuck at "A start job is running for Create Volatile Files and Directories" - Server Fault](https://serverfault.com/questions/987488/boot-stuck-at-a-start-job-is-running-for-create-volatile-files-and-directories)
- [systemd-tmpfiles-setup.service(8) — Arch manual pages](https://man.archlinux.org/man/core/systemd/systemd-tmpfiles-setup.service.8.en)
- [【systemd-tmpfiles】CentOS8でディレクトリ内のファイルを定期的に消す方法 | mikemikeblog](https://mikemikeblog.com/how-to-use-systemd-tmpfiles-with-centos8/)
