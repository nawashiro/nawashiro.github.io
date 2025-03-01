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

const postsDirectory = path.join(process.cwd(), "posts");

// 共通の関数を抽出
function getPostBasicData(fileName) {
  const id = fileName.replace(/\.md$/, "");
  const fullPath = path.join(postsDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const matterResult = matter(fileContents);
  
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
      links: [...fileContents.matchAll(/\[.+?\]\(([a-z0-9\-]+)\.md\)/g)]
        .map(matchText => matchText[1])
    });
  });

  // エッジの構築とノードの値の更新
  const edges = [];
  postsMap.forEach((post, id) => {
    post.links.forEach(link => {
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
    nodes: Array.from(postsMap.values()).map(post => post.node),
    edges
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

export function getNeighborNetworkData(id) {
  const { nodes: allNodes, edges: allEdges } = getPostNetworkData();
  const nodes = new Set();
  
  function exploreNeighbors(neighborId, limit) {
    if (limit < 0) return;
    
    const node = allNodes.find(n => n.id === neighborId);
    if (!node || nodes.has(node)) return;
    
    nodes.add(node);
    
    allEdges.forEach(edge => {
      if (edge.from === neighborId) exploreNeighbors(edge.to, limit - 1);
      if (edge.to === neighborId) exploreNeighbors(edge.from, limit - 1);
    });
  }

  // ハイライト処理を最初に行う
  const highlightedNodes = allNodes.map(node => 
    node.id === id ? { ...node, group: "highlight" } : node
  );
  
  exploreNeighbors(id, 2);
  
  return {
    nodes: Array.from(nodes),
    edges: allEdges
  };
}

export function getIndexPagesData() {
  const fileNames = fs.readdirSync(postsDirectory)
    .filter(fileName => /-index.md$/.test(fileName));
  
  const indexPosts = fileNames.map(fileName => {
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
  const { fileContents: rawContents, matterResult } = getPostBasicData(`${id}.md`);
  const fileContents = rawContents.replaceAll(/(\[.+?\]\([a-z0-9\-]+)\.md(\))/g, "$1$2");

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
    .then(processed => processed.toString());

  // バックリンクの取得を効率化
  const backLinks = fs.readdirSync(postsDirectory)
    .map(fileName => getPostBasicData(fileName))
    .filter(({ fileContents }) => 
      fileContents.match(new RegExp(`\\[.+?\\]\\(${id}\\.md\\)`)))
    .map(({ id, matterResult }) => ({
      title: matterResult.data.title,
      id: id
    }));

  return {
    id,
    contentHtml,
    ...matterResult.data,
    backLinks,
  };
}
