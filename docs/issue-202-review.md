# Issue #202 Code Review

## 対象
- Issue: https://github.com/nawashiro/nawashiro.github.io/issues/202
- 計画: `issue-202-plan.md`
- レビュー対象範囲: `components/`, `lib/`, `pages/`, `next.config.js`, `package.json`

## 所感（第三者視点）
- Issue #201 で挙がっていた XSS / RSS 非同期 / `output` / OG 画像などの主要ポイントは、現状コード上では概ね対策済みで大きな後退は見当たりません。
- 一方で、運用や閲覧体験に影響する中小の欠陥が残っており、今のうちに潰しておくと品質が上がるタイプの問題が散見されます。

## 指摘事項（重要度順）

### Medium
- OG 画像抽出の正規表現が画像タイトルや括弧を含む URL に弱く、`og:image` に不正な URL が入る可能性がある。`getPostData()` の `imageMatch` が `![alt](/img.png "title")` のような書式を拾うと `"title"` が混ざり、`resolveOgImageUrl()` が失敗して無効な `og:image` になる。`lib/posts.ts:165`
  - 影響: OG 画像が無効になり、SNS 共有時に画像が表示されない。
  - 対策案: Markdown AST から最初の image を抽出するか、タイトル部分を除外する正規表現に変更する。

- RSS フィード本文の HTML 内リンク/画像が相対 URL のまま出力される可能性がある。`generateRssFeed()` は `postData.contentHtml` をそのまま `content` に入れており、`/images/...` のような相対パスはフィードリーダーで解決できない。`lib/posts.ts:214`
  - 影響: フィードリーダー上で画像や内部リンクが切れる。
  - 対策案: RSS 生成時に相対 URL を `NEXT_PUBLIC_SITE_URL` で絶対化する処理を追加する。

### Low
- インデックスページの `link[rel=pgpkey]` が `<Head>` 外に置かれており、HTML としては不正配置になる。`pages/index.tsx:43`
  - 影響: ブラウザやクローラが PGP キーを検出できない可能性。
  - 対策案: `<Head>` 内に移動する。

- ネットワークグラフで存在しない記事へのリンクもエッジとして追加されるため、グラフ上にラベルのないノードが出たり、ダブルクリックで 404 が開く可能性がある。`lib/posts.ts:84`
  - 影響: ナビゲーション体験の低下、誤リンクの可視化が不十分。
  - 対策案: `postsMap` に存在する ID のみエッジ化する。

## 補足
- Issue #201 の主要修正項目（WebMention の安全なレンダリング、RSS 生成の await、`output` スクリプト、OG URL 正規化、network_graph の destroy）は現行コードでは満たされていると判断しました。
