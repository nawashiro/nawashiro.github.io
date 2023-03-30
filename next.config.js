/**
 * @type {import('next').NextConfig}
 */

const isProd = process.env.NODE_ENV === "production";
const basePath = process.env.GITHUB_ACTIONS && "/nextjs-blog-learn";

module.exports = {
  basePath: basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  assetPrefix: isProd ? basePath : "",
};
