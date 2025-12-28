# Issu 204 修正計画: 静的サイト生成が上手くいかない

## 事象

- `npm run output` が失敗して静的サイト生成ができない。

## 第三者視点での事実整理

- Next.js は `15.3.1` を利用している。
- `next.config.js` に `output: "export"` が設定済み。
- `package.json` の `output` スクリプトは `next export` を呼び出している。
- `README.md` でも `next export` を前提に説明されている。
- `pages/` 配下は `getStaticProps` / `getStaticPaths` のみで、API ルートや SSR 依存は見当たらない。
- フィード生成は `next build` 時の Webpack プラグインで実行される。

## 問題点の考察

- Next.js 15 系では `next export` が非推奨/削除されており、`npm run output` が失敗する。
- `output: "export"` の構成では `next build` だけで `out/` が生成されるのに、実行コマンドが二重化されている。
- ドキュメントの記述が現在の Next.js 挙動と一致していない。

## 方針（Readable Code / Zen）

- 1つの真実（`next build`）に集約し、設定とドキュメントを一致させる。
- 説明は簡潔に、実行ステップは最小限にする。
- 変更は小さく分割し、理解しやすい粒度で進める。

## TDD 前提の進め方

1. テスト追加（先に失敗を作る）
   - 例: `npm run output` 実行後に `out/index.html` が存在することを確認するスモークテストを用意する。
2. 失敗確認
   - 現状の `npm run output` を実行し、`next export` エラーで失敗することを確認。
3. 実装
   - `package.json` の `output` スクリプトを `next build` に変更。
   - `README.md` の静的出力手順を現行仕様に合わせて更新。
4. 成功確認
   - `npm run output` を再実行し、`out/` が生成されることを確認。
   - 可能なら Playwright の軽量チェックでトップページが表示できることも確認。

## 影響範囲

- `package.json`: ビルド/出力スクリプト。
- `README.md`: ビルドとデプロイ手順の説明。
- CI / ドキュメント: 静的出力の手順記載がある場合は併せて更新。
