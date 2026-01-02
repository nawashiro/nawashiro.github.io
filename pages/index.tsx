import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import {
  getPostNetworkData,
  getSortedPostsData,
  getIndexPagesData,
  getVersion,
  type NetworkData,
  type PostMeta,
} from "../lib/posts";
import Link from "next/link";
import Date from "../components/date";
import NetworkGraph from "../components/network_graph";
import type { GetStaticProps } from "next";

type HomeProps = {
  allPostsData: PostMeta[];
  networkData: NetworkData;
  indexPagesData: PostMeta[];
  version: string;
};

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const allPostsData = getSortedPostsData();
  const networkData = getPostNetworkData();
  const indexPagesData = getIndexPagesData();
  const version = getVersion();
  return {
    props: {
      allPostsData,
      networkData,
      indexPagesData,
      version,
    },
  };
};

export default function Home({
  allPostsData,
  networkData,
  indexPagesData,
  version,
}: HomeProps) {
  const note = "I am a freelance programmer. looking for a job.";
  const heroLetters = "Development".split("");
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
      <link rel="pgpkey" href="/openpgp_publickey.asc" />
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
      <section className="hero">
        <div className="w-full space-y-3">
          <p className="text-3xl font-black tracking-[0.2rem] md:text-6xl">
            {heroLetters.map((letter, index) => (
              <span
                className="animate-pulse inline-block"
                key={`${letter}-${index}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {letter}
              </span>
            ))}
          </p>
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
              Follow me!
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

      <section>
        <h2>About</h2>
        <p>
          ここはNawashiroのデジタルガーデンです。一般的なブログと違うのは、ページを互いにリンクしたり、ときにはインデックスしたりなど、手作業でキュレーションしているところです。
        </p>
        <p>
          各ページにはときに「関連項目」や「バックリンク」が含まれており、ページ間の相互関係を知り、参照することができます。ブログに慣れていると時系列順に参照したくなりますが、ここではその衝動を抑えて、相互関係を頼りに参照してみてください。
        </p>
        <p>
          注意点として、
          <strong>デジタルガーデンでは不完全さが許容される</strong>
          ことを挙げておきます。書き手は「すべてをすぐに正しくしなければならない」というプレッシャーから解放されますが、読み手は「インターネットに書いてあることはぜんぶ本当なんだ……！」という思い込みを捨てなければなりません。
        </p>
        <p>
          しかし、ここでは前向きにとらえてください。私たちはアイデアをテストし、フィードバックを送りあって、意見を修正していくことができます。
          <Link className="link link-hover" href="/posts/links">
            各種SNSへのリンクを載せておきます
          </Link>
          。
        </p>
      </section>

      <section>
        <h2>Index</h2>
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
        <h2>Graph</h2>
        <p>
          各ページの相互関係をグラフに出力しています。ノードをダブルクリックするとページを開くことができます。拡大縮小したり、ぐりぐりとノードを移動させたりして遊んでみてください。
        </p>
        <NetworkGraph networkData={networkData} height={"500px"} />
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
              <p className="text-sm text-base-content/70">
                <Date dateString={date} />
              </p>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}
