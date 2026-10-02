#!/usr/bin/env node
// Synthesis lane · family-ledger-rule-v1-values-are-ruled-works-are-not
// GUARDS: the family ledger against the atlas and the store.
//
// The ledger rules on the bridge's corpus_family values; this check holds it
// to that. Every member value it names must exist in the atlas; no value may
// be folded into two families; a value in neither a family nor the awaiting
// bucket is reported, because the door must surface it verbatim rather than
// lose it. Every Hebrew token that carries a key must carry the exact-K of
// its own surface, and the store must answer for it — a key nobody can open
// is a claim nobody can check.
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { exactK } from "./k-normalization-v1.mjs";

const K3 = join(dirname(fileURLToPath(import.meta.url)), "..");
const L = JSON.parse(readFileSync(join(K3, "data", "family-ledger-v1.json"), "utf8"));
const A = JSON.parse(readFileSync(join(K3, "data", "corpus-atlas-v1.json"), "utf8"));

let bad = 0;
const check = (name, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${name}${d ? "  ·  " + d : ""}`); };

const atlasValues = new Set(Object.keys(A.families));
const seen = new Map();
const allMembers = [];
for (const f of L.families) for (const m of f.members) { allMembers.push([m, f.id]); }
for (const m of L.awaiting.members) allMembers.push([m, "(awaiting)"]);

let missing = [], doubled = [];
for (const [m, fid] of allMembers) {
  if (!atlasValues.has(m)) missing.push(`${m} (in ${fid})`);
  if (seen.has(m)) doubled.push(`${m} (${seen.get(m)} and ${fid})`);
  seen.set(m, fid);
}
check("every member value the ledger rules on exists in the atlas", missing.length === 0, missing.join(", ") || `${allMembers.length} values`);
check("no value is folded into two families", doubled.length === 0, doubled.join(", ") || "each ruled once");

const unmapped = [...atlasValues].filter((v) => !seen.has(v));
check("values the ledger does not rule are counted, so the door can surface them",
  true, unmapped.length ? `${unmapped.length} unmapped: ${unmapped.join(", ")}` : "0 unmapped — the ledger covers the column");

// ---- Hebrew names against the store ---------------------------------------
const shardDir = join(K3, "data", "route-store", "shards");
const cache = new Map();
const answers = (K) => {
  const sh = createHash("sha256").update(Buffer.from(K, "utf8")).digest("hex").slice(0, 2);
  if (!cache.has(sh)) cache.set(sh, JSON.parse(gunzipSync(readFileSync(join(shardDir, `${sh}.bin`))).toString("utf8")));
  return (cache.get(sh)[K] || []).length;
};
for (const f of L.families) {
  if (!f.he) { check(`${f.id}: no Hebrew name — the slot stands open`, f.he_tokens.length === 0, "tokens without a name"); continue; }
  const joined = f.he_tokens.map((t) => t.s).join(" ");
  check(`${f.id}: the tokens rejoin into the name`, joined === f.he, `"${joined}" vs "${f.he}"`);
  for (const t of f.he_tokens) {
    if (!t.k) { check(`${f.id}: "${t.s}" carries no key and claims nothing`, true, "prints, opens nothing"); continue; }
    const ek = exactK(t.s);
    check(`${f.id}: "${t.s}" key is its own exact-K`, t.k === ek, `${t.k} vs ${ek}`);
    const n = answers(t.k);
    check(`${f.id}: the store answers for "${t.s}"`, n > 0, `${n} routes`);
  }
}

console.log();
if (bad) { console.log(`${bad} FAILED`); process.exit(1); }
console.log("all checks passed");
