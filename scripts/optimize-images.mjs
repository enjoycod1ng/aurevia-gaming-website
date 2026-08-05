#!/usr/bin/env node

import { readdir, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import sharp from "sharp";

const inputRoot = path.resolve(process.argv[2] ?? "assets/raw");
const outputRoot = path.resolve(process.argv[3] ?? "public/media/optimized");
const quality = Number(process.env.WEBP_QUALITY ?? 82);
const maxWidth = Number(process.env.IMAGE_MAX_WIDTH ?? 1920);
const supportedExtensions = new Set([".png", ".jpg", ".jpeg", ".tif", ".tiff"]);

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(absolutePath)));
      continue;
    }

    if (supportedExtensions.has(path.extname(entry.name).toLowerCase())) {
      files.push(absolutePath);
    }
  }

  return files;
}

async function main() {
  try {
    const inputStats = await stat(inputRoot);
    if (!inputStats.isDirectory()) {
      throw new Error(`Input path is not a directory: ${inputRoot}`);
    }
  } catch {
    throw new Error(
      `Input directory does not exist: ${inputRoot}\n` +
        "Usage: npm run images:optimize -- <input-directory> <output-directory>"
    );
  }

  if (!Number.isInteger(quality) || quality < 1 || quality > 100) {
    throw new Error("WEBP_QUALITY must be an integer between 1 and 100.");
  }

  if (!Number.isInteger(maxWidth) || maxWidth < 320) {
    throw new Error("IMAGE_MAX_WIDTH must be an integer of at least 320.");
  }

  const files = await collectFiles(inputRoot);

  if (files.length === 0) {
    console.log(`No PNG/JPEG/TIFF files found in ${inputRoot}`);
    return;
  }

  console.log(`Optimizing ${files.length} image(s) to WebP...`);

  for (const inputPath of files) {
    const relativePath = path.relative(inputRoot, inputPath);
    const outputPath = path.join(
      outputRoot,
      relativePath.replace(path.extname(relativePath), ".webp")
    );

    await mkdir(path.dirname(outputPath), { recursive: true });

    const source = sharp(inputPath).rotate();
    const metadata = await source.metadata();
    const targetWidth = Math.min(metadata.width ?? maxWidth, maxWidth);

    const result = await source
      .resize({
        width: targetWidth,
        withoutEnlargement: true,
        fit: "inside"
      })
      .webp({
        quality,
        effort: 5,
        smartSubsample: true
      })
      .toFile(outputPath);

    console.log(
      `${relativePath} -> ${path.relative(process.cwd(), outputPath)} ` +
        `(${result.width}x${result.height}, ${Math.round(result.size / 1024)} KB)`
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
