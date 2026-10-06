# Proposal

## Why

サイト表示用のTwemoji変換がFeed本文にも適用され、リーダー側の絵文字表示を妨げている。また、記事の`date`が公開日時と更新日時を兼ね、出力先で両者を区別できない。正本の意味と表示先の都合を分離する。

## What Changes

- サイトの初期HTMLではTwemojiを維持し、RSS・Atom・JSON Feedでは本文と概要の絵文字をUnicodeのまま出力する。
- **BREAKING**: 記事frontmatterの`date`を廃止し、`published`と`updated`を必須の正本にする。旧フィールドや生成時刻による互換フォールバックは設けない。
- 既存記事は両フィールドに旧`date`の値を移す。承認したタイムゾーンなしの5記事だけ、日本時間の`+09:00`を明示する。従来の日時更新運用を引き継ぎ、最初の公開日時を復元しない。
- 公開・更新日時をHTMLの可視表示、mf2、OG、JSON-LD、対応するFeed項目、standard.siteレコードに反映する。
- 公開日時順の一覧を維持し、Feed全体の更新日時は記事の更新日時から決定する。

## Capabilities

### New Capabilities

- `post-timestamps`: 記事の公開・更新日時を正本で明示し、検証・一覧・各出力先へ一貫して反映する。

### Modified Capabilities

- `static-twemoji-rendering`: サイト表示の画像化を維持しつつ、Feed本文と概要のUnicode絵文字を保持する要件を追加する。

## Impact

- `posts/*.md`の全記事、記事メタデータ型・読み込み・並び替え、日時コンポーネントと一覧・記事ページ。
- `lib/posts.ts`のMarkdownレンダリングとFeed生成、`lib/sync-standard-site.ts`のレコード生成。
- 固定fixtureを使う日時・Feed・Twemoji・standard.siteのテストとページ出力の検証。
- standard.siteは既存Lexiconの`publishedAt`と`updatedAt`を利用し、アプリケーション依存を追加しない。
- 記事URL、本文、明示概要の選択規則、Feedの抜粋上限、Mermaid等のレンダリングは変更しない。
