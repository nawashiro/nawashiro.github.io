# #207 コードレビュー

## 対象
- Issue: https://github.com/nawashiro/nawashiro.github.io/issues/207
- レビュー対象範囲: `package.json`, `playwright.config.ts`, `e2e/*.spec.ts`, `lib/posts.ts`, `components/WebMention.tsx`
- 前提: Issue #207 の「npm run test が終了しない/遅すぎる」現象に焦点を当てたレビュー

## 所感（第三者視点）
- `npm run test` が Playwright E2E を直実行する構成になっており、Next の dev サーバー起動や外部ネットワーク依存がテスト全体の所要時間に強く影響する。テストの粒度（E2E / unit）や実行対象を分けていないため、日常運用の `npm run test` が重く・長くなりやすい。
- Markdown レンダリングに外部取得（link-card / webmention）を含む設計が、CI やオフライン環境での安定性を下げる。E2E で実行されると「止まっているように見える」体験につながりやすい。

## 指摘事項（重要度順）

### High
- `npm run test` が即座に Playwright E2E を実行し、`webServer` で `next dev` を起動するため、テスト実行が「サーバ起動 + ビルド + E2E」を内包する重い運用になっている。`next dev` は常駐プロセスで起動コストが高く、`webServer.timeout` まで待たされるケースが発生しやすい。`package.json:7`, `playwright.config.ts:13`
- `webServer` が全テストに適用されるため、純粋なユニット相当テスト（例: `e2e/issue-202.spec.ts`）も必ずサーバ起動待ちになる。テスト種別が混在しており、不要な待ち時間が恒常的に発生する。`playwright.config.ts:10`, `e2e/issue-202.spec.ts:1`

### Medium
- `renderMarkdown()` が `remark-link-card` を常時有効にしているため、投稿内に外部リンクがあると SSR/SSG 中に外部ネットワークアクセスが発生する。タイムアウトやキャッシュがないため、応答遅延やハングが `page.goto()` 待ちに波及しうる。`lib/posts.ts:121`
- `WebMention` がページ表示のたびに `webmention.io` を参照するため、ネットワーク状態によってはページの安定性が落ちる。E2E の `page.goto` が遅く感じられる要因になりうる。`components/WebMention.tsx:154`

### Low
- Playwright の `timeout` が 30s / `webServer.timeout` が 180s 固定で、遅延の原因や箇所がログ上見えづらい。テストが「止まって見える」状態の診断がしにくい。`playwright.config.ts:4`

## 修正計画（具体案）
1. テスト種別を分離する
   - `playwright.config.ts` を E2E 専用にし、ユニット相当テストは別 config（例: `playwright.unit.config.ts`）へ切り分ける。
   - `package.json` の `test` は軽量テスト（unit）に寄せ、`test:e2e` で E2E を明示実行にする。
2. `webServer` の起動方式を見直す
   - E2E では `next dev` ではなく `next build && next start` を用いる（もしくは CI のみ `next start` へ切替）。
   - これにより「起動コストが高い/終了しない」現象の再現率を下げる。
3. 外部ネットワーク依存をテスト時に無効化する
   - `remark-link-card` を `process.env.NODE_ENV === "test"` などで無効化する、またはタイムアウト付きで実行する。
   - `WebMention` も同様にテスト環境では fetch を抑止するフラグを導入し、E2E のページ読み込みの揺らぎを減らす。
4. 診断性の向上
   - Playwright の `reporter` を `list`/`dot` などに設定し、どこで待っているかが分かるログを出す。
   - `webServer` の `stdout/stderr` を `inherit` にしてサーバ起動の停滞点を可視化する。

