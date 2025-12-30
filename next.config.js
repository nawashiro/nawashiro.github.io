/** @type {import('next').NextConfig} */
require("ts-node/register/transpile-only");

const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer && process.env.NODE_ENV === "production") {
      // サーバーサイドのビルド時にRSSフィードを生成
      const { runServerBuildTasks } = require("./lib/posts");
      class RssFeedPlugin {
        apply(compiler) {
          compiler.hooks.beforeRun.tapPromise(
            "RssFeedPlugin",
            async () => {
              await runServerBuildTasks();
            }
          );
        }
      }
      config.plugins = config.plugins || [];
      config.plugins.push(new RssFeedPlugin());
    }
    return config;
  },
};

module.exports = nextConfig;
