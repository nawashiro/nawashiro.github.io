import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./WebMention.module.css";

const REACTIONS = {
  "in-reply-to": "💬",
  "like-of": "❤️",
  "repost-of": "🔄",
  "bookmark-of": "⭐️",
  "mention-of": "💬",
  rsvp: "📅",
  "follow-of": "🐜",
};

const RSVP_ICONS = {
  yes: "✅",
  no: "❌",
  interested: "💡",
  maybe: "💭",
};

const ACTIONS = {
  "in-reply-to": "replied",
  "like-of": "liked",
  "repost-of": "reposted",
  "bookmark-of": "bookmarked",
  "mention-of": "mentioned",
  rsvp: "RSVPed",
  "follow-of": "followed",
};

type WebMentionAuthor = {
  name?: string;
  photo?: string;
};

type WebMentionContent = {
  text?: string;
};

type WebMentionEntry = {
  url: string;
  "wm-property": string;
  "wm-source"?: string;
  author?: WebMentionAuthor;
  content?: WebMentionContent;
  rsvp?: string;
};

type WebMentionResponse = {
  children?: WebMentionEntry[];
};

type WebMentionProps = {
  pageUrl?: string;
  addUrls?: string;
  id?: string;
  wordcount?: number;
  maxWebmentions?: number;
  preventSpoofing?: boolean;
  sortBy?: "published" | "updated" | "received";
  sortDir?: "up" | "down";
  commentsAreReactions?: boolean;
};

const truncateText = (text: string, limit?: number) => {
  if (!limit) return text;
  const words = text.replace(/\s+/g, " ").split(" ", limit + 1);
  if (words.length > limit) {
    words[limit - 1] += "…";
    return words.slice(0, limit).join(" ");
  }
  return text;
};

const getHostname = (url: string) => {
  const index = url.indexOf("//");
  return index === -1 ? url : url.slice(index);
};

const removeDuplicates = (mentions: WebMentionEntry[]) => {
  const seen = new Set<string>();
  return mentions.filter((mention) => {
    const url = getHostname(mention.url);
    if (seen.has(url)) return false;
    seen.add(url);
    return true;
  });
};

type RenderContext = {
  preventSpoofing: boolean;
  wordcount?: number;
};

export const safeWebmentionUrl = (value?: string) => {
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

const getSourceLabel = (url: string) => {
  try {
    return new URL(url).hostname || url;
  } catch {
    return url;
  }
};

const buildActionLabel = (
  mention: WebMentionEntry,
  context: RenderContext,
  isComment: boolean
) => {
  let action = ACTIONS[mention["wm-property"] as keyof typeof ACTIONS] ||
    "reacted";
  if (!isComment && mention.content?.text) {
    action += ": " + truncateText(mention.content.text, context.wordcount);
  }
  return action;
};

const renderMention = (
  mention: WebMentionEntry,
  context: RenderContext,
  isComment = false
) => {
  const authorLabel =
    mention.author?.name || getSourceLabel(mention.url) || mention.url;
  const action = buildActionLabel(mention, context, isComment);
  const reactionIcon =
    REACTIONS[mention["wm-property"] as keyof typeof REACTIONS] || "💥";
  const rsvpIcon =
    mention.rsvp && RSVP_ICONS[mention.rsvp as keyof typeof RSVP_ICONS]
      ? RSVP_ICONS[mention.rsvp as keyof typeof RSVP_ICONS]
      : null;
  const rawMentionUrl =
    mention[context.preventSpoofing ? "wm-source" : "url"] || mention.url;
  const mentionUrl = safeWebmentionUrl(rawMentionUrl) || "#";
  const photoUrl = safeWebmentionUrl(mention.author?.photo);

  return (
    <a
      className={styles.reaction}
      rel="nofollow ugc"
      title={`${authorLabel} ${action}`}
      href={mentionUrl}
    >
      <div className={styles.icon}>
        {photoUrl ? (
          <img
            src={photoUrl}
            loading="lazy"
            decoding="async"
            alt={authorLabel}
          />
        ) : (
          <img
            className={styles.missing}
            src="data:image/webp;base64,UklGRkoCAABXRUJQVlA4TD4CAAAvP8APAIV0WduUOLr/m/iqY6SokDJSMD5xYX23SQizRsVdZmIj/f6goYUbiOj/BED7MOPReuBNT3vBesSzIex+SeqMFFkjebFmzH3S7POxDSJ1yaCbCmMnS2R46cRMPyQLw4GBK4esdK60pYwsZakecUCl5zsHv/5cPH08nx9/7i6rEEVCg2hR8VSd30PxMZpVoJZQO6Dixgg6X5oKFCmlVHIDmmMFShWumAXgCuyqVN8hHff/k+9fj8+ei7BVjpxBmZCUJv+6DhWGZwWvs+UoLHFCKsPYpfJtIcEXBTopEEsKwedZUv4ku1FZErKULLyQwFGgnmTs2vBD5qu44xwnG9uyjgrFOd+KRVlXyQfwQlauydaU6AVI7OjKXLUEqNtxJBmQegNDZgV7lxxqYMOMrDyC1NdAGbdiH9Ij0skjG+oTyfO0lmjdgvoH8iIgreuBMRYLSH+R3sAztXgL+XfS7E2bmfo6gnS0TrpnzHT7kL+skj7PgHuBwv/zpN8LDLQg7zfJZLBubMKnyeh6ZGyfDEfc2LYpnlUtG7JqsSHq1WoASbUS4KVaLwB8be5mfsGMDwBcm5VxbuxWxx3nkFanB6lYqsqSkOGkKicoDvXsneR7BkKU7DtaEuT7+pxBGVwx+9gVyqf2pVA9sC2CsmjZ1RJqEJHS4Tj/pCcS0JoyBYOsB91Xjh3OFfQPQhvCAYyeLJlaOoFp0XNNuD0BC8exr8uPx7D1JWkwFdZIXmD3MOPReuDNzHjBesSzIbQD"
            alt={authorLabel}
          />
        )}
        {reactionIcon}
      </div>
      {rsvpIcon && <sub>{rsvpIcon}</sub>}
    </a>
  );
};

const WebMention = ({
  pageUrl,
  addUrls = "",
  id = "webmentions",
  wordcount,
  maxWebmentions = 30,
  preventSpoofing = false,
  sortBy = "published",
  sortDir = "up",
  commentsAreReactions = false,
}: WebMentionProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [comments, setComments] = useState<WebMentionEntry[]>([]);
  const [reactions, setReactions] = useState<WebMentionEntry[]>([]);
  const resolvedPageUrl =
    pageUrl ??
    (typeof window !== "undefined"
      ? window.location.href.replace(/#.*$/, "")
      : "");

  useEffect(() => {
    const loadWebMentions = async () => {
      const container = containerRef.current;
      if (!container || !resolvedPageUrl) return;

      const targets = [getHostname(resolvedPageUrl)];
      if (addUrls) {
        addUrls.split("|").forEach((url) => targets.push(getHostname(url)));
      }

      const apiUrl = new URL("https://webmention.io/api/mentions.jf2");
      apiUrl.searchParams.set("per-page", maxWebmentions.toString());
      apiUrl.searchParams.set("sort-by", sortBy);
      apiUrl.searchParams.set("sort-dir", sortDir);

      targets.forEach((target) => {
        apiUrl.searchParams.append("target[]", `http:${target}`);
        apiUrl.searchParams.append("target[]", `https:${target}`);
      });

      try {
        const response = await fetch(apiUrl.toString());
        if (!response.ok) throw new Error("Failed to fetch webmentions");

        const data = (await response.json()) as WebMentionResponse;
        const children = Array.isArray(data.children) ? data.children : [];

        const nextComments: WebMentionEntry[] = [];
        const nextReactions: WebMentionEntry[] = [];
        const mentionsByType: Record<string, WebMentionEntry[]> = {
          "in-reply-to": commentsAreReactions ? nextReactions : nextComments,
          "like-of": nextReactions,
          "repost-of": nextReactions,
          "bookmark-of": nextReactions,
          "mention-of": commentsAreReactions ? nextReactions : nextComments,
          rsvp: commentsAreReactions ? nextReactions : nextComments,
        };

        children.forEach((mention) => {
          const target = mentionsByType[mention["wm-property"]];
          if (target) target.push(mention);
        });

        setComments(nextComments);
        setReactions(nextReactions);
      } catch (error) {
        console.error("Failed to load webmentions:", error);
      }
    };

    if (typeof window !== "undefined") {
      loadWebMentions();
    }
  }, [
    resolvedPageUrl,
    addUrls,
    maxWebmentions,
    sortBy,
    sortDir,
    preventSpoofing,
    commentsAreReactions,
    wordcount,
  ]);

  const uniqueComments = useMemo(
    () => removeDuplicates(comments),
    [comments]
  );
  const uniqueReactions = useMemo(
    () => removeDuplicates(reactions),
    [reactions]
  );

  return (
    <div ref={containerRef} id={id} className={styles.container}>
      {uniqueComments.length > 0 && !commentsAreReactions && (
        <>
          <h2>Responses</h2>
          <ul className={styles.comments}>
            {uniqueComments.map((comment) => {
              const sourceLabel = getSourceLabel(comment.url);
              const authorName = comment.author?.name || sourceLabel;
              const content = comment.content?.text
                ? truncateText(comment.content.text, wordcount)
                : "(mention)";
              const rawCommentUrl =
                comment[preventSpoofing ? "wm-source" : "url"] || comment.url;
              const commentUrl = safeWebmentionUrl(rawCommentUrl) || "#";

              return (
                <li key={comment.url}>
                  {renderMention(comment, { preventSpoofing, wordcount }, true)}
                  <a className="source" rel="nofollow ugc" href={commentUrl}>
                    {authorName}
                  </a>
                  <span className={styles.text}>{content}</span>
                </li>
              );
            })}
          </ul>
        </>
      )}
      {uniqueReactions.length > 0 && (
        <>
          <h2>Reactions</h2>
          <ul className={styles.reacts}>
            {uniqueReactions.map((reaction) => (
              <li key={reaction.url}>
                {renderMention(reaction, { preventSpoofing, wordcount })}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default WebMention;
