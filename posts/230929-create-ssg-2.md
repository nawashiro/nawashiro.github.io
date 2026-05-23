---
title: "個人サイトに動的ogを作ってつまづいたところ"
date: "2023-09-29 15:32"
---
<a class="card md:card-side my-4 bg-white shadow-sm" href="https://yahoo.jp/Zr3a5S">
  <figure class="px-5 py-5">
    <img
      src="https://item-shopping.c.yimg.jp/i/n/bookoffonline_0018735950_i_20240727133611"
      alt="Book"
      class="rounded-xl max-h-48 max-w-48 object-contain" />
  </figure>
  <div class="card-body">
    <span class="badge badge-primary">広告</span>
    <span class="card-title line-clamp-1">6ステップでマスターするHTML+CSSデザイン最新標準</span>
  </div>
</a>

このサイトを作ろうとしたときのはなしその 2。

## 経緯

なわしろ「ブログ書いたら Twitter とかで共有したいぞ」

識者「動的 og が必要だね。Vercel を利用して動的 og を生成する小さいサービスを作ってみるといいよ」

## vercel/og チュートリアル

なわしろ「今度は古い情報に踊らされないぞ。検索すると `og-image` の使用例が最初に出てくるけど、GitHub に但し書きが書いてある」

> Warning This repo is outdated and only works with Node.js 14. Please use @vercel/og for new projects.
>
> If you have a problem that reproduces using the playground, please create an issue in the satori repo.
>
> For all other issues with @vercel/og, please reach out to Vercel Support.

なわしろ「[公式の案内](https://vercel.com/blog/introducing-vercel-og-image-generation-fast-dynamic-social-card-images) に載ってる [例](https://vercel.com/docs/functions/edge-functions/og-image-generation/og-image-examples) を見て頑張ってみよう」

なわしろ「背景デザインには [haikei](https://app.haikei.app/) を使おう」

## つまづき encodeURI

なわしろ「うーん」

識者「どうしたんだい？」

なわしろ「動的 og を設定したんだけど」

`GitHub Pages & Next.js で個人サイト作ってつまづいたところ`

なわしろ「って表示してほしいのに」

`GitHub Pages`

なわしろ「になっちゃうんだよね」

識者「`&` が含まれているけど、URI エンコードはかけてるんだよね？」

なわしろ「こんな感じにかけてるよ」

```jsx:layout.jsx
<meta
  property="og:image"
  content={`https://example.com/api/og?title=${encodeURI(
    title ? title : siteTitle
  )}`}
/>
```

識者「ああ、それは `encodeURI` を使用しているからだよ」

### encodeURIComponent

識者「正しくは `encodeURIComponent` を使うんだよ」

```diff:layout.jsx
 <meta
   property="og:image"
-  content={`https://example.com/api/og?title=${encodeURI(
+  content={`https://example.com/api/og?title=${encodeComponentURI(
     title ? title : siteTitle
   )}`}
 />
```

識者「`encodeURI` は `&` を含めた機能を持つ文字をエンコードしないんだ。機能があるのにエンコードされたら困るからね」

なわしろ「なるほどなあ」

## まとめ

- `encodeURI` は `&` などの文字をパーセントエンコードしない。
- かわりに `encodeURIComponent` を使う。
