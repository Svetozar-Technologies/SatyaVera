#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("..", import.meta.url));

function target(relativePath) {
  return join(root, relativePath);
}

function write(relativePath, contents) {
  const outputPath = target(relativePath);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, contents);
}

function rasterSvg({ source, width, height, background = "none", insetRatio = 0 }) {
  if (!width || !height) {
    throw new Error("Unable to read source logo dimensions");
  }

  const inset = Math.round(Math.min(width, height) * insetRatio);
  const imageWidth = width - inset * 2;
  const imageHeight = height - inset * 2;
  const backgroundRect =
    background === "none" ? "" : `\n  <rect width="${width}" height="${height}" fill="${background}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">SatyaVera logo</title>
  <desc id="desc">SatyaVera AI and justice emblem with a neural network, dharma wheel, and scales of justice.</desc>${backgroundRect}
  <image x="${inset}" y="${inset}" width="${imageWidth}" height="${imageHeight}" href="data:image/png;base64,${source.toString("base64")}" preserveAspectRatio="xMidYMid meet"/>
  <metadata>SatyaVera</metadata>
</svg>
`;
}

async function logoSvg({ background = "none", insetRatio = 0, size } = {}) {
  const sourceLogo = readFileSync(target("public/logo.png"));
  const source = size
    ? await sharp(sourceLogo).resize(size, size, { fit: "fill" }).png().toBuffer()
    : sourceLogo;
  const { width, height } = await sharp(source).metadata();

  return rasterSvg({ source, width, height, background, insetRatio });
}

async function pngFromSvg(svg, size) {
  return sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
}

function icoFromPngs(images) {
  const headerSize = 6;
  const entrySize = 16;
  let imageOffset = headerSize + images.length * entrySize;
  const header = Buffer.alloc(imageOffset);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  images.forEach(({ size, buffer }, index) => {
    const entryOffset = headerSize + index * entrySize;
    header[entryOffset] = size === 256 ? 0 : size;
    header[entryOffset + 1] = size === 256 ? 0 : size;
    header[entryOffset + 2] = 0;
    header[entryOffset + 3] = 0;
    header.writeUInt16LE(1, entryOffset + 4);
    header.writeUInt16LE(32, entryOffset + 6);
    header.writeUInt32LE(buffer.length, entryOffset + 8);
    header.writeUInt32LE(imageOffset, entryOffset + 12);
    imageOffset += buffer.length;
  });

  return Buffer.concat([header, ...images.map((image) => image.buffer)]);
}

const transparentLogo = await logoSvg();
const appIcon = await logoSvg({ background: "#fbfaf6", size: 512 });
const maskableIcon = await logoSvg({ background: "#fbfaf6", insetRatio: 0.1, size: 512 });

write("public/logo.svg", transparentLogo);
write("public/favicon.svg", appIcon);
write("src/app/icon.svg", appIcon);

const pngOutputs = [
  ["public/icons/favicon-16x16.png", 16, transparentLogo],
  ["public/icons/favicon-32x32.png", 32, transparentLogo],
  ["public/icons/apple-touch-icon.png", 180, appIcon],
  ["public/icons/android-chrome-192x192.png", 192, appIcon],
  ["public/icons/android-chrome-512x512.png", 512, appIcon],
  ["public/icons/maskable-icon-192x192.png", 192, maskableIcon],
  ["public/icons/maskable-icon-512x512.png", 512, maskableIcon],
  ["src/app/apple-icon.png", 180, appIcon],
];

const icoFrames = [];
for (const [relativePath, size, svg] of pngOutputs) {
  const buffer = await pngFromSvg(svg, size);
  write(relativePath, buffer);
  if ([16, 32].includes(size)) {
    icoFrames.push({ size, buffer });
  }
}

for (const size of [48, 256]) {
  icoFrames.push({ size, buffer: await pngFromSvg(transparentLogo, size) });
}

write("src/app/favicon.ico", icoFromPngs(icoFrames));

console.log("Generated SatyaVera brand assets.");
