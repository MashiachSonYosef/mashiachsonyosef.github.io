// Counted counterexamples for the dividing shapes, by rule (route occurrences and distinct definitions).
import { readFileSync, writeFileSync } from "node:fs";
import { makeLocator, analyzeDef, parenInfo, isSpace } from "./lib.mjs";
const [, , SRC, OUT] = process.argv;
const rows = readFileSync(SRC, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const loc = makeLocator(); const cache = new Map();
const R = {}; const hit = (k, r, i, s, def, q) => { const o = (R[k] = R[k] || { route_occurrences: 0, routes: new Set(), defs: new Set(), ex: [] }); o.route_occurrences++; o.routes.add(r); o.defs.add(def); if (o.ex.length < 8) o.ex.push(`${s.key}: ${s.route.slice(Math.max(0, i - 30), i + 25)}`); };
const defDepth = (def, q) => { let d = 0; for (let k = 0; k < q; k++) { if (def[k] === "(") d++; else if (def[k] === ")" && d > 0) d--; } return d; };
const suffixLed = { n: 0, ex: [] };
rows.forEach((r, ri) => {
  const s = r.route, def = r.def; let A = cache.get(def); if (!A) { A = analyzeDef(def); cache.set(def, A); }
  const L = loc(r, A);
  const P = parenInfo(s); const reg = (i) => A.region(L.p + i); const headish = (g) => g === "head" || g === "no_opener";
  // routes led by a syllable that is not an opener tail
  { let j = 0; while (j < s.length && (isSpace(s[j]) || reg(j) === "opener")) j++; const t = s.slice(j); if (reg(j) === "list" && (/^-\p{L}/u.test(t) || /^\(\s*-/u.test(t))) { suffixLed.n++; if (suffixLed.ex.length < 6) suffixLed.ex.push(`${r.key}: ${t.slice(0, 25)}`); } }
  for (let i = 0; i < s.length; i++) {
    const c = s[i], g = reg(i), d = P.depth[i], q = L.p + i;
    if (P.inUnclosed[i]) continue;
    if (c === ";" && g === "list" && d === 0) {
      if (defDepth(def, q) >= 1) hit("semicolon.rendering_separator__inside_a_provider_aside_the_store_cut_open", r, i, r, def, q);
      if (/^ -\p{L}/u.test(def.slice(q + 1, q + 4))) hit("semicolon.rendering_separator__is_the_provider_opener_spelled_'; -'", r, i, r, def, q);
    }
    if (c === ";" && headish(g) && d === 0) {
      let k = q + 1; while (k < def.length && isSpace(def[k])) k++;
      if (A.op && k === A.op.start) continue;
      const right = def.slice(q + 1).split(";")[0].trim(); const left = def.slice(0, q).split(";").pop().trim();
      const variant = (x) => /^(or|also)\s+(\([^()]*\)\s*)?[a-z'`]+$/u.test(x);
      if (variant(right) || variant(left)) hit("semicolon.head_separator__separates_variant_spellings_of_the_headword", r, i, r, def, q);
      if (g === "no_opener" && /^[\s]*(X\s|\+\s|[a-z]+,)/u.test(def.slice(q + 1))) hit("semicolon.head_separator__right_side_is_a_KJV_rendering_list_(no-opener definition)", r, i, r, def, q);
    }
    if (c === "." && g === "list_end") {
      const after = def.slice(q + 1);
      const nextChunk = after.split(/(?<!\b(?:i|e))\.(?!\.)/u)[0];
      if (/^\p{L}{1,3}($|[^\p{L}])/u.test(after) && !/^\s/u.test(after)) hit("period.list_end__followed_by_a_transcription_fragment_not_a_note", r, i, r, def, q);
      else if (/^\s+[a-z][a-z' -]*$/u.test(nextChunk) && !/^\s+(i\.e|comp|see|prop)/iu.test(nextChunk)) hit("period.list_end__followed_by_a_lowercase_rendering_(stop_written_for_a_comma)", r, i, r, def, q);
      else if (/^\s+[A-Z][a-z]+$/u.test(nextChunk) && /^\s+[A-Z][a-z]+\.\s*$/u.test(after)) hit("period.list_end__followed_by_one_capitalized_word_then_end", r, i, r, def, q);
    }
  }
});
const out = { suffix_led_list_routes: suffixLed, counterexamples: Object.fromEntries(Object.entries(R).map(([k, v]) => [k, { route_occurrences: v.route_occurrences, routes: v.routes.size, definitions: v.defs.size, ex: v.ex }])) };
writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
