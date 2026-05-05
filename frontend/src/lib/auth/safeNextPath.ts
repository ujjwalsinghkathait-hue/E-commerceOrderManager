/**
 * Returns a same-origin path for post-login redirects. Rejects protocol-relative
 * and external URLs.
 */
export function getSafeNextPath(raw: string | null | undefined): string {
  if (!raw) {
    return "/";
  }
  const t = raw.trim();
  if (!t.startsWith("/") || t.startsWith("//")) {
    return "/";
  }
  return t;
}
