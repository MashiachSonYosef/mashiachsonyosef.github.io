// The same-product gate's differing first cards, each pill accounted for by the sense openings. The gate presses the
// first three words of a chapter page on the build before and on the build with the openings marked. The two builds
// ask every row the same gates; the build with the marks gives a marked row no reading and prints it as a note. So
// for each card that differs, the word is found in the zone and every row under its key is read twice: its readings
// by the store reader of the build before (the marks unknown to it), and whether the build after marks it.
//   a pill only the old card prints must be a reading every row behind which, of those the gates keep, is marked
//       NOTE   the words of a numbered sense's opening, now a note
//   a pill only the new card prints must be the same reading in another row's letters (SAME): the pill wore the
//       letters of a marked row, and now wears the next row's
// Anything else is printed as not accounted for. A card of a word its place divides, or that a run joins, opens on
// another pool than the word's own rows and is listed apart.
// node gate-cards-openings.mjs <the gate's diff file> <reader dir before> <reader dir with the marks>
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const [DIFF, A, R] = process.argv.slice(2);
const tool = (dir, name) => import(pathToFileURL(join(dir, "tools", name)).href);
const before = await tool(A, "gloss-store-v1.mjs");
const { openRouteStore, factsOf, printedForm, senseOpened } = await tool(R, "gloss-store-v1.mjs");
const { placeEntry, bdbEntriesAt, entryVerdict } = await tool(R, "entry-gate-v1.mjs");
const { nameWithheld } = await tool(R, "names-gate-v1.mjs");
const { gradeRow, isPointed } = await tool(R, "pointing-grade-v1.mjs");
const { isOtherStem } = await tool(R, "stem-family-v1.mjs");
const { stemsId } = await tool(R, "stems-extension-v1.mjs");
const { openBesideTheStore, restingOff } = await tool(R, "rows-beside-the-store-v1.mjs");
const { fnv1a } = await tool(R, "lattice-lib-v1.mjs");
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const oldStore = before.openRouteStore(join(A, "data", "route-store"));
const store = openRouteStore(join(R, "data", "route-store"));
const beside = openBesideTheStore(R).map((b) => ({ ...b, store: openRouteStore(join(R, "data", "overlays", b.id)) }));
const off = restingOff(R, [store.index, ...beside.map((b) => b.index)]);
const fold = (row) => { const r = row.slice(0, 7); if (row.length > 8) { r[7] = Array.isArray(row[8]) ? row[8] : null; r[8] = Array.isArray(row[9]) ? row[9] : null; } return r; };
const formOf = JSON.parse(readFileSync(join(R, "data", "form-of-pills-v1.json"), "utf8"));
const target = (e) => { if (!e.at) return e.target; const b = Buffer.from(e.t, "utf8"); return b.subarray(e.at[0], e.at[1]).toString("utf8") || e.target; };
const pillOf = (k, reading) => {
  const e = (formOf.keys[k] || []).find((x) => x.resolved && printedForm(x.t) === printedForm(reading));
  return (e ? `${e.resolved.text} (${e.relation} ${target(e)})` : printedForm(reading)).toLowerCase();
};
const zones = new Map();
const zoneOf = (z) => { if (!zones.has(z)) zones.set(z, { zone: gz(join(R, "data", "zones", `${z}.bin`)), side: existsSync(join(R, "data", "zones", `${z}.lattice.bin`)) ? gz(join(R, "data", "zones", `${z}.lattice.bin`)) : {} }); return zones.get(z); };
const bare = (s) => (s.startsWith("*") ? s.slice(1) : s);
// a row's grade against the word as the page takes it: its own headwords, else the lattice card's grade
const pageGrades = (rows, w, side) => {
  const own = typeof w.s === "string" && isPointed(w.s);
  const gr = (side.grades || {})[w.s] || null;
  const lat = gr && (side.routes || {})[gr.k] ? side.routes[gr.k] : null;
  if (!lat && !own) return rows.map(() => "-");
  const at = lat ? new Map(lat.f.map((fp, i) => [fp, i])) : null;
  return rows.map((row) => {
    const sg = own ? gradeRow(row, w.s) : "-";
    if (sg !== "-" || !at) return sg;
    const m = store.index.m_sources[row[3]];
    const i = at.get(fnv1a(`${row[1]}|${m ? m.label : ""}`));
    return i === undefined ? "-" : (gr.g[i] || "-");
  });
};
const T = { cards: 0, "cards of one word's own rows": 0, "cards that open on a division or a run": 0,
  "pills gone: every row the gates keep behind them is the opening of a numbered sense, a note now": 0,
  "pills written in another row's letters: the row whose letters they wore is a note now": 0,
  "old pills not accounted for": 0, "new pills not accounted for": 0, "the pressed pill is another reading": 0, "notes the cards print, by the page's gates": 0 };
for (const c of readFileSync(DIFF, "utf8").split(/^== /mu).slice(1)) {
  const [head, ...rest] = c.split("\n");
  const m = /^(\S+) (\S+) card (\d+)$/u.exec(head.trim());
  let o = null, n = null;
  for (const line of rest) { if (line.startsWith("  old: ")) o = line.slice(7).split(" | "); if (line.startsWith("  new: ")) n = line.slice(7).split(" | "); }
  T.cards += 1;
  if (!m || !o || !n) { console.log(`${head}: not read`); continue; }
  const [, z, , i] = m;
  const { zone, side } = zoneOf(z);
  const namesRead = !!((((zone.emitted_from || {}).toggles || {}).lattice || {}).names);
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
  const sRows = (store.routesFor(w.k) || []).filter((r) => store.index.m_sources[r[3]]);
  const oRows = (oldStore.routesFor(w.k) || []).filter((r) => oldStore.index.m_sources[r[3]]);
  const facts = sRows.map(factsOf);
  const place = w.tg ? placeEntry([].concat(w.tg)) : null;
  const bdbHere = place ? bdbEntriesAt(place, facts) : null;
  const verdicts = sRows.map((r, j) => (place ? entryVerdict(facts[j], place, bdbHere) : "none"));
  const isName = !namesRead || !!w.np;
  const grades = pageGrades(sRows, w, side);
  const attested = grades.includes("m");
  const gr = (side.grades || {})[w.s] || null;
  const st = gr && Array.isArray(gr.st) && gr.st.length ? gr.st : null;
  const rs = st ? (side.stems || {})[w.k] || null : null;
  const otherStem = (row) => !!(st && rs && isOtherStem(rs[stemsId(row[3], row[0], row[1])], st));
  // the row of the build before is the same row: its rank, its source and its route
  const oldOf = (row) => oRows.find((r) => r[0] === row[0] && String(r[3]) === String(row[3]) && r[1] === row[1]) || null;
  const rows = sRows.map((row, j) => {
    const was = oldOf(row);
    return { row, marked: !!senseOpened(row), pills: was ? oldStore.readingPool([was], "oldest").map((g) => pillOf(w.k, g.text)) : [],
      left: verdicts[j] !== "other" && !nameWithheld(facts[j], isName) && (verdicts[j] === "this" || !attested || grades[j] !== "x") && !otherStem(row) && !off.has(String(row[3])) };
  });
  const asked = attested && isPointed(w.s);
  for (const b of beside) for (const raw of b.rowsFor(w.k)) {
    const row = fold(raw);
    rows.push({ row, marked: false, pills: b.store.readingsOf(row).map((t) => pillOf(w.k, t)), left: !off.has(String(row[3])) && (!asked || gradeRow(row, w.s) !== "x") && !otherStem(row) });
  }
  const behind = (text) => rows.filter((x) => x.left && x.pills.includes(String(text).toLowerCase()));
  const notesHere = rows.filter((x) => x.left && x.marked).length;
  T["notes the cards print, by the page's gates"] += notesHere;
  const notes = [];
  for (const g of [...gone]) {
    const x = came.find((y) => y !== g && y.toLowerCase() === g.toLowerCase());
    if (!x) continue;
    const b = behind(g);
    if (b.some((r) => r.marked) && b.some((r) => !r.marked)) {
      T["pills written in another row's letters: the row whose letters they wore is a note now"] += 1;
      notes.push(`    SAME  «${g.slice(0, 50)}» is «${x.slice(0, 50)}»`);
      gone.splice(gone.indexOf(g), 1); came.splice(came.indexOf(x), 1);
    }
  }
  for (const g of gone) {
    const b = behind(g);
    if (b.length && b.every((r) => r.marked)) {
      T["pills gone: every row the gates keep behind them is the opening of a numbered sense, a note now"] += 1;
      notes.push(`    NOTE  «${g.slice(0, 80)}» · ${b.map((r) => `${r.row[3]} ${(factsOf(r.row) || {}).opens}`).slice(0, 3).join("; ")}`);
      continue;
    }
    T["old pills not accounted for"] += 1; notes.push(`    OLD, not accounted for: «${g.slice(0, 120)}» (${b.length} row(s) behind it, ${b.filter((r) => r.marked).length} marked)`);
  }
  for (const x of came) { T["new pills not accounted for"] += 1; notes.push(`    NEW, not accounted for: «${x.slice(0, 120)}»`); }
  const pressedOld = o.filter((x) => x.startsWith("*")).map(bare).join(" · "), pressedNew = n.filter((x) => x.startsWith("*")).map(bare).join(" · ");
  if (pressedOld !== pressedNew) { T["the pressed pill is another reading"] += 1; notes.push(`    the card opens on «${pressedNew.slice(0, 60)}» where it opened on «${pressedOld.slice(0, 60)}»`); }
  console.log(`${head} · ${sec.label} «${w.s}» (${w.k})${own ? "" : " · NOT a card of the word's own rows"}: ${o.length} pills -> ${n.length} · ${gone.length} gone, ${came.length} come · ${notesHere} note(s) kept`);
  for (const line of notes) console.log(line);
}
console.log("");
for (const [k, v] of Object.entries(T)) console.log(`${String(v).padStart(7)}  ${k}`);
