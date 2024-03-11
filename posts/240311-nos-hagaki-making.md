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

「距離が離れていて時間がかかる文通アプリ」というアイデアはスマホアプリ「Slowly」の影響を受けています。これを分散型 SNS でできないか、というのを去年から考えていました。
本格的に作り始めたのは今年の始め頃からです。そう、今年の初め頃なのです。後からハッカソンの募集を見かけ、テーマにバーチャルをこじつけました。

当初から相互運用性のある分散型 SNS プロトコルを使用したいと考えていました。最初は ActivityPub でできないか模索していました。しかし、ActivityPub でサーバーを立てるというのは、そのまま一つの SNS を発足させることを意味します。やることが…やることが多い…！ここで Nostr を使えばセンシティブなデータを扱わなくて済むという kaiji さんのブログを読み、こちらでの実装を決意しました。

https://zenn.dev/kaiji/articles/e855dccba73211

住所は公開鍵をシードに乱数を生成して作成します。しかし、陸地のみを指定したくて、どうすればいいだろうと悩みました。陸地を細かく区分けして地域として扱うとか色々考えましたが、最終的にとんでもなく頭がよくて素晴らしい方法に辿り着きました。

> 「陸地を当てるまでサイコロを振り直せばいいじゃない！」
> なわしろ

多分一番愚かな方法だと思います。マイニングかな？

陸地かどうか判定するために、容量とライセンスがいい感じの geojson を拾ってきました。これで地域名が取得できたら陸地と考えます。すみかに日本語の地域名が、消印に ISO 3166-1 の国名コードが表示されます。
海岸線が OpenStreetMap と比較して誤差を含むようですが、目を瞑りました。何も見えません。あと、北方領土がロシアだったりします。各国の主張には目を瞑りました。何も見えません。

さて、住所が扱えるようになり、すると距離とかかる日数もわかるはずなので、あとは予約投稿のような仕組みがあれば完成しそうです。あいにく、Nostr そのものにはそういった仕組みはないので、自分で作るしかありません。あらかじめ時刻がわかっているので、実際に投稿される時刻で署名してサーバーにとっておき、時刻に達したら投稿する、というフローで良さそうです。

### 使用した技術

フレームワークは Next.js を採用しました。慣れていたし、フルスタックアプリを作るには都合が良さそうだったからです。それに、デプロイ先として無料プランのある Vercel が使えます。
すると、使う DB は Vercel 側で用意されたものが便利です。Postgres、KV（Redis）です。
言語は TypeScript です。静的型付けができた方が楽なのかな、という軽い気持ちで決めました。
肝心の Nostr ライブラリですが、NDK というのが使いやすそうでした。また、IndexedDB を利用したキャッシュなども備えています。

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

ランダムな緯度経度を計算する方法ですが、迂曲余接ありました。というのも、緯度はただランダムに出すだけだと北極点と南極点に集中してしまうのです。あいにく私は算数に弱く、ましてや球面座標なんてやったこともありません。指摘してくれた方やプルリクエストを送ってくださった方もおり、現状は以下の式にしています。

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
