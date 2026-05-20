/**
 * Law Search — Retrieval layer for GandhiAI RAG
 * Searches Firestore laws/sections to provide real law text as AI context.
 */

import { adminDb } from "@/lib/firebase/admin";

export interface LawSearchResult {
  lawSlug: string;
  lawTitle: string;
  sectionNo: string;
  sectionTitle: string;
  content: string;
}

const ACT_ALIASES: Record<string, string> = {
  bns: "the-bharatiya-nyaya-sanhita-2023",
  bnss: "the-bharatiya-nagarik-suraksha-sanhita-2023",
  bsa: "the-bharatiya-sakshya-adhiniyam-2023",
  ipc: "the-bharatiya-nyaya-sanhita-2023",
  crpc: "the-bharatiya-nagarik-suraksha-sanhita-2023",
  iea: "the-bharatiya-sakshya-adhiniyam-2023",
  tpa: "the-transfer-of-property-act-1882",
  cpc: "the-code-of-civil-procedure-1908",
  "ni act": "the-negotiable-instruments-act-1881",
  "it act": "the-information-technology-act-2000",
  rti: "the-right-to-information-act-2005",
  ndps: "the-narcotic-drugs-and-psychotropic-substances-act-1985",
};

export async function searchLawSections(query: string): Promise<LawSearchResult[]> {
  const results: LawSearchResult[] = [];
  const lower = query.toLowerCase();

  // Find referenced acts
  for (const [alias, slug] of Object.entries(ACT_ALIASES)) {
    if (lower.includes(alias)) {
      try {
        const snap = await adminDb.collection(`laws/${slug}/sections`).orderBy("orderNo").limit(5).get();
        const lawSnap = await adminDb.doc(`laws/${slug}`).get();
        const lawTitle = lawSnap.exists ? lawSnap.data()!.title : slug;
        for (const doc of snap.docs) {
          const d = doc.data();
          results.push({ lawSlug: slug, lawTitle, sectionNo: d.sectionNo, sectionTitle: d.title, content: (d.content || "").substring(0, 500) });
        }
      } catch { /* not found */ }
    }
  }

  // Extract specific section numbers like "Section 302" or "§ 483"
  const sectionMatch = query.match(/(?:section|s\.|§)\s*(\d+[a-z]?)/gi);
  if (sectionMatch) {
    for (const m of sectionMatch) {
      const num = m.replace(/(?:section|s\.|§)\s*/i, "");
      for (const slug of Object.values(ACT_ALIASES)) {
        try {
          const snap = await adminDb.doc(`laws/${slug}/sections/${num}`).get();
          if (snap.exists) {
            const d = snap.data()!;
            const lawSnap = await adminDb.doc(`laws/${slug}`).get();
            results.push({ lawSlug: slug, lawTitle: lawSnap.data()?.title || slug, sectionNo: d.sectionNo, sectionTitle: d.title, content: (d.content || "").substring(0, 500) });
          }
        } catch { /* continue */ }
      }
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  return results.filter((r) => {
    const key = `${r.lawSlug}:${r.sectionNo}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 10);
}

export function formatLawContext(results: LawSearchResult[]): string {
  if (!results.length) return "";
  let ctx = "\n\n--- RELEVANT LAW SECTIONS (from SatyaVera database) ---\n\n";
  for (const r of results) {
    ctx += `[${r.lawTitle}] Section ${r.sectionNo} — ${r.sectionTitle}\n${r.content}\n\n`;
  }
  ctx += "--- END ---\nUse the above law text to ground your response. Cite exact sections.\n";
  return ctx;
}
