import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { renderMermaidDiagram } from "../lib/mermaid";
import { renderMarkdownDocument } from "../lib/posts";
import { sequence, sequenceLabels, flowchart, invalid, hostileSources } from "./fixtures/mermaid";

// Rendering uses real Chromium and the site's existing remote font provider.
// Allow its readiness barrier to finish; never mock fonts or fall back to grammar checks.
test.setTimeout(120_000);

function expectStaticSvg(svg: string) {
  expect(svg).toMatch(/^<svg class="mermaid-diagram" /);
  expect(svg).not.toMatch(/class=["'][^"']*\berror-(?:icon|text)\b/);
  expect(svg).not.toMatch(/@import|@font-face|fonts\.googleapis\.com|fonts\.gstatic\.com|evil\.invalid/);
}

test("official Mermaid preserves aliases, Japanese labels, note variants and directed arrows", async ({ page }) => {
  const svg = await renderMermaidDiagram(sequence, "sequence-fixture");
  expectStaticSvg(svg);
  await page.setContent(svg);
  for (const label of sequenceLabels) await expect(page.locator("svg")).toContainText(label);
  const arrows = await page.locator("svg [marker-end]").evaluateAll((elements) => elements.map((element) => {
    const reference = element.getAttribute("marker-end")!;
    const id = reference.match(/#([^)]*)/)?.[1];
    return { reference, exists: !!id && !!document.getElementById(id) };
  }));
  expect(arrows.length).toBeGreaterThan(0);
  expect(arrows.every((arrow) => arrow.exists)).toBe(true);
  await expect(page.locator("svg .messageLine0").first()).toBeAttached();
  await expect(page.locator("svg .messageLine1").first()).toBeAttached();
});

test("valid official non-sequence grammar renders as static Markdown HTML", async () => {
  expectStaticSvg(await renderMermaidDiagram(flowchart, "flowchart-fixture"));
  const { contentHtml: html } = await renderMarkdownDocument(`Before\n\n\`\`\`mermaid\n${flowchart}\n\`\`\`\n\nAfter`, "markdown-fixture");
  expect(html).toContain('<svg class="mermaid-diagram"');
  expect(html).toContain("受付");
  expect(html).toContain("処理");
  expect(html).not.toMatch(/<script\b|<code[^>]*class="language-mermaid"|mermaid\.initialize/);
});

test("malformed source rejects without fallback and includes location and index", async () => {
  await expect(renderMermaidDiagram(invalid, "invalid-fixture", 7)).rejects.toThrow(/Mermaid diagram 7 in invalid-fixture:/);
  const markdown = `\`\`\`mermaid\n${sequence}\n\`\`\`\n\n> \`\`\`mermaid\n> ${invalid.replaceAll("\n", "\n> ")}\n> \`\`\``;
  await expect(renderMarkdownDocument(markdown, "nested-invalid-fixture")).rejects.toThrow(/Mermaid diagram 2 in nested-invalid-fixture:/);
});

test("strict security prevents executable SVG and hostile configuration overrides", async ({ page }) => {
  for (const [index, source] of hostileSources.entries()) {
    const svg = await renderMermaidDiagram(source, "hostile-fixture", index + 1);
    expectStaticSvg(svg);
    const unsafe = await page.evaluate((markup) => {
      // Publication embeds inline SVG in HTML, so inspect that actual parsing mode.
      const doc = new DOMParser().parseFromString(markup, "text/html");
      const findings: string[] = [];
      for (const element of doc.querySelectorAll("*")) {
        if (["script", "iframe", "object", "embed", "foreignObject", "parsererror"].includes(element.localName)) findings.push(element.localName);
        for (const attr of element.attributes) {
          if (/^on/i.test(attr.name)) findings.push(attr.name);
          if (["href", "xlink:href", "src"].includes(attr.name) && /^(?:javascript|data|vbscript):/i.test(attr.value.replace(/[\s\u0000-\u001f]/g, ""))) findings.push(attr.value);
        }
      }
      return findings;
    }, svg);
    expect(unsafe).toEqual([]);
    expect(svg).not.toContain("99px");
  }
});

test("real site font loads and 13px contrasting styles remain diagram-local", async ({ page }) => {
  const css = await readFile("pages/_document.tsx", "utf8");
  const fontUrl = css.match(/href="(https:\/\/fonts\.googleapis\.com[^"]+)"/)?.[1];
  expect(fontUrl).toBeTruthy();
  await page.addStyleTag({ url: fontUrl! });
  const readiness = await page.evaluate(async () => {
    const faces = [...document.fonts].filter((face) => face.family.includes("Noto Sans JP"));
    await Promise.all([...document.fonts].map((face) => face.load()));
    await document.fonts.ready;
    return { declared: faces.length, loaded: faces.filter((face) => face.status === "loaded").length };
  });
  expect(readiness.declared).toBeGreaterThan(0);
  expect(readiness.loaded).toBe(readiness.declared);
  const svg = await renderMermaidDiagram(sequence, "font-style-fixture");
  expectStaticSvg(svg);
  await page.evaluate((markup) => { document.body.innerHTML = `<p id="outside">unrelated</p>${markup}`; }, svg);
  const styles = await page.evaluate(() => ({
    texts: [...document.querySelectorAll("svg text")].map((text) => ({ size: getComputedStyle(text).fontSize, family: getComputedStyle(text).fontFamily, fill: getComputedStyle(text).fill })),
    outside: getComputedStyle(document.querySelector("#outside")!).fontSize,
    background: getComputedStyle(document.querySelector("svg rect.actor")!).fill,
    signal: getComputedStyle(document.querySelector("svg .messageLine0")!).stroke,
    arrow: getComputedStyle(document.querySelector("svg marker path")!).fill,
  }));
  expect(styles.texts.length).toBeGreaterThan(0);
  for (const text of styles.texts) {
    expect(text.size).toBe("13px");
    expect(text.family).toContain("Noto Sans JP");
    expect(text.fill).toBe("rgb(36, 41, 47)");
  }
  expect(styles.outside).toBe("16px");
  expect(styles.background).toBe("rgb(255, 255, 255)");
  expect(styles.signal).toBe("rgb(9, 105, 218)");
  expect(styles.arrow).toBe("rgb(9, 105, 218)");
});
