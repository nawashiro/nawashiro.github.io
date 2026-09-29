# Proposal

## Why

Webmention.io から記事本文が丸ごと渡される場合があり、現在の公開アーカイブは受信エントリを完全保存し、表示側も文字数制限なしで出力する。第三者の記事全文を自サイトで公開・再配布しないよう、保存時と表示時の両方に上限が必要。

## What Changes

- 受信した Webmention の公開アーカイブには表示・照合・増分同期に必要な項目のみを保存し、本文は最大140文字の抜粋に限定する。`content.html` 等の全文フィールドは保存しない。
- 既存の公開アーカイブも同じ方針に合わせて変換する。Git 履歴の書き換えは対象外。
- 返信本文とリアクションの説明文など、Webmention 由来の本文表示を最大140文字に制限する。省略記号も上限に含める。
- Webmention のリンクは既存の `rel="nofollow ugc"` を維持する。
- 作業前にリモートの `main` を取得し、最新の Webmention を含む `main` を `dev` にマージしたうえで、アーカイブの変換対象を確定する。

## Capabilities

### New Capabilities

なし。

### Modified Capabilities

- `webmention-archive`: 公開アーカイブの保存内容を最小化し、Webmention 本文の表示長を制限する。

## Impact

`lib/data/webmentions.json`、Webmention 同期・アーカイブ処理、`components/WebMention.tsx`、関連テストと仕様。Git 履歴の書き換え、外部 Webmention.io 上のデータ削除、リンク先ページの内容変更は行わない。
