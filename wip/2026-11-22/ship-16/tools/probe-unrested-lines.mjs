// Ship 16, a probe that reads and writes nothing of the tree: on every zone the record of kinds does not rest shut
// (the Tikkunei Zohar, the commentaries beside a book), the keys whose line the store whole would read otherwise
// now than the zone was baked with, and of those the ones a returning source's row would carry. Run in the reader.
// Usage: node probe-unrested-lines.mjs <reader dir> <M id,...>
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const R = process.argv[2], WATCH = new Set(String(process.argv[3] || "").split(",").filter(Boolean));
const T = join(R, "tools");
const { openRouteStore } = await import(join(T, "gloss-store-v1.mjs"));
const { wordListsOf } = await import(join(T, "zone-walk-v1.mjs"));
const { formsOfRun } = await import(join(T, "weld-forms-v1.mjs"));
const { cellsOf } = await import(join(T, "span-slice-v1.mjs"));
const { readKinds, restsOffIn } = await import(join(T, "dictionary-kinds-v1.mjs"));
const { isSidecar, carriesReaderHebrew } = await import(join(T, "zones-on-disk-v1.mjs"));
const ZONES = join(R, "data", "zones"), STORE = join(R, "data", "route-store");
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const { rec } = readKinds(join(R, "data"));
const store = openRouteStore(STORE);
const zoneKeys = (zone) => {
  const keys = new Set();
  const lists = wordListsOf(zone);
  for (const words of lists) for (const w of words) { if (w.w) w.w.forEach((r) => { if (r.k) keys.add(r.k); }); else if (w.k) keys.add(w.k); if (w.h) keys.add(w.h); }
  for (const n of zone.nodes || []) for (const t of [...(n.name_tokens || []), ...(n.part_tokens || [])]) if (t.k) keys.add(t.k);
  for (const words of lists) {
    let run = [];
    for (const w of words || []) {
      const pj = w.presentation_join; run.push(w);
      if (pj && pj.join_next_without_separator && String(pj.why || "").startsWith("maqaf-rule-v2")) continue;
      if (run.length > 1 && run.every((x) => x.k && !x.kq)) for (const f of formsOfRun(run.map((x) => x.k))) if (f.form !== "pieces") keys.add(f.key);
      run = [];
    }
  }
  for (const row of Object.values(zone.spans || {})) for (const c of cellsOf(row[0])) keys.add(c.surface);
  return keys;
};
// how many places of the zone read each key (a word's key, or its read words' keys)
const placesOf = (zone) => { const n = new Map(); for (const words of wordListsOf(zone)) for (const w of words) { const ks = w.w ? w.w.map((r) => r.k).filter(Boolean) : w.k ? [w.k] : []; for (const k of ks) n.set(k, (n.get(k) || 0) + 1); } return n; };
const out = { zones: 0, keys_read_otherwise: 0, by_a_watched_source: 0, places_by_a_watched_source: 0, by_zone: {}, examples: [] };
for (const f of readdirSync(ZONES).filter((x) => x.endsWith(".bin") && carriesReaderHebrew(x)).sort()) {
  const zone = gz(join(ZONES, f));
  if (!zone.gloss || typeof zone.schema_version !== "string") continue;
  if (!isSidecar(f) && restsOffIn(rec, zone)) continue;   // a book the record rests shut is baked at rest: not this probe's
  out.zones += 1;
  const names = zone.gloss_names || {}, places = placesOf(zone);
  let n = 0, w = 0, wp = 0;
  for (const k of zoneKeys(zone)) {
    const g = store.glossFor(k);
    const want = Object.prototype.hasOwnProperty.call(names, k) ? names[k] : g.text === null ? undefined : g.text;
    if (zone.gloss[k] === want) continue;
    n += 1;
    const rows = (store.routesWhole(k) || []).filter((r) => WATCH.has(String(r[3])));
    if (rows.length && rows.some((r) => String(r[1]) === String(want) || String(want).includes(String(r[1])))) {
      w += 1; wp += places.get(k) || 0;
      if (out.examples.length < 30) out.examples.push({ zone: f, key_sha16: null, was: zone.gloss[k] ?? null, now: want, by: rows.map((r) => String(r[3])), places: places.get(k) || 0 });
    }
  }
  if (n) out.by_zone[f] = { keys_read_otherwise: n, by_a_watched_source: w, places: wp };
  out.keys_read_otherwise += n; out.by_a_watched_source += w; out.places_by_a_watched_source += wp;
}
console.log(JSON.stringify(out, null, 1));
