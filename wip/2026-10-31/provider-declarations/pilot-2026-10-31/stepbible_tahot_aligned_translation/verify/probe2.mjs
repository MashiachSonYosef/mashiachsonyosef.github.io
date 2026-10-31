// Follow-up probes for verify.mjs differences (word 'or', slash spacing, bracket classes in unbalanced rows).
import { readFileSync, writeFileSync } from "node:fs";
const JSONL = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/punct/by-source/stepbible_tahot_aligned_translation.jsonl";
const rows = readFileSync(JSONL, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const W = (s) => (s.length > 60 ? s.slice(0, 57) + "..." : s);
const out = { or_word_routes: [], or_word_space_bounded: 0, or_as_whole_segment: 0, spacing_char_only: {}, unbalanced_sq_rows: [], matched_pairs_in_unbalanced_sq_rows: 0, angle_unbalanced_rows: [] };
for (const r of rows) {
  const R = r.route;
  if (/\bor\b/u.test(R)) out.or_word_routes.push(`${r.key} | ${W(R)}`);
  if (/(^|\s|\/)or(\s|\/|$)/u.test(R)) out.or_word_space_bounded++;
  if (R.split("/").some((x) => x.trim() === "or")) out.or_as_whole_segment++;
  for (let i = 0; i < R.length; i++) if (R[i] === "/") {
    const a = R[i - 1] === " " ? "space" : "tight", b = R[i + 1] === " " ? "space" : "tight";
    out.spacing_char_only[`${a} / ${b}`] = (out.spacing_char_only[`${a} / ${b}`] || 0) + 1;
  }
  let st = 0, orphan = 0, pairs = 0;
  for (const c of R) { if (c === "[") st++; else if (c === "]") { if (st) { st--; pairs++; } else orphan++; } }
  if (st || orphan) { out.unbalanced_sq_rows.push(`${r.key} | ${W(R)}`); out.matched_pairs_in_unbalanced_sq_rows += pairs; }
  let sa = 0, oa = 0; for (const c of R) { if (c === "<") sa++; else if (c === ">") { if (sa) sa--; else oa++; } }
  if (sa || oa) out.angle_unbalanced_rows.push(`${r.key} | ${W(R)}`);
}
writeFileSync(new URL("./probe2.json", import.meta.url), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
