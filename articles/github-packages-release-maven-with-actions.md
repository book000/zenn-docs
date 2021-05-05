---
title: GitHub Actionsを使ってGitHub PackagesにMaven Packageを自動で公開する
emoji: 
type: tech
topics: []
---

コミットしたら自動でパッケージを公開してほしいケースがあったので、作った。

## やりたいこと

  
コミット・プッシュされたら 7 文字のハッシュ値をバージョンとしてリリース、パッケージを GitHub Packages で公開する。  
  
作業したリポジトリは [book000/GitHubActionsTest](https://github.com/book000/GitHub-Actions-Test)

## 方法

  
やることは 3 つ

1. `pom.xml` に設定を追記する
2. `deploy_settings.xml` を作る
3. GitHub Actions 用の YAML ファイルを書く

### pom.xml に設定を追記する

まず、 `artifactId` に大文字を含むなら小文字に変える。これをしないと deploy するときに `422 Unprocessable Entity` で怒られる。

#### `version` を引数で変更できるようにする

```
<version>${revision}</version>
```

  
これをすると `mvn deploy` のときに `-Drevision=xxx` でバージョンを指定できるようになる。一応次の設定をしてデフォルト値を設定しておく

```
<properties>
   <revision>1.0.0</revision>
</properties>
```

#### `maven-source-plugin` と `maven-javadoc-plugin` をビルドプラグイン設定に入れる

  
これをすることで、ソースと Javadoc もアップされるようになる

```
<build>
   <plugins>
       <plugin>
           <groupId>org.apache.maven.plugins</groupId>
           <artifactId>maven-source-plugin</artifactId>
           <executions>
               <execution>
                   <phase>package</phase>
                   <goals>
                       <goal>jar</goal>
                   </goals>
               </execution>
           </executions>
       </plugin>
       <plugin>
           <groupId>org.apache.maven.plugins</groupId>
           <artifactId>maven-javadoc-plugin</artifactId>
           <executions>
               <execution>
                   <phase>package</phase>
                   <goals>
                       <goal>jar</goal>
                   </goals>
               </execution>
           </executions>
       </plugin>
   </plugins>
</build>
```

#### `distributionManagement` の設定を追加する

  
OWNER と REPOSITORY は適当に置き換えること。

```
<distributionManagement>
   <repository>
       <id>github</id>
       <name>GitHub OWNER Apache Maven Packages</name>
       <url>https://maven.pkg.github.com/OWNER/REPOSITORY</url>
   </repository>
</distributionManagement>
```

### `deploy_settings.xml` を作る

  
ファイル名はなんでもよし。ほかのサイトでは `settings.xml` が一般的だったけど、何の設定かわからないから `deploy` と付け足。   
  
OWNER は適当に置き換えること。

```
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd">
   <servers>
       <server>
           <id>github</id>
           <username>OWNER</username>
           <password>${env.GITHUB_TOKEN}</password>
       </server>
   </servers>
</settings>
```

### GitHub Actions用のYAMLファイルを書く

  
ここでは、 `.github/workflows/maven-publish.yml` に書いている

```
name: Maven Package

on:
 push:
   branches: [ master ]
 release:
   types: [ created ]

jobs:
 build:
   runs-on: ubuntu-latest

   steps:
   - uses: actions/checkout@v2
   - name: Set up JDK 1.8
     uses: actions/setup-java@v1
     with:
       java-version: 1.8
       server-id: github
       settings-path: ${{ github.workspace }}

   - name: Cache local Maven repository
     uses: actions/cache@v2
     with:
       path: ~/.m2/repository
       key: ${{ runner.os }}-maven-${{ hashFiles('**/pom.xml') }}
       restore-keys: |
         ${{ runner.os }}-maven-

   - name: Build with Maven
     run: mvn -B package --file pom.xml

   - name: Set SHORT_SHA
     id: vars
     run: echo "::set-output name=SHORT_SHA::$(git rev-parse --short HEAD)"

   - name: Publish to GitHub Packages Apache Maven
     run: mvn -B -s $GITHUB_WORKSPACE/deploy_settings.xml clean deploy --batch-mode --no-transfer-progress -Drevision=${{ steps.vars.outputs.SHORT_SHA }}
     env:
       GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

  
`actions/cache@v2` でローカルリポジトリのキャッシュがされることを初めて知った。`Set SHORT_SHA` で 7 文字ハッシュ値の作成をしている。