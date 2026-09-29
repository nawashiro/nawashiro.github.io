import type { Root } from "mdast";

type MarkdownChild = Root["children"][number];

const colors = {
  bg: "#ffffff",
  fg: "#24292f",
  line: "#8495a4",
  accent: "#0969da",
  muted: "#24292f",
  font: "Noto Sans JP",
};

const actor = /^(?:actor|participant) ([A-Za-z][A-Za-z0-9_]*)$/;
const message = /^([A-Za-z][A-Za-z0-9_]*)(-->>|->>)([A-Za-z][A-Za-z0-9_]*):\s*(.+)$/;

export function isCompleteMermaidSvg(svg: string, actors: Set<string>, labels: string[], count: number): boolean {
  return svg.startsWith("<svg ") && (svg.match(/marker-end=/g) ?? []).length === count &&
    [...actors, ...labels].every((text) => svg.includes(text));
}

export async function renderMermaidDiagram(source: string, location = "Markdown", index = 1): Promise<string> {
  const fail = (reason: string): never => {
    throw new Error(`Mermaid diagram ${index} in ${location}: ${reason}`);
  };
  const lines = source.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.shift() !== "sequenceDiagram") fail("unsupported diagram type");
  const actors = new Set<string>();
  const labels: string[] = [];
  let count = 0;
  for (const line of lines) {
    const declaration = actor.exec(line);
    if (declaration) {
      if (actors.has(declaration[1])) fail(`duplicate actor: ${declaration[1]}`);
      actors.add(declaration[1]);
      continue;
    }
    const edge = message.exec(line);
    if (!edge) return fail(`unsupported sequence statement: ${line}`);
    if (/[<>\&"']/.test(edge[4]) || /(?:javascript|data):/i.test(edge[4])) fail(`unsafe message label in: ${line}`);
    actors.add(edge[1]);
    actors.add(edge[3]);
    labels.push(edge[4]);
    count++;
  }
  if (!actors.size || !count) fail("diagram needs actors and messages");

  let svg = "";
  try {
    const { renderMermaidSVG } = await import("beautiful-mermaid");
    svg = renderMermaidSVG(source, colors);
  } catch (error) {
    fail(`render failed: ${String(error)}`);
  }
  if (!isCompleteMermaidSvg(svg, actors, labels, count)) {
    fail("rendered SVG is incomplete");
  }
  // The renderer's font import is redundant: the site already loads Noto Sans JP.
  svg = svg.replace(/^\s*@import url\([^\n]*\n/gm, "");
  svg = svg.replace("<svg ", '<svg class="mermaid-diagram" role="img" ');
  svg = svg.replace(/\btext \{/g, ".mermaid-diagram text {");
  svg = svg.replace(/\bsvg \{/g, "svg.mermaid-diagram {");
  svg = svg.replace("</style>", `
.mermaid-diagram text { font-size: 13px; font-weight: 700; }
.mermaid-diagram line { stroke-width: 1.75px; }
</style>`);
  if (svg.includes("@import") || svg.includes("fonts.googleapis.com")) fail("font import remained in SVG");
  return svg;
}

export function remarkBrowserlessMermaid(location = "Markdown") {
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
