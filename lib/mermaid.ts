import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

// Reuse the site's font provider and weights, not a diagram-specific font asset.
// mermaid-isomorphic loads this stylesheet before renderDiagrams, which awaits
// every declared FontFace.load() before Mermaid performs text measurement.
// Resolve from the project root, as the Markdown pipeline does. Avoid import.meta
// in this shared module: Playwright's CommonJS transform must also load it.
const siteFontStylesheet = readFile(`${process.cwd()}/pages/_document.tsx`, "utf8").then((css) => {
  const url = css.match(/href="(https:\/\/fonts\.googleapis\.com\/css2\?family=Noto\+Sans\+JP[^" ]*)"/)?.[1];
  if (!url) throw new Error("site Noto Sans JP stylesheet is missing");
  return url;
});
import type { Root } from "mdast";
import type { createMermaidRenderer } from "mermaid-isomorphic";

type MarkdownChild = Root["children"][number];

// Delegate parsing and layout to official Mermaid in build-time Chromium.
// This adapter only supplies publication context and rejects renderer errors.
let renderer: Promise<ReturnType<typeof createMermaidRenderer>> | undefined;
const render: ReturnType<typeof createMermaidRenderer> = async (...args) => {
  renderer ??= import("mermaid-isomorphic").then(({ createMermaidRenderer }) => createMermaidRenderer());
  return (await renderer)(...args);
};

export async function renderMermaidDiagram(source: string, location = "Markdown", index = 1): Promise<string> {
  try {
    const prefix = `mermaid-${createHash("sha256").update(location).digest("hex").slice(0, 16)}-${index}`;
    const [result] = await render([source], {
      prefix,
      css: await siteFontStylesheet,
      mermaidConfig: {
        secure: ["secure", "securityLevel", "startOnLoad", "suppressErrorRendering", "theme", "themeCSS", "themeVariables", "fontFamily", "fontSize", "htmlLabels", "sequence"],
        htmlLabels: false,
        securityLevel: "strict",
        startOnLoad: false,
        suppressErrorRendering: true,
        theme: "base",
        // Mermaid's .actor rule uses actorBkg for both rect and text; its
        // actorTextColor rule only targets tspans. Style the text parent too.
        // Mermaid scopes themeCSS to this SVG's id, leaving site text untouched.
        themeCSS: "text.actor { fill: #24292f; stroke: none; }",
        fontFamily: "Noto Sans JP",
        fontSize: 13,
        sequence: {
          // Leave space beyond actor-man labels at the lower diagram boundary.
          diagramMarginY: 24,
          actorFontSize: 13,
          noteFontSize: 13,
          messageFontSize: 13,
          actorFontFamily: "Noto Sans JP",
          noteFontFamily: "Noto Sans JP",
          messageFontFamily: "Noto Sans JP",
        },
        themeVariables: {
          fontFamily: "Noto Sans JP",
          fontSize: "13px",
          background: "#ffffff",
          primaryColor: "#ffffff",
          primaryTextColor: "#24292f",
          primaryBorderColor: "#8495a4",
          lineColor: "#8495a4",
          actorBkg: "#ffffff",
          actorBorder: "#8495a4",
          actorTextColor: "#24292f",
          signalColor: "#0969da",
          signalTextColor: "#24292f",
          noteBkgColor: "#ffffff",
          noteBorderColor: "#8495a4",
          noteTextColor: "#24292f",
        },
      },
    });
    if (!result) throw new Error("renderer returned no result");
    if (result.status === "rejected") throw result.reason;
    const { svg } = result.value;
    // Mermaid's error diagram is not publishable, even if rendering resolves.
    // These are official error-renderer classes, not a syntax/completeness test.
    if (!/^<svg\b/.test(svg) || /class=["'][^"']*\berror-(?:icon|text)\b/.test(svg)) {
      throw new Error("renderer returned invalid or error SVG");
    }
    if (svg.includes("@import") || svg.includes("fonts.googleapis.com")) {
      throw new Error("font import remained in SVG");
    }
    return svg.replace("<svg ", '<svg class="mermaid-diagram" ');
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Mermaid diagram ${index} in ${location}: ${reason}`, { cause: error });
  }
}

export function remarkMermaid(location = "Markdown") {
  return async (root: Root) => {
    let index = 0;
    const transform = async (node: { children?: MarkdownChild[] }): Promise<void> => {
      if (!node.children) return;
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (child.type === "code" && child.lang === "mermaid") {
          node.children[i] = {
            type: "html",
            value: await renderMermaidDiagram(child.value, location, ++index),
          };
        } else if ("children" in child) {
          await transform(child as { children?: MarkdownChild[] });
        }
      }
    };
    return transform(root);
  };
}
