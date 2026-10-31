#!/usr/bin/env node
// check-provider-declaration v1.1 (goes with ask v1.1) · provider-declaration-rule-v2-every-mark-every-container-every-occurrence
//
// v1.1, from the Sonnet rehearsal of 31 October 2026: the pipe mark is counted
// (v1 split its keys on "|"); K7 holds every text whose brackets do not
// balance, stray closers included; K10 recounts a branch's occurrences from
// its shapes; K12 holds the owner's named cases; K13 the new shape fields;
// review.json gives each dividing sample its route's pieces.
//
// Holds ONE dictionary's declaration and its classifier to that dictionary's
// own text. A declaration says, for every mark the dictionary uses and every
// container the mark can sit in (top level, inside ( ), [ ], < >, { }), which
// SHAPES it takes, what each shape means, and whether it divides readings.
// The classifier is the declaration made runnable: a pure function that names
// the shape of every mark occurrence. This check never decides what a mark
// means; it proves the declaration is complete, exact and countable, and it
// writes the samples a person reads to judge the meanings.
//
// Usage:
//   node check-provider-declaration-v1.mjs \
//     --declaration <source_key>.declaration.json \
//     --classifier  <source_key>.classifier.mjs \
//     --routes      <source_key>.jsonl          (one JSON per line: {key, route, m, ...})
//     [--out <dir>]                             (review samples and counts are written here)
//     [--v3 <path to sense-split-v1.mjs>]       (optional: compare with today's global rule)
//
//   K1  the declaration is well formed: schema, source key, unique shape ids,
//       every shape names its mark, container, divides, means, test, count
//   K2  closed set: every mark the routes use has at least one shape; no shape
//       names a mark or a container the routes never use
//   K3  completeness: the classifier names exactly one shape for every mark
//       occurrence, at the right position, with that shape's own mark
//   K4  the container is true: the shape's container is the one the checker
//       finds by its own bracket stack ("any" allowed only for shapes that do
//       not divide)
//   K5  the counts reproduce: each shape's count equals the occurrences the
//       classifier gave it, and the total equals the marks in the routes
//   K6  dividing is never the default: every dividing shape names a container
//       other than "any", a falsifier, and at least three examples that exist
//   K7  separation, never derivation: cutting every route at its dividing
//       occurrences leaves no empty piece and no piece that is only marks, the
//       pieces rejoin to the route byte for byte, and nothing divides inside
//       an opener that never closes
//   K8  precedence lists exactly the dividing shapes, each once
//   K9  homonyms are declared: entry_identity names how the dictionary tells
//       two entries under one letters key apart, or says "none" with a reason;
//       keys_with_more_than_one_route_text is recounted from the routes
//   K10 branches are well formed: each has a question, two or more options,
//       a resting option among them, and counts that sum to its occurrences
//   K11 every shape is read, not stubbed: its meaning and its test are each at
//       least four words, no two shapes share a meaning word for word, and a
//       mark-container pair with 50 or more occurrences names what the mark
//       does there (a shape whose meaning is only "not read", "other" or
//       "misc" fails)
//   K12 the owner's named cases: named_cases has all eleven keys; each is the
//       ids of shapes that exist and carry the case's marks, or "absent" for
//       a case with no occurrence in the routes
//   K13 the v1.1 fields: definitions is an object; every shape has read, a
//       count of occurrences read, at least min(30, count) and at most count;
//       every dividing shape has lead_words (a list); every id begins with
//       the mark's fixed name, or a snake_case name for a mark off the table
//   (informative) the division compared with today's global rule, if --v3
//
// A mark is any character that is not a letter, a digit or whitespace — the
// mark inventory's own definition (mark-inventory-rule-v1). Exit 0 all green,
// 1 any red, 2 bad usage.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";

const arg = (k, d = null) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const DECL = arg("declaration"), CLS = arg("classifier"), ROUTES = arg("routes"), OUT = arg("out"), V3 = arg("v3");
if (!DECL || !CLS || !ROUTES) { console.error("usage: --declaration <json> --classifier <mjs> --routes <jsonl> [--out dir] [--v3 sense-split-v1.mjs]"); process.exit(2); }

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const isMark = (c) => !/[\p{L}\p{N}\s]/u.test(c);
const OPEN = { "(": ")", "[": "]", "<": ">", "{": "}" };
const CLOSE = { ")": "(", "]": "[", ">": "<", "}": "{" };
const CONTAINER = { "(": "paren", "[": "bracket", "<": "angle", "{": "brace" };
const CONTAINERS = new Set(["top", "paren", "bracket", "angle", "brace", "any"]);
// the checker's own reading of where each mark sits: the innermost open
// bracket before it (a bracket character itself sits in what encloses it);
// and from an opener that never closes onward, the route is "unclosed"
// rule 3's own helper, the ask's text: a closer that never opens or an
// opener that never closes makes the whole text unbalanced
const unbalanced = (text) => {
  const st = [];
  for (const ch of text) {
    if (OPEN[ch]) st.push(ch);
    else if (CLOSE[ch]) { if (st.length && st[st.length - 1] === CLOSE[ch]) st.pop(); else return true; }
  }
  return st.length > 0;
};
const marksOf = (text) => {
  const out = [], stack = [];
  const chars = [...text];
  let i16 = 0;
  const pos = [];
  for (const ch of chars) { pos.push(i16); i16 += ch.length; }
  // first pass: find openers that never close
  const st = [], neverClosed = new Set();
  chars.forEach((ch, k) => {
    if (OPEN[ch]) st.push(k);
    else if (CLOSE[ch]) { const top = st.length ? st[st.length - 1] : -1; if (top >= 0 && chars[top] === CLOSE[ch]) st.pop(); }
  });
  for (const k of st) neverClosed.add(k);
  const firstUnclosed = st.length ? Math.min(...st) : Infinity;
  chars.forEach((ch, k) => {
    if (CLOSE[ch] && stack.length && chars[stack[stack.length - 1]] === CLOSE[ch]) stack.pop();
    if (isMark(ch)) out.push({ i: pos[k], mark: ch, container: stack.length ? CONTAINER[chars[stack[stack.length - 1]]] : "top", unclosed: k >= firstUnclosed });
    if (OPEN[ch] && !neverClosed.has(k)) stack.push(k);
  });
  return out;
};

// ---- K1 ---------------------------------------------------------------
let decl;
try { decl = JSON.parse(readFileSync(DECL, "utf8")); } catch (e) { check("K1  the declaration reads as JSON", false, e.message); process.exit(1); }
const shapes = Array.isArray(decl.shapes) ? decl.shapes : [];
const byId = new Map(shapes.map((s) => [s.id, s]));
const k1 = [];
if (decl.schema !== "mishkan.provider_declaration.v2") k1.push(`schema ${decl.schema}`);
if (!decl.source_key) k1.push("no source_key");
if (byId.size !== shapes.length) k1.push("shape ids not unique");
for (const s of shapes) {
  for (const f of ["id", "mark", "container", "divides", "means", "test", "count"]) if (s[f] === undefined || s[f] === "") k1.push(`${s.id || "?"} lacks ${f}`);
  if (s.container && !CONTAINERS.has(s.container)) k1.push(`${s.id} container ${s.container}`);
  if (typeof s.divides !== "boolean") k1.push(`${s.id} divides is not true/false`);
  if (typeof s.mark === "string" && [...s.mark].length !== 1) k1.push(`${s.id} mark is not one character`);
}
check("K1  the declaration is well formed", shapes.length > 0 && !k1.length, k1.slice(0, 6).join("; ") || `${shapes.length} shapes`);

// ---- read the routes and classify -------------------------------------------
const { classify } = await import(pathToFileURL(resolve(CLS)).href);
if (typeof classify !== "function") { check("K3  the classifier exports classify(text)", false); process.exit(1); }
const routes = readFileSync(ROUTES, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const used = new Map(); // mark|container -> n
const given = new Map(); // shape id -> n
const k3 = [], k4 = [], k7 = [];
const samples = new Map(); // shape id -> [{key, at}]
const piecesOf = new Map(); // route text -> its pieces, where it divides
let total = 0, divided = 0;
const divisions = [];
for (const r of routes) {
  const text = String(r.route ?? "");
  const truth = marksOf(text);
  total += truth.length;
  for (const t of truth) used.set(`${t.mark}\u0000${t.container}`, (used.get(`${t.mark}\u0000${t.container}`) || 0) + 1);
  let got;
  try { got = classify(text); } catch (e) { k3.push(`${r.key}: classify threw ${e.message}`); continue; }
  if (!Array.isArray(got)) { k3.push(`${r.key}: classify did not return an array`); continue; }
  const at = new Map(got.map((g) => [g.i, g]));
  if (at.size !== got.length) k3.push(`${r.key}: two shapes at one position`);
  if (got.length !== truth.length) k3.push(`${r.key}: ${got.length} shapes for ${truth.length} marks`);
  const cuts = [];
  const textUnbalanced = unbalanced(text);
  for (const t of truth) {
    const g = at.get(t.i);
    if (!g) { k3.push(`${r.key}@${t.i} "${t.mark}" has no shape`); continue; }
    const s = byId.get(g.shape);
    if (!s) { k3.push(`${r.key}@${t.i} names an undeclared shape ${g.shape}`); continue; }
    if (s.mark !== t.mark) k3.push(`${r.key}@${t.i} "${t.mark}" given ${s.id} (mark "${s.mark}")`);
    if (s.container !== "any" && s.container !== t.container) k4.push(`${r.key}@${t.i} ${s.id} says ${s.container}, the stack says ${t.container}`);
    if (s.container === "any" && s.divides) k4.push(`${s.id} divides with container "any"`);
    if (s.container === "any" && [",", ";", "/", "\\"].includes(s.mark) && !/\.in_unbalanced_text$/u.test(s.id)) k4.push(`${s.id}: a comma, semicolon or slash shape takes container any only as <mark>.in_unbalanced_text`);
    given.set(s.id, (given.get(s.id) || 0) + 1);
    const list = samples.get(s.id) || []; if (list.length < 400) list.push({ key: r.key, m: r.m, at: t.i, window: text.slice(Math.max(0, t.i - 30), t.i + 30), text }); samples.set(s.id, list);
    if (s.divides) { if (textUnbalanced) k7.push(`${r.key}@${t.i} ${s.id} divides in a text whose brackets do not balance`); cuts.push(t.i); }
  }
  if (cuts.length) {
    divided += 1;
    const pieces = []; let from = 0;
    for (const c of cuts.sort((a, b) => a - b)) { pieces.push(text.slice(from, c)); from = c + 1; }
    pieces.push(text.slice(from));
    if (pieces.some((p) => !p.trim())) k7.push(`${r.key}: an empty piece`);
    if (pieces.some((p) => p.trim() && [...p.trim()].every(isMark))) k7.push(`${r.key}: a piece of marks only`);
    let rejoined = pieces[0]; cuts.forEach((c, n) => { rejoined += text[c] + pieces[n + 1]; });
    if (rejoined !== text) k7.push(`${r.key}: the pieces do not rejoin`);
    if (divisions.length < 200000) divisions.push({ key: r.key, pieces: pieces.map((p) => p.trim()) });
    piecesOf.set(text, pieces.map((p) => p.trim()));
  }
}
// ---- K2 ---------------------------------------------------------------------
const declaredPairs = new Set(shapes.map((s) => `${s.mark}\u0000${s.container}`));
const usedMarks = new Set([...used.keys()].map((k) => k.slice(0, k.lastIndexOf("\u0000"))));
const k2 = [];
for (const m of usedMarks) if (!shapes.some((s) => s.mark === m)) k2.push(`"${m}" has no shape`);
for (const s of shapes) {
  if (!usedMarks.has(s.mark)) k2.push(`${s.id}: "${s.mark}" is never used`);
  else if (s.container !== "any" && !used.has(`${s.mark}\u0000${s.container}`)) k2.push(`${s.id}: "${s.mark}" never sits in ${s.container}`);
}
check("K2  closed set: every mark used has a shape, no shape for a mark or container never used", !k2.length, k2.slice(0, 6).join("; ") || `${usedMarks.size} marks · ${used.size} mark-container pairs used · ${declaredPairs.size} declared`);
check("K3  completeness: exactly one declared shape for every mark occurrence", !k3.length, k3.length ? `${k3.length} problems: ${k3.slice(0, 4).join("; ")}` : `${total.toLocaleString()} occurrences in ${routes.length.toLocaleString()} routes`);
check("K4  every shape's container is the one the bracket stack finds", !k4.length, k4.length ? `${k4.length}: ${k4.slice(0, 4).join("; ")}` : "");
// ---- K5 ---------------------------------------------------------------------
const k5 = [];
for (const s of shapes) if ((given.get(s.id) || 0) !== s.count) k5.push(`${s.id} declares ${s.count}, given ${given.get(s.id) || 0}`);
for (const s of shapes) if (s.count === 0) k5.push(`${s.id} has a count of 0 (no zero-count shapes)`);
const declaredTotal = shapes.reduce((a, s) => a + (Number(s.count) || 0), 0);
if (declaredTotal !== total) k5.push(`declared total ${declaredTotal}, marks in the routes ${total}`);
check("K5  every count reproduces", !k5.length, k5.slice(0, 6).join("; ") || `${shapes.length} shapes sum to ${total.toLocaleString()}`);
// ---- K6 ---------------------------------------------------------------------
const k6 = [];
const keys = new Set(routes.map((r) => r.key));
for (const s of shapes.filter((x) => x.divides)) {
  if (s.container === "any") k6.push(`${s.id} divides with container any`);
  if (!s.falsifier) k6.push(`${s.id} has no falsifier`);
  const ex = Array.isArray(s.examples) ? s.examples : [];
  if (ex.length < 3) k6.push(`${s.id} has ${ex.length} examples`);
  for (const e of ex) if (!keys.has(e.key)) k6.push(`${s.id} example key ${e.key} is not in the routes`);
}
check("K6  dividing is never the default: a container, a falsifier, three examples that exist", !k6.length, k6.slice(0, 6).join("; ") || `${shapes.filter((x) => x.divides).length} dividing shapes`);
check("K7  separation, never derivation: no empty piece, no piece of marks only, pieces rejoin, nothing divides in a text whose brackets do not balance", !k7.length, k7.length ? `${k7.length}: ${k7.slice(0, 4).join("; ")}` : `${divided.toLocaleString()} routes divided`);
// ---- K8 ---------------------------------------------------------------------
const dividing = shapes.filter((s) => s.divides).map((s) => s.id).sort();
const prec = Array.isArray(decl.precedence) ? [...decl.precedence] : [];
check("K8  precedence lists exactly the dividing shapes, each once", JSON.stringify([...prec].sort()) === JSON.stringify(dividing) && new Set(prec).size === prec.length, `precedence ${prec.length} · dividing ${dividing.length}`);
// ---- K9 ---------------------------------------------------------------------
const h = decl.homonyms || {};
const textsByKey = new Map();
for (const r of routes) { const set = textsByKey.get(r.key) || new Set(); set.add(String(r.route ?? "")); textsByKey.set(r.key, set); }
const multiKeys = [...textsByKey.values()].filter((x) => x.size > 1).length;
check("K9  homonyms declared: how two entries under one letters key are told apart (or none, with a reason), and the count of keys carrying more than one text reproduces",
  !!(h.entry_identity && (h.entry_identity !== "none" || h.reason)) && h.keys_with_more_than_one_route_text === multiKeys,
  `${h.entry_identity || "no homonyms section"} · declared ${h.keys_with_more_than_one_route_text ?? "nothing"}, counted ${multiKeys} of ${textsByKey.size} keys`);
// ---- K10 --------------------------------------------------------------------
const k10 = [];
for (const b of decl.branches || []) {
  const opts = Array.isArray(b.options) ? b.options : [];
  if (!b.question) k10.push(`${b.id} has no question`);
  if (opts.length < 2) k10.push(`${b.id} has ${opts.length} options`);
  if (!opts.some((o) => (o.id || o) === b.resting)) k10.push(`${b.id} resting option is not among its options`);
  const bs = Array.isArray(b.shapes) ? b.shapes : [];
  if (!bs.length) k10.push(`${b.id} names no shapes`);
  for (const id of bs) { if (!byId.has(id)) k10.push(`${b.id} names an undeclared shape ${id}`); else if (byId.get(id).divides) k10.push(`${b.id}: ${id} divides, but a branch rests on the option that does not`); }
  const sum = bs.reduce((a, id) => a + (given.get(id) || 0), 0);
  if (b.occurrences !== sum) k10.push(`${b.id} declares ${b.occurrences} occurrences, its shapes hold ${sum}`);
  if (opts.some((o) => o && typeof o === "object" && "count" in o)) k10.push(`${b.id}: an option carries a count of its own`);
}
check("K10 branches are well formed: a question, two or more options without counts, the resting one among them, whole shapes that do not divide, occurrences recounted", !k10.length, k10.slice(0, 4).join("; ") || `${(decl.branches || []).length} branches`);
// ---- K11 --------------------------------------------------------------------
const k11 = [];
const words = (t) => String(t || "").trim().split(/\s+/u).filter(Boolean).length;
const seenMeans = new Map();
for (const s of shapes) {
  if (words(s.means) < 4) k11.push(`${s.id} meaning under four words`);
  if (words(s.test) < 4) k11.push(`${s.id} test under four words`);
  const m = String(s.means || "").trim().toLowerCase();
  if (seenMeans.has(m)) k11.push(`${s.id} shares its meaning with ${seenMeans.get(m)}`); else seenMeans.set(m, s.id);
  if ((given.get(s.id) || 0) >= 50 && /^(not read|other|misc|unknown|self-test|todo)\b/iu.test(String(s.means || "").trim())) k11.push(`${s.id} (${given.get(s.id)}) is a stub`);
}
check("K11 every shape is read, not stubbed: a meaning and a test of four words or more, no two meanings alike", !k11.length, k11.length ? `${k11.length}: ${k11.slice(0, 4).join("; ")}` : "");
// ---- K12 ------------------------------------------------------------------------
const CASES = {
  comma_top: { marks: [","], in: ["top"] }, comma_in_paren: { marks: [","], in: ["paren"] }, comma_in_brackets: { marks: [","], in: ["bracket", "angle", "brace"] },
  semicolon_top: { marks: [";"], in: ["top"] }, semicolon_in_paren: { marks: [";"], in: ["paren"] }, semicolon_in_brackets: { marks: [";"], in: ["bracket", "angle", "brace"] },
  slash_top: { marks: ["/", "\\"], in: ["top"] }, slash_in_paren: { marks: ["/", "\\"], in: ["paren"] }, slash_in_brackets: { marks: ["/", "\\"], in: ["bracket", "angle", "brace"] },
  parentheses: { marks: ["(", ")"], in: null }, brackets: { marks: ["[", "]", "<", ">", "{", "}"], in: null },
};
const k12 = [];
const nc = decl.named_cases || {};
for (const [name, c] of Object.entries(CASES)) {
  const v = nc[name];
  const occ = [...used.entries()].filter(([k]) => { const m = k.slice(0, k.lastIndexOf("\u0000")), w = k.slice(k.lastIndexOf("\u0000") + 1); return c.marks.includes(m) && (!c.in || c.in.includes(w)); }).reduce((a, [, n]) => a + n, 0);
  if (v === undefined) k12.push(`${name} missing`);
  else if (v === "absent") { if (occ) k12.push(`${name} says absent, the routes hold ${occ}`); }
  else if (!Array.isArray(v) || !v.length) k12.push(`${name} is neither a list of shape ids nor "absent"`);
  else { for (const id of v) { const s = byId.get(id); if (!s) k12.push(`${name} names an undeclared shape ${id}`); else if (!c.marks.includes(s.mark)) k12.push(`${name} names ${id}, whose mark is not the case's`); } if (!occ) k12.push(`${name} lists shapes but the routes hold none of the case`); }
}
for (const k of Object.keys(nc)) if (!CASES[k]) k12.push(`unknown case ${k}`);
check("K12 the owner's named cases: all eleven, each covered by its shapes or absent with no occurrence", !k12.length, k12.slice(0, 5).join("; ") || "11 cases");
// ---- K13 ------------------------------------------------------------------------
const NAMES = { ",": "comma", ";": "semicolon", ":": "colon", ".": "period", "-": "hyphen", "\u05be": "maqaf", "/": "slash", "\\": "backslash", "|": "pipe", "\u05f4": "gershayim", "(": "open_paren", ")": "close_paren", "[": "open_bracket", "]": "close_bracket", "<": "open_angle", ">": "close_angle", "{": "open_brace", "}": "close_brace", "*": "asterisk", "'": "apostrophe", "\"": "quote", "?": "question_mark", "\u00bf": "question_inverted", "!": "exclamation", "\u00d7": "times", "+": "plus", "=": "equals", "\u05f3": "geresh" };
const k13 = [];
if (!decl.definitions || typeof decl.definitions !== "object" || Array.isArray(decl.definitions)) k13.push("definitions is not an object");
for (const s of shapes) {
  const prefix = String(s.id || "").split(".")[0];
  if (NAMES[s.mark] ? prefix !== NAMES[s.mark] : !/^[a-z][a-z0-9_]*$/u.test(prefix)) k13.push(`${s.id}: the id should begin ${NAMES[s.mark] || "with the mark's Unicode name in snake_case"}`);
  if (typeof s.read !== "number" || s.read < Math.min(30, s.count || 0) || s.read > (s.count || 0)) k13.push(`${s.id}: read ${s.read ?? "missing"} (at least ${Math.min(30, s.count || 0)}, at most ${s.count})`);
  if (s.divides && !Array.isArray(s.lead_words)) k13.push(`${s.id}: a dividing shape without lead_words`);
}
check("K13 the v1.1 fields: definitions, read, lead_words, and ids that begin with the mark's name", !k13.length, k13.length ? `${k13.length}: ${k13.slice(0, 4).join("; ")}` : "");
// ---- informative: today's global rule ----------------------------------------
if (V3) {
  const v3 = await import(pathToFileURL(resolve(V3)).href);
  const declared = new Map(divisions.map((d) => [d.key, d]));
  let same = 0, v3Only = 0, declOnly = 0, differ = 0;
  for (const r of routes) {
    const text = String(r.route ?? "");
    const a = v3.senseSplit(text).readings.map((x) => x.trim()).filter(Boolean);
    const truthCuts = (classify(text) || []).filter((g) => (byId.get(g.shape) || {}).divides).length;
    let b = [text.trim()];
    if (truthCuts) { const pieces = []; let from = 0; for (const g of classify(text).filter((g) => (byId.get(g.shape) || {}).divides).sort((x, y) => x.i - y.i)) { pieces.push(text.slice(from, g.i)); from = g.i + 1; } pieces.push(text.slice(from)); b = pieces.map((p) => p.trim()).filter(Boolean); }
    if (JSON.stringify(a) === JSON.stringify(b)) same += 1; else if (a.length > 1 && b.length === 1) v3Only += 1; else if (a.length === 1 && b.length > 1) declOnly += 1; else differ += 1;
  }
  console.log(`  --  (informative) against today's global rule: same ${same.toLocaleString()} · it divides where this keeps whole ${v3Only.toLocaleString()} · this divides where it keeps whole ${declOnly.toLocaleString()} · divided differently ${differ.toLocaleString()}`);
}
// ---- review samples ------------------------------------------------------------
if (OUT) {
  mkdirSync(OUT, { recursive: true });
  const pick = (list, n) => { const out = []; const step = Math.max(1, Math.floor(list.length / n)); for (let k = 0; k < list.length && out.length < n; k += step) out.push(list[k]); return out; };
  const review = shapes.map((s) => ({ id: s.id, mark: s.mark, container: s.container, divides: s.divides, means: s.means, count: given.get(s.id) || 0,
    read_these: pick(samples.get(s.id) || [], s.divides ? 5 : 3).map(({ text, ...x }) => (s.divides ? { ...x, pieces: piecesOf.get(text) || [text.trim()] } : x)) }));
  writeFileSync(join(OUT, `${decl.source_key || "provider"}.review.json`), JSON.stringify({ rule: "provider-declaration-rule-v2-every-mark-every-container-every-occurrence", source_key: decl.source_key, routes: routes.length, occurrences: total, red: bad, review }, null, 1));
  console.log(`  --  review samples written: ${join(OUT, `${decl.source_key || "provider"}.review.json`)} (5 per dividing shape, 3 per other, read by a person)`);
}
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
