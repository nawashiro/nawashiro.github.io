---
title: "ハッカソンでバーチャルな文通ができるNostrクライアント「NosHagaki」を作ってみた"
date: "2024-03-11"
---

よくきたな。俺は逆噴射なわしろだ。俺は普段ものすごい量の文章を書いているが、誰にも読ませるつもりはない。

嘘です。普段文章なんか書かないし、書いたとしても大部分をインターネットで世界中に公開しています。どうも、なわしろです。

今回、VR コミュニティのエンジニア集会で催されたハッカソンに参加しました。このテキストはそのレポートです。

## イベントについて

### VR コミュニティ エンジニア集会とは？

<ruby>慕狼<rp>(</rp><rt>しのがみ</rt><rp>)</rp></ruby>家の末っ子、慕狼ゆにさんが、いくつかの VR プラットフォームで運営している集会です。エンジニアならハード・ソフト・その他何でも OK、金曜日にお酒を飲んでワイワイしよう、というゆるい集会です｡毎回「進捗共有会」が催されます。飲んだお酒を進捗に数えても OK です。話が長くて制限時間を超えると、床が抜けて落とされます。

VRChat で開催する週と Cluster で開催する週があります。よくある誤解なのですが、これらのソフトは VR 機器が無くても、デスクトップで使えます。特に Cluster はMacやスマホからでも入れるので、敷居はかなり低いです。

### テーマ「バーチャルな〇〇」第一回エンジニア集会ハッカソン

最初の開催ということで、テーマは応募前から開示されていました。テーマは上記の通り、バーチャルと関係していれば何でも OK ということで、参加者は仮想マシンを作ったり、きゅうりに蜂蜜をかけてメロンの味を再現しようとしたり、面白い試みを色々やっていました。

バーチャルライフマガジンの取材もあったとのことですので、そちらのアクセスカウンターも回していただけると幸いです。

## NosHagaki について

https://nos-hagaki.vercel.app/

登場人物

- なわしろ：私。関西型言語を話す人の影響でエセ関西弁を喋る。
- ハ・サタン：旧約聖書に登場するキャラ。対立する者の意。神の命令を受けて人間に試練を与える。

### 構想

なわしろ「距離が離れていて時間がかかる文通アプリを作ってみてえなあ。ついでに相互運用可能ならもっとええなあ」

ハ・サタン「どした？」

なわしろ「スマホアプリで『Slowly』っていうのがあるんやけど、これを分散型 SNS でできないかと思ってるんよ。ActivityPub でできないかな」

ハ・サタン「あれ色々大変やで。SNS ひとつローンチするのと変わらんからな」

kaiji さん「Nostr はいいぞ」

https://zenn.dev/kaiji/articles/e855dccba73211

なわしろ「パスワードみたいなセンシティブなデータを扱わなくてもええんやね。なんか Nostr 良さそうやね。これでクライアント作りやってみよう」

ハ・サタン「位置情報はどうするん？他のクライアント使ってる人からは取れんやろ」

なわしろ「あんまり現実の位置にこだわらなくてもええんじゃない？個人情報だし、気にする人もいるやろ。公開鍵からランダム生成すれば解決や」

ハ・サタン「それだと海に住んでる人も発生するのと違うか？地球の七割は海やで」

なわしろ「それは…うーん、陸地を細かく区分けして番号振って扱うとか…いや難しいな…せや！」

> 「陸地を当てるまでサイコロを振り直せばいいじゃない！」
>
> なわしろ

ハ・サタン「けっこう愚かな方法だと思うで、それ。マイニングか？まあええか。どうやって陸地かどうか判定するんや？」

なわしろ「容量とライセンスがいい感じの geojson を拾ってきたやで。これで地域名が取得できたら陸地と考える。住所が扱えるようになったし、すると距離とかかる日数もわかるはずだから、あとは予約投稿のような仕組みがあれば完成しそうやね」

ハ・サタン「Nostr には予約投稿無いで」

なわしろ「そうなの！？自分で作るしかないか…あらかじめ時刻がわかっているから、実際に投稿される時刻で署名してサーバーにとっておいて、時刻に達したら投稿する、というフローでいけば良さそうやね」

### 使用した技術

フレームワーク： Next.js

慣れていたし、フルスタックアプリを作るには都合が良さそうだったから。それに、デプロイ先として無料プランのある Vercel が使える。

DB：Postgres、KV（Redis）

Vercel で用意されていて便利そうだったから。

言語：TypeScript

静的型付けができた方が楽なのかな、という軽い気持ちで決めた。

Nostr ライブラリ：NDK

nostr-tools より使いやすそうだったから。IndexedDB を利用したキャッシュも備えている。

### タイムラインを作る

なわしろ「まずはタイムラインを作るで。とはいっても、ほとんど NDK が提供する機能に GUI を与えるだけや」

ハ・サタン「シングルトンインスタンスとして実装するのが望ましいと README に書いてあったので、そこだけ気をつけなあかんで」

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

なわしろ「あれ？キャッシュが作成されない。なんで？」

ハ・サタン（ほら言わんこっちゃない）

なわしろ「あ、クラスはシングルトン書いたけど、インスタンス作る時にシングルトンとして書いてなかった！」

ハ・サタン「キャッシュの機能もつけてたから気づいたものの、けっこう危ない間違いだと思うで」

```diff
-ndk: new NDKSingleton(),
+ndk: NDKSingleton.instance,
```

### すみかを計算する

なわしろ「公開鍵から乱数を生成して、地域名が取得できれば OK、できなければやり直し、というフローやで」

ハ・サタン「緯度の計算はどうするんや？緯度は単純な乱数だと南極点と北極点に住所が偏るで」

なわしろ「算数わからん」

ランダムな緯度経度を計算する方法ですが、迂曲余接ありました。あいにく私は算数に弱く、ましてや球面座標なんてやったこともありません。指摘してくれた方やプルリクエストを送ってくださった方もおり、現状は以下の式にしています。今後も変わる可能性はあります。

```ts
const longitude = rng() * 360 - 180;
const latitude = -Math.asin(2 * rng() - 1) * (180 / Math.PI);
```

なわしろ「geojson の中身はだいたいこんな感じやね」

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

`properties`に国名コードや日本語の地域名が入っています。

国の形は`coordinates`の中にポリゴンが書いてありますね。指定した点がポリゴンの中にあるか、という判定は`point-in-polygon`というそのものなライブラリがあったのでこれを使いました。

ハ･サタン「毎回 geojson を読み込むの、よくないと思うで」

なわしろ「IndexedDB にキャッシュしておくか。`zustand`と`idb-keyval`を使えば良さそうやね」

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

…

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

なわしろ「デプロイ先の Vercel には Postgres が用意されているけど、SQL を書くのはしんどい気がするな」

Google 先生「Object-Relational Mapping（オブジェクト関連マッピング、対象関係映射、ORM、O/RM）を使うと良い。例えば`prisma`というのがある」

登場人物が増えた「なわしろ」

`prisma`をインストールすると`prisma`ディレクトリに`schema.prisma`ファイルが生成されます。データベースやテーブルの設定を書いていきます。

```ts:prisma/schema.prisma
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

`Event`のここを注目してください。`SubmittedData`を親、`Event`を子として関連付けています。また、`SubmittedData`の行が消されたら自動的にこちらも消えるように指定しています。

```ts
SubmittedData   SubmittedData  @relation(fields: [submittedDataId], references: [id], onDelete: Cascade)
submittedDataId Int @unique
```

### API

なわしろ「DB へのインサートはこんな感じでええかな」

```ts
await prisma.submittedData.create({
  data: {
    sendDay: sendDay,
    relays: Array.from(outbox),
    event: {
      create: {
        kind: res.event.kind,
        content: res.event.content,
        pubkey: res.event.pubkey,
        created_at: res.event.created_at,
        address: res.event.tags[0][1],
        sig: res.event.sig,
        id: res.event.id,
      },
    },
    ip: ip,
  },
});
```

なわしろ「確か『しずかなインターネット』は一時間に 6 稿のレート制限があったな。あれ真似したい。Redis と`upstash/ratelimit`を使うと良いらしいな」

```ts
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(6, "1 h"),
});

export async function POST(req: NextRequest) {
  …
  const successIp = (await ratelimit.limit(ip)).success;
  if (!successIp) {
    return new Response(null, { status: 429 });
  }
  …
}
```

### ブロック

フェディバース「現在スパム bot が POST のみでアカウントを作れるサーバーを中心に猛威を奮っており、各所に管理人メールアドレスを使用した爆破予告が…」

なわしろ「サイバー攻撃めっちゃ怖い。Tor ブロックしたいなあ」

Google 先生「Tor は出口 IP リストを公開してるからブロックは難しくない。ただ、IP リストは動的に変わるので定期的な更新が必要」

なわしろ「30 分おきくらいに取得して Redis に格納して、一致したらブロックしておけばええか」

ハ・サタン「ちょい待ち、今どこにそれを実装した？」

なわしろ「リクエストが来た時に最初に実行される`middleware.ts`やけど」

ハ・サタン（やったなこいつ）

〜リリース後〜

Shino3「なんか nos-hagaki おちた」

なわしろ「わあ」

ハ・サタン「`middleware.ts`に書いたからやね。全てのリクエストに対して実行されるから、Redis へのリクエストが殺到したんや。投稿 API あたりに実装するのが妥当やね」

なわしろ「メンテ入りまーす」
