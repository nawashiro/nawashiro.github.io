import Layout from "../../components/layout";
import {
  getAllPostIds,
  getPostData,
  type PostData,
} from "../../lib/posts";
import Head from "next/head";
import Date from "../../components/date";
import utilStyles from "../../styles/utils.module.css";
import cx from "classnames";
import Link from "next/link";
import WebMention from "../../components/WebMention";
import type { GetStaticPaths, GetStaticProps } from "next";
import SectionLayout from "../../components/sectionLayout";

type PostParams = {
  id: string;
};

type PostProps = {
  id: string;
  postData: PostData;
};

export const getStaticProps: GetStaticProps<PostProps, PostParams> = async ({
  params,
}) => {
  if (!params) {
    return {
      notFound: true,
    };
  }

  const id = params.id;
  const postData = await getPostData(id);

  return {
    props: {
      id,
      postData,
    },
  };
};

export const getStaticPaths: GetStaticPaths<PostParams> = async () => {
  const paths = getAllPostIds();
  return {
    paths,
    fallback: false,
  };
};

export default function Post({ id, postData }: PostProps) {
  const isDevelopment = process.env.NODE_ENV === "development";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const canonicalUrl = `${siteUrl}/posts/${id}`;
  const publishedDate = postData.date;

  // 記事の先頭から説明文を抽出（HTMLタグを除去して最初の120文字）
  const description = postData.contentHtml
    ? postData.contentHtml.replace(/<[^>]*>/g, "").substring(0, 120) + "..."
    : `${postData.title} - Nawashiroのブログ記事`;

  return (
    <Layout
      title={postData.title}
      blog={id}
      postDescription={description}
      imageUrl={postData.imageUrl}
    >
      <Head>
        <title>{postData.title}</title>
        <meta property="article:published_time" content={publishedDate} />
        <meta property="article:author" content="Nawashiro" />
        {postData.tags &&
          postData.tags.map((tag) => (
            <meta property="article:tag" content={tag} key={tag} />
          ))}
        <link
          rel="webmention"
          href="https://webmention.io/nawashiro.dev/webmention"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
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
            }),
          }}
        ></script>
      </Head>

      <SectionLayout>
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
            className={cx(
              "blog",
              "e-content",
              "prose",
              "prose-stone",
              "max-w-none",
            )}
            dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
          />
        </article>
      </SectionLayout>

      <SectionLayout className="mt-16 bg-accent text-accent-content">
        <WebMention
          {...(isDevelopment && {
            pageUrl:
              "https://nawashiro.dev/posts/20250213-3-create-stained-glass",
          })}
        />

        <h2>☕コーヒーをおごる</h2>
        <p>やあ…そこのきみ…すまないが、コーヒーを一杯おごってくれないか…</p>
        <iframe
          id="kofiframe"
          src="https://ko-fi.com/nawashiro/?hidefeed=true&widget=true&embed=true&preview=true"
          height="712"
          title="nawashiroにコーヒーをおごる"
          className="rounded-sm mx-auto mt-10"
        ></iframe>

        {postData.backLinks.length > 0 && (
          <>
            <h2>バックリンク</h2>
            <ul>
              {postData.backLinks.map(({ id, title }) => (
                <li key={id} className="list-disc ml-8">
                  <Link href={id} className="underline text-accent-content">
                    {title}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

      </SectionLayout>
    </Layout>
  );
}
