#!/usr/bin/env node
// GUARDS: source-strike-rule-v1-a-source-whose-text-needs-a-providers-permission-is-struck-whole-and-the-hole-is-typed
// LEDGER: M R
// Strikes named M records and the R routes they carry from the served route
// store, for a reason the owner ruled on. The first use (17 October 2026):
// M20, "Bolls byte-pinned reformatted Brown-Driver-Briggs" — its text is
// Online Bible's abridged BDB, © Larry Pierce, word for word TBESH's Meaning
// column, which TBESH says needs Online Bible's permission; the owner's
// 8 October ruling puts permission-asking text out permanently. Open
// Scriptures' BDB (M5) and the Unabridged BDB (M46) remain as the 1906 print.
//
// Sister of strike-language-v1 (the admission strike): the same mechanics —
// the shards are rewritten without the struck rows, the hole each row leaves
// is typed in the struck-ranks record and never renumbered, the store's
// version is recomputed from the bytes so no warm cache keeps serving the
// struck readings — under a different rule and its own cumulative record,
// data/source-strikes-v1.json, so a stranger can tell a licence strike from
// an admission strike.
//
// Usage: node tools/strike-source-v1.mjs --ids M20[,M21] --reason "<why>" [--store data/route-store] [--dry]
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync, gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { recordStruckRanks } from "./emit-struck-ranks-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const STORE = arg("store", join(K3, "data", "route-store"));
const DRY = process.argv.includes("--dry");
const IDS = String(arg("ids", "")).split(",").map((s) => s.trim()).filter(Boolean);
const REASON = arg("reason", "");
export const SOURCE_STRIKE_RULE_ID = "source-strike-rule-v1-a-source-whose-text-needs-a-providers-permission-is-struck-whole-and-the-hole-is-typed";
const RECORD = join(K3, "data", "source-strikes-v1.json");
if (!IDS.length || !REASON) { console.log("usage: --ids M20[,M21] --reason \"<the ruling this strike stands on>\" [--store dir] [--dry]"); process.exit(2); }

const index = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));
const unknown = IDS.filter((m) => !index.m_sources[m]);
if (unknown.length) { console.log(`REFUSED — not in the served index (unknown, or already struck): ${unknown.join(", ")}`); process.exit(1); }
const struck = new Set(IDS);
const labels = Object.fromEntries(IDS.map((m) => [m, index.m_sources[m]]));

// the strike, counted before anything is written
const shardNames = readdirSync(join(STORE, "shards")).filter((f) => f.endsWith(".bin")).sort();
const rewritten = new Map();
const ranks = { keys: {}, rows: 0, keys_touched: 0, on_struck_records: 0, on_other_records: 0 };
let routesBefore = 0, routesStruck = 0, keysBefore = 0, keysEmptied = 0;
const emptied = [];
for (const name of shardNames) {
  const body = JSON.parse(gunzipSync(readFileSync(join(STORE, "shards", name))).toString("utf8"));
  const out = {};
  for (const [k, rows] of Object.entries(body)) {
    keysBefore += 1; routesBefore += rows.length;
    const kept = rows.filter((r) => !struck.has(String(r[3])));
    routesStruck += rows.length - kept.length;
    for (const r of rows) if (struck.has(String(r[3]))) { (ranks.keys[k] ||= []).push([r[0], String(r[3])]); ranks.rows += 1; ranks.on_struck_records += 1; }
    if (kept.length) out[k] = kept; else { keysEmptied += 1; if (emptied.length < 12) emptied.push(k); }
  }
  rewritten.set(name, out);
}
ranks.keys_touched = Object.keys(ranks.keys).length;
const perSource = {};
for (const list of Object.values(ranks.keys)) for (const [, m] of list) perSource[m] = (perSource[m] || 0) + 1;
console.log(`strike ${IDS.join(", ")} · ${routesStruck.toLocaleString()} of ${routesBefore.toLocaleString()} routes · ${ranks.keys_touched.toLocaleString()} keys touched · ${keysEmptied.toLocaleString()} keys emptied${emptied.length ? ` (${emptied.slice(0, 6).join(" ")}…)` : ""} · per source ${JSON.stringify(perSource)}`);
if (DRY) { console.log("dry run — nothing written"); process.exit(0); }
if (!routesStruck) { console.log("nothing to strike"); process.exit(0); }

// the shards, then the version from their bytes
for (const [name, body] of rewritten) writeFileSync(join(STORE, "shards", name), gzipSync(Buffer.from(JSON.stringify(body)), { level: 9 }));
const digest = createHash("sha256"); let shardBytes = 0;
for (const name of shardNames) { const b = readFileSync(join(STORE, "shards", name)); digest.update(b); shardBytes += b.length; }
const was = index.store_version || null, now = digest.digest("hex").slice(0, 12), on = new Date().toISOString();
const ranAt = on.slice(0, 10);

// the typed hole, beside the admission strike's, in the one struck-ranks record
recordStruckRanks(STORE, ranks, {
  how: "written by the source strike as it struck",
  before_store_version: was, after_store_version: now,
  admission_rule: SOURCE_STRIKE_RULE_ID, rule_id: SOURCE_STRIKE_RULE_ID, reason: REASON,
  struck_m_ids: IDS, rows: ranks.rows, keys: ranks.keys_touched, on: ranAt,
});

// the record, cumulative: prior rounds carried, each round its own line
let prior = null; try { prior = JSON.parse(readFileSync(RECORD, "utf8")); } catch { prior = null; }
const rounds = [...((prior && prior.rounds) || []), {
  ran_at: on, struck_m_ids: IDS, reason: REASON,
  counts: { routes_before: routesBefore, routes_struck: routesStruck, keys_before: keysBefore, keys_touched: ranks.keys_touched, keys_emptied: keysEmptied, per_source: perSource },
  store_version: { was, now },
}];
const struckSources = [...((prior && prior.struck_sources) || []).filter((s) => !struck.has(s.m_id)), ...IDS.map((m) => ({ m_id: m, label: labels[m].label, key: labels[m].key, license_pointer: labels[m].licensePointer, reason: REASON, on: ranAt, routes: perSource[m] || 0 }))];
const cumulative = { sources_struck: struckSources.length, routes_struck: rounds.reduce((a, r) => a + r.counts.routes_struck, 0), keys_touched: rounds.reduce((a, r) => a + r.counts.keys_touched, 0), routes_before_first_round: rounds[0].counts.routes_before };
const record = {
  schema_version: "SOURCE_STRIKES_V1", rule_id: SOURCE_STRIKE_RULE_ID,
  what: "every source struck from the served route store for a reason the owner ruled on (a licence posture, not language admission: that strike has its own record, data/language-admission-v1.json); the hole each row left is typed in the store's struck-ranks record and never renumbered",
  ran_at: on, struck_sources: struckSources, rounds, cumulative,
  counts_scope: "cumulative is the whole of this record's strikes; rounds[] holds each round's own arithmetic",
};
writeFileSync(RECORD, JSON.stringify(record, null, 1));

// the index: the sources gone, the counts moved, the version renamed with its reason
index.m_sources = Object.fromEntries(Object.entries(index.m_sources).filter(([m]) => !struck.has(m)));
index.counts = { ...(index.counts || {}), keys: keysBefore - keysEmptied, routes: routesBefore - routesStruck, shards: shardNames.length, shard_bytes_total: shardBytes };
index.store_version = now;
index.store_version_history = [...(index.store_version_history || []), { was, now, why: SOURCE_STRIKE_RULE_ID, on }];
index.source_strikes = { rule_id: SOURCE_STRIKE_RULE_ID, record: "reader/data/source-strikes-v1.json", struck_m_ids: struckSources.map((s) => s.m_id), cumulative, rounds: rounds.length };
writeFileSync(join(STORE, "index.json"), JSON.stringify(index, null, 1));
console.log(`written · store ${was} -> ${now} · ${(routesBefore - routesStruck).toLocaleString()} routes served · record ${RECORD}`);
