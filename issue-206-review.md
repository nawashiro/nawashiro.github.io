# issue-206 レビュー

## 対象
- issue-206-research.md
- issue-206-plan.md

## 指摘事項（重要度順）
- High: 現状認識が誤っており、導入フェーズやテスト計画が既存実装と矛盾しています。Tailwind/DaisyUI/テーマ/typography/animation は既に導入済みのため、Phase 1〜2 や「未導入前提の失敗確認」は冗長で、二重作業・再設計・誤った差分前提を招きます。`issue-206-plan.md:10` `issue-206-plan.md:35` `issue-206-plan.md:59` に対して、`tailwind.config.js:1` `postcss.config.js:1` `styles/global.css:4` `pages/_document.tsx:3` `package.json:44` が既存導入を示しています。
- High: メニュー実装の前提が異なり、UI 統一リスク評価がずれています。計画は `@szhsin/react-menu` 依存を前提にしていますが、実際には DaisyUI の `navbar`/`dropdown` が既に稼働中で、依存も存在しません。`issue-206-plan.md:13` `issue-206-plan.md:22` と `components/layout.tsx:80` `components/layout.tsx:110` `package.json:12` が食い違っています。
- Medium: `styles/index.module.css` の置換フェーズが成立しません。該当 CSS Module は存在せず、Hero/Card は既に Tailwind/DaisyUI のユーティリティで構成済みです。`issue-206-plan.md:12` `issue-206-plan.md:91` と `pages/index.tsx:111` が不整合です。
- Medium: NetworkGraph の「固定色・固定背景」指摘が古く、既にテーマトークン参照へ移行しています。追加フェーズの意義が薄く、変更対象の再確認が必要です。`issue-206-plan.md:15` `issue-206-plan.md:108` に対して `components/network_graph.tsx:14` `components/network_graph.tsx:82` が現行です。
- Low: TDD フェーズの「追加したテストが失敗する前提」が成り立ちません。対象の e2e テストは既存で、現状でも通るはずです。`issue-206-plan.md:44` と `e2e/theme.spec.ts:1` `e2e/layout.spec.ts:1` `e2e/hero.spec.ts:1` `e2e/motion.spec.ts:1` の差分を整理してください。

## 総評
計画は「導入前の状態」を前提にしており、現行の設計・テスト・テーマの実装と乖離しています。まず現状差分の棚卸し（既存の Tailwind/DaisyUI 運用範囲、残存 CSS、未移行領域）をやり直したうえで、フェーズを「改善・微調整」に再構成するのが安全です。
