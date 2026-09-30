import { getAllPostIds, getPostData } from "fixture-production-posts";

// Next invokes the real article pipeline during static generation, not a test stub.
export function getStaticPaths() {
  return { paths: getAllPostIds(), fallback: false };
}

export async function getStaticProps({ params }) {
  return { props: { post: await getPostData(params.id) } };
}

export default function Post({ post }) {
  return <article dangerouslySetInnerHTML={{ __html: post.contentHtml }} />;
}
