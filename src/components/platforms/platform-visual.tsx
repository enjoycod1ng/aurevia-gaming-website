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
    <figure className={className}>
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes={sizes}
        priority={priority}
      />
      {image.caption ? <figcaption>{image.caption}</figcaption> : null}
    </figure>
  );
}
