// Plan of 17 November, section 1, day 1: at rest under «only» on the 39 books (the live tree's own gates: the entry
// gate, the names gate, the pointing gate with v5 and the unpointed rule), per source: rows standing, and of them rows
// that carry an entry (row facts n); per place: whether every standing row is of the place's own entry, and how many
// distinct readings stand (the store's alone; the dictionaries beside the store are not counted). Read-only.
// usage: node measure-entries.mjs <reader dir> <out.json>
import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [RD, OUT] = process.argv.slice(2);
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const { openRouteStore } = await import(join(RD, "tools/gloss-store-v1.mjs"));
const { placeEntry, bdbEntriesAt, entryVerdict } = await import(join(RD, "tools/entry-gate-v1.mjs"));
const { nameWithheld } = await import(join(RD, "tools/names-gate-v1.mjs"));
const { gradeRow, isPointed, heldByPointing } = await import(join(RD, "tools/pointing-grade-v1.mjs"));
const rest = openRouteStore(join(RD, "data/route-store"), { atRest: true });
const MS = rest.index.m_sources;
const factsOf = (row) => { const f = Array.isArray(row) && row.length > 10 ? row[10] : null; return f && typeof f === "object" && !Array.isArray(f) ? f : null; };
const hasEntry = (row) => { const n = (factsOf(row) || {}).n; return Array.isArray(n) ? n.length > 0 : !!n; };
const tagHolder = (word, key) => { if (!word) return null; if (word.tg) return word; const t = (word.w || word.kqw || []).filter((r) => r && r.tg); return t.find((r) => r.k === key) || t[0] || null; };
const tagsAt = (word, key) => { const h = tagHolder(word, key); return h && key && h.k === key ? [].concat(h.tg) : null; };
const books = Object.keys(JSON.parse(readFileSync(join(RD, "data/default-picks/index.json"), "utf8")).books);
const by = new Map(); const B = (m) => { if (!by.has(m)) by.set(m, { label: ((MS[m] || {}).label || "?").slice(0, 70), standing: 0, with_entry: 0 }); return by.get(m); };
const T = { places: 0, judged: 0, with_place_entry: 0, all_standing_of_own_entry: 0, all_standing_carry_entry: 0, no_row_standing: 0 };
const readings = []; const srcs = []; const bible = []; const BIBLE = new Set(['M3','M4','M14','M46','M5','M18','M9','M17','M45','M19','M33']);
const norm = (t) => String(t || "").trim().toLowerCase().replace(/[.;,:]+$/u, "");
for (const book of books) {
  const zone = gz(join(RD, "data/zones", `${book}.bin`));
  for (const sec of zone.sections || []) for (const w of sec.words || []) {
    if (w.mark) continue;
    T.places += 1;
    if (w.kq || !w.k || !w.s || !isPointed(w.s)) continue;
    const all = rest.routesFor(w.k) || [];
    if (!all.length) continue;
    T.judged += 1;
    let routes = all; const ofThis = new Set();
    const tags = tagsAt(w, w.k); const place = tags ? placeEntry(tags) : null;
    if (place) {
      T.with_place_entry += 1;
      const bdbHere = bdbEntriesAt(place, all.map(factsOf));
      const v = all.map((r) => entryVerdict(factsOf(r), place, bdbHere));
      routes = all.filter((r, i) => v[i] !== "other");
      all.forEach((r, i) => { if (v[i] === "this") ofThis.add(r); });
    }
    if (!w.np) routes = routes.filter((r) => !nameWithheld(factsOf(r), false));
    const g = new Map(all.map((r) => [r, gradeRow(r, w.s, true)]));
    const attested = [...g.values()].includes("m");
    const standing = attested ? routes.filter((r) => ofThis.has(r) || !heldByPointing(g.get(r))) : routes;
    if (!standing.length) { T.no_row_standing += 1; continue; }
    for (const r of standing) { const b = B(r[3]); b.standing += 1; if (hasEntry(r)) b.with_entry += 1; }
    if (place && standing.every((r) => ofThis.has(r))) T.all_standing_of_own_entry += 1;
    if (standing.every(hasEntry)) T.all_standing_carry_entry += 1;
    readings.push(new Set(standing.map((r) => norm(r[1]))).size); srcs.push(new Set(standing.map((r) => r[3])).size); bible.push(new Set(standing.filter((r) => BIBLE.has(r[3])).map((r) => r[3])).size);
  }
}
readings.sort((a, b) => a - b); srcs.sort((a, b) => a - b); bible.sort((a, b) => a - b); const qq = (a, p) => a[Math.min(a.length - 1, Math.floor(p * a.length))];
const q = (p) => readings[Math.min(readings.length - 1, Math.floor(p * readings.length))];
const rows = [...by.entries()].map(([m, o]) => ({ m, ...o, share: o.standing ? +(o.with_entry / o.standing).toFixed(3) : 0 })).sort((a, b) => b.standing - a.standing);
const tot = rows.reduce((t, r) => ({ s: t.s + r.standing, e: t.e + r.with_entry }), { s: 0, e: 0 });
const out = { tree: RD, places: T, rows_standing: tot.s, rows_with_entry: tot.e, share_with_entry: +(tot.e / tot.s).toFixed(3), readings_at_rest_per_place: { median: q(0.5), p90: q(0.9), p99: q(0.99), max: readings[readings.length - 1] }, by_source: rows };
writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log(JSON.stringify({ sources_per_card: { median: qq(srcs, .5), p90: qq(srcs, .9), max: srcs[srcs.length - 1] }, bible_dictionaries_per_card: { median: qq(bible, .5), p90: qq(bible, .9), max: bible[bible.length - 1] } })); console.log(JSON.stringify({ places: T, rows_standing: tot.s, with_entry: tot.e, share: out.share_with_entry, readings: out.readings_at_rest_per_place }));
for (const r of rows.slice(0, 22)) console.log(r.m.padEnd(6), String(r.standing).padStart(9), String(r.with_entry).padStart(9), String(r.share).padStart(6), r.label);
