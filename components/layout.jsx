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

const name = "NAWASHIRO";
export const siteTitle = "NAWASHIRO";
const { publicRuntimeConfig } = getConfig();

export default function Layout({ children, home, title }) {
  const basePath = (publicRuntimeConfig && publicRuntimeConfig.basePath) || "";
  return (
    <div>
      <Head>
        <link rel="icon" href={`${basePath}/favicon.ico`} />
        <meta name="description" content="Nawashiroの個人サイト" />
        <meta
          property="og:image"
          content={`https://vercel-og-nextjs-4iakfhvyx-yineleyici.vercel.app/api/og?title=${encodeURI(
            title ? title : siteTitle
          )}`}
        />
        <meta name="og:title" content={title ? title : siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
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
                <Link href={"/posts/projects"}>Projects</Link>
              </li>
              <li>
                <Link href={"/posts/links"}>Links</Link>
              </li>
              <li>
                <a href={"https://github.com/nawashiro"}>GitHub</a>
              </li>
            </ul>
          </nav>
          <Menu
            menuButton={
              <MenuButton className={styles.menu}>
                <IconContext.Provider value={{ size: "36px" }}>
                  <MdMenu />
                </IconContext.Provider>
              </MenuButton>
            }
            transition
          >
            <Link href={"/"}>
              <MenuItem>Home</MenuItem>
            </Link>
            <Link href={"/posts/projects"}>
              <MenuItem>Projects</MenuItem>
            </Link>
            <Link href={"/posts/links"}>
              <MenuItem>Links</MenuItem>
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
          {!home && (
            <div className={styles.back}>
              <Link href="/">
                <IconContext.Provider value={{ size: "16px" }}>
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
