// Ship 17 (22 November 2026): every line ship 17 lays a place under, before and after, and what moves. Reads only.
//   before        the record of the lines at rest as main keeps it (data/resting-lines/<book>.json.gz, read as
//                 check-spelling-bridge-v1 B4 reads it: the unit over the word), and its credit, each id with its
//                 source's label as the record names it; and the line the page prints today (the probe, before)
//   after         the place's pieces joined as the page joins them, with the signs at rest (zone.html placeLine, then
//                 placeShown and the joiner: tools/gloss-store-v1.mjs signsOff over printedForm, as B4 draws them);
//                 and the line the page prints once they are laid, with its credit (the probe, after)
// A hidden sign's gap (U+200B, the page's SIGN_GAP) is written ‹gap› in the table, so it can be seen.
// Usage: node lines-that-move.mjs <reader dir, laid> <laid-places.json> <before.json,...> <after.json,...> <out.tsv> <main's resting-lines dir>
import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [R, PLACES, BEFORE, AFTER, OUT, RESTING] = process.argv.slice(2);
const { printedForm, signsOff, SIGN_GAP } = await import(join(R, "tools/gloss-store-v1.mjs"));
const places = JSON.parse(readFileSync(PLACES, "utf8"));
const merge = (list) => { const o = {}; for (const f of list.split(",")) Object.assign(o, JSON.parse(readFileSync(f, "utf8")).books); return o; };
const before = merge(BEFORE), after = merge(AFTER);
const picks = JSON.parse(readFileSync(join(R, "data/default-picks/index.json"), "utf8"));
const recs = new Map();
const rec = (b) => { if (!recs.has(b)) recs.set(b, JSON.parse(gunzipSync(readFileSync(join(RESTING, `${b}.json.gz`))).toString("utf8"))); return recs.get(b); };
const show = (t) => (t === null || t === undefined ? "" : String(t).split(SIGN_GAP).join("‹gap›"));
const labelOf = (r, ids) => String(ids || "").split(" ").filter(Boolean).map((id) => `${id} (${((r.sources || {})[id] || {}).label || "?"})`).join(" + ");
const bracket = (t) => /[\[\]<>]/u.test(String(t || ""));
const rows = [["book", "chapter:verse", "word", "before (main's record of the lines at rest)", "before's credit", "after (the pieces joined as the page joins them, signs at rest)",
  "after's credit, as the page prints it", "the page before", "the page after", "what moves at rest", "STEP's reading stands here (call 4)", "class", "worded by", "on the record, the line spans"].join("\t")];
const C = { places: 0, nothing: 0, credit_only: 0, words: 0, appears: 0, by_before: new Map(), bracket_gained: 0, page_before_is_record: 0, page_after_is_pieces: 0, stands: 0, odd: [] };
const tally = (m, k) => m.set(k, (m.get(k) || 0) + 1);
for (const x of places) {
  const r = rec(x.book), sec = (r.sections || []).find((s) => s[0] === x.ref);
  const u = sec ? (sec[1] || []).find((v) => v[0] <= x.at && x.at < v[0] + Math.max(1, v[1])) || null : null;
  const pieces = x.pieces.map((g) => String(g).trim());
  const drawn = signsOff(printedForm(pieces.join("/")));
  const pb = ((before[x.book] || {}).places || {})[x.place], pa = ((after[x.book] || {}).places || {})[x.place];
  const ub = pb ? pb.unit : null, ua = pa ? pa.unit : null;
  const stands = ((((picks.books || {})[x.book] || {}).step_words || []).find((q) => q[0] === x.n) || [])[2] === 1;
  C.places += 1; if (stands) C.stands += 1;
  if (JSON.stringify(ub) === JSON.stringify(u)) C.page_before_is_record += 1;
  if (ua && ua[2] === drawn) C.page_after_is_pieces += 1;
  const bText = u ? u[2] : null, bCred = u ? u[3] : null, aText = ua ? ua[2] : null, aCred = ua ? ua[3] : null;
  let moves;
  if (!u) { moves = "words appear (the word was bare)"; C.appears += 1; }
  else if (bText === aText && bCred === aCred && u[1] === 1) { moves = "nothing"; C.nothing += 1; }
  else if (bText === aText && u[1] === 1) { moves = "the credit only"; C.credit_only += 1; }
  else { moves = "the words"; C.words += 1; tally(C.by_before, labelOf(r, bCred)); }
  if (moves !== "nothing" && bracket(aText) && !bracket(bText)) C.bracket_gained += 1;
  // what may look wrong on the line after: an empty piece, a piece of punctuation only, a word doubled across pieces
  const odd = [];
  for (const [i, t] of pieces.entries()) {
    if (!t) odd.push(`piece ${i + 1} is empty`);
    else if (!/[A-Za-z]/u.test(t)) odd.push(`piece ${i + 1} is «${t}», no letter`);
    if (i && pieces[i - 1].split(/\s+/u).pop().toLowerCase().replace(/[^a-z]/gu, "") === t.split(/\s+/u)[0].toLowerCase().replace(/[^a-z]/gu, "") && /[a-z]/iu.test(t)) odd.push(`«${pieces[i - 1]}» and «${t}» meet on one word`);
  }
  if (odd.length) C.odd.push(`${x.book} ${x.place} «${show(aText ?? drawn)}» (${moves}): ${odd.join("; ")}`);
  rows.push([x.book, x.ref, x.place.split(":")[2], show(bText), labelOf(r, bCred), show(drawn), labelOf(r, aCred) || String(aCred || ""), show(ub ? ub[2] : null) + (ub && ub[3] !== bCred ? ` [${ub[3]}]` : ""),
    show(aText), moves, stands ? "yes" : "no", x.cls, x.worded, u ? String(u[1]) : "0"].join("\t"));
}
writeFileSync(OUT, rows.join("\n") + "\n");
const nf = (n) => Number(n).toLocaleString("en-US");
console.log(`${nf(C.places)} laid places · the page before is main's record at ${nf(C.page_before_is_record)} · the page after prints the pieces' words at ${nf(C.page_after_is_pieces)} · STEP's reading stands at ${nf(C.stands)}`);
console.log(`at rest: nothing moves at ${nf(C.nothing)} · the credit alone moves at ${nf(C.credit_only)} · the words move at ${nf(C.words)} · words appear where the word was bare at ${nf(C.appears)} · a bracket gained at ${nf(C.bracket_gained)}`);
console.log(`the words move, by what led before: ${[...C.by_before].map(([k, v]) => `${nf(v)} ${k}`).join(" · ") || "none"}`);
console.log(`after-lines to look at (${C.odd.length}):\n  ${C.odd.join("\n  ")}`);
