## Why

GitHub ActionsのStandard-site同期で、記事概要しか必要ない処理がMarkdown全文変換を実行し、Mermaidレンダリング用のPlaywrightを起動している。`tsx`が`page.evaluate()`へ渡す関数を変換する際に`__name`を挿入するため、CIのブラウザコンテキストで`ReferenceError`が発生し、Next.js buildとCloudflare Pages deployが開始できない。

## What Changes

- Standard-site同期専用の軽量なp-summary抽出経路を追加する。
- 同期時はMermaid、Prism、KaTeXなどの全文HTML変換を実行しない。
- 通常のNext.jsサイトbuildでは、既存のMarkdown全文変換とMermaid表示を維持する。
- 同期時のp-summary抽出結果を既存のStandard-site `description`へ引き続き使用する。
- Mermaid記事を含む同期用の回帰テストを追加する。

## Capabilities

### New Capabilities

- `standard-site-sync-summary`: Standard-site同期が記事本文全体をレンダリングせず、p-summaryだけを安全に抽出してdescriptionへ反映する。

### Modified Capabilities

<!-- 既存capabilityのspecはないため、該当なし。 -->

## Impact

- `lib/posts.ts`の概要抽出処理とMarkdown変換経路
- `lib/sync-standard-site.ts`のStandard-site同期
- `next.config.js`のserver-side RSS生成用ts-node解決設定
- p-summaryおよびMermaid記事のunit test
- Standard-site同期のCI build経路

公開ページのMermaid、OGP、記事本文のHTML出力は変更しない。