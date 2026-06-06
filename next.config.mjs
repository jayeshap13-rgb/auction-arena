/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === "true";
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  basePath: isGithubPages && repoName ? `/${repoName}` : undefined,
  assetPrefix: isGithubPages && repoName ? `/${repoName}/` : undefined
};

export default nextConfig;
