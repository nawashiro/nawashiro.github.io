/**
 * @type {import('next').NextConfig}
 */
module.exports = {
  basePath: process.env.GITHUB_ACTIONS && "/repository_name",
  trailingSlash: true,
};
