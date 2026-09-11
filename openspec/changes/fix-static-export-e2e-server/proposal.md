## Why

このリポジトリは `output: "export"` で静的HTMLを生成するため、Playwright E2Eの `next start` 起動は利用できません。また、生成物は `out/posts/<id>.html` なのにテストURLは `/posts/<id>` であり、静的サーバー側のclean URL解決が必要です。現在の設定ではサーバー起動エラーまたは起動待ちタイムアウトになり、テスト本体へ到達できません。

## What Changes

- E2Eでは `next start` ではなく、Next.jsの静的export `out/` を配信するサーバーを使う。
- `/posts/<id>` を `out/posts/<id>.html` へ解決するclean URL配信を追加する。
- ビルド処理とE2Eサーバー起動を分離し、ビルド失敗とサーバー起動失敗を個別に診断できるようにする。
- E2Eビルド時に外部取得を無効化できるよう、`remark-link-card` の登録条件を修正する。
- 本番の静的デプロイ、サイトのURL設計、UI、テーマは変更しない。

## Capabilities

### New Capabilities

<!-- 実行時のサイト機能は追加しない。 -->

### Modified Capabilities

<!-- 仕様レベルの動作変更はない。E2E・ビルド検証基盤の変更なので skip_specs: true とする。 -->

## Impact

- `playwright.config.ts` のE2E WebServer設定を変更する。
- `scripts/serve-export.mjs` など、静的exportをローカル配信する補助スクリプトを追加する。
- `package.json` のE2E実行手順を、ビルドと配信の分離に合わせて調整する可能性がある。
- `lib/posts.ts` の外部リンクカード処理を、明示的な外部取得許可時だけ実行する。
- E2Eとビルドの再現性は改善するが、本番サイトのHTML生成仕様やデプロイ先は変更しない。
