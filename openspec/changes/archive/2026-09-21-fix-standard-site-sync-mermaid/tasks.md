## 1. 軽量p-summary抽出

- [x] 1.1 HASTのp-summary探索・テキスト正規化を`lib/post-summary.ts`へ切り出し、Mermaidを含むMarkdownをブラウザなしで解析できる軽量抽出関数を追加して専用unit testを通す
- [x] 1.2 `lib/posts.ts`の通常Markdown変換が共有HAST抽出処理を再利用し、既存のMermaid/Prism/KaTeX本文出力を維持することを既存testで検証する

## 2. Standard-site同期接続

- [x] 2.1 `lib/sync-standard-site.ts`が全文HTML変換ではなく軽量p-summary抽出を使い、Mermaid記事の同期準備でPlaywrightを起動しないことをunit testまたは実行probeで検証する
- [x] 2.2 p-summary有無それぞれのStandard-site description生成が既存仕様どおりであることを同期テストで検証する

## 3. 総合検証

- [x] 3.1 Mermaidコードブロックとネストしたp-summaryを含む記事を対象に、`__name`/`page.evaluate`失敗なしで概要が得られる回帰テストを追加する
- [x] 3.2 `npm test`、`npm run typecheck`、`npm run lint`、`npm run build`を実行し、公開サイトの静的生成と既存テストが成功することを検証する
- [x] 3.3 `openspec validate "fix-standard-site-sync-mermaid" --type change --strict --json`を実行し、change artifactが有効であることを確認する
