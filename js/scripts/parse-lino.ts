/**
 * .lino (Links Notation) parser for Indian Law repository data.
 *
 * Parses the nested object notation format used in:
 *   github.com/Svetozar-Technologies/indian-law
 *
 * Format:
 *   obj_name:
 *     key value
 *     key `backtick-quoted value`
 *     key (numeric-as-string)
 *     key obj_reference
 *     string       ← starts a multiline string block
 *     line `text`   ← line within a string block
 *     line          ← blank line in string block
 */

export interface LinoObject {
  [key: string]: string | number | boolean | null | LinoObject | LinoObject[];
}

export interface ParsedLaw {
  slug: string;
  title: string;
  hindiTitle?: string;
  actNumber?: number;
  actYear?: number;
  ministry?: string;
  department?: string;
  longTitle?: string;
  enactmentDate?: string;
  enforcementDate?: string;
  sourceUrl?: string;
  fetchedAt?: string;
  sectionCount: number;
  sections: ParsedSection[];
}

export interface ParsedSection {
  sectionId?: string;
  sectionNo: string;
  orderNo: number;
  title: string;
  content: string;
  footnotes?: string;
}

interface RawBlock {
  name: string;
  entries: Array<{ key: string; value: string }>;
  children: string[]; // unnamed child references (array items)
}

export function parseLinoFile(text: string): Map<string, RawBlock> {
  const blocks = new Map<string, RawBlock>();
  let currentBlock: RawBlock | null = null;

  const lines = text.split("\n");
  for (const rawLine of lines) {
    // Block header: "obj_name:"
    const blockMatch = rawLine.match(/^(\S+):$/);
    if (blockMatch) {
      currentBlock = { name: blockMatch[1], entries: [], children: [] };
      blocks.set(blockMatch[1], currentBlock);
      continue;
    }

    if (!currentBlock) continue;

    // Indented entry: "  key value"
    const entryMatch = rawLine.match(/^  (\S+)\s*(.*)$/);
    if (entryMatch) {
      const key = entryMatch[1];
      const val = entryMatch[2].trim();

      // Check if this is an unnamed child reference (starts with obj_ prefix)
      if (!val && key.startsWith("obj_")) {
        currentBlock.children.push(key);
      } else if (val === "" && key.startsWith("obj_")) {
        currentBlock.children.push(key);
      } else if (key === "string") {
        // Start of multiline string — handled by subsequent "line" entries
        currentBlock.entries.push({ key: "__multiline__", value: "" });
      } else if (key === "line") {
        // Line within a multiline string block
        const lastEntry = currentBlock.entries[currentBlock.entries.length - 1];
        if (lastEntry && lastEntry.key === "__multiline__") {
          const lineText = unquote(val);
          lastEntry.value += (lastEntry.value ? "\n" : "") + lineText;
        }
      } else {
        currentBlock.entries.push({ key, value: val });
      }
      continue;
    }

    // Bare child reference on indented line: "  obj_reference_name"
    const childMatch = rawLine.match(/^  (\S+)\s*$/);
    if (childMatch && childMatch[1].startsWith("obj_")) {
      currentBlock?.children.push(childMatch[1]);
    }
  }

  return blocks;
}

function unquote(val: string): string {
  if (val.startsWith("`") && val.endsWith("`")) {
    return val.slice(1, -1);
  }
  if (val.startsWith("(") && val.endsWith(")")) {
    return val.slice(1, -1); // numeric-as-string wrapper
  }
  return val;
}

function resolveValue(val: string, blocks: Map<string, RawBlock>): string {
  const unquoted = unquote(val);
  return unquoted;
}

function resolveMultilineFromBlock(block: RawBlock): string | null {
  const mlEntry = block.entries.find((e) => e.key === "__multiline__");
  return mlEntry ? mlEntry.value : null;
}

export function extractLaw(blocks: Map<string, RawBlock>): ParsedLaw | null {
  const root = blocks.get("obj_root");
  if (!root) return null;

  // Find the law block reference
  const lawRef = root.entries.find((e) => e.key === "law")?.value;
  if (!lawRef) return null;

  const lawBlock = blocks.get(lawRef);
  if (!lawBlock) return null;

  const get = (key: string): string | undefined => {
    const entry = lawBlock.entries.find((e) => e.key === key);
    return entry ? resolveValue(entry.value, blocks) : undefined;
  };

  const slug = get("slug") || "";
  const title = get("title") || "";
  const sectionCountStr = root.entries.find((e) => e.key === "sectionCount")?.value;
  const sectionCount = sectionCountStr ? parseInt(unquote(sectionCountStr), 10) || 0 : 0;

  // Find sections block reference
  const sectionsRef = lawBlock.entries.find((e) => e.key === "sections")?.value;
  const sectionsBlock = sectionsRef ? blocks.get(sectionsRef) : null;

  const sections: ParsedSection[] = [];

  if (sectionsBlock) {
    // Sections block has child references to individual section blocks
    for (const childRef of sectionsBlock.children) {
      const sectionBlock = blocks.get(childRef);
      if (!sectionBlock) continue;

      const secGet = (key: string): string | undefined => {
        const entry = sectionBlock.entries.find((e) => e.key === key);
        return entry ? resolveValue(entry.value, blocks) : undefined;
      };

      // Get content — either inline or from a referenced content block
      let content = secGet("content") || "";
      const contentRef = sectionBlock.entries.find((e) => e.key === "content")?.value;
      if (contentRef && blocks.has(contentRef)) {
        const contentBlock = blocks.get(contentRef)!;
        const ml = resolveMultilineFromBlock(contentBlock);
        if (ml) content = ml;
      }

      // Get footnotes — either inline or from a referenced block
      let footnotes = secGet("footnotes") || "";
      const footnotesRef = sectionBlock.entries.find((e) => e.key === "footnotes")?.value;
      if (footnotesRef && blocks.has(footnotesRef)) {
        const footnotesBlock = blocks.get(footnotesRef)!;
        const ml = resolveMultilineFromBlock(footnotesBlock);
        if (ml) footnotes = ml;
      }

      const orderNoStr = secGet("orderNo");

      sections.push({
        sectionId: secGet("sectionId"),
        sectionNo: secGet("sectionNo") || String(sections.length + 1),
        orderNo: orderNoStr ? parseInt(orderNoStr, 10) || sections.length + 1 : sections.length + 1,
        title: secGet("title") || "",
        content,
        footnotes: footnotes || undefined,
      });
    }
  }

  return {
    slug,
    title,
    hindiTitle: get("hindiTitle"),
    actNumber: get("actNumber") ? parseInt(get("actNumber")!, 10) : undefined,
    actYear: get("actYear") ? parseInt(get("actYear")!, 10) : undefined,
    ministry: get("ministry"),
    department: get("department"),
    longTitle: get("longTitle"),
    enactmentDate: get("enactmentDate"),
    enforcementDate: get("enforcementDate"),
    sourceUrl: get("sourceUrl"),
    fetchedAt: get("fetchedAt") || root.entries.find((e) => e.key === "fetchedAt")?.value,
    sectionCount: sections.length || sectionCount,
    sections,
  };
}
