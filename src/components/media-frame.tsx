import Image from "next/image";

import type { MediaAsset } from "@/types/content";

interface MediaFrameProps {
  image: MediaAsset;
  sizes: string;
  className?: string;
}

export function MediaFrame({
  image,
  sizes,
  className = "",
}: MediaFrameProps) {
  return (
    <figure className={`relative mb-0 ${className}`.trim()}>
      <div className="relative overflow-hidden rounded-panel border border-gold-bright/25 bg-canvas-soft leading-none shadow-panel">
        <Image
          className="block h-auto w-full"
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes={sizes}
          quality={80}
        />
      </div>
      {image.caption ? <figcaption className="mt-4 text-sm leading-5 text-muted">{image.caption}</figcaption> : null}
    </figure>
  );
}
