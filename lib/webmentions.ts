export type WebMentionAuthor = {
  name?: string;
  photo?: string;
  url?: string;
  [key: string]: unknown;
};

export type WebMentionContent = {
  text?: string;
  html?: string;
  [key: string]: unknown;
};

export type WebMentionEntry = {
  "wm-id": number | string;
  "wm-property"?: string;
  "wm-source"?: string;
  "wm-target"?: string;
  url?: string;
  author?: WebMentionAuthor;
  content?: WebMentionContent;
  rsvp?: string;
  [key: string]: unknown;
};

export type WebMentionArchive = {
  version: 1;
  mentions: WebMentionEntry[];
};

export type WebMentionSortBy = "published" | "updated" | "received";
export type WebMentionSortDir = "up" | "down";

export const emptyWebMentionArchive = (): WebMentionArchive => ({
  version: 1,
  mentions: [],
});

export const isWebMentionEntry = (
  value: unknown,
): value is WebMentionEntry => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const id = (value as Record<string, unknown>)["wm-id"];
  return (
    (typeof id === "number" && Number.isFinite(id)) ||
    (typeof id === "string" && id.trim().length > 0)
  );
};

const webMentionId = (mention: WebMentionEntry) => String(mention["wm-id"]);

const compareWebMentionIds = (left: string, right: string) => {
  const leftNumber = Number(left);
  const rightNumber = Number(right);

  if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) {
    return leftNumber - rightNumber;
  }

  return left.localeCompare(right);
};

export const normalizeWebMentionEntries = (
  entries: WebMentionEntry[],
): WebMentionEntry[] => {
  const byId = new Map<string, WebMentionEntry>();

  entries.forEach((entry, index) => {
    if (!isWebMentionEntry(entry)) {
      throw new Error(`Invalid Webmention entry at index ${index}`);
    }
    byId.set(webMentionId(entry), entry);
  });

  return [...byId.entries()]
    .sort(([left], [right]) => compareWebMentionIds(left, right))
    .map(([, entry]) => entry);
};

export const mergeWebMentionEntries = (
  existing: WebMentionEntry[],
  incoming: WebMentionEntry[],
): WebMentionEntry[] => normalizeWebMentionEntries([...existing, ...incoming]);

const sortObjectKeys = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sortObjectKeys);
  }

  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        result[key] = sortObjectKeys(
          (value as Record<string, unknown>)[key],
        );
        return result;
      }, {});
  }

  return value;
};

export const parseWebMentionArchive = (value: unknown): WebMentionArchive => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Webmention archive must be an object");
  }

  const archive = value as Record<string, unknown>;
  if (archive.version !== 1) {
    throw new Error("Unsupported Webmention archive version");
  }
  if (!Array.isArray(archive.mentions)) {
    throw new Error("Webmention archive mentions must be an array");
  }

  const mentions = archive.mentions.map((entry, index) => {
    if (!isWebMentionEntry(entry)) {
      throw new Error(`Invalid Webmention archive entry at index ${index}`);
    }
    return entry;
  });

  return {
    version: 1,
    mentions: normalizeWebMentionEntries(mentions),
  };
};

export const serializeWebMentionArchive = (
  archive: WebMentionArchive,
): string => {
  const normalized = parseWebMentionArchive(archive);
  const stableArchive = sortObjectKeys(normalized) as WebMentionArchive;
  return `${JSON.stringify(stableArchive, null, 2)}\n`;
};

export const canonicalizeWebMentionTarget = (
  value?: string,
): string | null => {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    const pathname = url.pathname.replace(/\/+$/, "") || "/";
    const host = url.host.toLowerCase();
    return `https://${host}${pathname}${url.search}`;
  } catch {
    return null;
  }
};

export const filterWebMentionsForTargets = (
  mentions: WebMentionEntry[],
  targets: string[],
): WebMentionEntry[] => {
  const canonicalTargets = new Set(
    targets
      .map(canonicalizeWebMentionTarget)
      .filter((target): target is string => target !== null),
  );

  return normalizeWebMentionEntries(mentions).filter((mention) => {
    const target = canonicalizeWebMentionTarget(mention["wm-target"]);
    return target !== null && canonicalTargets.has(target);
  });
};

const getMentionDate = (
  mention: WebMentionEntry,
  sortBy: WebMentionSortBy,
): number | null => {
  const primaryField =
    sortBy === "received"
      ? "wm-received"
      : sortBy === "published"
        ? "published"
        : "updated";
  const fallback = mention[primaryField] || mention["wm-received"];
  if (typeof fallback !== "string") return null;

  const timestamp = Date.parse(fallback);
  return Number.isNaN(timestamp) ? null : timestamp;
};

const compareMentionDates = (left: number | null, right: number | null) => {
  if (left === null && right === null) return 0;
  if (left === null) return 1;
  if (right === null) return -1;
  return left - right;
};

export const sortWebMentionsForDisplay = (
  mentions: WebMentionEntry[],
  sortBy: WebMentionSortBy = "published",
  sortDir: WebMentionSortDir = "up",
): WebMentionEntry[] => {
  const normalized = normalizeWebMentionEntries(mentions);

  return normalized.sort((left, right) => {
    const dateComparison = compareMentionDates(
      getMentionDate(left, sortBy),
      getMentionDate(right, sortBy),
    );

    if (dateComparison !== 0) {
      return sortDir === "down" ? -dateComparison : dateComparison;
    }

    return compareWebMentionIds(webMentionId(left), webMentionId(right));
  });
};

export const safeWebmentionUrl = (value?: string): string | null => {
  if (!value) return null;

  try {
    const parsed = new URL(value);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return value;
    }
  } catch {
    return null;
  }

  return null;
};
