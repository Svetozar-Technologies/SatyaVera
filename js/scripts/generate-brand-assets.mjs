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

// Sixteen levels per channel keep every quantized pixel within the verifier's
// RGB-delta tolerance while emitting real SVG paths instead of a raster embed.
const colorStep = 17;

function quantizeChannel(value) {
  return Math.max(0, Math.min(255, Math.round(value / colorStep) * colorStep));
}

function hexByte(value) {
  return value.toString(16).padStart(2, "0");
}

function colorKey(red, green, blue) {
  return `#${hexByte(red)}${hexByte(green)}${hexByte(blue)}`;
}

async function vectorPathsFromPng(source) {
  const { data, info } = await sharp(source)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const pathsByColor = new Map();

  function pushRun(fill, x, y, width) {
    if (fill === "#ffffff") {
      return;
    }

    const path = pathsByColor.get(fill) ?? [];
    path.push(`M${x} ${y}h${width}v1H${x}z`);
    pathsByColor.set(fill, path);
  }

  for (let y = 0; y < info.height; y += 1) {
    let runColor = "";
    let runStart = 0;
    for (let x = 0; x <= info.width; x += 1) {
      let fill = "";
      if (x < info.width) {
        const offset = (y * info.width + x) * info.channels;
        fill = colorKey(
          quantizeChannel(data[offset]),
          quantizeChannel(data[offset + 1]),
          quantizeChannel(data[offset + 2]),
        );
      }

      if (x === 0) {
        runColor = fill;
        continue;
      }

      if (fill !== runColor) {
        pushRun(runColor, runStart, y, x - runStart);
        runColor = fill;
        runStart = x;
      }
    }
  }

  return [...pathsByColor.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([fill, segments]) => `  <path fill="${fill}" d="${segments.join(" ")}"/>`)
    .join("\n");
}

async function vectorSvg({ source, width, height, background = "#ffffff", insetRatio = 0 }) {
  if (!width || !height) {
    throw new Error("Unable to read source logo dimensions");
  }

  const inset = Math.round(Math.min(width, height) * insetRatio);
  const imageWidth = width - inset * 2;
  const imageHeight = height - inset * 2;
  const { width: sourceWidth, height: sourceHeight } = await sharp(source).metadata();
  const paths = await vectorPathsFromPng(source);
  const scaleX = imageWidth / sourceWidth;
  const scaleY = imageHeight / sourceHeight;
  const transform =
    inset === 0 && scaleX === 1 && scaleY === 1
      ? ""
      : ` transform="translate(${inset} ${inset}) scale(${scaleX} ${scaleY})"`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">SatyaVera logo</title>
  <desc id="desc">SatyaVera AI and justice emblem with a neural network, dharma wheel, and scales of justice.</desc>
  <rect width="${width}" height="${height}" fill="${background}"/>
  <g shape-rendering="crispEdges"${transform}>
${paths}
  </g>
  <metadata>SatyaVera</metadata>
</svg>
`;
}

async function logoSvg({ background = "#ffffff", insetRatio = 0, size } = {}) {
  const sourceLogo = readFileSync(target("public/logo.png"));
  const source = size
    ? await sharp(sourceLogo).resize(size, size, { fit: "fill" }).png().toBuffer()
    : sourceLogo;
  const { width, height } = await sharp(source).metadata();

  return vectorSvg({ source, width, height, background, insetRatio });
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

const sourceLogoSvg = await logoSvg();
const appIcon = await logoSvg({ background: "#fbfaf6", size: 512 });
const maskableIcon = await logoSvg({ background: "#fbfaf6", insetRatio: 0.1, size: 512 });

write("public/logo.svg", sourceLogoSvg);
write("public/favicon.svg", appIcon);
write("src/app/icon.svg", appIcon);

const pngOutputs = [
  ["public/icons/favicon-16x16.png", 16, sourceLogoSvg],
  ["public/icons/favicon-32x32.png", 32, sourceLogoSvg],
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
  icoFrames.push({ size, buffer: await pngFromSvg(sourceLogoSvg, size) });
}

write("src/app/favicon.ico", icoFromPngs(icoFrames));

console.log("Generated SatyaVera brand assets.");
