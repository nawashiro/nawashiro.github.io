## Why

記事原稿ではGitHub Alerts記法をすでに使用していますが、現在のMarkdown変換処理はそれを通常の引用として出力します。そのため、公開記事で`[!NOTE]`や`[!WARNING]`が本文に残り、GitHub上の表示と一致しません。

## What Changes

- GitHub Alertsの標準記法を、タイトルと本文を持つアラートとして表示する。
- `NOTE`、`TIP`、`IMPORTANT`、`WARNING`、`CAUTION`の5種類を扱う。
- DaisyUIの`alert-soft`スタイルを使い、種類ごとの色を表示へ反映する。
- 本文内の通常のMarkdown、GFM、リンク、強調、複数段落を保持する。
- 通常の引用、未知のアラート記法、コードフェンス内の文字列を変更しない。
- 既存のコードタイトル機能と`remark-prism`によるシンタックスハイライトを維持する。
- `remark-prism`が要求する既存の`jsdom`依存を、パッケージインストールとテストで検証できる状態へ復旧する。
- Markdown原稿や既存のWebmention処理は変更しない。

## Capabilities

### New Capabilities

- `github-markdown-alerts`: GitHub Alerts記法を記事HTMLへ変換し、タイトル、本文、種類別の表示を提供する。

### Modified Capabilities

<!-- 既存の本体仕様に対応する機能は存在しないため、変更対象なし。 -->

## Impact

- Markdown変換パイプラインと、その回帰テストを変更する。
- アラート用のローカル変換処理と記事CSSを追加する。
- 記事の静的HTMLと、同じ変換結果を含むRSS、Atom、JSON FeedのHTMLへ影響する。
- `remark-prism`とコードタイトル機能は維持する。新しいシンタックスハイライト依存は追加しない。
- `jsdom`を含む既存の依存ツリーを復旧し、型検査、テスト、ビルドで確認する。
- 既存の`archive-webmentions` OpenSpec変更、Webmentionアーカイブ、Markdown原稿の内容は対象外とする。
