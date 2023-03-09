---
title: Windowsの右クリックメニューから「Open in Windows Terminal」を削除する
emoji: 🖱️
type: tech
topics: ["windows", "windowsterminal"]
published: true
---

Windows Terminal をインストール後、エクスプローラーの右クリックメニューに出てくる「Open in Windows Terminal」があまりにもうざったいので、それを削除する。

![](https://storage.googleapis.com/zenn-user-upload/h1wbr66ee69944y5dtxhuml2nxfo)

## 注意事項

この記事ではレジストリを操作します。操作を誤ってしまったり、バージョンなどが違うなどの原因でコンピュータ自体が動作しなくなる可能性があります。  
**この記事に記載されている内容を実行し、発生したいかなる問題について執筆者は一切責任を負いません。自己責任でお願いします。**

### 方法

#### 「レジストリ エディタ」を開く

![](https://storage.googleapis.com/zenn-user-upload/ejwqx8jmc3p4jlle3w7a8altm098)

次のいずれかの方法で、レジストリを編集できる「`レジストリ エディター`」を開く。

- Windows キーを押して、「`レジストリ`」と検索し、「`レジストリ エディター`」を開く
- 左下スタートボタンを右クリックし「`ファイル名を指定して実行`」もしくは「`Windows + R`」を押して「`ファイル名を指定して実行`」画面を開き、「`regedit`」と打ち込み「`OK`」を押し開く

#### 1. Shell Extensions フォルダに移動する

![](https://storage.googleapis.com/zenn-user-upload/650y56q5m3hvyrtl8bjyxr2869j3)

上部アドレス欄に「`HKEY_CURRENT_USER\SOFTWARE\Microsoft\Windows\CurrentVersion\Shell Extensions`」と打ち込み、Enter を押して移動する。

#### 2.「Blocked」キーを作成する

![](https://storage.googleapis.com/zenn-user-upload/5kw2f89zkbo3bafphl1u4qm3yxdp)

左側ナビゲーションバーの「`Shell Extensions`」を右クリックし、「新規」→「キー」をクリック。出てきた入力欄に「`Blocked`」と打ち込む。

#### 3.「Blocked」キーの中に文字列の値を追加する

![](https://storage.googleapis.com/zenn-user-upload/vuc52054ojxfom3zu4733yjt6io3)

先ほど作成した「`Blocked`」キーのなかで「新規」→「文字列値」をクリックし、「`{9F156763-7844-4DC4-B2B1-901F640F5155}`」と打ち込む。

#### 4. エクスプローラーを再起動する

![](https://storage.googleapis.com/zenn-user-upload/7ukpsuuzh4g6vfhp7nacd14drzg8)

レジストリ エディタを閉じ、タスクマネージャーを起動する。タスクマネージャーは以下のいずれかの方法で起動できる。

- タスクバーを右クリックし、「`タスク マネージャー`」をクリックする
- Windows キーを押して、「`タスク`」と検索し、「`タスク マネージャー`」を開く（この際、`タスク スケジューラー` と間違えないように）
- 左下スタートボタンを右クリックし「`ファイル名を指定して実行`」もしくは「`Windows + R`」を押して「`ファイル名を指定して実行`」画面を開き、「`taskmgr`」と打ち込み「`OK`」を押し開く

![](https://storage.googleapis.com/zenn-user-upload/skw8awoiytme0rfob9g2csr2i8ja)

エクスプローラーを起動していない場合は起動し、タスクマネージャー内の「エクスプローラー」を選択、右下の「再開」をクリックする。

#### 5. エクスプローラーを開き、右クリックメニューから項目が消えていることを確認

![](https://storage.googleapis.com/zenn-user-upload/pmvzulokqpn3p42tkzl0bjv3anq9)

### 参考

- [How to Remove ‘Open in Windows Terminal’ from Windows 10 Context Menu](http://farsilinux.org/how-to-remove-open-in-windows-terminal-from-windows-10-context-menu/)
