/** @jsxImportSource react */
import {
  FaHeart,
  FaCalendarAlt,
  FaUserCheck,
  FaCheck,
  FaLightbulb,
  FaQuestion,
} from "react-icons/fa";
import { MdAccountCircle, MdClose } from "react-icons/md";
import { FaRetweet, FaBookmark } from "react-icons/fa6";
import webmentionStyle from "../styles/webmention.module.css";
import {
  filterWebMentionsForTargets,
  safeWebmentionUrl,
  sortWebMentionsForDisplay,
  type WebMentionEntry,
  type WebMentionSortBy,
  type WebMentionSortDir,
} from "../lib/webmentions";

export { safeWebmentionUrl } from "../lib/webmentions";

const quoteClassName =
  typeof webmentionStyle === "undefined" ? "quote" : webmentionStyle.quote;

const icon = (action: string, classes: string = "") => {
  switch (action) {
    case "liked": {
      return (
        <span className="relative">
          <FaHeart className={`text-error size-8 ${classes}`} />
          <FaHeart
            className={`text-error size-8 hover:animate-ping ${classes}`}
          />
        </span>
      );
    }
    case "reposted": {
      return (
        <span className="relative">
          <FaRetweet
            className={`size-8 text-info drop-shadow-[0_0_2px_theme(colors.base-100)] ${classes}`}
          />
        </span>
      );
    }
    case "bookmarked": {
      return <FaBookmark className={`text-success size-8 ${classes}`} />;
    }
    case "RSVPed": {
      return <FaCalendarAlt className={`text-success size-8 ${classes}`} />;
    }
    case "followed": {
      return <FaUserCheck className={`text-success size-8 ${classes}`} />;
    }
    default:
      return null;
  }
};

const rsvpIcon = (rsvp: string, classes: string = "") => {
  switch (rsvp) {
    case "no": {
      return <MdClose className={classes} />;
    }
    case "interested": {
      return <FaLightbulb className={classes} />;
    }
    case "maybe": {
      return <FaQuestion className={classes} />;
    }
    case "yes": {
      return <FaCheck className={classes} />;
    }
    default:
      return null;
  }
};

const ACTIONS: Record<string, string> = {
  "in-reply-to": "replied",
  "like-of": "liked",
  "repost-of": "reposted",
  "bookmark-of": "bookmarked",
  "mention-of": "mentioned",
  rsvp: "RSVPed",
  "follow-of": "followed",
};

type WebMentionProps = {
  mentions?: WebMentionEntry[];
  pageUrl?: string;
  id?: string;
  wordcount?: number;
  preventSpoofing?: boolean;
  sortBy?: WebMentionSortBy;
  sortDir?: WebMentionSortDir;
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

const getSourceLabel = (url: string) => {
  try {
    return new URL(url).hostname || url;
  } catch {
    return url;
  }
};

type RenderContext = {
  preventSpoofing: boolean;
  wordcount?: number;
};

const buildActionLabel = (
  mention: WebMentionEntry,
  context: RenderContext,
  isComment: boolean,
) => {
  const property =
    typeof mention["wm-property"] === "string"
      ? mention["wm-property"]
      : "";
  let action = ACTIONS[property] || "reacted";
  if (!isComment && typeof mention.content?.text === "string") {
    action += ": " + truncateText(mention.content.text, context.wordcount);
  }
  return action;
};

const renderMention = (
  mention: WebMentionEntry,
  context: RenderContext,
  isComment = false,
) => {
  const sourceUrl = mention.url || mention["wm-source"] || "";
  const authorLabel =
    (typeof mention.author?.name === "string" && mention.author.name) ||
    getSourceLabel(sourceUrl) ||
    sourceUrl;
  const action = buildActionLabel(mention, context, isComment);
  const rsvp = typeof mention.rsvp === "string" ? mention.rsvp : undefined;
  const rawMentionUrl = context.preventSpoofing
    ? mention["wm-source"]
    : mention.url;
  const mentionUrl = safeWebmentionUrl(rawMentionUrl) || "#";
  const photoUrl = safeWebmentionUrl(
    typeof mention.author?.photo === "string" ? mention.author.photo : undefined,
  );

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
  mentions = [],
  pageUrl,
  id = "webmentions",
  wordcount,
  preventSpoofing = false,
  sortBy = "published",
  sortDir = "up",
  commentsAreReactions = false,
}: WebMentionProps) => {
  const matchingMentions = pageUrl
    ? filterWebMentionsForTargets(mentions, [pageUrl])
    : mentions;
  const sortedMentions = sortWebMentionsForDisplay(
    matchingMentions,
    sortBy,
    sortDir,
  );
  const comments: WebMentionEntry[] = [];
  const reactions: WebMentionEntry[] = [];

  sortedMentions.forEach((mention) => {
    const property = mention["wm-property"];
    const isComment = ["in-reply-to", "mention-of", "rsvp"].includes(
      typeof property === "string" ? property : "",
    );

    if (isComment && !commentsAreReactions) {
      comments.push(mention);
    } else {
      reactions.push(mention);
    }
  });

  const renderContext = { preventSpoofing, wordcount };

  return (
    <div id={id}>
      {comments.length > 0 && !commentsAreReactions && (
        <>
          <h2>✍️へんじ</h2>
          {comments.map((comment) => {
            const sourceUrl = comment.url || comment["wm-source"] || "";
            const sourceLabel = getSourceLabel(sourceUrl);
            const authorName =
              (typeof comment.author?.name === "string" &&
                comment.author.name) ||
              sourceLabel;
            const content =
              typeof comment.content?.text === "string"
                ? truncateText(comment.content.text, wordcount)
                : "(mention)";

            return (
              <div
                key={String(comment["wm-id"])}
                className={quoteClassName}
              >
                <blockquote>
                  <p>{content}</p>
                  <div className="flex leading-10 gap-2">
                    <span>by</span>
                    {renderMention(comment, renderContext, true)}
                    <span>{authorName}</span>
                  </div>
                </blockquote>
              </div>
            );
          })}
        </>
      )}
      {reactions.length > 0 && (
        <div className="mt-16 gap-4 flex flex-row flex-wrap">
          {reactions.map((reaction) => (
            <div key={String(reaction["wm-id"])}>
              {renderMention(reaction, renderContext)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WebMention;
