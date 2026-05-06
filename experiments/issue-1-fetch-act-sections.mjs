// Experiment for issue #1: fetch one Act's sections from India Code.
//
// Demonstrates that the AJAX endpoint /SectionPageContent on indiacode.nic.in
// returns each section as a JSON document with HTML content + footnotes, and
// that the act handle page lists every (sectionId, sectionno, orderno) tuple
// for the act. With those two endpoints alone we can reconstruct the full
// text of any act without scraping rendered pages.
//
// Run: node experiments/issue-1-fetch-act-sections.mjs
//
// This script does NOT crawl the whole corpus. It fetches one act (Copyright
// Act, 1957) by handle, parses the act page, then fetches the first three
// sections via the AJAX endpoint. The intent is to prove the pipeline shape,
// not to mirror the database.

import https from 'node:https';

const BASE = 'https://www.indiacode.nic.in';
// Copyright Act, 1957 — chosen because the issue and the case study cite it.
const ACT_HANDLE = '/handle/123456789/1367';
const SECTION_LIMIT = 3;

// India Code presents a self-signed-style chain; tolerate that for the
// experiment. A production fetcher would pin the cert / use a proper CA.
const agent = new https.Agent({ rejectUnauthorized: false });

const get = (path) =>
  new Promise((resolve, reject) => {
    https
      .get(
        BASE + path,
        {
          agent,
          headers: {
            'User-Agent': 'gandhi-ai-research-experiment/0.1',
            Accept: 'text/html,application/json',
          },
        },
        (res) => {
          const chunks = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () => {
            const body = Buffer.concat(chunks).toString('utf-8');
            if (res.statusCode !== 200) {
              reject(new Error(`HTTP ${res.statusCode} for ${path}`));
            } else {
              resolve(body);
            }
          });
        }
      )
      .on('error', reject);
  });

const stripTags = (html) =>
  html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const parseActPage = (html) => {
  const actId = (html.match(/actid=(AC_[A-Z0-9_]+)/) || [])[1];
  const title =
    (html.match(/<title>([^<]+)<\/title>/) || [])[1]?.trim() || 'unknown';
  const seen = new Set();
  const sections = [];
  const re =
    /show-data\?[^"']*sectionId=(\d+)[^"']*sectionno=([^&"']+)[^"']*orderno=(\d+)/g;
  let m;
  while ((m = re.exec(html))) {
    const key = m[1];
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    sections.push({
      sectionId: m[1],
      sectionno: decodeURIComponent(m[2]),
      orderno: parseInt(m[3], 10),
    });
  }
  sections.sort((a, b) => a.orderno - b.orderno);
  return { actId, title, sections };
};

const fetchSection = async (actId, sectionId) => {
  const json = await get(
    `/SectionPageContent?actid=${actId}&sectionID=${sectionId}`
  );
  const data = JSON.parse(json);
  return {
    text: stripTags(data.content || ''),
    footnotes: stripTags(data.footnote || ''),
  };
};

const toMarkdown = (act, sections) => {
  const lines = [`# ${act.title}`, '', `Act ID: \`${act.actId}\``, ''];
  for (const s of sections) {
    lines.push(`## Section ${s.sectionno}`, '', s.text, '');
    if (s.footnotes) {
      lines.push('### Footnotes', '', s.footnotes, '');
    }
  }
  return lines.join('\n');
};

const main = async () => {
  console.error(`Fetching act page ${ACT_HANDLE}...`);
  const actHtml = await get(ACT_HANDLE);
  const act = parseActPage(actHtml);
  console.error(
    `Found ${act.sections.length} sections in "${act.title}" (${act.actId})`
  );

  const limited = act.sections.slice(0, SECTION_LIMIT);
  const fetched = [];
  for (const s of limited) {
    console.error(`  fetching section ${s.sectionno} (id=${s.sectionId})`);
    const body = await fetchSection(act.actId, s.sectionId);
    fetched.push({ ...s, ...body });
  }

  const md = toMarkdown(act, fetched);
  process.stdout.write(md);
};

main().catch((err) => {
  console.error('Experiment failed:', err.message);
  process.exit(1);
});
