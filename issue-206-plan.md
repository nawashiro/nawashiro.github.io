# Issue 206 実装計画（TailwindCSS/DaisyUI/Animation）

## 意図の理解
- Issue #206 は、既存の投稿が持つ「温かみ・非威圧感・なめらかさ」を保ったまま、TailwindCSS + DaisyUI + 控えめなアニメーションで統一感のあるデザインシステムを構築することが目的。
- 既存の Markdown 本文とサイト構成を尊重し、段階移行で見た目の破綻を最小化する必要がある。

## コードベースの現状整理（主要ファイル）
- `pages/_app.tsx`: `styles/global.css` のみ読み込み。Tailwind も PostCSS も未導入。
- `styles/global.css`: `:root` で色変数・基本タイポ・`.blog` のスタイルを集約。サイト全体の基調色と本文スタイルが集中している。
- `styles/index.module.css`: Hero のアニメーション、カード、リンクボタンの見た目を個別実装。メディアクエリ内で同名 keyframes を再定義。
- `components/layout.tsx`: `layout.module.css` でヘッダ/ナビを管理。モバイルメニューは `@szhsin/react-menu` 依存。
- `styles/utils.module.css`: リストやリンクなどの汎用スタイル。
- `components/network_graph.tsx`: 背景色/角丸が inline style、ノード色も固定値。デザイントークンとの連携がない。
- Tailwind/DaisyUI の依存は未導入。

## 問題点の洗い出し（第三者視点・重要度順）
- High: Tailwind/DaisyUI 導入時に `global.css` の基礎スタイルと衝突しやすい（Preflight でのリセット、既存 `a`/`body` ルールの上書き）。
- High: `styles/index.module.css` と新しいユーティリティの二重管理になり、見た目の差異や保守負担が増える可能性。
- Medium: `@szhsin/react-menu` と DaisyUI `dropdown` が並存すると UI 体系が二重化し、統一感が崩れる懸念。
- Medium: `.blog` スタイルを安易に置換すると本文の読みやすさが落ちる。段階移行が必須。
- Medium: アニメーションが強すぎるとアクセシビリティと集中力を損なう。`prefers-reduced-motion` 対応必須。
- Low: `NetworkGraph` の色と背景がテーマと連動しておらず、全体トーンから浮く。

## リーダブルコードと禅の精神の確認
- Tailwind/DaisyUI の責務と既存 CSS の責務を明確に分離し、移行中も読み替え可能な構造にする。
- 「必要最小限の抽象化」「小さな変更の積み上げ」を優先し、全面置換は避ける。
- 変更対象を小さく分割し、各フェーズで「読める・理解できる・戻せる」状態を保つ。

## 実装方針（シンプルで分割された方法）
1. TailwindCSS + DaisyUI を導入し、テーマは 1 本に固定して配色を確定する。
2. 既存 `:root` の色変数と DaisyUI のテーマ変数を対応付ける。
3. レイアウト要素（ヘッダ/ヒーロー/カード）から段階的に Tailwind/DaisyUI へ移行。
4. `.blog` の本文スタイルは維持し、必要なら Tailwind Typography を段階導入。
5. アニメーションは `motion-safe` 前提の小さな keyframes を少数導入し、適用箇所を限定する。
6. `NetworkGraph` の色や背景はテーマトークンに合わせ、過剰な演出は避ける。

## TDD 前提の実装計画（テスト→失敗→実装→成功）

### Phase 0: テスト準備と失敗確認
- 追加するテスト（Playwright）
  - `e2e/theme.spec.ts`: `data-theme` の存在とテーマ名が期待通りであること。
  - `e2e/layout.spec.ts`: ヘッダに `navbar` 相当の構造があること（DaisyUI クラス or data-role を確認）。
  - `e2e/hero.spec.ts`: Hero とカードが新しい class（`hero`, `card`, `btn` 等）を持つこと。
  - `e2e/motion.spec.ts`: `prefers-reduced-motion` でアニメーションが抑制されること（`motion-safe` クラスの存在確認）。
- 失敗確認
  - 追加直後はテストが失敗することを確認し、差分の前提を明確にする。

### Phase 1: Tailwind/DaisyUI 基盤導入
- 失敗確認
  - 既存のテストが失敗することを再確認（テーマやクラスがまだ無い）。
- 実装
  - Tailwind/DaisyUI の依存を追加。
  - `tailwind.config.js` と `postcss.config.js` を追加。
  - DaisyUI のカスタムテーマ（暖色系の base と muted）を定義。
  - `styles/global.css` に `@tailwind base/components/utilities` を追加し、Preflight の影響を制御（必要なら `preflight: false` を検討）。
- 成功条件
  - Tailwind のユーティリティが動作し、DaisyUI テーマが読み込まれる状態になる。

### Phase 2: トークン整備（色・角丸・影・フォント）
- 失敗確認
  - テーマ変数が存在しない、または旧 `:root` だけで運用している状態。
- 実装
  - `:root` の色変数を DaisyUI テーマにマッピング（`primary`, `base-100`, `neutral` 等）。
  - 角丸・影・余白の基準を Tailwind `theme.extend` に定義。
  - フォントは `Noto Sans JP` を Tailwind `fontFamily` に登録。
- 成功条件
  - 主要ページで色・余白が統一トークンに切り替わる。

### Phase 3: レイアウト（Header/Nav）移行
- 失敗確認
  - `layout.tsx` で DaisyUI クラスが無いことをテストで確認。
- 実装
  - `components/layout.tsx` のヘッダ/ナビを DaisyUI `navbar`/`dropdown` で構成。
  - `@szhsin/react-menu` を維持する場合は、同一 UI 体系に合わせて段階的に廃止計画を記載。
- 成功条件
  - `e2e/layout.spec.ts` が通る。

### Phase 4: Hero/Card/Link の移行
- 失敗確認
  - Hero とカードが旧 CSS に依存している状態をテストで確認。
- 実装
  - `styles/index.module.css` を Tailwind/DaisyUI 化（Hero/カード/ボタン）。
  - Hero のジャンプアニメーションを Tailwind の `@keyframes` に移し `motion-safe` を付与。
- 成功条件
  - `e2e/hero.spec.ts` が通る。

### Phase 5: Markdown 本文の段階移行
- 失敗確認
  - `.blog` のみで `prose` が未適用であることを確認。
- 実装
  - `pages/posts/[id].tsx` の本文コンテナに `prose`（Tailwind Typography）を限定適用。
  - 既存 `.blog` セレクタと競合しないよう、段階的に上書き順序を確認。
- 成功条件
  - 本文の読みやすさが維持され、レイアウト崩れがない。

### Phase 6: NetworkGraph のテーマ整合
- 失敗確認
  - `NetworkGraph` が固定色・固定背景のままであることを確認。
- 実装
  - 背景色/角丸/色の参照をテーマトークンに置換。
  - 必要なら微細なパルスや hover のみ追加し、動作負荷を測る。
- 成功条件
  - グラフが全体トーンと一体化し、動作が重くならない。

### Phase 7: 整理と最終確認
- 失敗確認
  - 未使用 CSS/変数が残っていることを確認。
- 実装
  - 使わなくなった CSS Modules を整理。
  - `README` に導入概要とテーマ変更方法を簡潔に追記。
- 成功条件
  - `npm run dev` で主要ページが問題なく表示される。
  - `npm run build` で feed 生成や CSS 最適化が成功する。

## テスト・検証の流れ（実行順）
1. `npm run test:e2e` で追加したテストが失敗することを確認
2. 各フェーズ実装後に再実行し、成功を確認
3. `npm run dev` で手動確認（色・余白・アニメーションの違和感チェック）
4. `npm run build` で本番ビルドが通ることを確認

## リスクと対策
- Tailwind Preflight で既存スタイルが崩れるリスク → `preflight: false` や `@layer base` の調整で段階的に制御。
- DaisyUI テーマ決定が抽象的なまま進むリスク → 先に色見本とトークン命名を確定し、途中でブレないようにする。
- アニメーション過多のリスク → `motion-safe` 限定 + 影/移動量を最小化。
- コンポーネント置換の範囲が膨張するリスク → 1フェーズずつ差分を固定し、必要最低限に限定。

## 成果物
- Tailwind/DaisyUI/Animation を安全に導入するための詳細実装計画（本ファイル）。
