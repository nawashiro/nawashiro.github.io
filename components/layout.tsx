import getConfig from "next/config";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { FaHamburger, FaHome, FaGithub } from "react-icons/fa";
import { type ReactNode, useEffect } from "react";
import Script from "next/script";
import Twemoji from "react-twemoji";
import SectionLayout from "./sectionLayout";

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
  const router = useRouter();

  const handleKofiReady = () => {
    if (!window.kofiWidgetOverlay) return;
    window.kofiWidgetOverlay.draw("nawashiro", {
      type: "floating-chat",
      "floating-chat.donateButton.text": "チップをくれ",
      "floating-chat.donateButton.background-color": "#48731d",
      "floating-chat.donateButton.text-color": "#fff",
    });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const svgPanZoom = require("svg-pan-zoom");
    svgPanZoom(".panzoom svg", {
      controlIconsEnabled: true,
      contain: true,
    });
  }, [router.asPath]);

  return (
    <div>
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
      <header className="w-dvw md:w-full sticky top-0 z-30 border-b border-accent bg-base-100/80 backdrop-blur">
        <div className="navbar md:mx-auto max-w-3xl px-4 py-3">
          <div className="navbar-start">
            <Link className="text-xl font-black text-base-content" href="/">
              {name}
            </Link>
          </div>
          <nav
            className="navbar-end hidden lg:flex space-x-2"
            aria-label="Primary"
          >
            <ul className="menu menu-horizontal bg-base-200 rounded-box">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/posts/projects-index">Projects</Link>
              </li>
              <li>
                <Link href="/posts/links">Links</Link>
              </li>
            </ul>
            <a href="https://github.com/nawashiro">
              <FaGithub
                size={32}
                aria-label="GitHub"
                className="hover:animate-spin"
              />
            </a>
          </nav>
          <div className="navbar-end lg:hidden">
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost gap-2">
                <FaHamburger size={24} />
                <span>MENU</span>
              </label>
              <ul
                tabIndex={0}
                className="menu menu-lg w-32 dropdown-content mt-3 rounded-box bg-base-200 p-2 shadow-soft border-2 border-base-300"
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
                  <a href="https://github.com/nawashiro">GitHub</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>
      <main>
        <Twemoji options={{ className: "twemoji" }}>{children}</Twemoji>
        {blog && (
          <SectionLayout className="bg-accent pb-24">
            <Link
              className="underline text-accent-content text-base flex gap-2 px-0"
              href="/"
            >
              <FaHome className="size-6" />
              Back to Home
            </Link>
          </SectionLayout>
        )}
      </main>
    </div>
  );
}
