---
title: PHP 7.4.5を導入してみる (CentOS 7)
emoji: 
type: tech
topics: ["php"]
---

2020/03/19にリリースされた、PHP 7.4.4をCentOSに入れてみます。

## 注意事項

この記事に記載されている内容を実行し、発生したいかなる問題について当サイト管理者は一切責任を負いません。自己責任でお願いします。

## 基礎情報

- [PHP 7.4.5 CHANGELOG](https://www.php.net/ChangeLog-7.php#7.4.5)

## 環境

### CentOS

- OS: CentOS 7.7.1908
- `cat /etc/*-release`
- アップデート前バージョン: 7.3.1
- `php -v`

## アップデート作業

すべての作業を`root`または`sudo`で行っているものとして記載します。

### 0. 必要に応じて、epel-releaseとRemiリポジトリをインストールしておきます。

```
yum install epel-release
rpm -ivh http://ftp.riken.jp/Linux/remi/enterprise/remi-release-7.rpm
```

### 1. php7.4があるかどうかを確認しておきます。

`yum list php74* --enablerepo=remi`を実行し、php7.4が存在するかを確認しておきます。  
さらに`yum info php74-php-cli`を実行しバージョンを確認しておきましょう。私の環境ではこう表示されておりました。

```
利用可能なパッケージ
名前                : php74-php-cli
アーキテクチャー    : x86_64
バージョン          : 7.4.4
リリース            : 1.el7.remi
容量                : 3.4 M
リポジトリー        : remi-safe
要約                : Command-line interface for PHP
URL                 : http://www.php.net/
ライセンス          : PHP and Zend and BSD and MIT and ASL 1.0 and NCSA and
                    : PostgreSQL
説明                : The php74-php-cli package contains the command-line
                    : interface executing PHP scripts,
                    : /opt/remi/php74/root/usr/bin/php, and the CGI interface.
```

### 2. インストールします。

`sudo yum install php74 php74-php-mbstring php74-php-gd php74-php-mysql php74-php-pdo --enablerepo=remi`でphp7.4と他の関連のものをインストールします。

#### 3. PHPのバージョンを確認しましょう。

`php74 -v`を実行し、PHPのバージョンを確認しましょう。これが7.4.5になっていればインストール成功です。