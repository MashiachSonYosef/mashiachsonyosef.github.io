// The same-product gate's differing first cards, each pill accounted for by the two gates of the place. The gate
// presses the first three words of a chapter page on the build before and on the build with the gates. For each
// card that differs, the word is found in the zone (the n-th word of the chapter's first verses), and what the
// gates do with its key's rows is computed from the store with the gates' own modules:
//   a pill only the old card prints must be a reading every row behind which is now withheld
//       ENTRY  as another entry's than the place's
//       NAME   as a name's, at a place that is not a name (the entry may withhold others behind it)
//   a pill only the new card prints must be a reading carried by a row of the place's own entry that its source
//       points otherwise (OWN): the pointing withheld it before, and it stands now
// Anything else is printed as not accounted for. A card of a word its place divides, or that a run joins, opens on
// another pool than the word's own rows and is listed apart.
// node gate-cards-ship-c.mjs <the gate's diff file> <reader dir with the gates>
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const [DIFF, R] = process.argv.slice(2);
const tool = (name) => import(pathToFileURL(join(R, "tools", name)).href);
const { openRouteStore, factsOf, readingKey, printedForm } = await tool("gloss-store-v1.mjs");
const { placeEntry, bdbEntriesAt, entryVerdict } = await tool("entry-gate-v1.mjs");
const { nameWithheld } = await tool("names-gate-v1.mjs");
const { gradeRow } = await tool("pointing-grade-v1.mjs");
const { isOtherStem } = await tool("stem-family-v1.mjs");
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const store = openRouteStore(join(R, "data", "route-store"));
const rowsOf = (k) => (store.routesFor(k) || []).filter((r) => store.index.m_sources[r[3]]);
const defaults = JSON.parse(readFileSync(join(R, "data", "source-defaults-v1.json"), "utf8"));
const restsOff = (row) => !!(defaults.off && defaults.off[(store.index.m_sources[row[3]] || {}).key]);
// a pointer pill prints its entry's English with the pointer beside it (the page's formOfSays)
const formOf = JSON.parse(readFileSync(join(R, "data", "form-of-pills-v1.json"), "utf8"));
const target = (e) => { if (!e.at) return e.target; const b = Buffer.from(e.t, "utf8"); return b.subarray(e.at[0], e.at[1]).toString("utf8") || e.target; };
const pillOf = (k, reading) => {
  const e = (formOf.keys[k] || []).find((x) => x.resolved && printedForm(x.t) === printedForm(reading));
  // as the pill prints it, letter case aside: the printed form of the reading (a closing period dropped once)
  return (e ? `${e.resolved.text} (${e.relation} ${target(e)})` : printedForm(reading)).toLowerCase();
};
const zones = new Map();
const zoneOf = (z) => { if (!zones.has(z)) zones.set(z, { zone: gz(join(R, "data", "zones", `${z}.bin`)), side: existsSync(join(R, "data", "zones", `${z}.lattice.bin`)) ? gz(join(R, "data", "zones", `${z}.lattice.bin`)) : {} }); return zones.get(z); };
const bare = (s) => (s.startsWith("*") ? s.slice(1) : s);
const T = { cards: 0, "cards of one word's own rows": 0, "cards that open on a division or a run": 0, "pills gone: every row behind them is another entry's": 0, "pills gone: a name's, at a place that is not a name": 0,
  "pills come: a row of the place's own entry, pointed otherwise, stands": 0, "pills written in another row's letters: the rows behind them are not the rows that were": 0, "old pills not accounted for": 0, "new pills not accounted for": 0, "the pressed pill is another reading": 0 };
for (const c of readFileSync(DIFF, "utf8").split(/^== /mu).slice(1)) {
  const [head, ...rest] = c.split("\n");
  const m = /^(\S+) (\S+) card (\d+)$/u.exec(head.trim());
  let o = null, n = null;
  for (const line of rest) { if (line.startsWith("  old: ")) o = line.slice(7).split(" | "); if (line.startsWith("  new: ")) n = line.slice(7).split(" | "); }
  T.cards += 1;
  if (!m || !o || !n) { console.log(`${head}: not read`); continue; }
  const [, z, ch, i] = m;
  const { zone, side } = zoneOf(z);
  const namesRead = !!((((zone.emitted_from || {}).toggles || {}).lattice || {}).names);
  // the n-th word of the book. The gate presses the first three words standing on the page, and a chapter's page
  // builds the book from its first verse, so the cards of every chapter page of a book are the book's first three
  // words (seen in the gate's own output: a book's two sampled chapters always differ by the same pills)
  const words = [];
  for (let s = 0; s < zone.sections.length && words.length < 3; s += 1) for (const [e, w] of (zone.sections[s].words || []).entries()) if (!w.mark) words.push({ w, e, sec: zone.sections[s] });
  const hit = words[Number(i) - 1];
  if (!hit) { console.log(`${head}: the word was not found in the zone`); continue; }
  const { w, sec, e } = hit;
  const prev = e > 0 ? sec.words[e - 1] : null;
  const O = o.map(bare), N = n.map(bare);
  const gone = O.filter((x) => !N.includes(x)), came = N.filter((x) => !O.includes(x));
  const where = `${sec.label} «${w.s}» (${w.k}${w.tg ? ` under ${[].concat(w.tg).join(" ")}` : ", no tag"}${namesRead ? (w.np ? ", a name place" : ", not a name place") : ""})`;
  const own = !w.w && !w.kq && w.k && !(Array.isArray(w.pg) && w.pg.length > 1) && !String(w.s).includes("\u05BE") && !(prev && String(prev.s || "").endsWith("\u05BE"));
  const notes = [];
  if (!own) T["cards that open on a division or a run"] += 1; else T["cards of one word's own rows"] += 1;
  const rows = rowsOf(w.k);
  const facts = rows.map(factsOf);
  const place = w.tg ? placeEntry([].concat(w.tg)) : null;
  const bdbHere = place ? bdbEntriesAt(place, facts) : null;
  const verdicts = rows.map((r, j) => (place ? entryVerdict(facts[j], place, bdbHere) : "none"));
  const isName = !namesRead || !!w.np;
  const named = rows.map((r, j) => verdicts[j] !== "other" && nameWithheld(facts[j], isName));
  const grades = rows.map((r) => gradeRow(r, w.s));
  const attested = grades.includes("m");
  const gr = (side.grades || {})[w.s], rs = (side.stems || {})[w.k] || null;
  const otherStem = (row) => !!(rs && gr && Array.isArray(gr.st) && gr.st.length && isOtherStem(rs[`${row[3]}\u0001${row[0]}\u0001${row[1]}`], gr.st));
  const keptBefore = (j) => (!attested || grades[j] !== "x") && !otherStem(rows[j]) && !restsOff(rows[j]);
  const keptAfter = (j) => verdicts[j] !== "other" && !named[j] && (verdicts[j] === "this" || !attested || grades[j] !== "x") && !otherStem(rows[j]) && !restsOff(rows[j]);
  const pillsOfRow = rows.map((r) => store.readingPool([r], "oldest").map((g) => pillOf(w.k, g.text)));
  const behind = (text, kept) => rows.map((r, j) => j).filter((j) => kept(j) && pillsOfRow[j].includes(String(text).toLowerCase()));
  // one reading in another row's letters: the pill wears the letters of the first row behind it («Ben», «ben»), and
  // where that row is withheld the pill is the same reading written as its next row writes it
  for (const g of [...gone]) {
    const x = came.find((y) => y !== g && y.toLowerCase() === g.toLowerCase());
    if (!x) continue;
    const was = behind(g, keptBefore), now = behind(g, keptAfter);
    const out = was.filter((j) => !keptAfter(j)), in_ = now.filter((j) => !keptBefore(j));
    if (was.length && now.length && (out.length || in_.length)) {
      T["pills written in another row's letters: the rows behind them are not the rows that were"] += 1;
      notes.push(`    SAME  «${g.slice(0, 50)}» is «${x.slice(0, 50)}» · ${[...out.map((j) => `${rows[j][3]} out, ${verdicts[j] === "other" ? "another entry's" : named[j] ? "a name's" : "?"}`), ...in_.map((j) => `${rows[j][3]} in, of the place's own entry`)].slice(0, 4).join("; ")}`);
      gone.splice(gone.indexOf(g), 1); came.splice(came.indexOf(x), 1);
    }
  }
  for (const g of gone) {
    const was = behind(g, keptBefore), now = behind(g, keptAfter);
    if (was.length && !now.length) {
      const kind = was.some((j) => named[j]) ? "pills gone: a name's, at a place that is not a name" : was.every((j) => verdicts[j] === "other") ? "pills gone: every row behind them is another entry's" : null;
      if (kind) { T[kind] += 1; notes.push(`    ${kind.startsWith("pills gone: a name") ? "NAME " : "ENTRY"} «${g.slice(0, 70)}» · ${[...new Set(was.map((j) => `${rows[j][3]}${facts[j] && facts[j].n ? ` ${facts[j].n.join("+")}` : facts[j] && facts[j].b ? ` ${facts[j].b.join("+")}` : ""}`))].slice(0, 4).join(", ")}`); continue; }
    }
    T["old pills not accounted for"] += 1; notes.push(`    OLD, not accounted for: «${g.slice(0, 120)}» (${was.length} row(s) behind it before, ${now.length} now)`);
  }
  for (const x of came) {
    const was = behind(x, keptBefore), now = behind(x, keptAfter);
    if (!was.length && now.length && now.some((j) => verdicts[j] === "this" && grades[j] === "x")) { T["pills come: a row of the place's own entry, pointed otherwise, stands"] += 1; notes.push(`    OWN   «${x.slice(0, 70)}» · ${[...new Set(now.map((j) => rows[j][3]))].slice(0, 4).join(", ")}`); continue; }
    T["new pills not accounted for"] += 1; notes.push(`    NEW, not accounted for: «${x.slice(0, 120)}» (${was.length} row(s) behind it before, ${now.length} now)`);
  }
  const pressedOld = o.filter((x) => x.startsWith("*")).map(bare).join(" · "), pressedNew = n.filter((x) => x.startsWith("*")).map(bare).join(" · ");
  if (pressedOld !== pressedNew) { T["the pressed pill is another reading"] += 1; notes.push(`    the card opens on «${pressedNew.slice(0, 60)}» where it opened on «${pressedOld.slice(0, 60)}»`); }
  console.log(`${head} · ${where}${own ? "" : " · NOT a card of the word's own rows"}: ${o.length} pills -> ${n.length} · ${gone.length} gone, ${came.length} come`);
  for (const line of notes) console.log(line);
}
console.log("");
for (const [k, v] of Object.entries(T)) console.log(`${String(v).padStart(7)}  ${k}`);
