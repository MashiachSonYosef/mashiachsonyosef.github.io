// A space standing before a stop, counted in the served route store by source: in a row's route text (row[1], what
// the line and the pills print) and in a row's definition text (row[2], what the card prints under the reading and
// what the export carries as "definition"). The dictionary store's own entry text (a record's D) is counted too, and
// said to be the provider's markup where it is.
// node space-before-stop.mjs <reader dir> <source id>...
// Reads every shard of both stores. Nothing is written.
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [reader, ...ids] = process.argv.slice(2);
const shards = (dir) => readdirSync(dir).filter((x) => /^[0-9a-f]{2}\.bin$/u.test(x)).sort().map((f) => JSON.parse(gunzipSync(readFileSync(join(dir, f))).toString("utf8")));
const BEFORE_COMMA = / ,/u, BEFORE_STOP = / [,.;:!?]/u, MARKUP = /<[a-zA-Z][^>]*>/u;
const tally = () => ({ rows: 0, comma: 0, stop: 0, markup: 0, example: null, exampleStopOnly: null });
const count = (t, text) => {
  t.rows += 1;
  const c = BEFORE_COMMA.test(text), s = BEFORE_STOP.test(text);
  if (c) { t.comma += 1; if (!t.example) t.example = text.slice(0, 70); }
  if (s) { t.stop += 1; if (!c && !t.exampleStopOnly) { const at = text.search(BEFORE_STOP); t.exampleStopOnly = text.slice(Math.max(0, at - 30), at + 30); } }
  if (MARKUP.test(text)) t.markup += 1;
};
const say = (m, name, t) => console.log(`  ${m} ${name} · ${t.rows.toLocaleString("en-US")} texts · a space before a comma in ${t.comma.toLocaleString("en-US")} · before some stop in ${t.stop.toLocaleString("en-US")} · markup in ${t.markup.toLocaleString("en-US")}${t.example ? ` · e.g. ${JSON.stringify(t.example)}` : ""}${t.exampleStopOnly ? ` · a stop that is no comma: ${JSON.stringify(t.exampleStopOnly)}` : ""}`);
const route = Object.fromEntries(ids.map((m) => [m, { text: tally(), def: tally(), both: 0, textOnly: 0, defOnly: 0, rows: 0 }]));
const rix = JSON.parse(readFileSync(join(reader, "data/route-store/index.json"), "utf8"));
for (const shard of shards(join(reader, "data/route-store/shards"))) for (const rows of Object.values(shard)) for (const row of rows) {
  const t = route[row[3]]; if (!t) continue;
  const text = String(row[1] == null ? "" : row[1]), def = String(row[2] == null ? "" : row[2]);
  t.rows += 1;
  count(t.text, text); if (def) count(t.def, def);
  const a = BEFORE_COMMA.test(text), b = BEFORE_COMMA.test(def);
  if (a && b) t.both += 1; else if (a) t.textOnly += 1; else if (b) t.defOnly += 1;
}
console.log(`the route store (store ${rix.store_version || "?"}):`);
for (const m of ids) {
  const t = route[m];
  console.log(`  ${m} ${(rix.m_sources[m] || {}).label || "?"} · ${t.rows.toLocaleString("en-US")} rows · a space before a comma in the route text and the definition text ${t.both.toLocaleString("en-US")} · in the route text alone ${t.textOnly.toLocaleString("en-US")} · in the definition text alone ${t.defOnly.toLocaleString("en-US")}`);
  say(m, "the route text", t.text); say(m, "the definition text", t.def);
}
// the dictionary store: each key holds { records: [{ rid, m, headwords, gap, R, D }] }; R is the reading, D the entry
const dix = JSON.parse(readFileSync(join(reader, "data/dictionary-store/index.json"), "utf8"));
const defs = Object.fromEntries(ids.map((m) => [m, { R: tally(), D: tally() }]));
let records = 0;
for (const shard of shards(join(reader, "data/dictionary-store/shards"))) for (const held of Object.values(shard)) for (const rec of (held && held.records) || []) {
  records += 1;
  const t = defs[rec.m]; if (!t) continue;
  for (const f of ["R", "D"]) { const text = String(rec[f] || ""); if (text) count(t[f], text); }
}
console.log(`the dictionary store (${records.toLocaleString("en-US")} records, store ${dix.store_version || "?"}):`);
for (const m of ids) { say(m, "a record's reading (R)", defs[m].R); say(m, "a record's entry (D)", defs[m].D); }
