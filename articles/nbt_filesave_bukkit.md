---
title: BukkitプラグインでNBTデータをファイル保存する (1.12.2)
emoji: 
type: tech
topics: ["minecraft","java"]
---

プラグインを作っている最中にクリックイベントなどがついた本を保存しなければならない機会があり、NBT データごと保存するのに手こずったので備忘録。  
  
追記: PaperMC 1.16.5 環境でこれを実装できていません。代替記事を作るかもしれません。

## 環境

- Minecraft 1.12.2
- CraftBukkit version: Git-Spigot-642f6d2-ab13683
- APIVersion: 1.12.2-R0.1-SNAPSHOT

## セーブ

保存は簡単。

1. まず、`org.bukkit.inventory.ItemStack` から `net.minecraft.server.v1_12_R1.ItemStack` に変換する必要があるので、`org.bukkit.craftbukkit.v1_12_R1.inventory.CraftItemStack` の `asNMSCopy` メソッドを使う。
2. 取得した ItemStack から、`net.minecraft.server.v1_12_R1.NBTTagCompound` を得るために `nmsItem.getTag()` を使う。
3. 取得した `NBTTagCompound` を `toString()` する。
4. `toString()` で取得できた String が NBT タグ情報。適当に保存する。

保存は `YamlConfiguration(FileConfiguration)` で保存するなり、`FileWriter` を使って保存してもよし。  
なお、ここで取得した NBT タグ情報は `/give` のデータタグと同じですので、1.12.2 なら `/give @p <item> 1 0 <NBTタグ>` で give できる。

```
ItemStack item = player.getInventory().getItemInMainHand(); // ここでは例としてプレイヤーのメインハンドのアイテムを取得。
net.minecraft.server.v1_12_R1.ItemStack nmsItem = CraftItemStack.asNMSCopy(item); // 1
NBTTagCompound nbttag = nmsItem.getTag(); // 2
String tag = nbttag.toString(); // 3
save(tag); // 4
```

## ロード

1. セーブの 4 で保存したものをロードする。`YamlConfiguration.loadConfiguration` とか `FileReader` とか。
2. ロードした NBT タグを保持させる `net.minecraft.server.v1_12_R1.ItemStack` を作る。`getById` なのでアイテムの数値 ID を使う。(記入済みの本なら `387` など）
3. `MojangsonParser` を使って NBT タグをパースする。`net.minecraft.server.v1_12_R1.NBTBase` が返る。
4. 2 で作った `ItemStack` に NBT タグを設定する。この際 `NBTTagCompound` にキャストする。
5. `net.minecraft.server.v1_12_R1.ItemStack` から `org.bukkit.inventory.ItemStack` に変換するために `org.bukkit.craftbukkit.v1_12_R1.inventory.CraftItemStack` の `asBukkitCopy` メソッドを使う。

```
String tag = load(); // 1

net.minecraft.server.v1_12_R1.ItemStack nmsItem = new net.minecraft.server.v1_12_R1.ItemStack(Item.getById(1)); // 2
NBTBase nbtbase = MojangsonParser.parse(tag); // 3
nmsItem.setTag((NBTTagCompound) nbtbase); // 4
ItemStack item = CraftItemStack.asBukkitCopy(nmsItem); // 5
```