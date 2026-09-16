## Context

`pages/posts/[id].tsx` は、`lib/posts.ts` が生成する本文HTMLから記事概要を作り、共通レイアウトへ渡す。共通レイアウトは同じ概要をHTMLメタデータ、OGP、Twitterカード、JSON-LDへ出力する。本文変換は`remarkRehype`、`rehypeRaw`、`rehypeStringify`を使用し、`rehypeRaw`後にはHASTの要素とクラス属性が存在する。

`lib/sync-standard-site.ts` は記事frontmatterを読み、ATProto文書を生成する。ページと同期が別の概要抽出を持つと結果が不一致になるため、両方が共有する抽出経路を用意する。

Markdown変換には、外部URLのメタデータを取得してリンクカードを生成する旧経路が残っている。この変更では外部リンクを通常のリンクとして扱い、ビルドや記事表示から外部メタデータ取得を除去する。

## Goals / Non-Goals

**Goals:**

- 既存のunified/rehypeパイプラインから`p-summary`を抽出する。
- ページとATProto同期で同じ`p-summary`の決定結果を使用する。
- `p-summary`がない記事のページ表示を既存フォールバックで維持する。
- frontmatter `description`の旧経路を型・伝播・同期処理から除去する。
- 外部リンクカードの生成と外部メタデータ取得を除去する。
- 追加パッケージを導入せず、既存のテスト構成で検証する。

**Non-Goals:**

- 記事本文のHTML表示を変更しない。
- ホームページの固定説明文を変更しない。
- Webmentionのリンク先選択を変更しない。
- 既存記事へ`p-summary`を一括追記しない。

## Decisions

### HASTの変換途中で概要を抽出する

`rehypeRaw`直後、`rehypeStringify`直前にローカルrehype transformerを実行する。transformerはHASTを再帰走査し、要素のクラス一覧に`p-summary`が含まれる要素を探す。rawノードの文字列を正規表現で解析する方式は採用しない。

この位置なら、HTML要素のクラスと子孫テキストを構文木から扱える。既存依存だけで実装でき、`rehype-parse`などの追加パッケージも不要になる。

### p-summaryの選択規則を共通化する

記事本文の変換処理は、本文HTMLと概要値を同じ結果として返す。記事ページとATProto同期はこの共有処理を呼び出し、別々にMarkdownやHTMLを解析しない。

概要抽出は次の規則で実装する。

1. `p-summary`クラスをトークン単位で照合する。
2. 要素の種類を`p`に限定しない。
3. 子孫テキストを文書順に連結する。
4. 装飾HTMLを除去し、連続空白を1つへ正規化する。
5. 空白だけの結果を空として扱う。
6. 最初の空でない結果を採用する。

### 出力先ごとにフォールバックを分ける

記事ページは`pSummary`があれば使用し、なければ既存の本文先頭120文字を使用する。共通レイアウトの入力値をこの解決済み概要にすることで、HTMLメタデータ、OGP、Twitterカード、JSON-LDを一致させる。

ATProto同期は`pSummary`がある場合だけ`description`を設定する。`pSummary`がない場合はプロパティを設定せず、ページ用の本文先頭120文字を流用しない。

### frontmatter descriptionを許可された記事データから除外する

`PostFrontMatter`と記事データの型から`description`を削除する。frontmatter全体をそのままspreadして後続データへ渡す経路は、許可キーを明示して構築するか、少なくとも`description`を除外して旧経路を断つ。同期処理は`fm.description`を参照しない。

frontmatterの既存記事値は0件なので、移行処理は追加しない。READMEと投稿テンプレートの説明は`p-summary`の記載方法へ更新する。

### 外部リンクカード生成を削除する

`remark-link-card`のimportとprocessor登録を削除する。`shouldEnableExternalFetch`、`RenderMarkdownOptions.enableExternalFetch`、`DISABLE_EXTERNAL_FETCH`関連の経路も削除する。外部URLを含むMarkdownは通常のHTMLリンクへ変換し、OGPや外部ページのメタデータを取得しない。

この選択は、client bundleへNode.js組み込みモジュールを引き込む問題と、ビルド時の外部ネットワーク依存を同時に解消する。既存の`remark-link-card`専用型定義、専用テスト、不要になった直接依存を削除する。

## Risks / Trade-offs

- **[p-summary未設定記事のATProto概要が消える]** → 現在の記事frontmatterに`description`値はなく、仕様どおり未設定時はフィールドを省略する。ページ側は既存フォールバックを維持する。
- **[本文HTMLの構文木と同期処理の結果が分岐する]** → p-summary抽出を共有処理へ集約し、同じテキスト正規化規則を使用する。
- **[複雑なHTMLのテキスト順序が変わる]** → 子孫テキストを文書順に走査し、ネストしたインライン要素をテストする。
- **[frontmatter descriptionを利用する外部利用者に影響する]** → リポジトリ内の記事値が0件であることを確認済みで、READMEの投稿ルールも更新する。

## Migration Plan

1. 共通の本文変換処理へHAST概要抽出を追加する。
2. 記事ページとATProto同期を新しい概要値へ接続する。
3. frontmatter `description`の型・伝播・参照を削除する。
4. README、テンプレート、関連テストを更新する。
5. 既存のページ概要フォールバックとATProto出力をテストする。

ロールバック時は、変更した概要選択と同期処理を元の経路へ戻す。記事frontmatterの既存値は0件のため、データ復元作業は発生しない。
