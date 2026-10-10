# static-twemoji-rendering Specification

## Purpose

Provide consistent Twemoji presentation in the site's exported HTML so visitors see the intended emoji images without waiting for client-side JavaScript to replace characters.

## Requirements

### Requirement: Twemoji is present in initial HTML
The site SHALL include Twemoji image elements for eligible emoji in the exported HTML of article content and other page content currently presented with Twemoji, without requiring a client-side emoji substitution.

#### Scenario: Article with emoji
- **WHEN** an article containing emoji is exported
- **THEN** its initial HTML contains Twemoji images for eligible emoji before client-side JavaScript executes

#### Scenario: Other page with emoji
- **WHEN** a non-article page containing eligible emoji is exported
- **THEN** its initial HTML contains the corresponding Twemoji images before client-side JavaScript executes

### Requirement: Text contexts remain intact
The site SHALL preserve emoji as literal characters where they are part of code examples or other non-presentational text contexts, and SHALL not alter HTML attributes, scripts, or styles while rendering Twemoji.

#### Scenario: Literal code example
- **WHEN** a code example includes an emoji character
- **THEN** the exported code example retains that character rather than an image element

### Requirement: External images with text fallback
The site SHALL continue to reference externally delivered Twemoji images, and each generated image SHALL retain the represented emoji as alternative text.

#### Scenario: Image unavailable
- **WHEN** the external Twemoji image cannot load
- **THEN** the generated markup still contains the represented emoji as alternative text

### Requirement: FeedはUnicode絵文字を保持する
RSS・Atom・JSON Feedは本文と概要に含む絵文字をUnicodeのまま出力する（MUST）。Feed生成は絵文字をTwemoji画像へ変換しない（MUST）。システムはサイト表示の初期HTMLに対する既存のTwemoji画像化を維持する（MUST）。

#### Scenario: 同じ記事をページとFeedへ出す
- **WHEN** 記事本文が表示用の絵文字`😂`を含む
- **THEN** 記事ページの初期HTMLは対応するTwemoji画像を含む
- **THEN** 全Feedの本文は`😂`を文字として含む
- **THEN** Feedはその絵文字に対応するTwemoji画像を含まない

#### Scenario: 明示概要に絵文字がある
- **WHEN** 記事の空でない`p-summary`が絵文字を含む
- **THEN** 各Feedの概要はその絵文字を文字として保持する
- **THEN** Feedは既存の概要選択と空白正規化を維持する

#### Scenario: 本文抜粋に絵文字がある
- **WHEN** 有効な`p-summary`がない記事の本文先頭に絵文字がある
- **THEN** Feedの概要は画像化前の本文から抜粋する
- **THEN** 抜粋は既存のタグ除去と200文字制限を維持する
- **THEN** 制限内の絵文字は文字として残る

#### Scenario: 著者が本文に画像を指定する
- **WHEN** 記事本文が著者指定の画像やコード内の絵文字を含む
- **THEN** Feedは著者指定の画像を除去しない
- **THEN** Feedはコード内の絵文字を文字として保持する
