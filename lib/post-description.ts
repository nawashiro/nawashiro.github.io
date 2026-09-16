export type PostDescriptionInput = {
  title: string;
  contentHtml: string;
  pSummary?: string;
};

export function resolvePostDescription(
  postData: PostDescriptionInput,
): string {
  if (postData.pSummary) return postData.pSummary;

  return postData.contentHtml
    ? postData.contentHtml.replace(/<[^>]*>/g, "").substring(0, 120) + "..."
    : `${postData.title} - Nawashiroのブログ記事`;
}
