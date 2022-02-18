---
title: Linux で script コマンドを使用してコマンド実行ログを記録する
emoji: 📽️
type: tech
topics: ["linux", "centos"]
published: true
---

複数人で同一のサーバを管理していると、何かの問題が起きたときに「それが誰がなにをしたために起こったのか」がわからなくなりがちなので、ログを記録しておくことが重要。  
とはいえ、毎回操作時にスクリーンショットを取ったり手動でログを記録したりするのは面倒なので、自動化しておくと便利。

この記事では、`script` コマンドを用いたログ記録と、SSH 接続時に自動で `script` によるログ記録を開始するようにする設定、そのほか `script` コマンドの活用方法についてまとめておく。

## 環境

- CentOS 7.8
- GNU bash 4.2.46(2)-release

## script コマンドとは

![](https://storage.googleapis.com/zenn-user-upload/faa935de31e8d379d631380b.gif)

参考: [SCRIPT - JM プロジェクト (linuxjm.osdn.jp)](https://linuxjm.osdn.jp/html/util-linux/man1/script.1.html)

`script ファイル名` でファイルに作業ログを記録してくれる。`-a` オプションを付ければ、既存のファイルに追記してくれる。  
記録したファイルのことは「タイプスクリプト」と呼ばれる。プログラミング言語とは違う。

ターミナルに表示された Raw テキストデータがそのままログに書き込まれるので、文字色変更やカーソル移動などのエスケープシーケンスも全部まとめて書き込まれている。タイプしたテキストもすべて記録されているので、下手にミスタイプするとそれまで記録されてしまう。

![](https://storage.googleapis.com/zenn-user-upload/41152cf5655109b68155f91c.png)

これを人間の目で読むのはさすがに厳しいので、`more` コマンドや `scriptreplay` コマンドを用いて読むことが多い。しかし、`scriptreplay` の場合は記録時に `script --log-timing=タイミングファイル名 ファイル名` でタイミングファイルを書き出す必要がある。  
ここでは `scriptreplay` での閲覧（再生）について解説しないので、 `scriptreplay --help` や `man scriptreplay` などのヘルプやマニュアルを読んでほしい。

## SSH 接続時、自動で script 記録を実施させる

さて本題。

作業時にいちいち `script xxxxxx.log` と実行してから作業するのは面倒だし、`script` コマンドの実行を忘れてしまうかもしれない。ならば、普段から `script` コマンドのログを取ってしまえばよい。
というわけで、SSH 接続時に自動的に `script` によるログ記録を開始するように設定する。

保存先ファイルは `/var/log/scripts/<ログインユーザー名>/<IPアドレス>_<ログ記録開始日時>.log` になるようにする。

結論としては、以下を `/etc/profile` の末尾に追記すればよい。

@[gist](https://gist.github.com/book000/2bf133fc79a7f2326d2466c3f8fb84cb)

`$PPID` には、自身の親プロセス名を返す。`ps aux` コマンドを実行したとき、`ps` コマンドプロセスの親は SSH のホストプロセスである `sshd` であれば SSH 経由で実行されたと判断できる。

ログイン元の IP アドレスを取得するために、 `w -i` の出力を加工して取得する必要があった。`w -i` の出力では端末デバイスの表示に `pts/1` というような形式で表示される。

```shell
[#1 tomachi@Comet2 12:50:57 ~]$ w -i
 12:51:00 up 2 days,  6:49,  4 users,  load average: 0.39, 0.34, 0.32
USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT
tomachi  pts/2    xxx.xxx.xx.xxx   10:32    4.00s  0.13s  0.00s w -i
```

現在の端末デバイスファイルを取得するには `tty` コマンドで実行できるが、出力は `/dev/pts/1` というような形式（実体ファイルの完全パス）である。  
なので、`/dev/` 部分を `sed` コマンドで取り除いて、`w -i` の結果を `grep` することで、接続元の IP アドレスを取得している。

もし、IP アドレスやログインユーザー名以外の情報をファイル名やディレクトリ名に設定したいなら、`grep` やら `sed` やら `awk` やらで加工して設定してしまえば可能。

Gist に置いたので、`curl https://gist.githubusercontent.com/book000/2bf133fc79a7f2326d2466c3f8fb84cb/raw/417621b4f1391a13d83c83d6677d82e587549d05/script-logging.sh >> /etc/profile` とかすれば適当に導入できる。

## script コマンドの活用方法

[nwtgck さんの piping-server](https://github.com/nwtgck/piping-server)（[Qiitaの解説記事](https://qiita.com/nwtgck/items/78309fc529da7776cba0#%E3%82%BF%E3%83%BC%E3%83%9F%E3%83%8A%E3%83%AB%E3%81%AE%E7%94%BB%E9%9D%A2%E3%82%92%E5%85%B1%E6%9C%89%E3%81%99%E3%82%8B)）を使えば、操作中のターミナルを他者と共有できる。この用途で使ったことはないが、非常におもしろい発想だと思っている。

## 参考文献

- [scriptとpsacctでオペレーションログを記録する - DevelopersIO](https://dev.classmethod.jp/articles/logging_operation_using_script_and_psacct/)
- [SCRIPT - JM プロジェクト (linuxjm.osdn.jp)](https://linuxjm.osdn.jp/html/util-linux/man1/script.1.html)
- [ネットワーク越しでパイプしたり、あらゆるデバイス間でデータ転送したい！ - Qiita](https://qiita.com/nwtgck/items/78309fc529da7776cba0)
- [nwtgck/piping-server](https://github.com/nwtgck/piping-server)

記事を書いている途中に見つけた [ログインしたユーザーの操作ログを自動的に取る - TechRacho](https://techracho.bpsinc.jp/yamasita-taisuke/2014_04_03/16278) では、親プロセス名ではなく `$SHLVL` や `$PS1` の存在有無などで判断している様子。どっちが良いのやら…？
