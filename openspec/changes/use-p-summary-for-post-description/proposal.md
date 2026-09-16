## Why

記事本文には、Microformats 2 の `p-summary` クラスで共有用の概要を明示する記事がある。現在のページ概要は本文HTML全体からタグを除去して先頭120文字を生成するため、著者が指定した概要をメタデータやOpen Graph（OGP）へ反映しない。

frontmatter の `description` は記事で使用されておらず、ページとATProto同期に残る旧経路になっている。`p-summary` を記事概要の正本にして、概要の出力経路を統一する。

## What Changes

- `rehypeRaw` 後のHAST（Hypertext Abstract Syntax Tree）から、`p-summary` クラスを持つ最初の空でない要素のテキストを抽出する。
- 抽出した `p-summary` を記事ページの概要として使用する。
- `p-summary` を `description`、Open Graph、Twitterカード、JSON-LDへ反映する。
- `p-summary` が未設定または空の場合、記事ページでは既存の本文先頭120文字フォールバックを使用する。
- ATProtoの `site.standard.document.description` には `p-summary` だけを使用する。
- ATProto同期で `p-summary` が未設定または空の場合、`description` フィールドを出力しない。
- frontmatter の `description` 型定義、伝播経路、同期処理での参照を削除する。
- frontmatter の `description` を推奨するREADMEの投稿ルールを、`p-summary` の記載方法へ更新する。
- HAST抽出処理をページとATProto同期で共有し、出力差異を防ぐ。
- `p-summary` のネストしたインライン要素、未設定、空文字、既存フォールバックをテストする。

## Capabilities

### New Capabilities

- `post-summary-metadata`: 記事の `p-summary` をページメタデータ、OGP、JSON-LD、ATProto同期へ反映する。

### Modified Capabilities

なし。既存specは存在しない。

## Impact

- `lib/posts.ts`: HASTからの概要抽出、記事データ型、frontmatter旧経路を変更する。
- `pages/posts/[id].tsx`: p-summary由来の概要を既存のhead・JSON-LD経路へ渡す。
- `lib/sync-standard-site.ts`: frontmatter `description` の参照をp-summary抽出へ置換する。
- `components/layout.tsx`: 既存のメタデータ出力を維持する。
- `README.md`: 投稿ルールを更新する。
- 関連テスト: 概要抽出、フォールバック、同期出力を追加または更新する。
- 追加パッケージは導入しない。既存のunified、remark、rehypeパイプラインを使用する。
- 記事本文のHTML表示、ホームページの固定説明文、既存のWebmention表示ロジックは変更しない。
