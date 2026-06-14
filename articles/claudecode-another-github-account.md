---
title: Claude Code からの Git 操作で異なる GitHub アカウントを使用させる
emoji: 🔑
type: tech
topics: ["claudecode", "git", "github"]
published: true
---

Claude Code から Git や GitHub を操作する際に、普段使う GitHub アカウントとは異なるアカウントでクローン・コミット・PR 作成をするための設定のメモ。

## 経緯

普段、GitHub アカウントとして [book000](https://github.com/book000) を使っているが、生成 AI が台頭し自身も Claude Code をはじめとして生成 AI エージェントでコードを書くようになってから、自分が書いたコード（≒コントリビュート）と生成 AI に指示して実装させたものと、コミッターや PR の作者を分けたいと思うようになった。  
私は割と PR ありきでの開発（別ブランチでの開発 → PR の作成 → セルフレビュー → マージ）をしているので、生成 AI エージェントが作成したソースコードに対してのレビューで、Approve / Request changes を付けられないのが嫌だったというのもある。

GitHub では、1 人の個人は無料アカウントを 1 つまで保持するのが基本となっているが、「マシンユーザー（マシンアカウント）」という考え方があり、これを含めると無料アカウントを 2 つまで保持できる。

> 1 人の個人または 1 法人が維持できる無料アカウントは 1 つのみです
> マシン アカウントは、自動化タスクを実行するためだけに使用されます。 複数のユーザーがマシン アカウントのアクションを指示できますが、アカウントのオーナーはマシンのアクションに対して最終的な責任を負います。 お客様は、無料個人アカウントの他に無料マシン アカウントを 1 つだけ維持できます。

https://docs.github.com/ja/site-policy/github-terms/github-terms-of-service#3-account-requirements

> ユーザーアカウントは人間が使用するものですが、GitHub のアクティビティを自動化するアカウントを作成できます。 この種類のアカウントは、マシン ユーザーと呼ばれます。

https://docs.github.com/ja/get-started/learning-about-github/types-of-github-accounts

これに基づき、[akubiusa](https://github.com/akubiusa) というアカウントを取得し、原則生成 AI エージェントからのコミット・PR はこのアカウントを用いて作成するようにしている。
