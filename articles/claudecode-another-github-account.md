---
title: Claude Code からの Git 操作で異なる GitHub アカウントを使用させる
emoji: 🔑
type: tech
topics: ["claudecode", "git", "github"]
published: true
---

Claude Code から Git や GitHub を操作する際に、普段使う GitHub アカウントとは異なるアカウントでクローン・コミット・PR 作成をするための設定のメモ。

## 経緯

:::message
長めの経緯なので読み飛ばしても問題ありません
:::

普段、GitHub アカウントとして [book000](https://github.com/book000) を使っているが、生成 AI が台頭し自身も Claude Code をはじめとして生成 AI エージェントでコードを書くようになってから、自分が書いたコード（≒コントリビュート）と生成 AI に指示して実装させたものと、コミッターや PR の作者を分けたいと思うようになった。  
私は割と PR ありきでの開発（別ブランチでの開発 → PR の作成 → セルフレビュー → マージ）をしているので、生成 AI エージェントが作成したソースコードに対してのレビューで、Approve / Request changes を付けられないのが嫌だったというのもある。

そのうえで、生成 AI エージェントに書かせたコードをコミットしたり PR を作成するアカウントを作成しようと考えた。

### GitHub における複数アカウントの管理

GitHub では、1 人の個人は無料アカウントを 1 つまで保持するのが基本となっているが、「マシンユーザー（マシンアカウント）」という考え方があり、これを含めると無料アカウントを 2 つまで保持できる。

> 1 人の個人または 1 法人が維持できる無料アカウントは 1 つのみです
> マシン アカウントは、自動化タスクを実行するためだけに使用されます。 複数のユーザーがマシン アカウントのアクションを指示できますが、アカウントのオーナーはマシンのアクションに対して最終的な責任を負います。 お客様は、無料個人アカウントの他に無料マシン アカウントを 1 つだけ維持できます。

https://docs.github.com/ja/site-policy/github-terms/github-terms-of-service#3-account-requirements

> ユーザーアカウントは人間が使用するものですが、GitHub のアクティビティを自動化するアカウントを作成できます。 この種類のアカウントは、マシン ユーザーと呼ばれます。

https://docs.github.com/ja/get-started/learning-about-github/types-of-github-accounts

これに基づき、[akubiusa](https://github.com/akubiusa) というアカウントを取得し、原則生成 AI エージェントからのコミット・PR はこのアカウントを用いて作成するようにしている。

### 同一マシン・ユーザー内での GitHub アカウントの切り替えの需要

私のメイン開発マシンは Windows だが、生成 AI エージェントにお任せしての開発がメインとなった最近はサーバ代わりの自宅 Ubuntu マシンに新しい OS ユーザーを作り、そのアカウントに akubiusa の認証情報を持たせて開発していた。

しかしながら、最近 Windows でのみ動作するアプリケーションを開発したくなった。しかし、そのために開発用途以外でも使っている Windows メイン機に OS ユーザーを作成しいちいち切り替えるのは面倒で、仕方なく book000 アカウントでコミット・PR 作成させていた。  
そのまま数か月間放置していたが、やはり生成 AI エージェントのアクティビティで草が生えるのは気持ち悪いし、セルフコードレビューもやりにくいので、重い腰を上げて対応したという経緯。

GitHub を CLI で操作できる gh コマンドを多用するので gh コマンドと、git 操作時の Git ユーザー情報、クローン・プッシュ時に使用する `github.com` への SSH 時に認証情報を切り替えてあげる必要がある。

## 環境

- Windows 25H2 (Build 26220.8457)
- OpenSSH_for_Windows_9.5p2, LibreSSL 3.8.2
- git version 2.54.0.windows.1
- gh version 2.93.0 (2026-05-27)
- 前提
  - 生成 AI エージェント用 GitHub アカウントはすでに作成済み
  - GitHub からのクローン・プッシュは HTTPS ではなく SSH で認証している

今回は Windows 環境で作業しているが、OS 依存の設定ではないので Linux 環境などでも実施可能な手順である。Windows 以外で行う際は適宜読み替えること。

## やること

1. 生成 AI エージェント用 GitHub アカウントでの gh 認証情報を作成
2. 生成 AI エージェント用 GitHub アカウントの SSH キーを作成
3. SSH キーを正しく使わせるように SSH config を作成する
4. `~/.claude/settings.json` を更新する

### gh 設定・認証情報を作成

Windows では、gh の設定情報は `%APPDATA%\GitHub CLI` にある。  
この設定情報のパスは、`GH_CONFIG_DIR` 環境変数で変更できる。

:::message
正確には、アクセストークンは Windows 資格情報マネージャーに記録されている。`%APPDATA%\GitHub CLI\hosts.json` で対象ユーザーを明示している形となっている。  
gh では複数アカウントでログインでき、`gh auth switch` でアカウントを切り替える機能はあるが、生成 AI エージェントが切り替え忘れてコミット・PR 作成をするケースが想像できるので、設定情報ごと分割する。
:::

今回は `%APPDATA%\GitHub CLI_akubiusa` に生成 AI エージェント用の設定・認証情報を作成することにする。以下のコマンドで認証する。

```powershell
PS C:\Users\tomachi> $env:GH_CONFIG_DIR="$env:APPDATA/GitHub CLI_akubiusa"
PS C:\Users\tomachi> gh auth login
```

いつもの gh の認証と同様に認証する。SSH キーの作成・登録は個人的なこだわりで自分で実施したく、No にしている。

```text
? Where do you use GitHub? GitHub.com
? What is your preferred protocol for Git operations on this host? SSH
? Generate a new SSH key to add to your GitHub account? No
? How would you like to authenticate GitHub CLI? Login with a web browser

! First copy your one-time code: XXXX-XXXX
Press Enter to open https://github.com/login/device in your browser...
✓ Authentication complete.
- gh config set -h github.com git_protocol ssh
✓ Configured git protocol
✓ Logged in as akubiusa
```

認証できたら、`GH_CONFIG_DIR` の値によって GitHub アカウントが切り替わることを確認する。

```text
PS C:\Users\tomachi> $env:GH_CONFIG_DIR=""
PS C:\Users\tomachi> gh auth status
github.com
  ✓ Logged in to github.com account book000 (keyring)
  - Active account: true
  - Git operations protocol: https
  - Token: gho_************************************
  - Token scopes: 'gist', 'read:org', 'repo', 'workflow'
PS C:\Users\tomachi> $env:GH_CONFIG_DIR="$env:APPDATA/GitHub CLI_akubiusa"
PS C:\Users\tomachi> gh auth status
github.com
  ✓ Logged in to github.com account akubiusa (keyring)
  - Active account: true
  - Git operations protocol: ssh
  - Token: gho_************************************
  - Token scopes: 'gist', 'read:org', 'repo'
```

### SSH キーを作成・GitHub に登録する

Git のクローン・プッシュ操作での、GitHub との認証は SSH で行うため、生成 AI エージェント用の SSH キーを作成する必要がある。  
メインアカウントの SSH キーは `~/.ssh/keys/github-com` に保存しているので、`~/.ssh/keys/github-com_akubiusa` に保存させた。

```text
PS C:\Users\tomachi> ssh-keygen -t ed25519
Generating public/private ed25519 key pair.
Enter file in which to save the key (C:\Users\tomachi/.ssh/id_ed25519): C:\Users\tomachi\.ssh\keys\github-com_akubiusa
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in C:\Users\tomachi\.ssh\keys\github-com_akubiusa
Your public key has been saved in C:\Users\tomachi\.ssh\keys\github-com_akubiusa.pub
The key fingerprint is:
...
The key's randomart image is:
+--[ED25519 256]--+
...
+----[SHA256]-----+
```

作成した公開鍵を、生成 AI エージェント用の GitHub アカウントで以下から登録する。

https://github.com/settings/keys

### SSH config を作成する

私の場合、`github.com`, `gist.github.com` の接続時に正しく SSH キーを使わせるため、SSH config (`%USERPROFILE%\.ssh\config`) として以下を定義している。  
これにより、`~/.ssh/keys/github-com` を参照して認証するような設定となっている。

```text:%USERPROFILE%\.ssh\config
Host github.com
    HostName github.com
    IdentityFile ~/.ssh/keys/github-com
    TCPKeepAlive yes
    IdentitiesOnly yes
    ForwardAgent yes
    User git
    AddKeysToAgent yes

Host gist.github.com
    HostName gist.github.com
    IdentityFile ~/.ssh/keys/github-com
    TCPKeepAlive yes
    IdentitiesOnly yes
    ForwardAgent yes
    User git
    AddKeysToAgent yes
```

そのうえで、生成 AI エージェント用の SSH config として、`%USERPROFILE%\.ssh\config-akubiusa` を作成して以下を記載する。

```text:%USERPROFILE%\.ssh\config-akubiusa
Host github.com
    HostName github.com
    IdentityFile ~/.ssh/keys/github-com_akubiusa
    TCPKeepAlive yes
    IdentitiesOnly yes
    ForwardAgent yes
    User git
    AddKeysToAgent yes

Host gist.github.com
    HostName gist.github.com
    IdentityFile ~/.ssh/keys/github-com_akubiusa
    TCPKeepAlive yes
    IdentitiesOnly yes
    ForwardAgent yes
    User git
    AddKeysToAgent yes
```

SSH config が正しいことを確認するため、以下を実行して、生成 AI エージェント用アカウントで認証されることを確認する。

```text
PS C:\Users\tomachi> ssh -T git@github.com
Hi book000! You've successfully authenticated, but GitHub does not provide shell access.
PS C:\Users\tomachi> ssh -F C:/Users/tomachi/.ssh/config-akubiusa -T git@github.com
Hi akubiusa! You've successfully authenticated, but GitHub does not provide shell access.
```

### Claude Code の設定ファイルを編集する

`%USERPROFILE%\.claude\settings.json` を編集し、以下の環境変数をそれぞれ設定する。

- `GH_CONFIG_DIR`: gh の設定ファイルのパス
- `GIT_AUTHOR_NAME`: Git のコード執筆者の名前
- `GIT_AUTHOR_EMAIL`: Git のコード執筆者のメールアドレス
- `GIT_COMMITTER_NAME`: Git のコミットした人の名前
- `GIT_COMMITTER_EMAIL`: Git のコミットした人のメールアドレス
- `GIT_SSH_COMMAND`: Git における SSH コマンドとパラメータを変える

```json
{
  "env": {
    "GH_CONFIG_DIR": "C:\\Users\\tomachi\\AppData\\Roaming\\GitHub CLI_akubiusa",

    "GIT_AUTHOR_NAME": "akubiusa",
    "GIT_AUTHOR_EMAIL": "222856114+akubiusa@users.noreply.github.com",
    "GIT_COMMITTER_NAME": "akubiusa",
    "GIT_COMMITTER_EMAIL": "222856114+akubiusa@users.noreply.github.com",

    "GIT_SSH_COMMAND": "ssh -F C:/Users/tomachi/.ssh/config-akubiusa"
  }
}
```

なお、`~/.claude/settings.local.json` は読み込んでくれないようなので注意すること。

### 動作確認

Claude Code 内でのシェルモードで、以下をそれぞれ実行する。`!` を入れるとシェルモードになるので、そのあとに実行したいコマンドを入れる。

```shell
gh auth status
git var GIT_AUTHOR_IDENT
git var GIT_COMMITTER_IDENT
```

![](https://static.zenn.studio/user-upload/24e3c7a2b73d-20260614.png)

GitHub への認証情報が切り替わっているかどうかの確認に、生成 AI エージェント用アカウントしかアクセスできないプライベートリポジトリを作成し、クローンしてみてうまく動くか確認するとよい。
