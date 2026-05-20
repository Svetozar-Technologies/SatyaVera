#!/usr/bin/env npx tsx
/**
 * SatyaVera — Indian Laws Ingestion Pipeline
 *
 * Parses .lino law cache files from the indian-law repository
 * and writes them to Firestore for the SatyaVera app.
 *
 * Usage:
 *   npx tsx scripts/ingest-laws.ts [options]
 *
 * Options:
 *   --repo-path <path>   Path to cloned indian-law repo (default: ../indian-law)
 *   --limit <n>          Only ingest first N laws (for testing)
 *   --dry-run            Parse and report but don't write to Firestore
 *   --force              Re-ingest even if law already exists in Firestore
 *   --filter <slug>      Only ingest a specific law by slug
 *
 * Prerequisites:
 *   - Clone the repo: git clone https://github.com/Svetozar-Technologies/indian-law.git
 *   - Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY env vars
 *     OR run from a machine with Application Default Credentials (gcloud auth)
 */

import * as fs from "fs";
import * as path from "path";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { parseLinoFile, extractLaw, type ParsedLaw, type ParsedSection } from "./parse-lino";
import { categorizeLaw, getPrimaryCategory, LAW_CATEGORIES } from "./law-categories";

// ── Config ──

const args = process.argv.slice(2);
function getArg(name: string, defaultVal: string): string {
  const idx = args.indexOf(name);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : defaultVal;
}
const hasFlag = (name: string) => args.includes(name);

const REPO_PATH = getArg("--repo-path", path.join(process.cwd(), "..", "indian-law"));
const LIMIT = parseInt(getArg("--limit", "0"), 10);
const DRY_RUN = hasFlag("--dry-run");
const FORCE = hasFlag("--force");
const FILTER = getArg("--filter", "");
const BATCH_SIZE = 400; // Firestore batch limit is 500, leave headroom

// ── Firebase Admin Init ──

if (getApps().length === 0) {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (clientEmail && privateKey) {
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  } else {
    console.log("⚠ No service account credentials — using Application Default Credentials");
    initializeApp({ projectId });
  }
}

const db = getFirestore();

// ── Stats ──

let totalLaws = 0;
let totalSections = 0;
let skippedLaws = 0;
let errorLaws = 0;
const categoryStats: Record<string, number> = {};

// ── Main ──

async function main() {
  console.log("🏛  SatyaVera Indian Laws Ingestion Pipeline");
  console.log("━".repeat(50));
  console.log(`📁 Repo path:  ${REPO_PATH}`);
  console.log(`🔧 Dry run:    ${DRY_RUN}`);
  console.log(`🔄 Force:      ${FORCE}`);
  console.log(`🔍 Filter:     ${FILTER || "(all)"}`);
  console.log(`📊 Limit:      ${LIMIT || "(no limit)"}`);
  console.log("");

  const cachePath = path.join(REPO_PATH, "data", "cache", "laws");
  if (!fs.existsSync(cachePath)) {
    console.error(`❌ Cache directory not found: ${cachePath}`);
    console.error(`   Clone the repo first: git clone https://github.com/Svetozar-Technologies/indian-law.git`);
    process.exit(1);
  }

  // First, write the categories metadata doc
  if (!DRY_RUN) {
    console.log("📋 Writing law categories metadata...");
    await db.doc("meta/lawCategories").set({
      categories: LAW_CATEGORIES,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  // List all .lino files
  let files = fs.readdirSync(cachePath)
    .filter((f) => f.endsWith(".lino"))
    .sort();

  if (FILTER) {
    files = files.filter((f) => f.includes(FILTER));
  }
  if (LIMIT > 0) {
    files = files.slice(0, LIMIT);
  }

  console.log(`📚 Found ${files.length} law files to process\n`);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const slug = file.replace(".lino", "");
    const progress = `[${i + 1}/${files.length}]`;

    try {
      const text = fs.readFileSync(path.join(cachePath, file), "utf-8");
      const blocks = parseLinoFile(text);
      const law = extractLaw(blocks);

      if (!law || !law.slug) {
        console.log(`  ⚠ ${progress} ${file} — could not parse, skipping`);
        errorLaws++;
        continue;
      }

      // Categorize
      const categories = categorizeLaw(law.slug, law.title, law.ministry, law.department, law.longTitle);
      const primaryCategory = getPrimaryCategory(categories);

      // Track stats
      categories.forEach((c) => {
        categoryStats[c] = (categoryStats[c] || 0) + 1;
      });

      if (DRY_RUN) {
        console.log(`  ✓ ${progress} ${law.title} — ${law.sections.length} sections [${categories.join(", ")}]`);
        totalLaws++;
        totalSections += law.sections.length;
        continue;
      }

      // Check if already exists (skip unless --force)
      if (!FORCE) {
        const existing = await db.doc(`laws/${law.slug}`).get();
        if (existing.exists) {
          skippedLaws++;
          if (i % 50 === 0) console.log(`  ⏭ ${progress} ${law.slug} — already exists, skipping`);
          continue;
        }
      }

      // Write law document
      await db.doc(`laws/${law.slug}`).set({
        slug: law.slug,
        title: law.title,
        hindiTitle: law.hindiTitle || null,
        actNumber: law.actNumber || null,
        actYear: law.actYear || null,
        ministry: law.ministry || null,
        department: law.department || null,
        longTitle: law.longTitle || null,
        enactmentDate: law.enactmentDate || null,
        enforcementDate: law.enforcementDate || null,
        sourceUrl: law.sourceUrl || null,
        sectionCount: law.sections.length,
        categories,
        primaryCategory,
        fetchedAt: law.fetchedAt || null,
        ingestedAt: FieldValue.serverTimestamp(),
      });

      // Write sections in batches
      if (law.sections.length > 0) {
        const sectionsRef = db.collection(`laws/${law.slug}/sections`);

        for (let batchStart = 0; batchStart < law.sections.length; batchStart += BATCH_SIZE) {
          const batch = db.batch();
          const batchSections = law.sections.slice(batchStart, batchStart + BATCH_SIZE);

          for (const section of batchSections) {
            const sectionDocId = String(section.sectionNo).replace(/[\/\\.]/g, "_");
            const sectionRef = sectionsRef.doc(sectionDocId);
            batch.set(sectionRef, {
              sectionNo: section.sectionNo,
              orderNo: section.orderNo,
              title: section.title,
              content: section.content,
              footnotes: section.footnotes || null,
            });
          }

          await batch.commit();
        }
      }

      totalLaws++;
      totalSections += law.sections.length;

      if (i % 10 === 0 || law.sections.length > 100) {
        console.log(`  ✓ ${progress} ${law.title} — ${law.sections.length} sections [${primaryCategory}]`);
      }
    } catch (err) {
      console.error(`  ❌ ${progress} ${file} — ERROR: ${(err as Error).message}`);
      errorLaws++;
    }
  }

  // Print summary
  console.log("\n" + "━".repeat(50));
  console.log("📊 Ingestion Summary");
  console.log("━".repeat(50));
  console.log(`  ✅ Laws ingested:   ${totalLaws}`);
  console.log(`  📄 Total sections:  ${totalSections}`);
  console.log(`  ⏭  Skipped:         ${skippedLaws}`);
  console.log(`  ❌ Errors:          ${errorLaws}`);
  console.log("");
  console.log("📋 Category Distribution:");
  const sortedCats = Object.entries(categoryStats).sort((a, b) => b[1] - a[1]);
  for (const [cat, count] of sortedCats) {
    const catInfo = LAW_CATEGORIES.find((c) => c.id === cat);
    console.log(`  ${catInfo?.label || cat}: ${count} laws`);
  }
  console.log("\n✨ Done!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
