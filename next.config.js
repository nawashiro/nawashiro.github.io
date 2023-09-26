/**
 * @type {import('next').NextConfig}
 */
repoName = process.env.GITHUB_ACTIONS && "/nawashiro.github.io";
module.exports = {
  basePath: repoName,
  assetPrefix: repoName,
  trailingSlash: true,
  publicRuntimeConfig: {
    basePath: repoName,
  },
};
