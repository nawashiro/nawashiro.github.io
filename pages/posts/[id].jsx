import Layout from "../../components/layout";
import { getAllPostIds, getPostData } from "../../lib/posts";
import Head from "next/head";
import Date from "../../components/date";
import utilStyles from "../../styles/utils.module.css";
import cx from "classnames";
import Link from "next/link";

export async function getStaticProps({ params }) {
  // Add the "await" keyword like this:
  const postData = await getPostData(params.id);

  return {
    props: {
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
  return (
    <Layout title={postData.title}>
      <Head>
        <title>{postData.title}</title>
      </Head>
      <article>
        <h1>{postData.title}</h1>
        <div className={cx(utilStyles.lightBlogText, utilStyles.lightText)}>
          <Date dateString={postData.date} />
        </div>
        <div
          className={"blog"}
          dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
        />
        {postData.backLinks.length > 0 && (
          <>
            <h2>バックリンク</h2>
            <ul>
              {postData.backLinks.map(({ id, title }) => (
                <li key={id}>
                  <Link href={id}>{title}</Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </article>
    </Layout>
  );
}
