---
title: "GitHub Pages + Next.jsで個人サイト作ってつまづいたところ"
date: "2023-09-27 02:44"
---

このサイトを作ろうとしたときのはなし。

## 登場人物

なわしろ：私。[関西型言語](https://qiita.com/Yametaro)を使う人の影響で言葉がぶれる。

識者：主に Google 先生。

## 経緯

なわしろ「個人サイトが欲しいぞ。面接の時とか見せれたら便利やん」

識者「[GitHub Pages](https://docs.github.com/ja/pages/getting-started-with-github-pages/about-github-pages) をご存知？HTML などの静的なコンテンツをホストしてくれる便利なサービスだよ。なんと 1GB までなら無料。テキストで 1GB 埋めるのはなかなかきついのでブログ書き放題だね」

識者「それから [Next.js](https://nextjs.org/) もご存知？WEB サイトを作る時便利なフレームワークだよ。静的なコンテンツを生成する機能があるから今回役に立つよ」

なわしろ「なんかよさそうだね、それやってみよう」

## Next.js チュートリアル

識者「まず[チュートリアル](https://nextjs.org/learn/foundations/about-nextjs)をやってみようか」

なわしろ「千里の道もチュートリアルやればひとっ飛びやね」

...

なわしろ「でけた！ローカルで動くことを確認したやで」

なわしろ「せっかくだからチュートリアルで作ったサイトを個人サイトに改造してしまおう。モックは[Figma](https://www.figma.com/)で作ってあるんだよね。[デジタル庁のデザインシステム](https://www.digital.go.jp/policies/servicedesign/designsystem)が役に立ったよ」

## つまづき デプロイ時のバージョン設定

なわしろ「さっそく GitHub Pages にデプロイしてみよう」

なわしろ「ギャーッ！エラーが出たーッ！」

```sh
error npm@10.1.0: The engine "node" is incompatible with this module. Expected version "^18.17.0 || >=20.5.0". Got "16.20.2"
```

なわしろ「識者助けて！？」

識者「フムン。node のバージョンがあっていないようだね。18.17.0 以上でなければならないのに、16.20.2 になっている」

なわしろ「GitHub Actions で使われてる node のバージョンが古くていけないってこと？どうすればいいの？」

識者「`workflows/nextjs.yml`を利用してバージョンを指定できる。GitHub Actions 作るとき聞かれるんだけど、さては見落としていたね？」

```diff:workflows/nextjs.yml
-node-version:16
+node-version:18
```

## つまづき next.config.js の設定

なわしろ「ギャーッ！またエラーが出たーッ！」

```sh
remote: Permission to nawashiro/nawashiro.github.io.git denied to github-actions[bot].
```

識者「フムン。権限が足りていないようだね」

なわしろ「権限を要求する操作なんてしてないはず……おかしいな……」

識者「考えられることがあるとすれば、他のリポジトリにアクセスしようとしている、とかかな？」

なわしろ「あっ、`next.config.js`がチュートリアルのときのままだ」

```diff:next.config.js
-repoName = process.env.GITHUB_ACTIONS && "/nextjs-blog-learn";
+repoName = process.env.GITHUB_ACTIONS && "/nawashiro.github.io";
```

## つまづき next.config.js の設定 2

なわしろ「あれ？デプロイはできたけど、css が適用されていない姿のままだ」

識者「コンソールになにかエラーは出ているかい？」

```sh
Uncaught SyntaxError: Unexpected token '<'
```

識者「なぜか js が読み込まれなくて、代わりに index.html が読み込まれている状態だね。`next.config.js`になにかあることが多いよ」

なわしろ「なんもわかんない……とりあえず設定全部消してみよう」

```diff:next.config.js
 /**
 * @type {import('next').NextConfig}
 */
-repoName = process.env.GITHUB_ACTIONS && "nawashiro.github.io";
 module.exports = {
-  basePath: repoName,
-  assetPrefix: repoName,
-  trailingSlash: true,
-  publicRuntimeConfig: {
-    basePath: repoName,
  },
 };
```

識者「なんかうまくいったね。スタイルが表示されてエラーが消えたよ」

なわしろ「なんで！？」

## まとめ

- GitHub Pages にデプロイするときは`nextjs.yml`をちゃんと確認すること。特にバージョン。
- `next.config.js`もしっかりと確認すること。
- `next.config.js`の設定の仕方は今後ちゃんと勉強すること。

次回、og 編へ続く。
