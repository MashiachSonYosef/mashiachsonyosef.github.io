// Read-only: from each family's reservoir of placings (uniform over word x reading), a seeded shuffle, then the first 60
// whose (block letters, reading) pair has not been taken yet. Writes samples.json (all families) for the browser pass.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
let seed = 39; const rnd = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const out = [];
for (const f of readdirSync(".").filter((x) => /^reservoir-.*\.jsonl$/u.test(x)).sort()) {
  const rows = readFileSync(f, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  for (let i = rows.length - 1; i > 0; i -= 1) { const j = Math.floor(rnd() * (i + 1)); [rows[i], rows[j]] = [rows[j], rows[i]]; }
  const seen = new Set(), pick = [];
  for (const r of rows) { const k = `${r.block}\u0001${r.rk}`; if (seen.has(k)) continue; seen.add(k); pick.push(r); if (pick.length === 60) break; }
  pick.forEach((r, i) => { r.i = i + 1; });
  out.push(...pick);
  console.log(f, rows.length, "->", pick.length, "books", new Set(pick.map((r) => r.book)).size, "piece", pick.filter((r) => r.block_kind === "core piece").length);
}
writeFileSync("samples.json", JSON.stringify(out));
