## Purpose

Standard-site同期が、公開ページの全文レンダリングに伴うブラウザ依存を実行せず、記事のp-summaryを安定してdescriptionへ反映できるようにする。

## ADDED Requirements

### Requirement: Standard-site同期は概要抽出だけを実行する

Standard-site同期は、記事のdescriptionを決めるためにp-summaryを抽出しなければならない。descriptionに不要な本文HTML生成、Mermaid図のブラウザレンダリング、またはPlaywrightの実行を、同期処理は**MUST NOT**行う。

#### Scenario: Mermaidコードを含む記事を同期する

- **WHEN** Standard-site同期がMermaidコードブロックを含む記事を処理する
- **THEN** 同期はブラウザベースの図表レンダリングなしに完了し、記事のp-summaryが存在すればdescriptionへ設定する

#### Scenario: p-summaryがない記事を同期する

- **WHEN** Standard-site同期がp-summaryを含まない記事を処理する
- **THEN** descriptionを省略し、Mermaidその他の全文HTMLレンダリングを実行しない

### Requirement: 概要抽出のテキスト意味を維持する

同期時のp-summary抽出は、公開ページで使う抽出結果と同じく、最初の空でないp-summary要素を対象にし、ネストした装飾要素を除いたテキストを空白正規化して返すことを**MUST**とする。

#### Scenario: 装飾されたp-summaryを抽出する

- **WHEN** p-summary要素がstrong、link、改行などのネスト要素を含む
- **THEN** 抽出結果は装飾を含まない読み上げテキストとして返され、連続空白は1つに正規化される

### Requirement: 公開ページの全文レンダリングを変更しない

Standard-site同期の軽量化は、通常のNext.jsサイトbuildにおけるMermaid、Prism、KaTeXその他のMarkdown本文レンダリング結果を変更してはならず、公開経路の既存出力を**MUST NOT**変更する。

#### Scenario: 通常のサイトbuildでMermaid記事を生成する

- **WHEN** Next.jsがMermaidコードを含む記事の公開HTMLを生成する
- **THEN** 既存のMermaidレンダリング経路が使われ、公開記事の本文HTMLは従来どおり生成される
