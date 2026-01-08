import { useEffect, useMemo, useRef, useState } from "react";
import { FaHeart, FaCalendarAlt, FaUserCheck, FaCheck, FaLightbulb, FaQuestion } from "react-icons/fa";
import { MdAccountCircle, MdClose } from "react-icons/md";
import { FaRetweet, FaBookmark } from "react-icons/fa6";

const icon = (action: string, classes: string = "") => {
  switch (action) {
    case "liked": {
      return (
        <span className="relative">
          <FaHeart className={`text-error size-8 ${classes}`} />
          <FaHeart className={`text-error size-8 hover:animate-ping ${classes}`} />
        </span>
      )
    }
    case "reposted": {
      return (
        <span className="relative">
          <FaRetweet className={`text-base-100 size-10 ${classes}`} />
          <FaRetweet className={`text-info size-8 ${classes}`} />
        </span>
      )
    }
    case "bookmarked": {
      return (
        <FaBookmark className={`text-success size-8 ${classes}`} />
      )
    }
    case "RSVPed": {
      return (
        <FaCalendarAlt className={`text-success size-8 ${classes}`} />
      )
    }
    case "followed": {
      return (
        <FaUserCheck className={`text-success size-8 ${classes}`} />
      )
    }
  }
}

const rsvpIcon = (rsvp: string, classes: string = "") => {
  switch (rsvp) {
    case "no": {
      return <MdClose className={classes} />
    }
    case "interested": {
      return <FaLightbulb className={classes} />
    }
    case "maybe": {
      return <FaQuestion className={classes} />
    }
    case "yes": {
      return <FaCheck className={classes} />
    }
  }
}

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

export const shouldFetchWebmentions = () => {
  if (process.env.NODE_ENV === "test") return false;
  if (process.env.DISABLE_EXTERNAL_FETCH === "1") return false;
  if (process.env.NEXT_PUBLIC_DISABLE_EXTERNAL_FETCH === "1") return false;
  return true;
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
  const rsvp = mention.rsvp;
  const rawMentionUrl =
    mention[context.preventSpoofing ? "wm-source" : "url"] || mention.url;
  const mentionUrl = safeWebmentionUrl(rawMentionUrl) || "#";
  const photoUrl = safeWebmentionUrl(mention.author?.photo);

  return (
    <a
      rel="nofollow ugc"
      title={`${authorLabel} ${action}`}
      href={mentionUrl}
      className="flex gap-1"
    >
      <div className="indicator">
        {photoUrl ? (
          <img
            src={photoUrl}
            loading="lazy"
            decoding="async"
            alt={authorLabel}
            className="size-10 rounded-full hover:animate-spin"
          />
        ) : (
          <MdAccountCircle className="size-10 hover:animate-spin" />
        )}
        {icon(action, "indicator-item")}
      </div>
      {rsvp && rsvpIcon(rsvp, "size-10 py-2")}
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
  const shouldFetch = shouldFetchWebmentions();

  useEffect(() => {
    if (!shouldFetch) return;
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
    shouldFetch,
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
    <div ref={containerRef} id={id}>
      {uniqueComments.length > 0 && !commentsAreReactions && (
        <>
          <h2>へんじ</h2>
          <ul>
            {uniqueComments.map((comment) => {
              const sourceLabel = getSourceLabel(comment.url);
              const authorName = comment.author?.name || sourceLabel;
              const content = comment.content?.text
                ? truncateText(comment.content.text, wordcount)
                : "(mention)";

              return (
                <li key={comment.url} className="quote">
                  <blockquote>
                    <p>{content}</p>
                    <div className="flex leading-10 gap-2">
                      <span>by</span>
                      {renderMention(comment, { preventSpoofing, wordcount }, true)}
                      <span>{authorName}</span>
                    </div>
                  </blockquote>
                </li>
              );
            })}
          </ul>
        </>
      )}
      {uniqueReactions.length > 0 && (
        <>
          <ul className="mt-16 flex gap-4">
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
