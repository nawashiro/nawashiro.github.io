# Tasks

設計書は省略する。この変更は既存のFeed概要選択だけを変更し、新しい依存、データ構造、移行処理を導入しない。

## 1. Feed概要の修正と回帰検証

- [x] 1.1 開発者は記事と独立した固定fixtureの回帰テストを追加する。開発者は実際のFeed生成経路からRSS、Atom、JSON Feedを検証する。開発者は現行実装で`p-summary`優先のテストが失敗することを確認する。
- [x] 1.2 開発者は`generateRssFeed()`の概要で`postData.pSummary`を優先する。開発者は未設定時の`generateExcerpt(postData.contentHtml)`を維持する。開発者は3形式のテスト成功を確認する。
- [x] 1.3 開発者は装飾と空白、最初の空でない概要、200文字を超える明示概要を固定fixtureで検証する。開発者は未設定と空白のみの概要で既存抜粋を検証する。開発者は200文字以下と200文字を超える本文の境界を検証する。開発者は3形式の記事本文の維持を検証する。

## 2. 統合検証

- [x] 2.1 開発者は追加テストと`npm test -- tests/post-summary.spec.ts`を実行する。開発者は`npm run typecheck`を実行する。開発者は成功結果を記録する。
- [x] 2.2 開発者は外部同期を実行せず、現行記事からFeedを一時ディレクトリへ生成する。開発者は3形式の概要を抽出結果と照合する。開発者は公開用生成ファイルと既存記事を変更しない。開発者は`git diff --check`とOpenSpecのstrict検証成功を確認する。

## 検証結果

- 修正前の固定fixtureは、明示概要の代わりに本文先頭を含む抜粋を出力し、テストに失敗した。
- `npm test -- tests/feed-summary.spec.ts tests/post-summary.spec.ts`は30件すべて成功した。
- `npm run typecheck`は成功した。
- 統合検証は最新50記事を3形式へ生成し、150件の概要照合に成功した。
- 統合検証は明示概要3記事と本文抜粋47記事を確認した。
- SHA-256照合は記事と公開用Feedファイルの不変を確認した。
- `git diff --check`と`openspec validate use-p-summary-for-feed-description --strict`は成功した。
- 環境のChromium revision 1200は欠落した。インストールはタイムアウトした。
- 一時検証スクリプトは既存のChromium revision 1234を指定した。開発者はサイトのブラウザ設定と依存を変更しなかった。
- 開発者は外部同期、コミット、push、公開を実行しなかった。
