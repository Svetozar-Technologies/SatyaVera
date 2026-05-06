// Experiment for issue #1: enumerate Central Acts on India Code.
//
// The "simple-search" page on indiacode.nic.in returns paginated HTML rows,
// each row exposing the handle id and the short title of an act. By walking
// these pages we can build a manifest of every Central Act, which is the
// first step before fetching individual sections.
//
// Run: node experiments/issue-1-discover-acts.mjs
//
// This experiment fetches a single page (10 rows) so it stays fast and
// polite. Paginating to the end is left to a future production crawler.

import https from 'node:https';

const BASE = 'https://www.indiacode.nic.in';
const PATH =
  '/handle/123456789/1362/simple-search?query=&searchradio=acts&rpp=10';
const agent = new https.Agent({ rejectUnauthorized: false });

const get = (path) =>
  new Promise((resolve, reject) => {
    https
      .get(
        BASE + path,
        {
          agent,
          headers: { 'User-Agent': 'gandhi-ai-research-experiment/0.1' },
        },
        (res) => {
          const chunks = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () => {
            if (res.statusCode !== 200) {
              reject(new Error(`HTTP ${res.statusCode}`));
            } else {
              resolve(Buffer.concat(chunks).toString('utf-8'));
            }
          });
        }
      )
      .on('error', reject);
  });

const stripCell = (cell) =>
  cell
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

const parseRows = (html) => {
  const acts = [];
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
  const cellRe = /<td[^>]*>([\s\S]*?)<\/td>/g;
  let row;
  while ((row = rowRe.exec(html))) {
    const inner = row[1];
    const handle = (inner.match(/handle\/123456789\/(\d+)/) || [])[1];
    // Skip the parent collection row (1362) and header rows without handles.
    if (!handle || handle === '1362') {
      continue;
    }
    const cells = [];
    let cell;
    cellRe.lastIndex = 0;
    while ((cell = cellRe.exec(inner))) {
      cells.push(stripCell(cell[1]));
    }
    // Observed shape: [enactmentDate, actNumber, shortTitle, "View..."]
    if (cells.length < 3) {
      continue;
    }
    acts.push({
      handle,
      url: `${BASE}/handle/123456789/${handle}`,
      enactmentDate: cells[0],
      actNumber: cells[1],
      shortTitle: cells[2],
    });
  }
  return acts;
};

const main = async () => {
  console.error('Fetching first page of acts list...');
  const html = await get(PATH);
  const acts = parseRows(html);
  console.error(`Parsed ${acts.length} acts on page 1.`);
  process.stdout.write(`${JSON.stringify(acts, null, 2)}\n`);
};

main().catch((err) => {
  console.error('Experiment failed:', err.message);
  process.exit(1);
});
