---
title: ConoHaVPS + Cloudflare で IPv6 に対応する
emoji: 6️⃣
type: tech
topics: ["conoha", "conohavps", "ubuntu", "cloudflare", "ipv6"]
published: true
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

- 作業日: 2022/11/18
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

ConoHa VPS 上で立てた **Ubuntu** では[^1]、立てた VPS に IPv6 のアドレスが割り当てられていないようです。

// ToDo: `ip addr show eth0` で...

以下の手順で割り当てられます。

まず、VPS に割り当てることのできる IPv6 アドレスとゲートウェイを調べる必要があります。

// ToDo: ConoHa ダッシュボードからこれらを調べる方法を書く

`/etc/netplan/10-gmovps.yaml` を `vim` などで開きます。`<IPV6-ADDRESS>` を先ほど調べた IPv6 アドレスに、`<GATEWAY-ADDRESS>` を先ほど調べたゲートウェイに書き換えた上で書き込んでください。

```yaml
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
適用後、`ip addr show eth0` を再度実行し IPv6 アドレスをきちんと振れているかを確認してください。以下のようになっていたら大丈夫です。

// ToDo: コマンドの実行結果

### AAAA レコードを設定する

#### CNAME レコードを設定する（サブドメインの場合）

### 設定反映を確認する

[^1]: 2021/05 に立てた CentOS 7 のサーバは IPv6 アドレスが割り当てられていたものの、この記事を書いているときに検証用に立てた Ubuntu のサーバ[^2]では割り当てられていなかったので、よくわかりません。IPv6 の DHCP をオンにしても振られませんでした。
[^2]: ConoHa さん、RAM 512 MB で Ubuntu 22.04 を立てると Kernel Panic する問題をなんとか解決していただけると非常にうれしいです…。参考: [Twitter での検索結果](https://twitter.com/search?q=512MB%20ConoHa%20Ubuntu&src=typed_query&f=live) <!-- markdownlint-disable-line MD053 -->
