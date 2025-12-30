import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="ja" data-theme="nawashiro">
      <Head>
        <meta charSet="utf-8" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#48731d" />
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.css"
          integrity="sha384-FkTZUsHjYVyYpU6dse+5AzszY5617FqhnLpcMIIAlLKTbdmeVMO/7K6BrdHWM28V"
          crossOrigin="anonymous"
        ></link>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
