/**
 * @type {import('next').NextConfig}
 */

const withOptimizedImages = require("next-optimized-images");

const reponeme = "/nextjs-blog-learn";

module.exports = withOptimizedImages({
  basePath: process.env.GITHUB_ACTIONS && reponeme,
  assetPrefix: process.env.GITHUB_ACTIONS && reponeme,
  trailingSlash: true,
  handleImages: ["jpg"],
  images: {
    unoptimized: true,
  },
});
