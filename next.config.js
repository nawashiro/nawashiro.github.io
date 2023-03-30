/**
 * @type {import('next').NextConfig}
 */
repoName = "/nextjs-blog-learn";
module.exports = {
  basePath: process.env.GITHUB_ACTIONS && repoName,
  assetPrefix: process.env.GITHUB_ACTIONS && repoName,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },

  async rewrites() {
    return [
      {
        source: `${repoName}/api/:path*`,
        destination: "/api/:path*",
      },
      {
        source: `${repoName}/images/:query*`,
        destination: "/_next/image/:query*",
      },
      {
        source: `${repoName}/_next/:path*`,
        destination: "/_next/:path*",
      },
    ];
  },
};
