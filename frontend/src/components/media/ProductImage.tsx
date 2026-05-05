import Image from "next/image";
import { isImageHostAllowed } from "@/lib/image/allowedImageHosts";

type ProductImageProps = {
  src: string;
  alt: string;
  /** Use with a `relative` positioned parent and fixed aspect ratio */
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

function parseRemoteUrl(src: string): URL | null {
  try {
    return new URL(src);
  } catch {
    return null;
  }
}

export function ProductImage({
  src,
  alt,
  fill = true,
  width,
  height,
  className = "",
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
}: ProductImageProps) {
  if (src.startsWith("/")) {
    if (fill) {
      return (
        <Image
          src={src}
          alt={alt}
          fill
          className={className}
          sizes={sizes}
          priority={priority}
        />
      );
    }
    return (
      <Image
        src={src}
        alt={alt}
        width={width ?? 800}
        height={height ?? 600}
        className={className}
        sizes={sizes}
        priority={priority}
      />
    );
  }

  const u = parseRemoteUrl(src);
  const allowedRemote =
    u &&
    (u.protocol === "http:" || u.protocol === "https:") &&
    isImageHostAllowed(u.hostname);

  if (allowedRemote) {
    if (fill) {
      return (
        <Image
          src={src}
          alt={alt}
          fill
          className={className}
          sizes={sizes}
          priority={priority}
        />
      );
    }
    return (
      <Image
        src={src}
        alt={alt}
        width={width ?? 800}
        height={height ?? 600}
        className={className}
        sizes={sizes}
        priority={priority}
      />
    );
  }

  if (fill) {
    // Arbitrary remote URL — not in next/image allowlist
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 h-full w-full ${className}`}
        loading="lazy"
        decoding="async"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}
