// Count pieces by role under the declaration as measured (reconcile lists), to check the draft's
// pieces_by_role and whether a 'used ...' explanation after ':' is a reading (explanation) or a note.
import { readFileSync } from "node:fs";
import { analyzeRoute, OPTS, R_NOTE_START } from "./classify.mjs";
OPTS.hebrewOutside = "scopes"; OPTS.reconcile = true;
const DIV = new Set(["comma.gloss_boundary", "semicolon.sense_boundary", "semicolon.note_follows", "period.sentence_boundary", "period.before_trailing_note", "colon.head_explanation", "colon.pointer_gloss", "colon.gloss_pointer", "colon.strongs_list"]);
const roles = {}; let explNote = 0;
for (const line of readFileSync(process.argv[2], "utf8").split("\n")) {
  if (!line) continue; const s = JSON.parse(line).route; const R = analyzeRoute(s);
  if (R.ledByLabel || R.closedByLabel) continue;
  const cuts = [];
  for (const m of [R.commaShape, R.semiShape, R.periodShape, R.colonShape]) for (const [i, v] of m) { const sh = typeof v === "string" ? v : v.sh; if (DIV.has(sh)) cuts.push(i); }
  if (!cuts.length) continue; cuts.sort((a, b) => a - b);
  let st = 0; const spans = []; for (const c of cuts) { spans.push([st, s[c] === "." ? c + 1 : c]); st = c + 1; } spans.push([st, s.length]);
  for (const [a, b] of spans) {
    if (!s.slice(a, b).trim()) continue;
    const mid = a + s.slice(a, b).search(/\S/u);
    const p = R.parts.find((q) => mid >= q.a && mid < q.b) || R.parts.find((q) => mid >= q.a && mid <= q.b);
    const isTrailingNote = R.trailingKind === "note" && R.trailing && mid >= R.trailing.open;
    let role = isTrailingNote ? "note" : !p ? "?" : p.note ? "note" : p.role === "strongs" ? "strongs_list" : p.hebrew ? "pointer" : p.role === "pointer_after" ? "pointer?" : p.role;
    roles[role] = (roles[role] || 0) + 1;
    if (role === "explanation" && R_NOTE_START.test(s.slice(a, b).trim())) explNote++;
  }
}
console.log(JSON.stringify({ roles, explanation_pieces_opening_as_note: explNote }));
