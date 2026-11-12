// From a chain-vs-card dump: the readings the chain's rule gives a word (the store's own pool for its key, as the
// chain builder asks for it) that no pill of the word's card prints, even by its printed form; with the sources
// behind each, so the kind of reading the card leaves out can be seen. And the reverse: pills whose printed form the
// store's pool does not hold.
// node chain-only.mjs <reader dir> <dump.json> [--show n]
// Nothing is written. It lists; it does not judge.
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { readFileSync } from "node:fs";
const argv = process.argv.slice(2);
const si = argv.indexOf("--show"); const SHOW = si >= 0 ? Number(argv[si + 1]) : 40; if (si >= 0) argv.splice(si, 2);
const [reader, dumpPath] = argv;
const { openRouteStore, readingKey, printedForm } = await import(pathToFileURL(join(reader, "tools", "gloss-store-v1.mjs")).href);
const store = openRouteStore(join(reader, "data/route-store"));
const ms = store.index.m_sources;
const dump = JSON.parse(readFileSync(dumpPath, "utf8"));
let chainOnly = 0, cardOnly = 0, both = 0, cardOnlyOverlay = 0;
const bySource = new Map(), lines = [], cardLines = [], shapes = new Map();
for (const c of dump.cards) {
  if (!c.pool) continue;
  const rows = (store.routesFor(c.k) || []).filter((r) => ms[r[3]]);
  const pool = rows.length ? store.readingPool(rows, "oldest") : [];
  const pills = new Set(c.pool.map((t) => String(t).toLowerCase()));
  const poolKeys = new Set(pool.map((p) => readingKey(p.text)));
  for (const p of pool) {
    if (pills.has(readingKey(p.text))) { both += 1; continue; }
    chainOnly += 1;
    for (const m of p.by) bySource.set(m, (bySource.get(m) || 0) + 1);
    const shape = /[<\[¿~]|^(X|×|\+) /u.test(p.text) ? "carries a source's sign" : /[֐-׿]/u.test(p.text) ? "quotes Hebrew letters" : p.text.length > 120 ? "longer than 120 characters" : "plain";
    shapes.set(shape, (shapes.get(shape) || 0) + 1);
    if (lines.length < SHOW) lines.push(`${c.at} ${c.k} · ${JSON.stringify(printedForm(p.text).slice(0, 90))} · ${p.by.join(" ")} · ${shape}`);
  }
  c.pool.forEach((t, x) => { if (poolKeys.has(String(t).toLowerCase())) return; cardOnly += 1; if (c.ov[x]) cardOnlyOverlay += 1; else if (cardLines.length < SHOW) cardLines.push(`${c.at} ${c.k} · ${JSON.stringify(String(t).slice(0, 90))} · credited ${c.lead[x]} · by ${c.by[x]}`); });
}
console.log(`${dump.book} · ${dump.cards.length} cards · switches ${dump.lift ? "lifted" : "at rest"}`);
console.log(`  readings in both, by the printed form: ${both}`);
console.log(`  in the store's pool and on no pill: ${chainOnly} · ${[...shapes].map(([k, n]) => `${k} ${n}`).join(" · ")}`);
console.log(`     by source: ${[...bySource].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([m, n]) => `${m} ${n}`).join(" · ")}`);
for (const l of lines) console.log(`     ${l}`);
console.log(`  on a pill and not in the store's pool: ${cardOnly} · ${cardOnlyOverlay} of them an overlay's alone`);
for (const l of cardLines) console.log(`     ${l}`);
