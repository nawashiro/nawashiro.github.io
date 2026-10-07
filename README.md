# Nawashiro Personal Site

Nawashiro の個人サイト。

## 特徴

- Markdown 投稿（`posts/`）から記事ページを生成
- RSS/Atom/JSON Feed をビルド時に生成
- サイトマップ生成（`next-sitemap`）
- WebMention の表示

## セットアップ

```bash
npm install
```

## 環境変数

ビルドや OG 画像、フィードの絶対 URL 生成に利用します。

```bash
export NEXT_PUBLIC_SITE_URL="https://example.com" # サービスURL
export WEBMENTION_IO_TOKEN="token" # Webmention.io トークン
```

## 開発

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run test
```

テストは Playwright（`e2e/`）で実行されます。

## 投稿

- 記事概要: `.p-summary`
- 他記事へのリンク: `[text](slug.md)`
