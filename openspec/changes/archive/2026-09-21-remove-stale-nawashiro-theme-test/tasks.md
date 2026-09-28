## 1. テーマテスト契約の修正

- [x] 1.1 `e2e/theme.spec.ts` の `nawashiro` 固定期待を除去し、`html` の `data-theme` が空でないことを検証する。`nawashiro` というテーマ名の期待がテストに残っていないことを確認する
- [x] 1.2 対象E2Eテスト、ユニットテスト、`openspec validate --all --json`、`git diff --check` を実行し、テーマ設定を変更せずに全検証が成功することを確認する
