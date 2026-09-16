## Purpose

記事本文で著者が指定したMicroformats 2の`p-summary`を、ページ概要と外部同期の概要へ一貫して反映する。

## ADDED Requirements

### Requirement: p-summaryから記事概要を決定する

システムは、記事本文内の`p-summary`クラスを持つ要素から、文書順で最初の空でない概要を決定する（MUST）。システムは要素内の装飾HTMLを除いた子孫テキストを概要として扱い、連続する空白を正規化する（MUST）。

#### Scenario: ネストした要素を含むp-summaryを抽出する

- **WHEN** 記事本文が`p-summary`クラスを持つ要素にテキストとインライン装飾要素を含む
- **THEN** システムは装飾要素の表示テキストを含む概要を決定する

#### Scenario: 複数のp-summaryから最初の値を選ぶ

- **WHEN** 記事本文が複数の空でない`p-summary`要素を含む
- **THEN** システムは文書順で最初の要素の概要だけを決定する

#### Scenario: 空のp-summaryを無視する

- **WHEN** 最初の`p-summary`要素が空白だけで、後続に空でない`p-summary`要素がある
- **THEN** システムは後続の空でない要素の概要を決定する

### Requirement: 記事ページの概要へp-summaryを反映する

システムは、決定した`p-summary`を記事ページの`description`、Open Graph概要、Twitterカード概要、JSON-LDの概要に同じ値で反映する（MUST）。`p-summary`が未設定または空の場合、システムは既存の本文先頭120文字フォールバックを使用する（MUST）。

#### Scenario: p-summaryを記事ページの各概要へ反映する

- **WHEN** 記事に空でない`p-summary`がある
- **THEN** システムはHTMLメタデータ、OGP、Twitterカード、JSON-LDの概要に同じ`p-summary`を出力する

#### Scenario: p-summaryがない記事で既存フォールバックを使う

- **WHEN** 記事に空でない`p-summary`がない
- **THEN** システムは記事本文から生成した既存の先頭120文字を各概要へ出力する

### Requirement: ATProto同期の概要へp-summaryを反映する

システムは、ATProtoの`site.standard.document`へ記事概要を同期するとき、決定した`p-summary`だけを`description`として出力する（MUST）。記事に空でない`p-summary`がない場合、システムは`description`フィールドを出力しない（MUST）。

#### Scenario: p-summaryをATProto文書へ同期する

- **WHEN** 同期対象の記事に空でない`p-summary`がある
- **THEN** システムはその値をATProto文書の`description`へ出力する

#### Scenario: p-summaryがないATProto文書からdescriptionを省略する

- **WHEN** 同期対象の記事に空でない`p-summary`がない
- **THEN** システムはATProto文書に`description`フィールドを出力しない

### Requirement: frontmatter descriptionの旧経路を除去する

システムは、記事frontmatterの`description`を記事ページまたはATProto同期の概要へ使用・伝播しない（MUST）。記事frontmatterの`description`値が存在しても、概要決定結果を変更しない（MUST）。

#### Scenario: frontmatter descriptionを概要決定から除外する

- **WHEN** 記事がfrontmatterの`description`だけを持ち、本文に空でない`p-summary`を持たない
- **THEN** 記事ページは既存の本文先頭120文字フォールバックを使用し、ATProto文書は`description`を出力しない
