// ATProtoのStandard-siteに基づいた出版ロジック。
// natsukium氏実装の真似。@atproto/apiを使うと依存が爆増するためDIY。

import { readdirSync, readFileSync, writeFileSync } from "fs";
import matter from "gray-matter";
const MAPPING_PATH = "lib/data/standard-site.json";

// === 1. PDSとの接続・認証 ===

// DID解決。
async function resolveDid(identifier: string): Promise<string> {
  if (identifier.startsWith("did:")) return identifier;
  const res = await fetch(
    `https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${identifier}`
  );
  return (await res.json()).did;
}

// PDS解決
async function resolvePds(did: string): Promise<string> {
  const res = await fetch(`https://plc.directory/${did}`);
  const doc = await res.json();
  const pds = doc.service.find((s: any) => s.id.endsWith("#atproto_pds"));
  return pds.serviceEndpoint.replace(/\/+$/, "");
}

// PDS接続
async function createSession(identifier: string, pds: string, password: string): Promise<string> {
  const session = await fetch(`${pds}/xrpc/com.atproto.server.createSession`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  const { accessJwt } = await session.json();
  return accessJwt;
}

// === 2. listRecordsから既存rkeyを復元 ===

// リスト用レコード型定義。
// https://github.com/bluesky-social/atproto/blob/main/lexicons/com/atproto/repo/listRecords.json 43-45, 55-57 を参照のこと。
// cidは使わない。
// Recordの中身はすべてstringとobjectの対応。
type ListedRecord = { uri: string; value: Record<string, unknown> }

// 2の期待する返却値。
type Mapping = {
  did: string;
  publicationRkey: string | null;
  documents: Record<string, string>;
}

// レコード全件取得
async function listAllRecords(did: string, pds: string, collection: string): Promise<ListedRecord[]> {
  const records = [];
  let cursor: string | undefined;

  do {
    const params = new URLSearchParams({ repo: did, collection, limit: "100" });

    if (cursor) params.set("cursor", cursor);

    const res = await fetch(`${pds}/xrpc/com.atproto.repo.listRecords?${params}`);

    if (!res.ok) throw new Error("ERROR: listAllRecords失敗 [lib/sync-standard-site.ts | function listAllRecords]");

    const data = await res.json();
    records.push(...data.records);

    cursor = data.cursor;
  } while (cursor);

  return records;
}

// at:uri -> rkey
function rkeyOf(uri: string) {
  return uri.split("/").pop()!;
}

// 既存rkey復元
async function restoreExistingRkey(did: string, pds: string): Promise<Mapping> {
  // publicationレコードを全件取得（1件だけのはず）
  const existingPubs = await listAllRecords(did, pds, "site.standard.publication");
  const pubRkey = existingPubs[0]?.uri ? rkeyOf(existingPubs[0].uri) : null;

  // documentレコードを全件取得
  const existingDocs = await listAllRecords(did, pds, "site.standard.document");
  const pathToRkey: Record<string, string> = {};

  for (const { uri, value } of existingDocs) {
    if (typeof value.path === "string") {
      pathToRkey[value.path] = rkeyOf(uri);
    }
  }

  const mapping: Mapping = {
    did,
    publicationRkey: pubRkey,
    documents: pathToRkey,
  };

  return mapping;
}

// === 3. 差分比較と冪等な書き込み ===

// レコード取得
async function getRecord(did: string, pds: string, collection: string, rkey: string): Promise<Record<string, unknown> | null> {
  const params = new URLSearchParams({ repo: did, collection, rkey });
  const res = await fetch(`${pds}/xrpc/com.atproto.repo.getRecord?${params}`);

  if (res.status === 400) return null;

  if (!res.ok) throw new Error(`ERROR: getRecord失敗 ${res.status} [lib/sync-standard-site.ts | function getRecord]`);

  const data = await res.json();
  return data.value;
}

// JSON文字列正規化（natsukium氏実装そのまま）
function canonical(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonical).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value as Record<string, string>)
      .toSorted()
      .map((k) => `${JSON.stringify(k)}:${canonical((value as Record<string, string>)[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

// 変更がない記事はレコードに書き込まない。
async function upsert(did: string, pds: string, collection: string, rkey: string, jwt: string, record: Record<string, unknown>) {
  const existing = await getRecord(did, pds, collection, rkey);

  if (existing && canonical(existing) === canonical(record)) {
    return false; // 変更なし（なにもしない）
  }

  // 変更あり（putRecord）
  await fetch(`${pds}/xrpc/com.atproto.repo.putRecord`, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
    body: JSON.stringify({ repo: did, collection, rkey, record })
  })

  return true;
}

// === 4. メインループ ===

// 永続化
function saveMapping(mapping: Mapping) {
  writeFileSync(MAPPING_PATH, JSON.stringify(mapping, null, 2) + "\n");
}

// メインループ
async function main() {
  const publicationCollection = "site.standard.publication";
  const documentCollection = "site.standard.document";

  // 環境変数から認証情報取得
  const identifier = process.env.ATP_IDENTIFIER;
  const password = process.env.ATP_APP_PASSWORD;
  if (!identifier || !password) {
    console.error("ATP_IDENTIFIERとATP_APP_PASSWORDを設定してください");
    process.exit(1);
  }

  // 1. 接続
  const did = await resolveDid(identifier);
  const pds = await resolvePds(did);
  const jwt = await createSession(identifier, pds, password);

  // 2. 既存rkey復元
  const mapping = await restoreExistingRkey(did, pds);

  // 3. publicationをupsert
  const publicationRecord = {
    $type: "site.standard.publication",
    name: "Nawashiro",
    url: "https://nawashiro.dev",
    description: "Nawashiroの個人サイト",
  };

  if (mapping.publicationRkey) {
    // 既存→差分があれば更新
    await upsert(did, pds, publicationCollection, mapping.publicationRkey, jwt, publicationRecord);
  } else {
    // 新規→createRecord
    // 関数に切り出そうと思えばできそうだけど、永続化と場所が離れると忘れそうで怖い。なので毎回書く。
    const created = await fetch(`${pds}/xrpc/com.atproto.repo.createRecord`, {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
      body: JSON.stringify({ repo: did, collection: publicationCollection, record: publicationRecord }),
    });
    if (!created.ok) throw new Error(`ERROR: createRecord失敗 ${created.status} [lib/sync-standard-site.ts | function main]`)
    const data = await created.json();
    mapping.publicationRkey = rkeyOf(data.uri);
    saveMapping(mapping); // === 即座に永続化する！！！ ===
  }
  const publicationUri = `at://${did}/${publicationCollection}/${mapping.publicationRkey}`;

  // 4. 全記事を走査
  const published = new Set<string>();
  const postFiles = readdirSync("posts").filter(f => f.endsWith(".md"));

  for (const file of postFiles) {
    const slug = file.replace(/\.md$/, "");

    // frontmatterパース
    const raw = readFileSync(`posts/${file}`, "utf8");
    const fm = matter(raw).data; // { title, date, description?, tags? }

    published.add(slug);

    const documentRecord = {
      $type: documentCollection,
      site: publicationUri,
      title: fm.title,
      path: `/posts/${slug}`,
      publishedAt: new Date(fm.date).toISOString(),
      ...(fm.description ? { description: fm.description } : {}),
      ...(fm.tags?.length ? { tags: fm.tags } : {}),
    }

    const existingRkey = mapping.documents[`/posts/${slug}`];

    if (existingRkey) {
      // 既存→差分があれば更新
      await upsert(did, pds, documentCollection, existingRkey, jwt, documentRecord);
    } else {
      // 新規→createRecord
      // 関数に切り出そうと思えば（略）
      const created = await fetch(`${pds}/xrpc/com.atproto.repo.createRecord`, {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
        body: JSON.stringify({ repo: did, collection: documentCollection, record: documentRecord }),
      });
      if (!created.ok) throw new Error(`ERROR: createdRecord失敗 ${created.status} [lib/sync-standard-site.ts | function main]`)
      const data = await created.json();
      mapping.documents[`/posts/${slug}`] = rkeyOf(data.uri);
      saveMapping(mapping); // === 即座に永続化する！！！ ===
    }
  }

  // 5. 消えた記事のレコードを削除
  for (const path of Object.keys(mapping.documents)) {
    if (!published.has(path.replace("/posts/", ""))) {
      const deleted = await fetch(`${pds}/xrpc/com.atproto.repo.deleteRecord`, {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
        body: JSON.stringify({ repo: did, collection: documentCollection, rkey: mapping.documents[path] }),
      });
      if (!deleted.ok) throw new Error(`ERROR: deleteRecord失敗 ${deleted.status} [lib/sync-standard-site.ts | function main]`)
      delete mapping.documents[path];
      saveMapping(mapping);
    }
  }

  // 6. 最終保存
  saveMapping(mapping);
  console.log("standard.site sync complete");
}

main();
