---
title: ConoHaVPS + Cloudflare で IPv6 に対応する
emoji: 6️⃣
type: tech
topics: ["conoha", "conohavps", "ubuntu", "cloudflare", "ipv6"]
published: true
published_at: 2022-12-04 00:00
---

:::message
この記事は [ConoHa Advent Calender 2022](https://qiita.com/advent-calendar/2022/conoha) 4 日目（12 月 04 日）の記事です。

ConoHa 歴は 2017 年からなので、かれこれ 5 年くらい利用しています。このはちゃんカワイイ！
:::

ConoHa の VPS を IPv6 対応させて、Cloudflare の DNS に設定してみます。

公式記事として [IPv6 を VPS へ設定する](https://support.conoha.jp/v/setipv6/) があるのですが、CentOS での設定方法しか記載されていないので、この記事では Ubuntu でやってみます。  
サブドメインのために CNAME を使って対応させる話も含んでいます。

なお、Cloudflare で [プロキシ](https://developers.cloudflare.com/dns/manage-dns-records/reference/proxied-dns-records/) をオンにしている場合、**Cloudflare とオリジンサーバ間** を IPv6 対応させる話になります。Cloudflare では Enterprise プランでない限り [IPv6 Compatibility がオン](https://support.cloudflare.com/hc/en-us/articles/229666767-Understanding-and-configuring-Cloudflare-s-IPv6-support) になっているためです。

## 環境

この記事では、サンプルドメインとして `example.com` と `sub.example.com` を使います。

- 作業日: 2022/11/18, 2022/11/30
- ConoHa VPS
  - Ubuntu 22.04.1 LTS
  - nginx 1.21.4
- Cloudflare
  - ネームサーバを Cloudflare のネームサーバに設定し、Cloudflare で DNS 管理をしていること

## 作業の流れ

ざっくり以下の流れで作業します。

1. nginx の設定を確認し、IPv6 が有効になっているかを確認します。
2. ConoHa VPS に IPv6 のアドレスを割り当てます。
3. Cloudflare の DNS 設定に、AAAA レコードを設定します。必要に応じて、CNAME レコードも設定します。
4. プロキシ設定を解除したうえで、 `nslookup` を使って設定が反映されていることを確認します。

## 作業

### nginx の設定を確認

nginx の設定を確認し、IPv6 で Listen しているかを確認します。

`nginx.conf` などを確認し、`listen [::]:80;` などがあるかを確認するか、`sudo lsof -i:80` を実行して以下のように IPv6 で Listen しているかを確認してください。

```shell
$ sudo lsof -i:80
COMMAND   PID   USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
nginx   20637   root    6u  IPv4  73100      0t0  TCP *:http (LISTEN)
nginx   20637   root    7u  IPv6  73101      0t0  TCP *:http (LISTEN)
nginx   20638 nobody    6u  IPv4  73100      0t0  TCP *:http (LISTEN)
nginx   20638 nobody    7u  IPv6  73101      0t0  TCP *:http (LISTEN)
```

SSL/TLS のポートである 443 番ポートも IPv6 で Listen していることを確認してください。

### VPS に IPv6 のアドレスを割り当てる

この項では、以下の 3 つに分割して解説しています。

- VPS に IPv6 アドレスが割り当てられていないかを確認する
- 利用可能な 17 個の IPv6 IP アドレスを確認する
- IPv6 アドレスを割り当てる

#### VPS に IPv6 アドレスが割り当てられていないかを確認する

ConoHa VPS 上で立てた **Ubuntu** では[^1]、立てた VPS に IPv6 のアドレスが割り当てられていないようです。  
検証していた限り環境によってかなり状況が違いそうなので、まずは IPv6 のアドレスが VPS に割り当てられていないかどうかを確認しましょう。

コマンド `ip addr show eth0` を実行し、以下のように `inet6` から始まる行で `2400:8500:1302:776` から始まる IPv6 のアドレスがあれば割り当てられています。

```shell
$ ip addr show eth0
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 02:01:76:1b:72:94 brd ff:ff:ff:ff:ff:ff
    altname enp0s3
    altname ens3
    inet 111.11.111.111/23 metric 100 brd 111.11.111.111 scope global dynamic eth0
       valid_lft 64352sec preferred_lft 64352sec
    inet6 2400:8500:1302:776:111:11:111:111/64 scope global
       valid_lft forever preferred_lft forever
    inet6 fe80::1:76ff:fe1b:xxxx/64 scope link
       valid_lft forever preferred_lft forever
```

:::details 割り当てられていない場合

`inet6` の行はあるものの、リンクローカルアドレスしか設定されていません。

```shell
$ ip addr show eth0
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 02:01:76:1b:72:94 brd ff:ff:ff:ff:ff:ff
    altname enp0s3
    altname ens3
    inet 111.11.111.111/23 metric 100 brd 111.11.111.111 scope global dynamic eth0
       valid_lft 64352sec preferred_lft 64352sec
    inet6 fe80::1:76ff:fe1b:xxxx/64 scope link
       valid_lft forever preferred_lft forever
```

:::

割り当てられていない場合、VPS に IPv6 アドレスを割り当てる必要があります。

#### VPS に IPv6 アドレスが割り当てられていないかを確認する

まず、VPS に割り当てることのできる IPv6 アドレスとゲートウェイを調べる必要があります。  
[ConoHa ダッシュボード](https://manage.conoha.jp/Dashboard) にアクセスし、対象サーバのページを開きます。

![](https://storage.googleapis.com/zenn-user-upload/88efab885f97-20221130.png)

その後、「ネットワーク情報」タブを開き、「タイプ」を「IPv6」に変更します。  
[ConoHa では 1 つの VPS につき 17 個の IPv6 アドレスが割り+当てられている](https://www.conoha.jp/vps/function/additionalip/#:~:text=17%E5%80%8B%E3%81%AEIPv6%E3%82%A2%E3%83%89%E3%83%AC%E3%82%B9%E3%81%8C%E5%89%B2%E3%82%8A%E5%BD%93%E3%81%A6%E3%82%89%E3%82%8C%E3%81%BE%E3%81%99) ので、「IP アドレス」欄で 16 個の IPv6 アドレスを確認できます。

どのアドレスを使ってもよいのですが、とりあえずここではわかりやすいように一番上の IP アドレスをメモしておきましょう。

#### IPv6 アドレスを割り当てる

:::message
この記事では Ubuntu のみ解説しています。この項の作業は CentOS などでは設定方法が異なりますので、詳しくは [ConoHa 公式の記事](https://support.conoha.jp/v/setipv6/) などをご確認ください。
:::

`/etc/netplan/10-gmovps.yaml` を `vim` などで開きます。`<IPV6-ADDRESS>` を先ほど調べた IPv6 アドレスに、`<GATEWAY-ADDRESS>` を先ほど調べたゲートウェイに書き換えた上で書き込んでください。

```yaml:/etc/netplan/10-gmovps.yaml
network:
  ethernets:
    eth0:
      addresses:
        - <IPV6-ADDRESS>/64
      dhcp4: true
      dhcp6: true
      accept-ra: false
      optional: true
      routes:
        - to: default
          via: <GATEWAY-ADDRESS>
  version: 2
```

書き込んだあと、`sudo netplan apply` で適用できます。  
適用後、`ip addr show eth0` を再度実行し IPv6 アドレスをきちんと割り当てられているかを確認してください。  
`inet6` から始まる行で `2400:8500:1302:776` から始まる IPv6 のアドレスがあれば割り当てられています。

### AAAA レコードを設定する

A レコードを追加するときと同じように、IPv6 版の A レコードである AAAA レコードを追加しましょう。  
Cloudflare の DNS 設定から、以下のように AAAA レコードを追加してください。

![](https://storage.googleapis.com/zenn-user-upload/72876e8a1e50-20221201.png)

#### CNAME レコードを設定する（サブドメインの場合）

`sub.example.com` などのサブドメインも IPv6 対応する場合、CNAME レコードをひとつ追加するだけでサブドメイン毎に A レコードと AAAA レコードの 2 つを用意しなくて済むようになります。以下のように設定しましょう。

![](https://storage.googleapis.com/zenn-user-upload/1ddda6166b8e-20221201.png)

以下は実際に運用しているサーバの DNS 設定画面なのですが、A レコードと AAAA レコードがそれぞれ 1 つずつしかなく、それに紐づく CNAME レコードが複数あるだけなので見やすくなっています。

![](https://storage.googleapis.com/zenn-user-upload/2b63a62a2f7f-20221201.png)

### 設定反映を確認する

Cloudflare では Enterprise プランでない限り IPv6 Compatibility の関係で **クライアントと Cloudflare 間** は元から AAAA レコードが存在し IPv6 での接続が可能なので、Proxied されているレコードに関しては安直に `nslookup` しても本当に設定できているかわかりません。  
したがって、ここでは一時的に Cloudflare のプロキシ設定を解除し `nslookup` してみようと思います。

:::message alert
この作業は**公開されている Web サイトやドメインで行わないで**ください。設定を解除することでオリジンサーバの IP アドレスが漏れ、どこかに記録されてしまう可能性があります。
:::

対象レコードの `Proxy status` を `DNS only` にします。

![](https://storage.googleapis.com/zenn-user-upload/d8ea060a4fb1-20221201.png)

その後、手元のターミナルから `nslookup` してみます。

```shell
$ nslookup sub.example.com 1.1.1.1
Server:         1.1.1.1
Address:        1.1.1.1#53

Non-authoritative answer:
Name:   sub.example.com
Address: xxx.xx.xxx.xxx
Name:   sub.example.com
Address: 2400:8500:1302:776:xxx:xx:xxx:xxx
```

IPv4 のアドレスだけでなく、IPv6 のアドレスが表示されれば成功です。

[^1]: 2021/05 に立てた CentOS 7 のサーバは IPv6 アドレスが割り当てられていたものの、この記事を書いているときに検証用に立てた Ubuntu のサーバ[^2]では割り当てられていなかったので、よくわかりません。IPv6 の DHCP をオンにしても振られませんでした。
[^2]: ConoHa さん、RAM 512 MB で Ubuntu 22.04 を立てると Kernel Panic する問題をなんとか解決していただけると非常にうれしいです…。参考: [Twitter での検索結果](https://twitter.com/search?q=512MB%20ConoHa%20Ubuntu&src=typed_query&f=live) <!-- markdownlint-disable-line MD053 -->
