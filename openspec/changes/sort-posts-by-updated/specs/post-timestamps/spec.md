# Spec Delta

## RENAMED Requirements

- FROM: `### Requirement: 記事一覧を公開日時順にする`
- TO: `### Requirement: 記事一覧を更新日時順にする`

## MODIFIED Requirements

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
