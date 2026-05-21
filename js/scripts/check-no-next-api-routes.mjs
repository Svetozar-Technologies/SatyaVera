#!/usr/bin/env node
import { existsSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const jsRoot = resolve(new URL(".", import.meta.url).pathname, "..");
const appApiDir = join(jsRoot, "src", "app", "api");

function collectFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(path));
    } else {
      files.push(path);
    }
  }
  return files;
}

if (existsSync(appApiDir)) {
  const files = collectFiles(appApiDir)
    .map((file) => relative(jsRoot, file))
    .sort();
  console.error("Next.js API route handlers are not allowed in JavaScript.");
  console.error("Move endpoint code to rust/api instead.");
  for (const file of files) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

console.log("No Next.js API route handlers found in js/src/app/api.");
