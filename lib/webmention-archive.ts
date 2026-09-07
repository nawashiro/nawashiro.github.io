import fs from "node:fs";
import path from "node:path";
import {
  emptyWebMentionArchive,
  parseWebMentionArchive,
  serializeWebMentionArchive,
  type WebMentionArchive,
} from "./webmentions";

export const WEBMENTION_ARCHIVE_PATH = path.join(
  process.cwd(),
  "lib/data/webmentions.json",
);

export const readWebMentionArchive = (
  filePath = WEBMENTION_ARCHIVE_PATH,
): WebMentionArchive => {
  if (!fs.existsSync(filePath)) {
    return emptyWebMentionArchive();
  }

  return parseWebMentionArchive(
    JSON.parse(fs.readFileSync(filePath, "utf8")) as unknown,
  );
};

export const writeWebMentionArchiveIfChanged = (
  archive: WebMentionArchive,
  filePath = WEBMENTION_ARCHIVE_PATH,
): boolean => {
  const serialized = serializeWebMentionArchive(archive);
  const current = fs.existsSync(filePath)
    ? fs.readFileSync(filePath, "utf8")
    : "";

  if (current === serialized) return false;

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.tmp-${process.pid}`;
  fs.writeFileSync(temporaryPath, serialized, "utf8");
  fs.renameSync(temporaryPath, filePath);
  return true;
};
