import getConfig from "next/config";
import Head from "next/head";
import Link from "next/link";
import { MdMenu, MdWest } from "react-icons/md";
import { type ReactNode } from "react";
import Script from "next/script";

const name = "NAWASHIRO";
export const siteTitle = "NAWASHIRO";
const { publicRuntimeConfig } = getConfig();

export default function Layout({
  children,
  blog,
  title,
  postDescription = null,
  imageUrl = null,
}: {
  children: ReactNode;
  blog?: string;
  title?: string;
  postDescription?: string | null;
  imageUrl?: string | null;
}) {
  const basePath = (publicRuntimeConfig && publicRuntimeConfig.basePath) || "";
  const pageTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const description = postDescription
    ? postDescription
    : "エンジニア・プログラマーNawashiroの個人サイト。プロジェクト、デジタルガーデン、技術ブログなど。";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const ogImageUrl = imageUrl
    ? imageUrl
    : `https://vercel-og-nextjs-4iakfhvyx-yineleyici.vercel.app/api/og?title=${encodeURIComponent(
        title ? title : siteTitle,
      )}`;

  const handleKofiReady = () => {
    if (!window.kofiWidgetOverlay) return;
    window.kofiWidgetOverlay.draw("nawashiro", {
      type: "floating-chat",
      "floating-chat.donateButton.text": "Support me",
      "floating-chat.donateButton.background-color": "#48731d",
      "floating-chat.donateButton.text-color": "#fff",
    });
  };

  return (
    <div className="w-3xl mx-auto">
      <Script
        src="https://storage.ko-fi.com/cdn/scripts/overlay-widget.js"
        strategy="afterInteractive"
        onLoad={handleKofiReady}
      />
      <Head>
        <link rel="icon" href={`${basePath}/favicon.ico`} />
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <meta property="og:type" content={blog ? "article" : "website"} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta
          property="og:url"
          content={siteUrl + (blog ? `/posts/${blog}` : "")}
        />
        <meta property="og:site_name" content={siteTitle} />
        <meta property="og:image" content={ogImageUrl} />
        {imageUrl && (
          <>
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
          </>
        )}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@yineleyici" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImageUrl} />
        {blog && <link rel="canonical" href={`${siteUrl}/posts/${blog}`} />}
      </Head>
      <header className="sticky top-0 z-30 border-b border-accent bg-base-100/80 backdrop-blur">
        <div className="navbar mx-auto max-w-6xl px-4 py-3">
          <div className="navbar-start">
            <Link
              className="text-xl font-black tracking-[0.2em] text-base-content"
              href="/"
            >
              {name}
            </Link>
          </div>
          <nav className="navbar-center hidden lg:flex" aria-label="Primary">
            <ul className="menu menu-horizontal gap-2 rounded-full bg-base-200/80 px-4 py-1 text-sm font-medium">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/posts/projects-index">Projects</Link>
              </li>
              <li>
                <Link href="/posts/links">Links</Link>
              </li>
              <li>
                <Link href="/posts/support-me">Support me!</Link>
              </li>
              <li>
                <a href="https://github.com/nawashiro">GitHub</a>
              </li>
            </ul>
          </nav>
          <div className="navbar-end lg:hidden">
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost gap-2">
                <MdMenu size={22} />
                <span className="text-xs tracking-[0.2em]">MENU</span>
              </label>
              <ul
                tabIndex={0}
                className="menu dropdown-content mt-3 w-56 rounded-box bg-base-100 p-2 shadow-soft"
              >
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li>
                  <Link href="/posts/projects-index">Projects</Link>
                </li>
                <li>
                  <Link href="/posts/links">Links</Link>
                </li>
                <li>
                  <Link href="/posts/support-me">Support me!</Link>
                </li>
                <li>
                  <a href="https://github.com/nawashiro">GitHub</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10">
        {children}
        {blog && (
          <div className="mt-16">
            <Link className="btn btn-link gap-2 px-0" href="/">
              <MdWest size={16} />
              Back to Home
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
