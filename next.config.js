/**
 * @type {import('next').NextConfig}
 */
repoName = process.env.GITHUB_ACTIONS && "/nextjs-blog-learn";
module.exports = {
  basePath: repoName,
  assetPrefix: repoName,
  trailingSlash: true,
  publicRuntimeConfig: {
    basePath: repoName,
  },
};
