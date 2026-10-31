// Independent verifier for the drafted M14 declaration (wikisource_strongs_explicit_forms).
// Written from the shape TESTS as stated in words in the draft summary; no code from census.mjs/declare.mjs.
// Usage: node verify.mjs <by-source jsonl> <sense-split-v1.mjs path> <out json>
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { makeLocator, analyzeDef, parenInfo, isLetter, isDigit, isSpace, isHebLetter, isHebPoint, isMark, ieDot } from "./lib.mjs";
const [, , SRC, SS, OUT] = process.argv;
const { senseSplit } = await import(pathToFileURL(SS).href);

const rows = readFileSync(SRC, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const loc = makeLocator();
const defCache = new Map();

// ---------- the aside phrases ("and the like" read as: the provider's italic notes on an irregular rendering) ----------
const ASIDE = /^(by mistake for|by confusion with|from the margin|from margin|from the marg\.|including the art|includ\. the article|by including the article|plural$|dual$|by a false|perhaps by clerical error|by exchange for|by union with|by correction for|by reading|as in the margin|as if from|as such unrepresented|as one or two words)/u;
const CITE = /\d+:\d+/u;
const isAsideContent = (c) => ASIDE.test(c.trim()) || CITE.test(c);
// ---------- abbreviation tokens closed by '.' ----------
const ABBR = new Set(["etc", "Prop", "irreg", "Incl", "Marg", "marg", "etym", "includ", "Prob", "Psa"]);

const T = {}; // tallies: T[mark][shape] = count
const routesWith = {}; // routes carrying a mark
const ex = {}; // examples per mark|shape
const unexplained = {}; const overlaps = {}; const literalOverlap = {};
const bump = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };
const exAdd = (k, key, s, i) => { if (!ex[k]) ex[k] = []; if (ex[k].length < 6) ex[k].push(`${key}: ${s.slice(Math.max(0, i - 25), i + 25)}`); };
const keyed = {}; // all keyed occurrences for falsification samples (limited)
const keep = (k, key, s, i, extra) => { if (!keyed[k]) keyed[k] = []; if (keyed[k].length < 400) keyed[k].push({ key, at: i, win: s.slice(Math.max(0, i - 28), i + 28), ...(extra || {}) }); };

const regionTallies = {};
const openerSpelled = {}; const defsSeen = new Set();
const v3 = { same: 0, v3_divides_decl_whole: 0, decl_divides_v3_whole: 0, divided_differently: 0, v3_withholds: 0, same_print_differently: 0 };
const v3h = { same: 0, v3_divides_decl_whole: 0, decl_divides_v3_whole: 0, divided_differently: 0, v3_withholds: 0 };
const v3ex = {};
const declStats = { routes_divided: 0, pieces: 0 };
const notBounded = []; let locMulti = 0;

const packSplit = (text) => { // gloss-store-v1.mjs packSplit, same logic (not exported there)
  const t = String(text || ""); const out = []; let start = 0, d = 0;
  for (let i = 0; i < t.length; i += 1) { const c = t[i]; if (c === "(") d += 1; else if (c === ")") { if (d > 0) d -= 1; } else if (c === ";" && d === 0) { out.push(t.slice(start, i)); start = i + 1; } }
  out.push(t.slice(start));
  if (out.join(";") !== t) return [t.trim()].filter(Boolean);
  return out.map((x) => x.trim()).filter(Boolean);
};

for (const r of rows) {
  const s = r.route, def = r.def;
  let A = defCache.get(def); if (!A) { A = analyzeDef(def); defCache.set(def, A); }
  const L = loc(r, A); if (!L.bounded) notBounded.push(r.key); if (L.n > 1) locMulti++;
  if (!defsSeen.has(def)) { defsSeen.add(def); bump(openerSpelled, A.op ? A.op.spelled : "none"); }
  const P = parenInfo(s);
  const reg = (i) => A.region(L.p + i);
  const isHeadish = (g) => g === "head" || g === "no_opener";
  // rendering start for '+'/'X' "first in the rendering": route start, opener end, or after a depth-0 list ';' / ',' / list end
  const renderingStartBefore = (i) => {
    let st = 0;
    for (let k = 0; k < i; k++) {
      const g = reg(k);
      if (g === "opener") st = k + 1;
      else if (g === "list_end") st = k + 1;
      else if ((s[k] === ";" || s[k] === ",") && P.depth[k] === 0 && (g === "list" || isHeadish(g))) st = k + 1;
    }
    return st;
  };
  const marksHere = new Set();
  const cutAt = []; // declaration cut char positions
  for (let i = 0; i < s.length; i++) {
    const c = s[i], g = reg(i);
    const standaloneX = c === "X" && !isLetter(s[i - 1]) && !isLetter(s[i + 1]);
    if (!isMark(c) && !standaloneX) continue;
    let mk = c;
    if (isHebPoint(c)) mk = "POINT";
    else if (/\p{M}/u.test(c)) mk = "OTHER_MARK:" + c.codePointAt(0).toString(16);
    marksHere.add(mk === "POINT" ? "POINT:" + c.codePointAt(0).toString(16).toUpperCase() : mk);
    bump(regionTallies, `${mk}|${g}`);
    const tests = []; // [shape, bool] in declared precedence
    const d = P.depth[i];
    if (c === "(" || c === ")") {
      let o = c === "(" ? i : P.match[i];
      const matched = P.match[i] !== -1;
      const content = matched ? s.slice((c === "(" ? i : o) + 1, c === "(" ? P.match[i] : i) : null;
      const og = matched ? reg(o) : g; // the group's region is where its opener sits
      if (c === "(") {
        const noCloseAfter = s.indexOf(")", i + 1) === -1;
        tests.push(["paren.opener_never_closed", !matched]);
        tests.push(["paren.head_aside", matched && og === "head"]);
        tests.push(["paren.note", matched && (og === "notes")]);
        const inList = matched && og === "list";
        tests.push(["paren.list_aside", inList && isAsideContent(content)]);
        tests.push(["paren.suffix_syllable", inList && /^\(?-/u.test(content.trim())]);
        // comma at the group's own depth
        let ownComma = false; if (inList) { for (let k = i + 1; k < P.match[i]; k++) if (s[k] === "," && P.inner[k] === i) ownComma = true; }
        tests.push(["paren.alternatives", inList && ownComma && !/^\(?-/u.test(content.trim())]);
        tests.push(["paren.prefix_syllable", inList && /-$/u.test(content.trim())]);
        tests.push(["paren.optional_words", inList && /\p{L}/u.test(content) && !content.includes(",")]);
        tests.push(["paren.NO_OPENER_REGION", matched && og === "no_opener"]);
        if (!matched !== noCloseAfter) bump(literalOverlap, "(:unmatched_but_a_close_follows");
      } else {
        tests.push(["paren.closer_with_nothing_open", !matched]);
        if (matched) {
          // same shape as its opener: computed below by re-running the opener tests
          const ci = o, cs = s.slice(ci + 1, i), inList = og === "list";
          let ownComma = false; if (inList) { for (let k = ci + 1; k < i; k++) if (s[k] === "," && P.inner[k] === ci) ownComma = true; }
          tests.push(["paren.head_aside", og === "head"]);
          tests.push(["paren.note", og === "notes"]);
          tests.push(["paren.list_aside", inList && isAsideContent(cs)]);
          tests.push(["paren.suffix_syllable", inList && /^\(?-/u.test(cs.trim())]);
          tests.push(["paren.alternatives", inList && ownComma && !/^\(?-/u.test(cs.trim())]);
          tests.push(["paren.prefix_syllable", inList && /-$/u.test(cs.trim())]);
          tests.push(["paren.optional_words", inList && /\p{L}/u.test(cs) && !cs.includes(",")]);
          tests.push(["paren.NO_OPENER_REGION", og === "no_opener"]);
        }
      }
    } else if (c === ",") {
      const innerAside = P.inner[i] !== -1 && P.match[P.inner[i]] !== -1 && isAsideContent(s.slice(P.inner[i] + 1, P.match[P.inner[i]]));
      const anyAside = (() => { for (let k = 0; k < i; k++) if (s[k] === "(" && P.match[k] > i && isAsideContent(s.slice(k + 1, P.match[k]))) return true; return false; })();
      tests.push(["comma.in_unclosed_group", g === "list" && P.inUnclosed[i]]);
      tests.push(["comma.in_group", g === "list" && d >= 1 && !anyAside]);
      tests.push(["comma.in_head_aside", g === "head" && d >= 1]);
      tests.push(["comma.note_prose", g === "notes"]);
      tests.push(["comma.rendering_separator", g === "list" && d === 0]);
      tests.push(["comma.IN_LIST_ASIDE", g === "list" && d >= 1 && anyAside]);
      tests.push(["comma.HEAD_DEPTH0", g === "head" && d === 0]);
      tests.push(["comma.NO_OPENER_REGION", g === "no_opener"]);
    } else if (c === ";") {
      // "not directly before the opener": nothing but space between it and the opener
      let k = L.p + i + 1; while (k < def.length && isSpace(def[k])) k++;
      const beforeOpener = A.op && k === A.op.start;
      tests.push(["semicolon.opener", g === "opener"]);
      tests.push(["semicolon.head_separator", isHeadish(g) && d === 0 && !beforeOpener]);
      tests.push(["semicolon.rendering_separator", g === "list" && d === 0]);
      tests.push(["semicolon.in_head_aside", isHeadish(g) && d >= 1]);
      tests.push(["semicolon.note_prose", g === "notes"]);
      tests.push(["semicolon.IN_LIST_GROUP", g === "list" && d >= 1]);
    } else if (c === "-") {
      const a = s[i - 1], b = s[i + 1];
      const start = i === 0;
      tests.push(["hyphen.opener_tail", g === "opener"]);
      tests.push(["hyphen.misplaced_opener_tail", g === "list" && d === 0 && s.slice(Math.max(0, i - 2), i) === "; " && isLetter(b)]);
      const alone = (() => { let x = i - 1; while (x >= 0 && s[x] === " ") x--; let y = i + 1; while (y < s.length && s[y] === " ") y++; return (s[x] === "(" || s[x] === ",") && (s[y] === ")" || s[y] === ","); })();
      tests.push(["hyphen.bare_in_group", alone]);
      tests.push(["hyphen.compound", isLetter(a) && isLetter(b)]);
      tests.push(["hyphen.suffix_syllable", (start || a === "(" || a === ")" || a === "," || a === " " || a === "-") && (isLetter(b) || b === "(")]);
      tests.push(["hyphen.prefix_syllable", isLetter(a) && (b === ")" || b === "," || b === " " || b === "(" || b === undefined)]);
      tests.push(["hyphen.detached_syllable", (a === " " || a === "(") && b === " "]);
    } else if (c === "X" || c === "+") {
      const nm = c === "X" ? "x" : "plus";
      const rs = renderingStartBefore(i);
      const lead = s.slice(rs, i);
      const first = /^[\s-]*$/u.test(lead) && d === 0;
      tests.push([`${nm}.in_group`, d >= 1]);
      tests.push([`${nm}.whole_rendering`, first]);
      tests.push([`${nm}.mid_rendering`, d === 0 && !first]);
    } else if (c === ".") {
      const q = L.p + i; let a = q, b = q; while (def[a - 1] === ".") a--; while (def[b + 1] === ".") b++;
      const run = b - a + 1;
      let k = q - 1; while (k >= 0 && isLetter(def[k])) k--;
      const tokn = def.slice(k + 1, q);
      const abbr = ieDot(def, q) || ABBR.has(tokn);
      tests.push(["period.ellipsis", run >= 3]);
      tests.push(["period.ellipsis_TWO_DOTS", run === 2]);
      tests.push(["period.list_end", g === "list_end"]);
      tests.push(["period.abbreviation", run === 1 && abbr && g !== "list_end"]);
      tests.push(["period.note_sentence_end", g === "notes" && run === 1 && !abbr]);
      tests.push(["period.head_sentence_end", isHeadish(g) && run === 1 && !abbr]);
      tests.push(["period.stray_in_rendering", g === "list" && run === 1 && !abbr]);
    } else if (c === ":") {
      tests.push(["colon.citation", isDigit(s[i - 1]) && isDigit(s[i + 1])]);
      tests.push(["colon.opener", A.op && A.op.kind === ":" && L.p + i === A.op.start]);
    } else if (c === "`") tests.push(["backtick.ayin_in_transliteration", isLetter(s[i - 1]) || isLetter(s[i + 1])]);
    else if (c === "'") tests.push(["apostrophe.english", isLetter(s[i - 1]) || isLetter(s[i + 1])]);
    else if (c === "\"") tests.push(["quote.quotation", true]);
    else if (c === "&") tests.push(["ampersand.in_rendering", g === "list"]);
    else if (c === "?") tests.push(["question.interrogative", isLetter(s[i - 1])]);
    else if (c === "!") tests.push(["exclamation.in_rendering", isLetter(s[i - 1])]);
    else if (mk === "POINT") tests.push(["point.in_hebrew_word", isHebLetter(s[i - 1]) || isHebPoint(s[i - 1])]);
    const hits = tests.filter(([, ok]) => ok).map(([n]) => n);
    const mkey = mk === "POINT" ? "POINT" : mk;
    if (hits.length === 0) { bump(unexplained, `${mkey}|${g}`); exAdd(`UNEXPLAINED|${mkey}|${g}`, r.key, s, i); keep(`UNEXPLAINED|${mkey}`, r.key, s, i, { g }); bump(T, mkey + "\u0000UNEXPLAINED"); continue; }
    if (hits.length > 1) bump(literalOverlap, `${mkey}|${hits.join("+")}`);
    const shape = hits[0];
    if (!T[mkey]) T[mkey] = {}; bump(T[mkey], shape);
    exAdd(`${mkey}|${shape}`, r.key, s, i);
    keep(shape, r.key, s, i, { g, rid: rows.indexOf === undefined ? 0 : 0 });
    // declaration cuts
    const cutShapes = new Set(["colon.opener", "semicolon.opener", "hyphen.opener_tail", "hyphen.misplaced_opener_tail", "period.list_end", "semicolon.head_separator", "semicolon.rendering_separator", "comma.rendering_separator"]);
    if (cutShapes.has(shape) && d === 0 && !P.inUnclosed[i]) cutAt.push(i);
  }
  for (const m of marksHere) bump(routesWith, m);
  // opener spaces inside the route are part of the opener (the mark), not the reading
  const cutSet = new Set(cutAt);
  for (let i = 0; i < s.length; i++) if (reg(i) === "opener" && P.depth[i] === 0 && !P.inUnclosed[i]) cutSet.add(i);
  // pieces = maximal runs of non-cut chars, trimmed, empties dropped
  const pieces = []; let cur = "";
  for (let i = 0; i <= s.length; i++) { if (i === s.length || cutSet.has(i)) { pieces.push(cur); cur = ""; } else cur += s[i]; }
  // rejoin check: the pieces and the cut characters reproduce the route
  { let rebuilt = "", pi = 0, cur2 = ""; const parts = []; for (let i = 0; i <= s.length; i++) { if (i === s.length || cutSet.has(i)) { parts.push(cur2); cur2 = ""; if (i < s.length) parts.push(s[i]); } else cur2 += s[i]; } rebuilt = parts.join(""); if (rebuilt !== s) bump(T, "\u0000REJOIN_FAIL"); }
  // a piece is separated only where the cut is a dividing mark between two non-empty runs; opener chars at the edges are stripped
  const decl = pieces.map((p) => p.trim()).filter(Boolean);
  if (decl.length > 1) { declStats.routes_divided++; declStats.pieces += decl.length; }
  // v3 at display
  const runV3 = (holdDamagedWhole) => {
    const out = []; let damagedAny = false;
    for (const sense of packSplit(s)) { const rr = senseSplit(sense); if (rr.damaged) { damagedAny = true; if (holdDamagedWhole) out.push(...rr.readings); continue; } out.push(...rr.readings); }
    return out;
  };
  const norm = (a) => a.map((x) => x.replace(/^[\s-]+/u, "").trim());
  const kind = (vv, dd) => {
    if (vv.length === 0) return "v3_withholds";
    const nv = norm(vv), nd = norm(dd);
    if (nv.length === nd.length && nv.every((x, k) => x === nd[k])) return "same";
    if (nv.length > 1 && nd.length <= 1) return "v3_divides_decl_whole";
    if (nd.length > 1 && nv.length <= 1) return "decl_divides_v3_whole";
    return "divided_differently";
  };
  const v = runV3(false), vh = runV3(true);
  const k1 = kind(v, decl), k2 = kind(vh, decl);
  bump(v3, k1); bump(v3h, k2);
  if (k1 === "same" && (v.length !== decl.length || v.some((x, k) => x !== decl[k]))) v3.same_print_differently++;
  if (!v3ex[k1]) v3ex[k1] = []; if (k1 !== "same" && v3ex[k1].length < 400) v3ex[k1].push({ key: r.key, route: s.slice(0, 60), v3: v.map((x) => x.slice(0, 40)), decl: decl.map((x) => x.slice(0, 40)) });
}

// totals per mark
const totals = {}; for (const [m, o] of Object.entries(T)) if (typeof o === "object") totals[m] = Object.values(o).reduce((a, b) => a + b, 0);
const out = { rows: rows.length, defs: defsSeen.size, locate: { multi_occurrence_routes: locMulti, not_item_bounded: notBounded.length, not_item_bounded_keys: notBounded.slice(0, 20) }, openerSpelled, totals, shapes: T, unexplained, literalOverlap, routesWith, regionTallies, v3, v3_damaged_held_whole: v3h, declStats, examples: ex };
writeFileSync(OUT, JSON.stringify(out, null, 1));
writeFileSync(OUT.replace(/\.json$/u, ".keyed.json"), JSON.stringify({ keyed, v3ex }, null, 0));
console.log(JSON.stringify({ totals, shapes: T, unexplained, v3, v3h, declStats, openerSpelled, locate: out.locate }, null, 1));
