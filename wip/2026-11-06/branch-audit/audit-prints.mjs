// Data-level audit of the print step: for every print rule, the branch's question, the
// option's "means" prose from the declaration, and every distinct (route -> printed) pair
// the served store holds under it. Read-only.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { gunzipSync } from "node:zlib";

const K3 = process.argv[2];
const OUT = process.argv[3];
const { PRINT_RULES } = await import(pathToFileURL(resolve(join(K3, "tools", "ledger-print-v1.mjs"))).href);
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
    let printRule = null;
    if (option !== b.resting && option !== "divides") printRule = `${key}:${b.id}`;
    if (option === "divides") for (const id of b.shapes || []) shapes.get(id).divides = true;
    if (printRule) for (const id of b.shapes || []) shapes.get(id).prints = printRule;
    branches[b.id] = { option, resting: b.resting, decl: b, shapes: b.shapes || [], prints: printRule };
  }
  const { classify } = await import(pathToFileURL(resolve(join(K3, L.classifier.file))).href);
  ledgers.set(key, { key, decl, shapes, branches, classify });
}
const STORE = join(K3, "data", "route-store");
const index = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));
const keyOfM = (m) => (index.m_sources[m] || {}).key || null;
const samples = new Map(); // ruleKey -> Map(pairString -> {route, prints, cuts, n, keys:[]})
const counts = {};
for (const f of readdirSync(join(STORE, "shards")).filter((x) => x.endsWith(".bin")).sort()) {
  const body = JSON.parse(gunzipSync(readFileSync(join(STORE, "shards", f))).toString("utf8"));
  for (const [k, rows] of Object.entries(body)) for (const row of rows) {
    const L = ledgers.get(keyOfM(String(row[3])) || ""); if (!L) continue;
    const text = String(row[1]);
    let marks; try { marks = L.classify(text); } catch { continue; }
    const rules = new Set();
    for (const g of marks) { const s = L.shapes.get(g.shape); if (s && s.prints) rules.add(s.prints); }
    if (!rules.size) continue;
    const none = [...rules].find((r) => PRINT_RULES[r] && PRINT_RULES[r].kind === "none");
    const ruleKey = none || [...rules][0];
    counts[ruleKey] = (counts[ruleKey] || 0) + 1;
    const m = samples.get(ruleKey) || samples.set(ruleKey, new Map()).get(ruleKey);
    const prints = Array.isArray(row[8]) ? row[8] : null;
    const cuts = Array.isArray(row[7]) ? row[7] : null;
    const sig = JSON.stringify([text, prints, cuts, rules.size > 1 ? [...rules].sort() : null]);
    const e = m.get(sig) || m.set(sig, { route: text, prints, cuts, n: 0, keys: [], rules: rules.size > 1 ? [...rules].sort() : null }).get(sig);
    e.n += 1; if (e.keys.length < 3) e.keys.push(k);
  }
}
const lines = [];
const CAP = Number(process.argv[4] || 80);
for (const [ruleKey, m] of [...samples].sort()) {
  const [key, bid] = ruleKey.split(":");
  const L = ledgers.get(key); const b = L.branches[bid]; const d = b.decl;
  const opt = (d.options || []).find((o) => o.id === b.option) || {};
  lines.push(`\n==================== ${ruleKey} · option ${b.option} (resting ${b.resting}) · rows ${counts[ruleKey]} · distinct ${m.size} · step kind ${PRINT_RULES[ruleKey] ? PRINT_RULES[ruleKey].kind : "MISSING"}`);
  lines.push(`QUESTION: ${d.question || d.asks || ""}`);
  lines.push(`SHAPES: ${b.shapes.join(", ")}`);
  for (const o of d.options || []) lines.push(`  ${o.id === b.option ? "*" : " "} ${o.id}: ${o.means || o.prints || JSON.stringify(o)}`);
  if (d.examples) lines.push(`EXAMPLES: ${JSON.stringify(d.examples).slice(0, 600)}`);
  if (d.note) lines.push(`NOTE: ${d.note}`);
  let i = 0;
  for (const e of [...m.values()].sort((a, c) => c.n - a.n)) {
    if (i++ >= CAP) { lines.push(`  … ${m.size - CAP} more distinct`); break; }
    lines.push(`  «${e.route}» -> ${e.prints === null ? "(no print slot!)" : e.prints.length ? e.prints.map((t) => `«${t}»`).join(" | ") : "∅ no pill"}${e.cuts ? ` cuts@${e.cuts.join(",")}` : ""}${e.rules ? ` [also ${e.rules.join(",")}]` : ""}${e.n > 1 ? ` ×${e.n}` : ""} (${e.keys.join(" ")})`);
  }
}
writeFileSync(OUT, lines.join("\n") + "\n");
console.log(`rules ${samples.size} · rows ${Object.values(counts).reduce((a, x) => a + x, 0)} · written ${OUT}`);
