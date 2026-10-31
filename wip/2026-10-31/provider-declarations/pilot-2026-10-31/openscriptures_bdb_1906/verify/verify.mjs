// Independent verifier for the openscriptures_bdb_1906 (M5) drafted declaration.
// Written from the shape TESTS as stated in words; does not import or read the draft's ledger.mjs.
// usage: node verify.mjs <by-source jsonl> <mark-inventory json> <sense-split-v1.mjs> <outdir>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [,, SRC, INV, V3, OUT] = process.argv;
const { senseSplit: v3Split } = await import(pathToFileURL(path.resolve(V3)).href);

const rows = fs.readFileSync(SRC, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const isL = (c) => c !== undefined && /\p{L}/u.test(c);
const isM = (c) => c !== undefined && /\p{M}/u.test(c);
const isMark = (c) => !/[\p{L}\p{N}\s]/u.test(c);
const isHebLetter = (c) => c !== undefined && /[א-ת]/u.test(c);

const CLAUSE = ["I","me","my","mine","thee","thou","thy","thine","he","him","his","himself","she","her","it","its","we","us","our","ye","you","your","they","them","their","who","whom","whose","doth","hath","didst","dost","shalt","wilt","shall","will","let","pray","yea","oh","were","was","is","are"];
const CLAUSE_LC = new Set(CLAUSE.map((w) => w.toLowerCase()));
const HEADS = new Set(["be","become","to","make","one","that","a","an","the"]);
const ABBREV = new Set(["fr","id","instr","obj","covt","Isr","mt","mts","D"]);

// depth of parentheses at each index (depth BEFORE processing char i, i.e. the depth the char sits at; '(' sits at outer depth)
const depthAt = (s) => { const d = []; let k = 0; for (let i = 0; i < s.length; i++) { d.push(k); if (s[i] === "(") k++; else if (s[i] === ")") k = Math.max(0, k - 1); } return d; };

// senses: split at depth-zero ';'
const sensesOf = (s, D) => { const out = []; let st = 0; for (let i = 0; i < s.length; i++) if (s[i] === ";" && D[i] === 0) { out.push([st, i]); st = i + 1; } out.push([st, s.length]); return out; };
const commaPieces = (s, D, a, b) => { const out = []; let st = a; for (let i = a; i < b; i++) if (s[i] === "," && D[i] === 0) { out.push(s.slice(st, i)); st = i + 1; } out.push(s.slice(st, b)); return out; };
const words = (t) => t.trim().split(/\s+/u).filter(Boolean);
const letterTokens = (t) => t.match(/\p{L}+/gu) || [];
const capWord = (w) => { const m = w.match(/\p{L}/u); return m ? m[0] !== m[0].toLowerCase() && m[0] === m[0].toUpperCase() : false; };

// variants for sensitivity: which reading of the ambiguous words in the in_sentence test
const VARIANT = { opensCapital: "sense" };
const senseSentenceShaped = (sense, pieces, why) => {
  const toks = letterTokens(sense);
  const cw = toks.find((t) => CLAUSE_LC.has(t.toLowerCase()));
  if (cw) { why.push("clause:" + cw); }
  if (pieces.some((p) => (words(p)[0] || "").toLowerCase() === "and")) why.push("piece_opens_and");
  const t = sense.trim();
  if (capWord(t.charAt(0)) ) why.push("opens_capital");
  if (pieces.some((p) => words(p).slice(1).some(capWord))) why.push("cap_after_first");
  return why.length > 0;
};

const shapeOf = {}; // mark -> shape -> {count, routes:Set, ex:[]}
const multi = {};   // overlaps among unordered tests
const unexplained = [];
const markTotals = {};
const markRoutes = {};
const commaRouteInfo = []; // per route with commas
const add = (mark, shape, r, i) => {
  ((shapeOf[mark] ??= {})[shape] ??= { count: 0, routes: new Set(), ex: [] });
  const o = shapeOf[mark][shape]; o.count++; o.routes.add(r._i);
  if (o.ex.length < 400) o.ex.push({ key: r.key, route: r.route, i });
};

rows.forEach((r, ri) => {
  r._i = ri;
  const s = r.route; const D = depthAt(s);
  const cps = [...s]; // iterate by code unit index but handle astral? check
  // senses & comma classification precomputed
  const senses = sensesOf(s, D);
  const commaShape = new Map();
  for (const [a, b] of senses) {
    const sense = s.slice(a, b);
    const idx = []; for (let i = a; i < b; i++) if (s[i] === ",") idx.push(i);
    if (!idx.length) continue;
    const pieces = commaPieces(s, D, a, b).map((p) => p.trim());
    const why = [];
    const sentence = senseSentenceShaped(sense, pieces, why);
    const fp = words(pieces[0] || "");
    const headCond = fp.length >= 2 && HEADS.has(fp[0]) && pieces.slice(1).some((p) => words(p)[0] !== fp[0]);
    let pieceNo = 0;
    for (const i of idx) {
      pieceNo++;
      const after = s.slice(i + 1);
      const next = D[i] === 0 ? pieces[pieceNo] : undefined;
      let sh;
      if (i === s.length - 1) sh = "comma.trailing";
      else if (!/\s/u.test(s[i + 1])) sh = "comma.no_space_after";
      else if (sentence) sh = "comma.in_sentence";
      else if (next !== undefined && next.startsWith("-")) sh = "comma.before_bound_suffix";
      else if (next !== undefined && /['’]$/u.test(next)) sh = "comma.before_open_possessive";
      else if (D[i] === 0 && /\s/u.test(s[i + 1]) && headCond) sh = "comma.between_glosses_after_head_word";
      else if (D[i] === 0 && /\s/u.test(s[i + 1])) sh = "comma.between_glosses";
      else sh = null;
      commaShape.set(i, { sh, why: why.join("+") });
    }
    commaRouteInfo.push({ r, sense, a, b, pieces, sentence, why: why.join("+"), headCond });
  }
  // paren openers
  const parenStack = []; const openerShape = new Map();
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (!isMark(c)) continue;
    markTotals[c] = (markTotals[c] || 0) + 1; (markRoutes[c] ??= new Set()).add(ri);
    const prev = s[i - 1], nxt = s[i + 1];
    let sh = null; const tests = [];
    switch (c) {
      case "-": {
        if ((isL(prev) || prev === ")") && isL(nxt)) tests.push("hyphen.compound_join");
        if (isL(prev) && i === s.length - 1) tests.push("hyphen.suspended_first_part");
        if ((i === 0 || prev === " ") && isL(nxt)) tests.push("hyphen.bound_second_part");
        break; }
      case ",": { const cs = commaShape.get(i); if (cs && cs.sh) tests.push(cs.sh); break; }
      case "!": if (i === s.length - 1) tests.push("exclamation.final"); break;
      case "’": {
        const poss = isL(prev) && nxt === "s" && !isL(s[i + 2]);
        if (poss) tests.push("apostrophe_curly.possessive");
        else if (i === s.length - 1 && s.slice(0, i).includes("‘")) tests.push("apostrophe_curly.closing_quote");
        else if (isL(nxt)) tests.push("apostrophe_curly.aleph_sign");
        break; }
      case "?":
        if (i === s.length - 1) tests.push("question.final");
        if (nxt === " " && s.slice(i + 1).trim().length > 0) tests.push("question.before_second_question");
        break;
      case "'":
        if (isL(prev) && nxt === "s" && !isL(s[i + 2])) tests.push("apostrophe.possessive_singular");
        else if (prev === "s" && !isL(nxt)) tests.push("apostrophe.possessive_plural");
        break;
      case ".": {
        // run of three
        let a = i; while (s[a - 1] === ".") a--; let b = i; while (s[b + 1] === ".") b++;
        const run = b - a + 1;
        const wm = s.slice(0, a).match(/(\p{L}+)$/u); const w = wm ? wm[1] : null;
        if (run === 3) tests.push("period.ellipsis_ascii");
        else if (w && ABBREV.has(w)) tests.push("period.abbreviation");
        else if (w && i === s.length - 1) tests.push("period.final");
        else if (w && nxt === " " && s.slice(i + 1).trim().length) tests.push("period.mid_after_word");
        break; }
      case "(": {
        let os = null;
        const content = s.slice(i + 1);
        if (isL(prev)) os = "paren.optional_letters";
        else if (i === 0 || prev === " ") { const f = content.match(/\p{L}/u); const fc = content.charAt(0);
          if (isL(fc) && fc === fc.toUpperCase() && fc !== fc.toLowerCase()) os = "paren.label";
          else if (isL(fc) && fc === fc.toLowerCase()) os = "paren.supplied_word"; }
        parenStack.push(os); if (os) tests.push(os); break; }
      case ")": { const o = parenStack.pop(); if (o) tests.push(o.replace("paren.", "paren_close.")); break; }
      case "‛": if (isL(prev) || isL(nxt)) tests.push("ayin_sign.in_transliteration"); break;
      case "…": if (prev === " ") tests.push("ellipsis.gap_in_phrase"); break;
      case "&": if (prev === " " && nxt === " ") tests.push("ampersand.and_inside_gloss"); break;
      case "‘": if (i === 0 && s.endsWith("’")) tests.push("quote_open.quoted_rendering"); break;
      case "̌": if (isL(prev) || isM(prev)) tests.push("caron.on_transliterated_vowel"); break;
      case "׳": if (isHebLetter(prev)) tests.push("geresh.divine_name_abbreviation"); break;
      case ";": if (D[i] === 0 && nxt === " ") tests.push("semicolon.between_senses"); break;
    }
    if (tests.length > 1) { const k = c + ":" + tests.join("|"); multi[k] = (multi[k] || 0) + 1; }
    if (!tests.length) unexplained.push({ mark: c, key: r.key, route: s.slice(Math.max(0, i - 25), i + 25), i });
    else add(c, tests[0], r, i);
  }
});

// ---- declaration division ----
const dividing = new Set(["comma.between_glosses", "comma.between_glosses_after_head_word"]);
const declReadings = (s) => {
  const D = depthAt(s);
  // semicolons: divide only at semicolon.between_senses
  const cut = []; for (let i = 0; i < s.length; i++) if (s[i] === ";" && D[i] === 0 && s[i + 1] === " ") cut.push(i);
  const senses = []; let st = 0; for (const i of cut) { senses.push([st, i]); st = i + 1; } senses.push([st, s.length]);
  const out = [];
  for (const [a, b] of senses) {
    const sense = s.slice(a, b);
    const commas = []; for (let i = a; i < b; i++) if (s[i] === ",") commas.push(i);
    if (!commas.length) { out.push(sense.trim()); continue; }
    // classify these commas (same classifier as above, recomputed on the sense)
    const pieces = commaPieces(s, D, a, b).map((p) => p.trim());
    const why = [];
    const sentence = senseSentenceShaped(sense, pieces, why);
    const fp = words(pieces[0] || "");
    const headCond = fp.length >= 2 && HEADS.has(fp[0]) && pieces.slice(1).some((p) => words(p)[0] !== fp[0]);
    let ok = true, n = 0;
    for (const i of commas) {
      n++; const next = D[i] === 0 ? pieces[n] : undefined;
      let sh;
      if (i === s.length - 1) sh = "comma.trailing";
      else if (!/\s/u.test(s[i + 1])) sh = "comma.no_space_after";
      else if (sentence) sh = "comma.in_sentence";
      else if (next !== undefined && next.startsWith("-")) sh = "comma.before_bound_suffix";
      else if (next !== undefined && /['’]$/u.test(next)) sh = "comma.before_open_possessive";
      else if (D[i] === 0 && headCond) sh = "comma.between_glosses_after_head_word";
      else if (D[i] === 0) sh = "comma.between_glosses";
      if (!dividing.has(sh)) ok = false;
    }
    if (!ok) { out.push(sense.trim()); continue; }
    const raw = commaPieces(s, D, a, b);
    if (raw.join(",") !== sense) { out.push(sense.trim()); continue; }
    out.push(...raw.map((p) => p.trim()));
  }
  // rejoin check over the route
  return out.filter(Boolean);
};
const engineSemi = (t) => { const out = []; let st = 0, d = 0; for (let i = 0; i < t.length; i++) { const c = t[i]; if (c === "(") d++; else if (c === ")") { if (d > 0) d--; } else if (c === ";" && d === 0) { out.push(t.slice(st, i)); st = i + 1; } } out.push(t.slice(st)); if (out.join(";") !== t) return [t.trim()].filter(Boolean); return out.map((x) => x.trim()).filter(Boolean); };
const v3Readings = (t) => engineSemi(t).flatMap((sense) => { const r = v3Split(sense); return r.damaged ? [sense] : r.readings; });
const v3ReadingsEngine = (t) => engineSemi(t).flatMap((sense) => { const r = v3Split(sense); if (r.damaged) return [sense]; const k = r.readings.filter((p) => !/^p{1,2}\.\s*\d/u.test(p)); return k.length ? k : r.readings; });

const cmp = { fields_compared: 0, same_division: 0, v3_divides_where_declaration_keeps_whole: 0, declaration_divides_where_v3_keeps_whole: 0, divided_differently: 0, both_whole_v3_other_text: 0 };
const cmpEx = {}; let engineFilterDiffers = 0;
for (const r of rows) {
  cmp.fields_compared++;
  const d = declReadings(r.route), v = v3Readings(r.route);
  if (JSON.stringify(v) !== JSON.stringify(v3ReadingsEngine(r.route))) engineFilterDiffers++;
  let k;
  if (JSON.stringify(d) === JSON.stringify(v)) k = "same_division";
  else if (d.length <= 1 && v.length > 1) k = "v3_divides_where_declaration_keeps_whole";
  else if (d.length > 1 && v.length <= 1) k = "declaration_divides_where_v3_keeps_whole";
  else if (d.length > 1 && v.length > 1) k = "divided_differently";
  else k = "both_whole_v3_other_text";
  cmp[k]++;
  if (k !== "same_division") (cmpEx[k] ??= []).push({ key: r.key, route: r.route.slice(0, 60), decl: d, v3: v });
}

// ---- reconcile with inventory ----
const inv = JSON.parse(fs.readFileSync(INV, "utf8"));
const ip = inv.providers.find((p) => p.provider === "M5");
const invCmp = ip.marks.map((m) => ({ mark: m.mark, inv_occ: m.occurrences, inv_routes: m.routes_carrying_it, mine_occ: markTotals[m.mark] || 0, mine_routes: markRoutes[m.mark]?.size || 0 }));
const extra = Object.keys(markTotals).filter((m) => !ip.marks.some((x) => x.mark === m));

const shapes = {};
for (const [m, o] of Object.entries(shapeOf)) for (const [sh, v] of Object.entries(o)) shapes[sh] = { mark: m, count: v.count, routes: v.routes.size };
const result = { rows: rows.length, marks: Object.keys(markTotals).length, occurrences: Object.values(markTotals).reduce((a, b) => a + b, 0), invCmp, extra, shapes, overlaps_unordered: multi, unexplained, cmp, engineFilterDiffers };
fs.writeFileSync(path.join(OUT, "result.json"), JSON.stringify(result, null, 1));
fs.writeFileSync(path.join(OUT, "cmp-examples.json"), JSON.stringify(cmpEx, null, 1));
// dump dividing-shape occurrences for falsification
const div = {};
for (const sh of ["comma.between_glosses", "comma.between_glosses_after_head_word"]) div[sh] = shapeOf[","][sh].ex;
div["semicolon.between_senses"] = shapeOf[";"]["semicolon.between_senses"].ex;
fs.writeFileSync(path.join(OUT, "dividing-occurrences.json"), JSON.stringify(div));
fs.writeFileSync(path.join(OUT, "sentence-senses.json"), JSON.stringify(commaRouteInfo.filter((x) => x.sentence).map((x) => ({ key: x.r.key, sense: x.sense.slice(0, 60), why: x.why }))));
console.log(JSON.stringify({ rows: result.rows, marks: result.marks, occurrences: result.occurrences, extra, invMismatch: invCmp.filter((x) => x.inv_occ !== x.mine_occ || x.inv_routes !== x.mine_routes), shapes, overlaps: multi, unexplained, cmp, engineFilterDiffers }, null, 0));
