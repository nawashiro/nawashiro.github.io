import Layout from "../../components/layout";
import {
  getAllPostIds,
  getPostData,
  getNeighborNetworkData,
} from "../../lib/posts";
import Head from "next/head";
import Script from "next/script";
import Date from "../../components/date";
import utilStyles from "../../styles/utils.module.css";
import cx from "classnames";
import Link from "next/link";
import NetworkGraph from "../../components/network_graph";

export async function getStaticProps({ params }) {
  // Add the "await" keyword like this:
  const id = params.id;
  const postData = await getPostData(id);
  const neighborNetwork = getNeighborNetworkData(id);

  return {
    props: {
      id,
      postData,
      neighborNetwork,
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

export default function Post({ id, postData, neighborNetwork }) {
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
        <div>
          <h2>Neighbor Graph</h2>
          <NetworkGraph height={"300px"} networkData={neighborNetwork} />
        </div>
        <div style={{ marginTop: "4rem" }}>
          <Script
            src="/webmention.min.js"
            data-max-webmentions="60"
            strategy="afterInteractive"
          />
          <div id="webmentions"></div>
        </div>
      </article>
    </Layout>
  );
}
