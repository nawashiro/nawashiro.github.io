/** @type {import('next').NextConfig} */
require("ts-node/register/transpile-only");

const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // サーバーサイドのビルド時にRSSフィードを生成
      const { generateRssFeed } = require("./lib/posts");
      generateRssFeed();
    }
    return config;
  },
};

module.exports = nextConfig;
