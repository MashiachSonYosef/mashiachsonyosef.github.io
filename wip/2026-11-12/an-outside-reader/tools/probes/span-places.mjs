// Every place the span store joins words at, in every book it serves: the key, the row that leads the line (the
// first in the store's order), its source, and beside it what the place's own source reads for the same words
// (the zone's place pieces), so the two can be read side by side.
// node span-places.mjs <reader dir> [--tsv out.tsv]
// Nothing is written but the table asked for. It lists; it does not judge.
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const argv = process.argv.slice(2);
const ti = argv.indexOf("--tsv"); const TSV = ti >= 0 ? argv[ti + 1] : null; if (ti >= 0) argv.splice(ti, 2);
const R = argv[0];
const ix = JSON.parse(readFileSync(join(R, "data/route-store/index.json"), "utf8"));
const label = (m) => (ix.m_sources[m] && ix.m_sources[m].label) || m;
const rows = [];
const bySource = new Map(), byKind = new Map();
let books = 0, places = 0, allPlaced = 0;
for (const f of readdirSync(join(R, "data/span-store")).filter((x) => x.endsWith(".json") && x !== "index.json").sort()) {
  const book = f.replace(/\.json$/u, "");
  const zp = join(R, "data/zones", `${book}.bin`);
  if (!existsSync(zp)) continue;
  const d = JSON.parse(readFileSync(join(R, "data/span-store", f), "utf8"));
  if (!Array.isArray(d.placesList)) continue;
  const z = JSON.parse(gunzipSync(readFileSync(zp)).toString("utf8"));
  const sec = new Map((z.sections || []).map((s) => [s.label, s]));
  books += 1;
  for (const p of d.placesList) {
    const list = (d.keys || {})[p.key] || [];
    const lead = list[0];
    if (!lead) continue;
    places += 1;
    const s = sec.get(p.ref);
    // the store counts a verse's words with the scribal marks left out (the page's own numbering)
    const words = s ? (s.words || []).filter((w) => !w.mark).slice(p.first - 1, p.last) : [];
    const own = words.map((w) => (Array.isArray(w.pg) && w.pg.length ? w.pg.map((x) => String(x.g || "").trim()).join(" + ") : null));
    const placed = own.length > 0 && own.every((x) => x !== null && x !== "");
    if (placed) allPlaced += 1;
    const m = lead.slots[3];
    bySource.set(m, (bySource.get(m) || 0) + 1);
    byKind.set(lead.order_kind, (byKind.get(lead.order_kind) || 0) + 1);
    rows.push([book, p.ref, `${p.first}-${p.last}`, p.key, words.map((w) => w.s).join(" "), lead.slots[1], m, label(m), lead.order_kind, list.length, placed ? own.join(" | ") : "(a word here has no place reading)"]);
  }
}
console.log(`${books} books · ${places} places where the span store joins words · at ${allPlaced} every joined word has its own place reading`);
console.log(`the leading row's source: ${[...bySource].sort((a, b) => b[1] - a[1]).map(([m, n]) => `${m} ${label(m)} ${n}`).join("\n  ")}`);
console.log(`the leading row's kind: ${[...byKind].map(([k, n]) => `${k} ${n}`).join(" · ")}`);
if (TSV) { writeFileSync(TSV, `${["book", "ref", "words", "key", "as written", "the line reads", "m", "source", "kind", "rows", "the place's own reading"].join("\t")}\n${rows.map((r) => r.join("\t")).join("\n")}\n`); console.log(`table: ${TSV} (${rows.length} rows)`); }
