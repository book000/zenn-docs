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

公式記事として [IPv6をVPSへ設定する](https://support.conoha.jp/v/setipv6/) があるのですが、CentOS での設定方法しか記載されていないので、この記事では Ubuntu でやってみます。  
サブドメインのために CNAME を使って対応させる話も含んでいます。

なお、Cloudflare で[プロキシ](https://developers.cloudflare.com/dns/manage-dns-records/reference/proxied-dns-records/)をオンにしている場合、**Cloudflare とオリジンサーバ間** を IPv6 対応させる話になります。Cloudflare では Enterprise プランでない限り [IPv6 Compatibility がオン](https://support.cloudflare.com/hc/en-us/articles/229666767-Understanding-and-configuring-Cloudflare-s-IPv6-support) になっているためです。

## 環境

この記事では、サンプルドメインとして `example.com` と `sub.example.com` を使います。

- 作業日: 2022/11/18
- ConoHaVPS
  - Ubuntu 22.04.1 LTS
  - nginx 1.21.4
- Cloudflare
  - ネームサーバを Cloudflare のネームサーバに設定し、Cloudflare で DNS 管理を行っていること

## 作業の流れ

ざっくり以下の流れで作業します。

1. nginx の設定を確認し、IPv6 が有効になっているかを確認します。
2. ConoHaVPS に IPv6 のアドレスを割り当てます。
3. Cloudflare の DNS 設定に、AAAA レコードを設定します。必要に応じて、CNAME レコードも設定します。
4. プロキシ設定を解除した上で、 `nslookup` を使って設定が反映されていることを確認します。

## 作業

### nginx の設定を確認

### VPS に IPv6 のアドレスを割り当てる

### AAAA レコードを設定する

#### CNAME レコードを設定する（サブドメインの場合）

### 設定反映を確認する
