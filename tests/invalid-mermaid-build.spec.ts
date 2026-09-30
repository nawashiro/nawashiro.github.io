import { test, expect } from "@playwright/test";
import { execFile } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { sequence, invalid } from "./fixtures/mermaid";

const root = path.resolve(__dirname, "..");
const articleId = "isolated-invalid-diagram";

function build(cwd: string): Promise<{ code: number | null; signal: string | null; output: string }> {
  return new Promise((resolve, reject) => {
    // Deliberately bypass npm's build/postbuild hooks and standard.site sync.
    execFile(process.execPath, [path.join(root, "node_modules/next/dist/bin/next"), "build"], {
      cwd,
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
      timeout: 180_000,
      maxBuffer: 8 * 1024 * 1024,
    }, (error, stdout, stderr) => {
      if (error && (typeof error.code !== "number" || error.killed || error.signal)) {
        reject(error); // A timeout/signal/spawn failure is not a publication rejection.
        return;
      }
      resolve({ code: error ? Number(error.code) : 0, signal: error?.signal ?? null, output: stdout + stderr });
    });
  });
}

function markdown(second: string) {
  return `---\ntitle: Isolated Mermaid build fixture\ndate: '2020-01-01'\n---\n\n\`\`\`mermaid\n${sequence}\n\`\`\`\n\n> \`\`\`mermaid\n> ${second.replaceAll("\n", "\n> ")}\n> \`\`\`\n`;
}

test("actual isolated Next build fails on invalid diagram with article and diagram identity", async ({}, testInfo) => {
  test.setTimeout(420_000);
  const fixture = await mkdtemp(path.join(tmpdir(), "mermaid-next-build-"));
  try {
    await cp(path.join(__dirname, "fixtures/mermaid-build/pages"), path.join(fixture, "pages"), { recursive: true });
    await symlink(path.join(root, "node_modules"), path.join(fixture, "node_modules"), "dir");
    // Reuse the real site font entrypoint, without secrets or synchronization hooks.
    await cp(path.join(root, "pages/_document.tsx"), path.join(fixture, "pages/_document.tsx"));
    await mkdir(path.join(fixture, "posts"));
    await writeFile(path.join(fixture, "package.json"), JSON.stringify({ private: true }));
    await writeFile(path.join(fixture, "next.config.js"), `module.exports = {
      output: 'export',
      experimental: { externalDir: true, cpus: 1 },
      serverExternalPackages: ['mermaid-isomorphic'],
      webpack(config) {
        config.resolve.alias['fixture-production-posts'] = ${JSON.stringify(path.join(root, "lib/posts.ts"))};
        return config;
      }
    };\n`);
    const postPath = path.join(fixture, "posts", `${articleId}.md`);
    // A successful control excludes setup/font/Chromium/bundling errors as the
    // cause of the negative result and proves this page reaches static export.
    await writeFile(postPath, markdown(sequence));
    const control = await build(fixture);
    await testInfo.attach("valid-build.log", { body: control.output, contentType: "text/plain" });
    expect(control.code, control.output).toBe(0);
    const html = await readFile(path.join(fixture, "out/posts", `${articleId}.html`), "utf8");
    expect(html).toContain('<svg class="mermaid-diagram"');

    // Do not leave the successful output/cache available to mask a failed build.
    await rm(path.join(fixture, "out"), { recursive: true, force: true });
    await rm(path.join(fixture, ".next"), { recursive: true, force: true });
    await writeFile(postPath, markdown(invalid));
    const failure = await build(fixture);
    await testInfo.attach("invalid-build.log", { body: failure.output, contentType: "text/plain" });
    expect(failure.signal).toBeNull();
    expect(failure.code, failure.output).not.toBe(0);
    expect(failure.output).toContain(`Mermaid diagram 2 in ${articleId}:`);
    expect(failure.output).toMatch(/Parse error|Syntax error/i);
    expect(failure.output).toContain(`/posts/${articleId}`);
    console.log(`Isolated Next build: valid exit=${control.code}; invalid exit=${failure.code}; Mermaid diagram 2 in ${articleId}`);
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});
