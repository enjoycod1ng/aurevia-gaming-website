import Image from "next/image";

import type { MediaAsset } from "@/types/content";

interface MediaFrameProps {
  image: MediaAsset;
  sizes: string;
  preload?: boolean;
  showCaption?: boolean;
  className?: string;
}

export function MediaFrame({
  image,
  sizes,
  preload = false,
  showCaption = false,
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
          preload={preload}
        />
      </div>
      {showCaption && image.caption ? (
        <figcaption className="mt-2.5 text-xs text-muted">
          {image.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
