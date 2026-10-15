#!/usr/bin/env node

// Builds the raster icons that browsers, iOS and installed web apps request from
// the monogram in public/logo.svg. Run `npm run icons:generate` after changing the logo.

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const publicRoot = path.resolve("public");
const logo = await readFile(path.join(publicRoot, "logo.svg"), "utf8");
const viewBox = logo.match(/viewBox="([^"]+)"/)?.[1];
const monogram = logo.match(/<path\b[^>]*\/>/)?.[0];

if (!viewBox || !monogram) {
  throw new Error("public/logo.svg needs a viewBox and a single monogram path");
}

// The dark theme's page color (--canvas in globals.css). Home-screen icons need an
// opaque background: iOS fills transparency with black.
const background = "#07090c";

// padding is a share of the icon's width on each side. Maskable icons keep the
// monogram inside the central safe zone that Android may crop to a circle.
function render(size, { padding, shape }) {
  const offset = padding * 100;
  const backdrop =
    shape === "square"
      ? `<rect width="100" height="100" fill="${background}"/>`
      : shape === "rounded"
        ? `<rect width="100" height="100" rx="22" fill="${background}"/>`
        : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${backdrop}<svg x="${offset}" y="${offset}" width="${100 - offset * 2}" height="${100 - offset * 2}" viewBox="${viewBox}">${monogram}</svg></svg>`;
  return sharp(Buffer.from(svg), { density: Math.ceil((72 * size) / 100) })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();
}

// An ICO file whose entries are PNG images, which every current browser reads.
function ico(images) {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, index) => {
    const entry = 6 + index * 16;
    header.writeUInt8(size, entry);
    header.writeUInt8(size, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(data.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map(({ data }) => data)]);
}

const favicon = await Promise.all(
  [16, 32, 48].map(async (size) => ({
    size,
    data: await render(size, { padding: 0.02, shape: "none" }),
  })),
);
const outputs = {
  "favicon.ico": ico(favicon),
  "apple-touch-icon.png": await render(180, { padding: 0.16, shape: "square" }),
  "icon-192.png": await render(192, { padding: 0.16, shape: "rounded" }),
  "icon-512.png": await render(512, { padding: 0.16, shape: "rounded" }),
  "icon-maskable-512.png": await render(512, { padding: 0.24, shape: "square" }),
};

for (const [name, data] of Object.entries(outputs)) {
  await writeFile(path.join(publicRoot, name), data);
  console.log(`public/${name}: ${data.length} bytes`);
}
