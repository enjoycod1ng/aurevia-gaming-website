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
    <figure className={`media-frame ${className}`.trim()}>
      <div className="media-frame__inner">
        <Image
          className="media-frame__image"
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
        <figcaption className="media-frame__caption">
          {image.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
