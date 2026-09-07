## 1. 依存状態とREDテスト

- [x] 1.1 既存の`package.json`と`package-lock.json`を変えずに`npm install`を実行し、`npm ls jsdom`が`invalid`を報告せず、`remark-prism`を読み込めることを確認する
- [x] 1.2 `tests/markdown-alerts.spec.ts`へ標準5種類のタイトル、本文、マーカー除去を検証するテストを追加し、`npm test -- tests/markdown-alerts.spec.ts`が未実装の通常引用出力でREDになることを確認する
- [x] 1.3 同じテストへ本文のリンク、強調、複数段落、空本文を追加し、`npm test -- tests/markdown-alerts.spec.ts`で期待する本文保持の不足を確認する

## 2. Markdown変換

- [x] 2.1 Markdown ASTのblockquoteを標準マーカーだけ変換するローカルremarkプラグインを追加し、未知の種類と通常引用を変更しない単体テストが通ることを確認する
- [x] 2.2 `remarkGfm`の後、`remarkRehype`の前へローカル変換を接続し、`npm test -- tests/markdown-alerts.spec.ts`で5種類のAlert HTMLと本文保持がGREENになることを確認する
- [x] 2.3 アラート内のコードフェンスと既存のコードタイトルを検証し、`remark-prism`が生成するシンタックスハイライトと`.remark-code-container`が維持されることを確認する

## 3. DaisyUI表示

- [x] 3.1 AlertコンテナへDaisyUIの`alert`、種類別クラス、`alert-soft`を付与し、`tests/markdown-alerts.spec.ts`で色の対応と`role="alert"`を付けないことを確認する
- [x] 3.2 タイトルと本文をDOMのテキスト要素として出力し、CSSの疑似要素がなくても種類名と本文を取得できることをテストで確認する
- [x] 3.3 `styles/global.css`へ必要な記事内の余白調整だけを追加し、Alertの表示が通常引用、コードブロック、レスポンシブ幅を壊さないことをブラウザテストまたは静的HTML確認で検証する

## 4. 静的出力と回帰検証

- [x] 4.1 既存の`NOTE`と`WARNING`を含む記事を変換し、生成HTMLに`[!NOTE]`や`[!WARNING]`のマーカーが残らず、タイトルと本文が残ることを確認する
- [x] 4.2 RSS、Atom、JSON Feedの生成結果にもタイトルと本文が含まれ、Markdown原稿とWebmention処理に差分がないことを確認する
- [x] 4.3 `npm run typecheck`、`npm run lint`、`npm test`を実行し、全テストと型検査、Lintが成功することを確認する
- [x] 4.4 `DISABLE_EXTERNAL_FETCH=1 npm run build`を実行し、静的ビルドが成功することと、代表記事のHTMLを目視確認する
- [x] 4.5 `openspec validate --all --json`と`git diff --check`を実行し、OpenSpecの検証と差分の空白検査が成功することを確認する
