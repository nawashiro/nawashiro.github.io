# Nawashiro Personal Site

Nawashiro の個人サイト（デジタルガーデン）です。Next.js を使って静的出力し、記事間のリンクや WebMention を含む読み物体験を提供します。

## 特徴
- Markdown 投稿（`posts/`）から記事ページを生成
- RSS/Atom/JSON Feed をビルド時に生成
- サイトマップ生成（`next-sitemap`）
- WebMention の表示（外部入力は安全にレンダリング）
- ページ間リンクを可視化する Network Graph

## 技術スタック
- Next.js 15 / React 18
- TypeScript
- unified/remark/rehype で Markdown を HTML に変換
- Playwright（E2E テスト）

## セットアップ
```bash
npm install
```

## 環境変数
ビルドや OG 画像、フィードの絶対 URL 生成に利用します。
```bash
export NEXT_PUBLIC_SITE_URL="https://example.com"
```

## 開発
```bash
npm run dev
```
`http://localhost:3000` で動作します。

## ビルド / 静的出力
```bash
npm run build
npm run output
```
- `npm run build` 中に RSS/Atom/JSON が `public/rss/` に生成されます。
- `npm run output` は `next export` を実行します（静的ホスティング向け）。

## コード品質
```bash
npm run lint
npm run typecheck
npm run test
```
テストは Playwright（`e2e/`）で実行されます。

## ディレクトリ構成
- `pages/`：Next.js ページ。`posts/[id].tsx` で記事を描画
- `components/`：再利用 UI（`layout`, `WebMention`, `network_graph` など）
- `lib/`：Markdown 変換、フィード生成、ネットワークデータ生成
- `posts/`：Markdown 原稿（`YYYYMMDD-title.md`）
- `public/`：静的アセット、生成された feed/sitemap
- `styles/`：グローバル CSS と各種 CSS Modules

## 投稿のルール
- ファイル名は `YYYYMMDD-title.md`
- frontmatter 最低要件: `title`, `date (YYYY-MM-DD)`
- 可能なら `description`, `image` を追加
- 他記事へのリンクは `[text](slug.md)` で記述

## WebMention
`components/WebMention.tsx` が `webmention.io` から取得します。外部入力は React 経由でレンダリングされ、安全な URL のみリンク化されます。

## フィード
`lib/posts.ts` の `generateRssFeed()` が RSS/Atom/JSON を生成します。`NEXT_PUBLIC_SITE_URL` が無い場合は `http://localhost:3000` を使用します。

## デプロイ
GitHub Pages などの静的ホスティングを想定しています。
1. `NEXT_PUBLIC_SITE_URL` を設定
2. `npm run build`
3. `npm run output`
4. `out/` をホスティング先へ配置

## 注意点
- Markdown の生 HTML は安全性のため無効化しています。
- WebMention の URL は http/https のみ許可します。

