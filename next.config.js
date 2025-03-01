/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  webpack: (config, { isServer }) => {
    if (isServer) {
      // サーバーサイドのビルド時にRSSフィードを生成
      const { generateRssFeed } = require('./lib/posts');
      generateRssFeed();
    }
    return config;
  },
};

module.exports = nextConfig;
