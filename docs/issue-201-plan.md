# Issue 201 対応計画（デバッグ容易性・TypeScript移行）

## 目的
- 型安全性と静的解析を導入し、デバッグの難しさを解消する。
- Lint/テストを整備し、変更時の不具合検知を早期化する。
- リーダブルコードと禅の精神に沿い、単純で分割された変更にする。

## 現状分析（主な対象ファイル）
- `pages/`:
  - `pages/index.jsx` / `pages/posts/[id].jsx` は props の形が暗黙的で、データ構造変更の影響が追いづらい。
- `components/`:
  - `components/layout.jsx` は `kofiWidgetOverlay` のグローバルに依存し、型定義がない。
  - `components/network_graph.jsx` は `network` の再生成/イベント登録が毎レンダで起きうる。
  - `components/WebMention.jsx` は `window`/`document` 依存が多く、SSR/型定義が不明瞭。
- `lib/posts.js`:
  - Markdownの前提構造（frontmatterやリンク正規表現）が暗黙的。
  - 返却型が自由で、呼び出し側のフィールド名変更が壊れやすい。
- `next.config.js`:
  - build 時の `generateRssFeed()` 実行は副作用で、TypeScript化で import 形態に注意が必要。
- テスト/静的解析:
  - ESLint未導入、型検査未導入、テスト未導入。

## 問題点（第三者視点の懸念）
- 型未定義により、実行時エラーがビルドで検知できない。
- Lint不在で、将来的なリファクタリングに一貫性が出ない。
- `lib/posts.js` がI/Oと変換ロジックを同居しており、テストしづらい。
- グローバル依存（`kofiWidgetOverlay`）が型/実行順を壊しやすい。
- `network_graph.jsx` の副作用が意図せず増殖する可能性がある。

## 方針（小さく分割）
1. まずテスト/型検査を「失敗する状態」で追加。
2. TypeScript移行は低リスクなファイルから段階的に。
3. 型とLintが通る最小修正のみに限定し、機能変更は後回し。
4. 依存が強い箇所（`lib/posts`/`WebMention`/`layout`）は専用の型定義で隔離。

## 実装計画（TDD前提、失敗→成功の流れ）

### Phase 0: 事前準備と安全柵
- 追加するテスト/型検査
  - `npm run lint`（ESLint）
  - `npm run typecheck`（`tsc --noEmit`）
  - `npx playwright test`（最低限のE2E）
- まずはこれらが「失敗する」ことを確認。

### Phase 1: LintとTypeScript基盤
- 失敗を確認
  - `npm run lint` → 失敗（設定が無い/未導入）
  - `npm run typecheck` → 失敗（`tsconfig.json` 不在）
- 実装
  - `typescript`, `@types/react`, `@types/react-dom`, `@types/node` を追加。
  - `tsconfig.json` を追加（Next.js推奨の設定から開始）。
  - `eslint`, `eslint-config-next` を追加し `.eslintrc` を作成。
  - `package.json` に `lint` と `typecheck` を追加。
- 成功条件
  - `npm run lint` が通る。
  - `npm run typecheck` が通る（まだ .jsx が混在していても警告なく通る設定）。

### Phase 2: 低リスクのTS移行
- 対象
  - `pages/_app.jsx` → `pages/_app.tsx`
  - `components/date.jsx` → `components/date.tsx`
- 失敗を確認
  - `npm run typecheck` で型エラーが出ることを確認。
- 実装
  - Props型を最小限に定義。
- 成功条件
  - `npm run typecheck` が通る。

### Phase 3: 主要ページのTS移行
- 対象
  - `pages/index.jsx` → `pages/index.tsx`
  - `pages/posts/[id].jsx` → `pages/posts/[id].tsx`
- 失敗を確認
  - 型未定義で `any` が流れる状態を確認。
- 実装
  - `getStaticProps`/`getStaticPaths` の型を導入。
  - `Post`/`Home` の props を明示。
- 成功条件
  - `npm run typecheck` が通る。

### Phase 4: コンポーネントのTS移行
- 対象
  - `components/layout.jsx` → `components/layout.tsx`
  - `components/network_graph.jsx` → `components/network_graph.tsx`
  - `components/WebMention.jsx` → `components/WebMention.tsx`
- 失敗を確認
  - グローバルやDOM APIの型不足を確認。
- 実装
  - `kofiWidgetOverlay` の `global.d.ts` を追加。
  - `NetworkGraph` の `Network` インスタンスは `useRef` で保持。
  - `WebMention` の型/ユーティリティを明示し、副作用を限定。
- 成功条件
  - `npm run typecheck` が通る。

### Phase 5: `lib/posts` の型定義と分割
- 失敗を確認
  - frontmatterの必須項目や戻り値の型が未定義であることを確認。
- 実装
  - `lib/posts.js` → `lib/posts.ts`（型導入）
  - frontmatter型（`title`, `date`, `description?`, `image?`）を定義。
  - I/Oと変換を関数分割し、テスト可能にする。
- 成功条件
  - `npm run typecheck` が通る。

### Phase 6: テスト導入（最低限）
- 失敗を確認
  - `npx playwright test` でテストが無い/失敗する状態を確認。
- 実装
  - `e2e/` にトップページ/記事ページの簡易テストを追加。
  - `lib/posts` には軽量なユニットテスト（導入するなら `vitest`）を追加。
- 成功条件
  - `npx playwright test` が通る。
  - `npm run lint` / `npm run typecheck` が通る。

## リスクと対策
- Next.jsの`next.config.js`でのRSS生成はTypeScript化に伴いimport形態を調整する必要がある。
- SSR時に `window`/`document` 参照があるため、型だけでなく実行環境条件を明示する。
- Markdownのfrontmatter項目が欠けている場合、型制約が厳しすぎるとビルドが落ちるため段階的に必須化する。

## 期待される成果
- TypeScript移行による型安全の確保。
- Lint/テストの導入でデバッグが容易になり、将来的な変更にも強くなる。
- 変更を小さく分割して進められるため、禅的にシンプルで読みやすい進行になる。
