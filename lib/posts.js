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

export function getSortedPostsData() {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, "");

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the id
    return {
      id,
      ...matterResult.data,
    };
  });
  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getPostNetworkData() {
  const fileNames = fs.readdirSync(postsDirectory);

  // Get Graph Data
  let nodes = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, "");

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // グループIDを取得
    const groupId = ditectGroupId(fileName, fileContents);

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the id
    return {
      id: id,
      label: matterResult.data.title,
      group: groupId,
      value: 0,
    };
  });

  let edges = [];
  fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, "");

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    const links = [
      ...fileContents.matchAll(/\[.+?\]\(([a-z0-9\-]+)\.md\)/g),
    ].map((matchText) => {
      return matchText[1];
    });

    // Combine the data with the id
    links.map((link) => {
      edges = [
        ...edges,
        {
          from: id,
          to: link,
        },
      ];
      nodes = nodes.map((node) => {
        if (node["id"] == id || node["id"] == link) {
          return {
            ...node,
            value: node["value"] + 1,
          };
        } else {
          return node;
        }
      });
    });
  });

  return { nodes: nodes, edges: edges };
}

export function getNeighborNetworkData(id) {
  const allNetwork = getPostNetworkData();
  const allNodes = allNetwork["nodes"].map((node) => {
    if (node["id"] == id) {
      return { ...node, group: "highlight" };
    } else {
      return node;
    }
  }); // 自分のノードにハイライトを加えておく。再帰関数内でやると参照が異なり、後で重複を消すときに困る。
  const allEdges = allNetwork["edges"];

  let nodes = [];

  function neighborNetworkExplore(neighborid, limit) {
    let newnode;

    allNodes.map((oldnode) => {
      if (oldnode["id"] == neighborid) {
        newnode = oldnode;
      }
    });

    nodes = [...nodes, newnode];

    if (limit <= 0) {
      return;
    }

    allEdges.map((alledge) => {
      if (alledge["from"] == neighborid) {
        neighborNetworkExplore(alledge["to"], limit - 1);
      }
      if (alledge["to"] == neighborid) {
        neighborNetworkExplore(alledge["from"], limit - 1);
      }
    });
  }

  neighborNetworkExplore(id, 2);

  console.log(nodes);

  return { nodes: Array.from(new Set(nodes)), edges: allEdges };
}

function ditectGroupId(fileName, fileContents) {
  let groupId = "none";
  if (fileName.match("index")) {
    groupId = "index";
  } else if (fileContents.match(/(?<!https?:\/\/.+)\.js/i)) {
    groupId = "javascript";
  } else if (fileContents.match(/(?<!https?:\/\/.+)sns/i)) {
    groupId = "sns";
  } else if (fileContents.match(/(?<!https?:\/\/.+)isbn/i)) {
    groupId = "book";
  }
  return groupId;
}

export function getIndexPagesData() {
  // Get file names under /posts
  const fileNames = fs
    .readdirSync(postsDirectory)
    .filter((fileName) => /-index.md$/.test(fileName));
  const allPostsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, "");

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the id
    return {
      id,
      ...matterResult.data,
    };
  });
  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
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
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs
    .readFileSync(fullPath, "utf8")
    .replaceAll(/(\[.+?\]\([a-z0-9\-]+)\.md(\))/g, "$1$2"); // 同じ階層の.mdファイルへのリンクから拡張子を削る

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await unified()
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
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  // 他の.mdファイルに自idが含まれていたとき配列に追加
  const fileNames = fs.readdirSync(postsDirectory);
  let backLinks = [];
  fileNames.map((fileName) => {
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const matterResult = matter(fileContents);
    if (fileContents.match(new RegExp("\\[.+?\\]\\(" + id + "\\.md\\)"))) {
      backLinks = [
        ...backLinks,
        {
          title: matterResult.data.title,
          id: fileName.replace(/\.md$/, ""),
        },
      ];
    }
  });

  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
    ...matterResult.data,
    backLinks,
  };
}
