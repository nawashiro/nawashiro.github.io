/**
 * @type {import('next').NextConfig}
 */

const isProd = process.env.NODE_ENV === "production";
const repositoryName = "/nextjs-blog-learn";

module.exports = {
  basePath: process.env.GITHUB_ACTIONS && repositoryName,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  assetPrefix: isProd ? "https://nwsr.f5.si/" + repositoryName : "",
};
