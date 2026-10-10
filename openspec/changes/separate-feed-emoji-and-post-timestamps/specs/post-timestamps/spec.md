# Spec Delta

## Purpose

記事の正本は公開日時と更新日時を明示する。サイトと外部配信は同じ正本から日時を出力する。この仕様は、旧フィールドや生成時刻による暗黙の補完を除去し、日時の意味を出力先の制約から分離する。

## ADDED Requirements

### Requirement: 公開日時と更新日時を正本にする
システムは記事frontmatterの`published`と`updated`を必須の日時として扱う（MUST）。システムは旧`date`、ファイル時刻、Git履歴、生成時刻から欠損値を補完しない（MUST）。

#### Scenario: 正本に両日時がある
- **WHEN** 記事に有効な`published`と`updated`がある
- **THEN** システムはそのふたつを公開日時と更新日時として使用する

#### Scenario: 必須値がないか不正である
- **WHEN** いずれかの必須日時が欠損または不正である
- **THEN** システムは記事とフィールドを特定するエラーを出す
- **THEN** システムは代替値を生成しない

### Requirement: 既存記事の日時を一括移行する
移行は全既存記事の旧`date`値を`published`と`updated`の両方へ転記する（MUST）。承認したタイムゾーンなしの5記事だけは、日本時間の`+09:00`を明示する（MUST）。それ以外の日時値は保持する（MUST）。移行は旧`date`を除去する（MUST）。移行は日時以外の記事内容と識別子を変更しない（MUST）。

#### Scenario: 過去に日時を更新した記事を移行する
- **WHEN** 既存記事の旧`date`が`2026-09-16`である
- **THEN** 移行は`published`と`updated`に`2026-09-16`を設定する
- **THEN** 移行は最初の公開日時を推測しない

### Requirement: 日付のみの値を一貫して解釈する
システムは既存記事の日付のみの値を引き続き受け付ける（MUST）。時刻を必要とする出力は日付のみの値をUTCの午前0時として扱う（MUST）。オフセット付き日時の変換は元の瞬間を維持する（MUST）。

#### Scenario: 日付のみの正本を外部へ出す
- **WHEN** 正本の日時が`2026-09-16`である
- **THEN** 時刻を必要とする出力は`2026-09-16T00:00:00.000Z`と同じ瞬間を表す

#### Scenario: オフセット付き日時を外部へ出す
- **WHEN** 正本の日時が`2026-09-16T09:00:00+09:00`である
- **THEN** 出力は`2026-09-16T00:00:00.000Z`と同じ瞬間を表す

### Requirement: 記事一覧を公開日時順にする
システムは既存の記事一覧とFeed記事の選択を`published`の新しい順で決定する（MUST）。システムは`updated`の変更だけで記事を新着として並び替えない（MUST）。

#### Scenario: 古い記事を更新する
- **WHEN** 古い記事の`updated`だけが新しい記事より新しくなる
- **THEN** システムは`published`による記事順を維持する

### Requirement: HTMLに公開日時と更新日時を出す
記事ページは公開日時と更新日時を区別して可視表示する（MUST）。記事ページは同じ`h-entry`内の対応する`time`要素に、mf2（Microformats 2）の`dt-published`と`dt-updated`クラスを付ける（MUST）。各`datetime`属性は対応する正本の日時を表す（MUST）。

#### Scenario: 公開日時と更新日時が異なる
- **WHEN** 記事ページを出力する
- **THEN** ページは各日時を公開・更新のラベルで区別する
- **THEN** `dt-published`と`dt-updated`はそれぞれの正本値を表す

#### Scenario: 両日時が同じである
- **WHEN** 記事の公開日時と更新日時が同じである
- **THEN** 記事ページは両方のmf2プロパティを出力する

### Requirement: ページメタデータへ日時を反映する
記事ページは`published`をOG（Open Graph）の`article:published_time`とJSON-LDの`datePublished`に出す（MUST）。記事ページは`updated`を`article:modified_time`と`dateModified`に出す（MUST）。

#### Scenario: 更新済み記事のメタデータを生成する
- **WHEN** 正本の公開日時と更新日時が異なる
- **THEN** ページメタデータは両者を対応するフィールドで区別する

### Requirement: Feedに形式ごとの日時を反映する
Atomは各記事の`published`と`updated`を出す（MUST）。JSON Feedは`date_published`と`date_modified`を出す（MUST）。RSS 2.0は`pubDate`に公開日時を出し、独自の更新日時拡張を追加しない（MUST）。

#### Scenario: 更新済み記事を配信する
- **WHEN** 記事の更新日時が公開日時と異なる
- **THEN** AtomとJSON Feedはそれぞれの標準項目で両日時を区別する
- **THEN** RSS 2.0の`pubDate`は公開日時を表す

### Requirement: Feed全体の更新日時を記事から決定する
記事を含むFeedは全体の更新日時に配信対象記事の`updated`の最大値を使用する（MUST）。システムは同じ記事入力の再生成だけで全体の更新日時を進めない（MUST）。

#### Scenario: 内容を変えずに再生成する
- **WHEN** 同じ配信対象記事から別の時刻にFeedを再生成する
- **THEN** AtomのFeed全体の`updated`とRSSの`lastBuildDate`は同じ値を維持する

### Requirement: standard.siteへ両日時を同期する
同期処理は`site.standard.document`の`publishedAt`に公開日時を出す（MUST）。同期処理は`updatedAt`に更新日時を出す（MUST）。同期処理は日時の追加を理由に本文HTML生成やブラウザ描画を実行しない（MUST）。

#### Scenario: 記事のレコードを生成する
- **WHEN** 有効な両日時を持つ記事を同期する
- **THEN** レコードは対応する`publishedAt`と`updatedAt`を含む
- **THEN** 同期は既存の軽量な概要抽出経路を維持する
