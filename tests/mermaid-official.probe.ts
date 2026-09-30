import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { renderMermaidDiagram, remarkMermaid } from "../lib/mermaid";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { chromium } from "playwright";

async function verifyFontAndSecurity(svg: string) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const css = await fs.readFile("pages/_document.tsx", "utf8");
    const url = css.match(/href="(https:\/\/fonts\.googleapis\.com[^"]+)"/)![1];
    await page.addStyleTag({ url });
    const readiness = await page.evaluate(async () => {
      const faces = [...document.fonts].filter((face) => face.family.includes("Noto Sans JP"));
      if (!faces.length) throw new Error("No real Noto Sans JP FontFaces");
      // Exactly the adapter's pre-measurement barrier, not fonts.check alone
      // (fonts.check can report true when no such font is installed).
      await Promise.all([...document.fonts].map((face) => face.load()));
      await document.fonts.ready;
      return { declared: faces.length, loaded: faces.filter((face) => face.status === "loaded").length };
    });
    assert.equal(readiness.loaded, readiness.declared);
    console.log("PASS genuine Noto Sans JP readiness before measurement", readiness);

    const hostile = [
      'flowchart TD\n A["<script>alert(1)</script><img src=x onerror=alert(1)>"] --> B["日本語"]',
      'flowchart TD\n A["危険なリンク"]\n click A "javascript:alert(1)"',
      'flowchart TD\n A["危険なリンク"]\n click A "data:text/html,<script>alert(1)</script>"',
      '%%{init: {"securityLevel":"loose", "themeCSS":"@import url(https://evil.invalid/font.css);", "fontFamily":"evil", "themeVariables":{"fontSize":"99px"}}}%%\nflowchart TD\n A["<img src=x onerror=alert(1)>"]',
    ];
    for (const [index, source] of hostile.entries()) {
      const output = await renderMermaidDiagram(source, "hostile-label-fixture", index + 1);
      const findings = await page.evaluate((markup) => {
        const doc = new DOMParser().parseFromString(markup, "image/svg+xml");
        const unsafe: string[] = [];
        for (const el of doc.querySelectorAll("*")) {
          if (["script", "iframe", "object", "embed", "foreignObject"].includes(el.localName)) unsafe.push(el.localName);
          for (const attr of el.attributes) {
            if (/^on/i.test(attr.name)) unsafe.push(attr.name);
            if (["href", "xlink:href", "src"].includes(attr.name) && /^(?:javascript|data|vbscript):/i.test(attr.value.replace(/[\s\u0000-\u001f]/g, ""))) unsafe.push(attr.value);
          }
        }
        return unsafe;
      }, output);
      assert.deepEqual(findings, []);
      assert.doesNotMatch(output, /@import|@font-face|fonts\.googleapis\.com|fonts\.gstatic\.com|evil\.invalid/);
      console.log(`PASS hostile label/link/config fixture ${index + 1}: no executable SVG or external font import`);
    }
    assert.doesNotMatch(svg, /@import|@font-face|fonts\.googleapis\.com|fonts\.gstatic\.com/);
    await page.setContent(`<p id="outside">unrelated</p>${svg}`);
    const style = await page.evaluate(() => ({
      diagram: getComputedStyle(document.querySelector("svg text")!).fontSize,
      family: getComputedStyle(document.querySelector("svg text")!).fontFamily,
      outside: getComputedStyle(document.querySelector("#outside")!).fontSize,
      sizes: [...document.querySelectorAll("svg text")].map((text) => getComputedStyle(text).fontSize),
      background: getComputedStyle(document.querySelector("svg rect.actor")!).fill,
      signal: getComputedStyle(document.querySelector("svg .messageLine0")!).stroke,
    }));
    assert.ok(style.sizes.every((size) => size === "13px"));
    assert.equal(style.background, "rgb(255, 255, 255)");
    assert.equal(style.signal, "rgb(9, 105, 218)");
    assert.equal(style.diagram, "13px");
    assert.match(style.family, /Noto Sans JP/);
    assert.equal(style.outside, "16px");
    console.log("PASS diagram-local 13px Noto Sans JP styling, unaffected surrounding content", style);
  } finally {
    await browser.close();
  }
}

const fixture = `sequenceDiagram
  participant Visitor as 訪問者
  participant Server as 公開サーバー
  Visitor->>Server: 日本語の要求
  Note over Visitor,Server: 検証用の注記
  Server-->>Visitor: 日本語の応答`;

async function main() {
  const svg = await renderMermaidDiagram(fixture, "fixed-independent-fixture", 1);
  for (const label of ["訪問者", "公開サーバー", "日本語の要求", "検証用の注記", "日本語の応答"]) {
    assert.ok(svg.includes(label), label);
  }
  assert.match(svg, /marker-end=/);
  assert.match(svg, /^<svg class="mermaid-diagram" /);
  assert.doesNotMatch(svg, /class=["'][^"']*\berror-(?:icon|text)\b/);
  console.log("PASS fixed aliases/Japanese/messages/note/directed arrows fixture");
  await verifyFontAndSecurity(svg);

  // Optional migration inputs; no permanent article IDs or wording expectations.
  for (const path of process.argv.slice(2)) {
    const markdown = await fs.readFile(path, "utf8");
    const diagrams = [...markdown.matchAll(/```mermaid\s*\n([\s\S]*?)```/g)];
    assert.ok(diagrams.length > 0, `no diagrams in ${path}`);
    for (const [i, match] of diagrams.entries()) {
      const rendered = await renderMermaidDiagram(match[1], path, i + 1);
      assert.match(rendered, /^<svg\b/);
      console.log(`PASS migration ${path} diagram ${i + 1} (${rendered.length} SVG chars)`);
    }
  }

  const invalid = "sequenceDiagram\nThis is not valid Mermaid syntax !!!";
  await assert.rejects(renderMermaidDiagram(invalid, "invalid-fixture", 7), /Mermaid diagram 7 in invalid-fixture:/);
  console.log("PASS malformed source rejects with article/index context (no fallback SVG)");

  const processor = unified().use(remarkParse).use(remarkMermaid, "nested-invalid-fixture");
  const tree = processor.parse(`\`\`\`mermaid\n${fixture}\n\`\`\`\n\n> \`\`\`mermaid\n> ${invalid.replaceAll("\n", "\n> ")}\n> \`\`\``);
  await assert.rejects(processor.run(tree), /Mermaid diagram 2 in nested-invalid-fixture:/);
  console.log("PASS Markdown transformer propagates nested diagram 2 failure");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
