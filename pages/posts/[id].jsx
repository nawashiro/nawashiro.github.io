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

export default function Post({ id, postData }) {
  const isDevelopment = process.env.NODE_ENV === "development";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const canonicalUrl = `${siteUrl}/posts/${id}`;
  const publishedDate = postData.date;

  // 記事の先頭から説明文を抽出（HTMLタグを除去して最初の120文字）
  const description = postData.contentHtml
    ? postData.contentHtml.replace(/<[^>]*>/g, "").substring(0, 120) + "..."
    : `${postData.title} - Nawashiroのブログ記事`;

  return (
    <Layout title={postData.title} blog={id}>
      <Head>
        <title>{postData.title}</title>
        <meta name="description" content={description} />
        <meta property="article:published_time" content={publishedDate} />
        <meta property="article:author" content="Nawashiro" />
        {postData.tags &&
          postData.tags.map((tag) => (
            <meta property="article:tag" content={tag} key={tag} />
          ))}
        <link rel="canonical" href={canonicalUrl} />
        <link
          rel="webmention"
          href="https://webmention.io/nawashiro.dev/webmention"
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: postData.title,
            description: description,
            datePublished: publishedDate,
            dateModified: publishedDate,
            author: {
              "@type": "Person",
              name: "Nawashiro",
              url: siteUrl,
            },
            publisher: {
              "@type": "Person",
              name: "Nawashiro",
              url: siteUrl,
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": canonicalUrl,
            },
            url: canonicalUrl,
          })}
        </script>
      </Head>
      <article className="h-entry">
        <h1 className="p-name">{postData.title}</h1>
        <div className={cx(utilStyles.lightBlogText, utilStyles.lightText)}>
          <Date dateString={postData.date} />
        </div>
        <a
          className={cx("p-author", "h-card")}
          href={siteUrl}
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
