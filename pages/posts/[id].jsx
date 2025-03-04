import Layout from "../../components/layout";
import { getAllPostIds, getPostData } from "../../lib/posts";
import Head from "next/head";
import Date from "../../components/date";
import utilStyles from "../../styles/utils.module.css";
import cx from "classnames";
import Link from "next/link";
import WebMention from "../../components/WebMention";

export async function getStaticProps({ params }) {
  const id = params.id;
  const postData = await getPostData(id);

  return {
    props: {
      id,
      postData,
    },
  };
}

export async function getStaticPaths() {
  const paths = getAllPostIds();
  return {
    paths,
    fallback: false,
  };
}

export default function Post({ postData }) {
  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <Layout title={postData.title} blog>
      <Head>
        <title>{postData.title}</title>
        <link
          rel="webmention"
          href="https://webmention.io/nawashiro.dev/webmention"
        />
      </Head>
      <article className="h-entry">
        <h1 className="p-name">{postData.title}</h1>
        <div className={cx(utilStyles.lightBlogText, utilStyles.lightText)}>
          <Date dateString={postData.date} />
        </div>
        <a
          className={cx("p-author", "h-card")}
          href="https://nawashiro.dev"
          style={{ display: "none" }}
        >
          Nawashiro
        </a>
        <div
          className={cx("blog", "e-content")}
          dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
        />
        {postData.backLinks.length > 0 && (
          <>
            <h2>Back Link</h2>
            <ul>
              {postData.backLinks.map(({ id, title }) => (
                <li key={id}>
                  <Link href={id}>{title}</Link>
                </li>
              ))}
            </ul>
          </>
        )}
        <WebMention
          {...(isDevelopment && {
            pageUrl:
              "https://nawashiro.dev/posts/20250213-3-create-stained-glass",
          })}
        />
      </article>
    </Layout>
  );
}
