// Ship 10b scoping: every place of the span store with whether it stands at rest by ship 10a's rule, as JSON.
// node places-list.mjs <reader dir> <out.json>
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
const list = [];
for (const f of readdirSync(join(K3, "data", "span-store")).filter((x) => x.endsWith(".json") && x !== "index.json").sort()) {
  const d = JSON.parse(readFileSync(join(K3, "data", "span-store", f), "utf8"));
  for (const pl of d.placesList || []) {
    const all = d.keys[pl.key] || [];
    const rows = all.filter((r) => !offIds.has(r.slots[3]) && !restsOff(r.slots));
    const line = rows.find((r) => !r.form_of && !(pl.held && HELD.has(pl.held[r.row_id])));
    list.push({ book: f.replace(/\.json$/, ""), ref: pl.ref, first: pl.first, last: pl.last, key: pl.key, stands: !!line, line_m: line ? line.slots[3] : null, line_text: line ? line.slots[1] : null,
      why: line ? null : !rows.length ? "every row rests shut" : rows.some((r) => !r.form_of) ? "held back by the place" : "only a pointer", open_ms: [...new Set(rows.map((r) => r.slots[3]))], all_ms: [...new Set(all.map((r) => r.slots[3]))],
      held: pl.held || null, inside_of: pl.inside_of || null });
  }
}
writeFileSync(out, JSON.stringify(list));
console.log(list.length, "places ·", list.filter((x) => x.stands).length, "stand");
