#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import potrace from "potrace";
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

function hex(value) {
  return value.toString(16).padStart(2, "0");
}

function rgbHex([r, g, b]) {
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

function squaredDistance(pixel, centroid) {
  const dr = pixel[0] - centroid[0];
  const dg = pixel[1] - centroid[1];
  const db = pixel[2] - centroid[2];
  return dr * dr + dg * dg + db * db;
}

function nearestCentroid(pixel, centroids) {
  let bestIndex = 0;
  let bestDistance = Infinity;
  for (let i = 0; i < centroids.length; i += 1) {
    const distance = squaredDistance(pixel, centroids[i]);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i;
    }
  }
  return bestIndex;
}

// Deterministic k-means++ palette extraction. We resample by a constant stride
// so the choice of centroids does not depend on machine performance.
function kmeansPalette(pixels, paletteSize, iterations = 15) {
  const samples = [];
  const stride = Math.max(1, Math.floor(Math.sqrt(pixels.length / 3 / 80000)));
  for (let i = 0; i + 2 < pixels.length; i += 3 * stride) {
    samples.push([pixels[i], pixels[i + 1], pixels[i + 2]]);
  }

  const centroids = [samples[0]];
  while (centroids.length < paletteSize) {
    let bestIndex = 0;
    let bestDistance = -1;
    const step = Math.max(1, Math.floor(samples.length / 1500));
    for (let s = 0; s < samples.length; s += step) {
      let minDistance = Infinity;
      for (const centroid of centroids) {
        const distance = squaredDistance(samples[s], centroid);
        if (distance < minDistance) {
          minDistance = distance;
        }
      }
      if (minDistance > bestDistance) {
        bestDistance = minDistance;
        bestIndex = s;
      }
    }
    centroids.push(samples[bestIndex]);
  }

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const sums = centroids.map(() => [0, 0, 0, 0]);
    for (const sample of samples) {
      const index = nearestCentroid(sample, centroids);
      sums[index][0] += sample[0];
      sums[index][1] += sample[1];
      sums[index][2] += sample[2];
      sums[index][3] += 1;
    }
    for (let c = 0; c < centroids.length; c += 1) {
      if (sums[c][3] > 0) {
        centroids[c] = [
          Math.round(sums[c][0] / sums[c][3]),
          Math.round(sums[c][1] / sums[c][3]),
          Math.round(sums[c][2] / sums[c][3]),
        ];
      }
    }
  }

  return centroids;
}

function tracePathFromMask(maskPng, { turdSize, optTolerance }) {
  return new Promise((resolve, reject) => {
    const trace = new potrace.Potrace({
      threshold: 128,
      turdSize,
      alphaMax: 1,
      optTolerance,
      blackOnWhite: true,
    });
    trace.loadImage(maskPng, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(trace.getPathTag());
    });
  });
}

async function vectorizeLogo({ source, paletteSize = 16, turdSize = 10, optTolerance = 0.2 }) {
  const { data: pixels, info } = await sharp(source)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  const palette = kmeansPalette(pixels, paletteSize);
  const labels = new Uint8Array(width * height);
  const counts = new Array(palette.length).fill(0);
  for (let p = 0; p < width * height; p += 1) {
    const pixel = [pixels[p * 3], pixels[p * 3 + 1], pixels[p * 3 + 2]];
    const index = nearestCentroid(pixel, palette);
    labels[p] = index;
    counts[index] += 1;
  }

  const backgroundIndex = counts.indexOf(Math.max(...counts));
  const backgroundColor = palette[backgroundIndex];

  const tracingOrder = palette
    .map((color, index) => ({ color, index, count: counts[index] }))
    .filter((entry) => entry.index !== backgroundIndex)
    .sort((a, b) => b.count - a.count);

  const paths = [];
  for (const { color, index } of tracingOrder) {
    if (counts[index] < turdSize) {
      continue;
    }
    const mask = Buffer.alloc(width * height);
    for (let p = 0; p < width * height; p += 1) {
      mask[p] = labels[p] === index ? 0 : 255;
    }
    const maskPng = await sharp(mask, { raw: { width, height, channels: 1 } })
      .png()
      .toBuffer();
    const pathTag = await tracePathFromMask(maskPng, { turdSize, optTolerance });
    const colored = pathTag
      .replace(/fill="[^"]*"/, `fill="${rgbHex(color)}"`)
      .replace(/stroke="[^"]*"/, "");
    paths.push(colored);
  }

  return {
    width,
    height,
    backgroundColor: rgbHex(backgroundColor),
    paths,
  };
}

function composeSvg({
  width,
  height,
  background,
  paths,
  viewWidth = width,
  viewHeight = height,
  innerScale = 1,
  innerOffsetX = 0,
  innerOffsetY = 0,
}) {
  const transform =
    innerScale === 1 && innerOffsetX === 0 && innerOffsetY === 0
      ? ""
      : ` transform="translate(${innerOffsetX} ${innerOffsetY}) scale(${innerScale})"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${viewWidth}" height="${viewHeight}" viewBox="0 0 ${viewWidth} ${viewHeight}" role="img" aria-labelledby="title desc">
  <title id="title">SatyaVera logo</title>
  <desc id="desc">SatyaVera AI and justice emblem with a neural network, dharma wheel, and scales of justice.</desc>
  <rect width="${viewWidth}" height="${viewHeight}" fill="${background}"/>
  <g${transform}>
${paths.map((path) => `    ${path}`).join("\n")}
  </g>
  <metadata>SatyaVera</metadata>
</svg>
`;
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

const sourceLogoBuffer = readFileSync(target("public/logo.png"));
const vector = await vectorizeLogo({
  source: sourceLogoBuffer,
  paletteSize: 16,
  turdSize: 10,
  optTolerance: 0.2,
});

const logoSvg = composeSvg({
  width: vector.width,
  height: vector.height,
  background: vector.backgroundColor,
  paths: vector.paths,
});

const iconSvg = composeSvg({
  width: vector.width,
  height: vector.height,
  background: "#fbfaf6",
  paths: vector.paths,
});

const maskableInset = Math.round(Math.min(vector.width, vector.height) * 0.1);
const maskableScale = (Math.min(vector.width, vector.height) - maskableInset * 2) / Math.min(vector.width, vector.height);
const maskableSvg = composeSvg({
  width: vector.width,
  height: vector.height,
  background: "#fbfaf6",
  paths: vector.paths,
  innerScale: maskableScale,
  innerOffsetX: maskableInset,
  innerOffsetY: maskableInset,
});

write("public/logo.svg", logoSvg);
write("public/favicon.svg", iconSvg);
write("src/app/icon.svg", iconSvg);

const pngOutputs = [
  ["public/icons/favicon-16x16.png", 16, logoSvg],
  ["public/icons/favicon-32x32.png", 32, logoSvg],
  ["public/icons/apple-touch-icon.png", 180, iconSvg],
  ["public/icons/android-chrome-192x192.png", 192, iconSvg],
  ["public/icons/android-chrome-512x512.png", 512, iconSvg],
  ["public/icons/maskable-icon-192x192.png", 192, maskableSvg],
  ["public/icons/maskable-icon-512x512.png", 512, maskableSvg],
  ["src/app/apple-icon.png", 180, iconSvg],
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
  icoFrames.push({ size, buffer: await pngFromSvg(logoSvg, size) });
}

write("src/app/favicon.ico", icoFromPngs(icoFrames));

console.log("Generated SatyaVera brand assets.");
