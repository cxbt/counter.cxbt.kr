const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const hasCustomDomain = Boolean(process.env.CUSTOM_DOMAIN);
const isProjectPages = Boolean(process.env.GITHUB_ACTIONS) && repo && !repo.endsWith(".github.io") && !hasCustomDomain;
const basePath = isProjectPages ? `/${repo}` : "";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
