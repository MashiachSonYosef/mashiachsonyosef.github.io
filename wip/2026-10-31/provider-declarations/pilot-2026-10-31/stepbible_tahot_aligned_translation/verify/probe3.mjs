// Probe 3: falsification attempts on angle.hebrew_words' enumerated meaning and angle.hebrew_letters' "Hebrew plural".
import { readFileSync, writeFileSync } from "node:fs";
const JSONL = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/punct/by-source/stepbible_tahot_aligned_translation.jsonl";
const rows = readFileSync(JSONL, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const W = (s) => (s.length > 60 ? s.slice(0, 57) + "..." : s);
const isL = (c) => c !== undefined && /\p{L}/u.test(c);
const PREP = /^(the|to|into|in|of|from|on|towards|for|with|before|at|by|upon|unto|like|as|among|against|over|under|toward|after|about|than|through|within|between|beside|until|of the|in the|to the|from the|on the|the face of)$/u;
const out = { hebrew_words_total: 0, article: 0, preposition_like: 0, to_infinitive: 0, other: 0, other_by_content: {}, other_examples: [], hebrew_letters_total: 0, hebrew_letters_content: {}, hebrew_letters_key_without_yod_or_tav_or_vav: 0, hebrew_letters_key_without_examples: [] };
for (const r of rows) {
  const R = r.route; const st = [];
  for (let i = 0; i < R.length; i++) {
    if (R[i] === "<") st.push(i);
    else if (R[i] === ">" && st.length) {
      const a = st.pop(); const content = R.slice(a + 1, i); const whole = R.slice(a, i + 1);
      if (whole === "<obj.>") continue;
      if (isL(R[a - 1])) {
        out.hebrew_letters_total++; out.hebrew_letters_content[content] = (out.hebrew_letters_content[content] || 0) + 1;
        if (!/[יות]/u.test(r.key)) { out.hebrew_letters_key_without_yod_or_tav_or_vav++; if (out.hebrew_letters_key_without_examples.length < 8) out.hebrew_letters_key_without_examples.push(`${r.key} | ${W(R)}`); }
        continue;
      }
      out.hebrew_words_total++;
      if (content === "the") out.article++;
      else if (PREP.test(content)) out.preposition_like++;
      else if (/^to \p{L}+$/u.test(content)) out.to_infinitive++;
      else { out.other++; out.other_by_content[content] = (out.other_by_content[content] || 0) + 1; if (out.other_examples.length < 10) out.other_examples.push(`${r.key} | ${W(R)}`); }
    }
  }
}
out.other_by_content = Object.fromEntries(Object.entries(out.other_by_content).sort((a, b) => b[1] - a[1]).slice(0, 25));
writeFileSync(new URL("./probe3.json", import.meta.url), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
