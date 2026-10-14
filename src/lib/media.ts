import manifest from "@/content/media-manifest.json";

export function mediaPath(source: string): string {
  const image = manifest[source as keyof typeof manifest];
  if (!image) throw new Error(`Unversioned media asset: ${source}. Run npm run images:version.`);
  return image.src;
}
