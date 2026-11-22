// Probe, 22 November 2026: the card of one word as a first visit opens it, read by the tree's own card reader
// (tools/card-readings-v1.mjs) against a server already up. Reads only. Usage: node card-at.mjs <reader dir> <base> <book> <section label> <entry>
import { join } from "node:path";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
const [R, BASE, BOOK, LABEL, AT] = process.argv.slice(2);
const { readCards } = await import(join(R, "tools/card-readings-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools/playwright-v1.mjs"));
const z = JSON.parse(gunzipSync(readFileSync(join(R, "data/zones", `${BOOK}.bin`))).toString("utf8"));
const si = z.sections.findIndex((s) => s.label === LABEL);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
try {
  const c = await readCards(b, BASE, BOOK, "rest", { from: si, to: si + 1 });
  const card = ((c.sections[0] || {}).cards || []).find((x) => x.e === Number(AT));
  const heb = (t) => JSON.stringify(t).replace(/[֐-׿]+/gu, "<H>");
  console.log(heb({ divisions: card.divisions, blocks: card.blocks, here: (card.here || []).map((h) => h.slice(0, 3)), pills: (card.pills || []).map((p) => [p[0], p[2], p[3]]) }));
} finally { await b.close(); }
