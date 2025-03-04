import fs from "fs";
import path from "path";
import matter from "gray-matter";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { unified } from "unified";
import remarkCodeTitles from "remark-flexible-code-titles";
import remarkPrism from "remark-prism";
import remarkLinkCard from "remark-link-card";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Feed } from "feed";

const postsDirectory = path.join(process.cwd(), "posts");

// 共通の関数を抽出
function getPostBasicData(fileName) {
  const id = fileName.replace(/\.md$/, "");
  const fullPath = path.join(postsDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const matterResult = matter(
    fileContents.replaceAll(/(\[.+?\]\([a-z0-9\-]+)\.md(\))/g, "$1$2")
  );

  return {
    id,
    fileContents,
    matterResult,
  };
}

export function getSortedPostsData() {
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

export function getPostNetworkData() {
  const fileNames = fs.readdirSync(postsDirectory);
  const postsMap = new Map();

  // 最初にすべてのポストデータを取得
  fileNames.forEach((fileName) => {
    const { id, fileContents, matterResult } = getPostBasicData(fileName);
    const groupId = detectGroupId(fileName, fileContents);

    postsMap.set(id, {
      node: {
        id,
        label: matterResult.data.title,
        group: groupId,
        value: 0,
      },
      links: [...fileContents.matchAll(/\[.+?\]\(([a-z0-9\-]+)\.md\)/g)].map(
        (matchText) => matchText[1]
      ),
    });
  });

  // エッジの構築とノードの値の更新
  const edges = [];
  postsMap.forEach((post, id) => {
    post.links.forEach((link) => {
      edges.push({ from: id, to: link });
      // 両方のノードの値を更新
      if (postsMap.has(id)) {
        postsMap.get(id).node.value++;
      }
      if (postsMap.has(link)) {
        postsMap.get(link).node.value++;
      }
    });
  });

  return {
    nodes: Array.from(postsMap.values()).map((post) => post.node),
    edges,
  };
}

// detectGroupIdのスペルミスを修正
function detectGroupId(fileName, fileContents) {
  if (fileName.match("index")) return "index";
  if (fileContents.match(/(?<!https?:\/\/.+)\.js/i)) return "javascript";
  if (fileContents.match(/(?<!https?:\/\/.+)sns/i)) return "sns";
  if (fileContents.match(/(?<!https?:\/\/.+)isbn/i)) return "book";
  return "none";
}

export function getIndexPagesData() {
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

export async function getPostData(id) {
  const { matterResult: matterResult } = getPostBasicData(`${id}.md`);

  const contentHtml = await unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkLinkCard)
    .use(remarkCodeTitles)
    .use(remarkPrism)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeKatex, { output: "mathml" })
    .use(rehypeStringify)
    .process(matterResult.content)
    .then((processed) => processed.toString());

  // バックリンクの取得を効率化
  const backLinks = fs
    .readdirSync(postsDirectory)
    .map((fileName) => getPostBasicData(fileName))
    .filter(({ fileContents }) =>
      fileContents.match(new RegExp(`\\[.+?\\]\\(${id}\\.md\\)`))
    )
    .map(({ id, matterResult }) => ({
      title: matterResult.data.title,
      id: id,
    }));

  return {
    id,
    contentHtml,
    ...matterResult.data,
    backLinks,
  };
}

// 記事の概要を生成する関数を追加
function generateExcerpt(content, maxLength = 200) {
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
    const excerpt = generateExcerpt(postData.contentHtml);
    const url = `${siteURL}/posts/${post.id}`;

    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      description: excerpt,
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
