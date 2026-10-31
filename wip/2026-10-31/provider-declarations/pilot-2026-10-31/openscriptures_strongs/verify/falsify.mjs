// Attempts to falsify the meaning of every dividing shape (and the field test the division rests on). Keyed windows <= 60 chars.
import { writeFileSync } from "node:fs";
import { loadRows, fieldOf, parse, words } from "./common.mjs";
import { analyze, useLabels } from "./classify.mjs";
import { draftIsLabel } from "./labels.mjs";
useLabels("draft");
const rows = loadRows(); const cache = new Map(); const seenDef = new Set();
const P = {}; const add = (probe, key, s, i, note) => { P[probe] ??= { count: 0, routes: new Set(), ex: [] }; P[probe].count++; P[probe].routes.add(key + "\u0001" + s); if (P[probe].ex.length < 12) P[probe].ex.push(`${key}: ${s.slice(Math.max(0, i - 30), i + 30).replace(/\s+/g, " ")}${note ? "  [" + note + "]" : ""}`); };
const LEAD = (t) => { const w = t.trim().split(/\s+/); for (let k = 1; k <= Math.min(4, w.length); k++) if (draftIsLabel(w.slice(0, k).join(" "))) return true; return /^(?:especially|specifically|i\.e\.|e\.g\.|properly|figuratively|literally|by implication|hence)\b/u.test(t.trim()); };
const ABBR_BEFORE = /(?:^|[\s(])(?:marg|Prop|prop|comp|Comp|incl|includ|ver|Heb|fig|lit|pl|i\.e|e\.g|etc|usu|techn|reflex|adj|corr|Ch|Chald)$/u;
for (const r of rows) {
  if (r.route !== r.def) continue;             // division applies to whole routes only (slices never cut)
  if (seenDef.has(r.key + "\u0001" + r.def)) continue; seenDef.add(r.key + "\u0001" + r.def);
  let a = cache.get(r.def); if (!a) { a = analyze(r.def); cache.set(r.def, a); }
  const s = r.def; const sh = a.shape;
  // boundaries for pieces: the dividing marks of the field
  const cuts = [...sh].filter(([, x]) => ["comma.rendering_separator", "semicolon.rendering_separator", "period.list_end", "semicolon.sense_separator", "comma.def_between_tagged_glosses"].includes(x)).map(([i]) => i).sort((x, y) => x - y);
  const pieceAround = (i) => { let b = -1, e = s.length; for (const c of cuts) { if (c < i) b = c; else if (c > i) { e = c; break; } } return [b, e]; };
  const left = (i) => { const [b] = pieceAround(i); return s.slice(b + 1, i).trim(); };
  const right = (i) => { let e = s.length; for (const c of cuts) if (c > i) { e = c; break; } return s.slice(i + 1, e).trim(); };
  // quotation state at each position
  let q = false; const inQuote = new Array(s.length).fill(false);
  for (let i = 0; i < s.length; i++) { inQuote[i] = q; if (sh.get(i) === "apostrophe.quote_open") q = true; else if (sh.get(i) === "apostrophe.quote_close") q = false; }
  for (const [i, x] of sh) {
    if (x === "comma.rendering_separator" || x === "semicolon.rendering_separator") {
      const L = left(i), R = right(i);
      if (/^\s*-/u.test(s.slice(i + 1))) add("rendering_separator.next_piece_is_a_syllable", r.key, s, i, R);
      if (/^\(\s+-[^()]*\)$/u.test(R)) add("rendering_separator.next_piece_is_a_spaced_syllable_group", r.key, s, i, R);
      if (/-$/u.test(L) && !/\(/u.test(L.slice(-3))) add("rendering_separator.previous_piece_ends_in_a_prefix_hyphen", r.key, s, i, L);
      if ([...L, ...R].length && (a.p.orphan.size && [...a.p.orphan].some((o) => (o > i && o < i + 1 + s.slice(i + 1).indexOf(R) + R.length + 1) ))) add("rendering_separator.next_piece_holds_an_orphan_closer", r.key, s, i, R);
      if (/^\([^()]*\)$/u.test(R) || /^\([^()]*\)$/u.test(L)) add("rendering_separator.a_side_is_a_lone_group", r.key, s, i, /^\(/.test(R) ? R : L);
      if (inQuote[i]) add("rendering_separator.inside_a_quotation", r.key, s, i);
      if (!L || !R || /^(and|or|nor|but)$/iu.test(L) || /^(and|or|nor|but)$/iu.test(R)) add("rendering_separator.empty_or_bare_conjunction_piece", r.key, s, i, `${L}|${R}`);
      if (/\bi\.e\.|\bfiguratively\b|\bby implication\b|\bproperly\b/u.test(L + " " + R)) add("rendering_separator.sentence_vocabulary_in_a_piece", r.key, s, i);
      if (words(L) > 6 || words(R) > 6) add("rendering_separator.a_side_longer_than_6_words", r.key, s, i, (words(L) > 6 ? L : R).slice(0, 40));
    }
    if (x === "period.list_end") {
      const after = s.slice(i + 1).trim(); const before = s.slice(0, i);
      if (after && !/^(?:Compare|See|Also|Prop|Comp|Cf|Or|Probably|Perhaps|Used|Including|Includ|The|This|From|In|By|Sometimes|Often)\b|^[(\[]/u.test(after)) add("list_end.note_does_not_open_as_a_note", r.key, s, i, after.slice(0, 30));
      if (after && /^\p{Ll}/u.test(after)) add("list_end.text_after_continues_lowercase", r.key, s, i, after.slice(0, 30));
      if (ABBR_BEFORE.test(before)) add("list_end.the_stop_closes_an_abbreviation", r.key, s, i);
      { const lastStart = Math.max(-1, ...cuts.filter((c) => c < i)); const last = s.slice(lastStart + 1, i); if (/\b(?:See|Compare|Comp\.|Marg\.)\s*\d/u.test(last)) add("list_end.a_note_is_glued_into_the_last_rendering", r.key, s, i, last.trim().slice(0, 40)); }
      if (after) { const ap = parse(after); let dc = 0; for (let k = 0; k < after.length; k++) if (after[k] === "," && ap.depth[k] === 0) dc++; if (dc >= 1 && !/\p{N}/u.test(after)) add("list_end.note_is_a_comma_list_without_a_number", r.key, s, i, after.slice(0, 40)); }
    }
    if (x === "semicolon.sense_separator") {
      const L = left(i), R = right(i);
      if (/^(?:but\s+)?(?:used|often used|only|always|mostly)\b/iu.test(R)) add("sense_separator.next_sense_opens_as_a_usage_note", r.key, s, i, R.slice(0, 30));
      if (/^(?:from|compare|see|denominative|of uncertain|probably from|perhaps from|a primitive root|the same as)\b|^\d/iu.test(R)) add("sense_separator.next_piece_is_a_reference_not_a_sense", r.key, s, i, R.slice(0, 30));
      if (!L.replace(/\([^()]*\)|\[[^\[\]]*\]/gu, "").trim() || !R.replace(/\([^()]*\)|\[[^\[\]]*\]/gu, "").trim()) add("sense_separator.a_side_is_only_a_group_or_empty", r.key, s, i, `${L.slice(-25)}|${R.slice(0, 25)}`);
      if (inQuote[i]) add("sense_separator.inside_a_quotation", r.key, s, i);
      if (/^(?:or|and)\b/u.test(R) && words(R) <= 3) add("sense_separator.next_piece_is_a_short_or_and_continuation", r.key, s, i, R);
    }
    if (x === "comma.def_between_tagged_glosses") {
      const L = left(i), R = right(i);
      if (LEAD(R)) add("between_tagged.right_piece_opens_with_a_usage_label", r.key, s, i, R.slice(0, 30));
      if (/^\p{Lu}/u.test(R)) add("between_tagged.right_piece_is_capitalized_name", r.key, s, i, R.slice(0, 30));
      if (/^(?:whether|but|as|when|which|who|that|with|without|for|in|of|from|by|to the|at)\b/u.test(R) && !/^to\b/u.test(R)) add("between_tagged.right_piece_opens_like_a_qualifier", r.key, s, i, R.slice(0, 30));
      if (words(L) > 4 || words(R) > 4) add("between_tagged.a_side_longer_than_4_words", r.key, s, i, (words(L) > 4 ? L : R).slice(0, 40));
      if (/^(?:or|and)\b/u.test(R)) add("between_tagged.right_piece_opens_with_or_and", r.key, s, i, R.slice(0, 30));
    }
    if (x === "comma.def_name_then_description") {
      const R = right(i); const L = left(i);
      if (/ $/u.test(s.slice(0, i + 1 + s.slice(i + 1).indexOf(R) + R.length)) && /\S [,;]/u.test(s.slice(i + 1, i + 2 + R.length + 2)) && !/^(?:a|an|the|one|i\.e\.)\b/u.test(R)) add("name_then_description.next_piece_is_a_tagged_gloss_not_a_description", r.key, s, i, `${L.slice(-20)}|${R.slice(0, 25)}`);
    }
  }
  // the field test itself
  if (a.field === "def" && /\.\s*\((?:[^()]|\([^()]*\))*\)\.?\s*$|\.'\s*$/u.test(s)) { let n = 0; for (const [, x] of sh) if (x && x.startsWith("comma.def")) n++; add("field_test.list_with_a_closing_note_read_as_sentence", r.key, s, s.length - 1, `${n} commas read as sentence commas`); }
  if (a.field === "list" && /\bi\.e\.|(?:^|[\s,;])(?:figuratively|by implication|properly|specifically),/u.test(s)) add("field_test.sentence_vocabulary_in_a_list_record", r.key, s, s.search(/i\.e\.|figuratively|by implication|properly|specifically/u));
}
const out = Object.fromEntries(Object.entries(P).map(([k, v]) => [k, { occurrences: v.count, records: v.routes.size, examples: v.ex }]));
writeFileSync(new URL("./falsify.json", import.meta.url), JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) { console.log(`## ${k}: ${v.occurrences} occ, ${v.records} records`); for (const e of v.examples) console.log("   ", e); }
