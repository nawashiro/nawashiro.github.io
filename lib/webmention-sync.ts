import {
  readWebMentionArchive,
  WEBMENTION_ARCHIVE_PATH,
  writeWebMentionArchiveIfChanged,
} from "./webmention-archive";
import {
  isWebMentionEntry,
  mergeWebMentionEntries,
  type WebMentionEntry,
  type WebMentionArchive,
} from "./webmentions";

export const WEBMENTION_API_ENDPOINT =
  "https://webmention.io/api/mentions.jf2";

type WebMentionApiResponse = {
  children?: unknown[];
};

export type FetchWebMentionsOptions = {
  domain: string;
  token: string;
  perPage?: number;
  endpoint?: string;
  fetchImpl?: typeof fetch;
};

export const fetchAllWebMentions = async ({
  domain,
  token,
  perPage = 100,
  endpoint = WEBMENTION_API_ENDPOINT,
  fetchImpl = globalThis.fetch,
}: FetchWebMentionsOptions): Promise<WebMentionEntry[]> => {
  if (!fetchImpl) {
    throw new Error("Fetch is not available in this environment");
  }
  if (!domain) throw new Error("Webmention domain is required");
  if (!token) throw new Error("Webmention API token is required");
  if (!Number.isInteger(perPage) || perPage < 1) {
    throw new Error("Webmention page size must be a positive integer");
  }

  const entries: WebMentionEntry[] = [];
  let page = 0;

  while (true) {
    const apiUrl = new URL(endpoint);
    apiUrl.searchParams.set("domain", domain);
    apiUrl.searchParams.set("token", token);
    apiUrl.searchParams.set("per-page", String(perPage));
    apiUrl.searchParams.set("page", String(page));
    apiUrl.searchParams.set("sort-by", "created");
    apiUrl.searchParams.set("sort-dir", "up");

    const response = await fetchImpl(apiUrl.toString());
    if (!response.ok) {
      throw new Error(`Webmention API request failed: ${response.status}`);
    }

    const data = (await response.json()) as WebMentionApiResponse;
    if (!data || !Array.isArray(data.children)) {
      throw new Error(`Invalid Webmention API response on page ${page}`);
    }

    data.children.forEach((entry, index) => {
      if (!isWebMentionEntry(entry)) {
        throw new Error(
          `Invalid Webmention entry on page ${page}, index ${index}`,
        );
      }
      entries.push(entry);
    });

    if (data.children.length < perPage) break;
    page += 1;
  }

  return mergeWebMentionEntries([], entries);
};

export type SynchronizeWebMentionsOptions = FetchWebMentionsOptions & {
  archivePath?: string;
};

export type SynchronizeWebMentionsResult = {
  archive: WebMentionArchive;
  changed: boolean;
};

export const synchronizeWebMentionArchive = async ({
  archivePath = WEBMENTION_ARCHIVE_PATH,
  ...fetchOptions
}: SynchronizeWebMentionsOptions): Promise<SynchronizeWebMentionsResult> => {
  const current = readWebMentionArchive(archivePath);
  const incoming = await fetchAllWebMentions(fetchOptions);
  const archive: WebMentionArchive = {
    version: 1,
    mentions: mergeWebMentionEntries(current.mentions, incoming),
  };
  const changed = writeWebMentionArchiveIfChanged(archive, archivePath);

  return { archive, changed };
};
