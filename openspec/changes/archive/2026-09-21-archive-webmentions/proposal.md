## Why

受信済みのWebmentionは現在Webmention.ioに依存しており、外部サービスの都合で失われるとサイトからも復元できない。公開リポジトリに取得済みデータを保存し、静的HTMLとして表示することで、外部サービスの継続性とブラウザ側のJavaScriptに依存しないWebmention表示を実現する。

## What Changes

- Webmention.ioから取得したJF2データを、公開リポジトリ内のバージョン管理対象JSONアーカイブへ保存する。
- アーカイブはWebmention.ioからローカルJSONへの一方向・非破壊取り込みとし、リモートから消えたことだけを理由にローカルデータを削除しない。
- HTTPSを基準にWebmentionの対象URLを正規化し、記事のWebmentionをアーカイブから全件表示する。
- Webmention表示をビルド時の静的レンダリングへ移行し、ブラウザ側のWebmention API取得を廃止する。
- 定期同期で実質的なアーカイブ差分がない場合は静的生成・デプロイを実行しない。差分がある場合だけサイトを再生成・公開する。
- 意図した削除はWebmention.io側で削除した後、ローカルアーカイブからも手動で削除する。削除前のデータがGit履歴に残ることは許容する。

## Capabilities

### New Capabilities

- `webmention-archive`: 受信済みWebmentionの公開アーカイブ、非破壊同期、差分時のみの静的公開、静的HTML表示を定義する。

### Modified Capabilities

<!-- 既存のOpenSpec仕様は存在しないため、変更対象なし。 -->

## Impact

- `components/WebMention.tsx`: ブラウザ側の取得をやめ、ビルド時に渡されたアーカイブデータを表示する。
- `pages/posts/[id].tsx`およびビルド用データアクセス層: 記事ごとのWebmentionを静的Propsへ組み込む。
- Webmention同期スクリプト、公開JSONアーカイブ、GitHub Actionsの同期・条件付きデプロイ処理を追加する。
- Webmention.ioのAPIトークンをGitHub Actions Secretとして扱う。
- Webmentionの表示・同期・差分判定・取得失敗時の保持動作に関するテストとドキュメントを追加する。
