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
      <a rel="me" href="https://gamelinks007.net/@nawashiro"></a>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={indexStyle.hero}>
        <p className={indexStyle.heroA}>Development</p>
        <div className={indexStyle.heroB}>
          <p>
            Distributed social networking
            <br />
            Social VR
            <br />
            Travel
          </p>
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
                エンジニア集会ハッカソンにて
                <a href="https://nostr.com/">Nostrプロトコル</a>
                のWebクライアント「NosHagaki」を開発しました。ユーザーにバーチャルな住所を割り当てることにより、時間がかかるやり取りを実現しています。
              </p>
              <div>
                <a
                  className={indexStyle.cardLink}
                  href="https://nos-hagaki.vercel.app/"
                >
                  NosHagakiを開く
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
                相互運用可能なSNSにまつわる技術について情報交換する「分散SNS集会」を主催しています。
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
        <h2 className={indexStyle.h2}>About</h2>
        <p>
          ここはNawashiroのデジタルガーデンです。一般的なブログと違うのは、ページを互いにリンクしたり、ときにはインデックスしたりなど、手作業でキュレーションしているところです。
        </p>
        <p>
          各ページにはときに「関連項目」や「バックリンク」が含まれており、ページ間の相互関係を知り、参照することができます。ブログに慣れていると時系列順に参照したくなりますが、ここではその衝動を抑えて、相互関係を頼りに参照してみてください。
        </p>
      </section>

      <section>
        <h2 className={indexStyle.h2}>Index</h2>
        <ul className={utilStyles.list}>
          <li className={utilStyles.listItem}>
            <Link
              className={utilStyles.link}
              href={`/posts/20241209-develop-index`}
            >
              🔧技術 - インデックス
            </Link>
          </li>
          <li className={utilStyles.listItem}>
            <Link
              className={utilStyles.link}
              href={`/posts/20241209-book-reading-memo-index`}
            >
              📚感想 - インデックス
            </Link>
          </li>
          <li className={utilStyles.listItem}>
            <Link
              className={utilStyles.link}
              href={`/posts/20241209-socialmedia-index`}
            >
              📱ソーシャルメディア - インデックス
            </Link>
          </li>
          <li className={utilStyles.listItem}>
            <Link
              className={utilStyles.link}
              href={`/posts/20241209-scribble-index`}
            >
              ✒️落書き - インデックス
            </Link>
          </li>
        </ul>
      </section>

      <section>
        <h2 className={indexStyle.h2}>Pages</h2>
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
