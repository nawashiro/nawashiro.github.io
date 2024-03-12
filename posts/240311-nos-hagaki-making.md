---
title: ハッカソンでバーチャルな文通ができるNostrクライアント「NosHagaki」を作ってみた
date: 2024-03-11
---

よくきたな。俺は逆噴射なわしろだ。俺は普段ものすごい量の文章を書いているが、誰にも読ませるつもりはない。
嘘です。普段文章なんか書かないし、書いたとしても大部分をインターネットで世界中に公開しています。どうも、なわしろです。
今回、VR コミュニティのエンジニア集会で催されたハッカソンに参加しました。このテキストはそのレポートです。

## イベントについて

### VR コミュニティ エンジニア集会とは？

<ruby>慕狼<rp>(</rp><rt>しのがみ</rt><rp>)</rp></ruby>家の末っ子、慕狼ゆにさんが、いくつかの VR プラットフォームで運営している集会です。エンジニアならハード・ソフト・その他何でも OK、金曜日にお酒を飲んでワイワイしよう、というゆるい集会です｡毎回「進捗共有会」が催されます。飲んだお酒を進捗に数えても OK です。話が長くて制限時間を超えると、床が抜けて落とされます。
VRChat で開催する週と Cluster で開催する週があります。よくある誤解なのですが、これらのソフトは VR 機器が無くても、デスクトップで使えます。特に Cluster はスマホからでも入れるので、敷居はかなり低いです。

### テーマ「バーチャルな〇〇」第一回エンジニア集会ハッカソン

最初の開催ということで、テーマは応募前から開示されていました。テーマは上記の通り、バーチャルと関係していれば何でも OK ということで、参加者は仮想マシンを作ったり、きゅうりに蜂蜜をかけてメロンの味を再現しようとしたり、面白い試みを色々やっていました。
バーチャルライフマガジンの取材もあったとのことですので、そちらのアクセスカウンターも回していただけると幸いです。

## NosHagaki について

https://nos-hagaki.vercel.app/

### 構想

登場人物
- なわしろ：私。関西型言語を話す人の影響でエセ関西弁を喋る。
- ハ・サタン：旧約聖書に登場するキャラ。対立する者の意。神の命令を受けて人間に試練を与える。

なわしろ「距離が離れていて時間がかかる文通アプリを作ってみてえなあ。ついでに相互運用可能ならもっとええなあ」
ハ・サタン「どした？」
なわしろ「スマホアプリで『Slowly』っていうのがあるんやけど、これを分散型 SNS でできないかと思ってるんよ。ActivityPubでできないかな」
ハ・サタン「あれ色々大変やで。SNSひとつローンチするのと変わらんからな」
kaijiさん「Nostrはいいぞ」

https://zenn.dev/kaiji/articles/e855dccba73211

なわしろ「パスワードみたいなセンシティブなデータを扱わなくてもええんやね。なんかNostr良さそうやね。これでクライアント作りやってみよう」
ハ・サタン「位置情報はどうするん？他のクライアント使ってる人からは取れんやろ」
なわしろ「あんまり現実の位置にこだわらなくてもええんじゃない？個人情報だし、気にする人もいるやろ。公開鍵からランダム生成すれば解決や」
ハ・サタン「それだと海に住んでる人も発生するのと違うか？地球の七割は海やで」
なわしろ「それは…うーん、陸地を細かく区分けして番号振って扱うとか…いや難しいな…せや！」

> 「陸地を当てるまでサイコロを振り直せばいいじゃない！」
> なわしろ

ハ・サタン「けっこう愚かな方法だと思うで、それ。マイニングか？まあええか。どうやって陸地かどうか判定するんや？」
なわしろ「容量とライセンスがいい感じの geojson を拾ってきたやで。これで地域名が取得できたら陸地と考える。住所が扱えるようになったし、すると距離とかかる日数もわかるはずだから、あとは予約投稿のような仕組みがあれば完成しそうやね」
ハ・サタン「Nostr には予約投稿無いで」
なわしろ「そうなの！？自分で作るしかないか…あらかじめ時刻がわかっているから、実際に投稿される時刻で署名してサーバーにとっておいて、時刻に達したら投稿する、というフローでいけば良さそうやね」

### 使用した技術

フレームワーク： Next.js
理由：慣れていたし、フルスタックアプリを作るには都合が良さそうだったから。それに、デプロイ先として無料プランのある Vercel が使える。

DB：Postgres、KV（Redis）
理由：Vercelで用意されていて便利そうだったから。

言語：TypeScript
理由：静的型付けができた方が楽なのかな、という軽い気持ちで決めた。

Nostr ライブラリ：NDK
理由；nostr-toolsより使いやすそうだったから。IndexedDB を利用したキャッシュも備えている。

### タイムラインを作る

まずはタイムラインを作りました。とはいっても、ほとんど NDK が提供する機能に GUI を与えるだけです。ただひとつ、シングルトンインスタンスとして実装するのが望ましいと README に書いてあったので、そこだけ気をつける必要があります（一敗）。では、敗因を見ていきましょう。
以下がクラスです。一緒にキャッシュも作成しているのがわかりますね。

```ts
import NDK from "@nostr-dev-kit/ndk";
import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";

export class NDKSingleton extends NDK {
  private static _instance: NDKSingleton;

  public static get instance(): NDKSingleton {
    if (!this._instance) {
      const dexieAdapter = new NDKCacheAdapterDexie({
        dbName: "ndk-cache",
      });
      this._instance = new NDKSingleton({ cacheAdapter: dexieAdapter });
    }

    return this._instance;
  }
}
```

これのインスタンスを作成するときに、`get instance`を作成したのをすっかり忘れて普通に作ってしまいました。以下が正誤です。

```diff
-ndk: new NDKSingleton(),
+ndk: NDKSingleton.instance,
```

キャッシュが作成されない症状が発生し、発見に至りました。気づけてよかったです。

### すみかを計算する

公開鍵から乱数を生成して、地域名が取得できれば OK、できなければやり直し、というフローです。

ランダムな緯度経度を計算する方法ですが、迂曲余接ありました。というのも、緯度はただランダムに出すだけだと北極点と南極点に集中してしまうのです。あいにく私は算数に弱く、ましてや球面座標なんてやったこともありません。指摘してくれた方やプルリクエストを送ってくださった方もおり、現状は以下の式にしています。今後も変わる可能性はあります。

```ts
const longitude = rng() * 360 - 180;
const latitude = -Math.asin(2 * rng() - 1) * (180 / Math.PI);
```

地域名と国の形を記憶したファイル、geojson の構造を見ていきましょう。

```ts
export interface GeoJSONFeature {
  type: string;
  properties: {
    iso: string; // ISO 3166-1 alpha-2 code
    pais: string;
    ja: string;
  };
  geometry: {
    type: string;
    coordinates: number[][][]; // MultiPolygon coordinates
  };
}
```

こんな感じです。`properties`に国名コードや日本語の地域名が入っています。
国の形は`coordinates`の中にポリゴンが書いてありますね。指定した点がポリゴンの中にあるか、という判定は`point-in-polygon`というそのものなライブラリがあったのでこれを使いました。

毎回 geojson を読み込むのもよくないなと思ったので、IndexedDB にキャッシュしておくようにしました。`zustand`と`idb-keyval`を使用しています。

```ts
import { createStore } from "zustand/vanilla";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";

export const IdbStorage: StateStorage = {
  getItem: async (name) => {
    // Exit early on server
    if (typeof indexedDB === "undefined") {
      return null;
    }
    const value = await get(name);
    console.log("load indexeddb called");
    return value || null;
  },
  setItem: async (name, value) => {
    // Exit early on server
    if (typeof indexedDB === "undefined") {
      return;
    }
    return set(name, value);
  },
  removeItem: async (name) => {
    // Exit early on server
    if (typeof indexedDB === "undefined") {
      return;
    }
    await del(name);
  },
};

...

interface State {
  features: GeoJSONFeature[];
  get: boolean;
}

const store = createStore(
  persist<State>(
    () => ({
      features: [],
      get: true,
    }),
    { name: "features-storage", storage: createJSONStorage(() => IdbStorage) }
  )
);
```
### データベース
デプロイ先のVercelにはPostgresが用意されています。しかし、SQLを書くのはしんどい気がする。
調べてみると、Object-Relational Mapping（オブジェクト関連マッピング、対象関係映射、以降ORM）とやらを使うと良いらしい。今回は`prisma`を使いました。
`prisma`をインストールすると`prisma`ディレクトリに`schema.prisma`ファイルが生成されます。データベースの設定やテーブルの設定を書いていきます。

```ts:schema.prisma
generator client {
  provider = "prisma-client-js"
}
 
datasource db {
  provider = "postgresql"
  // Uses connection pooling
  url = env("POSTGRES_PRISMA_URL")
  // Uses direct connection, ⚠️ make sure to keep this to `POSTGRES_URL_NON_POOLING`
  // or you'll have dangling databases from migrations
  directUrl = env("POSTGRES_URL_NON_POOLING")
}

model Event{
  id        String    @id
  SubmittedData   SubmittedData  @relation(fields: [submittedDataId], references: [id], onDelete: Cascade)
  submittedDataId Int @unique
  kind      Int
  content   String
  pubkey    String
  created_at  Int
  address   String
  sig       String
}

model SubmittedData {
  id        Int       @id @default(autoincrement())
  sended    Boolean   @default(false)
  createdAt DateTime  @default(now())
  sendDay   DateTime
  event     Event?
  relays    String[]
  ip        String
}
```
- generator