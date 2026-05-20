#!/usr/bin/env npx tsx
/**
 * SatyaVera — Export Laws Category-wise to data/laws/
 *
 * Parses all laws from the indian-law repo and exports them as JSON
 * files organized by category into the SatyaVera repo.
 *
 * Usage:
 *   npx tsx scripts/export-laws.ts [--repo-path <path>]
 */

import * as fs from "fs";
import * as path from "path";
import { parseLinoFile, extractLaw, type ParsedLaw, type ParsedSection } from "./parse-lino";
import { categorizeLaw, getPrimaryCategory, LAW_CATEGORIES } from "./law-categories";

const args = process.argv.slice(2);
function getArg(name: string, defaultVal: string): string {
  const idx = args.indexOf(name);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : defaultVal;
}

const REPO_PATH = getArg("--repo-path", path.join(process.cwd(), "..", "indian-law"));
const OUTPUT_DIR = path.join(process.cwd(), "data", "laws");

interface ExportedLaw {
  slug: string;
  title: string;
  hindiTitle?: string;
  actNumber?: number;
  actYear?: number;
  ministry?: string;
  department?: string;
  categories: string[];
  primaryCategory: string;
  sectionCount: number;
  sections: { sectionNo: string; title: string; content: string }[];
}

async function main() {
  console.log("\n📚 SatyaVera Law Exporter");
  console.log(`   Source: ${REPO_PATH}`);
  console.log(`   Output: ${OUTPUT_DIR}\n`);

  // Check source exists
  const cacheDir = path.join(REPO_PATH, "data", "cache", "laws");
  if (!fs.existsSync(cacheDir)) {
    console.error(`❌ Cache directory not found: ${cacheDir}`);
    console.error(`   Clone the repo: git clone https://github.com/Svetozar-Technologies/indian-law.git`);
    process.exit(1);
  }

  // Find all .lino files
  const files = fs.readdirSync(cacheDir).filter(f => f.endsWith(".lino")).sort();
  console.log(`   Found ${files.length} law files\n`);

  // Initialize category buckets
  const byCategory: Record<string, ExportedLaw[]> = {};
  for (const cat of LAW_CATEGORIES) {
    byCategory[cat.id] = [];
  }

  let totalLaws = 0;
  let totalSections = 0;
  let errors = 0;

  for (const file of files) {
    try {
      const filePath = path.join(cacheDir, file);
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = parseLinoFile(raw);
      const law: ParsedLaw = extractLaw(parsed, file.replace(".lino", ""));

      if (!law.title) continue;

      const categories = categorizeLaw(law.slug, law.title, law.ministry, law.department, law.longTitle);
      const primary = getPrimaryCategory(categories);

      const exported: ExportedLaw = {
        slug: law.slug,
        title: law.title,
        hindiTitle: law.hindiTitle,
        actNumber: law.actNumber,
        actYear: law.actYear,
        ministry: law.ministry,
        department: law.department,
        categories,
        primaryCategory: primary,
        sectionCount: law.sections?.length || 0,
        sections: (law.sections || []).map((s: ParsedSection) => ({
          sectionNo: s.sectionNo,
          title: s.title,
          content: s.content,
        })),
      };

      totalSections += exported.sectionCount;

      // Add to primary category
      byCategory[primary] = byCategory[primary] || [];
      byCategory[primary].push(exported);

      totalLaws++;
      if (totalLaws % 100 === 0) {
        process.stdout.write(`   Processed ${totalLaws}/${files.length}...\r`);
      }
    } catch (err) {
      errors++;
    }
  }

  console.log(`\n   Processed ${totalLaws} laws, ${totalSections} sections, ${errors} errors\n`);

  // Clean output directory
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true });
  }

  // Write category-wise JSON files
  console.log("📂 Writing category files:\n");

  // Write index file with category metadata
  const index: Record<string, { label: string; labelHi: string; icon: string; lawCount: number; sectionCount: number }> = {};

  for (const cat of LAW_CATEGORIES) {
    const laws = byCategory[cat.id] || [];
    if (laws.length === 0) continue;

    const catDir = path.join(OUTPUT_DIR, cat.id);
    fs.mkdirSync(catDir, { recursive: true });

    // Write individual law files
    for (const law of laws) {
      const lawPath = path.join(catDir, `${law.slug}.json`);
      fs.writeFileSync(lawPath, JSON.stringify(law, null, 2));
    }

    // Write category index (law list without sections for quick browsing)
    const catIndex = laws.map(l => ({
      slug: l.slug,
      title: l.title,
      hindiTitle: l.hindiTitle,
      actYear: l.actYear,
      sectionCount: l.sectionCount,
      categories: l.categories,
    }));
    fs.writeFileSync(path.join(catDir, "_index.json"), JSON.stringify(catIndex, null, 2));

    const catSections = laws.reduce((sum, l) => sum + l.sectionCount, 0);
    index[cat.id] = {
      label: cat.label,
      labelHi: cat.labelHi,
      icon: cat.icon,
      lawCount: laws.length,
      sectionCount: catSections,
    };

    console.log(`   ${cat.label.padEnd(15)} ${String(laws.length).padStart(4)} laws  ${String(catSections).padStart(6)} sections`);
  }

  // Write master index
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUTPUT_DIR, "_index.json"), JSON.stringify({
    totalLaws,
    totalSections,
    exportedAt: new Date().toISOString(),
    categories: index,
  }, null, 2));

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`   Total: ${totalLaws} laws, ${totalSections} sections`);
  console.log(`   Output: ${OUTPUT_DIR}/`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

main().catch(console.error);
