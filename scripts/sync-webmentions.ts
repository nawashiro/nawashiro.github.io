import { synchronizeWebMentionArchive } from "../lib/webmention-sync";

const domain = process.env.WEBMENTION_DOMAIN ?? "nawashiro.dev";
const token = process.env.WEBMENTION_IO_TOKEN;

const syncWebMentions = async () => {
  if (!token) {
    throw new Error("WEBMENTION_IO_TOKEN is required to sync Webmentions");
  }

  const { archive, changed } = await synchronizeWebMentionArchive({
    domain,
    token,
  });

  console.log(
    changed
      ? `Webmention archive updated: ${archive.mentions.length} entries`
      : `Webmention archive unchanged: ${archive.mentions.length} entries`,
  );
};

void syncWebMentions().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "Webmention sync failed",
  );
  process.exitCode = 1;
});
