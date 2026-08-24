#!/usr/bin/env node
// emit-corpus-atlas-v1 · the whole library, placed, before it is built
//
// The door's job grew: not only what the zones carry, but where everything
// else in the corpus will stand when it arrives. This tool reads one sealed
// input — the C0 location/source bridge — and emits the atlas the door
// renders from: every corpus family, every work inside it, each with the
// measures the bridge itself records (units, c0 rows, where its range
// begins). Nothing here is typed: a family is the bridge's corpus_family
// column, a work is its work_id, a count is a sum over its rows. The
// bridge's sha256 rides in the receipt so the atlas can be rebuilt and
// compared byte for byte.
//
// Order is recorded, not chosen: works stand in c0 order — the chain's own
// sequence — and the file carries per-family totals so a page can order
// families by measure without recounting.
//
// Usage: node tools/emit-corpus-atlas-v1.mjs --bridge <bridge.csv.gz> [--out data/corpus-atlas-v1.json]
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";

const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : dflt;
};
const BRIDGE = arg("bridge");
const OUT = arg("out", "data/corpus-atlas-v1.json");
if (!BRIDGE) throw new Error("--bridge is required — the atlas is a projection of the bridge and nothing else");

const raw = readFileSync(BRIDGE);
const bridgeSha = createHash("sha256").update(raw).digest("hex");
const text = gunzipSync(raw).toString("utf8");

const lines = text.split(/\r?\n/).filter((l) => l.length);
const head = lines[0].split(",");
const col = (n) => {
  const i = head.indexOf(n);
  if (i < 0) throw new Error(`bridge carries no "${n}" column — refusing to guess its shape`);
  return i;
};
const cWork = col("work_id"), cFam = col("corpus_family"), cRows = col("c0_rows"),
  cMin = col("min_c0_numeric_id"), cMax = col("max_c0_numeric_id");

const works = new Map();   // work_id -> {family, units, c0_rows, c0_first, c0_last}
for (let i = 1; i < lines.length; i += 1) {
  const r = lines[i].split(",");
  const id = r[cWork];
  if (!id) continue;
  let w = works.get(id);
  if (!w) { w = { family: r[cFam], units: 0, c0_rows: 0, c0_first: Infinity, c0_last: -Infinity }; works.set(id, w); }
  if (w.family !== r[cFam])
    throw new Error(`${id} carries two families in the bridge (${w.family}, ${r[cFam]}) — the record must agree with itself`);
  w.units += 1;
  w.c0_rows += Number(r[cRows]) || 0;
  const lo = Number(r[cMin]), hi = Number(r[cMax]);
  if (lo < w.c0_first) w.c0_first = lo;
  if (hi > w.c0_last) w.c0_last = hi;
}

const families = new Map();
for (const [id, w] of works) {
  let f = families.get(w.family);
  if (!f) { f = { works: [], units: 0, c0_rows: 0 }; families.set(w.family, f); }
  f.works.push({ id, units: w.units, c0_rows: w.c0_rows, c0_first: w.c0_first });
  f.units += w.units;
  f.c0_rows += w.c0_rows;
}
for (const f of families.values()) f.works.sort((a, b) => a.c0_first - b.c0_first);

const doc = {
  schema_version: "CORPUS_ATLAS_V1",
  emitted_by: "tools/emit-corpus-atlas-v1.mjs",
  rule: "every family is the bridge's corpus_family column, every work its work_id, every count a sum over its rows; works stand in c0 order, the chain's own sequence; nothing below is typed",
  derived_from: { bridge: BRIDGE.split("/").pop(), bridge_sha256: bridgeSha },
  totals: {
    families: families.size,
    works: works.size,
    units: [...families.values()].reduce((t, f) => t + f.units, 0),
    c0_rows: [...families.values()].reduce((t, f) => t + f.c0_rows, 0),
  },
  families: Object.fromEntries([...families.entries()].map(([k, f]) => [k,
    { works: f.works, units: f.units, c0_rows: f.c0_rows }])),
};
const out = JSON.stringify(doc) + "\n";
// The bridge's own work ids carry Hebrew — a Project Ben-Yehuda work is
// titled inside its id — and carrying a record's id is carrying the record.
// So the guard is provenance, not absence: strip every id the bridge
// actually carries, and refuse any Hebrew that remains, because that
// Hebrew would be nobody's.
let scrubbed = out;
for (const id of works.keys()) if (/[\u0590-\u05FF]/.test(id)) scrubbed = scrubbed.split(JSON.stringify(id).slice(1, -1)).join("");
if (/[\u0590-\u05FF]/.test(scrubbed)) throw new Error("the atlas carries a character of the text that is not a bridge work id — refusing output");
writeFileSync(OUT, out);
console.log(`${OUT} · ${doc.totals.families} families · ${doc.totals.works.toLocaleString()} works · ${doc.totals.units.toLocaleString()} units · ${doc.totals.c0_rows.toLocaleString()} c0 rows · bridge ${bridgeSha.slice(0, 16)}…`);
