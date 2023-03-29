/**
 * @type {import('next').NextConfig}
 */
module.exports = {
  basePath: process.env.GITHUB_ACTIONS && "/nextjs-blog-learn",
  trailingSlash: true,
};
