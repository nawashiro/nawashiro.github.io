# #206 コードレビュー

## 対象
- Issue: https://github.com/nawashiro/nawashiro.github.io/issues/206
- 計画: `issue-206-plan.md`
- レビュー対象範囲: `tailwind.config.js`, `postcss.config.js`, `styles/global.css`, `pages/_document.tsx`, `components/layout.tsx`, `pages/index.tsx`, `pages/posts/[id].tsx`, `components/network_graph.tsx`, `e2e/*.spec.ts`

## DaisyUIドキュメント調査（導入/テーマ）
参照: https://daisyui.com/docs/themes/ （`@plugin "daisyui"` の設定、`@plugin "daisyui/theme"` でのカスタムテーマ定義、`--color-*` を OKLCH で指定）

- v5系のドキュメントでは、テーマの有効化は CSS 側で `@plugin "daisyui" { themes: ... }` を書き、カスタムテーマは `@plugin "daisyui/theme" { ... }` で `--color-*`/`--radius-*`/`--size-*` 等を定義する前提。
- テーマ適用は `data-theme="THEME_NAME"` を任意の要素に付与して行う。

## 実装との差異（仕様ズレ）
- `tailwind.config.js` の `daisyui` 設定で `primary` や `base-100` など旧形式のキーを使っているが、公式ドキュメントは `@plugin "daisyui/theme"` + `--color-*` の OKLCH 形式を推奨している。現状の構成は v5 の推奨導線とズレており、今後の DaisyUI 更新時にテーマが効かなくなる/一部トークンが無視されるリスクがある。`tailwind.config.js:23`
- `styles/global.css` と `components/network_graph.tsx` が `--p`/`--b2` などの旧トークンを `hsl(var(--p))` で扱っているが、ドキュメント上は `--color-*` が OKLCH で定義される。`hsl()` 前提だと色の解釈が壊れる可能性が高い。`styles/global.css:10`, `components/network_graph.tsx:15`

## 指摘事項（重要度順）

### High
- `window.open` に `noopener`/`noreferrer` を付与しておらず、`window.opener` 経由のセキュリティリスクが残る。`components/network_graph.tsx:62`

### Medium
- canonical が二重に出力される（`Layout` と `pages/posts/[id]` の両方で `<link rel="canonical">` を出力）。SEO 的に不利で、`e2e/canonical.spec.ts` を追加した場合に必ず落ちる。`components/layout.tsx:78`, `pages/posts/[id].tsx:74`
- テーマカラーの算出ロジックが `hsl(var(--p))` 前提で固定されており、DaisyUI v5 の OKLCH トークンに変わると `getThemeColor()` が不正値になる。`components/network_graph.tsx:15`, `styles/global.css:10`

### Low
- `styles/global.css` の `:root` で `--content-max-widh` が誤字のまま残っている（参照箇所が見当たらず、不要なまま残留）。`styles/global.css:19`

## テストレビュー（妥当性/不要箇所）
- `e2e/motion.spec.ts` は `motion-safe:` クラスの存在確認のみで、計画にあった `prefers-reduced-motion` の検証にはなっていない。`page.emulateMedia({ reducedMotion: "reduce" })` と組み合わせた実検証が必要。`e2e/motion.spec.ts:6`
- `e2e/hero.spec.ts` と `e2e/layout.spec.ts` は「DaisyUI クラスがあるか」を見るだけで、視覚/挙動の保証になっていない。UI フレームワークのクラス名に依存するため、保守負担の割に効果が薄い。`e2e/hero.spec.ts:6`, `e2e/layout.spec.ts:6`
- `e2e/network-graph.spec.ts` は `window.__openNetworkPost` を前提にしているが実装に存在せず、テスト自体が成立しない。実装側で公開関数を用意するか、テストアプローチを見直す必要がある。`e2e/network-graph.spec.ts:13`

## 所感（第三者視点）
- DaisyUI v5 の導入フローとテーマ仕様に対する実装の食い違いが残っており、色トークンの扱いが破綻する可能性がある。とくに `hsl(var(--p))` 前提の変数変換は、テーマ更新時の事故ポイントになりやすい。
- UI の見た目は整理されているが、テストはクラス依存で回帰検知力が低い。重要な挙動（`prefers-reduced-motion`、`noopener`、canonical 一意性）に寄せた方が効果的。
