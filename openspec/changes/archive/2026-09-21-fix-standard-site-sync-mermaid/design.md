## Context

See `proposal.md` for the motivation. `lib/posts.ts` currently owns both the complete public Markdown renderer and the p-summary extraction performed after `rehypeRaw`. `lib/sync-standard-site.ts` needs only the extracted summary, but currently invokes the complete renderer, which includes `remark-mermaidjs` and its Playwright-backed `mermaid-isomorphic` dependency. In GitHub Actions, that unnecessary path fails before the Next.js build when a Mermaid article is processed through `tsx`.

## Goals / Non-Goals

**Goals:**

- Give Standard-site synchronization a Markdown-to-HAST path that extracts p-summary without browser execution.
- Reuse one HAST extraction implementation for the complete public renderer and the lightweight sync path.
- Preserve the public site's existing Mermaid, Prism, KaTeX, and HTML output.
- Add a regression case that contains Mermaid syntax and proves summary extraction does not invoke Mermaid rendering.

**Non-Goals:**

- Do not change the public Markdown rendering pipeline or remove Mermaid from published pages.
- Do not upgrade `remark-mermaidjs` or `mermaid-isomorphic` in this change.
- Do not convert the repository or its build scripts to native ESM.
- Do not change Standard-site record fields beyond the existing p-summary-derived description behavior.

## Decisions

1. **Put summary extraction in a dedicated lightweight module.**
   Move the HAST text/class traversal into `lib/post-summary.ts`, and expose a function that parses Markdown with only `remarkParse`, `remarkRehype`, and `rehypeRaw`. This keeps the sync dependency graph free of the Mermaid renderer while preserving the existing extraction semantics.

2. **Reuse the HAST helper in the full renderer.**
   The complete `renderMarkdownDocument()` pipeline will continue registering all existing Markdown plugins, including `remarkMermaid`. Its post-`rehypeRaw` summary hook will call the shared HAST extractor so the public and sync paths cannot drift.

3. **Make Standard-site sync call the lightweight extractor.**
   `lib/sync-standard-site.ts` will use the dedicated summary function and will no longer call `renderMarkdownDocument()`. Since the Standard-site record does not consume `contentHtml`, avoiding that work is both sufficient and semantically correct.

4. **Next configのserver build用ts-nodeだけCommonJS解決を明示する.**
   `next.config.js`のRSS生成pluginは`lib/posts.ts`をNodeの`require`で読み込む。新しい相対moduleを解決できるよう、このplugin登録時のts-nodeに`module: "CommonJS"`と`moduleResolution: "Node"`を指定する。プロジェクト全体のtsconfigやNext.jsの公開ページbundleは変更しない。

5. **Prefer scoped behavior over environment flags.**
   The distinction will be expressed by separate functions and imports rather than a hidden environment variable or a `renderMermaid: false` mode. This makes the server-side dependency boundary visible at the call site and avoids generating discarded HTML.

6. **Leave runtime and package versions unchanged.**
   The failure is caused by the `tsx`-serialized callback reaching Playwright, not by a required Node version change. Package upgrades and ESM migration remain fallback investigations if a later Next.js build exposes a separate Mermaid issue.

## Risks / Trade-offs

- **[Risk]** The lightweight parser could diverge from the full pipeline for unusual Markdown constructs. **Mitigation:** share the HAST traversal, retain the existing full-render tests, and add nested-element plus Mermaid-input summary tests.
- **[Risk]** A future caller may need rendered HTML during Standard-site sync. **Mitigation:** keep the complete renderer available as a separate API and document that the sync record currently consumes only summary metadata.
- **[Trade-off]** The sync path performs a minimal Markdown parse rather than reusing the already-rendered HTML. **Mitigation:** this removes the browser dependency and avoids work whose result is discarded.

## Migration Plan

1. Add the dedicated summary module and route both callers through the appropriate function.
2. Run unit tests, typecheck, lint, and a CI-like summary extraction over Mermaid content.
3. Run the full static build and verify the existing public Mermaid output and generated metadata.
4. If validation fails, revert the scoped code changes; no data migration or remote record migration is required.
