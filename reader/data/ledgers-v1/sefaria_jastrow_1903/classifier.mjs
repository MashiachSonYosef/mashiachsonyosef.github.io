// sefaria_jastrow_1903.classifier.mjs · made from classifier-template-v1 under ask v1.1
//
// A classifier is a declaration made runnable. It is a pure function: no file
// reads, no network, no state kept between calls. classify(text) returns one
// {i, mark, shape} for EVERY mark in the text, where a mark is any character
// that is not a letter, a digit or whitespace, and i is its index in the
// JavaScript string. Do not change anything above the SHAPES line; the
// checker reads containers the same way.
//
// Each shape's test receives a context:
//   c.text       the whole route text
//   c.i          the mark's index
//   c.mark       the mark itself
//   c.container  "top" | "paren" | "bracket" | "angle" | "brace": the innermost
//                bracket the mark sits in (a bracket character sits in what
//                encloses it, not in itself)
//   c.depth      how many brackets enclose it
//   c.unclosed   true when an opener before it never closes
//   c.before     the text before the mark;  c.after  the text after it
//   c.inner      the text inside the innermost enclosing bracket ("" at top)
//   c.group      for an opening or closing bracket: the text it opens or closes
//                (null for an opener that never closes); "" for other marks
// Order matters: for each mark, the first shape whose test returns true names
// it. If no shape matches, classify throws and names the place, so a missing
// shape is never silently swallowed. Put specific shapes before general ones.
const isMark = (ch) => !/[\p{L}\p{N}\s]/u.test(ch);
const OPEN = { "(": ")", "[": "]", "<": ">", "{": "}" };
const CLOSE = { ")": "(", "]": "[", ">": "<", "}": "{" };
const CONTAINER = { "(": "paren", "[": "bracket", "<": "angle", "{": "brace" };

const SHAPES = [
  // ---- fragment jastrow ----
  { id: "comma.in_unbalanced_text", mark: ",", divides: false, test: (c) => unbalanced(c.text) },
  { id: "comma.in_paren_before_the_closer", mark: ",", divides: false, test: (c) => c.container === "paren" },
  { id: "comma.opens_the_text", mark: ",", divides: false, test: (c) => opensText(c) },
  { id: "comma.ends_the_text", mark: ",", divides: false, test: (c) => endsText(c) },
  { id: "comma.after_a_dash", mark: ",", divides: false, test: (c) => c.before.endsWith("\u2014") },
  { id: "comma.after_a_leading_grammar_label", mark: ",", divides: false, test: (c) => leadingLabel(c) },
  { id: "comma.in_a_text_with_a_pointer_or_note_sign", mark: ",", divides: false, test: (c) => noteText(c.text) },
  { id: "comma.in_a_text_with_a_joining_piece", mark: ",", divides: false, test: (c) => joiningText(c.text) },
  { id: "comma.in_a_text_with_a_leaning_piece", mark: ",", divides: false, test: (c) => leaningText(c.text) },
  { id: "comma.after_a_name_before_its_description", mark: ",", divides: false, test: (c) => nameText(c.text) },
  { id: "comma.after_a_name_phrase_before_its_description", mark: ",", divides: false, test: (c) => namePhraseText(c.text) },
  { id: "comma.in_a_text_with_a_note_on_use", mark: ",", divides: false, test: (c) => useNoteText(c.text) },
  { id: "comma.between_capitalised_names", mark: ",", divides: false, test: (c) => capitalisedText(c.text) },
  { id: "comma.between_wordings_of_one_sense", mark: ",", divides: false, test: (c) => wordingText(c.text) },
  { id: "semicolon.in_unbalanced_text", mark: ";", divides: false, test: (c) => unbalanced(c.text) },
  { id: "semicolon.opens_the_text", mark: ";", divides: false, test: (c) => opensText(c) },
  { id: "semicolon.ends_the_text", mark: ";", divides: false, test: (c) => endsText(c) },
  { id: "semicolon.before_a_trailing_grammar_label", mark: ";", divides: false, test: (c) => labelAfter(c) },
  { id: "semicolon.in_a_text_with_a_pointer_or_note_sign", mark: ";", divides: false, test: (c) => noteText(c.text) },
  { id: "semicolon.in_a_text_with_a_joining_piece", mark: ";", divides: false, test: (c) => joiningText(c.text) },
  { id: "semicolon.in_a_text_with_a_note_on_use", mark: ";", divides: false, test: (c) => useNoteText(c.text) },
  { id: "semicolon.between_groups_of_wordings", mark: ";", divides: false, test: (c) => wordingText(c.text) },
  { id: "period.in_unbalanced_text", mark: ".", divides: false, test: (c) => unbalanced(c.text) },
  { id: "period.after_an_abbreviation", mark: ".", divides: false, test: (c) => LISTS.abbreviations.includes(runBefore(c.before)) || (runBefore(c.before) === "part" && /^ (pass|Hof)\b/u.test(c.after)) },
  { id: "period.before_a_dash", mark: ".", divides: false, test: (c) => c.after.startsWith("\u2014") },
  { id: "period.before_a_trailing_grammar_label", mark: ".", divides: false, test: (c) => labelAfter(c) },
  { id: "period.opens_the_text", mark: ".", divides: false, test: (c) => opensText(c) },
  { id: "period.between_two_names", mark: ".", divides: false, test: (c) => /^\s+\p{Lu}/u.test(c.after) },
  { id: "period.ends_the_text", mark: ".", divides: false, test: (c) => endsText(c) },
  { id: "hyphen.inside_a_compound_word", mark: "-", divides: false, test: (c) => /\p{L}$/u.test(c.before) && /^[\p{L}\u2018]/u.test(c.after) },
  { id: "hyphen.ends_a_word_part", mark: "-", divides: false, test: (c) => true },
  { id: "right_single_quotation_mark.before_a_possessive_s", mark: "’", divides: false, test: (c) => /^s(?!\p{L})/u.test(c.after) },
  { id: "right_single_quotation_mark.after_a_plural_possessive", mark: "’", divides: false, test: (c) => /s$/u.test(c.before) && /^\s/u.test(c.after) },
  { id: "right_single_quotation_mark.inside_a_transliterated_word", mark: "’", divides: false, test: (c) => /\p{L}$/u.test(c.before) && /^\p{L}/u.test(c.after) },
  { id: "right_single_quotation_mark.closes_a_quotation", mark: "’", divides: false, test: (c) => true },
  { id: "left_single_quotation_mark.inside_a_transliterated_word", mark: "‘", divides: false, test: (c) => /\p{L}$/u.test(c.before) },
  { id: "left_single_quotation_mark.opens_a_quotation", mark: "‘", divides: false, test: (c) => LISTS.quotation_starts.some((q) => c.after.startsWith(q)) },
  { id: "left_single_quotation_mark.before_a_transliterated_word", mark: "‘", divides: false, test: (c) => true },
  { id: "question_mark.marks_a_doubtful_identification", mark: "?", divides: false, test: (c) => LISTS.doubted_words.includes(runBefore(c.before)) },
  { id: "question_mark.between_two_questions", mark: "?", divides: false, test: (c) => /^\s+[\p{L}\u2018(]/u.test(c.after) },
  { id: "question_mark.closes_a_question", mark: "?", divides: false, test: (c) => true },
  { id: "exclamation.between_two_cries", mark: "!", divides: false, test: (c) => /^\s+[\p{L}\u2018(]/u.test(c.after) },
  { id: "exclamation.closes_a_cry", mark: "!", divides: false, test: (c) => true },
  { id: "em_dash.before_a_trailing_grammar_label", mark: "—", divides: false, test: (c) => labelAfter(c) && !LISTS.grammar_labels.includes(c.before.trim()) },
  { id: "em_dash.between_two_grammar_labels", mark: "—", divides: false, test: (c) => labelAfter(c) },
  { id: "em_dash.ends_the_text", mark: "—", divides: false, test: (c) => endsText(c) },
  { id: "em_dash.marks_an_omitted_object", mark: "—", divides: false, test: (c) => true },
  { id: "colon.before_a_dash", mark: ":", divides: false, test: (c) => c.after.startsWith("\u2014") },
  { id: "colon.ends_the_text", mark: ":", divides: false, test: (c) => endsText(c) },
  { id: "colon.between_two_wordings", mark: ":", divides: false, test: (c) => true },
  { id: "equals.between_a_term_and_its_equivalent", mark: "=", divides: false, test: (c) => true },
  { id: "ampersand.in_et_cetera", mark: "&", divides: false, test: (c) => c.after.startsWith("c") },
  { id: "open_paren.holds_another_name_or_an_equivalent", mark: "(", divides: false, test: (c) => LISTS.names_or_equivalents.includes(c.group) },
  { id: "open_paren.holds_a_qualifier_or_object", mark: "(", divides: false, test: (c) => true },
  { id: "close_paren.never_opened", mark: ")", divides: false, test: (c) => closerNeverOpened(c) },
  { id: "close_paren.closes_another_name_or_an_equivalent", mark: ")", divides: false, test: (c) => LISTS.names_or_equivalents.includes(c.group) },
  { id: "close_paren.closes_a_qualifier_or_object", mark: ")", divides: false, test: (c) => true },
  { id: "hebrew_point_qamats.in_a_hebrew_pointer", mark: "ָ", divides: false, test: (c) => true },
  { id: "hebrew_point_shin_dot.in_a_hebrew_pointer", mark: "ׁ", divides: false, test: (c) => true },
];

// ---- the ask's own helper for rule 3 (ASK v1.1, rule 3), copied byte for byte ----
function unbalanced(text) {
  const st = [];
  for (const ch of text) {
    if (OPEN[ch]) st.push(ch);
    else if (CLOSE[ch]) { if (st.length && st[st.length - 1] === CLOSE[ch]) st.pop(); else return true; }
  }
  return st.length > 0;
}

// ---- helpers of fragment jastrow ----
const LISTS = {"grammar_labels":["Part. pass","Part. pass.","part. pass","part. pass.","Pa. part. pass","pl. constr.","Pl. majest.","Pl. fem","f.pl.","part. Hof","Hif.","Nif.","Pi.","Pol.","Saf.","Shaf.","Du.","Pilp.","Palp.","Polel","Nithpa.","pl.","Pl.","Part."],"abbreviations":["Part","Pa","Pl","pl","Nithpa","Nif","Pi","Pol","Hif","f","Du","Saf","Shaf","Pilp","Palp","constr","majest","trnsf","gen","esp","cmp","v","c","acc","Cæs","Ant","St","R","D","Z","A","S","T","J","L","P","H","p","Ḥ","b","d’R","I"],"joining_words":["and","or","nor"],"leaning_pieces":["otherwise exempt","by witnesses","given to the offender immediately before committing the offe","by letting cattle live on it","strapped on the carrier’s back","in which grapes are carried during the vintage","honey and oil beaten into a pulp","filled with an unclean water","so as to make its surface level with the surface of the wate","being bent inside","presses on the stomach and creates nausea","one half of the natural day and of the natural night","having the status","of freedmen","of incisions","of menstruation","of rope","of one of a pair","of regret for a vow made under misapprehension","before a court","before the execution of a loan","to the effect that the law of limitation by the entrance of ","as a free-booter","at the risk of receiving no consideration","for Sabbath distances","in cases of wing-like projections beyond the line","of a square P’ras","declared unclean on account of crushed bones carried over it","of heterogeneous animals by hybridization or by harnessing t","of wool and linen in the same web","on measuring by sight","since he","when the former is leaning against the latter","with uplifted tails","with vowel letters","that thumb and that of the index finger when held apart","manufacturer of","happiness of","open road","to endow with skill","to enter a town"],"plain_terms":["gomed","shittuf","prosbul","dofek","piggul","sadda"],"doubted_words":["Therapeut","Petræan","piggul"],"quotation_starts":["blank’","May his death","Z’man’","it is partiality"],"names_or_equivalents":["Dunag","Zaidan","Philistæa","and he spoke","Bath","Canal of","of Damascus","Encomiast","syrinx"]};
function piecesOf(text) { const out = []; let depth = 0, cur = ""; for (const ch of text) { if (ch === "(") depth++; else if (ch === ")") depth = Math.max(0, depth - 1); if ((ch === "," || ch === ";") && depth === 0) { out.push(cur); cur = ""; } else cur += ch; } out.push(cur); return out.map((p) => p.trim()); }
function coreOf(p) { return p.replace(/[.!?]+$/u, "").trim(); }
function firstLetterChar(p) { const cs = [...p]; let k = 0; while (k < cs.length && (cs[k] === "\u2018" || cs[k] === "(")) k++; return cs[k] || ""; }
function firstRun(p) { const m = /^\p{L}+/u.exec(p); return m ? m[0] : ""; }
function isTerm(p) { const core = coreOf(p); if (!core || /\s/u.test(core) || LISTS.grammar_labels.includes(p)) return false; if (/\p{Lu}/u.test(firstLetterChar(core))) return true; if ([...core].some((ch) => (/\p{L}/u.test(ch) && !/[A-Za-z\u00E6\u0153\u00C6\u0152]/u.test(ch)) || ch === "\u2019" || ch === "\u2018")) return true; return LISTS.plain_terms.includes(core); }
function noteText(t) { return t.includes("cmp.") || t.includes("&c") || piecesOf(t).some((p) => p === "v."); }
function joiningText(t) { return piecesOf(t).slice(1).some((p) => LISTS.joining_words.includes(firstRun(p))); }
function leaningText(t) { return piecesOf(t).some((p) => { const core = coreOf(p); return LISTS.leaning_pieces.some((e) => e === core || (e.length === 60 && core.startsWith(e))); }); }
function nameText(t) { const ps = piecesOf(t); return ps.some((p, k) => k + 1 < ps.length && isTerm(p) && /\p{Ll}/u.test(firstLetterChar(ps[k + 1]))); }
function namePhraseText(t) { const ps = piecesOf(t); return ps.some((p, k) => { if (k + 1 >= ps.length) return false; const w = coreOf(p).split(/\s+/u).filter(Boolean); return w.length >= 2 && /\p{Lu}/u.test(firstLetterChar(w[w.length - 1])) && ["a", "an", "the"].includes(firstRun(ps[k + 1])); }); }
function useNoteText(t) { return piecesOf(t).some((p) => /^use\s+of(?!\p{L})/u.test(p)); }
function capitalisedText(t) { const ps = piecesOf(t).filter((p) => p !== ""); return ps.length > 0 && ps.every((p) => /\p{Lu}/u.test(firstLetterChar(p))); }
function wordingText(t) { const ps = piecesOf(t).filter((p) => p !== ""); return ps.length > 0 && ps.every((p) => /^[\p{L}\u2018(]/u.test(p)); }
function endsText(c) { return /^\s*$/u.test(c.after); }
function opensText(c) { return /^\s*$/u.test(c.before); }
function runBefore(before) { const m = /[\p{L}\u2019\u0027]+$/u.exec(before); return m ? m[0] : ""; }
function labelAfter(c) { return LISTS.grammar_labels.includes(c.after.trim()); }
function leadingLabel(c) { const b = c.before.trim(); return !/[,;]/u.test(b) && LISTS.grammar_labels.includes(b); }
function closerNeverOpened(c) { return c.group === "" && !c.before.endsWith(")"); }

export function classify(text) {
  const chars = [...text];
  const pos = []; let i16 = 0;
  for (const ch of chars) { pos.push(i16); i16 += ch.length; }
  const st = [], match = new Map();
  chars.forEach((ch, k) => {
    if (OPEN[ch]) st.push(k);
    else if (CLOSE[ch] && st.length && chars[st[st.length - 1]] === CLOSE[ch]) { const o = st.pop(); match.set(o, k); match.set(k, o); }
  });
  const never = new Set(st);
  const firstUnclosed = st.length ? Math.min(...st) : Infinity;
  const stack = [], out = [];
  chars.forEach((ch, k) => {
    if (CLOSE[ch] && stack.length && chars[stack[stack.length - 1]] === CLOSE[ch]) stack.pop();
    if (isMark(ch)) {
      const top = stack.length ? stack[stack.length - 1] : -1;
      const inner = top >= 0 ? chars.slice(top + 1, match.get(top)).join("") : "";
      let group = "";
      if (OPEN[ch]) group = match.has(k) ? chars.slice(k + 1, match.get(k)).join("") : null;
      else if (CLOSE[ch] && match.has(k)) group = chars.slice(match.get(k) + 1, k).join("");
      const c = { text, i: pos[k], mark: ch, container: top >= 0 ? CONTAINER[chars[top]] : "top", depth: stack.length, unclosed: k >= firstUnclosed, before: chars.slice(0, k).join(""), after: chars.slice(k + 1).join(""), inner, group };
      const s = SHAPES.find((x) => x.mark === ch && x.test(c));
      if (!s) throw new Error(`no shape for "${ch}" (${c.container}) at ${pos[k]} in: ${text.slice(Math.max(0, pos[k] - 30), pos[k] + 30)}`);
      out.push({ i: pos[k], mark: ch, shape: s.id });
    }
    if (OPEN[ch] && !never.has(k)) stack.push(k);
  });
  return out;
}
export const SHAPE_IDS = SHAPES.map((s) => s.id);
