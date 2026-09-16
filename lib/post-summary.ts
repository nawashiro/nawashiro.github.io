import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import { unified } from "unified";

export type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  children?: HastNode[];
  properties?: Record<string, unknown>;
};

function getClassTokens(node: HastNode): string[] {
  const className = node.properties?.className;
  if (typeof className === "string") {
    return className.split(/\s+/).filter(Boolean);
  }
  if (Array.isArray(className)) {
    return className.filter(
      (classToken): classToken is string => typeof classToken === "string",
    );
  }
  return [];
}

function getHastText(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  if (node.type === "element" && node.tagName === "br") return "\n";
  return (node.children ?? []).map(getHastText).join("");
}

export function extractPSummaryFromHast(
  node: HastNode,
): string | undefined {
  if (node.type === "element" && getClassTokens(node).includes("p-summary")) {
    const summary = getHastText(node).replace(/\s+/g, " ").trim();
    if (summary) return summary;
  }

  for (const child of node.children ?? []) {
    const summary = extractPSummaryFromHast(child);
    if (summary) return summary;
  }

  return undefined;
}

export async function extractPostSummary(
  content: string,
): Promise<string | undefined> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw);
  const tree = await processor.run(processor.parse(content));
  return extractPSummaryFromHast(tree as HastNode);
}
