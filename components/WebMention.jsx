import { useEffect, useRef } from "react";
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

const WebMention = ({
  pageUrl = typeof window !== "undefined"
    ? window.location.href.replace(/#.*$/, "")
    : "",
  addUrls = "",
  id = "webmentions",
  wordcount,
  maxWebmentions = 30,
  preventSpoofing = false,
  sortBy = "published",
  sortDir = "up",
  commentsAreReactions = false,
}) => {
  const containerRef = useRef(null);

  const escapeHtml = (text) => {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  const truncateText = (text, limit) => {
    if (!limit) return text;
    const words = text.replace(/\s+/g, " ").split(" ", limit + 1);
    if (words.length > limit) {
      words[limit - 1] += "…";
      return words.slice(0, limit).join(" ");
    }
    return text;
  };

  const getHostname = (url) => {
    return url.substr(url.indexOf("//"));
  };

  const removeDuplicates = (mentions) => {
    const seen = new Set();
    return mentions.filter((mention) => {
      const url = getHostname(mention.url);
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    });
  };

  const renderMention = (mention, isComment = false) => {
    const author = escapeHtml(
      mention.author?.name || mention.url.split("/")[2]
    );
    let action = ACTIONS[mention["wm-property"]] || "reacted";

    if (!isComment && mention.content?.text) {
      action += ": " + truncateText(mention.content.text, wordcount);
    }

    const photoHtml = mention.author?.photo
      ? `<img src="${escapeHtml(
          mention.author.photo
        )}" loading="lazy" decoding="async" alt="${author}">`
      : `<img class="${styles.missing}" src="data:image/webp;base64,UklGRkoCAABXRUJQVlA4TD4CAAAvP8APAIV0WduUOLr/m/iqY6SokDJSMD5xYX23SQizRsVdZmIj/f6goYUbiOj/BED7MOPReuBNT3vBesSzIex+SeqMFFkjebFmzH3S7POxDSJ1yaCbCmMnS2R46cRMPyQLw4GBK4esdK60pYwsZakecUCl5zsHv/5cPH08nx9/7i6rEEVCg2hR8VSd30PxMZpVoJZQO6Dixgg6X5oKFCmlVHIDmmMFShWumAXgCuyqVN8hHff/k+9fj8+ei7BVjpxBmZCUJv+6DhWGZwWvs+UoLHFCKsPYpfJtIcEXBTopEEsKwedZUv4ku1FZErKULLyQwFGgnmTs2vBD5qu44xwnG9uyjgrFOd+KRVlXyQfwQlauydaU6AVI7OjKXLUEqNtxJBmQegNDZgV7lxxqYMOMrDyC1NdAGbdiH9Ij0skjG+oTyfO0lmjdgvoH8iIgreuBMRYLSH+R3sAztXgL+XfS7E2bmfo6gnS0TrpnzHT7kL+skj7PgHuBwv/zpN8LDLQg7zfJZLBubMKnyeh6ZGyfDEfc2LYpnlUtG7JqsSHq1WoASbUS4KVaLwB8be5mfsGMDwBcm5VxbuxWxx3nkFanB6lYqsqSkOGkKicoDvXsneR7BkKU7DtaEuT7+pxBGVwx+9gVyqf2pVA9sC2CsmjZ1RJqEJHS4Tj/pCcS0JoyBYOsB91Xjh3OFfQPQhvCAYyeLJlaOoFp0XNNuD0BC8exr8uPx7D1JWkwFdZIXmD3MOPReuDNzHjBesSzIbQD" alt="${author}">`;

    const rsvpIcon =
      mention.rsvp && RSVP_ICONS[mention.rsvp]
        ? `<sub>${RSVP_ICONS[mention.rsvp]}</sub>`
        : "";

    return `
      <a class="${
        styles.reaction
      }" rel="nofollow ugc" title="${author} ${action}" href="${
      mention[preventSpoofing ? "wm-source" : "url"]
    }">
        ${photoHtml}
        ${REACTIONS[mention["wm-property"]] || "💥"}
        ${rsvpIcon}
      </a>
    `;
  };

  useEffect(() => {
    const loadWebMentions = async () => {
      const container = containerRef.current;
      if (!container) return;

      const targets = [getHostname(pageUrl)];
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

        const data = await response.json();

        const comments = [];
        const reactions = [];
        const mentionsByType = {
          "in-reply-to": commentsAreReactions ? reactions : comments,
          "like-of": reactions,
          "repost-of": reactions,
          "bookmark-of": reactions,
          "mention-of": commentsAreReactions ? reactions : comments,
          rsvp: commentsAreReactions ? reactions : comments,
        };

        data.children.forEach((mention) => {
          const target = mentionsByType[mention["wm-property"]];
          if (target) target.push(mention);
        });

        let html = "";

        if (comments.length > 0 && comments !== reactions) {
          const uniqueComments = removeDuplicates(comments);
          html += `
            <h2 class="${styles.heading}">Responses</h2>
            <ul class="${styles.comments}">
              ${uniqueComments
                .map((comment) => {
                  const mentionHtml = renderMention(comment, true);
                  const source = escapeHtml(comment.url.split("/")[2]);
                  const authorName = comment.author?.name
                    ? escapeHtml(comment.author.name)
                    : source;
                  const content = comment.content?.text
                    ? truncateText(comment.content.text, wordcount)
                    : "(mention)";

                  return `
                  <li>
                    ${mentionHtml}
                    <a class="source" rel="nofollow ugc" href="${
                      comment[preventSpoofing ? "wm-source" : "url"]
                    }">${authorName}</a>
                    <span class="${styles.text}">${content}</span>
                  </li>
                `;
                })
                .join("")}
            </ul>
          `;
        }

        if (reactions.length > 0) {
          const uniqueReactions = removeDuplicates(reactions);
          html += `
            <h2 class="${styles.heading}">Reactions</h2>
            <ul class="${styles.reacts}">
              ${uniqueReactions
                .map((reaction) => renderMention(reaction))
                .join("")}
            </ul>
          `;
        }

        container.innerHTML = html;
      } catch (error) {
        console.error("Failed to load webmentions:", error);
      }
    };

    if (typeof window !== "undefined") {
      loadWebMentions();
    }
  }, [
    pageUrl,
    addUrls,
    maxWebmentions,
    sortBy,
    sortDir,
    preventSpoofing,
    commentsAreReactions,
    wordcount,
  ]);

  return <div ref={containerRef} id={id} className={styles.container} />;
};

export default WebMention;
