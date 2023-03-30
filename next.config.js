/**
 * @type {import('next').NextConfig}
 */

const reponeme = "/nextjs-blog-learn";

module.exports = {
  basePath: process.env.GITHUB_ACTIONS && reponeme,
  assetPrefix: process.env.GITHUB_ACTIONS && reponeme,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};
