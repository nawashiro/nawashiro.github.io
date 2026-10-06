import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import path from "node:path";

// Render outside Playwright's JSX transform, which produces locator descriptors.
function renderFixture(updated: string) {
  const result = execFileSync(process.execPath, ["-r", "ts-node/register/transpile-only", "-e", `
    // CSS modules do not affect the timestamp or metadata contract.
    require.extensions['.css'] = module => { module.exports = {}; };
    const React = require('react');
    const { renderToStaticMarkup } = require('react-dom/server');
    require('next/config').setConfig({ publicRuntimeConfig: {} });
    const DateDisplay = require(${JSON.stringify(path.resolve("components/date.tsx"))}).default;
    const Post = require(${JSON.stringify(path.resolve("pages/posts/[id].tsx"))}).default;
    const { HeadManagerContext } = require('next/dist/shared/lib/head-manager-context.shared-runtime');
    let head = [];
    const dates = ['published', 'updated'].map(kind => renderToStaticMarkup(React.createElement(DateDisplay, {
      dateString: '2026-01-01T00:30:00+09:00', kind,
    })));
    const html = renderToStaticMarkup(React.createElement(HeadManagerContext.Provider, {
      value: { mountedInstances: new Set(), updateHead: elements => { head = elements; } },
    }, React.createElement(Post, {
      id: 'timestamp-fixture', webmentions: [], postData: {
        id: 'timestamp-fixture', title: 'Timestamp fixture', published: '2026-01-01', updated: ${JSON.stringify(updated)},
        contentHtml: '<p>Fixed input.</p>', backLinks: [], imageUrl: null,
      },
    })));
    console.log(JSON.stringify({ html, metadata: renderToStaticMarkup(React.createElement(React.Fragment, null, ...head)), dates }));
  `], {
    env: { ...process.env, TS_NODE_COMPILER_OPTIONS: JSON.stringify({ module: "CommonJS", moduleResolution: "Node", jsx: "react-jsx" }) },
    timeout: 20_000, encoding: "utf8",
  });
  return JSON.parse(result) as { html: string; metadata: string; dates: string[] };
}

for (const updated of ["2026-01-01", "2026-01-03T09:00:00+09:00"]) {
  test(`article exposes both timestamps in HTML and metadata: ${updated}`, () => {
    const { html, metadata, dates } = renderFixture(updated);
    for (const [i, kind] of ["published", "updated"].entries()) {
      expect(dates[i]).toContain(`class="dt-${kind} ${kind}"`);
      expect(dates[i]).toMatch(/datetime="2026-01-01T00:30:00\+09:00"/i);
      expect(dates[i]).toContain("2026年1月1日");
    }
    expect(html).toContain('class="h-entry"');
    expect(html).toContain('class="dt-published published"');
    expect(html).toContain('class="dt-updated updated"');
    expect(html).toContain(updated);
    expect(html).toContain("公開：");
    expect(html).toContain("更新：");
    expect(metadata).toContain('property="article:published_time" content="2026-01-01"');
    expect(metadata).toContain(`property="article:modified_time" content="${updated}"`);
    expect(metadata).toContain('"datePublished":"2026-01-01"');
    expect(metadata).toContain(`"dateModified":"${updated}"`);
  });
}
