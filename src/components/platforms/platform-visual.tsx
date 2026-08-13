import Image from "next/image";

import type { MediaAsset } from "@/types/content";

interface PlatformVisualProps {
  image?: MediaAsset;
  className: string;
  sizes: string;
  priority?: boolean;
  children: React.ReactNode;
}

export function PlatformVisual({
  image,
  className,
  sizes,
  priority = false,
  children,
}: PlatformVisualProps) {
  if (!image) {
    return children;
  }

  return (
    <figure className={`m-0 overflow-hidden rounded-3xl border border-line-strong bg-surface ${className}`}>
      <Image
        className="block h-auto w-full"
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes={sizes}
        priority={priority}
      />
      {image.caption ? <figcaption className="px-4.5 py-3 text-xs text-muted">{image.caption}</figcaption> : null}
    </figure>
  );
}
