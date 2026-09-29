import twemoji from "@twemoji/api";

// Match the version of the parser to the version of the CDN artwork.
const assetBase = "https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/72x72/";

export type EmojiPart = { text: string; src?: string };

export function emojiParts(text: string): EmojiPart[] {
  const parts: EmojiPart[] = [];
  let start = 0;
  twemoji.replace(text, (emoji: string) => {
    const offset = text.indexOf(emoji, start);
    if (offset > start) parts.push({ text: text.slice(start, offset) });
    const icon = twemoji.convert.toCodePoint(
      emoji.includes("\u200d") ? emoji : emoji.replace(/\ufe0f/g, ""),
    );
    parts.push({ text: emoji, src: `${assetBase}${icon}.png` });
    start = offset + emoji.length;
    return emoji;
  });
  if (start < text.length) parts.push({ text: text.slice(start) });
  return parts;
}

// HAST traversal after rehype-raw; never touch attributes or literal code.
type Node = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: Node[];
};

export function renderTwemojiInHast(root: Node): void {
  const excluded = new Set(["pre", "code", "script", "style", "textarea", "title", "noscript", "svg"]);
  function visit(node: Node): void {
    if (!node.children || excluded.has(node.tagName ?? "")) return;
    node.children = node.children.flatMap((child): Node[] => {
      if (child.type !== "text" || !child.value) {
        visit(child);
        return [child];
      }
      return emojiParts(child.value).map(({ text, src }): Node => src
        ? { type: "element", tagName: "img", properties: { className: ["twemoji"], draggable: "false", alt: text, src }, children: [] }
        : { type: "text", value: text });
    });
  }
  visit(root);
}
