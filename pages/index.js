import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import { getSortedPostsData } from "../lib/posts";
import Link from "next/link";
import Date from "../components/date";
import indexStyle from "../styles/index.module.css";
import cx from "classnames";

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  return {
    props: {
      allPostsData,
    },
  };
}

export default function Home({ allPostsData }) {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={indexStyle.hero}>
        <p className={indexStyle.heroA}>Development</p>
        <div className={indexStyle.heroB}>
          <p>Distributed social networking</p>
          <p>Social VR</p>
          <p>Travel</p>
        </div>
      </section>

      <section>
        <div className={indexStyle.card}>
          <div className={indexStyle.imgWrap}>
            <img src="/images/code.webp" />
          </div>
          <div className={indexStyle.innerCard}>
            <div>
              <h2>Development</h2>
              <p>
                <a href="https://join.misskey.page/">Misskey</a>
                の投稿を読み上げるWebクライアントを作成中です。
                <br />
                Chromeでのみ動作を確認しています。
              </p>
              <div>
                <a
                  className={indexStyle.cardLink}
                  href="https://nawashiro.github.io/ashiga-kayui/"
                >
                  テスト版を開く
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className={indexStyle.card}>
          <div className={indexStyle.imgWrap}>
            <img src="/images/nostr.webp" />
          </div>
          <div className={cx(indexStyle.innerCard, indexStyle.leftCard)}>
            <div>
              <h2>Distributed social networking</h2>
              <p>
                分散型SNSが好きでいろいろ調べています。
                <br />
                <a href="https://www.w3.org/TR/activitypub/">ActivityPub</a>、
                <a href="https://nostr.com/">Nostr</a>、
                <a href="https://atproto.com/">ATProtocol</a>
                など、いくつかの試みがあります。
              </p>
            </div>
          </div>
        </div>

        <div className={indexStyle.card}>
          <div className={indexStyle.imgWrap}>
            <img src="/images/social-vr.webp" />
          </div>
          <div className={indexStyle.innerCard}>
            <div>
              <h2>Social VR</h2>
              <p>
                よく<a href="https://hello.vrchat.com/">VRChat</a>や
                <a href="https://cluster.mu/">cluster</a>にいます。
                <br />
                SNSにまつわる技術について雑談する「分散SNS集会」を主催しています。
              </p>
            </div>
          </div>
        </div>

        <div className={indexStyle.card}>
          <div className={indexStyle.imgWrap}>
            <img src="/images/nagashima.webp" />
          </div>
          <div className={cx(indexStyle.innerCard, indexStyle.leftCard)}>
            <div>
              <h2>Travel</h2>
              <p>
                旅が好きです。たまに鉄道で旅行に行きます。
                <br />
                これは静岡県榛原郡の
                <a href="https://www.cbr.mlit.go.jp/nagashima/">長島ダム</a>
                に行った時の写真です。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className={indexStyle.h2}>Blog</h2>
        <ul className={utilStyles.list}>
          {allPostsData.map(({ id, date, title }) => (
            <li className={utilStyles.listItem} key={id}>
              <Link className={utilStyles.link} href={`/posts/${id}`}>
                {title}
              </Link>
              <br />
              <p className={utilStyles.lightText}>
                <Date dateString={date} />
              </p>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}
