// read-only (23 November 2026): what ship 19 moves at rest, from three readings made on main (S/old) and on the
// sandbox after ship 19 and its round: every resting line that moves (S/s7w/lines-diff.mjs), every entry-gate verdict
// that moves (entry-flips-19.mjs), and the first card of every chapter (first-cards-19.mjs, run on each tree). Each
// moved line and each card that differs is set beside the flips at its own place, so its cause is read from the data.
// With leaders-diff-19.mjs's record, each leader baked at a kind of place that moves is listed too (it is not a line at
// rest: the line there reads another source; it is what the line and the card's first pill read under other switches).
// Writes the TSV and its counts.
// Usage: node what-moves-19.mjs <lines-diff.json> <entry-flips.jsonl> <first-cards main.json> <first-cards after.json> <out.tsv> <counts.json> [leaders-diff.json]
import { readFileSync, writeFileSync } from "node:fs";
const [LD, FL, CB, CA, OUT, COUNTS, LEAD] = process.argv.slice(2);
const ld = JSON.parse(readFileSync(LD, "utf8"));
const flips = readFileSync(FL, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const cb = JSON.parse(readFileSync(CB, "utf8")), ca = JSON.parse(readFileSync(CA, "utf8"));
const at = new Map();   // "book label e" -> the flips at the place
for (const x of flips) { const id = `${x.book} ${x.label} ${x.e}`; (at.get(id) || at.set(id, []).get(id)).push(x); }
const said = (x) => `${x.m} rank ${x.rank} «${x.text.slice(0, 60)}» ${x.before}->${x.after}${x.reading === "core" ? " (core key)" : ""}`;
const head = ["kind", "book", "place", "the word", "key", "on main", "after", "credit on main", "credit after", "BDB rows newly withheld here (word's own key)", "other verdicts that move here", "cause read from the data"];
const rows = [];
const C = { lines_moved: 0, lines_moved_by_book: {}, lines_with_a_bdb_row_newly_withheld_at_their_place: 0, lines_with_no_verdict_moved_at_their_place: 0, cards_compared: 0, cards_that_differ: 0, cards_by_book: {} };
for (const m of ld.moved || []) {
  const [book, label, , e] = m.where.split(" ");
  const id = `${book} ${label} ${e}`;
  const here = at.get(id) || [];
  const bdb = here.filter((x) => x.reading === "own" && (x.m === "M5" || x.m === "M46") && x.after === "other" && x.before !== "other");
  const other = here.filter((x) => !bdb.includes(x));
  C.lines_moved += 1; C.lines_moved_by_book[book] = (C.lines_moved_by_book[book] || 0) + 1;
  if (bdb.length) C.lines_with_a_bdb_row_newly_withheld_at_their_place += 1;
  if (!here.length) C.lines_with_no_verdict_moved_at_their_place += 1;
  const was = m.was || [], now = m.now || [];
  const lead = (x) => (x && x.length ? x[0] : "");
  const cause = !here.length ? "no entry verdict moves at this place: read on the page"
    : bdb.length ? `BDB's row${bdb.length > 1 ? "s" : ""} newly withheld as another entry's (BDB's own entries gathered here now: ${[...new Set(bdb.flatMap((x) => x.gathered_after))].join(", ")})`
    : "a verdict of another row moves here";
  rows.push(["line", book, `${label} word ${Number(e) + 1}`, m.s || "", m.k || "", lead(was), lead(now), was[1] || "", now[1] || "", bdb.map(said).join(" | "), other.map(said).join(" | "), cause]);
}
for (const book of Object.keys(ca)) {
  const A = (cb[book] || []).filter((x) => x.chapter), B = (ca[book] || []).filter((x) => x.chapter);
  for (const y of B) {
    const x = A.find((q) => q.chapter === y.chapter);
    C.cards_compared += 1;
    const key = (c) => JSON.stringify([c.pills, c.pressed, c.line, c.withheld_line, c.data && { ...c.data }]);
    if (x && key(x) === key(y)) continue;
    C.cards_that_differ += 1; C.cards_by_book[book] = (C.cards_by_book[book] || 0) + 1;
    const pa = (x ? x.pills : []).map((p) => p[0]), pb = y.pills.map((p) => p[0]);
    const lost = pa.filter((p) => !pb.includes(p)), gained = pb.filter((p) => !pa.includes(p));
    const here = at.get(`${book} ${y.label} ${y.entry}`) || [];
    const bdb = here.filter((z) => (z.m === "M5" || z.m === "M46") && z.after === "other" && z.before !== "other");
    rows.push(["first card", book, `${y.label} word ${y.entry + 1}`, y.s, "", `${x ? x.pressed : ""} · ${x ? x.withheld_line : ""}`, `${y.pressed} · ${y.withheld_line}`,
      lost.length ? `pills lost: ${lost.join(" | ")}` : "", gained.length ? `pills gained: ${gained.join(" | ")}` : "", bdb.map(said).join(" | "), here.filter((z) => !bdb.includes(z)).map(said).join(" | "),
      !here.length ? "no entry verdict moves at this place" : bdb.length ? "BDB's rows newly withheld as another entry's" : "a verdict of another row moves here"]);
  }
}
if (LEAD) {
  const lead = JSON.parse(readFileSync(LEAD, "utf8"));
  C.leaders_at_a_kind_of_place_that_move = lead.length;
  const txt = (x) => (x && x.l ? `«${x.l[0]}» (${x.l[1]})${x.la ? ` · alternate «${x.la[0]}» (${x.la[1]})` : ""}` : x ? "no leader of its own" : "none baked (the surface's own)");
  for (const x of lead) {
    const here = x.places.flatMap((pl) => { const [label, , e] = pl.split(" "); return at.get(`${x.book} ${label} ${Number(e) - 1}`) || []; });
    const bdb = here.filter((z) => (z.m === "M5" || z.m === "M46") && z.after === "other" && z.before !== "other");
    rows.push(["leader at a kind of place", x.book, `${x.kind} (${x.places.join(", ") || "a place the name list marks"})`, x.surface, x.key, txt(x.before), txt(x.after), x.own ? `surface's own «${x.own[0]}»` : "", "",
      [...new Set(bdb.map(said))].join(" | "), "", "the baked leader no longer names a row the card withholds (BDB's own entries gathered from the whole key)"]);
  }
}
writeFileSync(OUT, [head, ...rows].map((r) => r.map((c) => String(c).replace(/[\t\n]/gu, " ")).join("\t")).join("\n") + "\n");
writeFileSync(COUNTS, JSON.stringify(C, null, 1) + "\n");
console.log(JSON.stringify(C, null, 1));
