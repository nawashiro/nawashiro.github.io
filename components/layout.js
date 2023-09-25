import getConfig from "next/config";
import Head from "next/head";
import styles from "./layout.module.css";
import Link from "next/link";
import cx from "classnames";
import { MdMenu } from "react-icons/md";
import { IconContext } from "react-icons";

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
          <button className={styles.menu}>
            <IconContext.Provider value={{ size: "36px" }}>
              <MdMenu />
            </IconContext.Provider>
          </button>
        </div>
      </header>
      <main>
        <div className={cx(styles.wrapMain, styles.wrapContent)}>
          {children}
          {!home && (
            <div className={styles.back}>
              <Link href="/">← Back to Home</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
