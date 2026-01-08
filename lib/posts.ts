import fs from "fs";
import path from "path";
import matter, { type GrayMatterFile } from "gray-matter";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import { unified } from "unified";
import remarkCodeTitles from "remark-flexible-code-titles";
import remarkPrism from "remark-prism";
import remarkLinkCard from "remark-link-card";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Feed } from "feed";
import remarkMermaid from "remark-mermaidjs";
import remarkToc from "remark-toc";
import rehypeSlug from "rehype-slug";
import rehypeRaw from "rehype-raw";

const postsDirectory = path.join(process.cwd(), "posts");

type PostFrontMatter = {
  title: string;
  date: string;
  description?: string;
  image?: string;
  tags?: string[];
  [key: string]: unknown;
};

export type PostMeta = PostFrontMatter & {
  id: string;
};

export type NetworkNode = {
  id: string;
  label: string;
  group: string;
  value: number;
};

export type NetworkEdge = {
  from: string;
  to: string;
};

export type NetworkData = {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
};

export type BackLink = {
  title: string;
  id: string;
};

export type PostData = PostFrontMatter & {
  id: string;
  contentHtml: string;
  backLinks: BackLink[];
  imageUrl: string | null;
};

export const shouldEnableExternalFetch = () => {
  if (process.env.NODE_ENV === "test") return false;
  if (process.env.DISABLE_EXTERNAL_FETCH === "1") return false;
  if (process.env.NEXT_PUBLIC_DISABLE_EXTERNAL_FETCH === "1") return false;
  return true;
};

// 共通の関数を抽出
function getPostBasicData(fileName: string) {
  const id = fileName.replace(/\.md$/, "");
  const fullPath = path.join(postsDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const matterResult = matter(
    fileContents.replaceAll(/(\[.+?\]\([a-z0-9\-]+)\.md(\))/g, "$1$2"),
  ) as GrayMatterFile<string> & { data: PostFrontMatter };

  return {
    id,
    fileContents,
    matterResult,
  };
}

export function getSortedPostsData(): PostMeta[] {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    const { id, matterResult } = getPostBasicData(fileName);
    return {
      id,
      ...matterResult.data,
    };
  });

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostNetworkData(): NetworkData {
  const fileNames = fs.readdirSync(postsDirectory);
  const postsMap = new Map<string, { node: NetworkNode; links: string[] }>();

  // 最初にすべてのポストデータを取得
  fileNames.forEach((fileName) => {
    const { id, fileContents, matterResult } = getPostBasicData(fileName);
    const groupId = detectGroupId(fileName, fileContents);

    postsMap.set(id, {
      node: {
        id,
        label: String(matterResult.data.title),
        group: groupId,
        value: 0,
      },
      links: [...fileContents.matchAll(/\[.+?\]\(([a-z0-9\-]+)\.md\)/g)].map(
        (matchText) => matchText[1],
      ),
    });
  });

  // エッジの構築とノードの値の更新
  const edges: NetworkEdge[] = [];
  postsMap.forEach((post, id) => {
    post.links.forEach((link) => {
      edges.push({ from: id, to: link });
      // 両方のノードの値を更新
      const sourceNode = postsMap.get(id);
      if (sourceNode) {
        sourceNode.node.value += 1;
      }
      const targetNode = postsMap.get(link);
      if (targetNode) {
        targetNode.node.value += 1;
      }
    });
  });

  return {
    nodes: Array.from(postsMap.values()).map((post) => post.node),
    edges,
  };
}

// detectGroupIdのスペルミスを修正
function detectGroupId(fileName: string, fileContents: string) {
  if (fileName.match("index")) return "index";
  if (fileContents.match(/(?<!https?:\/\/.+)\.js/i)) return "javascript";
  if (fileContents.match(/(?<!https?:\/\/.+)sns/i)) return "sns";
  if (fileContents.match(/(?<!https?:\/\/.+)isbn/i)) return "book";
  return "none";
}

export function getIndexPagesData(): PostMeta[] {
  const fileNames = fs
    .readdirSync(postsDirectory)
    .filter((fileName) => /-index.md$/.test(fileName));

  const indexPosts = fileNames.map((fileName) => {
    const { id, matterResult } = getPostBasicData(fileName);
    return {
      id,
      ...matterResult.data,
    };
  });

  return indexPosts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory);

  // Returns an array that looks like this:
  // [
  //   {
  //     params: {
  //       id: 'ssg-ssr'
  //     }
  //   },
  //   {
  //     params: {
  //       id: 'pre-rendering'
  //     }
  //   }
  // ]
  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ""),
      },
    };
  });
}

export function getVersion() {
  const nowUTC = new Date().toISOString().slice(0, 10); // 0 UTC オフセット。日本時間ではない。
  return nowUTC;
}

export async function renderMarkdown(content: string): Promise<string> {
  const processor = unified()
    .use(remarkToc, {
      maxDepth: 3,
      heading: "TOC",
    })
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkLinkCard)
    .use(remarkCodeTitles)
    .use(remarkMermaid)
    .use(remarkPrism)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeKatex, { output: "mathml" })
    .use(rehypeStringify);

  if (shouldEnableExternalFetch()) {
    processor.use(remarkLinkCard);
  }

  return processor.process(content).then((processed) => processed.toString());
}

export function resolveOgImageUrl(
  imageUrl: string | null,
  siteUrl: string,
): string | null {
  if (!imageUrl) return null;
  if (!siteUrl) return imageUrl;

  try {
    const resolved = new URL(imageUrl, siteUrl);
    return resolved.toString();
  } catch {
    return imageUrl;
  }
}

export async function getPostData(id: string): Promise<PostData> {
  const { matterResult } = getPostBasicData(`${id}.md`);

  const contentHtml = await renderMarkdown(matterResult.content);

  // 画像URLを取得
  const imageMatch = matterResult.content.match(/!\[.*?\]\((.*?)\)/);
  const rawImageUrl = imageMatch ? imageMatch[1] : null;
  const imageUrl = resolveOgImageUrl(
    rawImageUrl,
    process.env.NEXT_PUBLIC_SITE_URL || "",
  );

  // バックリンクの取得
  const backLinks = fs
    .readdirSync(postsDirectory)
    .map((fileName) => getPostBasicData(fileName))
    .filter(({ fileContents }) =>
      fileContents.match(new RegExp(`\\[.+?\\]\\(${id}\\.md\\)`)),
    )
    .map(({ id, matterResult }) => ({
      title: String(matterResult.data.title),
      id: id,
    }));

  return {
    id,
    contentHtml,
    ...matterResult.data,
    backLinks,
    imageUrl,
  };
}

// 記事の概要を生成する関数を追加
function generateExcerpt(content: string, maxLength = 200) {
  // HTMLタグを除去
  const plainText = content.replace(/<[^>]+>/g, "");
  // 改行を空白に置換
  const singleLine = plainText.replace(/\n/g, " ").trim();
  // 指定された長さで切り取り、必要に応じて「...」を追加
  return singleLine.length <= maxLength
    ? singleLine
    : singleLine.slice(0, maxLength) + "...";
}

export async function generateRssFeed() {
  const posts = getSortedPostsData().slice(0, 10);
  const siteURL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const date = new Date();

  const author = {
    name: "Nawashiro",
    link: siteURL,
  };

  const feed = new Feed({
    title: "Nawashiro",
    description: "Nawashiroの個人サイト",
    id: siteURL,
    link: siteURL,
    language: "ja",
    favicon: `${siteURL}/favicon.ico`,
    copyright: `All rights reserved ${date.getFullYear()}, ${author.name}`,
    updated: date,
    generator: "Feed for Node.js",
    feedLinks: {
      rss2: `${siteURL}/rss/feed.xml`,
      json: `${siteURL}/rss/feed.json`,
      atom: `${siteURL}/rss/atom.xml`,
    },
    author,
  });

  for (const post of posts) {
    const postData = await getPostData(post.id);
    const url = `${siteURL}/posts/${post.id}`;

    feed.addItem({
      title: String(post.title),
      id: url,
      link: url,
      description: generateExcerpt(postData.contentHtml),
      content: postData.contentHtml,
      author: [author],
      date: new Date(post.date),
    });
  }

  // RSSフィードの出力ディレクトリを作成
  const rssDir = path.join(process.cwd(), "public", "rss");
  fs.mkdirSync(rssDir, { recursive: true });

  // 各フォーマットで出力
  fs.writeFileSync(path.join(rssDir, "feed.xml"), feed.rss2());
  fs.writeFileSync(path.join(rssDir, "atom.xml"), feed.atom1());
  fs.writeFileSync(path.join(rssDir, "feed.json"), feed.json1());
}

export async function runServerBuildTasks(
  generateRssFeedFn: () => Promise<void> = generateRssFeed,
) {
  await generateRssFeedFn();
}
