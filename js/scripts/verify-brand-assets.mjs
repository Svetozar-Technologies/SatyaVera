#!/usr/bin/env node
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("..", import.meta.url));

const pngSignature = "89504e470d0a1a0a";
const expectedPngs = [
  ["public/icons/favicon-16x16.png", 16, 16],
  ["public/icons/favicon-32x32.png", 32, 32],
  ["public/icons/apple-touch-icon.png", 180, 180],
  ["public/icons/android-chrome-192x192.png", 192, 192],
  ["public/icons/android-chrome-512x512.png", 512, 512],
  ["public/icons/maskable-icon-192x192.png", 192, 192],
  ["public/icons/maskable-icon-512x512.png", 512, 512],
  ["src/app/apple-icon.png", 180, 180],
];

function pathFor(relativePath) {
  return join(root, relativePath);
}

function read(relativePath) {
  try {
    return readFileSync(pathFor(relativePath));
  } catch {
    throw new Error(`${relativePath} is missing`);
  }
}

function expect(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function pngDimensions(buffer) {
  expect(buffer.subarray(0, 8).toString("hex") === pngSignature, "file is not a PNG");
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function verifyPng(relativePath, width, height) {
  const buffer = read(relativePath);
  const dimensions = pngDimensions(buffer);
  expect(
    dimensions.width === width && dimensions.height === height,
    `${relativePath} is ${dimensions.width}x${dimensions.height}, expected ${width}x${height}`,
  );
  expect(statSync(pathFor(relativePath)).size > 100, `${relativePath} is unexpectedly small`);
}

function verifyIco(relativePath, sizes) {
  const buffer = read(relativePath);
  expect(buffer.readUInt16LE(0) === 0, `${relativePath} has invalid ICO reserved field`);
  expect(buffer.readUInt16LE(2) === 1, `${relativePath} is not an icon ICO`);
  const count = buffer.readUInt16LE(4);
  expect(count >= sizes.length, `${relativePath} has ${count} images, expected ${sizes.length}`);

  const found = new Set();
  for (let index = 0; index < count; index += 1) {
    const offset = 6 + index * 16;
    const width = buffer[offset] === 0 ? 256 : buffer[offset];
    const height = buffer[offset + 1] === 0 ? 256 : buffer[offset + 1];
    found.add(`${width}x${height}`);
  }

  for (const size of sizes) {
    expect(found.has(`${size}x${size}`), `${relativePath} is missing ${size}x${size}`);
  }
}

function verifySvg(relativePath) {
  const source = read(relativePath).toString("utf8");
  expect(source.includes("<svg"), `${relativePath} is not an SVG`);
  expect(source.includes("viewBox="), `${relativePath} is missing a viewBox`);
  expect(source.includes("SatyaVera"), `${relativePath} is missing accessible brand text`);
  expect(!/<image\b/i.test(source), `${relativePath} embeds a raster image`);
  expect(!/data:image/i.test(source), `${relativePath} embeds a data URI image`);
  expect(!/base64/i.test(source), `${relativePath} contains base64 data`);
  expect(/<path\b/i.test(source), `${relativePath} does not contain vector paths`);
}

async function verifyLogoVisualMatch() {
  const sourcePath = pathFor("public/logo.png");
  const candidateSvg = read("public/logo.svg");
  const { width, height } = await sharp(sourcePath).metadata();
  expect(width && height, "public/logo.png dimensions could not be read");

  const source = await sharp(sourcePath)
    .resize(width, height, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer();
  const candidate = await sharp(candidateSvg)
    .resize(width, height, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer();

  expect(candidate.length === source.length, "rendered logo.svg dimensions do not match logo.png");

  let differentPixels = 0;
  const totalPixels = source.length / 3;
  for (let index = 0; index < source.length; index += 3) {
    const redDelta = Math.abs(source[index] - candidate[index]);
    const greenDelta = Math.abs(source[index + 1] - candidate[index + 1]);
    const blueDelta = Math.abs(source[index + 2] - candidate[index + 2]);
    if (redDelta + greenDelta + blueDelta > 30) {
      differentPixels += 1;
    }
  }

  const differentPercent = (differentPixels / totalPixels) * 100;
  expect(
    differentPercent < 1,
    `public/logo.svg differs from public/logo.png by ${differentPercent.toFixed(2)}% of pixels`,
  );
}

function verifyManifest() {
  const manifest = JSON.parse(read("public/manifest.json").toString("utf8"));
  expect(manifest.name === "SatyaVera — AI Legal Assistant for India", "manifest name changed");
  expect(manifest.icons.some((icon) => icon.sizes === "192x192"), "manifest missing 192x192 icon");
  expect(manifest.icons.some((icon) => icon.sizes === "512x512"), "manifest missing 512x512 icon");
  expect(
    manifest.icons.some((icon) => icon.purpose && icon.purpose.includes("maskable")),
    "manifest missing maskable icons",
  );
  expect(
    manifest.icons.every((icon) => !icon.src.startsWith("/")),
    "manifest icon paths should be relative so basePath deployments work",
  );
}

async function main() {
  verifySvg("public/logo.svg");
  verifySvg("public/favicon.svg");
  verifySvg("src/app/icon.svg");
  await verifyLogoVisualMatch();
  for (const [relativePath, width, height] of expectedPngs) {
    verifyPng(relativePath, width, height);
  }
  verifyIco("src/app/favicon.ico", [16, 32, 48, 256]);
  verifyManifest();

  console.log("Brand assets verified.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
