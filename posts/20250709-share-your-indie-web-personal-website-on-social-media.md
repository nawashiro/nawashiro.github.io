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

[indieauth](https://indieauth.com/) という聞きなれない認証を使うことになるだろう。これについてもいずれ加筆したい。

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

TODO: コードを記載する。

きみも気ままなインディーウェブ生活をしてみてくれ。

[](https://brid.gy/publish/bluesky) [](https://brid.gy/publish/mastodon)
