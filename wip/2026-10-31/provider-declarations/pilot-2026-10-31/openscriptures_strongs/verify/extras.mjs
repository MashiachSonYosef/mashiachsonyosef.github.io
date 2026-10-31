// Non-dividing meanings checked in passing, and the precedence overlaps the words leave open. Route occurrences.
import { writeFileSync } from "node:fs";
import { loadRows, isLetter } from "./common.mjs";
import { analyze, useLabels } from "./classify.mjs";
useLabels("draft");
const rows = loadRows(); const cache = new Map(); const out = {}; const add = (k, key, s, i) => { out[k] ??= { n: 0, ex: [] }; out[k].n++; out[k].ex.length < 6 && out[k].ex.push(`${key}: ${s.slice(Math.max(0, i - 28), i + 20)}`); };
for (const r of rows) {
  let a = cache.get(r.def); if (!a) { a = analyze(r.def); cache.set(r.def, a); }
  const s = r.def; const off = r.route === r.def ? 0 : s.indexOf(r.route);
  for (let k = 0; k < r.route.length; k++) {
    const i = off + k; const x = a.shape.get(i);
    if (x === "period.aside_sentence_end") {
      const open = s.lastIndexOf("(", i); const content = s.slice(open + 1, i);
      if (isLetter(s[i - 1]) && /^[A-Za-z]+$/u.test(content.split(/\s+/).pop()) && (content.trim().split(/\s+/).length === 1 || /\b(?:marg|art|adj|compar|reflex|techn|fem|masc|plur|pl|sing|Chald|Heb|lit|fig)$/u.test(content))) add("aside_sentence_end_is_an_abbreviation", r.key, s, i);
    }
    if (x === "period.abbreviation" || (!x && s[i] === ".")) {
      if (/^\s*\(|^'?\s*$/u.test(s.slice(i + 1)) && a.field === "def") add("period_after_a_word_before_a_closing_note_or_quote_(draft_code:_abbreviation;_words:_no_shape)", r.key, s, i);
    }
    if (x === "comma.def_name_then_description") {
      const f = a.flags.get(i);
      if (f && f.between) add("name_then_description_where_the_next_piece_is_also_tagged", r.key, s, i);
    }
  }
}
writeFileSync(new URL("./extras.json", import.meta.url), JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) { console.log(k, v.n); for (const e of v.ex) console.log("   ", e); }
