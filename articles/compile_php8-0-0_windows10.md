---
title: PHP 8.0.0をソースからビルド(コンパイル)する (Windows10)
emoji: 
type: tech
topics: ["php","windows"]
---

[一つ前の記事](/blog/install_php8-0-0_windows10/)でプレリリース版(と思われる)バイナリをダウンロードし、配置(インストール)したがせっかくなら正式リリース版をビルドして導入してみたいので、Windows10環境でビルドしてみる。

## 注意事項

この記事に記載されている内容を実行し、発生したいかなる問題について当サイト管理者は一切責任を負いません。自己責任でお願いします。  
ネット上の記事を探し回って結果としてできたもので、おまけに参考文献(後述)に書いてある内容をちょくちょく注釈つけただけではあるので、もし英語が読めるならもともとの記事を見たほうがいいかも。  
解説のために画像やGIFを多用します。

## 基礎情報

- [PHP 8.0.0 Release Announcement - php.net](https://www.php.net/releases/8.0/en.php)
- [PHP 8.0.0 CHANGELOG](https://www.php.net/ChangeLog-8.php#8.0.0)

## 環境

必須環境でない可能性があります(たとえば、Visual Studioは2017でもいいかもしれない)。

- OS: Windows 10 2004 (Build 19041.630)
- `winver`
- Visual Studio Community 2019 16.8.2
- `.tar.gz`を展開できる環境・アプリケーション(7-Zipなど)
- PHP: `PHP 8.0.0 (cli) ( ZTS Visual C++ 2019 x64 )`

解説のためにWindows SandBoxを用いて作業を実施しています。

## 作業内容概要

詳しい内容を書く前に、ざっと概要を書きます。カレントディレクトリとか省いてるところもあるので、詳細も読んでから作業してください。

1. 「PHP SDK」をダウンロードし、配置する。
2. PHPのソースコードをダウンロードしておく。
3. 「`x64 Native Tools Command Prompt for VS 2019`」を使用して`phpsdk-starter.bat -c vs16 -a x64`、`phpsdk_buildtree.bat php-dev`を実行する。
4. ダウンロードしたPHPのソースコードを展開して配置する。
5. `phpsdk_deps.bat -u`を実行して、依存関係にあたるものをダウンロードする。
6. `phpsdk-vs16-x64.bat`を実行して、初期処理を実施する。
7. `buildconf`を実行して、configureを設定する。
8. `configure`を実行して設定する。
9. `nmake`を実行してコンパイルする。
10. `php -v`, `php -m`して正常にコンパイルできたか調べ、問題なければ完了。

## 作業内容詳細

### 0. Visual Studio・7-Zipをインストールする

ビルド(コンパイル)を行うためにVisual Studioが必要です。インストールします。  
![](https://images.microcms-assets.io/assets/aa728ef13efd493bb761daa672fe743f/492a896cbe7f48658788fefebb662905/201127_140307_WindowsSandboxClient_8YFFgJa0Ka%5B1%5D.png)  
[Visual Studioのダウンロードページ](https://visualstudio.microsoft.com/ja/downloads/)にアクセスし、コミュニティ版インストーラーをダウンロードします。  
![](https://images.microcms-assets.io/assets/aa728ef13efd493bb761daa672fe743f/b3797c008346466fb843d4b99f567d33/201127_140531_WindowsSandboxClient_hDqT5MhQke%5B1%5D.png)  
インストーラーをダウンロードしたら、そのインストーラーを起動して「`C++によるデスクトップ開発`」にチェックを入れ「インストール」をクリックしインストールします。  
また、`tar.gz`を解凍するために何かしらのツールが必要です。ここでは7-Zipを使うため、それをインストールしておきます。  
![](https://images.microcms-assets.io/assets/aa728ef13efd493bb761daa672fe743f/97aae8f7024649ffaeb2cdd5759112b4/201127_141742_WindowsSandboxClient_dhT4tXukLA%5B1%5D.png)  
![](https://images.microcms-assets.io/assets/aa728ef13efd493bb761daa672fe743f/02491c8956f14e12a533e6c2e4b2ceed/201127_141817_1o0K99HXgP%5B1%5D.gif)  
[7-ZipのWebサイト](https://sevenzip.osdn.jp/)から、最新のx64のexeファイルをダウンロードします。インストーラーを実行しインストールしてください。

### 1. PHP SDKをダウンロードし、配置する。

![](https://images.microcms-assets.io/assets/aa728ef13efd493bb761daa672fe743f/62f2fa4b376a42a399cf28ba4af44182/201127_141225_86pdfpDIRi%5B1%5D.gif)  
PHPをビルドするツールであるPHP SDKをGitHubからダウンロードし、配置します。  
[microsoft/php-sdk-binary-tools](https://github.com/microsoft/php-sdk-binary-tools)にアクセスし「Code」をクリック、「Download ZIP」をクリックしZipファイルをダウンロードします。  
![](https://images.microcms-assets.io/assets/aa728ef13efd493bb761daa672fe743f/09be7faed96e488e80dfb477b320110f/201127_141523_gvSZXlWHHC%5B1%5D.gif)  
このファイルはどこか適当なところに展開しましょう。ここでは`C:\php8-build`に展開します。  
展開する際、`php-sdk-binary-tools-master`フォルダをそのまま展開・コピーせず、`php-sdk-binary-tools-master`の中身を展開しコピーしましょう。

### 2. PHPのソースコードをダウンロードしておく

次に、ビルド(コンパイル)するソースコードを用意します。  
![](https://images.microcms-assets.io/assets/aa728ef13efd493bb761daa672fe743f/64d27bbf4c714552973838eb7c948d10/201127_160023_WindowsSandboxClient_Izu34sP7Kp%5B1%5D.png)  
[PHP: Downloads](https://www.php.net/downloads)にアクセスし、`tar.gz`形式のソースコードファイル(ここでは`php-8.0.0.tar.gz`)をダウンロードします。  
とりあえずこの項ではダウンロードだけして、展開は後でやります。

### 3. 「`x64 Native Tools Command Prompt for VS 2019`」を使用して`phpsdk-starter.bat -c vs16 -a x64`、`phpsdk_buildtree.bat php-dev`を実行する

※画像上ではコマンドプロンプト(`cmd`)を使用していますが、他の記事では`x64 Native Tools Command Prompt`を使用している記事ばかりなので便宜上使用することを前提に話を進めます。これの違いは後々調べるかも…。実際のところコマンドプロンプトで動作させてもコンパイルまで成功してはいます。  
![](https://images.microcms-assets.io/assets/aa728ef13efd493bb761daa672fe743f/594a2e8b8f73428abcd1cd96ed1569ca/201127_160308_WindowsSandboxClient_nWRHV91wme%5B1%5D.png)  
Visual Studioをインストールしたことにより、「スタート」内の最近追加されたものに「`x64 Native Tools Command Prompt for VS 2019`」があるはずです。まずはこれをクリックして開きます。  
![](https://images.microcms-assets.io/assets/aa728ef13efd493bb761daa672fe743f/53f57e752db54d7db05bd6e2d4b7c77e/201127_142158_WindowsSandboxClient_9GKWg58LaR%5B1%5D.png)  
![](https://images.microcms-assets.io/assets/aa728ef13efd493bb761daa672fe743f/217f92c2bcfe417389458910e22f67cc/201127_142125_WindowsSandboxClient_EkreKbFj6D%5B1%5D.png)  
次に、`cd`コマンドを使い`cd C:\php8-build`でカレントディレクトリを変更したあと(※画像では実施されていません)、次のコマンドを実行します。

```
phpsdk-starter.bat -c vs16 -a x64
phpsdk_buildtree.bat php-dev
```

それぞれ、`phpsdk-starter.bat`では`vs16` = `Visual Studio 2019`を使用すること、アーキテクチャはx64を使用することを明示してPHP SDKを開始していること、phpsdk\_buildtreeではPHP SDKが使うディレクトリを生成してカレントディレクトリを変更しています。

### 4. ダウンロードしたPHPのソースコードを展開して配置する。

![](https://images.microcms-assets.io/assets/aa728ef13efd493bb761daa672fe743f/5930ebb3fc934166889cc60c764a894e/201127_142430_ZEPX5d8Fc6%5B1%5D.gif)  
エクスプローラーで、2でダウンロードしたファイルを右クリックし`7-Zip`→`開く (Open archive)`を実行します。  
そのあと、開いた7-Zipの画面で`php-8.0.0.tar`をクリックして開き、`php-8.0.0`フォルダを`php-dev\vs16\x64`に展開・移動して配置します。

### 5. `phpsdk_deps.bat -u`を実行して、依存関係にあたるものをダウンロードする

![](https://images.microcms-assets.io/assets/aa728ef13efd493bb761daa672fe743f/b5bfb16dca1d4988bb945b1fda899d50/201127_143132_WindowsSandboxClient_faUOX2puxS%5B1%5D.png)  
コマンドプロンプト(`x64 Native Tools Command Prompt for VS 2019`)に戻り、`cd php-8.0.0`でカレントディレクトリを変更したあと`..\..\..\..\bin\phpsdk_deps.bat -u`を実行します。  
`..\..\..\..\bin\phpsdk_deps.bat -u`は`C:\php8-build\bin\phpsdk_deps.bat -u`でも構いません。  
これにより、依存関係として必要なパッケージがダウンロードされます。

### 6. `phpsdk-vs16-x64.bat`を実行して、初期処理を実施する。

![](https://images.microcms-assets.io/assets/aa728ef13efd493bb761daa672fe743f/efdd8070ac99401d9c2abc23ad524a77/201127_143232_WindowsSandboxClient_EItPpHLu1l%5B1%5D.png)  
依存パッケージがダウンロードできたら、`..\..\..\..\phpsdk-vs16-x64.bat`か`C:\php8-build\phpsdk-vs16-x64.bat`を実行します。よくよく調べると、中では`phpsdk-starter.bat`を叩いているだけなので3の`phpsdk-starter.bat`はこれを実行しても良かったわけです。

### 7. `buildconf`を実行して、configureを設定する。

![](https://images.microcms-assets.io/assets/aa728ef13efd493bb761daa672fe743f/1ee06846370047aaa683b5f956c6097e/201127_143240_WindowsSandboxClient_Lz4NqUGlsX%5B1%5D.png)  
`buildconf`を実行して、`configure`を設定します。正確には再生成しています。

### 8. `configure`を実行して設定する。

![](https://images.microcms-assets.io/assets/aa728ef13efd493bb761daa672fe743f/cf274380c2e14ccea1d9023963447ff0/201127_143742_WindowsSandboxClient_S3k4MS8Dxp%5B1%5D.png)  
![](https://images.microcms-assets.io/assets/aa728ef13efd493bb761daa672fe743f/a7a2550c6b1449f6abedee71509c23c5/201127_144021_WindowsSandboxClient_e2kxIN8tB9%5B1%5D.png)  
Linux系でコンパイルするときと同じように、必要なモジュールを引数で選択しコンパイル設定を行います。ここでは、日本語などのマルチバイト文字列を扱うための`mbstring`、同様にマルチバイト用の正規表現を行うための`mbregex`、cURLを利用するための`curl`、SSLのための`openssl`、画像処理のための`gd`、データベース操作のための`mysqli`を選択し設定しました。  
`Type 'nmake' to build PHP`と表示されれば完了です。

### 9. `nmake`を実行してコンパイルする。

![](https://images.microcms-assets.io/assets/aa728ef13efd493bb761daa672fe743f/482cb33039bc48adbefd2005733bf4b3/201127_144313_WindowsSandboxClient_rjYJBBGbQF%5B1%5D.png)  
![](https://images.microcms-assets.io/assets/aa728ef13efd493bb761daa672fe743f/524c7424df014bc18f76799803a59025/201127_144348_WindowsSandboxClient_VFgVRvNAiC%5B1%5D.png)  
さて、やっとコンパイルです。`nmake`を実行してコンパイルしましょう。スペックにもよりますが3分くらいで終わりました。  
`build complete`と表示されれば成功です。

### 10. 正常にコンパイルできたか調べ、問題なければ完了

コンパイルされたものは`C:\php8-build\php-dev\vs16\x64\php-8.0.0-src\x64\Release_TS`にあります。ここに`php.exe`があると思うのでこれをコマンドプロンプト経由で実行しましょう。  
まずはバージョンを見るために`php -v`と実行します。  
![](https://images.microcms-assets.io/assets/aa728ef13efd493bb761daa672fe743f/43535224b36a4e1ab5196091564affef/201127_153249_WindowsSandboxClient_ZzaxYu0WMF%5B1%5D.jpg)  
ここで大抵の場合画像のようなエラーが出ると思われます。実行に必要なDLLファイルが見つからないというものです。  
これらのDLLファイルは`C:\php8-build\php-dev\vs16\x64\deps\bin`にあります(必要なものが全部あるのかはわからない…)。表示されている`～.dll`をそのフォルダから探し出し、`php.exe`があるフォルダにコピーすると正常に動作するはずです。  
![](https://images.microcms-assets.io/assets/aa728ef13efd493bb761daa672fe743f/b8bd2e19c3d74ea18df82032199b1ed9/201127_153512_WindowsSandboxClient_DKPdWmVkep%5B1%5D.png)  
私はごちゃごちゃするのも嫌だったので、`php.exe`を含む必要と言われたファイルのみ別のフォルダにコピーして実行できるようにしてみました。

## 終わりに

疲れました。いや、Linuxでffmpegのビルドとかは多少やったことあれどそれ以外でコマンドラインによるビルドとかしたことない(Visual Studio経由はあっても)ので仕組みの理解に結構頭を悩ませました。  
とはいえど、ネット上に素晴らしい記事があって分かり易かったので非常に助かりました…。それでもこの解説記事で4000文字くらい書いたと思います。

## 参考文献

- [How to build PHP on Windows](https://medium.com/@erinus/how-to-build-php-on-windows-a7ad0a87862a)