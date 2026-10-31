// Re-derives the declared_from region counts and the open-question counts (B01, B02) independently.
// usage: node regions.mjs <by-source jsonl> <sense-split-v1.mjs> <outdir>
import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
const [,, SRC, V3, OUT] = process.argv;
const { senseSplit } = await import(pathToFileURL(path.resolve(V3)).href);
const rows = fs.readFileSync(SRC, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const div = JSON.parse(fs.readFileSync(path.join(OUT, "dividing-occurrences.json"), "utf8"));
const regionOf = (r) => {
  if (r.def === r.route || r.def.trim() === r.route.trim()) return "whole";
  const at = r.def.indexOf(r.route); if (at < 0) return "absent";
  let p = 0, b = 0; for (let i = 0; i < at; i++) { const c = r.def[i]; if (c === "(") p++; else if (c === ")") p = Math.max(0, p - 1); else if (c === "[") b++; else if (c === "]") b = Math.max(0, b - 1); }
  return p > 0 ? "def_parentheses" : b > 0 ? "def_brackets" : "def_top";
};
const reg = {}; const keys = new Set(); const defs = new Set();
const regByKR = new Map();
for (const r of rows) { const g = regionOf(r); reg[g] = (reg[g] || 0) + 1; keys.add(r.key); defs.add(r.def); regByKR.set(r.key + "\u0001" + r.route, g); }
const engineSemi = (t) => { const out = []; let st = 0, d = 0; for (let i = 0; i < t.length; i++) { const c = t[i]; if (c === "(") d++; else if (c === ")") { if (d > 0) d--; } else if (c === ";" && d === 0) { out.push(t.slice(st, i)); st = i + 1; } } out.push(t.slice(st)); return out.map((x) => x.trim()).filter(Boolean); };
const v3 = (t) => engineSemi(t).flatMap((s) => { const r = senseSplit(s); return r.damaged ? [s] : r.readings; });
const naive = (t) => engineSemi(t).flatMap((s) => s.split(",").map((x) => x.trim()).filter(Boolean));
const uniq = (sh) => [...new Set(div[sh].map((e) => e.key + "\u0001" + e.route))];
const bg = uniq("comma.between_glosses"), hw = uniq("comma.between_glosses_after_head_word");
const union = [...new Set([...bg, ...hw])];
const byRegion = (l) => { const o = {}; for (const k of l) { const g = regByKR.get(k); o[g] = (o[g] || 0) + 1; } return o; };
const occByRegion = (sh) => { const o = {}; for (const e of div[sh]) { const g = regByKR.get(e.key + "\u0001" + e.route); o[g] = (o[g] || 0) + 1; } return o; };
const sameAsV3 = (l) => l.filter((k) => { const t = k.split("\u0001")[1]; return JSON.stringify(v3(t)) === JSON.stringify(naive(t)); }).length;
const inParens = union.filter((k) => regByKR.get(k) === "def_parentheses");
const res = { routes: rows.length, keys: keys.size, distinct_defs: defs.size, regions: reg,
  dividing_routes_union: union.length, between_routes: bg.length, head_routes: hw.length, both_shapes: bg.filter((k) => hw.includes(k)).length,
  dividing_union_by_region: byRegion(union), between_occ_by_region: occByRegion("comma.between_glosses"), head_occ_by_region: occByRegion("comma.between_glosses_after_head_word"),
  B01_head_routes_v3_same_division: sameAsV3(hw) + " of " + hw.length,
  B02_paren_routes: inParens.length, B02_v3_same_division: sameAsV3(inParens) + " of " + inParens.length };
fs.writeFileSync(path.join(OUT, "regions.json"), JSON.stringify(res, null, 1));
console.log(JSON.stringify(res));
