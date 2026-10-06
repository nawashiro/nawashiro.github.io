# Tasks

## 1. 正本と日時の読み込み

- [x] 1.1 実装者は全既存記事の旧日時を監査する。実装者は欠損・不正値の有無を一覧で確認する。
- [x] 1.2 実装者は記事frontmatterと型を`published`・`updated`へ一括移行する。実装者は全記事の両値と旧値の一致（承認した5記事は日本時間の明示化）、旧`date`の除去、本文の不変を機械的に検証する。
- [x] 1.3 実装者は共通の日時検証を読み込み境界へ置く。固定fixtureは日付のみ、オフセット付き日時、欠損、不正値、エラーの対象記事とフィールドを検証する。
- [x] 1.4 実装者は一覧とFeedの選択を公開日時の瞬間順へ変更する。固定fixtureは異なるオフセットと更新日時だけの変更で並び順を検証する。

## 2. HTMLとstandard.siteの日時

- [x] 2.1 実装者は日時コンポーネントと一覧表示を移行する。固定入力テストは公開・更新の種別と日本語表示を検証する。
- [x] 2.2 実装者は記事ページの可視日時、mf2、OG、JSON-LDを更新する。固定入力テストは異なる両日時と同値の両日時を検証する。
- [x] 2.3 実装者はstandard.siteの`publishedAt`・`updatedAt`を設定する。既存レコード生成テストは正本の日時対応と概要抽出の維持を検証する。テストはライブ同期を実行しない。

## 3. FeedのUnicode絵文字と日時

- [x] 3.1 実装者は共通Markdown処理に`page`・`feed`の出力先境界を置く。固定fixtureはページのTwemoji画像とFeedのUnicode文字を検証する。
- [x] 3.2 実装者はFeed本文と概要にUnicode出力を使用する。既存Feedテストは明示概要、本文抜粋、200文字境界、著者指定画像、コード内の絵文字を全形式で検証する。
- [x] 3.3 実装者は各Feed形式に公開・更新日時を設定する。固定fixtureはAtom、JSON Feed、RSSの対応項目と生成時刻に依存しないFeed全体日時を検証する。
- [x] 3.4 実装者は空Feedの更新日時を固定値にする。固定fixtureは空入力の生成成功と日時の再現性を検証する。

## 4. 統合確認

- [x] 4.1 実装者は`npm test`と`npm run typecheck`を実行する。実装者は結果と残る障害を記録する。
- [x] 4.2 実装者は外部同期を無断実行せず、設定を確認して統合buildを実行する。実装者は生成HTMLと各Feedの出力を確認する。環境の障害は個別テスト結果と分けて報告する。
- [x] 4.3 実装者は最終差分を確認する。実装者は記事本文、URL、旧日時値の保持と不要な互換フォールバックの不在を確認する。

## Workflow follow-up

- レビュー後に実装の公開と外部同期を承認する。
- 完了したchangeをアーカイブし、正本仕様への反映を確認する。

## Verification results

- `npm test`: 100件が合格した。
- `npm run typecheck`: 成功した。
- `npx --no-install playwright test --config=playwright.config.ts`: 13件が合格した。
- 全186記事の照合は日時以外の内容の不変を確認した。承認した5記事だけ日本時間を明示した。
- 生成した全186記事のHTMLはmf2、OG、JSON-LDの日時と正本の一致を確認した。
- 全Feed形式の各50記事は公開・更新日時と正本の一致を確認した。Feed本文は生成Twemoji画像を含まない。
- 統合buildは`CIRCLE_NODE_TOTAL=2 ATP_IDENTIFIER='' ATP_APP_PASSWORD='' npm run build`で成功した。
- 検証は`PLAYWRIGHT_BROWSERS_PATH=/opt/data/.cache/ms-playwright`の既存ブラウザを使用した。
- 既定並列数の最初のbuildはタイムアウトした。検証実行は並列数を1に制限した。ソース設定は変更しなかった。
- 同期処理は資格情報なしでスキップした。実装者は公開、外部同期、commit、pushを実行しなかった。
- buildは既存の画像・CSS・大きいページデータ・Browserslistの警告を出した。buildは成功した。
