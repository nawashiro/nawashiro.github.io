## 1. 静的exportサーバー

- [x] 1.1 `scripts/serve-export.mjs` を追加し、`out/index.html` の存在確認、静的ファイルの直接配信、`/posts/<id>` から `/posts/<id>.html` へのclean URL解決、ディレクトリindex、404、パストラバーサル拒否を実装する。`PORT=3100 node scripts/serve-export.mjs` とHTTPリクエストでroot・記事URL・存在しないURL・不正パスの応答を確認する
- [x] 1.2 `playwright.config.ts` の `webServer` を `next start` から静的exportサーバーへ変更し、`package.json` のE2E実行を「ビルド一回 → Playwright起動」に分離する。`out/` を生成した状態でPlaywrightがサーバー起動待ちを通過することを確認する

## 2. E2Eビルドの外部取得制御

- [x] 2.1 `lib/posts.ts` の `remark-link-card` 登録を `shouldEnableExternalFetch()` の真分岐だけで行うよう修正し、既定の本番経路では有効、testまたは明示的無効化時は無効になることを確認する
- [x] 2.2 `tests/external-fetch.spec.ts` に実際のMarkdown変換経路の回帰検証を追加し、`DISABLE_EXTERNAL_FETCH=1` のE2Eビルドで外部リンクカード取得を行わないことを確認する

## 3. 統合検証

- [x] 3.1 `DISABLE_EXTERNAL_FETCH=1 npm run build` を実行し、`out/index.html` と代表記事の `.html` が生成され、外部リンクカード取得によるビルドエラーが発生しないことを確認する
- [x] 3.2 `npm run test:e2e` を実行し、ホーム、clean URLの記事ページ、canonical、JavaScript無効時のWebmention表示、テーマ属性を含む全E2Eが成功することを確認する
- [x] 3.3 `npm test`、`npm run typecheck`、`npm run lint`、`openspec validate --all --json`、`git diff --check` を実行し、既存テスト・型検査・Lint・OpenSpec検証・空白検査が成功することを確認する
