/**
 * Hostnames allowed to use `next/image` optimization. Extend via
 * `NEXT_PUBLIC_IMAGE_HOSTS` (comma-separated) in `.env`.
 */
const DEFAULT_HOSTS = [
  "images.unsplash.com",
  "picsum.photos",
  "placehold.co",
  "lh3.googleusercontent.com",
];

export function getAllowedImageHostnames(): string[] {
  const env =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_IMAGE_HOSTS?.split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean) ?? []
      : [];
  return [...new Set([...DEFAULT_HOSTS.map((h) => h.toLowerCase()), ...env])];
}

export function isImageHostAllowed(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h === "127.0.0.1") {
    return true;
  }
  return getAllowedImageHostnames().some(
    (allowed) => h === allowed || h.endsWith(`.${allowed}`),
  );
}
