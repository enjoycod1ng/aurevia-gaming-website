import { createHash } from "node:crypto";
import { readFile, writeFile, readdir, copyFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const manifest = {};
for (const folder of ["games", "platforms"]) {
  const directory = path.join(root, "public/media", folder);
  for (const name of (await readdir(directory)).sort()) {
    if (!name.endsWith(".webp") || /\.[a-f0-9]{12}\.webp$/.test(name)) continue;
    const source = path.join(directory, name);
    const bytes = await readFile(source);
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    const versioned = name.replace(/\.webp$/, `.${sha256.slice(0, 12)}.webp`);
    const { width, height } = await sharp(bytes).metadata();
    if (!width || !height) throw new Error(`Missing image dimensions: ${name}`);
    await copyFile(source, path.join(directory, versioned));
    manifest[`/media/${folder}/${name}`] = { src: `/media/${folder}/${versioned}`, sha256, width, height, bytes: bytes.length };
  }
}
await writeFile(path.join(root, "src/content/media-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`Versioned ${Object.keys(manifest).length} WebP assets (${Object.values(manifest).reduce((sum, image) => sum + image.bytes, 0).toLocaleString()} bytes).`);
