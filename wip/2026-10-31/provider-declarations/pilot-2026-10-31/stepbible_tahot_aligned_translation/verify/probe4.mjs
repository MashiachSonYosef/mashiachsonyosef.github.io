// Probe 4: try to reproduce the draft's square-bracket content classes (article / be_or_belong / other) under two readings.
import { readFileSync, writeFileSync } from "node:fs";
const JSONL = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/punct/by-source/stepbible_tahot_aligned_translation.jsonl";
const rows = readFileSync(JSONL, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const BEW = /\b(be|is|am|are|was|were|been|being|belong|belongs|belonged|belonging)\b/u;
const res = { stack_pairs: { pairs: 0, article: 0, be_any_word: 0, other: 0 }, regex_pairs: { pairs: 0, article: 0, be_any_word: 0, other: 0 } };
const cls = (o, c) => { o.pairs++; if (c === "the") o.article++; else if (BEW.test(c)) o.be_any_word++; else o.other++; };
for (const r of rows) {
  const R = r.route; const st = [];
  for (let i = 0; i < R.length; i++) { if (R[i] === "[") st.push(i); else if (R[i] === "]" && st.length) { const a = st.pop(); cls(res.stack_pairs, R.slice(a + 1, i)); } }
  for (const m of R.matchAll(/\[([^\]]*)\]/gu)) cls(res.regex_pairs, m[1]);
}
writeFileSync(new URL("./probe4.json", import.meta.url), JSON.stringify(res, null, 1));
console.log(JSON.stringify(res));
