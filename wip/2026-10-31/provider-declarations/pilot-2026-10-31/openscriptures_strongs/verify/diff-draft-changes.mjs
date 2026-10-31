// Which routes does my comparison place differently from the draft's own changes-vs-v3.jsonl (its output file, read as data)?
import { readFileSync } from "node:fs";
const P = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/punct/pilot/openscriptures_strongs/changes-vs-v3.jsonl";
const mine = readFileSync(new URL("./v3-compare-draft-variant.jsonl", import.meta.url), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const theirs = readFileSync(P, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const cats = {}; for (const t of theirs) { const c = t.cat || t.category || t.kind || t.change || JSON.stringify(Object.keys(t)); cats[c] = (cats[c] || 0) + 1; }
console.log("draft file categories", cats);
const sig = (key, v3, d) => key + "|" + v3.length + "|" + d.length;
const T = new Map(); for (const t of theirs) { const k = t.key + "|" + t.v3_readings + "|" + t.declaration_pieces + "|" + t.category; T.set(k, (T.get(k) || 0) + 1); }
const M = new Map(); for (const m of mine) { const k = m.key + "|" + m.v3.length + "|" + m.decl.length + "|" + m.cat; M.set(k, (M.get(k) || 0) + 1); }
for (const [k, n] of M) if ((T.get(k) || 0) !== n) console.log("mine-only", k, n, T.get(k) || 0);
for (const [k, n] of T) if ((M.get(k) || 0) !== n) console.log("draft-only", k, n, M.get(k) || 0);
