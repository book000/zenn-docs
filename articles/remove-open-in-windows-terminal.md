---
title: Windowsの右クリックメニューから「Open in Windows Terminal」を削除する
emoji: 
type: tech
topics: ["windows"]
---

Windows Terminalをインストール後、エクスプローラーの右クリックメニューに出てくる「Open in Windows Terminal」がいい加減うざったいので、それを削除する。  
  
![](https://images.microcms-assets.io/assets/aa728ef13efd493bb761daa672fe743f/0b318f8a54da458f977ab75bec3ed6e0/20210225-075335-explorer-jQu5OQoJPq%5B1%5D.png)

## 注意事項

この記事ではレジストリを操作します。操作を誤ってしまったり、バージョンなどが違うなどの原因でコンピューター自体が動作しなくなる可能性があります。  
**この記事に記載されている内容を実行し、発生したいかなる問題について当サイト管理者は一切責任を負いません。自己責任でお願いします。**

### 方法

#### 「レジストリ エディター」を開く

![](https://images.microcms-assets.io/assets/aa728ef13efd493bb761daa672fe743f/530d4d9fbca54d49ac27b667de360c2d/20210225-080119-NVIDIA_Share-nXOEkOl9kt%5B1%5D.png)  
次のいずれかの方法で、レジストリを編集できる「`レジストリ エディター`」を開く。

- Windowsキーを押して、「`レジストリ`」と検索し、「`レジストリ エディター`」を開く
- 左下スタートボタンを右クリックし「`ファイル名を指定して実行`」もしくは「`Windows + R`」を押して「`ファイル名を指定して実行`」ダイアログを開き、「`regedit`」と打ち込み「`OK`」を押し開く

#### 1. Shell Extensionsフォルダに移動する

![](https://images.microcms-assets.io/assets/aa728ef13efd493bb761daa672fe743f/7f3082d5420d45e29c0ddf432398f696/20210225-080047-regedit-hJL05A4AV3%5B1%5D.png)  
上部アドレス欄に「`HKEY_CURRENT_USER\SOFTWARE\Microsoft\Windows\CurrentVersion\Shell Extensions`」と打ち込み、Enterを押して移動する。

#### 2. 「Blocked」キーを作成する

![](https://images.microcms-assets.io/assets/aa728ef13efd493bb761daa672fe743f/b04c0848c2ef4eb4913f1db07316ead3/20210225-080305-HHg5ZvIdv6%5B1%5D.gif)  
左側ナビゲーションバーの「`Shell Extensions`」を右クリックし、「新規」→「キー」をクリック。出てきた入力欄に「`Blocked`」と打ち込む

#### 3. 「Blocked」キーの中に文字列の値を追加する

![](https://images.microcms-assets.io/assets/aa728ef13efd493bb761daa672fe743f/5705ee138df44802980cda1729b6ec2f/20210225-080616-PGPOloxroZ%5B1%5D.gif)  
先ほど作成した「`Blocked`」キーの中で「新規」→「文字列値」をクリックし、「`{9F156763-7844-4DC4-B2B1-901F640F5155}`」と打ち込む。

#### 4. エクスプローラーを再起動する

![](https://images.microcms-assets.io/assets/aa728ef13efd493bb761daa672fe743f/b248c54ae9bf4b788f1e09298343d742/20210225-081208-umLNCfuaFz%5B1%5D.png)  
レジストリ エディターを閉じ、タスクマネージャーを起動する。タスクマネージャーは以下のいずれかの方法で起動できる。

- タスクバーを右クリックし、「`タスク マネージャー`」をクリックする
- Windowsキーを押して、「`タスク`」と検索し、「`タスク マネージャー`」を開く（この際、`タスク スケジューラー` と間違えないように）
- 左下スタートボタンを右クリックし「`ファイル名を指定して実行`」もしくは「`Windows + R`」を押して「`ファイル名を指定して実行`」ダイアログを開き、「`taskmgr`」と打ち込み「`OK`」を押し開く

![](https://images.microcms-assets.io/assets/aa728ef13efd493bb761daa672fe743f/174bcef92ce9415785a291e5c013d295/20210225-081139-8UFoxAQHZW%5B1%5D.gif)  
エクスプローラーを起動していない場合は起動し、タスクマネージャー内の「エクスプローラー」を選択、右下の「再開」をクリックする。

#### 5. エクスプローラーを開き、右クリックメニューから項目が消えていることを確認

![](https://images.microcms-assets.io/assets/aa728ef13efd493bb761daa672fe743f/192853eec5ef4746938413bf2175c07c/20210225-081402-qPE9qBuXKl%5B1%5D.png)

### 参考

- [How to Remove ‘Open in Windows Terminal’ from Windows 10 Context Menu](http://farsilinux.org/how-to-remove-open-in-windows-terminal-from-windows-10-context-menu/)