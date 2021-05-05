---
title: PHP 8.0.0を導入してみる (Windows 10)
emoji: ✨
type: tech
topics: ["php", "php8", "windows"]
published: true
---

2020/11/24 にリリースされた、PHP 8.0.0 を Windows10 に入れてみます。

## 注意事項

この記事に記載されている内容を実行し、発生したいかなる問題について執筆者は一切責任を負いません。自己責任でお願いします。
ところで、[PHP 8.0 のバイナリを公式提供しないなんていう記事](https://forest.watch.impress.co.jp/docs/news/1264900.html)が 7 月くらいにあって当時驚いてたけど、普通に出ているのよね…これとは違うのかしら。

## 基礎情報

- [PHP 8.0.0 Release Announcement - php.net](https://www.php.net/releases/8.0/en.php)
- [PHP 8.0.0 CHANGELOG](https://www.php.net/ChangeLog-8.php#8.0.0)

## 環境

- OS: Windows 10 2004 (Build 19041.630) (`winver`)
- PHP: `PHP 8.0.0 (cli) (built: Nov 24 2020 22:02:57) ( ZTS Visual C++ 2019 x64 )`, `VS16 x64 Thread Safe (2020-Nov-24 22:49:03)`

## インストール作業

### 1. php.net の downloads から、Windows 版の Zip ファイルをダウンロードします

![](https://storage.googleapis.com/zenn-user-upload/hajg57i5k0k0zya1jhjqpfg7r40v)

[PHP: Downloads](https://www.php.net/downloads)にアクセスし、`PHP 8.0.0` の `Windows downloads` をクリック。

![](https://storage.googleapis.com/zenn-user-upload/930ohai5zrbkjqlcey8ljt7l8spa)

`x64` か `x86` 、`Non Thread Safe` か `Thread Safe` どちらかを選び、 `Zip` をクリックしてダウンロードしましょう。（ここでは `x64` の `Thread Safe` をダウンロードします）

- ちなみに、 `Thread Safe` の PHP をダウンロードしていますが、コマンドラインで使うのみの目的であれば実のところ Non Thread Safe の方が良いです。

### 2. 適当なところにフォルダを作り、その中に Zip ファイルを展開します

![](https://storage.googleapis.com/zenn-user-upload/gzufvh82rvtrgq5klvo17ukd4gr6)

C ドライブの直下に `php8` というフォルダを作り、その中に展開しました。
ちなみに、私は PHP 7 系と今回インストールする PHP 8 を共存させるために展開したフォルダの中にある `php.exe` を `php8.exe` にリネームしています。

### 3. パスを通すために「システム環境変数の編集」を開きます

![](https://storage.googleapis.com/zenn-user-upload/4lt038pirx9rl32xwtd6nv0jyjcy)

Windows キーを押して（またはタスクバーの Windows ロゴを押して）スタートメニューを開き、 `path` と入力すると「`システム環境変数の編集`」というのが出てきます。これをクリックしてください。

### 4.「環境変数」をクリックします

![](https://storage.googleapis.com/zenn-user-upload/pbm93bvtn5t7pcdhb03q9kg4wy4e)

出てきたウィンドウ（システムのプロパティ）の右下に「`環境変数`」というボタンがあるので、これをクリックします。

### 5. パスの変更画面を開きます

![](https://storage.googleapis.com/zenn-user-upload/36ma5dyy6rq9kgfxwm1lg2ro11vu)

出てきたウィンドウ（環境変数）の下部分「システム環境変数」の中の `Path` をクリックし、「編集」をクリックします。
編集を押さずに、 `Path` をダブルクリックしてもかまいません。

### 6. ダウンロードしたフォルダにパスを通します

![](https://storage.googleapis.com/zenn-user-upload/so59r41xvpjplshdusmbiwfef2d0)

出てきたウィンドウ（環境変数名の編集）の右側「新規」を押し、新規欄に先ほど Zip を展開したフォルダのパスを入力します。
私と同様に C ドライブ直下に `php8` というフォルダを作ったのなら、`C:\php8` と入力します。

入力し終えたら、右下「OK」をクリックして閉じます。今までに開いたウィンドウもすべて「OK」で閉じてかまいません。
※過去に PHP をインストールしており、パスを通しているならば該当するパスを削除することをお勧めします。該当行をクリックし、「削除」を押して削除できます。

### 7. コマンドプロンプトか PowerShell を開き、PHP のバージョンを確認しましょう

![](https://storage.googleapis.com/zenn-user-upload/tmxtwiq7lelz06l8svve4c3ekx7m)

タスクバーの Windows ロゴを右クリック（もしくは `Windows + X`）し、「`PowerShell`」または「`コマンドプロンプト`」をクリックし起動します。エクスプローラーのアドレス欄に `cmd` や `powershell` と入れて起動するなり、`Windows + R` で「`ファイル名を指定して実行`」を起動して `cmd` や `powershell` と入れ起動してもかまいません。

![](https://storage.googleapis.com/zenn-user-upload/nbkuncu7gaxwss4l0r0wrixqgxht)

起動したら、`php -v` と打ち込み Enter してください。PHP のバージョンが表示されます。これが `8.0.0` になっていればインストール成功です。
※私は 2 で `php.exe` を `php8.exe` にリネームしているので `php8 -v` しています。`php7.3.4` が共存しています。

- `'php' は、内部コマンドまたは外部コマンド、操作可能なプログラムまたはバッチ ファイルとして認識されていません。` と出たり、 `php : 用語 'php' は、コマンドレット、関数、スクリプト ファイル、または操作可能なプログラムの名前として認識されません。` と出る場合は今までの手順の何らかを間違えた可能性があります。やり直してみましょう。
- `8.0.0` でない、古いバージョンが出てきた場合は 6 で古い PHP のパスを削除していない可能性があります。もう一度確認してみてください。

## 備考

- PHP 8.0.0 の正式リリース自体は 2020/11/26 ですので、本当はプレリリースビルドである可能性があります…。後でビルド記事を作るかも
