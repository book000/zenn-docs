---
title: CentOS7 に Cureutils をインストールする
emoji: 🔥
type: tech
topics: ["linux", "centos", "centos7", "cureutils"]
published: true
---

この記事は Linux でのジョークプログラムとして割と有名で、[Twitter のシェル芸 Bot](https://twitter.com/minyoruminyon) でも一時期使われてた [Cureutils](https://github.com/greymd/cureutils) を CentOS 7 にインストールする備忘録記事です。
CentOS 7 では Python2.7 が入っており、なにもしてないとインストール時にエラーを吐くので `rbenv` を使ったバージョン変更も解説します。

どうでもよいけど Cureutils のロゴ良すぎるよね。（[Cureutils の GitHub の README.md](https://github.com/greymd/cureutils/blob/master/README.md) で見られます）

## 注意事項

**この記事に記載されている内容を実行し、発生したいかなる問題について執筆者は一切責任を負いません。自己責任でお願いします。**

## 環境

- 実施鯖: Comet
- CentOS 7.6.1810
- gem バージョン: 2.6.14
- Cureutils バージョン: 1.2.0
- rbenv バージョン: 1.1.2-2-g4e92322

## やり方

### 必須パッケージをインストールする

もし以下に記載するパッケージがインストールされてないのであれば、yum 等でインストールをしてください。

- Git
- gcc
- gcc-c++
- openssl-devel
- readline-devel

### rbenv をインストールする

まずは、Cureutils をインストールするために Ruby のバージョンを一時的に変更したいので、`rbenv` というものをインストールします。

#### rbenv のファイル群をダウンロード（クローン）する

ホームディレクトリの直下に `.rbenv` というディレクトリを作り、そこに `rbenv` のファイルをダウンロード（Git でクローン）します。

```shell
git clone https://github.com/rbenv/rbenv.git ~/.rbenv
```

ちなみに `sstephenson/rbenv` で解説している記事がありますが、執筆時現在アクセスすると `rbenv/rbenv` にリダイレクト（転送）されます。  
どっちでもかまいませんが `rbenv/rbenv` で良いと思います。

#### .bash_profile に環境変数（PATH）に rbenv のパスを追記させる

SSH などでの接続時など（bash 起動時）にロードされる `.bash_profile` というのがあります。
ここに、環境変数（PATH）に rbenv なパスを追記させるコードを書き、SSH などでの接続後に rbenv が使えるようにします。
なお、`.bash_profile` はユーザーごとですので、ここで説明しているように rbenv をインストールしてもほかのユーザー(ホームディレクトリが異なるユーザー)は利用できないことに注意してください。

以下の 2 つのコマンドを実行し、`.bash_profile` に書き込みます。
1 つめのコマンドは環境変数への追記コマンド、2 つめのコマンドは rbenv の初期処理（init）をさせるコマンドを書き込むコマンドです。

```shell
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bash_profile
echo 'eval "$(rbenv init -)"' >> ~/.bash_profile
```

実行し終えたら、SSH などを接続し直すか以下のコマンドを実行して `.bash_profile` を再度読み込みます。

```shell
source ~/.bash_profile
```

#### rbenv が使用できるか確認

`rbenv -v` を実行し、rbenv のバージョンが表示されるかどうかを確認しましょう。
`コマンドが見つかりません` や `command not found` などが出る場合はインストールに失敗しています。ここまでの作業でエラーなどが発生していないかどうかを確認してみてください。

#### rbenv でインストールするために、Ruby-build プラグインを導入する

実は、rbenv をインストールしただけでは rbenv を使って別のバージョンの Ruby をインストールできません。（`rbenv install` がない）

それをできるようにするために、`ruby-build` というプラグインを導入します。
以下のコマンドを実行しましょう。

```shell
git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build
```

これを導入すると、`rbenv install` が使用できます。

### Ruby 2.2.2 以上をインストールする

Cureutils の README.md にも以下のように記載があるとおり、インストールおよび実行には Ruby 2.2.2 以上が必要となります。

```text
Requirements
ruby >= 2.2.2
```

ですので、rbenv で Ruby の最新版をインストールします。  
`rbenv install -l` を実行してインストール可能な Ruby の一覧を表示できますが、TruffleRuby やら Rubinius(rbx)やらも表示されて見にくいので、`rbenv install -l | grep -G "^ 2\."` とか使って 2.x.x 系だけ表示させるとかするのが楽かと。
執筆時には以下のように表示されました。

```shell
[#21 tomachi@Comet 23:18:59 ~]$ rbenv install -l | grep -G "^  2\."
  2.0.0-dev
  2.0.0-preview1
  2.0.0-preview2
(略)
  2.6.0-preview1
  2.6.0-preview2
  2.6.0-preview3
  2.6.0-rc1
  2.6.0-rc2
  2.6.0
  2.6.1
  2.6.2
  2.6.3
  2.7.0-dev
```

2.7.0 の dev が利用できますが、とりあえずここでは最終安定版である 2.6.3 を選びます。実施時の使用可能バージョンに応じてインストールするバージョンを選択してください。  
インストールするには以下のコマンドを実行します。少し時間がかかりますので、お茶でも飲んで気長に待ちましょう。

```shell
rbenv install 2.6.3
```

`Installed ruby-2.6.3` などと出たら、インストール完了です。

#### 実行する Ruby のバージョンを指定する

一時的に Ruby のバージョンを切り替えます。今回は「ローカル」として、実行中のディレクトリ以下でのみそのバージョンで実行されるようにします。  
 以下のコマンドを実行します。

```shell
rbenv local 2.6.3
```

コマンドを実行すると、実行したカレントディレクトリに `.ruby-version` というファイルが生成されます。このファイルに選択したバージョンが入力されています。

#### バージョンに応じたコマンドの振り分けをさせる

`rbenv rehash` を実行すると、Ruby コマンドや gem コマンドなどをバージョンごとに振り分けさせるそうです。たぶん。
ですので、とりあえず実行しておきましょう。  
とりあえず、ここまで作業をすれば Cureutils をインストールする環境ができあがります。

### Cureutils をインストールする

Ruby のバージョンを変更したところで、やっと Cureutils をインストールできます。  
 ここからは簡単です。以下のコマンドを実行しましょう。

```shell
gem install cureutils
```

### cure コマンドが実行できるか確かめる

Cureutils のインストールができたら、さっそく `cure` コマンドを使ってみましょう。
`cure` と実行すると、使用可能なコマンドの一覧が出力されます。
詳しい使い方は [Cureutils の GitHub の README.md](https://github.com/greymd/cureutils/blob/master/README.md) をチェック。

## Ruby 2.1 で作業をしようとすると…

```shell
[#30 tomachi@Comet 22:53:11 ~]$ gem install cureutils
Fetching: thor-0.20.3.gem (100%)
Successfully installed thor-0.20.3
Fetching: concurrent-ruby-1.1.5.gem (100%)
Successfully installed concurrent-ruby-1.1.5
Fetching: i18n-1.6.0.gem (100%)
ERROR:  Error installing cureutils:
        i18n requires Ruby version >= 2.3.0.
```

と出る。Cureutils の Requirements 表記とズレているけど、まあ最新版をインストールするので問題なし。
