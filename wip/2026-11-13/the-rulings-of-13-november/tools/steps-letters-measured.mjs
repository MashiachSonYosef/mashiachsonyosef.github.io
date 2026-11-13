// STEP's letters, measured on every tagged place of the books. Ruling 6 parts a row of STEP's own sources from a
// place by letter where the number is the same. The lane measured that parting on fourteen verb cards of Genesis 1
// and on nothing else, so this counts it everywhere: the rows it withholds beyond what the number withholds, source
// by source; the places where it leaves a source with no row of the place's own number; and the pills it takes off
// a card at rest (a reading every row behind which is withheld by letter alone, and that no row left carries).
// Everything is computed with the gates' own modules of the reader dir given. It measures; it changes nothing.
// node steps-letters-measured.mjs <reader dir> [--top=N] [--json=<file>]
import { readFileSync, existsSync, readdirSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const R = process.argv[2];
const arg = (name, otherwise) => { const a = process.argv.find((x) => x.startsWith(`--${name}=`)); return a ? a.slice(name.length + 3) : otherwise; };
const TOP = Number(arg("top", "30")), JSON_OUT = arg("json", "");
const tool = (name) => import(pathToFileURL(join(R, "tools", name)).href);
const { openRouteStore, factsOf, printedForm } = await tool("gloss-store-v1.mjs");
const { placeEntry, bdbEntriesAt, entryVerdict } = await tool("entry-gate-v1.mjs");
const { nameWithheld } = await tool("names-gate-v1.mjs");
const { gradeRow } = await tool("pointing-grade-v1.mjs");
const { isOtherStem } = await tool("stem-family-v1.mjs");
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const store = openRouteStore(join(R, "data", "route-store"));
const pin = JSON.parse(readFileSync(join(R, "data", "row-entries", "PIN.json"), "utf8"));
// the sources whose rows carry STEP's letters, as the pin states the ruling
const STEPS = Object.keys(pin.partings.find((p) => p.fact === "t").sources);
const defaults = JSON.parse(readFileSync(join(R, "data", "source-defaults-v1.json"), "utf8"));
const restsOff = (row) => !!(defaults.off && defaults.off[(store.index.m_sources[row[3]] || {}).key]);
const formOf = JSON.parse(readFileSync(join(R, "data", "form-of-pills-v1.json"), "utf8"));
const target = (e) => { if (!e.at) return e.target; const b = Buffer.from(e.t, "utf8"); return b.subarray(e.at[0], e.at[1]).toString("utf8") || e.target; };
const pillOf = (k, reading) => {
  const e = (formOf.keys[k] || []).find((x) => x.resolved && printedForm(x.t) === printedForm(reading));
  return (e ? `${e.resolved.text} (${e.relation} ${target(e)})` : printedForm(reading)).toLowerCase();
};
const rowsByKey = new Map();
const rowsOf = (k) => {
  if (!rowsByKey.has(k)) {
    const rows = (store.routesFor(k) || []).filter((r) => store.index.m_sources[r[3]]);
    rowsByKey.set(k, { rows, facts: rows.map(factsOf), pills: new Map() });
  }
  return rowsByKey.get(k);
};
const pillsOfRow = (k, held, j) => { if (!held.pills.has(j)) held.pills.set(j, store.readingPool([held.rows[j]], "oldest").map((g) => [pillOf(k, g.text), printedForm(g.text)])); return held.pills.get(j); };
const kinds = new Map();
const kindOf = (w, side, namesRead) => {
  const tags = [].concat(w.tg);
  const gr = (side.grades || {})[w.s];
  const st = gr && Array.isArray(gr.st) && gr.st.length ? gr.st : null;
  const isName = !namesRead || !!w.np;
  const id = [w.k, tags.join(" "), w.s, isName ? 1 : 0, st ? st.join(",") : ""].join("\u0001");
  if (kinds.has(id)) return kinds.get(id);
  const held = rowsOf(w.k);
  const { rows, facts } = held;
  const place = placeEntry(tags);
  const out = { key: w.k, tags: tags.join(" "), lettered: !!(place && place.lettered), by: {}, lost: [], byLetterRows: 0 };
  kinds.set(id, out);
  if (!place) return out;
  const bdbHere = bdbEntriesAt(place, facts);
  const unlettered = { ...place, lettered: false };
  const full = rows.map((r, j) => entryVerdict(facts[j], place, bdbHere));
  const byNumber = rows.map((r, j) => entryVerdict(facts[j], unlettered, bdbHere));
  const byLetter = rows.map((r, j) => byNumber[j] === "this" && full[j] === "other");
  for (const m of STEPS) {
    const mine = rows.map((r, j) => j).filter((j) => rows[j][3] === m && byNumber[j] === "this");
    const gone = mine.filter((j) => byLetter[j]);
    out.by[m] = { ofNumber: mine.length, gone: gone.length, letters: [...new Set(gone.flatMap((j) => facts[j].t))].sort() };
  }
  out.byLetterRows = byLetter.filter(Boolean).length;
  if (!out.byLetterRows) return out;
  const grades = rows.map((r) => gradeRow(r, w.s));
  const attested = grades.includes("m");
  const rs = (side.stems || {})[w.k] || null;
  const otherStem = (row) => !!(rs && st && isOtherStem(rs[`${row[3]}\u0001${row[0]}\u0001${row[1]}`], st));
  const kept = (verdicts) => (j) => verdicts[j] !== "other" && !nameWithheld(facts[j], isName) && (verdicts[j] === "this" || !attested || grades[j] !== "x") && !otherStem(rows[j]) && !restsOff(rows[j]);
  const keptNow = kept(full), keptByNumber = kept(byNumber);
  const now = new Set();
  rows.forEach((r, j) => { if (keptNow(j)) for (const [p] of pillsOfRow(w.k, held, j)) now.add(p); });
  const seen = new Set();
  rows.forEach((r, j) => {
    if (!byLetter[j] || !keptByNumber(j)) return;
    for (const [p, printed] of pillsOfRow(w.k, held, j)) { if (now.has(p) || seen.has(p)) continue; seen.add(p); out.lost.push({ pill: printed, m: rows[j][3], t: facts[j].t.join("+") }); }
  });
  return out;
};
const T = { books: 0, "word places": 0, "places with a tag": 0, "places whose every core tag carries a letter": 0, "places where the letter withholds a row the number keeps": 0, "rows so withheld, place by place": 0,
  "places whose card is the word's own": 0, "of those, places where the letter takes a pill off the card": 0, "pills so taken, place by place": 0 };
for (const m of STEPS) { T[`${m}: places where it has a row of the place's number`] = 0; T[`${m}: places where the letter withholds a row of it`] = 0; T[`${m}: places where the letter withholds every row it has of the place's number`] = 0; }
const top = new Map();
const note = (id, kind, own) => { let x = top.get(id); if (!x) { x = { kind, places: 0, own: 0 }; top.set(id, x); } x.places += 1; if (own) x.own += 1; };
const zonesDir = join(R, "data", "zones");
for (const f of readdirSync(zonesDir).filter((x) => x.endsWith(".lattice.bin")).sort()) {
  const z = f.slice(0, -".lattice.bin".length);
  const zone = gz(join(zonesDir, `${z}.bin`)), side = gz(join(zonesDir, f));
  const namesRead = !!((((zone.emitted_from || {}).toggles || {}).lattice || {}).names);
  T.books += 1;
  for (const sec of zone.sections) {
    const words = sec.words || [];
    for (const [e, w] of words.entries()) {
      if (w.mark) continue;
      T["word places"] += 1;
      if (!w.tg || !w.k) continue;
      T["places with a tag"] += 1;
      const kind = kindOf(w, side, namesRead);
      if (kind.lettered) T["places whose every core tag carries a letter"] += 1;
      const prev = e > 0 ? words[e - 1] : null;
      const own = !w.w && !w.kq && !(Array.isArray(w.pg) && w.pg.length > 1) && !String(w.s).includes("־") && !(prev && String(prev.s || "").endsWith("־"));
      if (own) T["places whose card is the word's own"] += 1;
      for (const m of STEPS) {
        const b = kind.by[m]; if (!b || !b.ofNumber) continue;
        T[`${m}: places where it has a row of the place's number`] += 1;
        if (b.gone) T[`${m}: places where the letter withholds a row of it`] += 1;
        if (b.gone === b.ofNumber) T[`${m}: places where the letter withholds every row it has of the place's number`] += 1;
      }
      if (!kind.byLetterRows) continue;
      T["places where the letter withholds a row the number keeps"] += 1;
      T["rows so withheld, place by place"] += kind.byLetterRows;
      note(`${kind.key}\u0001${kind.tags}`, kind, own);
      if (own && kind.lost.length) { T["of those, places where the letter takes a pill off the card"] += 1; T["pills so taken, place by place"] += kind.lost.length; }
    }
  }
}
for (const [k, v] of Object.entries(T)) console.log(`${String(v.toLocaleString("en-US")).padStart(9)}  ${k}`);
// one line per key and place tags: a key's surfaces are gathered (their rows are the same; the pills lost may differ
// by surface where the pointing or the stem speaks, so the pills of every surface are listed once)
const byKeyTags = new Map();
for (const [id, x] of top) {
  let g = byKeyTags.get(id);
  if (!g) { g = { key: x.kind.key, tags: x.kind.tags, places: 0, own: 0, lost: new Map(), by: x.kind.by }; byKeyTags.set(id, g); }
  g.places += x.places; g.own += x.own;
}
// the pills lost per key and tags, over its kinds (a kind is also a surface)
for (const kind of kinds.values()) { const g = byKeyTags.get(`${kind.key}\u0001${kind.tags}`); if (g) for (const l of kind.lost) g.lost.set(`${l.pill}\u0001${l.m}\u0001${l.t}`, l); }
const list = [...byKeyTags.values()].sort((a, b) => b.places - a.places);
console.log(`\n${list.length.toLocaleString("en-US")} kinds of place (a key under its tags) where the letter withholds a row the number keeps. The first ${Math.min(TOP, list.length)} by places:`);
for (const g of list.slice(0, TOP)) {
  const src = STEPS.map((m) => (g.by[m] && g.by[m].gone ? `${m} ${g.by[m].gone} of ${g.by[m].ofNumber} (${g.by[m].letters.join(" ")})` : null)).filter(Boolean).join(" · ");
  const lost = [...g.lost.values()];
  console.log(`  ${String(g.places).padStart(6)} places · ${g.key} at ${g.tags} · ${src}${lost.length ? ` · off the card: ${lost.slice(0, 6).map((l) => `«${l.pill.slice(0, 40)}» ${l.m} ${l.t}`).join(", ")}${lost.length > 6 ? `, and ${lost.length - 6} more` : ""}` : " · no pill leaves the card"}`);
}
const losing = list.filter((g) => g.lost.size);
console.log(`\n${losing.length.toLocaleString("en-US")} of those kinds lose a pill at one surface or more. The first ${Math.min(TOP, losing.length)} by places:`);
for (const g of losing.slice(0, TOP)) console.log(`  ${String(g.places).padStart(6)} places · ${g.key} at ${g.tags} · ${[...g.lost.values()].slice(0, 8).map((l) => `«${l.pill.slice(0, 40)}» ${l.m} ${l.t}`).join(", ")}${g.lost.size > 8 ? `, and ${g.lost.size - 8} more` : ""}`);
if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify({ totals: T, kinds: list.map((g) => ({ key: g.key, tags: g.tags, places: g.places, own: g.own, by: g.by, lost: [...g.lost.values()] })) }, null, 1));
