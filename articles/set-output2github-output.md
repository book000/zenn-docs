---
title: 手間をかけずに set-output から $GITHUB_OUTPUT を使うように置き換える
emoji: 🥱
type: tech
topics: ["github", "githubactions"]
published: true
---

2022 年 10 月 11 日に以下の記事が GitHub Changelog に公開されました。

https://github.blog/changelog/2022-10-11-github-actions-deprecating-save-state-and-set-output-commands/

結果を別ジョブやステップで利用できるようにするため、従来は `::set-output` や `::save-state` から始まる文字列を echo していました。セキュリティ向上の観点から 2023 年 6 月 1 日以降これらを無効化するとのアナウンスでした。  
ランナーバージョン `2.298.2` 以降を利用したアクションの結果ページを見ると、以下のようなアノテーションが発生していることが確認できます。

![](https://storage.googleapis.com/zenn-user-upload/dfb3b0176b68-20221105.png)

これを解決するために、`$GITHUB_OUTPUT` や `$GITHUB_STATE` を使うようワークフローを修正しなければならないのですが、大量のプロジェクトを管理している場合これを修正するのは非常に骨が折れます。

だったら、半自動化して楽に作業しようというのが今回の記事のネタです。めんどくさがりなので。

## 環境

- Windows 10 21H2 (Build 19044.2130)
- PowerShell 7.2.7
- Python 3.10.4
- [janeklb/gh-search](https://github.com/janeklb/gh-search) 0.8.3
- Windows Subsystem for Linux (v2)
  - Ubuntu 20.04.3 LTS

## 作業方針

やるべきことは「対象となるリポジトリ・ファイルの抽出」と「ワークフローファイルの修正」です。

対象となるリポジトリ・ファイルの抽出についてですが、できれば公式の [GitHub CLI](https://cli.github.com/) を使いたいです。しかしドキュメントを眺める限り「ソースコードを検索する機能」は GitHub CLI にない[^1]ので、別のアプローチで収集する必要があります。  
[GitHub Code Search](https://cs.github.com) などを使ってちまちま作業する手段もあるのですが、ここではなるべく楽に作業したいので [janeklb/gh-search](https://github.com/janeklb/gh-search) を使おうと思います。[^2]

ワークフローファイルの修正についてですが、これは `sed` を使って置き換えてしまうのが楽だと思っています。  
ただ失敗の可能性を考慮して自動処理前にブランチを切っておくことと、コミット自体は Visual Studio Code などを使って手動で実行します。

## 作業

作業方針を簡単に決めたので、それに沿って作業をします。

### 対象となるリポジトリ・ファイルの抽出

とりあえず、[janeklb/gh-search](https://github.com/janeklb/gh-search) をインストールします。

```powershell
pip install gh-search
```

[janeklb/gh-search](https://github.com/janeklb/gh-search) を使うにあたって、Personal access token が必要です。  
[Personal access token の作成ページ](https://github.com/settings/tokens) から作成します。7 日間限定で `repo` に権限を振ればよさそうです。  
[Fine-grained personal access token](https://github.blog/2022-10-18-introducing-fine-grained-personal-access-tokens-for-github/) でもかまいません。

取得した Personal access token は環境変数 `GITHUB_TOKEN` に設定しておきます。

```powershell
$env:GITHUB_TOKEN="ghp_XXXXXXXXXXXXXXXXXXXXXXXXXX"
```

次に対象とするユーザーやオーガニゼーションを決めます。ここでは私のアカウント `book000` と個人用オーガニゼーション `tomacheese` を対象とすることにします。  
これらに対して `gh-search` コマンドを使って検索を実施しましょう。

```shell
gh-search user:book000 set-output -o json > book000.json
gh-search user:tomacheese set-output -o json > tomacheese.json
```

`-o json` をつけることで JSON として吐き出すことができるので、これをファイルに流し込みます。  
結果は JSON 配列になっているので、作業しやすいように加工しましょう。ここでは Notion で見たかったので Python を使って CSV に変換します。

@[gist](https://gist.github.com/book000/5592cf3ebe3034f02bc50c3b3dfffc2c)

`merged.csv` を使って Notion に CSV インポートしてゴニョゴニョしてとりあえず見やすくしておきました。

![](https://storage.googleapis.com/zenn-user-upload/1ac5470ab621-20221105.png)

### ワークフローファイルの修正

とりあえずワークフローを `sed` で修正するシェルスクリプトを作ります。

```sh
#!/bin/sh
sed -i -E 's/echo "::set-output name=(.+?)::(.+?)"/echo "\1=\2" >> $GITHUB_OUTPUT/g' .github/workflows/*.yml
sed -i -E 's/echo "::save-state name=(.+?)::(.+?)"/echo "\1=\2" >> $GITHUB_STATE/g' .github/workflows/*.yml
```

これをアクセスしやすい場所（`C:\replace-set-output.sh` とか…）に一時的に置いておきます。

次に、各リポジトリ下で打つコマンドを作ります。  
`ci/set-output` ブランチをチェックアウトして、WSL の Ubuntu で先ほど作成したシェルスクリプトを実行するコマンドをワンライナーで作ってしまいましょう。

```bash
git checkout -q -b ci/set-output upstream/master ; git checkout -q -b ci/set-output upstream/main ; git checkout -q -b ci/set-output origin/master ; git checkout -q -b ci/set-output origin/main ; bash -c "/mnt/c/replace-set-output.sh"
```

`ci/set-output` ブランチは `upstream` か `origin` の `master` か `main` から作成させます。  
`git checkout` は元ブランチがない場合や作成先ブランチがすでにある場合はブランチを作成しないので、この書き方をすれば `upstream/master`, `upstream/main`, `origin/master`, `origin/main` の順番で元ブランチがあれば `ci/set-output` ブランチを作ります。

あとはこれを各リポジトリで実行し、実行結果を Visual Studio Code で確認したうえでコミットを作成・Pull Request を作成すれば楽に作業できます。

[GitHub Pull Requests and Issues](https://marketplace.visualstudio.com/items?itemName=GitHub.vscode-pull-request-github) 拡張機能をいれれば、Visual Studio Code 上で Pull Request も作成できてさらに楽ちん。

[^1]: [GitHub CLI の search マニュアル](https://cli.github.com/manual/gh_search) によれば、検索できるのは Issue と PR とリポジトリだけなようです。
[^2]: GitHub CLI に実装されていない以上、どんな悪いことをしてコード検索なんてしているんだろうと思ったら、GitHub の [Search code REST API](https://docs.github.com/en/rest/search#search-code) を使っているだけでした。てっきりスクレイピングでもしているのかと…。
