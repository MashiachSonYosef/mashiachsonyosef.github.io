// Task 84: the joining dagesh. At every word place of the 39 books whose first letter carries a dagesh in a letter
// other than b g d k p t and vav, under "only this pointing" at rest: which rows stand today, and which would stand if
// the grade set that dagesh aside (as it sets aside the dagesh lene). The place's entry and the names gate are asked
// first, as on the page; a row of the place's own entry stays whatever its points; the gate acts only where some row
// points as the place. Ketiv/qere words are counted apart. Read-only.
import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [RD, OUT] = process.argv.slice(2);
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const { openRouteStore } = await import(join(RD, "tools/gloss-store-v1.mjs"));
const { placeEntry, bdbEntriesAt, entryVerdict } = await import(join(RD, "tools/entry-gate-v1.mjs"));
const { nameWithheld } = await import(join(RD, "tools/names-gate-v1.mjs"));
const { gradeRow, isPointed, vowelForm, rowCarriesHeadwords } = await import(join(RD, "tools/pointing-grade-v1.mjs"));
// the proposed form: a dagesh on the first letter is set aside whatever the letter, except on a vav
const vowelForm2 = (t) => vowelForm(t).replace(/^([\u05D0-\u05D4\u05D6-\u05EA][\u05B0-\u05BB\u05C1\u05C2]*)\u05BC/u, "$1");
const gradeRow2 = (row, surface) => { if (!rowCarriesHeadwords(row)) return "-"; const V = row[6].filter(isPointed).map(vowelForm2); if (!V.length) return "n"; return V.includes(vowelForm2(surface)) ? "m" : "x"; };
const rest = openRouteStore(join(RD, "data/route-store"), { atRest: true });
const MS = rest.index.m_sources;
const factsOf = (row) => { const f = Array.isArray(row) && row.length > 10 ? row[10] : null; return f && typeof f === "object" && !Array.isArray(f) ? f : null; };
const tagHolder = (word, key) => { if (!word) return null; if (word.tg) return word; const t = (word.w || word.kqw || []).filter((r) => r && r.tg); return t.find((r) => r.k === key) || t[0] || null; };
const readWordOfSeveral = (word, r) => r !== word && r.role === "QERE" && (word.w || word.kqw || []).filter((x) => x && x.role === "QERE").length > 1;
const tagsAt = (word, key) => { const h = tagHolder(word, key); return h && key && h.k === key && !readWordOfSeveral(word, h) ? [].concat(h.tg) : null; };
const books = Object.keys(JSON.parse(readFileSync(join(RD, "data/default-picks/index.json"), "utf8")).books);
const T = { words_joining_dagesh: 0, kq: 0, no_rows: 0, judged: 0, places_changed: 0, rows_back: 0, rows_newly_held: 0, places_bare_today: 0, places_bare_after: 0 };
const bySrc = new Map(); const ex = [];
const first = (s) => vowelForm(s).match(/^([\u05D0-\u05EA])[\u05B0-\u05BB\u05C1\u05C2]*\u05BC/u);
for (const book of books) {
  const zone = gz(join(RD, "data/zones", `${book}.bin`));
  for (const sec of zone.sections || []) for (const w of sec.words || []) {
    if (w.mark || !w.s) continue;
    const m = first(w.s);
    if (!m || "\u05D5".includes(m[1])) continue;   // vav: the shureq; b g d k p t already set aside by vowelForm
    T.words_joining_dagesh += 1;
    if (w.kq) { T.kq += 1; continue; }
    const k = w.k, s = w.s;
    const all = rest.routesFor(k) || [];
    if (!all.length) { T.no_rows += 1; continue; }
    T.judged += 1;
    const tags = tagsAt(w, k);
    let routes = all; const ofThis = new Set();
    if (tags) { const place = placeEntry(tags); if (place) { const bdbHere = bdbEntriesAt(place, all.map(factsOf)); const v = all.map((r) => entryVerdict(factsOf(r), place, bdbHere)); routes = all.filter((r, i) => v[i] !== "other"); all.forEach((r, i) => { if (v[i] === "this") ofThis.add(r); }); } }
    if (!w.np) routes = routes.filter((r) => !nameWithheld(factsOf(r), false));
    const g1 = new Map(all.map((r) => [r, gradeRow(r, s)])), g2 = new Map(all.map((r) => [r, gradeRow2(r, s)]));
    const att1 = [...g1.values()].includes("m"), att2 = [...g2.values()].includes("m");
    const stand1 = routes.filter((r) => !(att1 && !ofThis.has(r) && g1.get(r) === "x"));
    const stand2 = routes.filter((r) => !(att2 && !ofThis.has(r) && g2.get(r) === "x"));
    const back = stand2.filter((r) => !stand1.includes(r)), held = stand1.filter((r) => !stand2.includes(r));
    if (!stand1.length) T.places_bare_today += 1; if (!stand2.length) T.places_bare_after += 1;
    if (back.length || held.length) { T.places_changed += 1; T.rows_back += back.length; T.rows_newly_held += held.length;
      for (const r of back) { const b = bySrc.get(r[3]) || { back: 0, held: 0 }; b.back += 1; bySrc.set(r[3], b); }
      for (const r of held) { const b = bySrc.get(r[3]) || { back: 0, held: 0 }; b.held += 1; bySrc.set(r[3], b); }
      if (ex.length < 40) ex.push(`${book} ${sec.unit} ${s}: back ${back.map((r) => `«${String(r[1]).slice(0, 40)}» ${r[3]}`).join(", ")}${held.length ? " | newly held " + held.map((r) => `«${String(r[1]).slice(0, 30)}» ${r[3]}`).join(", ") : ""}`); }
  }
}
const src = [...bySrc].map(([m, o]) => ({ m, label: (MS[m] || {}).label, ...o })).sort((a, b) => b.back - a.back);
writeFileSync(OUT, JSON.stringify({ totals: T, by_source: src, examples: ex }, null, 1));
console.log(JSON.stringify(T)); for (const r of src.slice(0, 12)) console.log(r.m, r.back, r.held, (r.label || "").slice(0, 60)); for (const e of ex.slice(0, 25)) console.log(" ", e);
