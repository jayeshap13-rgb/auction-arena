/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === "true";
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];

const nextConfig = {
  reactStrictMode: true,
  output: isGithubPages ? "export" : undefined,
  images: {
    unoptimized: isGithubPages
  },
  trailingSlash: true,
  basePath: isGithubPages && repoName ? `/${repoName}` : undefined,
  assetPrefix: isGithubPages && repoName ? `/${repoName}/` : undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: isGithubPages && repoName ? `/${repoName}` : ""
  }
};

export default nextConfig;
