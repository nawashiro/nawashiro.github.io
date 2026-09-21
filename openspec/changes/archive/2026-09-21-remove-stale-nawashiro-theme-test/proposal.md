## Why

`e2e/theme.spec.ts` は、現在は使用していない過去の `nawashiro` theme 名を固定で期待しています。テーマは用途に応じて切り替えるため、特定のテーマ名をテストへ埋め込むと、正しいテーマ変更のたびに不要なテスト失敗が発生します。

## What Changes

- E2Eテストから `nawashiro` という固定のテーマ名期待を除去する。
- HTMLの `data-theme` 属性が空でないことだけを検証し、現在選択されているテーマを尊重する。
- 現在の本番テーマ設定、テーマ定義、DaisyUI設定は変更しない。
- ブランド名としての `nawashiro` やGit履歴は変更しない。

## Capabilities

### New Capabilities

<!-- 実行時の新しい機能は追加しない。 -->

### Modified Capabilities

<!-- 仕様レベルの動作変更はない。純粋なE2Eテスト契約の修正なので skip_specs: true とする。 -->

## Impact

- `e2e/theme.spec.ts` のテスト契約だけに影響する。
- サイトの実行時テーマ、生成HTMLのテーマ設定、CSS、依存関係、APIには影響しない。
- ユニットテスト、対象E2Eテスト、OpenSpec検証で確認する。
