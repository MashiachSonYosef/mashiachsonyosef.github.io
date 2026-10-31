// Items (depth-0 ';' pieces of a definition) that are a route nowhere on their key.
// Usage: node unrouted-items.mjs <by-source/hiperbiblia_sdbh.jsonl>
import fs from "node:fs";
const rows = fs.readFileSync(process.argv[2], "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const byKey = new Map(); for (const r of rows) { if (!byKey.has(r.key)) byKey.set(r.key, new Set()); byKey.get(r.key).add(r.route.trim()); }
const recs = new Map(); for (const r of rows) recs.set(r.key + "\u0000" + r.def, r);
const d0 = (s) => { let d = 0, st = 0; const o = []; for (let i = 0; i < s.length; i++) { const c = s[i]; if (c === "(") d++; else if (c === ")") d--; else if (c === ";" && d === 0) { o.push(s.slice(st, i)); st = i + 1; } } o.push(s.slice(st)); return o.map((x) => x.trim()); };
const miss = []; let dupWithin = 0;
for (const r of recs.values()) { const it = d0(r.def); dupWithin += it.length - new Set(it).size; for (const x of it) if (!byKey.get(r.key).has(x)) miss.push(r.key + ": " + (x.length > 40 ? x.slice(0, 37) + "..." : x)); }
console.log(JSON.stringify({ unrouted_items: miss.length, duplicate_items_within_a_record: dupWithin, list: miss }));
