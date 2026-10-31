// node probe2.mjs : context probes for the dividing shapes and the unlabeled alternatives
import { load, classifyAll, context } from "./lib.mjs";
const OPTS = { amend: true, closedRestTo: "clause", labelPossible: false };
const rows = load();
const w = (s, i, n = 27) => (i > n ? "…" : "") + s.slice(Math.max(0, i - n), i + n).replace(/\s+/g, " ") + (i + n < s.length ? "…" : "");
const short = (t) => (t.length > 58 ? t.slice(0, 57) + "…" : t);
const out = { interj_key_routes: {}, either_first: [], or_clause: [], literal_packing: { count: 0, by: {}, examples: [] }, semicolon_piece_is_route: { cs: 0, ci: 0, ex: [] } };
const byKey = new Map(); for (const r of rows) { if (!byKey.has(r.key)) byKey.set(r.key, []); byKey.get(r.key).push(r.route.trim()); }
for (const k of ["אח", "יהב"]) out.interj_key_routes[k] = byKey.get(k).filter((t) => /alas|brother|come|hey|ah\b|woe/iu.test(t)).map(short);
const words = (t) => t.replace(/\([^()]*\)/g, " ").trim().split(/\s+/).filter(Boolean);
const FUNC = new Set(["of", "in", "to", "from", "for", "with", "by", "on", "at", "a", "an", "the"]);
const APPOS = /^(son|daughter|wife|father|tribe|territory|town|a|an|the|also|better|later|used|related|from|with|which|who|in|of|oldest|suitable|probably|possibly|destroyed|selectively|lined|if|sometimes|capable|only|often|usually|especially|esp|i\.e|e\.g|but|and|or|either|whether|including|such|as|etc)\b/iu;
for (const r of rows) {
  const s = r.route; const ctx = context(s);
  for (const x of classifyAll(s, OPTS)) {
    const sh = x.hits[0];
    if (sh === "semicolon.before_alternative_label") {
      let a = x.i - 1; while (a >= 0 && !(s[a] === ";" && ctx.depth[a] === 0)) a -= 1;
      const head = s.slice(a + 1, x.i);
      if (/^\s*either\s*:/iu.test(s.slice(x.i + 1))) out.either_first.push({ key: r.key, at: w(s, x.i), head_has_definition_equals: /=/.test(head), head: short(head.trim()), later_or_label: /;\s*or\b/iu.test(s.slice(x.i + 1)) });
    }
    if (sh === "semicolon.before_or_clause") out.or_clause.push({ key: r.key, after: short(s.slice(x.i + 1).trim()), unlabeled_alternative_cue: /^\s*(or|either)\s*(possibly|perhaps|probably|,)/iu.test(s.slice(x.i + 1)) });
    // literal-segment packing judged by the draft's own short-route tests (complete or elliptic, minus its appositive words)
    if (x.mark === "," && sh === "comma.definition_prose" && ctx.depth[x.i] === 0) {
      const pre = s.slice(0, x.i);
      const m = pre.match(/(literally|literaly|literallly|litterally|liteallly)\s*[:,]\s*([^;:=◄►≈,]*)$/iu);
      if (!m) continue;
      const rest = s.slice(x.i + 1).match(/^([^;:=◄►≈]*?)(?=\s*(;|:|=|◄|►|≈|,?\s*hence\b|,?\s*therefore\b|$))/iu);
      if (!rest) continue;
      const pieces = [m[2], ...rest[1].split(",")].map((p) => p.trim()).filter(Boolean);
      if (pieces.length < 2 || !pieces.every((p) => words(p).length <= 4)) continue;
      const nxt = rest[1].trim();
      if (APPOS.test(nxt)) continue; // the draft's own appositive reading would hold it
      const allTo = pieces.every((p) => /^to\s/u.test(p) && words(p).length >= 2);
      const small = pieces.every((p) => !/^to\s/u.test(p)) && pieces.every((p) => words(p).length <= 2 && !words(p).some((q) => FUNC.has(q.toLowerCase())));
      const kind = allTo || small ? "complete" : "elliptic_or_other";
      out.literal_packing.count += 1; out.literal_packing.by[kind] = (out.literal_packing.by[kind] || 0) + 1;
      if (out.literal_packing.examples.length < 40) out.literal_packing.examples.push(`${kind} ${r.key}: ${w(s, x.i)}`);
    }
  }
  // the draft's ';' falsifier: a piece beside a ';' (not an alternative label) the provider also writes as a route on the key
  const parts = []; let st = 0; for (let i = 0; i < s.length; i += 1) if (s[i] === ";" && ctx.depth[i] === 0) { parts.push([st, i]); st = i + 1; } parts.push([st, s.length]);
  for (let k = 0; k + 1 < parts.length; k += 1) {
    const semi = parts[k][1]; const after = s.slice(semi + 1);
    if (/^\s*(or:|either:|alternatively|or \(2\))/iu.test(after)) continue;
    const L = s.slice(parts[k][0], parts[k][1]).trim(), R = s.slice(parts[k + 1][0], parts[k + 1][1]).trim();
    const set = byKey.get(r.key);
    const cs = set.includes(L) || set.includes(R);
    const ci = set.some((t) => t.toLowerCase() === L.toLowerCase() || t.toLowerCase() === R.toLowerCase());
    if (cs) out.semicolon_piece_is_route.cs += 1; if (ci) { out.semicolon_piece_is_route.ci += 1; if (out.semicolon_piece_is_route.ex.length < 30) out.semicolon_piece_is_route.ex.push(`${r.key}: ${w(s, semi)}`); }
  }
}
console.log(JSON.stringify(out, null, 1));
