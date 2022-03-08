---
title: "Renovate を使ってほぼ完全自動で依存パッケージをアップデートする"
emoji: "📦"
type: "tech"
topics: ["renovate", "githubactions"]
published: true
---

[Renovate](https://www.whitesourcesoftware.com/free-developer-tools/renovate/) を使って、人の手を介さずに利用している依存パッケージをアップデートしてみます。

:::message alert
依存パッケージを自動アップデートすることで、プロジェクトに影響を及ぼす可能性があるケースがあります。  
一時期話題になった [faker.js や color.js の開発者が意図的に改ざんした事件](https://www.itmedia.co.jp/news/articles/2201/11/news160.html) は記憶に新しいですね。  
「自動で処理する」ということのメリットとデメリットを把握して利用しましょう。
:::

## 環境

- Renovate [v32.0.3](https://github.com/renovatebot/renovate/releases/tag/32.0.3)
- GitHub Actions Runner [v2.288.1](https://github.com/actions/runner/releases/tag/v2.288.1)
- Ubuntu 20.04.3 LTS (`ubuntu-latest`)

## Renovate とは

- [renovatebot/renovate - GitHub](https://github.com/renovatebot/renovate)

1. `package.json` や `pom.xml`、`composer.json` といった依存パッケージを定義しているファイルを読み取り
2. それらのパッケージに新しいバージョンがないかどうかを確認し
3. 新しいバージョンがあれば依存パッケージ定義ファイルを更新し、Pull Request を作成する

という依存パッケージのアップデート手順を自動化する GitHub App / サービスです。

GitHub には Dependabot という同じようなものがあるのですが、Dependabot には以下の問題があったので使わなくなりました。

- この記事の表題である、自動マージをするのがたいへん。
  - ちょっとブランチプロテクトをかけていると、パーソナルアクセストークンから `@dependabot merge` してもマージしてくれなかったり、ガン無視されたりする…
- `.github/dependabot.yml` を定義して設定した場合、Fork 先リポジトリでも Dependabot が動作する [dependabot/dependabot-core#2804](https://github.com/dependabot/dependabot-core/issues/2804)
  - Issue を見ると、いつまで経っても修正されないからこの仕様で作成されたプルリクからメンション爆撃しますみたいなこともやっていてもうひどいことに
- ベースブランチが更新された際の自動リベースタイミングがめちゃくちゃ遅い
  - 複数の Dependabot によるプルリクが作成されたとき、1 つをマージすると `yarn.lock` などがコンフリクトするが、この時にすぐベースブランチをもとに再作成してくれない…

## 設定

### CI ワークフローの作成

Renovate を使うにあたり、CI ワークフローを作りましょう。  
依存パッケージに破壊的な変更（e.g., 利用しているメソッドが削除される、期待する結果と変わる）が加わった時にその Pull Request をマージしないようにしなければなりません。

具体的なワークフローは省きますがユニットテストや e2e テストなどをある程度網羅したワークフローを作ることをお勧めします。

JetBrains がやっと GitHub Actions で動くコード品質チェックツールを出したので、このへんも参考にしてください: [雪猫さんによる解説記事](https://zenn.dev/snowcait/articles/973fc4ce5e639d)

### Renovate をインストールする

![](https://storage.googleapis.com/zenn-user-upload/1cb0faf50250-20220308.png)

[GitHub Marketplace の Renovate ページ](https://github.com/marketplace/renovate#marketplace-plans-container) から、インストールする対象のアカウントを選択し `Install it for free` をクリックしてインストール画面に進みます。

![](https://storage.googleapis.com/zenn-user-upload/4bd1e2992e40-20220308.png)

`$0 / month` でフリープランが選択されていることを確認し（そもそも現時点で Renovate にはフリープランしかないのですが）、`Complete order and begin installation` をクリックします。

![](https://storage.googleapis.com/zenn-user-upload/ffadc2534392-20220308.png)

アカウント選択時にオーガニゼーションを選択した場合、インストールページに進むと、オーガニゼーションすべてのリポジトリにインストールするか一部の選択したリポジトリにインストールするかを訊かれます。

- `All repositories` を選択すれば現在あるリポジトリすべてにインストールされます。
  - この場合、初期セットアップの Pull Request がすべてのリポジトリに作成されます。
  - 既存のリポジトリが少ないのであればこれでもかまいません。
- `Only select repositories` を選択すると、指定したリポジトリだけに Renovate をインストールできます。
  - 個人的にはこちらをお勧めします。
  - リポジトリ作成時にインストールする GitHub App を選べますし、Renovate を動作させたくないリポジトリがある場合に上記の `All repositories` では除外設定ができません（たぶん…）。

インストールしたい種別を選べたら、Renovate が要求する権限[^1]が正しいことを確認し `Install` をクリックします。

これで、あなたのオーガニゼーション or アカウントに Renovate をインストールできたはずです。

### Renovate をセットアップする

![](https://storage.googleapis.com/zenn-user-upload/c3b8b6c4759d-20220308.png)

インストールが終わって少し経つと、インストール対象にしたリポジトリに `Configure Renovate` というタイトルで Pull Request が作成されます。

デフォルトでは `config:base` を読み込むだけとなっているのですが、これだと「ほぼ自動化」はできないので以下のように変えます。

```json
{
  "extends": ["config:base"],
  "ignorePresets": [":prHourlyLimit2"],
  "timezone": "Asia/Tokyo",
  "dependencyDashboard": false,
  "automerge": true,
  "branchConcurrentLimit": 0
}
```

変える手順についてですが、GitHub Desktop で Pull Request をクローンして編集してコミットしてもよいですし、Web GUI 上で `Files changed` タブ → `renovate.json` ファイルの「・・・」→ `Edit file` から編集してもかまいません。
マージした後に編集すると Dependency Dashboard が作成されてしまうのでマージ前に編集することをお勧めします。

上記の設定は

- 1 時間あたりに 2 Pull Request までに抑える処理を無効化
- タイムゾーンを `Asia/Tokyo` に指定
- Dependency Dashboard ([こういうやつ](https://github.com/jaoafa/MyMaid4/issues/612)) を無効化
- オートマージを有効化
- ブランチに対して作成する Pull Request 数の制限を無効化

編集後、マージすれば Renovate が動き出します 👏

## ブランチプロテクトの設定

リポジトリ `Settings` タブ → 左側 `Branches` → `Add rule` でブランチに対する制限（プロテクト）の設定ができます。

最低限、`Require status checks to pass before merging` およびその中の `Require branches to be up to date before merging` にチェックが入っていれば大丈夫だと思われます。

`Require a pull request before merging` の `Require approvals` を設定する場合は、[renovate-approval](https://github.com/apps/renovate-approve) という GitHub App を入れると Renovate が作成した Pull Request に対してのみ自動で Approve するようになり、手動でのレビューが不要になります。
しかし、`Require review from Code Owners` をオンにしてしまうと [`CODEOWNERS` には GitHub App を設定できない](https://github.com/renovatebot/renovate-approve-bot/issues/29) ので自動でのマージができなくなります。

## Dependabot を無効化する

Renovate を設定し運用し始めたら、基本的には Dependabot は不要なので無効化してしまいましょう。

![](https://storage.googleapis.com/zenn-user-upload/b4888cc0de7b-20220308.png)

リポジトリ個々で無効化する場合は、リポジトリ `Settings` タブ → 左側 `Code security and analysis` → `Dependabot security updates` を `Disable` で無効化できます。

![](https://storage.googleapis.com/zenn-user-upload/f20e30897b3a-20220308.png)

オーガニゼーション全体で無効化する場合は、オーガニゼーション `Settings` タブ → 左側 `Code security and analysis` → `Dependabot security updates` を `Disable all` で無効化できます

一部のパッケージ管理ツール[^2]は Renovate が管理しないようで Dependabot は通知するけど Renovate は通知しない…というケースがあることはあるので、両方有効にするのも 1 つの手だと思います。

[^1]:
    ここでは、Dependabot alerts ・管理設定・オーガニゼーションのメタデータへのアクセス、
    Pull Request の Workflow チェック状態（？）・リポジトリのコード・コミットの状態・ Issue ・ Pull Request・GitHub ワークフローへのアクセスと書き込み権限、ユーザーのメールアドレスへのアクセス権限を付与します。

[^2]:
    具体的には、`yarn.lock` のみに定義されている依存パッケージ（依存パッケージが依存するパッケージ）を Renovate は追跡しません。
    例として `discord.js` が依存する `node-fetch` の `< 2.6.7` には [脆弱性がありました](https://github.com/advisories/GHSA-r683-j2x4-v87g) が、Dependabot しかこれを通知しませんでした。
