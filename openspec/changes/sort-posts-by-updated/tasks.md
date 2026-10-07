# Tasks

## 1. 共通ソートと記事一覧

- [x] 1.1 `lib/post-timestamps.ts`の比較関数を`compareUpdatedDescending`へ置き換え、更新日時降順・同じ更新瞬間では公開日時降順を実装する。`tests/post-timestamps.spec.ts`の旧公開順テストを置き換え、古い記事の更新による浮上、異なるタイムゾーン、同じ更新瞬間の公開日時比較、両日時同値での入力順維持を検証する。`npm test -- tests/post-timestamps.spec.ts`が通ることを確認する。
- [x] 1.2 `lib/posts.ts`の`getSortedPostsData`と`getIndexPagesData`を新しい比較関数へ切り替える。通常記事と`categories-*.md`のfixtureで両取得経路の更新順と、本文だけの変更では順序不変であることを回帰テストに追加し、追加テストが通ることを確認する。ソースとテストに旧比較関数への参照が残らないことも検索で確認する。

## 2. Feedの順序と50件選択

- [x] 2.1 `tests/feed-timestamps.spec.ts`の公開順期待値を更新順へ置き換え、RSS・Atom・JSON Feedが同じ記事を同じ更新順で配信することを検証する。各記事の日時項目は記事IDまたはURLに対応付けて検証し、公開日時・更新日時の意味、Feed全体更新日時の再生成時の安定性、空Feedの固定日時が維持されることを確認する。`npm test -- tests/feed-timestamps.spec.ts`が通ることを確認する。
- [x] 2.2 51件以上のFeed fixtureを追加する。公開順では対象外の古い記事を最新更新にして先頭へ戻し、3形式とも更新順の同じ50件だけを同じ順序で出力し、境界外の記事を除外することを検証する。`npm test -- tests/feed-timestamps.spec.ts`が通ることを確認する。

## 3. 全体の回帰確認

- [x] 3.1 `npm test`と`npm run typecheck`を実行して、記事HTML・メタデータ・standard.siteレコードを含む既存の検証が維持されることを確認する。変更差分に既存記事の日時書き換えや表示・同期の仕様変更がないことを確認し、結果を記録する。ライブ同期を含む`npm run build`はこの検証では実行しない。

## 検証結果

- 実装者は`npm test`を実行し、111件のテスト成功を確認した。
- 実装者は`npm run typecheck`を実行し、型検査の成功を確認した。
- 実装者は`git diff --check`を実行し、差分の空白エラーがないことを確認した。
- 実装者はソースとテストを検索し、旧比較関数への参照がないことを確認した。
- 実装者は差分を確認した。実装変更は共通比較関数と一覧取得経路に限定する。既存記事の日時、表示、メタデータ、同期処理は変更していない。
- 実装者はライブ同期を含む`npm run build`を実行しなかった。全テストには既存の隔離環境でのNextビルド検証を含む。
