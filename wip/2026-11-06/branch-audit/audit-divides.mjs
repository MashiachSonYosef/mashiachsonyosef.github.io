// Data-level audit of the division step: for every branch answered "divides", the branch's
// question, the option's "means" prose, and a sample of distinct served rows it reaches with
// the pieces row[7] cuts them into. Read-only.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { gunzipSync } from "node:zlib";

const K3 = process.argv[2];
const OUT = process.argv[3];
const CAP = Number(process.argv[4] || 14);
const LEDGERS = join(K3, "data", "ledgers-v1");
const manifest = JSON.parse(readFileSync(join(LEDGERS, "manifest.json"), "utf8"));
const answers = JSON.parse(readFileSync(join(K3, "data", "ledger-branch-answers-v1.json"), "utf8"));
const ledgers = new Map();
for (const [key, L] of Object.entries(manifest.ledgers)) {
  const decl = JSON.parse(readFileSync(join(K3, L.declaration.file), "utf8"));
  const shapes = new Map((decl.shapes || []).map((s) => [s.id, { ...s }]));
  const branches = {};
  for (const b of decl.branches || []) {
    const a = ((answers.answers || {})[key] || {})[b.id] || null;
    const option = a ? a.option : b.resting;
    if (option === "divides") for (const id of b.shapes || []) shapes.get(id).dividesBy = `${key}:${b.id}`;
    branches[b.id] = { option, resting: b.resting, decl: b, shapes: b.shapes || [] };
  }
  const { classify } = await import(pathToFileURL(resolve(join(K3, L.classifier.file))).href);
  ledgers.set(key, { key, decl, shapes, branches, classify });
}
const STORE = join(K3, "data", "route-store");
const index = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));
const keyOfM = (m) => (index.m_sources[m] || {}).key || null;
const samples = new Map();
const counts = {};
const declaredDivides = new Map(); // shapes that divide by declaration (no branch)
const piecesAt = (text, cuts) => { const p = []; let from = 0; for (const i of cuts) { p.push(text.slice(from, i)); from = i + 1; } p.push(text.slice(from)); return p.map((x) => x.trim()).filter(Boolean); };
for (const f of readdirSync(join(STORE, "shards")).filter((x) => x.endsWith(".bin")).sort()) {
  const body = JSON.parse(gunzipSync(readFileSync(join(STORE, "shards", f))).toString("utf8"));
  for (const [k, rows] of Object.entries(body)) for (const row of rows) {
    const L = ledgers.get(keyOfM(String(row[3])) || ""); if (!L) continue;
    if (!Array.isArray(row[7]) || !row[7].length) continue;
    const text = String(row[1]);
    let marks; try { marks = L.classify(text); } catch { continue; }
    const by = new Set();
    for (const g of marks) if (row[7].includes(g.i)) { const s = L.shapes.get(g.shape); if (s && s.dividesBy) by.add(s.dividesBy); else by.add(`${L.key}:DECLARED:${g.shape}`); }
    for (const b of by) {
      counts[b] = (counts[b] || 0) + 1;
      const m = samples.get(b) || samples.set(b, new Map()).get(b);
      // group by the pattern of marks (shape ids in order) so the sample is varied, not 14 of one pattern
      const pattern = marks.filter((g) => row[7].includes(g.i)).map((g) => g.shape).join(" ");
      const e = m.get(pattern) || m.set(pattern, { n: 0, rows: [] }).get(pattern);
      e.n += 1; if (e.rows.length < 4) e.rows.push({ k, text, pieces: piecesAt(text, row[7]), prints: Array.isArray(row[8]) ? row[8] : null });
    }
  }
}
const lines = [];
for (const [b, m] of [...samples].sort()) {
  const [key, bid] = b.split(":");
  const L = ledgers.get(key);
  if (bid === "DECLARED") { lines.push(`\n==================== ${b} · divides by the declaration · rows ${counts[b]}`); }
  else {
    const br = L.branches[bid]; const d = br.decl;
    const opt = (d.options || []).find((o) => o.id === "divides") || {};
    lines.push(`\n==================== ${b} · option divides (resting ${br.resting}) · rows ${counts[b]} · patterns ${m.size}`);
    lines.push(`QUESTION: ${d.question || ""}`);
    lines.push(`SHAPES: ${br.shapes.join(", ")}`);
    for (const o of d.options || []) lines.push(`  ${o.id === "divides" ? "*" : " "} ${o.id}: ${o.means || ""}`);
  }
  let shown = 0;
  for (const [pattern, e] of [...m].sort((a, c) => c[1].n - a[1].n)) {
    lines.push(`  -- pattern [${pattern}] ×${e.n}`);
    for (const r of e.rows) { if (shown++ >= CAP) break; lines.push(`     «${r.text}» -> ${r.pieces.map((p) => `«${p}»`).join(" | ")}${r.prints ? ` PRINTS ${JSON.stringify(r.prints)}` : ""} (${r.k})`); }
    if (shown >= CAP) { lines.push(`     … (cap)`); break; }
  }
}
writeFileSync(OUT, lines.join("\n") + "\n");
console.log(`branches ${samples.size} · written ${OUT}`);
for (const [b, c] of Object.entries(counts).sort((a, c) => c[1] - a[1])) console.log(`${String(c).padStart(7)}  ${b}`);
