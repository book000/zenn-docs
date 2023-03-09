---
title: IMEのローマ字入力をかな入力に切り替える(コマンドライン・レジストリで)
emoji: ⌨
type: tech
topics: ["windows"]
published: true
---

いつもかな入力でタイピングをしているのだが、学校の共用コンピュータがサインイン時に設定変更されかな入力が保持されないので、コマンドラインで変更するための備忘録。
なお、毎度リセットされてしまうのでスタートアップにすら入れられず、起動時にわざわざ bat ファイルを実行している…。

## 注意事項

この記事ではレジストリを操作するコマンドを実行します。操作を誤ってしまったり、バージョンなどが違うなどの原因で動作しなくなる可能性があります。
毎度のことですが、**この記事に記載されている内容を実行し、発生したいかなる問題について執筆者は一切責任を負いません。自己責任でお願いします。**

## 環境

- OS: Windows 10 1809 (Build 17763.348)（`winver` コマンドで確認）
- MSIME バージョン: 10.0.17763.1（`C:\Windows\System32\IME\IMEJP\imjpuexc.exe` のファイルバージョンで確認）

## 結論

先に結論を書きます。

`HKEY_CURRENT_USER\Software\AppDataLow\Software\Microsoft\IME\15.0\IMEJP\MSIME` の kanaMd を変更することでかな入力・ローマ字入力を切り替えることができます。
かな入力であれば `0x00000001 (1)`、ローマ字入力であれば `0x00000002 (2)` となります。データ種類は 16 進数（`REG_DWORD`）です。

## 方法

### 1. レジストリ エディタを起動する

`Windowsキー+R` やコマンドプロンプト、PowerShell などで `regedit` を実行し、レジストリ エディタを起動しましょう。

### 2. ツリーを操作し、「MSIME」を開く

以下の順番でツリーを操作し開いてください。

1. `HKEY_CURRENT_USER`
2. `Software`
3. `AppDataLow`
4. `Software`
5. `Microsoft`
6. `IME`
7. `15.0`
8. `IMEJP`
9. `MSIME`

もしくは、ウィンドウ上部のアドレスバーに `コンピューター\HKEY_CURRENT_USER\Software\AppDataLow\Software\Microsoft\IME\15.0\IMEJP\MSIME` と入れて Enter しても表示されると思います。

### 3. 値を変更する

開くと、中央に「`kanaMd`」というキー（欄）が現れます。そこを右クリックし、`修正(M)` をクリック、「値のデータ」に `1`、「表記」で 16 進数を選択し、OK をクリックしましょう。

ここまで作業が終わると、多分かな入力に切り替わっているかと思います。  
これをコマンド 1 つで行ってしまいましょう。

```powershell
reg add HKEY_CURRENT_USER\Software\AppDataLow\Software\Microsoft\IME\15.0\IMEJP\MSIME /v kanaMd /t REG_DWORD /d 1 /f
```
