---
title: "インディーウェブな個人サイトをSNSで共有する"
date: "2025-07-09"
---

[Brid.gyでウェブサイトを共有してみる](20250709-share-your-website-with-brid-gy.md)

どうやら実験は成功のようだ。各種 SNS での共有を自動的に行えるようになった。ほんとはセルフホストしたほうがいいのだが、今回はとにかく手軽に始める方法を使った。

## Webmention

既に Webmention のセットアップができていることを前提とする。けれども、一応簡単に説明しておこう。

Webmention はウェブを会話レイヤーにする技術だ。ほかのサイトと会話ができるようになる。

1. ウェブサイトに会話を受け取るエンドポイントを書いておく。
2. サイトを公開するとき、出版ソフトウェアがリンクを発見してクロールし、エンドポイントに通知する。
3. 受け取った会話を表示する。

こんな仕組みで動いている。

今回はとにかく横着を決め込む。エンドポイントも出版も第三者のサービスを使うのだ。

[webmention.io - indieweb camp](https://indieweb.org/webmention.io) を見ながらセットアップしていく。

[webmention.io](https://webmention.io/) は自分の代わりに動いてくれるエンドポイントだ。ここが代わりに会話を受け取ってくれるので、webmention.js とかで表示できるようになる。

[indieauth](https://indieauth.com/) という聞きなれない認証を使うことになるだろう。これはインディーのためのサインイン手段で、「X のわたし」や「Facebook のわたし」ではなく単に「わたし」、つまりドメイン名をつかう認証だ。やることは a タグあるいは link タグに `rel="me"` 属性をつけて、`href=` に各種サービスへのリンクを含めるだけだ。私は Github を使った。外部サービスを使いたくない場合は PGP 署名なども使える。

## 出版する

[Brid.gy](https://brid.gy/about) に SNS を登録する。Bluesky や Mastodon が可能だ。プロフィールに自分のウェブサイトのリンクがあれば自動的に登録されるが、手動でも設定できる。

Brid.gy がページを自動的に出版するためには、出版する意図があることを記述しておかねばならない。こんな感じにリンクを含めておく。

```html
<a href=" https://brid.gy/publish/bluesky "></a>
<a href=" https://brid.gy/publish/flickr "></a>
<a href=" https://brid.gy/publish/github "></a>
<a href=" https://brid.gy/publish/mastodon "></a>
```

あとは Brid.gy に POST すればクロールして出版してくれる。返却値に出版された SNS 上の投稿 URL が含まれるので、コメントを促すこともできる。

私は Obsidian で記事を書いているので、[Templater](https://github.com/SilentVoid13/Templater) で一度に行うスクリプトを書いた。

```js
async function share(){
	const url = `https://nawashiro.dev/posts/${tp.file.title}`;

	const bskyFormData = new FormData();
	const mstdnFormData = new FormData();
	
	bskyFormData.append("source", url);
	bskyFormData.append("target", "https://brid.gy/publish/bluesky");

	mstdnFormData.append("source", url);
	mstdnFormData.append("target", "https://brid.gy/publish/mastodon");
	
	try {
		const webmentionUrl = "https://brid.gy/publish/webmention";

		const bskyResponse = await fetch(webmentionUrl, {
			method: "POST",
			body: bskyFormData,
		});
		
		const mstdnResponse = await fetch(webmentionUrl, {
			method: "POST",
			body: mstdnFormData,
		});
		
		const bskyResult = await bskyResponse.json();
		const mstdnResult = await mstdnResponse.json();
		
		if(typeof bskyResult.url === "undefined" || typeof mstdnResult.url === "undefined"){
			return `\nfail:\n${bskyResult.error}\n${mstdnResult.error}`
		}
		
		return `\n---\n\nここまで読んでくれてありがとう。よければでいいのだが、フィードバックがほしい。 [Bluesky](${bskyResult.url}) や [Mastodon](${mstdnResult.url}) から返信するとウェブサイト内にも反映される。健闘を祈る。`;
	} catch (e) {
		return `\nfail: ${e}`;
	}
}
return share();
```

きみも気ままなインディーウェブ生活をしてみてくれ。

[](https://brid.gy/publish/bluesky) [](https://brid.gy/publish/mastodon)

---

ここまで読んでくれてありがとう。よければでいいのだが、フィードバックがほしい。 [Bluesky](https://bsky.app/profile/nawashiro.dev/post/3ltjovv6x7z2s) や [Mastodon](https://gamelinks007.net/@nawashiro/114822993017570937) から返信するとウェブサイト内にも反映される。健闘を祈る。