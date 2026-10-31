#!/usr/bin/env node
// Pilot ledger · panlex_hebrew_english_meanings_20240301 (M21)
//
// Reads the provider's routes one file, one process. Counts every mark in the
// route text and, separately, in the definition text; checks the counts
// against the 2026-10-31 inventory; puts every occurrence of every mark into
// exactly one shape (a deterministic test over the text around it); applies
// the declaration's division and today's engine (sense-split-rule-v3) to every
// route and compares them. Writes census.json and declaration.json beside
// itself. Every number in both files is computed here.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SCR = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad";
const SRC = "panlex_hebrew_english_meanings_20240301";
const M_IDS = ["M21"];
const FILE = `${SCR}/punct/by-source/${SRC}.jsonl`;
const INV = `${SCR}/punct/mark-inventory-2026-10-31.json`;
const RANKED = `${SCR}/punct/sources-ranked.json`;
const OUT = dirname(fileURLToPath(import.meta.url));
const { senseSplit, RULE_ID: V3_RULE } = await import(`${SCR}/ghp/reader/tools/sense-split-v1.mjs`);

const rows = readFileSync(FILE, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const MARK = /[^\p{L}\p{N}\s]/u;
const LET = /\p{L}/u, UP = /\p{Lu}/u, LO = /\p{Ll}/u, DIG = /\p{N}/u, ALNUM = /[\p{L}\p{N}]/u;
const cp = (c) => "U+" + c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0");
const win = (t, i) => { // at most 60 characters of provider text around position i
  if (t.length <= 60) return t;
  const a = Math.max(0, Math.min(i - 30, t.length - 60));
  return t.slice(a, a + 60);
};

// ---- depth-zero helpers (parentheses are the only bracket this provider uses)
const depthAt = (t, i) => { let d = 0; for (let k = 0; k < i; k++) { if (t[k] === "(") d++; else if (t[k] === ")") d--; } return d; };
const balanced = (t) => { let d = 0; for (const c of t) { if (c === "(") d++; else if (c === ")") { d--; if (d < 0) return false; } } return d === 0; };
const split0 = (t, mark) => { const out = []; let s = 0, d = 0; for (let i = 0; i < t.length; i++) { const c = t[i]; if (c === "(") d++; else if (c === ")") d--; else if (c === mark && d === 0) { out.push(t.slice(s, i)); s = i + 1; } } out.push(t.slice(s)); return out; };
const words = (p) => p.trim().split(/\s+/u).filter(Boolean);
const BARE = /^(and|or|nor|but)$/iu;

// ---- field-level comma shape (a comma's shape is the shape of the field it divides)
const commaField = (t) => {
  const pcs = split0(t, ",").map((p) => p.trim());
  const w = pcs.map(words);
  const multi = pcs.length > 1 && w.some((x) => x.length > 1);
  return {
    pcs, w,
    list: pcs.length > 1 && w.every((x) => x.length === 1) && pcs.at(-1) !== "to" && !pcs.some((p) => BARE.test(p)) && pcs.every((p) => LET.test(p)),
    to: pcs.length > 1 && pcs.at(-1) === "to",
    series: multi && w.some((x) => x.length > 1 && x.some((y) => /^(and|or)$/iu.test(y))),
    name: multi && pcs.every((p) => UP.test(p[0] || "")) && !w.some((x) => x.some((y) => /^(and|or)$/iu.test(y))),
    tail: multi && w.slice(0, -1).every((x) => x.length === 1) && w.at(-1).length > 1
      && !w.some((x) => x.some((y) => /^(and|or)$/iu.test(y))) && !pcs.every((p) => UP.test(p[0] || "")),
  };
};
const slashSides = (t, i) => [t.slice(0, i), t.slice(i + 1)];
const tokenAt = (t, i) => { let a = i, z = i; while (a > 0 && !/\s/u.test(t[a - 1])) a--; while (z < t.length && !/\s/u.test(t[z])) z++; return t.slice(a, z); };
const parenBody = (t, i) => { const z = t.indexOf(")", i); return z < 0 ? null : t.slice(i + 1, z); };
const parenOpenFor = (t, i) => t.lastIndexOf("(", i);

// ---- the shapes. ctx = { t, i, p (char before), n (char after), d (paren depth) }
const SHAPES = {
  ",": [
    { id: "comma-single-word-list", divides: true,
      shape: "comma at depth 0 in a field whose every comma piece is one word (no space inside), none a bare conjunction and the last not 'to'",
      test: (x) => x.d === 0 && commaField(x.t).list,
      means: "separates one English rendering from the next: PanLex's source dictionary packed several one-word equivalents into one expression (dam, fence, barrier)" },
    { id: "comma-before-postposed-to", divides: false,
      shape: "comma at depth 0 whose last piece is exactly 'to'",
      test: (x) => x.d === 0 && commaField(x.t).to,
      means: "the dictionary inversion of an infinitive: 'lay-down, to' is the one verb 'to lay-down', its particle written after the comma" },
    { id: "comma-in-coordinated-idiom", divides: false,
      shape: "comma at depth 0 in a field where some multi-word piece contains the word 'and' or 'or'",
      test: (x) => x.d === 0 && commaField(x.t).series,
      means: "the comma of an English serial list inside one fixed expression (hook, line and sinker is one idiom, not two readings)" },
    { id: "comma-in-proper-name", divides: false,
      shape: "comma at depth 0 in a field where every piece starts with a capital, some piece has more than one word, and no piece contains 'and'/'or'",
      test: (x) => x.d === 0 && commaField(x.t).name,
      means: "the comma of a proper name in 'place, region' form: New York, New York is one name" },
    { id: "comma-before-shared-tail", divides: false,
      shape: "comma at depth 0 in a lowercase field whose earlier pieces are one word each and whose last piece is longer, with no 'and'/'or'",
      test: (x) => x.d === 0 && commaField(x.t).tail,
      means: "a packed scope: the trailing word of the last piece belongs to the earlier ones too ('get, become late' is get late / become late); the scope is not written, so the field is one reading" },
    { id: "comma-inside-parentheses", divides: false,
      shape: "comma at parenthesis depth > 0",
      test: (x) => x.d > 0,
      means: "notation inside an aside (none occur in this provider; kept so a new one is classified, not guessed)" },
  ],
  "/": [
    { id: "slash-between-capitalized-names", divides: true,
      shape: "slash at depth 0 with no space on either side, each side a single capitalized word",
      test: (x) => { if (x.d !== 0 || /\s/u.test(x.p || " ") || /\s/u.test(x.n || " ")) return false; const [a, b] = slashSides(x.t, x.i); return words(a).length === 1 && words(b).length === 1 && UP.test(a[0]) && UP.test(b[0]); },
      means: "separates two names of one place in two languages (Elche/Elx): either name is a rendering" },
    { id: "slash-between-the-phrases", divides: true,
      shape: "slash at depth 0 with no space on either side, each side a phrase opening with 'the '",
      test: (x) => { if (x.d !== 0 || /\s/u.test(x.p || " ") || /\s/u.test(x.n || " ")) return false; const [a, b] = slashSides(x.t, x.i); return /^the\s/u.test(a) && /^the\s/u.test(b); },
      means: "separates the women's and the men's label of one facility (the ladies’/the gents’): each side is a complete English expression for it" },
  ],
  "-": [
    { id: "hyphen-in-compound-word", divides: false,
      shape: "hyphen with a letter (or apostrophe) on both sides",
      test: (x) => /[\p{L}’']/u.test(x.p || "") && /[\p{L}’']/u.test(x.n || ""),
      means: "joins the parts of one hyphenated word or name (pot-belly, Stratford-on-Avon, CD-ROM)" },
    { id: "hyphen-in-designation", divides: false,
      shape: "hyphen with a letter or digit on both sides and a digit on at least one",
      test: (x) => ALNUM.test(x.p || "") && ALNUM.test(x.n || "") && (DIG.test(x.p) || DIG.test(x.n)),
      means: "part of an alphanumeric designation or number (BM-21, K-9, 1-800-Missing)" },
    { id: "hyphen-ending-prefix", divides: false,
      shape: "hyphen as the last character of the field, after a letter",
      test: (x) => x.i === x.t.length - 1 && LET.test(x.p || ""),
      means: "the English is a prefix; the hyphen marks the side it attaches on (re-, un-, Sino-)" },
    { id: "hyphen-opening-suffix", divides: false,
      shape: "hyphen as the first character of the field, before a letter",
      test: (x) => x.i === 0 && LET.test(x.n || ""),
      means: "the English is a suffix; the hyphen marks the side it attaches on (-less, -shaped)" },
    { id: "hyphen-between-spaces", divides: false,
      shape: "hyphen with a space on both sides",
      test: (x) => x.p === " " && x.n === " ",
      means: "a dash inside one proper name, joining a country's name to the capital that distinguishes it (Congo - Brazzaville)" },
  ],
  "’": null, // filled below (shared with ')
  "'": null,
  ".": [
    { id: "period-in-domain-name", divides: false,
      shape: "period between letters followed by com/org/net/edu/gov at the end of the token",
      test: (x) => LET.test(x.p || "") && /^(com|org|net|edu|gov)(\b|$)/u.test(x.t.slice(x.i + 1)),
      means: "the dot of a web domain that is itself the name (Amazon.com)" },
    { id: "period-after-one-letter", divides: false,
      shape: "period after a single letter that has no letter before it",
      test: (x) => LET.test(x.p || "") && !LET.test(x.t[x.i - 2] || "") && !/^(com|org|net|edu|gov)(\b|$)/u.test(x.t.slice(x.i + 1)),
      means: "closes a one-letter abbreviation or an initial (U.S.A., a.m., e.g., A.C. Milan, ж. — a Russian source's feminine label)" },
    { id: "period-after-abbreviation", divides: false,
      shape: "period after two or more letters, not a domain",
      test: (x) => LET.test(x.p || "") && LET.test(x.t[x.i - 2] || "") && !/^(com|org|net|edu|gov)(\b|$)/u.test(x.t.slice(x.i + 1)),
      means: "closes a shortened word (Sat., approx., Mrs., ad loc., Ltd.)" },
  ],
  "?": [
    { id: "question-in-title", divides: false,
      shape: "question mark directly after '!'",
      test: (x) => x.p === "!",
      means: "part of a work's title as published (What the Bleep Do We Know!?)" },
  ],
  "!": [
    { id: "exclamation-click-letter", divides: false,
      shape: "'!' at the start of a word, before a letter",
      test: (x) => (x.i === 0 || /\s/u.test(x.p)) && LET.test(x.n || ""),
      means: "a letter: the alveolar click of a Khoisan language name's own spelling (!Xũ)" },
    { id: "exclamation-in-title", divides: false,
      shape: "'!' directly before '?' after a letter",
      test: (x) => LET.test(x.p || "") && x.n === "?",
      means: "part of a work's title as published (What the Bleep Do We Know!?)" },
  ],
  ":": [
    { id: "colon-in-clock-time", divides: false,
      shape: "colon between two digits",
      test: (x) => DIG.test(x.p || "") && DIG.test(x.n || ""),
      means: "separates hours from minutes (12:00 a.m.)" },
    { id: "colon-before-subtitle", divides: false,
      shape: "colon after a letter, followed by a space and a capital",
      test: (x) => LET.test(x.p || "") && x.n === " " && UP.test(x.t[x.i + 2] || ""),
      means: "separates a title from its subtitle inside one work's name (Perfect Dark: Second Front)" },
  ],
  "_": [
    { id: "underscore-sense-tag", divides: false,
      shape: "underscore between two letters",
      test: (x) => LET.test(x.p || "") && LET.test(x.n || ""),
      means: "joins a word to the class that disambiguates it, as a sense tag (Pole_person: Pole the person)" },
  ],
  "(": [
    { id: "paren-acronym-aside", divides: false,
      shape: "'(' after a space, holding only capital letters (two or more) up to its ')'",
      test: (x) => x.p === " " && /^\p{Lu}{2,}$/u.test(parenBody(x.t, x.i) || ""),
      means: "opens an aside giving the name's official abbreviation (Macedonia (FYROM)); one reading" },
  ],
  ")": [
    { id: "paren-acronym-aside-close", divides: false,
      shape: "')' closing a '(' that holds only capital letters",
      test: (x) => { const o = parenOpenFor(x.t, x.i); return o >= 0 && /^\p{Lu}{2,}$/u.test(x.t.slice(o + 1, x.i)); },
      means: "closes the abbreviation aside" },
  ],
  "#": [
    { id: "hash-anchor", divides: false,
      shape: "'#' at the start of a word, before a letter, in a field that also carries '|'",
      test: (x) => (x.i === 0 || /\s/u.test(x.p)) && LET.test(x.n || "") && x.t.includes("|"),
      means: "residue of wiki link markup: the anchor sign of the link target (#Barcelona |Barcelona)" },
  ],
  "|": [
    { id: "pipe-link-label", divides: false,
      shape: "'|' before a letter in a field that opens a token with '#'",
      test: (x) => LET.test(x.n || "") && /(^|\s)#\p{L}/u.test(x.t),
      means: "residue of wiki link markup: divides a link's target from its display text, both the same name; not two readings" },
  ],
};
const apostropheShapes = (ch) => [
  { id: `${ch === "’" ? "curly" : "ascii"}-apostrophe-inside-word`, divides: false,
    shape: "apostrophe with a letter on both sides",
    test: (x) => LET.test(x.p || "") && LET.test(x.n || ""),
    means: "part of the word's own spelling: an English possessive or contraction (one’s, o’clock, I’m), an elision in a borrowed name (L’Orfeo, hors d'oeuvre), or a transliterated consonant (Sha’aban, Shari'a, K’op’ala)" },
  { id: `${ch === "’" ? "curly" : "ascii"}-apostrophe-clipped-front`, divides: false,
    shape: "apostrophe at the start of a word (field start, after a space or a hyphen), before a lowercase letter",
    test: (x) => (x.i === 0 || /[\s-]/u.test(x.p)) && LO.test(x.n || ""),
    means: "stands for letters clipped from the front of a colloquial form (’scuse, ’rents, 'til, 'cause)" },
  { id: `${ch === "’" ? "curly" : "ascii"}-apostrophe-opening-name`, divides: false,
    shape: "apostrophe at the start of a word (field start, after a space or a hyphen), before a capital",
    test: (x) => (x.i === 0 || /[\s-]/u.test(x.p)) && UP.test(x.n || ""),
    means: "a transliterated ayin opening an Arabic place name (’Asir, ’Ara, Shefa-’Amr)" },
  { id: `${ch === "’" ? "curly" : "ascii"}-apostrophe-word-final`, divides: false,
    shape: "apostrophe after a letter and before a space, a slash or the field's end",
    test: (x) => LET.test(x.p || "") && (x.n === undefined || /[\s/]/u.test(x.n)),
    means: "stands for a dropped final letter (burlin’, tho’) or closes a plural possessive (the ladies’)" },
  ...(ch === "'" ? [{ id: "ascii-apostrophe-pair-token", divides: false,
    shape: "two ASCII apostrophes standing together as a whole token between spaces",
    test: (x) => tokenAt(x.t, x.i) === "''",
    means: "typewriter quotation or ditto marks carried from PanLex's source, enclosing nothing; they hold no English and divide nothing (labor '' '')" }] : []),
];
SHAPES["’"] = apostropheShapes("’");
SHAPES["'"] = apostropheShapes("'");
const DECLARED = new Set(Object.keys(SHAPES));

// ---- census over route text and, separately, definition text
const tally = (field) => {
  const m = new Map();
  for (const r of rows) { const seen = new Set(); for (const c of String(r[field] ?? "")) if (MARK.test(c)) { const e = m.get(c) || { occurrences: 0, routes: 0 }; e.occurrences++; if (!seen.has(c)) { e.routes++; seen.add(c); } m.set(c, e); } }
  return m;
};
const routeTally = tally("route"), defTally = tally("def");
const inv = JSON.parse(readFileSync(INV, "utf8")).providers.filter((p) => M_IDS.includes(p.provider));
const invMarks = new Map(inv.flatMap((p) => p.marks.map((m) => [m.mark, m])));
const ranked = JSON.parse(readFileSync(RANKED, "utf8"));
const rankedRow = (Array.isArray(ranked) ? ranked : ranked.sources || ranked.ranked || Object.values(ranked).find(Array.isArray)).find((s) => s.source_key === SRC);

// ---- classify every occurrence
const shapeHits = new Map(); // id -> {count, routes:Set, examples:[]}
const residue = new Map();   // mark -> {count, examples}
let overlaps = 0; const overlapEx = [];
for (let ri = 0; ri < rows.length; ri++) {
  const t = rows[ri].route;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (!MARK.test(c)) continue;
    const x = { t, i, p: t[i - 1], n: t[i + 1], d: depthAt(t, i) };
    const hits = (SHAPES[c] || []).filter((s) => s.test(x));
    if (hits.length === 1) {
      const h = shapeHits.get(hits[0].id) || { count: 0, routes: new Set(), examples: [] };
      h.count++; h.routes.add(ri);
      if (h.examples.length < 6 && !h.examples.some((e) => e.endsWith(win(t, i)))) h.examples.push(`${rows[ri].key} | ${win(t, i)}`);
      shapeHits.set(hits[0].id, h);
    } else {
      if (hits.length > 1) { overlaps++; if (overlapEx.length < 6) overlapEx.push(`${c} ${hits.map((h) => h.id).join("+")} ${rows[ri].key} | ${win(t, i)}`); }
      const e = residue.get(c) || { count: 0, routes: new Set(), examples: [] };
      e.count++; e.routes.add(ri); if (e.examples.length < 6) e.examples.push(`${rows[ri].key} | ${win(t, i)}`); residue.set(c, e);
    }
  }
}

// ---- the declaration's division
const DIVIDING_SLASH = new Set(SHAPES["/"].filter((s) => s.divides).map((s) => s.id));
const declDivide = (t) => {
  const undeclared = [...new Set([...t].filter((c) => MARK.test(c) && !DECLARED.has(c)))];
  if (undeclared.length) return { readings: [t], why: `undeclared mark ${undeclared.join(" ")}` };
  if (!balanced(t)) return { readings: [t], why: "unbalanced parentheses" };
  // 1. slash: every depth-0 slash must be a dividing shape, or none divides
  const sl = []; for (let i = 0; i < t.length; i++) if (t[i] === "/" && depthAt(t, i) === 0) sl.push(i);
  let parts = [t]; let slashCut = false;
  if (sl.length && sl.every((i) => SHAPES["/"].some((s) => s.divides && s.test({ t, i, p: t[i - 1], n: t[i + 1], d: 0 })))) {
    parts = split0(t, "/"); slashCut = true;
    if (parts.join("/") !== t) return { readings: [t], why: "slash pieces do not rejoin" };
  }
  // 2. comma: within each part, only where the part is a one-word list
  const out = [];
  for (const part of parts) {
    const cf = commaField(part);
    if (cf.pcs.length > 1 && cf.list) {
      const raw = split0(part, ",");
      if (raw.join(",") !== part) return { readings: [t], why: "comma pieces do not rejoin" };
      out.push(...raw.map((p) => p.trim()).filter(Boolean));
    } else out.push(part.trim());
  }
  // every piece is a run of the provider's characters, and together they are the route
  for (const p of out) if (!t.includes(p)) return { readings: [t], why: "a piece is not a run of the route" };
  return { readings: out.length > 1 ? out : [t], why: null, slashCut };
};

// ---- compare with today's engine
const cmp = { fields_compared: 0, same_division: 0, same_whole: 0, same_divided: 0, v3_divides_where_declaration_keeps_whole: 0, declaration_divides_where_v3_keeps_whole: 0, divided_differently: 0 };
const cmpEx = { v3_divides_where_declaration_keeps_whole: [], declaration_divides_where_v3_keeps_whole: [], divided_differently: [] };
const declStats = { routes_divided: 0, readings_from_divided: 0, by_mark: { "/": 0, ",": 0 }, refused: {} };
const v3Stats = { routes_divided: 0, damaged_held_whole: 0 };
const fmt = (a) => a.map((s) => (s.length > 28 ? s.slice(0, 28) + "…" : s)).join(" ‖ ");
for (const r of rows) {
  const t = r.route;
  const v = senseSplit(t);
  const d = declDivide(t);
  cmp.fields_compared++;
  if (v.damaged) v3Stats.damaged_held_whole++;
  if (v.readings.length > 1) v3Stats.routes_divided++;
  if (d.why) declStats.refused[d.why] = (declStats.refused[d.why] || 0) + 1;
  if (d.readings.length > 1) { declStats.routes_divided++; declStats.readings_from_divided += d.readings.length; if (d.slashCut) declStats.by_mark["/"]++; else declStats.by_mark[","]++; }
  const vr = v.readings.map((s) => s.trim()), dr = d.readings.map((s) => s.trim());
  const same = JSON.stringify(vr) === JSON.stringify(dr);
  let kind;
  if (same) { cmp.same_division++; if (dr.length > 1) cmp.same_divided++; else cmp.same_whole++; continue; }
  if (vr.length > 1 && dr.length === 1) kind = "v3_divides_where_declaration_keeps_whole";
  else if (dr.length > 1 && vr.length === 1) kind = "declaration_divides_where_v3_keeps_whole";
  else kind = "divided_differently";
  cmp[kind]++;
  if (cmpEx[kind].length < 6) cmpEx[kind].push(`${r.key} | ${t.slice(0, 60)} | v3: ${fmt(vr)} | declaration: ${fmt(dr)}`);
}

// ---- assemble census
const order = [...routeTally.keys()].sort((a, b) => routeTally.get(b).occurrences - routeTally.get(a).occurrences);
const marks = order.map((c) => {
  const rt = routeTally.get(c), dt = defTally.get(c) || { occurrences: 0, routes: 0 }, iv = invMarks.get(c);
  const shapes = (SHAPES[c] || []).map((s) => {
    const h = shapeHits.get(s.id) || { count: 0, routes: new Set(), examples: [] };
    return { id: s.id, shape: s.shape, test: s.test.toString().replace(/\s+/gu, " "), count: h.count, routes: h.routes.size, means: s.means, divides_readings: s.divides, examples: h.examples };
  });
  const res = residue.get(c) || { count: 0, routes: new Set(), examples: [] };
  return {
    mark: c, codepoint: cp(c),
    route_text: rt, definition_text: dt,
    inventory: iv ? { occurrences: iv.occurrences, routes: iv.routes_carrying_it } : null,
    inventory_agrees: !!iv && iv.occurrences === rt.occurrences && iv.routes_carrying_it === rt.routes,
    shapes,
    shape_total: shapes.reduce((a, s) => a + s.count, 0),
    unexplained: res.count, unexplained_routes: res.routes.size, unexplained_examples: res.examples,
    region_dependent: false,
  };
});
const routeEqDef = rows.filter((r) => r.route === r.def).length;
const commaRoutes = rows.filter((r) => r.route.includes(",")).length;
const noMarkRoutes = rows.filter((r) => ![...r.route].some((c) => MARK.test(c))).length;
const H = (id) => shapeHits.get(id) || { count: 0, routes: new Set() };

const census = {
  schema_version: "PROVIDER_MARK_CENSUS_PILOT_V1",
  provider: SRC, m_ids: M_IDS, label: rankedRow?.label ?? inv[0]?.label, licence_posture: rankedRow?.licensePosture ?? null,
  measured_on: "2026-10-31", measured_by: "census.mjs (this folder)", engine_compared: V3_RULE,
  routes: rows.length,
  m_ids_seen: [...new Set(rows.map((r) => r.m))],
  route_equals_definition: routeEqDef,
  route_region_in_definition_inventory: inv[0]?.route_region_in_definition ?? null,
  routes_with_no_mark: noMarkRoutes,
  routes_with_a_comma: commaRoutes,
  distinct_marks_route_text: routeTally.size, distinct_marks_definition_text: defTally.size,
  inventory_mark_count: inv[0]?.mark_count ?? null,
  definition_census_equals_route_census: [...routeTally].every(([c, e]) => { const d = defTally.get(c); return d && d.occurrences === e.occurrences && d.routes === e.routes; }) && routeTally.size === defTally.size,
  marks,
  occurrences_total: marks.reduce((a, m) => a + m.route_text.occurrences, 0),
  occurrences_in_one_shape: marks.reduce((a, m) => a + m.shape_total, 0),
  occurrences_unexplained: marks.reduce((a, m) => a + m.unexplained, 0),
  occurrences_matching_two_shapes: overlaps, overlap_examples: overlapEx,
  regions: "one: the route is the whole definition in every row, so no mark's meaning can depend on a region (head, rendering list, notes) — the provider has none",
  declaration_division: declStats,
  v3_division: v3Stats,
  v3_comparison: { ...cmp, examples: cmpEx },
};
// ---- open questions the data cannot settle (counts from the shapes above)
const keysOf = (pred) => rows.filter((r) => pred(r.route)).map((r) => `${r.key} | ${r.route.slice(0, 60)}`);
census.open_questions_for_owner = [
  { id: "gendered-slash-pair", routes: H("slash-between-the-phrases").routes.size,
    reading_a: `divide (declared): each side is a complete English name for the facility, ${H("slash-between-the-phrases").routes.size} routes print two pills`,
    reading_b: `ship whole: the pair together is one bilateral label rendering the ungendered Hebrew, ${H("slash-between-the-phrases").routes.size} routes print one pill`,
    settled_alongside: `the name slash (Elche/Elx, ${H("slash-between-capitalized-names").routes.size} route) is two names of one place and divides either way`,
    keys: keysOf((t) => /^the\s.*\/the\s/u.test(t)) },
  { id: "shared-tail-comma", routes: H("comma-before-shared-tail").routes.size,
    reading_a: "ship whole (declared): 'get, become late' is one packed reading; cutting gives 'get', which the provider never offered alone",
    reading_b: "separate at the comma (today's v3): 'get' and 'become late' are each runs of the provider's characters, so the cut is a separation, not a derivation",
    keys: keysOf((t) => commaField(t).tail) },
  { id: "proper-name-comma", routes: H("comma-in-proper-name").routes.size,
    reading_a: "ship whole (declared): 'New York, New York' is one name",
    reading_b: "separate (today's v3): two pills, both 'New York'",
    keys: keysOf((t) => commaField(t).name) },
  { id: "question-mark-on-hayward", routes: residue.get("?")?.routes.size ?? 0,
    reading_a: "the '?' is PanLex's source doubting the equation (a flag on the reading, not part of it)",
    reading_b: "the '?' is part of a stray string unrelated to the key; the field prints as written either way, and whether it should print is a corpus question, not a mark question",
    keys: keysOf((t) => /^Hayward\?$/u.test(t)) },
  { id: "empty-apostrophe-pairs", routes: H("ascii-apostrophe-pair-token").routes.size,
    reading_a: "ditto marks from a source table (\"same as above\"), whose referent is lost",
    reading_b: "empty typewriter quotation marks; either way they hold no English and divide nothing — the question is only whether the card prints them",
    keys: keysOf((t) => /(^|\s)''(\s|$)/u.test(t)) },
  { id: "engine-reads-shapes", routes: commaRoutes,
    reading_a: "declaration-v1.mjs grows a shape condition so a provider can say 'a comma divides only between one-word pieces'",
    reading_b: "the machine stays one-mark-unconditional, and this provider is declared with separates_on null (ships whole, as today's default for undeclared providers), giving up the 8 gloss-list routes' division",
    keys: [] },
];
writeFileSync(join(OUT, "census.json"), JSON.stringify(census, null, 1) + "\n");

// ---- declaration (provider shape of declarations-v1.json), numbers from above
const markDecl = {};
for (const m of marks) {
  const div = m.shapes.filter((s) => s.divides_readings).reduce((a, s) => a + s.count, 0);
  markDecl[m.mark] = {
    means: m.shapes.filter((s) => s.count > 0).map((s) => s.means).join(" | ") || "unread",
    governs: m.route_text.occurrences,
    routes: m.route_text.routes,
    divides_readings: div > 0 ? (div === m.route_text.occurrences ? true : `in ${div} of ${m.route_text.occurrences} occurrences, by shape`) : false,
    shapes: Object.fromEntries(m.shapes.filter((s) => s.count > 0 || s.id === "comma-inside-parentheses").map((s) => [s.id, { test: s.shape, count: s.count, routes: s.routes, divides: s.divides_readings, means: s.means }])),
    evidence: m.shapes.filter((s) => s.count > 0).map((s) => `${s.id}: ${s.count} (${s.examples[0] ?? ""})`).join("; "),
    ...(m.unexplained ? { unexplained: m.unexplained, unexplained_examples: m.unexplained_examples } : {}),
  };
}
const F = {
  ",": "A comma piece that a one-word list makes but that is not an English rendering of the key on its own (a particle, a bare adjective that needs the next piece's head). A field passing the one-word test where the pieces are one expression would refute the divide.",
  "/": "A depth-0 slash between two sides where one side is not a complete expression (a fraction, a date, an and/or such as 'he/she said'). None at the time of writing.",
  "-": "A hyphen between spaces or at a field's edge whose two sides are two readings rather than one name or one affix.",
  "’": "An apostrophe used as a quotation mark around a reading (an opener and a closer pairing up across words).",
  "'": "An apostrophe pair that encloses text, which would make it a quotation rather than an empty ditto/quote token.",
  ".": "A period followed by a space and a second sentence, or between two readings.",
  "?": "A question mark after a field that does render the key — that would make '?' a doubt flag on the reading and settle the two Hayward rows.",
  ":": "A colon followed by a list of renderings (a head:list division as Strong's has).",
  "!": "A '!' between two words that are separate readings.",
  "_": "An underscore between two words that are two readings rather than word + sense tag.",
  "(": "A parenthesis holding a lowercase word or a comma list (an alternative or optional letters) rather than an abbreviation.",
  ")": "As for '('.",
  "#": "A '#' that is not markup (a number sign, 'No.').",
  "|": "A '|' between two different names, which would make it an alternation.",
};
for (const k of Object.keys(markDecl)) markDecl[k].falsifier = F[k];

const declaration = {
  schema_version: "PROVIDER_DECLARATIONS_V1",
  pilot: "punct pilot 2026-10-31 — page lane ledger",
  measured_by: `${OUT}/census.mjs`,
  providers: {
    [SRC]: {
      label: census.label,
      m_ids: M_IDS,
      routes: rows.length,
      declared_on: "2026-10-31",
      declared_from: `The record's own unit: in ${routeEqDef} of ${rows.length} rows the route is the whole definition, so the provider has one region and no head. ${noMarkRoutes} routes carry no mark at all; ${rows.length - commaRoutes} carry no comma. PanLex's unit is one lexical expression per record, and its marks are overwhelmingly the spelling of that expression: of ${census.occurrences_total} mark occurrences, ${census.occurrences_total - H("comma-single-word-list").count - H("slash-between-capitalized-names").count - H("slash-between-the-phrases").count} are inside one expression (hyphens in compounds, apostrophes, abbreviation periods, title and markup punctuation). Two marks divide, and only by shape: a comma in a field whose every piece is one word (${H("comma-single-word-list").count} commas, ${H("comma-single-word-list").routes.size} routes — source glosses PanLex left packed in one expression), and a slash between two complete expressions (${H("slash-between-capitalized-names").count + H("slash-between-the-phrases").count} routes). The other ${commaRoutes - H("comma-single-word-list").routes.size} comma routes are one expression each.`,
      census_check: `Route-text census and definition-text census agree mark for mark (${census.definition_census_equals_route_census}); both agree with mark-inventory-2026-10-31.json for M21 on all ${marks.filter((m) => m.inventory_agrees).length} of ${marks.length} marks. ${census.occurrences_in_one_shape} of ${census.occurrences_total} occurrences fall in exactly one shape; ${census.occurrences_unexplained} unexplained; ${overlaps} match two shapes.`,
      regions: { whole: routeEqDef, slice: 0, absent: 0, note: census.regions },
      marks: markDecl,
      precedence: ["/", ","],
      precedence_note: "Slash first, then comma inside each slash side, as the Strong's declaration orders them. No route of this provider carries both, so the order is declared, not exercised. Parentheses scope both: a comma or slash inside '(' ')' never divides (no route carries one).",
      refusals: {
        unbalanced_parentheses: { rows: rows.filter((r) => !balanced(r.route)).length, rule: "ship whole" },
        undeclared_mark: { rows: 0, rule: "closure: a mark absent from this declaration ships the row whole and is reported" },
        comma_not_a_one_word_list: { rows: commaRoutes - H("comma-single-word-list").routes.size, rule: "ship whole: the comma is inside one expression (postposed 'to', a coordinated idiom, a proper name, a packed shared tail)" },
        shared_tail_never_distributed: { rows: H("comma-before-shared-tail").routes.size, rule: "'get, become late' is not rewritten as 'get late' + 'become late' and not cut to 'get' + 'become late'; it ships whole" },
      },
      export: `governed by its posture, ${census.licence_posture}`,
      separates_on: {
        marks: ["/", ","],
        scope: "( )",
        declared_from: `${commaRoutes} routes carry a comma (${routeTally.get(",")?.occurrences} commas) and ${routeTally.get("/")?.routes ?? 0} carry a slash; none carries one inside parentheses.`,
        rule: "Separate on a depth-0 slash with no space on either side when both sides are complete expressions (a capitalized name each, or a 'the ...' phrase each). Then, inside each side, separate on depth-0 commas only when every comma piece is one word, none is a bare conjunction and the last is not 'to'. Every piece is kept, each a run of the provider's characters; they must rejoin to the route. Nothing is distributed, stripped or joined.",
        result: `${declStats.routes_divided} routes divide into ${declStats.readings_from_divided} readings (${declStats.by_mark[","]} by comma, ${declStats.by_mark["/"]} by slash); ${rows.length - declStats.routes_divided} ship whole.`,
        machine_gap: "declaration-v1.mjs reads one separates_on.mark and divides on it unconditionally. This declaration needs two marks and a per-field shape condition on the comma; fed to that machine as written it would divide 'hook, line and sinker', 'New York, New York', 'lay-down, to' and 'get, become late'. census.mjs's declDivide is the reference application until the machine reads shapes.",
      },
      not_done_here: "No piece is distributed across a shared head or tail, no sigil or markup is stripped ('#Barcelona |Barcelona', 'Pole_person', 'labor '' ''', 'lioness ж.' ship as written), and no reading is taken from anywhere but the route — the route is the whole definition. 'Hayward?' is not repaired or dropped.",
    },
  },
};
writeFileSync(join(OUT, "declaration.json"), JSON.stringify(declaration, null, 1) + "\n");

console.log(JSON.stringify({
  routes: rows.length, routeEqDef, noMarkRoutes, commaRoutes,
  occ: census.occurrences_total, inShape: census.occurrences_in_one_shape, unexplained: census.occurrences_unexplained, overlaps,
  inventory_agree: marks.map((m) => `${m.mark}:${m.inventory_agrees}`).join(" "),
  defEq: census.definition_census_equals_route_census,
  shapes: marks.map((m) => `${m.mark} ${m.route_text.occurrences}/${m.route_text.routes} -> ` + m.shapes.map((s) => `${s.id}=${s.count}/${s.routes}`).join(", ") + (m.unexplained ? ` RESIDUE=${m.unexplained} ${m.unexplained_examples.join(" ; ")}` : "")),
  declStats, v3Stats, cmp, cmpEx, overlapEx,
}, null, 1));
