# Proposal

## Why

公開日時順では、過去記事に重要な追記をしても読者が一覧やFeedで再発見しにくい。軽微な修正では著者が`updated`を書き換えない運用を前提に、更新した記事を優先して届ける。

## What Changes

- 記事一覧とカテゴリ一覧の並び順を`updated`降順に変更する。
- 同じ更新日時の記事は`published`降順に並べる。日時は文字列ではなく瞬間として比較する。
- RSS、Atom、JSON Feedの並び順と配信対象の先頭50件を同じ更新順で決定する。
- 公開日時・更新日時の表示、メタデータ、Feedの日時項目、standard.site同期の意味は変更しない。
- 既存の「更新だけでは順位を変えない」仕様とテストを置き換える。

## Capabilities

### New Capabilities

なし。

### Modified Capabilities

- `post-timestamps`: 記事一覧とFeedの選択を公開順から更新順へ変更し、同じ更新日時の場合は公開日時で順位を決める。

## Impact

- `lib/post-timestamps.ts`の比較関数と`lib/posts.ts`の一覧取得経路。
- `pages/index.tsx`へ渡す記事一覧・カテゴリ一覧、および`generateRssFeed`による3形式のFeed出力。
- `tests/post-timestamps.spec.ts`、`tests/feed-timestamps.spec.ts`と一覧取得の回帰テスト。
- 更新された過去記事がFeedへ戻るため、配信対象50件の構成が変わる。Feedの既存記事ID・URLは維持する。
- 新しい依存関係、日時の自動更新、既存記事frontmatterの書き換えは不要。
