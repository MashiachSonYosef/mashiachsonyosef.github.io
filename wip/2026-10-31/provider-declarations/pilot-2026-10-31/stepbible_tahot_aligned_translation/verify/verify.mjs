// Independent verifier for the drafted TAHOT (M4) mark ledger.
// Written from the shape TESTS as stated in words in the draft summary; does
// not import or reuse the draft's census.mjs. Single process, reads one JSONL,
// the inventory, the draft declaration (for in-memory machine check only), and
// imports sense-split-v1.mjs / declaration-v1.mjs / gloss-store packSplit text
// read-only. Writes only verify.json next to this file.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const HERE = dirname(fileURLToPath(import.meta.url));
const SP = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad";
const JSONL = `${SP}/punct/by-source/stepbible_tahot_aligned_translation.jsonl`;
const INV = `${SP}/punct/mark-inventory-2026-10-31.json`;
const DRAFT = `${SP}/punct/pilot/stepbible_tahot_aligned_translation/declaration.json`;
const SENSE = `${SP}/ghp/reader/tools/sense-split-v1.mjs`;
const MACHINE = `${SP}/ghp/reader/tools/declaration-v1.mjs`;
const GLOSS = `${SP}/ghp/reader/tools/gloss-store-v1.mjs`;
const SRC = "stepbible_tahot_aligned_translation";

const rows = readFileSync(JSONL, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const isMark = (c) => !/[\p{L}\p{N}\s]/u.test(c);
const isL = (c) => c !== undefined && /\p{L}/u.test(c);
const W = (s) => (s.length > 60 ? s.slice(0, 57) + "..." : s);
const ex = (r) => `${r.key} | ${W(r.route)}`;

// ---- per-row structures --------------------------------------------------
function analyze(R) {
  const segIdx = []; const segs = []; let s = 0, n = 0;
  for (let i = 0; i < R.length; i++) { segIdx[i] = n; if (R[i] === "/") { segs.push([s, i]); s = i + 1; n++; } }
  segs.push([s, R.length]);
  const segText = segs.map(([a, z]) => R.slice(a, z));
  const pair = (o, c) => {
    const st = []; const openOf = {}; const closeOf = {}; const orphanClose = []; let maxDepth = 0;
    for (let i = 0; i < R.length; i++) {
      if (R[i] === o) { st.push(i); maxDepth = Math.max(maxDepth, st.length); }
      else if (R[i] === c) { if (st.length) { const a = st.pop(); openOf[i] = a; closeOf[a] = i; } else orphanClose.push(i); }
    }
    return { openOf, closeOf, unclosed: st, orphanClose, maxDepth };
  };
  return { segIdx, segs, segText, sq: pair("[", "]"), an: pair("<", ">") };
}

// ---- shape tests, one function per mark, every test evaluated independently
function tests(R, i, A) {
  const c = R[i], p = R[i - 1], q = R[i + 1];
  const seg = A.segText[A.segIdx[i]] ;
  const t = {};
  if (c === "/") {
    const before = A.segText[A.segIdx[i]], after = A.segText[A.segIdx[i] + 1];
    const ne = (x) => x !== undefined && /\S/u.test(x);
    t["slash.segment_boundary"] = ne(before) && ne(after);
    t["slash.empty_segment"] = !ne(before) || !ne(after);
  } else if (c === "[") {
    const z = A.sq.closeOf[i];
    if (z === undefined) t["square.open_continues_elsewhere"] = true;
    else {
      const content = R.slice(i + 1, z); const hasL = /\p{L}/u.test(content);
      t["square.supplied_words"] = !isL(p) && hasL && !content.startsWith("-");
      t["square.supplied_letters"] = isL(p) && hasL;
      t["square.supplied_suffix"] = content.startsWith("-");
      t["square.supplied_punctuation"] = !hasL;
    }
  } else if (c === "]") {
    const a = A.sq.openOf[i];
    if (a === undefined) t["square.close_opened_elsewhere"] = true;
    else { const o = tests(R, a, A); for (const [k, v] of Object.entries(o)) t[k] = v; }
  } else if (c === "<") {
    const z = A.an.closeOf[i];
    if (z !== undefined) {
      const whole = R.slice(i, z + 1);
      t["angle.hebrew_words"] = !isL(p) && whole !== "<obj.>";
      t["angle.hebrew_letters"] = isL(p);
      t["angle.object_marker"] = whole === "<obj.>";
    }
  } else if (c === ">") {
    const a = A.an.openOf[i];
    if (a === undefined) t["angle.close_opened_nowhere"] = true;
    else { const o = tests(R, a, A); for (const [k, v] of Object.entries(o)) t[k] = v; }
  } else if (c === "-") {
    const segStart = A.segs[A.segIdx[i]][0];
    const firstOfSeg = R.slice(segStart, i).trim() === "";       // first non-space char of its segment
    t["hyphen.compound"] = isL(p) && isL(q);
    t["hyphen.word_continues_after"] = isL(p) && (i === R.length - 1 || q === "/");
    t["hyphen.word_continued_from_before"] = firstOfSeg && isL(q);
    t["hyphen.supplied_suffix"] = p === "[";
    const si = A.segIdx[i];
    t["hyphen.maqaf_segment"] = seg.trim() === "-" && si > 0 && si < A.segs.length - 1;
  } else if (c === "!") {
    t["bang.mark_only_segment"] = seg.trim() === "!";
    t["bang.exclamation"] = isL(p) || p === "]";
  } else if (c === "?") {
    t["question.end_of_rendering"] = i === R.length - 1 || q === "/";
    t["question.before_construct_of"] = isL(p) && /^ of(\W|$)/u.test(R.slice(i + 1));
    t["question.supplied"] = p === "[" && q === "]";
    t["question.mark_only_segment"] = seg.trim() === "?";
  } else if (c === "¿") {
    t["inverted.interrogative_segment"] = seg.trim() === "¿";
  } else if (c === ".") {
    t["period.abbreviation"] = R.slice(i - 4, i + 2) === "<obj.>";
  } else if (c === "'") {
    t["apostrophe.possessive"] = (isL(p) && isL(q)) || (p === "s" && (q === " " || q === undefined));
  } else if (c === ":") {
    t["colon.route_final"] = i === R.length - 1;
  } else if (c === ";") {
    // depth 0 over every bracket kind the provider uses
    let d = 0; for (let k = 0; k < i; k++) { if ("[<(".includes(R[k])) d++; else if ("]>)".includes(R[k])) d--; }
    const m = /^ \[([^\]]*\p{L}[^\]]*)\]/u.exec(R.slice(i + 1));
    t["semicolon.clause_end_before_supplied"] = d === 0 && !!m;
  }
  return t;
}

const CLAIM = {
  "/": { "slash.segment_boundary": 63983, "slash.empty_segment": 30 },
  "[": { "square.supplied_words": 21430, "square.supplied_letters": 1268, "square.supplied_suffix": 15, "square.open_continues_elsewhere": 4, "square.supplied_punctuation": 2 },
  "]": { "square.supplied_words": 21430, "square.supplied_letters": 1268, "square.supplied_suffix": 15, "square.supplied_punctuation": 2, "square.close_opened_elsewhere": 2 },
  "<": { "angle.hebrew_words": 4946, "angle.hebrew_letters": 884, "angle.object_marker": 113 },
  ">": { "angle.hebrew_words": 4946, "angle.hebrew_letters": 884, "angle.object_marker": 113, "angle.close_opened_nowhere": 4 },
  "-": { "hyphen.compound": 508, "hyphen.word_continues_after": 303, "hyphen.word_continued_from_before": 70, "hyphen.supplied_suffix": 15, "hyphen.maqaf_segment": 10 },
  "!": { "bang.mark_only_segment": 478, "bang.exclamation": 82 },
  "?": { "question.end_of_rendering": 462, "question.before_construct_of": 6, "question.supplied": 2, "question.mark_only_segment": 1 },
  "¿": { "inverted.interrogative_segment": 405 },
  ".": { "period.abbreviation": 113 },
  "'": { "apostrophe.possessive": 38 },
  ":": { "colon.route_final": 8 },
  ";": { "semicolon.clause_end_before_supplied": 1 },
};
const CLAIM_OCC = { "/": 64013, "[": 22719, "]": 22717, "<": 5943, ">": 5947, "-": 906, "!": 560, "?": 471, "¿": 405, ".": 113, "'": 38, ":": 8, ";": 1 };

const occ = {}, routesWith = {}, exactly = {}, anyMatch = {}, none = {}, multi = {}, multiCombos = {}, noneEx = {}, multiEx = {}, shapeEx = {};
const bump = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };
const A_OF = new Map();
for (const r of rows) {
  const R = r.route; const A = analyze(R); const seen = new Set();
  for (let i = 0; i < R.length; i++) {
    const c = R[i]; if (!isMark(c)) continue;
    bump(occ, c); seen.add(c);
    const t = tests(R, i, A); const hit = Object.keys(t).filter((k) => t[k]);
    exactly[c] ||= {}; anyMatch[c] ||= {};
    for (const h of hit) bump(anyMatch[c], h);
    if (hit.length === 1) { bump(exactly[c], hit[0]); (shapeEx[hit[0]] ||= []).length < 4 && shapeEx[hit[0]].push(ex(r)); }
    else if (hit.length === 0) { bump(none, c); (noneEx[c] ||= []).length < 8 && noneEx[c].push(`${ex(r)} @${i}`); }
    else { bump(multi, c); bump(multiCombos, `${c} ${hit.join("+")}`); (multiEx[c] ||= []).length < 8 && multiEx[c].push(`${ex(r)} @${i} ${hit.join("+")}`); }
  }
  for (const c of seen) bump(routesWith, c);
}

// ---- (a)+(b) reconciliation ------------------------------------------------
const recon = {};
for (const [m, shapes] of Object.entries(CLAIM)) {
  const rr = { claimed_occurrences: CLAIM_OCC[m], found_occurrences: occ[m] || 0, routes: routesWith[m] || 0, unexplained: none[m] || 0, in_more_than_one_shape: multi[m] || 0, shapes: {} };
  for (const [s, n] of Object.entries(shapes)) rr.shapes[s] = { claimed: n, exactly_this_shape: (exactly[m] || {})[s] || 0, test_matches_at_all: (anyMatch[m] || {})[s] || 0 };
  recon[m] = rr;
}
const undeclared = Object.keys(occ).filter((m) => !CLAIM[m]);
const inv = JSON.parse(readFileSync(INV, "utf8"));
const invM4 = inv.providers.find((p) => p.provider === "M4");
const invCmp = invM4.marks.map((x) => ({ mark: x.mark, inv_occ: x.occurrences, inv_routes: x.routes_carrying_it, my_occ: occ[x.mark] || 0, my_routes: routesWith[x.mark] || 0 }));

// ---- alternative reading of the hyphen "first character of its segment" test (literal, no trim)
let hyLiteral = 0;
for (const r of rows) { const R = r.route; const A = analyze(R); for (let i = 0; i < R.length; i++) if (R[i] === "-" && A.segs[A.segIdx[i]][0] === i && isL(R[i + 1])) hyLiteral++; }

// ---- structural / evidence claims -----------------------------------------
const VAV = "ו", HE = "ה", NUN = "נ", NUNF = "ן", KAF = /[כך]/u, LAMED = "ל", BET = "ב";
const keys = new Map(); let routeEqDef = 0, commas = 0, parens = 0, semis = 0, slashRoutes = 0, orWord = 0, trailingWs = 0;
const ev = { and_first: [0, 0, {}], the_first: [0, 0, []], your_last: [0, 0], bang_last: [0, 0, []], inv_first: [0, 0], and_inv: [0, 0], obj: [0, 0, 0, []], prep_the: [0, 0], seg_le_letters: [0, 0, []] };
const spacing = { "tight / space": 0, "space / tight": 0, "tight / tight": 0, "space / space": 0 };
const sqClass = { article: 0, be_or_belong: 0, other: 0, pairs: 0 };
const BE = /^(be|is|am|are|was|were|been|being|will be|belong|belongs|belonged|belonging)$/u;
let onlyBracket = 0; const onlyBracketEx = []; let surely = 0, surelyFollowed = 0; let spanJoined = 0, spanDropped = 0;
for (const r of rows) {
  const R = r.route; const k = r.key; const letters = [...k].filter((c) => /\p{L}/u.test(c));
  keys.set(k, (keys.get(k) || 0) + 1);
  if (R === r.def) routeEqDef++;
  if (R !== R.trim()) trailingWs++;
  if (R.includes(",")) commas++; if (/[()]/u.test(R)) parens++; if (R.includes(";")) semis++;
  if (/\bor\b/u.test(R)) orWord++;
  const A = analyze(R);
  for (let i = 0; i < R.length; i++) if (R[i] === "/") {
    const a = /\s/u.test(R[i - 1] || "") ? "space" : "tight", b = /\s/u.test(R[i + 1] || "") ? "space" : "tight";
    if (R[i - 1] !== "/" && R[i + 1] !== "/") bump(spacing, `${a} / ${b}`); else bump(spacing, "adjacent_slash");
  }
  for (const [a, z] of Object.entries(A.sq.closeOf)) {
    const content = R.slice(+a + 1, z); sqClass.pairs++;
    if (content === "the") sqClass.article++; else if (BE.test(content)) sqClass.be_or_belong++; else sqClass.other++;
  }
  if (/^\[[^\]]*\]$/u.test(R)) { onlyBracket++; onlyBracketEx.push(ex(r)); }
  if (R.includes("[surely]")) { surely++; if (/\[surely\]\s*\S/u.test(R)) surelyFollowed++; }
  if (R.includes("/")) {
    slashRoutes++;
    const segs = A.segText.map((x) => x.trim());
    spanJoined++; if (segs.some((x) => x === "")) spanDropped++;
    const first = segs[0], last = segs[segs.length - 1];
    if (first === "and") { ev.and_first[0]++; if (letters[0] === VAV) ev.and_first[1]++; else bump(ev.and_first[2], letters[0]); }
    if (first === "the") { ev.the_first[0]++; if (letters[0] === HE) ev.the_first[1]++; else ev.the_first[2].push(ex(r)); }
    if (last === "your") { ev.your_last[0]++; if (letters.slice(-3).some((c) => KAF.test(c))) ev.your_last[1]++; }
    if (last === "!") { ev.bang_last[0]++; const e = letters[letters.length - 1]; if (e === HE || e === NUN || e === NUNF) ev.bang_last[1]++; else ev.bang_last[2].push(ex(r)); }
    if (first === "¿") { ev.inv_first[0]++; if (letters[0] === HE) ev.inv_first[1]++; }
    if (first === "and" && segs[1] === "¿") { ev.and_inv[0]++; if (letters[0] === VAV && letters[1] === HE) ev.and_inv[1]++; }
    if (/^(in|like|to|for|at) <the>$/u.test(first)) { ev.prep_the[0]++; if ([BET, "כ", LAMED].includes(letters[0])) ev.prep_the[1]++; }
    ev.seg_le_letters[0]++; if (segs.length <= letters.length) ev.seg_le_letters[1]++; else ev.seg_le_letters[2].push(ex(r));
  }
  if (R.includes("<obj.>")) { ev.obj[0]++; const kk = letters.join(""); const et = /את|ות/u.test(kk), yat = /^ו?ית/u.test(kk) || kk.includes("ית"), lam = /^ו?ל/u.test(kk); if (et) ev.obj[1]++; if (et || yat || lam) ev.obj[2]++; else ev.obj[3].push(ex(r)); }
}
let maxKey = 0; for (const v of keys.values()) maxKey = Math.max(maxKey, v);

// ---- (c) falsification probes -----------------------------------------------
const probe = {};
const P = (name, fn) => { const hits = []; for (const r of rows) { const h = fn(r.route, r); if (h) hits.push(`${ex(r)}${h === true ? "" : " :: " + h}`); } probe[name] = { count: hits.length, examples: hits.slice(0, 8) }; };
// slash: is '/' ever an English alternation?
P("slash: tight x/y between two letters (alternation shape like he/she)", (R) => /\p{L}\/\p{L}/u.test(R));
P("slash: pronoun/pronoun or and/or alternation pairs", (R) => /\b(he|she|him|her|his|hers|they|them|and|or)\s*\/\s*(he|she|him|her|his|hers|they|them|and|or)\b/iu.test(R) ? R.match(/\b(he|she|him|her|his|hers|they|them|and|or)\s*\/\s*(he|she|him|her|his|hers|they|them|and|or)\b/iu)[0] : false);
P("slash: two adjacent segments identical (a doubled rendering)", (R) => { const s = R.split("/").map((x) => x.trim()); for (let i = 1; i < s.length; i++) if (s[i] && s[i] === s[i - 1]) return `'${s[i]}'`; return false; });
P("slash: more segments than key letters", (R, r) => R.includes("/") && R.split("/").length > [...r.key].filter((c) => /\p{L}/u.test(c)).length);
P("slash: first segment 'and' on a key not starting with vav", (R, r) => R.split("/")[0].trim() === "and" && R.includes("/") && [...r.key][0] !== "ו" ? [...r.key][0] : false);
// square brackets: supplied words that are really in the Hebrew, or brackets used as alternatives
P("square: content opens with 'or ' (an alternative, not a supplied word)", (R) => /\[or\b/u.test(R));
P("square: bracketed word duplicated unbracketed in an adjacent segment", (R) => { const m = [...R.matchAll(/\[([^\]]+)\]/gu)]; const plain = R.replace(/\[[^\]]*\]/gu, " "); for (const x of m) if (new RegExp(`(^|[\\s/])${x[1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[\\s/])`, "u").test(plain)) return x[0]; return false; });
P("square.supplied_letters: content is a whole word with a space (not letters completing a word)", (R) => { for (const m of R.matchAll(/(\p{L})\[([^\]]*)\]/gu)) if (/\s/u.test(m[2]) || /^(the|is|are|was|were|a|an|of|to)$/u.test(m[2])) return m[0]; return false; });
P("square: '[the]' on a key that opens with he (article the Hebrew carries)", (R, r) => /^\[the\]/u.test(R) && [...r.key][0] === "ה");
// angles
P("angle.hebrew_letters: content other than a plural ending (s, es, en, ren)", (R) => { for (const m of R.matchAll(/(\p{L})<([^>]*)>/gu)) if (!/^(s|es|en|ren|ies)$/u.test(m[2])) return m[0]; return false; });
P("angle.object_marker: '<obj.>' on a key with no et/ot, yat or lamed", (R, r) => R.includes("<obj.>") && !(/את|ות|ית/u.test(r.key) || /^ו?ל/u.test(r.key)));
// hyphen
P("hyphen with a space on each side (dash between clauses or renderings)", (R) => / - /u.test(R));
P("hyphen.word_continues_after: a whole word before the hyphen (e.g. 'Pedah-' a name, not a cut word)", (R) => { const m = /(\p{L}+)-(\/|$)/u.exec(R); return m ? m[0] : false; });
// bang / question / inverted / colon / apostrophe
P("bang: '!' followed by more English in the same segment", (R) => /!\s*\p{L}/u.test(R.split("/").join("|").replace(/\|/gu, "/")) ? (R.match(/![^/]*\p{L}/u) || [false])[0] : false);
P("question: '?' followed by more English in the same segment, other than ' of'", (R) => { const m = /\?([^/\]]*)/u.exec(R); return m && /\p{L}/u.test(m[1]) && m[1].trim() !== "of" ? m[0] : false; });
P("inverted: '¿' on a key not opening with he or vav-he", (R, r) => { if (!R.includes("¿")) return false; const k = [...r.key]; return !(k[0] === "ה" || (k[0] === "ו" && k[1] === "ה")) ? r.key : false; });
P("inverted: '¿' not as the first or second segment", (R) => { const s = R.split("/").map((x) => x.trim()); const i = s.indexOf("¿"); return R.includes("¿") && i > 1 ? `seg ${i}` : false; });
P("apostrophe: contraction or quotation, not a possessive", (R) => { const m = /\p{L}'(t|ll|re|ve|d|m)\b|(^|\s)'|'\s*\p{L}*'/u.exec(R); return m ? m[0] : false; });
P("apostrophe: between letters but the following letter is not s (not a possessive 's)", (R) => { const m = /\p{L}'([^s]|s\p{L})/u.exec(R); return m ? m[0] : false; });
P("colon: ':' followed by text", (R) => /:\s*\S/u.test(R));
P("semicolon: any ';'", (R) => R.includes(";"));

// list every apostrophe window, all are few
const apostrophes = rows.filter((r) => r.route.includes("'")).map((r) => ex(r));

// ---- (d) v3 comparison ------------------------------------------------------
const { senseSplit } = await import(SENSE);
// gloss-store-v1.mjs's packSplit lives inside openRouteStore; take its source text from the file
// and evaluate only that function (no store opened).
const gs = readFileSync(GLOSS, "utf8");
const a0 = gs.indexOf("const packSplit = (text) => {");
const a1 = gs.indexOf("};", gs.indexOf("return out.map", a0)) + 2;
const packSplit = new Function(`${gs.slice(a0, a1)}; return packSplit;`)();
const v3 = (R) => { const out = []; let withheld = false; for (const sense of packSplit(R)) { const s = senseSplit(sense); if (s.damaged) { withheld = true; continue; } out.push(...s.readings); } return { out, withheld }; };
const cmp = { fields_compared: 0, same_division: 0, v3_divides_where_declaration_keeps_whole: 0, declaration_divides_where_v3_keeps_whole: 0, divided_differently: 0, v3_withholds_where_declaration_prints: 0, senseSplit_alone_divides: 0, senseSplit_alone_damaged: 0, packSplit_divides: 0, examples: [] };
const { readingOf, DECLARATIONS } = await import(MACHINE);
let machToday = { equal_whole: 0, differ: 0 };
for (const r of rows) {
  const R = r.route; cmp.fields_compared++;
  const decl = [R];                         // separates_on null: one reading, whole
  const v = v3(R);
  const ss = senseSplit(R); if (ss.readings.length > 1) cmp.senseSplit_alone_divides++; if (ss.damaged) cmp.senseSplit_alone_damaged++;
  if (packSplit(R).length > 1) cmp.packSplit_divides++;
  if (v.withheld && v.out.length === 0) cmp.v3_withholds_where_declaration_prints++;
  const same = v.out.length === decl.length && v.out.every((x, i) => x === decl[i].trim());
  if (same) cmp.same_division++;
  else if (v.out.length > 1) { cmp.v3_divides_where_declaration_keeps_whole++; cmp.examples.push({ key: r.key, route: W(R), v3: v.out }); }
  else cmp.divided_differently++;
  const m = readingOf(R, r.def, SRC); if (m.readings.length === 1 && m.readings[0] === R) machToday.equal_whole++; else machToday.differ++;
}
const wasDeclared = !!DECLARATIONS.providers[SRC];
const draft = JSON.parse(readFileSync(DRAFT, "utf8")).providers[SRC];
DECLARATIONS.providers[SRC] = draft;                      // in memory only
const machDraft = { rows: 0, whole: 0, separated: 0, refused: 0, rows_with_an_undeclared_mark: 0 };
for (const r of rows) { const m = readingOf(r.route, r.def, SRC); machDraft.rows++; if (m.region === "whole") machDraft.whole++; else machDraft.separated++; if (m.refused) machDraft.refused++; if (m.unknownMarks.length) machDraft.rows_with_an_undeclared_mark++; }
delete DECLARATIONS.providers[SRC];
const draftMarkKeys = Object.keys(draft.marks);
const draftDividing = Object.entries(draft.marks).filter(([, v]) => v.divides_readings).map(([k]) => k);

const out = {
  rows: rows.length,
  occurrences_total: Object.values(occ).reduce((a, b) => a + b, 0),
  marks_found: Object.keys(occ).length,
  marks_found_not_in_draft: undeclared,
  draft_declaration_mark_keys: draftMarkKeys,
  draft_dividing_marks: draftDividing, draft_separates_on: draft.separates_on, draft_precedence: draft.precedence,
  inventory_vs_mine: invCmp,
  reconciliation: recon,
  unexplained_examples: noneEx, multi_shape_examples: multiEx, multi_shape_combos: multiCombos,
  hyphen_word_continued_from_before_literal_first_char: hyLiteral,
  shape_examples: shapeEx,
  structure: { route_equals_definition: routeEqDef, distinct_keys: keys.size, most_routes_on_one_key: maxKey, routes_with_comma: commas, routes_with_parenthesis: parens, routes_with_semicolon: semis, routes_with_word_or: orWord, routes_with_slash: slashRoutes, routes_with_leading_or_trailing_whitespace: trailingWs, routes_only_a_supplied_bracket: onlyBracket, only_bracket_examples: onlyBracketEx, surely_routes: surely, surely_followed_by_rendering: surelyFollowed },
  slash_spacing: spacing,
  square_content_classes: sqClass,
  evidence: {
    and_first: { routes: ev.and_first[0], vav: ev.and_first[1], other_first_letters: ev.and_first[2] },
    the_first: { routes: ev.the_first[0], he: ev.the_first[1], fails: ev.the_first[2] },
    your_last: { routes: ev.your_last[0], kaf_in_last3: ev.your_last[1] },
    bang_last: { routes: ev.bang_last[0], he_or_nun_final: ev.bang_last[1], fails: ev.bang_last[2] },
    inverted_first: { routes: ev.inv_first[0], he: ev.inv_first[1] }, and_inverted: { routes: ev.and_inv[0], vav_he: ev.and_inv[1] },
    obj: { routes: ev.obj[0], et_ot: ev.obj[1], et_ot_yat_or_lamed: ev.obj[2], fails: ev.obj[3] },
    prep_the_first: { routes: ev.prep_the[0], bet_kaf_lamed: ev.prep_the[1] },
    segments_le_key_letters: { routes: ev.seg_le_letters[0], holds: ev.seg_le_letters[1], fails: ev.seg_le_letters[2].slice(0, 8) },
  },
  page_print_spanJoin: { routes_joined: spanJoined, routes_dropping_an_empty_segment: spanDropped },
  falsification_probes: probe,
  apostrophes,
  v3_comparison: cmp,
  machine_today: { provider_declared_in_file: wasDeclared, ...machToday },
  machine_with_draft_in_memory: machDraft,
};
writeFileSync(join(HERE, "verify.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
