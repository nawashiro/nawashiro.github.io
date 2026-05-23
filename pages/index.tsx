import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import {
  getSortedPostsData,
  getIndexPagesData,
  getVersion,
  type PostMeta,
} from "../lib/posts";
import Link from "next/link";
import Date from "../components/date";
import type { GetStaticProps } from "next";
import { FaArrowRight } from "react-icons/fa";
import SectionLayout from "../components/sectionLayout";

type HomeProps = {
  allPostsData: PostMeta[];
  indexPagesData: PostMeta[];
  version: string;
};

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const allPostsData = getSortedPostsData();
  const indexPagesData = getIndexPagesData();
  const version = getVersion();

  return {
    props: {
      allPostsData,
      indexPagesData,
      version,
    },
  };
};

export default function Home({
  allPostsData,
  indexPagesData,
  version,
}: HomeProps) {
  const note = "I am a freelance programmer. looking for a job.";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const description =
    "エンジニア・プログラマーNawashiroの個人サイト。プロジェクト、デジタルガーデン、技術記事など。";

  return (
    <Layout>
      <a
        rel="me"
        href="https://gamelinks007.net/@nawashiro"
        style={{ display: "none" }}
      ></a>
      <a
        rel="me"
        href="https://github.com/nawashiro"
        style={{ display: "none" }}
      >
        github.com/nawashiro
      </a>
      <link rel="pgpkey" href="/openpgp_publickey.asc" style={{ display: "none" }} />
      <div className="h-card" style={{ display: "none" }}>
        <a className="p-name u-url" href={siteUrl}>
          Nawashiro
        </a>
        <span className="p-note">{note}</span>
      </div>
      <Head>
        <title>{siteTitle}</title>
        <meta name="description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={description} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: siteTitle,
            url: siteUrl,
            description: description,
            author: {
              "@type": "Person",
              name: "Nawashiro",
              url: siteUrl,
            },
          })}
        </script>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="RSS 2.0"
          href="/rss/feed.xml"
        />
        <link
          rel="alternate"
          type="application/atom+xml"
          title="Atom 1.0"
          href="/rss/atom.xml"
        />
        <link
          rel="alternate"
          type="application/json"
          title="JSON Feed"
          href="/rss/feed.json"
        />
      </Head>
      <SectionLayout className="pb-20">
        <section className="hero">
          <div className="w-full space-y-3">
            <h1
              className="my-0 text-3xl font-black text-success tracking-[0.2rem] md:text-6xl"
              data-testid="hero-title"
            >
              NAWASHIRO
            </h1>
            <div>
              <p className="space-x-2 my-0">
                <span>{note}</span>
                <span>
                  <Link
                    href="/posts/links"
                    className="btn btn-outline btn-sm h-auto"
                  >
                    Recruit?
                  </Link>
                </span>
              </p>
              <p className="my-0">
                Website version <code>{version}</code>.
              </p>
            </div>
            <div className="join">
              <span className="btn join-item btn-success no-animation cursor-default btn-active">
                Follow <FaArrowRight />
              </span>
              <a
                className="btn join-item"
                href="/rss/feed.xml"
                target="_blank"
                rel="noopener noreferrer"
                title="RSS Feed"
              >
                RSS
              </a>
              <a
                className="btn join-item"
                href="/rss/atom.xml"
                target="_blank"
                rel="noopener noreferrer"
                title="Atom Feed"
              >
                Atom
              </a>
              <a
                className="btn join-item"
                href="/rss/feed.json"
                target="_blank"
                rel="noopener noreferrer"
                title="JSON Feed"
              >
                JSON
              </a>
            </div>
          </div>
        </section>
      </SectionLayout>
      <SectionLayout className="bg-accent text-accent-content pb-12">
        <section>
          <h2>About</h2>
          <p>ここはNawashiroのデジタルガーデンです。</p>
          <p>
            「関連項目」や「バックリンク」を頼りにサイトを探索してみてください
            <img
              src="https://emoji-route.deno.dev/gif/👀"
              alt="👀"
              className="twemoji"
            />
          </p>
          <h3>注意</h3>
          <p>だいたいは個人的なメモで、不完全なもの。悪い例 👇 </p>

          <div className="chat chat-start">
            <div className="chat-image avatar">
                😰
            </div>
            <div className="chat-bubble">
              すべてをすぐに正しくしなければならない
            </div>
          </div>
          <div className="chat chat-end">
            <div className="chat-image avatar">
                🤩
            </div>
            <div className="chat-bubble">
              インターネットに書いてあることはぜんぶ本当なんだ！
            </div>
          </div>
          <p>
            信頼できる情報源を見たり、
            <Link className="underline" href="/posts/links">
              連絡してみたり
            </Link>
            してください。
          </p>
        </section>
      </SectionLayout>
      <SectionLayout>
        <section>
          <h2>Categories</h2>
          <ul className="space-y-3">
            {indexPagesData.map(({ id, title }) => (
              <li key={id}>
                <Link className="link link-hover text-lg" href={`/posts/${id}`}>
                  {title}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>All Pages</h2>
          <ul className="h-feed hfeed space-y-3">
            {allPostsData.map(({ id, date, title }) => (
              <li className="h-entry hentry" key={id}>
                <Link
                  className="link link-hover text-lg u-url p-name entry-title"
                  href={`/posts/${id}`}
                >
                  {title}
                </Link>
                <p className="text-sm text-base">
                  <Date dateString={date} />
                </p>
              </li>
            ))}
          </ul>
        </section>
      </SectionLayout>
    </Layout>
  );
}
