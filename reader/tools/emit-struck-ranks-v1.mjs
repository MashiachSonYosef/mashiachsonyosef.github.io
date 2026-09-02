#!/usr/bin/env node
// LEDGER: M
// The M ledger's own record of what a strike took from it, rank by rank.
//
// A LICENCE STRIKE LEAVES HOLES, AND THE HOLES STAY. When a source is struck
// from the route store its routes go with it, and the ranks the catalog gave
// those routes go dark: a key that ranked its readings 1,2,3,4 keeps 1 and 3.
// Renumbering would close the hole and rewrite every citation into the store;
// the corpus lane's position (2026-09-02) is that the hole is the honest
// record that a reading was struck, and this lane holds to it.
//
// But a hole the store cannot tie to a strike is a reading gone with no
// licence a reader can see — the shape of a bug, not of a strike. So each
// struck rank is TYPED here: key, rank, and the M record it stood on, written
// from the store as it was before the strike and the store as it is after.
// check-route-store-exact-k reads this record and passes a hole it can tie
// to a STRUCK_RANK row, and alarms on any other.
//
// Two ways in. A strike made from today on writes this record itself
// (tools/strike-language-v1.mjs calls recordStruckRanks). The strike of
// 2026-09-01 did not, so its record is emitted once from the pre-strike store
// recovered from commit c0c19b5ed — the same diff, the same shape, and the
// record says which way it was made.
//
// Run: node tools/emit-struck-ranks-v1.mjs --before <pre-strike store dir>
//        [--after data/route-store] [--out data/route-store/struck-ranks-v1.json.gz]
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync, gzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");

export const STRUCK_RANK_RULE_ID = "struck-rank-rule-v1-a-hole-by-strike-is-typed-and-a-hole-by-bug-alarms";
export const STRUCK_RANKS_FILE = "struck-ranks-v1.json.gz";

const readShards = (dir) => {
  const out = new Map();
  const shards = join(dir, "shards");
  if (!existsSync(shards)) return out;
  for (const f of readdirSync(shards).filter((x) => x.endsWith(".bin")).sort()) {
    let body;
    try { body = JSON.parse(gunzipSync(readFileSync(join(shards, f))).toString("utf8")); } catch { continue; }
    for (const [k, rows] of Object.entries(body)) out.set(k, rows);
  }
  return out;
};

/**
 * The struck ranks between two states of one store: every row of `before`
 * whose (key, rank) is absent from `after`, typed with the M record it stood
 * on. Returns { keys: { key: [[rank, m_id], ...] }, rows, keys_touched,
 * on_struck_records, on_other_records } — the last is the count that must be
 * zero for the diff to be a strike and nothing else.
 */
export const struckRanksBetween = (before, after, struckMIds) => {
  const struck = new Set(struckMIds || []);
  const keys = {};
  let rows = 0, onStruck = 0, onOther = 0;
  for (const [k, was] of before) {
    const now = new Set((after.get(k) || []).map((r) => (Array.isArray(r) ? r[0] : NaN)));
    for (const r of was) {
      if (!Array.isArray(r) || now.has(r[0])) continue;
      const m = String(r[3] ?? "");
      (keys[k] ||= []).push([r[0], m]);
      rows += 1;
      if (struck.has(m)) onStruck += 1; else onOther += 1;
    }
  }
  return { keys, rows, keys_touched: Object.keys(keys).length, on_struck_records: onStruck, on_other_records: onOther };
};

/** Read the record beside a store, or null when the store has none. */
export const readStruckRanks = (storeDir) => {
  const p = join(storeDir, STRUCK_RANKS_FILE);
  if (!existsSync(p)) return null;
  try { return JSON.parse(gunzipSync(readFileSync(p)).toString("utf8")); } catch { return null; }
};

/**
 * Write (or extend) the record beside a store. A strike appends its rows to
 * what earlier strikes left; a (key, rank) is recorded once.
 */
export const recordStruckRanks = (storeDir, diff, made) => {
  const prior = readStruckRanks(storeDir);
  const keys = prior ? prior.keys : {};
  for (const [k, list] of Object.entries(diff.keys)) {
    const have = new Set((keys[k] || []).map((x) => x[0]));
    for (const x of list) if (!have.has(x[0])) (keys[k] ||= []).push(x);
  }
  const record = {
    schema_version: "STRUCK_RANKS_V1",
    rule_id: STRUCK_RANK_RULE_ID,
    what: "every rank a licence strike removed from the route store, with the M record it stood on; the hole it left is kept, never renumbered",
    made: [...(prior ? prior.made : []), made],
    counts: { keys: Object.keys(keys).length, ranks: Object.values(keys).reduce((a, l) => a + l.length, 0) },
    keys,
  };
  writeFileSync(join(storeDir, STRUCK_RANKS_FILE), gzipSync(Buffer.from(JSON.stringify(record), "utf8")));
  return record;
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
  const BEFORE = arg("before", null);
  const AFTER = arg("after", join(K3, "data", "route-store"));
  if (!BEFORE || !existsSync(join(BEFORE, "shards"))) { console.log("usage: --before <pre-strike store dir with shards/>"); process.exit(2); }
  const index = JSON.parse(readFileSync(join(AFTER, "index.json"), "utf8"));
  const la = index.language_admission || {};
  const diff = struckRanksBetween(readShards(BEFORE), readShards(AFTER), la.struck_m_ids);
  if (diff.on_other_records) {
    console.log(`REFUSED — ${diff.on_other_records} removed row(s) stand on a record the admission did not strike; that is not a strike's diff`);
    process.exit(1);
  }
  const before = JSON.parse(readFileSync(join(BEFORE, "index.json"), "utf8"));
  const record = recordStruckRanks(AFTER, diff, {
    how: "reconstructed from the pre-strike store beside the struck store",
    before_store_version: before.store_version || null,
    after_store_version: index.store_version || null,
    admission_rule: la.rule_id || null,
    struck_m_ids: la.struck_m_ids || [],
    rows: diff.rows, keys: diff.keys_touched, on: new Date().toISOString().slice(0, 10),
  });
  console.log(`${join(AFTER, STRUCK_RANKS_FILE)}: ${record.counts.ranks.toLocaleString()} struck ranks over ${record.counts.keys.toLocaleString()} keys · all on the ${(la.struck_m_ids || []).length} struck records`);
}
