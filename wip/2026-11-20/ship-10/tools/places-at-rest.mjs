// Ship 10: over every book's span file, the places where a row stands at rest (a cell) and the places set aside,
// by the rule the page reads (spanLineRow under «only this pointing»: a row that does not rest shut, of a source
// not resting off, no pointer, not held back by the place). node places-at-rest.mjs <reader dir> [out.tsv]
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const [K3, out] = process.argv.slice(2);
const { restsOffOf, readKinds } = await import(pathToFileURL(join(K3, "tools", "dictionary-kinds-v1.mjs")).href);
const ix = JSON.parse(readFileSync(join(K3, "data", "route-store", "index.json"), "utf8"));
const spanIx = JSON.parse(readFileSync(join(K3, "data", "span-store", "index.json"), "utf8"));
const ms = { ...ix.m_sources, ...(spanIx.m_sources || {}) };
const restsOff = restsOffOf(readKinds(join(K3, "data")).rec, ix.m_sources, () => null);
const offKeys = new Set(Object.keys(JSON.parse(readFileSync(join(K3, "data", "source-defaults-v1.json"), "utf8")).off || {}));
const offIds = new Set(Object.entries(ms).filter(([, m]) => m && offKeys.has(m.key)).map(([id]) => id));
const HELD = new Set(["otherwise", "silent"]);
const lines = [["book", "places", "cells at rest", "set aside", "of them: every row rests shut", "a row stands but the place holds it back", "only a pointer stands"].join("\t")];
const tot = { places: 0, stand: 0, aside: 0, shut: 0, held: 0, pointer: 0 };
const bySource = new Map(), keysStanding = new Map();
for (const f of readdirSync(join(K3, "data", "span-store")).filter((x) => x.endsWith(".json") && x !== "index.json").sort()) {
  const d = JSON.parse(readFileSync(join(K3, "data", "span-store", f), "utf8"));
  const c = { places: 0, stand: 0, aside: 0, shut: 0, held: 0, pointer: 0 };
  for (const pl of d.placesList || []) {
    c.places += 1;
    const rows = (d.keys[pl.key] || []).filter((r) => !offIds.has(r.slots[3]) && !restsOff(r.slots));
    const line = rows.find((r) => !r.form_of && !(pl.held && HELD.has(pl.held[r.row_id])));
    if (line) {
      c.stand += 1;
      const key = (ms[line.slots[3]] || {}).key || line.slots[3];
      bySource.set(key, (bySource.get(key) || 0) + 1);
      keysStanding.set(pl.key, (keysStanding.get(pl.key) || 0) + 1);
    } else {
      c.aside += 1;
      if (!rows.length) c.shut += 1; else if (rows.some((r) => !r.form_of)) c.held += 1; else c.pointer += 1;
    }
  }
  for (const k of Object.keys(tot)) tot[k] += c[k];
  lines.push([f.replace(/\.json$/, ""), c.places, c.stand, c.aside, c.shut, c.held, c.pointer].join("\t"));
}
lines.push(["ALL", tot.places, tot.stand, tot.aside, tot.shut, tot.held, tot.pointer].join("\t"));
if (out) writeFileSync(out, lines.join("\n") + "\n");
console.log(lines[0]); console.log(lines[lines.length - 1]);
console.log("distinct keys standing:", keysStanding.size);
console.log("the row a standing place's line reads, by source:", [...bySource.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(", "));
