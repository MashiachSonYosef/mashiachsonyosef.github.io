// The same-product gate's differing first cards, each pill accounted for by the stems extension. The gate presses the
// first three words of a chapter page on the build before and on the build with the extension. The two builds ask a
// row the same entry, the same name and the same pointing; the build with the extension knows the stems of more rows
// (the UBS dictionary's and the SDBH's in the store, Jastrow's beside it) and asks the rows beside the store their
// stem too. So for each card that differs, the word is found in the zone and every row under its key is read, the
// store's and those of the dictionaries beside it, and asked twice: by the stems the sidecar before holds, and by
// the stems the sidecar with the extension holds.
//   a pill only the old card prints must be a reading every row behind which the new build withholds, each one
//       STEM   as a row of another stem than the place's, by stems the build before did not hold or did not ask
//   a pill only the new card prints must be the same reading in another row's letters (SAME): the pill wears the
//       letters of the first row behind it, and that row is now withheld
// Anything else is printed as not accounted for. And the other way about: a pill both cards print though every row
// behind it is now withheld is counted (it can stand only as the place's own reading). A card of a word its place
// divides, or that a run joins, opens on another pool than the word's own rows and is listed apart.
// node gate-cards-stems.mjs <the gate's diff file> <reader dir before> <reader dir with the extension>
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const [DIFF, A, R] = process.argv.slice(2);
const tool = (name) => import(pathToFileURL(join(R, "tools", name)).href);
const { openRouteStore, factsOf, printedForm } = await tool("gloss-store-v1.mjs");
const { placeEntry, bdbEntriesAt, entryVerdict } = await tool("entry-gate-v1.mjs");
const { nameWithheld } = await tool("names-gate-v1.mjs");
const { gradeRow, isPointed } = await tool("pointing-grade-v1.mjs");
const { isOtherStem } = await tool("stem-family-v1.mjs");
const { stemsId } = await tool("stems-extension-v1.mjs");
const { openBesideTheStore, restingOff } = await tool("rows-beside-the-store-v1.mjs");
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const store = openRouteStore(join(R, "data", "route-store"));
// the dictionaries beside the store, each opened as the store it is, so a row of theirs prints by its own ledger
const beside = openBesideTheStore(R).map((b) => ({ ...b, store: openRouteStore(join(R, "data", "overlays", b.id)) }));
const off = restingOff(R, [store.index, ...beside.map((b) => b.index)]);
// a row beside the store as the page folds it: the lane's own slot 7 dropped, its division slots read into 7 and 8
const fold = (row) => { const r = row.slice(0, 7); if (row.length > 8) { r[7] = Array.isArray(row[8]) ? row[8] : null; r[8] = Array.isArray(row[9]) ? row[9] : null; } return r; };
// a pointer pill prints its entry's English with the pointer beside it (the page's formOfSays)
const formOf = JSON.parse(readFileSync(join(R, "data", "form-of-pills-v1.json"), "utf8"));
const target = (e) => { if (!e.at) return e.target; const b = Buffer.from(e.t, "utf8"); return b.subarray(e.at[0], e.at[1]).toString("utf8") || e.target; };
const pillOf = (k, reading) => {
  const e = (formOf.keys[k] || []).find((x) => x.resolved && printedForm(x.t) === printedForm(reading));
  return (e ? `${e.resolved.text} (${e.relation} ${target(e)})` : printedForm(reading)).toLowerCase();
};
const zones = new Map();
const side = (dir, z) => (existsSync(join(dir, "data", "zones", `${z}.lattice.bin`)) ? gz(join(dir, "data", "zones", `${z}.lattice.bin`)) : {});
const zoneOf = (z) => { if (!zones.has(z)) zones.set(z, { zone: gz(join(R, "data", "zones", `${z}.bin`)), before: side(A, z), after: side(R, z) }); return zones.get(z); };
const bare = (s) => (s.startsWith("*") ? s.slice(1) : s);
const T = { cards: 0, "cards of one word's own rows": 0, "cards that open on a division or a run": 0,
  "pills gone: every row behind them is of another stem, by stems the extension gives": 0,
  "  of those, pills that stood on rows of the store alone": 0, "  on rows beside the store alone": 0, "  on both": 0,
  "pills written in another row's letters: the row whose letters they wore is withheld": 0,
  "old pills not accounted for": 0, "new pills not accounted for": 0,
  "pills both cards print though every row behind them is withheld now": 0, "the pressed pill is another reading": 0 };
const bySource = new Map(), byPair = new Map();
for (const c of readFileSync(DIFF, "utf8").split(/^== /mu).slice(1)) {
  const [head, ...rest] = c.split("\n");
  const m = /^(\S+) (\S+) card (\d+)$/u.exec(head.trim());
  let o = null, n = null;
  for (const line of rest) { if (line.startsWith("  old: ")) o = line.slice(7).split(" | "); if (line.startsWith("  new: ")) n = line.slice(7).split(" | "); }
  T.cards += 1;
  if (!m || !o || !n) { console.log(`${head}: not read`); continue; }
  const [, z, , i] = m;
  const { zone, before, after } = zoneOf(z);
  const namesRead = !!((((zone.emitted_from || {}).toggles || {}).lattice || {}).names);
  // the n-th word of the book: a chapter's page builds the book from its first verse, and the gate presses the first
  // three words standing on the page
  const words = [];
  for (let s = 0; s < zone.sections.length && words.length < 3; s += 1) for (const [e, w] of (zone.sections[s].words || []).entries()) if (!w.mark) words.push({ w, e, sec: zone.sections[s] });
  const hit = words[Number(i) - 1];
  if (!hit) { console.log(`${head}: the word was not found in the zone`); continue; }
  const { w, sec, e } = hit;
  const prev = e > 0 ? sec.words[e - 1] : null;
  const O = o.map(bare), N = n.map(bare);
  const gone = O.filter((x) => !N.includes(x)), came = N.filter((x) => !O.includes(x));
  const own = !w.w && !w.kq && w.k && !(Array.isArray(w.pg) && w.pg.length > 1) && !String(w.s).includes("־") && !(prev && String(prev.s || "").endsWith("־"));
  T[own ? "cards of one word's own rows" : "cards that open on a division or a run"] += 1;
  // every row under the key: the store's, then those beside it, each with what the gates before the stem say of it
  const sRows = (store.routesFor(w.k) || []).filter((r) => store.index.m_sources[r[3]]);
  const facts = sRows.map(factsOf);
  const place = w.tg ? placeEntry([].concat(w.tg)) : null;
  const bdbHere = place ? bdbEntriesAt(place, facts) : null;
  const verdicts = sRows.map((r, j) => (place ? entryVerdict(facts[j], place, bdbHere) : "none"));
  const isName = !namesRead || !!w.np;
  const grades = sRows.map((r) => gradeRow(r, w.s));
  const attested = grades.includes("m");
  const rows = sRows.map((row, j) => ({ row, where: "the store", pills: store.readingPool([row], "oldest").map((g) => pillOf(w.k, g.text)),
    left: verdicts[j] !== "other" && !nameWithheld(facts[j], isName) && (verdicts[j] === "this" || !attested || grades[j] !== "x") && !off.has(String(row[3])) }));
  const asked = attested && isPointed(w.s);
  for (const b of beside) for (const raw of b.rowsFor(w.k)) {
    const row = fold(raw);
    rows.push({ row, where: b.id, beside: true, pills: b.store.readingsOf(row).map((t) => pillOf(w.k, t)), left: !off.has(String(row[3])) && (!asked || gradeRow(row, w.s) !== "x") });
  }
  const stemsOf = (sd) => { const gr = (sd.grades || {})[w.s]; const st = gr && Array.isArray(gr.st) && gr.st.length ? gr.st : null; const rs = st ? (sd.stems || {})[w.k] || null : null; return { st, rs }; };
  const B = stemsOf(before), F = stemsOf(after);
  const other = ({ st, rs }, x) => !!(st && rs && isOtherStem(rs[stemsId(x.row[3], x.row[0], x.row[1])], st));
  // the build before asked only the store's rows their stem
  const keptBefore = (x) => x.left && !(!x.beside && other(B, x));
  const keptAfter = (x) => x.left && !other(F, x);
  const behind = (text, kept) => rows.filter((x) => kept(x) && x.pills.includes(String(text).toLowerCase()));
  const saidOf = (x) => `${x.row[3]} ${(F.rs[stemsId(x.row[3], x.row[0], x.row[1])] || []).join("+")}${x.beside ? ` (beside the store: ${x.where})` : ""}`;
  const notes = [];
  for (const g of [...gone]) {
    const x = came.find((y) => y !== g && y.toLowerCase() === g.toLowerCase());
    if (!x) continue;
    const was = behind(g, keptBefore), now = behind(g, keptAfter);
    const out = was.filter((r) => !keptAfter(r));
    if (was.length && now.length && out.length && out.every((r) => other(F, r))) {
      T["pills written in another row's letters: the row whose letters they wore is withheld"] += 1;
      notes.push(`    SAME  «${g.slice(0, 50)}» is «${x.slice(0, 50)}» · out: ${out.map(saidOf).slice(0, 4).join("; ")}`);
      gone.splice(gone.indexOf(g), 1); came.splice(came.indexOf(x), 1);
    }
  }
  for (const g of gone) {
    const was = behind(g, keptBefore), now = behind(g, keptAfter);
    if (was.length && !now.length && was.every((r) => other(F, r))) {
      T["pills gone: every row behind them is of another stem, by stems the extension gives"] += 1;
      const b = was.filter((r) => r.beside).length;
      T[b === 0 ? "  of those, pills that stood on rows of the store alone" : b === was.length ? "  on rows beside the store alone" : "  on both"] += 1;
      for (const r of was) {
        bySource.set(r.row[3], (bySource.get(r.row[3]) || 0) + 1);
        const pair = `${(F.rs[stemsId(r.row[3], r.row[0], r.row[1])] || []).join("+")} against ${F.st.join("+")}`;
        byPair.set(pair, (byPair.get(pair) || 0) + 1);
      }
      notes.push(`    STEM  «${g.slice(0, 70)}» · ${[...new Set(was.map(saidOf))].slice(0, 4).join("; ")}`);
      continue;
    }
    T["old pills not accounted for"] += 1; notes.push(`    OLD, not accounted for: «${g.slice(0, 120)}» (${was.length} row(s) behind it before, ${now.length} now)`);
  }
  for (const x of came) { T["new pills not accounted for"] += 1; notes.push(`    NEW, not accounted for: «${x.slice(0, 120)}» (${behind(x, keptBefore).length} row(s) behind it before, ${behind(x, keptAfter).length} now)`); }
  for (const t of O.filter((x) => N.includes(x))) {
    const was = behind(t, keptBefore), now = behind(t, keptAfter);
    if (was.length && !now.length) { T["pills both cards print though every row behind them is withheld now"] += 1; notes.push(`    STANDS «${t.slice(0, 70)}» though its ${was.length} row(s) are withheld now`); }
  }
  const pressedOld = o.filter((x) => x.startsWith("*")).map(bare).join(" · "), pressedNew = n.filter((x) => x.startsWith("*")).map(bare).join(" · ");
  if (pressedOld !== pressedNew) { T["the pressed pill is another reading"] += 1; notes.push(`    the card opens on «${pressedNew.slice(0, 60)}» where it opened on «${pressedOld.slice(0, 60)}»`); }
  console.log(`${head} · ${sec.label} «${w.s}» (${w.k}; the place's stems ${F.st ? F.st.join("+") : "not said"})${own ? "" : " · NOT a card of the word's own rows"}: ${o.length} pills -> ${n.length} · ${gone.length} gone, ${came.length} come`);
  for (const line of notes) console.log(line);
}
console.log("");
for (const [k, v] of Object.entries(T)) console.log(`${String(v).padStart(7)}  ${k}`);
const list = (name, m) => { console.log(`\n${name}:`); for (const [k, v] of [...m].sort((a, b) => b[1] - a[1])) console.log(`${String(v).padStart(7)}  ${k}`); };
list("the rows behind the pills gone, by source", bySource);
list("and by the row's stems against the place's", byPair);
