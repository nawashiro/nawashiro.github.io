---
title: "中二階について"
date: "2026-10-05T20:18:01+09:00"
---
- categories:
	- [📃下書き](categories-drafts.md)
- tags:
	- [🏷️ソーシャルメディア](tags-social-media.md)
- topics:
	- [理想のソーシャルメディア](240613-ideal-social-media.md)
	- [WebHashtagというものもあるよ](20260911-about-tag-mention-to-asadaame5121-net.md)

<data class="p-category mezzanine-channel" value="8PCdVGs2"></data><!-- 中二階 -->

<span class="p-category hidden">ソーシャルメディア</span>

---

<p><img class="u-featured" src="https://img.nawashiro.dev/attachments/20261005-mezzanine.webp" alt="中二階でくつろぐふたり。"></p>

<p class="e-bridgy-mastodon-content e-bridgy-bluesky-content p-summary">中二階について考えていて、最近やっと腑に落ちた。これはおもしろい。</p>

<p class="e-bridgy-mastodon-content e-bridgy-bluesky-content p-summary">写真: <a href="https://unsplash.com/ja/@anniespratt?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Annie Spratt</a>さんが撮影。<a href="https://unsplash.com/ja/%E5%86%99%E7%9C%9F/%E5%B1%85%E5%BF%83%E5%9C%B0%E3%81%AE%E8%89%AF%E3%81%84%E3%83%AA%E3%83%93%E3%83%B3%E3%82%B0%E3%83%AB%E3%83%BC%E3%83%A0%E3%81%A7%E3%83%AD%E3%83%95%E3%83%88%E3%81%A8%E5%A4%A7%E3%81%8D%E3%81%AA%E7%AA%93%E3%81%8C%E3%81%82%E3%82%8A%E3%81%BE%E3%81%99-ac5ksdFJa0U?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>より。</p>

## TOC

## これはなに？

[Nighthaven](https://bsky.app/profile/moja.blue) 氏が考案した。[$cT7aZ](https://bsky.app/hashtag/%24CT7AZ) みたいなランダムな記号をタグにする。ハッシュタグと違ってテーマがない。勝手にどんどん作れる。

- 共通の話題がなんとなくある。明示はされない。
- 小さな空間だ。巨大なフィードに放り出されない。
- 誰でも始められる。識別子はただのランダムな文字列だ。

> 使い方はシンプルだ。好きな文字列を決めて、紙にでも鉛筆で書いておけばいい。それが自分の周波数になる。あとは誰かがそこにチューニングしてくるのを待つだけ。ダイヤルが合った瞬間、TL を超えた接続が生まれる。 [$cT7aZ](https://bsky.app/hashtag/%24CT7AZ)
> 
> [Nighthaven, 2026](https://bsky.app/profile/moja.blue/post/3mfgwqvu5cs2e)

> チャンネルにテーマを添えたのは入口にすぎない。 [$xS0yV](https://bsky.app/hashtag/%24XS0YV) に「最近知って驚いたこと」と書いたが、そこで何が語られるかは使う側が決める。揺れ動き、収斂し、また発散する。タグに意味がないからこそ、文脈の変化を受け入れられる。`#読書` で映画の話をしたら場違いだ。中2階ではそれが起きない。 [$cT7aZ](https://bsky.app/hashtag/%24CT7AZ)
> 
> [Nighthaven, 2026](https://bsky.app/profile/moja.blue/post/3mflid5kksk25)

## なぜ腑に落ちなかったか

UI がよくない。謎の文字列を見てもよく分からなかった。

## なぜ腑に落ちたか

UI の問題だと気づいた。識別子は謎の文字列でよい。でも、それはユーザーに見せるべきじゃない。自分用にあだ名をつける方法が必要だ。

[バックチャネル](https://www.inkandswitch.com/backchannel/) [^1] という ID の考えかたを読んだときに頭のなかでつながった。

[^1]: [Karissa Rae McKelvey](https://okdistribute.xyz), [Benjamin Royer](https://twitter.com/hecceite), [Chris Sun (daiyi)](https://daiyi.co), [Cade Diehm](https://newdesigncongress.org), [Peter van Hardenberg](https://www.pvh.ca) (2021) [Backchannel](https://www.inkandswitch.com/backchannel/) _[Ink & Switch](https://www.inkandswitch.com/)_

あだ名をつけるシステムだ。出典は **携帯電話によくあるアドレス帳とおなじ** と説明している。あだ名は公開せず、自分の携帯電話のなかだけにある。

> Backchannel is formally a petname system between local-first names and globally unique symmetric cryptographic keys.
> 
> バックチャネルとは、厳密には、ローカルな名前とグローバルに一意な対称暗号鍵との間の愛称システムである。
> 
> [Karissa Rae McKelvey](https://okdistribute.xyz) et al., 2021

現実の人間関係を起点にする。つなかりたいとき、QR コードを交換したりする。互いに相手のあだ名をアドレス帳に記入しておく。

`@alice` みたいな、自分から名乗るプロフィールを用意しない。なりすましを防ぐためだ。`@a1ice` と `@alice` を見分ける人はそういない。

## Indie Web に導入できるか

[Octothorpe Protocol](https://docs.octothorp.es/) というのがある。比較的普及している個人サイト向けのハッシュタグだ。けれど、いささかシステムが巨大すぎるかもしれない。 [RDFトリプル](20260823-nawashiro-s-introduction-to-rdf-and-ontologies.md) まで使う本格仕様だ。[@asadaame5121.net](https://asadaame5121.net) さんの [入門記事](https://asadaame5121.net/Article/%E3%82%BF%E3%82%B0%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%A6%E5%80%8B%E4%BA%BA%E3%82%B5%E3%82%A4%E3%83%88%E3%82%92%E3%81%A4%E3%81%AA%E3%81%92%E3%82%8B(%E3%83%96%E3%83%AD%E3%83%BC%E3%82%AC%E3%82%B9%E3%83%882026_day5).html) がわかりやすい。

シンプルなプロトコルもある。[@maril.blue](https://maril.blue/) さんが [WebHashtag](https://github.com/marukun712/WebHashtag/tree/main) というのを作っていた。参加するにはリンクを貼ってクリックするだけ、配信は Atom だけ、というスリムな仕組みだ。

## もっと単純にできる気もする

ここに [Webmention](20250709-share-your-indie-web-personal-website-on-social-media.md) するだけだ。

```html
<a href="https://mezzanine.example.com/"></a>
<data class="p-category mezzanine-channel" value="8PCdVGs2"></data>
```

受け手が `p-category` 別に Atom フィードを配信してくれれば行ける気がする。
