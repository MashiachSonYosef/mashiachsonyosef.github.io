// node falsify.mjs → falsify.out.json : members of every dividing shape, and probes that try to falsify meanings.
import { writeFileSync } from "node:fs";
import { load, classifyAll, context, wordsOutsideParens } from "./lib.mjs";
const OPTS = { amend: true, closedRestTo: "clause", labelPossible: false };
const rows = load();
const w = (s, i, n = 27) => (i > n ? "…" : "") + s.slice(Math.max(0, i - n), i + n).replace(/\s+/g, " ") + (i + n < s.length ? "…" : "");
const routesByKey = new Map();
for (const r of rows) { if (!routesByKey.has(r.key)) routesByKey.set(r.key, new Set()); routesByKey.get(r.key).add(r.route.trim().toLowerCase()); }
const isRouteOnKey = (key, piece) => routesByKey.get(key).has(String(piece).trim().toLowerCase());

const DIVIDING = ["semicolon.before_alternative_label", "comma.short_route_packed_renderings_elliptic", "comma.short_route_packed_renderings_complete", "comma.short_route_name_variant", "comma.before_alternative_label", "exclamation.between_interjections"];
const members = Object.fromEntries(DIVIDING.map((d) => [d, []]));
const probes = {};
const P = (name, item) => { (probes[name] ||= { count: 0, examples: [] }).count += 1; if (probes[name].examples.length < 40) probes[name].examples.push(item); };

for (const r of rows) {
  const s = r.route; const ctx = context(s);
  const cls = classifyAll(s, OPTS);
  for (const x of cls) {
    const sh = x.hits[0];
    if (members[sh]) {
      // the depth-0 pieces either side of this mark (for , and ;) and whether the provider writes them as routes on the key
      const mk = x.mark === "!" ? "!" : x.mark;
      let a = x.i - 1; while (a >= 0 && !(s[a] === mk && ctx.depth[a] === 0)) a -= 1;
      let z = x.i + 1; while (z < s.length && !(s[z] === mk && ctx.depth[z] === 0)) z += 1;
      const left = s.slice(a + 1, x.i).trim(), right = s.slice(x.i + 1, z).trim();
      members[sh].push({ key: r.key, at: w(s, x.i), left_is_route: isRouteOnKey(r.key, left), right_is_route: isRouteOnKey(r.key, right) });
    }
    // N2: hedged semicolon with no hedge in its head
    if (sh === "semicolon.before_hedged_meaning") {
      let a = x.i - 1; while (a >= 0 && !(s[a] === ";" && ctx.depth[a] === 0)) a -= 1;
      const head = s.slice(a + 1, x.i);
      if (!/(unsure|unknown|unkown|uncertain|unclear|not clear|obscure|doubtful|disputed|debated|meaning)/iu.test(head)) {
        P("N2 semicolon.before_hedged_meaning whose head says nothing of unsure meaning", `${r.key}: ${w(s, x.i)}`);
        if (/^\s*(possibly|probably|perhaps)\s*:\s*=/iu.test(s.slice(x.i + 1)) && /^(literally|literaly)/iu.test(head.trim()) === false && /[◄►≈]/u.test(head) === false)
          P("N2b ... and the hedge opens a full '= definition' after a head that is itself a definition", `${r.key}: ${w(s, x.i)}`);
      }
    }
    if (sh === "semicolon.before_or_clause") P("N3 semicolon.before_or_clause (all)", `${r.key}: ${w(s, x.i)}`);
    // N4: head_to_further_clause where both sides are gloss-sized (≤4 words) with no label
    if (sh === "semicolon.head_to_further_clause" || sh === "semicolon.between_note_items") {
      let a = x.i - 1; while (a >= 0 && !(s[a] === ";" && ctx.depth[a] === 0)) a -= 1;
      let z = x.i + 1; while (z < s.length && !(s[z] === ";" && ctx.depth[z] === 0)) z += 1;
      const L = s.slice(a + 1, x.i).trim(), R = s.slice(x.i + 1, z).trim();
      if (sh === "semicolon.head_to_further_clause" && wordsOutsideParens(L).length <= 4 && wordsOutsideParens(R).length <= 4 && !/[◄►≈:=]/u.test(L + R))
        P("N4 semicolon.head_to_further_clause with both sides gloss-sized", `${r.key}: ${w(s, x.i)}`);
      if (isRouteOnKey(r.key, L) || isRouteOnKey(r.key, R)) P(`N7 ${sh}: a piece beside it is also a route on the key`, `${r.key}: ${w(s, x.i)}`);
    }
    // N1: commas packing renderings inside a 'literally:' segment of a definition route
    if (x.mark === "," && ctx.depth[x.i] === 0 && sh === "comma.definition_prose") {
      const pre = s.slice(0, x.i);
      const m = pre.match(/(literally|literaly|literallly|litterally|liteallly)\s*[:,]\s*([^;:=◄►≈]*)$/iu);
      if (m) {
        // the literal segment runs to the next ; : = or label 'hence'
        const restM = s.slice(x.i + 1).match(/^([^;:=◄►≈]*?)(?=\s*(;|:|=|◄|►|≈|,?\s*hence\b|,?\s*therefore\b|$))/iu);
        const seg = (m[2] + "," + (restM ? restM[1] : "")).split(",").map((p) => p.trim()).filter(Boolean);
        if (seg.length >= 2 && seg.every((p) => wordsOutsideParens(p).length <= 4)) P("N1 comma.definition_prose packing renderings inside a 'literally:' segment (every piece ≤4 words)", `${r.key}: ${w(s, x.i)}`);
      }
    }
    // N5: short-route appositive whose two pieces are each also a gloss elsewhere in the provider, or read as synonyms
    if (sh === "comma.short_route_appositive" && /^\s*in the past/u.test(s.slice(x.i + 1))) P("N5 comma.short_route_appositive between two renderings of one sense", `${r.key}: ${w(s, x.i)}`);
    if ((sh === "comma.short_route_appositive" || sh === "comma.short_route_coordinate_modifiers" || sh === "comma.series_item" || sh === "comma.definition_prose") && ctx.depth[x.i] === 0) {
      let a = x.i - 1; while (a >= 0 && !(s[a] === "," && ctx.depth[a] === 0) && s[a] !== ";") a -= 1;
      let z = x.i + 1; while (z < s.length && !(s[z] === "," && ctx.depth[z] === 0) && s[z] !== ";") z += 1;
      const L = s.slice(a + 1, x.i).trim(), R = s.slice(x.i + 1, z).trim();
      if (isRouteOnKey(r.key, L) || isRouteOnKey(r.key, R)) P(`N7 ${sh}: a comma piece beside it is also a route on the key`, `${r.key}: ${w(s, x.i)}`);
    }
    // N6: '>' on a key that also carries a 'literally:' definition route
    if (sh === "gt.literal_to_figurative") {
      const lit = [...routesByKey.get(r.key)].some((t) => /^(literally|literaly)\s*:/iu.test(t) || /;\s*(literally|literaly)\s*:/iu.test(t));
      P(lit ? "N6 '>' on a key with a 'literally:' definition route" : "N6 '>' on a key with no 'literally:' definition route", `${r.key}: ${w(s, x.i)}`);
    }
    if (sh === "slash.word_pair") P("N8 slash.word_pair (all)", `${r.key}: ${w(s, x.i, 20)}`);
  }
}
const out = { opts: OPTS, members: Object.fromEntries(Object.entries(members).map(([k, v]) => [k, { count: v.length, all: v }])), probes };
writeFileSync(new URL("./falsify.out.json", import.meta.url), JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out.members)) { console.log("##", k, v.count); for (const m of v.all) console.log("  ", m.key, "|", m.at, "| L-route", m.left_is_route, "R-route", m.right_is_route); }
for (const [k, v] of Object.entries(probes)) console.log("##", k, v.count, "\n   " + v.examples.slice(0, 14).join("\n   "));
