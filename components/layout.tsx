import getConfig from "next/config";
import Head from "next/head";
import styles from "./layout.module.css";
import Link from "next/link";
import cx from "classnames";
import { MdMenu, MdWest } from "react-icons/md";
import { IconContext } from "react-icons";
import { Menu, MenuItem, MenuButton } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";
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
        title ? title : siteTitle
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
      <header>
        <div className={cx(styles.wrapContent, styles.wrapHeader)}>
          <h2 className={styles.name}>
            <Link href="/">{name}</Link>
          </h2>
          <nav className={styles.nav}>
            <ul>
              <li>
                <Link href={"/"}>Home</Link>
              </li>
              <li>
                <Link href={"/posts/projects-index"}>Projects</Link>
              </li>
              <li>
                <Link href={"/posts/links"}>Links</Link>
              </li>
              <li>
                <Link href={"/posts/support-me"}>Support me!</Link>
              </li>
              <li>
                <a href={"https://github.com/nawashiro"}>GitHub</a>
              </li>
            </ul>
          </nav>
          <Menu
            menuButton={
              <MenuButton className={styles.menu}>
                <IconContext.Provider value={{ size: "2rem" }}>
                  <MdMenu />
                </IconContext.Provider>
                <p>MENU</p>
              </MenuButton>
            }
            transition
            className={styles.menulist}
          >
            <Link href={"/"}>
              <MenuItem>Home</MenuItem>
            </Link>
            <Link href={"/posts/projects-index"}>
              <MenuItem>Projects</MenuItem>
            </Link>
            <Link href={"/posts/links"}>
              <MenuItem>Links</MenuItem>
            </Link>
            <Link href={"/posts/support-me"}>
              <MenuItem>Support me!</MenuItem>
            </Link>
            <a href="https://github.com/nawashiro">
              <MenuItem>github</MenuItem>
            </a>
          </Menu>
        </div>
      </header>
      <main>
        <div className={cx(styles.wrapMain, styles.wrapContent)}>
          {children}
          {blog && (
            <div className={styles.back}>
              <Link href="/">
                <IconContext.Provider value={{ size: "1rem" }}>
                  <MdWest className={styles.backArrow} />
                </IconContext.Provider>
                Back to Home
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
