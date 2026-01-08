# #201 コードレビュー

## 対象
- Issue: https://github.com/nawashiro/nawashiro.github.io/issues/201
- 計画: `issue-201-plan.md`
- レビュー対象範囲: `components/`, `lib/`, `pages/`, `next.config.js`, `package.json`

## 所感（第三者視点）
- Issue本文の「型安全/ lint / テスト」は現状のコードから見る限り、TypeScript化・`next lint`・Playwrightが既に導入済みで、当初の課題は大きく前進している。
- ただし、実装の一部にセキュリティ・安定性・運用の落とし穴が残っており、デバッグ容易性を下げる「事故の温床」になりうる。

## 指摘事項（重要度順）

### Critical
- WebMentionのHTML組み立てで外部入力を十分にエスケープしておらず、XSSリスクが残る。`innerHTML`に挿入する`comment.content.text`や`mentionUrl`が未エスケープで、Webmention側から任意HTML/URLが注入可能。`escapeHtml`の適用範囲を広げるか、文字列連結ではなくReact要素/DOM APIで構築しないと危険。`components/WebMention.tsx:112`, `components/WebMention.tsx:127`, `components/WebMention.tsx:222`, `components/WebMention.tsx:232`, `components/WebMention.tsx:256`

### High
- RSS生成が非同期なのに待たれておらず、ビルド終了時点でフィードが未生成/途中生成になる可能性がある。`generateRssFeed()`のPromiseが未処理で、失敗時もビルドが通るため検知できない。`next.config.js:9`, `next.config.js:12`, `next.config.js:13`

### Medium
- `rehypeRaw` + `allowDangerousHtml`でMarkdownの生HTMLをそのまま出力しており、投稿内容に悪意のHTMLが混ざるとXSSになる。現状はローカル投稿のみ前提でも、第三者投稿/自動取り込みが入ると即リスクになる。`lib/posts.ts:211`, `lib/posts.ts:212`
- `Network`インスタンスの破棄が無く、ページ遷移時にインスタンスやイベントが残りうる。`network.destroy()`相当のクリーンアップが無いので、長時間利用時のメモリ/イベントリークの温床になり得る。`components/network_graph.tsx:38`, `components/network_graph.tsx:54`

### Low
- `npm run output`の中身が`export`になっており、想定の`next export`が実行されない。`npm run output`が失敗/無視される環境があり、運用時の混乱要因。`package.json:6`
- OG画像としてMarkdown内の相対パス画像をそのまま`og:image`に使っている場合、クローラから参照できないURLになる可能性がある。相対パスを`NEXT_PUBLIC_SITE_URL`で正規化する処理が必要。`lib/posts.ts:219`, `components/layout.tsx:37`

## 追加観点（計画へのフィードバック）
- 既にTypeScriptとlint/testが入っているため、計画のPhase 0〜3は達成済みと判断できる。一方で、WebMention周りの「外部入力を扱う部分」はセキュアコーディング観点で追加の対策が必要。
- RSS生成の非同期処理や`output`スクリプトの不整合は運用フェーズでの「デバッグ困難さ」に直結するため、早期に解消した方がよい。

## Issueコメント状況
- API上、Issue #201にはコメントなし。
