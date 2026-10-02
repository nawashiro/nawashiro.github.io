# Proposal

## Why

Feedの記事概要は本文先頭の抜粋を使用し、著者が指定した`p-summary`を無視する。ページ概要と外部同期の仕様にFeedの要件を追加し、配信先の概要を揃える。

## What Changes

- システムはRSS、Atom、JSON Feedの記事概要で、既存の抽出処理が決定した`p-summary`を優先する。
- システムは`p-summary`が未設定または空の場合、既存のFeed用本文抜粋を維持する。
- システムはFeedの記事本文、タイトル、URL、配信件数、サイト全体の説明文を変更しない。
- 開発者は固定fixtureを使い、3形式の概要とフォールバックを検証する。

## Capabilities

### New Capabilities

なし。

### Modified Capabilities

- `post-summary-metadata`: Feedの記事概要に`p-summary`優先と既存抜粋フォールバックの要件を追加する。

## Impact

- 実装対象は`lib/posts.ts`の`generateRssFeed()`と、同経路を検証するテストである。
- 出力対象はRSSの`description`、Atomの`summary`、JSON Feedの`summary`である。
- `p-summary`を持つ記事のFeed概要が変わる。
- 開発者は依存パッケージ、ブラウザ依存、外部取得を追加しない。
- 開発者はページ用の120文字フォールバックとATProto同期の概要省略規則を変更しない。
