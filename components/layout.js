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
export const siteTitle = "Next.js Sample Website";
const { publicRuntimeConfig } = getConfig();

export default function Layout({ children, home }) {
  const basePath = (publicRuntimeConfig && publicRuntimeConfig.basePath) || "";
  return (
    <div>
      <Head>
        <link rel="icon" href={`${basePath}/favicon.ico`} />
        <meta
          name="description"
          content="Learn how to build a personal website using Next.js"
        />
        <meta
          property="og:image"
          content={`https://og-image.vercel.app/${encodeURI(
            siteTitle
          )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
        />
        <meta name="og:title" content={siteTitle} />
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
            <MenuItem>
              <Link href={"/"}>Home</Link>
            </MenuItem>
            <MenuItem>
              <Link href={"/posts/projects"}>Projects</Link>
            </MenuItem>
            <MenuItem>
              <Link href={"/posts/links"}>Links</Link>
            </MenuItem>
            <MenuItem>
              <a href="https://github.com/nawashiro">GitHub</a>
            </MenuItem>
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
