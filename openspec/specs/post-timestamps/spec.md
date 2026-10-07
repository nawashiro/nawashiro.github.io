# post-timestamps Specification

## Purpose

記事の正本は公開日時と更新日時を明示する。サイトと外部配信は同じ正本から日時を出力する。この仕様は、旧フィールドや生成時刻による暗黙の補完を除去し、日時の意味を出力先の制約から分離する。

## Requirements

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

### Requirement: 記事一覧を更新日時順にする
システムは記事一覧、カテゴリ一覧、RSS・Atom・JSON Feedの記事順と配信対象の選択を`updated`の新しい順で決定する（MUST）。更新日時が同じ瞬間の場合は`published`の新しい順にする（MUST）。日時はタイムゾーンを含む瞬間として比較する（MUST）。Feedはこの順序の先頭50件を配信する（MUST）。

#### Scenario: 古い記事を更新する
- **WHEN** 古い記事の`updated`だけが新しい記事より新しくなる
- **THEN** システムは古い記事を新しい記事より前に並べる
- **THEN** 記事の公開日時の値は変更しない

#### Scenario: 更新日時が同じである
- **WHEN** ふたつの記事の`updated`が同じ瞬間であり、`published`が異なる
- **THEN** システムは公開日時が新しい記事を先に並べる

#### Scenario: タイムゾーン表記が異なる
- **WHEN** 記事Aの`updated`が`2026-01-02T00:00:00+09:00`で、記事Bの`updated`が`2026-01-01T20:00:00Z`である
- **THEN** システムは更新の瞬間が新しい記事Bを記事Aより前に並べる

#### Scenario: 記事一覧とカテゴリ一覧を表示する
- **WHEN** 記事一覧とカテゴリ一覧を生成する
- **THEN** 両一覧はそれぞれの対象記事を更新日時降順、同じ更新日時では公開日時降順で表示する

#### Scenario: Feedの配信対象外だった古い記事を更新する
- **WHEN** 記事が51件以上あり、従来の公開日時順では上位50件に入らない記事の`updated`を全記事中で最も新しくする
- **THEN** RSS・Atom・JSON Feedはその記事を先頭に含む同じ50件を同じ順序で配信する
- **THEN** 更新順で51番目以降の記事はFeedに含まれない

#### Scenario: 日時を変えずに記事を修正する
- **WHEN** 記事本文だけを修正し、`updated`と`published`を変更しない
- **THEN** その修正を理由に記事順やFeedの配信対象は変わらない

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
