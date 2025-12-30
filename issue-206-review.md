# Issue #206 Code Review

## 対象
- Issue: #206
- 計画: `issue-206-plan.md`
- レビュー対象範囲: `components/`, `pages/`, `styles/`, `tailwind.config.js`, `postcss.config.js`, `e2e/`

## 指摘事項（重要度順）

### High
- DaisyUI v5 系のテーマ変数が OKLCH 形式で出力される場合、`hsl(var(--p))` などの変換は無効値になり、全体の色が崩れる可能性がある。`styles/global.css:10`、`styles/global.css:48`、`components/network_graph.tsx:15-28`
  - 影響: ベース色やリンク色、グラフ配色が無効になり、背景/文字色が想定外になる。
  - 対策案: DaisyUI の色フォーマットに合わせて `oklch(var(--p))` へ寄せるか、Tailwind/DaisyUI が提供する `bg-base-*` / `text-*` へ置き換えて CSS 変換を減らす。

### Medium
- canonical URL が重複して出力される。`components/layout.tsx:78` と `pages/posts/[id].tsx:74`
  - 影響: クローラによっては canonical 解釈が不安定になり、SEO のシグナルが弱まる可能性がある。
  - 対策案: canonical の責務を `Layout` か各ページのどちらかに統一し、片方は削除する。

- `window.open` の `_blank` が `noopener` を付けていないため、タブナビングのリスクが残る。`components/network_graph.tsx:62-65`
  - 影響: 外部から `window.opener` を操作されるリスク。
  - 対策案: `window.open(url, "_blank", "noopener")`、または開いたウィンドウに対して `opener = null` を設定する。

### Low
- `prefers-reduced-motion` の挙動を検証するテストが無く、`motion-safe` の意図が担保できていない。`e2e/motion.spec.ts:3-8`
  - 影響: アニメーション制御が変更された際に検知できない。
  - 対策案: `page.emulateMedia({ reducedMotion: "reduce" })` を使って `animation-name` が `none` になることを確認する。

## 確認事項 / 質問
- DaisyUI の色フォーマット（HSL/OKLCH）の想定はどちらでしょうか？ `hsl(var(--p))` を維持する場合、出力形式を固定する方針か確認したいです。

## 変更概要
- Tailwind/DaisyUI のテーマ導入に合わせて、レイアウト・ヒーロー・カード・グラフのスタイルが新しいトークンへ移行されていることを確認しました。
