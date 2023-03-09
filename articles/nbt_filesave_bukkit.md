---
title: BukkitプラグインでNBTデータをファイル保存する
emoji: 📂
type: tech
topics: ["minecraft", "java", "bukkit", "spigot", "papermc"]
published: true
---

プラグインを作っている最中にクリックイベントなどがついた本を保存しなければならない機会があり、NBT データごと保存するのに手こずったので備忘録。

:::message alert
以下の方法ではできなくなりました。
独自でリフレクションとか使って対応するのが面倒になったので、[NBT API](https://www.spigotmc.org/resources/nbt-api.7939/) ([GitHub](https://github.com/tr7zw/Item-NBT-API)) を使って NBT データを取得しています。[NMSManager の置き換えコード](https://github.com/jaoafa/MyMaid4/blob/a104a0fa6f0cc76b5081100f039cc42b2d8a8a2e/src/main/java/com/jaoafa/mymaid4/lib/NMSManager.java)
:::

## 注意事項

この記事に記載されている内容を実行し、発生したいかなる問題について執筆者は一切責任を負いません。自己責任でお願いします。

## 環境

- Minecraft 1.12.2（後述するリフレクションを使用する方法であれば 1.16.5 等でも使用可能）
- CraftBukkit version: Git-Spigot-642f6d2-ab13683
- APIVersion: 1.12.2-R0.1-SNAPSHOT

## CraftBukkit が Maven に追加できる場合

Maven への詳しい説明はしませんが、CraftBukkit を何かしらの手段で Maven に追加できる場合はこの方法が楽です。（Spigot）

### セーブ

保存は簡単。

1. まず、`org.bukkit.inventory.ItemStack` から `net.minecraft.server.v1_12_R1.ItemStack` に変換する必要があるので、`org.bukkit.craftbukkit.v1_12_R1.inventory.CraftItemStack` の `asNMSCopy` メソッドを使う。
2. 取得した ItemStack から、`net.minecraft.server.v1_12_R1.NBTTagCompound` を得るために `nmsItem.getTag()` を使う。
3. 取得した `NBTTagCompound` を `toString()` する。
4. `toString()` で取得できた String が NBT タグ情報。適当に保存する。

保存は `YamlConfiguration(FileConfiguration)` で保存するなり、`FileWriter` を使って保存してもよし。
なお、ここで取得した NBT タグ情報は `/give` のデータタグと同じなので、1.12.2 なら `/give @p <item> 1 0 <NBTタグ>` で give できる。

```java
ItemStack item = player.getInventory().getItemInMainHand(); // ここでは例としてプレイヤーのメインハンドのアイテムを取得。
net.minecraft.server.v1_12_R1.ItemStack nmsItem = CraftItemStack.asNMSCopy(item); // 1
NBTTagCompound nbttag = nmsItem.getTag(); // 2
String tag = nbttag.toString(); // 3
save(tag); // 4
```

### ロード

1. セーブの 4 で保存したものをロードする。`YamlConfiguration.loadConfiguration` とか `FileReader` とか。
2. ロードした NBT タグを保持させる `net.minecraft.server.v1_12_R1.ItemStack` を作る。`getById` なのでアイテムの数値 ID を使う。（記入済みの本なら `387` など）
3. `MojangsonParser` を使って NBT タグをパースする。`net.minecraft.server.v1_12_R1.NBTBase` が返る。
4. 2 で作った `ItemStack` に NBT タグを設定する。この際 `NBTTagCompound` にキャストする。
5. `net.minecraft.server.v1_12_R1.ItemStack` から `org.bukkit.inventory.ItemStack` に変換するために `org.bukkit.craftbukkit.v1_12_R1.inventory.CraftItemStack` の `asBukkitCopy` メソッドを使う。

```java
String tag = load(); // 1

net.minecraft.server.v1_12_R1.ItemStack nmsItem = new net.minecraft.server.v1_12_R1.ItemStack(Item.getById(1)); // 2
NBTBase nbtbase = MojangsonParser.parse(tag); // 3
nmsItem.setTag((NBTTagCompound) nbtbase); // 4
ItemStack item = CraftItemStack.asBukkitCopy(nmsItem); // 5
```

## CraftBukkit が Maven に追加できない場合

CraftBukkit を Maven に追加できない場合（複数人開発で BuildTools を強制できないなど）の場合はリフレクションを使って頑張るしかありません。

以下は、私が作った ItemStack から NBT タグを取得できるようにしたライブラリコードの Gist リンクです。

https://gist.github.com/book000/e42baf896f8d56f017905edbe96c9705

これをプロジェクトに追加し、 `NMSManager.getNBT(ItemStack)` を実行すれば String で NBT タグの文字列が返ってきます。
