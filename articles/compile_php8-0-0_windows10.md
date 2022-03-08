---
title: PHP 8.0.0をソースからビルド(コンパイル)する (Windows10)
emoji: ✨
type: tech
topics: ["php", "php8", "windows"]
published: true
---

[一つ前の記事](install_php8-0-0_windows10) でプレリリース版（と思われる）バイナリをダウンロードし、配置（インストール）したがせっかくなら正式リリース版をビルドして導入してみたいので、Windows10 環境でビルドしてみる。

## 注意事項

この記事に記載されている内容を実行し、発生したいかなる問題について執筆者は一切責任を負いません。自己責任でお願いします。
ネット上の記事を探し回って結果としてできたもので、おまけに参考文献（後述）に書いてある内容をちょくちょく注釈付け足だけではあるので、もし英語が読めるならもともとの記事を見たほうがよいかも。
解説のために画像や GIF を多用します。

## 基礎情報

- [PHP 8.0.0 Release Announcement - php.net](https://www.php.net/releases/8.0/en.php)
- [PHP 8.0.0 CHANGELOG](https://www.php.net/ChangeLog-8.php#8.0.0)

## 環境

必須環境でない可能性があります（たとえば、Visual Studio は 2017 でもよいかもしれない）。

- OS: Windows 10 2004 (Build 19041.630)
- `winver`
- Visual Studio Community 2019 16.8.2
- `.tar.gz` を展開できる環境・アプリケーション（7-Zip など）
- PHP: `PHP 8.0.0 (cli) ( ZTS Visual C++ 2019 x64 )`

解説のために Windows SandBox を用いて作業を実施しています。

## 作業内容概要

詳しい内容を書く前に、ざっと概要を書きます。カレントディレクトリとか省いているところもあるので、詳細も読んでから作業してください。

1. 「PHP SDK」をダウンロードし、配置する。
2. PHP のソースコードをダウンロードしておく。
3. 「`x64 Native Tools Command Prompt for VS 2019`」を使用して `phpsdk-starter.bat -c vs16 -a x64`、`phpsdk_buildtree.bat php-dev` を実行する。
4. ダウンロードした PHP のソースコードを展開して配置する。
5. `phpsdk_deps.bat -u` を実行して、依存関係にあたるものをダウンロードする。
6. `phpsdk-vs16-x64.bat` を実行して、初期処理を実施する。
7. `buildconf` を実行して、configure を設定する。
8. `configure` を実行して設定する。
9. `nmake` を実行してコンパイルする。
10. `php -v`, `php -m` して正常にコンパイルできたか調べ、問題なければ完了。

## 作業内容詳細

### 0. Visual Studio・7-Zip をインストールする

ビルド（コンパイル）を行うために Visual Studio が必要です。インストールします。
![](https://storage.googleapis.com/zenn-user-upload/eq1wgumucu56mhhzeqs2m4fnza10)
[Visual Studio のダウンロードページ](https://visualstudio.microsoft.com/ja/downloads/) にアクセスし、コミュニティ版インストーラをダウンロードします。
![](https://storage.googleapis.com/zenn-user-upload/aspnw5o1qe1jy7yxod98vg3lu8nj)
インストーラをダウンロードしたら、そのインストーラを起動して「`C++によるデスクトップ開発`」にチェックを入れ「インストール」をクリックしインストールします。

また、`tar.gz` を解凍するために何かしらのツールが必要です。ここでは 7-Zip を使うため、それをインストールしておきます。
![](https://storage.googleapis.com/zenn-user-upload/uwnw4oqxkh2cyts8m089awpgrf1p)
![](https://storage.googleapis.com/zenn-user-upload/xr92m5h089g3idixr8ogyocclkon)
[7-Zip の Web サイト](https://sevenzip.osdn.jp/) から、最新の x64 の exe ファイルをダウンロードします。インストーラを実行しインストールしてください。

### 1. PHP SDK をダウンロードし、配置する

![](https://storage.googleapis.com/zenn-user-upload/achvff0qb9a8jqc133lnkrm7fo74)

PHP をビルドするツールである PHP SDK を GitHub からダウンロードし、配置します。

[microsoft/php-sdk-binary-tools](https://github.com/microsoft/php-sdk-binary-tools) にアクセスし「Code」をクリック、「Download ZIP」をクリックし Zip ファイルをダウンロードします。

![](https://storage.googleapis.com/zenn-user-upload/jvweyml1ezhz6zpiurdgeq3hg1sk)

このファイルはどこか適当なところに展開しましょう。ここでは `C:\php8-build` に展開します。
展開する際、`php-sdk-binary-tools-master` フォルダをそのまま展開・コピーせず、`php-sdk-binary-tools-master` の中身を展開しコピーしましょう。

### 2. PHP のソースコードをダウンロードしておく

次に、ビルド（コンパイル）するソースコードを用意します。
![](https://storage.googleapis.com/zenn-user-upload/sjislxsjn74mq1g088axsxdmf7hh)

[PHP: Downloads](https://www.php.net/downloads) にアクセスし、`tar.gz` 形式のソースコードファイル（ここでは `php-8.0.0.tar.gz`）をダウンロードします。
とりあえずこの項ではダウンロードだけ行い、展開は後でやります。

### 3.「`x64 Native Tools Command Prompt for VS 2019`」を使用して `phpsdk-starter.bat -c vs16 -a x64`、`phpsdk_buildtree.bat php-dev` を実行する

※画像上ではコマンドプロンプト（`cmd`）を使用していますが、ほかの記事では `x64 Native Tools Command Prompt` を使用している記事ばかりなので便宜上使用することを前提に話を進めます。これの違いはあとあと調べるかも…。実際のところコマンドプロンプトで動作させてもコンパイルまで成功してはいます。
![](https://storage.googleapis.com/zenn-user-upload/biscps4ub0f92fnbkw8431x2tmv1)

Visual Studio をインストールしたことにより、「スタート」内の最近追加されたものに「`x64 Native Tools Command Prompt for VS 2019`」があるはずです。まずはこれをクリックして開きます。
![](https://storage.googleapis.com/zenn-user-upload/g61eo7z2mmsrexjkn95aolfzecjz)
![](https://storage.googleapis.com/zenn-user-upload/ahvjl7p69wj1ckfjcbeipazgesw2)
次に、`cd` コマンドを使い `cd C:\php8-build` でカレントディレクトリを変更したあと（※画像では実施されていません）、次のコマンドを実行します。

```powershell
phpsdk-starter.bat -c vs16 -a x64
phpsdk_buildtree.bat php-dev
```

それぞれ、`phpsdk-starter.bat` では `vs16` = `Visual Studio 2019` を使用すること、アーキテクチャは x64 を使用することを明示して PHP SDK を開始していること、phpsdk_buildtree では PHP SDK が使うディレクトリを生成してカレントディレクトリを変更しています。

### 4. ダウンロードした PHP のソースコードを展開して配置する

![](https://storage.googleapis.com/zenn-user-upload/ueh8vusbj70akvwmvynqsbsddpsk)

エクスプローラーで、2 でダウンロードしたファイルを右クリックし `7-Zip`→`開く (Open archive)` を実行します。
そのあと、開いた 7-Zip の画面で `php-8.0.0.tar` をクリックして開き、`php-8.0.0` フォルダを `php-dev\vs16\x64` に展開・移動して配置します。

### 5. `phpsdk_deps.bat -u` を実行して、依存関係にあたるものをダウンロードする

![](https://storage.googleapis.com/zenn-user-upload/d0ek2ttk07457dldikaq14immgne)

コマンドプロンプト（`x64 Native Tools Command Prompt for VS 2019`）に戻り、`cd php-8.0.0` でカレントディレクトリを変更したあと `..\..\..\..\bin\phpsdk_deps.bat -u` を実行します。
`..\..\..\..\bin\phpsdk_deps.bat -u` は `C:\php8-build\bin\phpsdk_deps.bat -u` でもかまいません。
これにより、依存関係として必要なパッケージがダウンロードされます。

### 6. `phpsdk-vs16-x64.bat` を実行して、初期処理を実施する

![](https://storage.googleapis.com/zenn-user-upload/o8wecaafjjrr2dqd6vg6jqam7p6l)

依存パッケージがダウンロードできたら、`..\..\..\..\phpsdk-vs16-x64.bat` か `C:\php8-build\phpsdk-vs16-x64.bat` を実行します。よく調べると、中では `phpsdk-starter.bat` を叩いているだけなので 3 の `phpsdk-starter.bat` はこれを実行しても良かったわけです。

### 7. `buildconf` を実行して、configure を設定する

![](https://storage.googleapis.com/zenn-user-upload/vkoacm2m33ockfy1i542tdgi5ew9)

`buildconf` を実行して、`configure` を設定します。正確には再生成しています。

### 8. `configure` を実行して設定する

![](https://storage.googleapis.com/zenn-user-upload/om2n193dbsa9x2x2zej4w5yh6odq)

![](https://storage.googleapis.com/zenn-user-upload/ek57iaqtggo7815wdhqns8izo1j2)

Linux 系でコンパイルするときと同じように、必要なモジュールを引数で選択しコンパイル設定をします。ここでは、日本語などのマルチバイト文字列を扱うための `mbstring`、同様にマルチバイト用の正規表現をするための `mbregex`、cURL を利用するための `curl`、SSL のための `openssl`、画像処理のための `gd`、データベース操作のための `mysqli` を選択し設定しました。
`Type 'nmake' to build PHP` と表示されれば完了です。

### 9. `nmake` を実行してコンパイルする

![](https://storage.googleapis.com/zenn-user-upload/qc3wqe9r25lsy0u5co888fev2g2h)

![](https://storage.googleapis.com/zenn-user-upload/kdiohwbz7kdmkuezj90g132rhfqr)

さて、やっとコンパイルです。`nmake` を実行してコンパイルしましょう。スペックにもよりますが 3 分くらいで終わりました。
`build complete` と表示されれば成功です。

### 10. 正常にコンパイルできたか調べ、問題なければ完了

コンパイルされたものは `C:\php8-build\php-dev\vs16\x64\php-8.0.0-src\x64\Release_TS` にあります。ここに `php.exe` があると思うのでこれをコマンドプロンプト経由で実行しましょう。
まずはバージョンを見るために `php -v` と実行します。

![](https://storage.googleapis.com/zenn-user-upload/i1kzjwnqoprhjere35631cbbht2h)

ここでたいていの場合画像のようなエラーが出ると思われます。実行に必要な DLL ファイルが見つからないというものです。
これらの DLL ファイルは `C:\php8-build\php-dev\vs16\x64\deps\bin` にあります（必要なものが全部あるのかはわからない…）。表示されている `～.dll` をそのフォルダから探し出し、`php.exe` があるフォルダにコピーすると正常に動作するはずです。

![](https://storage.googleapis.com/zenn-user-upload/hsvr9djsng59z5npez7icm93bjgb)

私はごちゃごちゃするのも嫌だったので、`php.exe` を含む必要と言われたファイルのみ別のフォルダにコピーして実行できるようにしてみました。

## 終わりに

疲れました。いや、Linux で ffmpeg のビルドとかは多少やったことあれどそれ以外でコマンドラインによるビルドとかしたことない（Visual Studio 経由はあっても）のでしくみの理解に結構頭を悩ませました。
とはいえど、ネット上にすばらしい記事があって分かり易かったので非常に助かりました…。それでもこの解説記事で 4000 文字くらい書いたと思います。

## 参考文献

- [How to build PHP on Windows](https://medium.com/@erinus/how-to-build-php-on-windows-a7ad0a87862a)
