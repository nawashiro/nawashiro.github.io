import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import {
  getPostNetworkData,
  getSortedPostsData,
  getIndexPagesData,
  getVersion,
} from "../lib/posts";
import Link from "next/link";
import Date from "../components/date";
import indexStyle from "../styles/index.module.css";
import NetworkGraph from "../components/network_graph";

export async function getStaticProps() {
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
}

export default function Home({
  allPostsData,
  networkData,
  indexPagesData,
  version,
}) {
  return (
    <Layout>
      <a rel="me" href="https://gamelinks007.net/@nawashiro" style={{ display: "none" }}></a>
      <a href="https://github.com/nawashiro" rel="me" style={{ display: "none" }}>github.com/nawashiro</a>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={indexStyle.hero}>
        <p className={indexStyle.heroA}>
          <span>D</span>
          <span>e</span>
          <span>v</span>
          <span>e</span>
          <span>l</span>
          <span>o</span>
          <span>p</span>
          <span>m</span>
          <span>e</span>
          <span>n</span>
          <span>t</span>
        </p>
        <div className={indexStyle.herotext}>
          <p>
            I am a freelance programmer. looking for a job.
            <br />
            website version {version}.
          </p>
        </div>
      </section>

      <section>
        <div className={indexStyle.card}>
          <div className={indexStyle.imgWrap}>
            <img src="/images/code.webp" alt="ハッカソンのために書いたコード" />
          </div>
          <div className={indexStyle.innerCard}>
            <div>
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
      </section>

      <section>
        <h2 className={indexStyle.h2}>About</h2>
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
          <Link href="/posts/links">各種SNSへのリンクを載せておきます</Link>。
        </p>
      </section>

      <section>
        <h2 className={indexStyle.h2}>Graph</h2>
        <p>
          各ページの相互関係をグラフに出力しています。ノードをダブルクリックするとページを開くことができます。拡大縮小したり、ぐりぐりとノードを移動させたりして遊んでみてください。
        </p>
        <NetworkGraph networkData={networkData} height={"500px"} />
      </section>

      <section>
        <h2 className={indexStyle.h2}>Index</h2>
        <ul className={utilStyles.list}>
          {indexPagesData.map(({ id, title }) => (
            <li className={utilStyles.listItem} key={id}>
              <Link className={utilStyles.link} href={`/posts/${id}`}>
                {title}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className={indexStyle.h2}>All Pages</h2>
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
