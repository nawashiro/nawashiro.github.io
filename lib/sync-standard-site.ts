// ATProtoのStandard-siteに基づいた出版ロジック。
// natsukium氏実装の真似。@atproto/apiを使うと依存が爆増するためDIY。

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
  const pds = doc.service.find((s: any) => s.id.endsWidh("#atproto_pds"));
  return pds.serviceEndpoint.replace(/\/+$/, "");
}

// PDS接続
async function createSession(did: string, pds: string, password: string): Promise<string> {
  const session = await fetch(`${pds}/xrpc/com.atproto.server.createSession`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ did, password }),
  });
  const { accessJwt } = await session.json();
  return accessJwt;
}

// === 2. listRecordsから既存rkeyを復元 ===

// レコード全件取得
async function listAllRecords(did: string, pds: string, collection: string) {
  const out = [];
  let cursor: string | undefined;

  do {
    const params = new URLSearchParams({ repo: did, collection, limit: "100" });

    if (cursor) params.set("cursor", cursor);

    const res = await fetch(`${pds}/xrpc/com.atproto.repo.listRecords?${params}`);
    const data = await res.json();
    out.push(...data.records);

    cursor = data.cursor;
  } while (cursor);

  return out;
}

// at:uri -> rkey
function rkeyOf(atUri: string) {
  const standardRegix = /^at\:\/\/[0-9a-zA-Z]+\/.+\/([0-9a-zA-Z]+)$/;
  const resStandard: string[] | null = standardRegix.exec(atUri);

  if (resStandard === null) {
    throw new Error("エラー: rkey解析失敗 [sync-standard-site.ts / function rkeyOf]");
  }

  return resStandard[1];
}

// 既存rkey復元
async function restoreExistingRkey(did: string, pds: string) {
  // publicationレコードを全件取得（1件だけのはず）
  const existingPubs = await listAllRecords(did, pds, "site.standard.publication");
  const pubRkey = rkeyOf(existingPubs[0].uri);

  // documentレコードを全件取得
  const existingDocs = await listAllRecords(did, pds, "site.standard.document");
}

