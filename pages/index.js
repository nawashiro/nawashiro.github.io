import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import { getSortedPostsData } from "../lib/posts";
import Link from "next/link";
import Date from "../components/date";

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
      <section>
        <p>Development</p>
        <p>Distributed social networking</p>
        <p>Social VR</p>
        <p>Travel</p>
      </section>

      <section>
        <div>
          <img src="/images/code.webp" />
          <div>
            <h2>Development</h2>
            <p>
              Misskeyの投稿を読み上げるWebクライアントを作成中です。Chromeでのみ動作を確認しています。
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2>Blog</h2>
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
