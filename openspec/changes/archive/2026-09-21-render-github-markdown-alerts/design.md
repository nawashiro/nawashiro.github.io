## Context

記事ページは`lib/posts.ts`でMarkdownをHTMLへ変換し、`pages/posts/[id].tsx`がそのHTMLを静的記事へ挿入する。同じ記事HTMLはRSS、Atom、JSON Feedの生成にも使われる。

現在の変換順序には`remarkParse`、`remarkGfm`、`remarkRehype`がある。`remarkGfm`はGitHub Alertsを通常の引用として解析するため、`[!NOTE]`などのマーカーがHTMLに残る。サイトはDaisyUI5の`caramellatte`テーマを読み込み、`alert-soft`を利用できる。

`remark-prism`と`remark-flexible-code-titles`は既存機能として維持する。現在のローカル依存ツリーでは、`remark-prism`が要求する`jsdom`が不正な状態にある。

## Goals / Non-Goals

**Goals:**

- 標準の5種類のGitHub Alertを記事HTMLへ変換する。
- アラートのタイトルと本文をDOMのテキストとして出力する。
- DaisyUIの`alert`、種類別色、`alert-soft`を使う。
- 本文のMarkdown、GFM、複数段落、リンク、強調、コードを保持する。
- 通常の引用、未知のマーカー、コードフェンスを保持する。
- 既存のシンタックスハイライトとコードタイトルを維持する。
- 既存の`jsdom`依存を復旧し、変換処理を実行できる状態にする。

**Non-Goals:**

- GitHub Alerts用の外部パッケージを追加しない。
- `> **Note**`などの旧記法を新たに対応しない。
- `DANGER`などの未知の種類や独自タイトルを対応しない。
- Alert内のAlertの入れ子を新たな機能として対応しない。
- Octiconなどのアイコンを追加しない。
- `remark-prism`を別のシンタックスハイライトへ置き換えない。
- Markdown原稿の既存記法を書き換えない。

## Decisions

### 1. 変換はローカルのremarkプラグインで行う

`remarkGfm`の後、`remarkRehype`の前に、リポジトリ内の小さなremark変換を置く。既存の`remark-gfm`は構文解析を担い、ローカル変換は標準マーカーを持つblockquoteだけをAlertへ変える。外部パッケージを追加せず、サイトの表示契約をこのリポジトリで管理する。

変換対象はblockquoteの先頭に単独で存在する標準マーカーに限定する。認識したマーカーの段落を除去し、残りの子要素を本文として保持する。コードフェンス内の文字列はMarkdown解析時点でcodeノードになるため、blockquote変換の対象にならない。

### 2. 出力はDaisyUIのAlertとタイトル、本文で構成する

Alertのコンテナは`div`として出力し、`alert`、種類別の色、`alert-soft`をクラスへ付ける。タイトルは表示可能なDOM要素として先頭に追加し、本文の子要素はそのままMarkdownから変換する。CSSの疑似要素だけで種類名を表現しない。

種類とDaisyUIの色は次のように固定する。

| GitHub Alert | DaisyUI color |
|---|---|
| `NOTE` | `info` |
| `TIP` | `success` |
| `IMPORTANT` | `info` |
| `WARNING` | `warning` |
| `CAUTION` | `error` |

DaisyUIの`alert`クラスは表示だけに使い、静的な記事本文へ`role="alert"`を付けない。`role="alert"`はライブ通知として読み上げを発生させるため、今回の用途に適さない。

### 3. 既存のMarkdown変換と安全境界を保つ

ローカル変換はMarkdown ASTのノード属性を使ってHTML名とクラスを指定し、本文を生HTML文字列として組み立てない。既存の`remarkRehype`、`rehypeRaw`、`rehypeStringify`の順序を維持する。本文のリンクや強調は、既存のMarkdown変換へ任せる。

`remark-prism`は今回の対象外とする。`remark-flexible-code-titles`が生成する`.remark-code-container`とタイトルは維持し、既存のPrism用CSSも変更しない。

### 4. jsdomは依存の再インストールで復旧する

`package.json`と`package-lock.json`に記録された`remark-prism`の依存関係を正本とする。新しいシンタックスハイライトや直接依存は追加しない。`npm install`で既存の依存ツリーを復旧し、`npm ls jsdom`とMarkdown変換の実行で確認する。

依存復旧によってロックファイルの差分が必要になった場合は、`remark-prism`の要求範囲を保つ変更だけを許可する。無関係な依存更新は行わない。

### 5. CSSはDaisyUIへ委任し、記事内の余白だけ調整する

Alertの種類別色とSoft背景はDaisyUIへ委任する。記事の`.prose`がタイトルや本文の余白を過剰に広げる場合だけ、`.blog .alert`の子要素を対象に最小限の余白調整を追加する。通常のblockquote用CSSは変更しない。

## Risks / Trade-offs

- **本文の先頭に似た文字列がある** → マーカーがblockquoteの先頭段落に単独で存在する場合だけ変換し、通常の本文は保持する。
- **未知の種類を将来追加したくなる** → 今回は5種類の固定語彙だけを仕様化し、未知のマーカーは通常引用へ戻す。
- **DaisyUIに`IMPORTANT`専用色がない** → `info`へ割り当て、タイトル文字列で種類を区別する。
- **静的HTMLでアラートの装飾が使えないフィードリーダーがある** → タイトルと本文を通常のDOMテキストとして出力し、装飾なしでも読めるようにする。
- **`remark-prism`の古い依存が再び壊れる** → `npm install`、`npm ls jsdom`、型検査、テスト、ビルドを同じ変更の検証へ含める。
- **既存のPrism用CSSが新しい出力と合わない** → Prismの出力を変更せず、アラートのCSSだけを追加する。

## Migration Plan

1. Alertの入力と期待HTMLをテストへ追加し、現在の通常引用出力をREDとして確認する。
2. ローカル変換を追加し、5種類のタイトル、DaisyUIクラス、本文保持をGREENにする。
3. 既存の引用、未知のマーカー、コードフェンス、コードタイトル、Prism出力の回帰を確認する。
4. DaisyUIの表示を記事ページで確認し、必要な場合だけ記事内の余白を調整する。
5. `npm install`で`jsdom`を復旧し、`npm ls jsdom`、型検査、Lint、単体テスト、静的ビルドを実行する。
6. 既存記事と生成済みフィードを確認する。Markdown原稿やWebmention処理は変更しない。

ロールバック時は、MarkdownパイプラインからローカルAlert変換を外し、追加した記事CSSと回帰テストを変更単位で戻す。既存のPrismとコードタイトルの設定はそのまま残す。
