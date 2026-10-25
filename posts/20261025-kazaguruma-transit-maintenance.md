---
title: "風ぐるま乗換案内 v1.5.7 v1.5.8 緊急メンテ"
published: "2026-10-25T20:15:24+09:00"
updated: "2026-10-25T20:15:24+09:00"
---
- categories:
	- [🗄️アーカイブ](categories-archives.md)
- tags:
	- [🏷️人生](tags-life.md)
- topics:
	- [風ぐるま乗換案内をつくった](20250428-kazaguruma-transit.md)

---

<p><img class="u-featured" src="https://img.nawashiro.dev/attachments/20260212-Hitachi_Jidosha_Kotsu_1555_Kazaguruma_Poncho_HX.webp" alt="千代田区地域福祉交通「風ぐるま」"/></p>

画像: <a href="https://commons.wikimedia.org/wiki/File:Hitachi_Jidosha_Kotsu_1555_Kazaguruma_Poncho_HX.jpg">Comyu</a>, <a href="https://creativecommons.org/licenses/by-sa/4.0">CC BY-SA 4.0</a>, via Wikimedia Commons

## TOC

## お知らせ

<p class="e-bridgy-mastodon-content e-bridgy-bluesky-content p-summary">昨今の激ヤバ状勢を鑑みて緊急メンテを実施したよ。ついでに運用面の改善をしたよ。</p>

## やばめの修正が 2 パッケージあったよ

### Next.js

[Server Actionsを使用したApp Routerにおけるサービス拒否](https://github.com/vercel/next.js/security/advisories/GHSA-p3m5-59mp-jv5r) `GHSA-p3m5-59mp-jv5r`

#### 該当バージョン

- `13.0.0 =< Next.js <= 15.5.27`
- `16.0.0 =< Next.js <= 16.4.0`

#### 説明

- **だれに**: Next.js の App Router に、
- **どうすると**: 悪意のあるリクエストをすると、
- **どうなる**: 過剰に CPU をぶん回して、次のリクエストの処理をブロックできるんだって。 

#### 修正方法

Next.js バージョンを `15.5.28` か `16.4.1` にアプデしてね。

### sharp

[SVGファイルを使用した場合の画像最適化APIにおける認証されていないリモートコード実行](https://github.com/vercel/next.js/security/advisories/GHSA-2464-fhr4-w9xw) `GHSA-2464-fhr4-w9xw`

#### 該当バージョン

- `10.0.0 =< sharp <= 15.5.27`
- `16.0.0 < sharp <= 16.4.0`

#### 説明

- **だれに**: glibc ベースの Linux 上で動いている sharp に、
- **どうすると**: 悪意のある SVG 画像を使うと、
- **どうなる**: リモートコード実行ができるんだって。

#### 修正方法

親ライブラリの Next.js をアプデしてね。sharp バージョンが `0.35.5` 以上なことを確認してね。

## 技術情報

リリースノートからの抜粋です。

### [v1.5.7](https://github.com/nawashiro/kazaguruma-transit/releases/tag/v1.5.8) - 脆弱性対応

**必ず、絶対に。** 使っている Node.js とかは最新版を取り込んでね。ビルド時に `--pull --no-cache` を指定すればいいよ。

依存の脆弱性対応と、SQLite の交通キャッシュを扱う Prisma 7 への移行を含みます。

- Next.js 15.5.28、sharp 0.35.5、Axios 1.20.0、Puppeteer 25.16.0 へ更新しました。
- 警告が残っていた 10 パッケージを互換範囲で更新しました。
- GTFS 4.20.1 へ更新し、csv-parse 7.0.2 の修正を取り込みました。
- Prisma と SQLite アダプターを 7.10.1 へ更新しました。CLI とアプリは同じ設定済み DB を使います。
- 起動時の schema 作成は DB ファイルがない場合だけ実行します。

DB は再生成するキャッシュとして扱います。旧 DB のデータ移行は行いません。再生成する場合は [交通キャッシュの再生成手順](https://github.com/nawashiro/kazaguruma-transit/blob/v1.5.7/docs/how-to/rebuild-transit-cache.md) に従ってください。

npm audit は全依存・開発依存を除く両方で moderate 2 件です。high・critical は 0 件です。Google Maps 配下の decode-uri-component と query-string は、修正版への置換で互換性の不一致が発生したため保留しました。

### [v1.5.8](https://github.com/nawashiro/kazaguruma-transit/releases/tag/v1.5.7) - 交通 DB 再生成

交通 DB を起動のたびに GTFS から再生成するよう変更しました。

- `npm run dev` と `npm start` は、設定先の SQLite DB を破棄し、スキーマ作成・GTFS 取込・検証を終えてから配信を始めます。
- 同じ DB にある API レート制限カウンターも再起動時にリセットします。
- 取込や検証に失敗した場合は起動を中止します。旧 DB での配信には切り替えません。
- `npm run build` は交通 DB を作成・変更せず、GTFS も取得しません。
- `npm run import-gtfs` で、配信せずにキャッシュを再生成できます。

時刻表の更新はアプリを停止してから再起動すると反映されます。手動で DB を削除する必要はありません。URL で指定した GTFS は起動ごとに取得するため、起動には取得元への接続が必要です。

設定と運用については [交通キャッシュの再生成手順](https://github.com/nawashiro/kazaguruma-transit/blob/v1.5.8/docs/how-to/rebuild-transit-cache.md) をご覧ください。
