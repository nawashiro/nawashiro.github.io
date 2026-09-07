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

WebMention の同期には `WEBMENTION_IO_TOKEN` が必要です。これはローカルで同期を実行するときだけ環境変数として設定し、GitHub Actions では `WEBMENTION_IO_TOKEN` リポジトリシークレットとして登録します。トークンをファイルや公開リポジトリへ保存しないでください。

## 開発

```bash
npm run dev
```

`http://localhost:3000` で動作します。

## ビルド / 静的出力

```bash
npm run build
```

- `npm run build` 中に RSS/Atom/JSON が `public/rss/` に生成されます。`next build` を実行し、`out/` に静的ファイルを出力します。

## コード品質

```bash
npm run lint
npm run typecheck
npm run test
```

テストは Playwright（`e2e/`）で実行されます。

## ディレクトリ構成

- `pages/`：Next.js ページ。`posts/[id].tsx` で記事を描画
- `components/`：再利用 UI（`layout`, `WebMention` など）
- `lib/`：Markdown 変換、フィード生成
- `posts/`：Markdown 原稿（`YYYYMMDD-title.md`）
- `public/`：静的アセット、生成された feed/sitemap
- `styles/`：グローバル CSS と各種 CSS Modules

## 投稿のルール

- ファイル名は `YYYYMMDD-title.md`
- frontmatter 最低要件: `title`, `date (YYYY-MM-DD)`
- 可能なら `description`, `image` を追加
- 他記事へのリンクは `[text](slug.md)` で記述

## WebMention

受信済みの完全な Webmention データは、公開される正規アーカイブ `lib/data/webmentions.json` に保存します。記事の静的生成時にこのアーカイブを読み込むため、生成済み HTML に Webmention が含まれ、ブラウザから `webmention.io` へ取得しなくても JavaScript 無効の状態で読めます。表示件数に上限はありません。

同期は次のコマンドで実行できます。

```bash
WEBMENTION_IO_TOKEN="..." npm run webmentions:sync
npm run build
```

同期は `nawashiro.dev` の Webmention.io フィードをページングして取得し、新規または更新された `wm-id` をアーカイブへ追加します。リモートに存在しなくなったデータは自動削除しません。アーカイブの内容に差分がなければ、GitHub Actions の定期実行も静的ビルドとデプロイを起動せずに終了します。差分があるときだけコミット後に既存の公開 workflow を起動します。手動実行は Actions の `Sync Webmentions` から行えます。

記事への紐付けでは、HTTPS を正規形とし、`http`/`https` の違いと末尾 `/` の有無を同一視します。元の `wm-target` はアーカイブ内にそのまま残します。表示時は受信データの HTML を挿入せずテキストとして扱い、リンクと画像は HTTP(S) URL のみ使用します。

意図的に削除する場合は、次の順番を守ります。

1. Webmention.io 側の削除手順で対象を削除する
2. `lib/data/webmentions.json` から同じ `wm-id` を手動で削除する
3. 変更をコミットして公開 workflow を実行する

同期を一時停止する場合は GitHub Actions の `Sync Webmentions` workflow を無効化します。既存のアーカイブはそのまま残り、必要なら `npm run build` で手動再生成できます。削除済みエントリは Git の履歴からは自動では消えません。

## フィード

`lib/posts.ts` の `generateRssFeed()` が RSS/Atom/JSON を生成します。`NEXT_PUBLIC_SITE_URL` が無い場合は `http://localhost:3000` を使用します。

## デプロイ

GitHub Pages などの静的ホスティングを想定しています。

1. `NEXT_PUBLIC_SITE_URL` を設定
2. `npm run build`
3. `out/` をホスティング先へ配置

## 注意点

- WebMention の URL は http/https のみ許可します。
