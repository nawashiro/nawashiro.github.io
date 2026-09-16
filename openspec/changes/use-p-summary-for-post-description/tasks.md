## 1. 共通概要抽出

- [x] 1.1 `lib/posts.ts` のrehypeRaw後にHASTを走査する共有概要抽出処理を追加し、`p-summary`クラスの最初の空でない要素から装飾HTMLを除いたテキストを取得できることを抽出テストで検証する
- [x] 1.2 `lib/posts.ts` の記事データ型とMarkdown変換結果へ任意の`pSummary`を追加し、ネスト要素・複数要素・空要素・空白正規化の結果をユニットテストで検証する

## 2. 記事ページとATProto同期

- [x] 2.1 `pages/posts/[id].tsx` が`pSummary`を優先し、未設定時だけ既存の本文先頭120文字へフォールバックするよう変更し、記事ページの概要値をテストで検証する
- [ ] 2.2 記事ページのdescription、OGP、Twitterカード、JSON-LDが同じ解決済み概要を出力することをレンダリングテストで検証する
- [x] 2.3 `lib/sync-standard-site.ts` が共有`pSummary`をATProto文書の`description`へ設定し、未設定時にフィールドを省略することを同期テストで検証する
- [ ] 2.4 `lib/posts.ts` のfrontmatter `description`型・伝播経路と`lib/sync-standard-site.ts`のfrontmatter参照を削除し、frontmatter `description`がページと同期結果へ影響しない回帰テストで検証する

## 3. 投稿ルールと総合検証

- [x] 3.1 `README.md` のfrontmatter `description`推奨記述を`p-summary`の記載方法へ更新し、既存の`template/bridge.md`のp-summary形式を維持していることを確認する
- [ ] 3.2 関連テスト、型チェック、lintを実行し、概要抽出・ページメタデータ・ATProto同期のテストがすべて成功することを検証する
- [ ] 3.3 本番相当の静的ビルドを実行し、対象記事のdescription・OGP・JSON-LDにp-summaryが入り、p-summary未設定記事が既存フォールバックで表示されることを生成物で検証する
