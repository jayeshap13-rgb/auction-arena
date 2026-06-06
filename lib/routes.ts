export function withBasePath(path: string) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  if (!basePath || path.startsWith(basePath)) return path;
  return `${basePath}${path.startsWith("/") ? path : `/${path}`}`;
}

export function absoluteAppUrl(path: string) {
  if (typeof window === "undefined") return withBasePath(path);
  return `${window.location.origin}${withBasePath(path)}`;
}

