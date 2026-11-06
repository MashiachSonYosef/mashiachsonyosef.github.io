#!/usr/bin/env node
// GUARDS: row-strike-rule-v1-a-row-the-provider-misfiled-is-struck-or-re-keyed-by-a-named-list-and-the-hole-is-typed
// LEDGER: M R
// Strikes named store ROWS, not whole sources: the rows a provider's parse
// filed under a key that is not their word's, each named by the corpus lane
// in a list the page lane reviewed (m, key, rank, route, and an action).
//
// The first use (6 November 2026): the corpus lane's one-letter forms, v103.2
// (moses-one-letter-forms-v1, strike-list-v1.jsonl). Wikisource's Strong's
// concordance (M14) filed 17 records under a bare letter whose word they are
// not: "to write", "not", "to inquire" under the vav, "to strike" under the
// he, "to go or come" and "all" under the lamed, and more. Their renderings
// sat on the card of every prefix or suffix of that letter (173 rows). One
// record, Manasseh, is the name's own and is moved to its word, re-keyed and
// not struck. A row a branch of that ship holds back while its resting
// option stands (B01, "what" on the letter mem: the owner has not ruled; the
// resting option withholds) is struck the same way and named with the
// branch, so a ruling the other way puts it back from this record.
//
// Sister of strike-source-v1 (a source struck whole for its license) and
// strike-language-v1 (the admission strike): the same mechanics. The shards
// are rewritten without the struck rows; every rank a struck row stood on is
// typed in the store's struck-ranks record and never renumbered; a re-keyed
// row takes the next rank of its new key, so no rank there is shared; the
// store's version is recomputed from the bytes. Its own cumulative record,
// data/row-strikes-v1.json, carries every row it took whole (all seven
// slots), so a stranger can tell what went, why, and put it back.
//
// It refuses before it writes: every list row must name exactly the rows the
// served store holds under that (m, key, rank, route), and a re-key must
// name a key that is not the one it leaves.
//
// Usage: node tools/strike-rows-v1.mjs --list <strike-list.jsonl> --reason "<why>"
//          [--branches <branches.json> --branch B01] [--store data/route-store] [--dry]
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync, gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { recordStruckRanks } from "./emit-struck-ranks-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const STORE = arg("store", join(K3, "data", "route-store"));
const DRY = process.argv.includes("--dry");
const LIST = arg("list", null);
const BRANCHES = arg("branches", null);
const BRANCH = arg("branch", null);
const REASON = arg("reason", "");
export const ROW_STRIKE_RULE_ID = "row-strike-rule-v1-a-row-the-provider-misfiled-is-struck-or-re-keyed-by-a-named-list-and-the-hole-is-typed";
const RECORD = join(K3, "data", "row-strikes-v1.json");
if (!LIST || !REASON || (BRANCHES && !BRANCH) || (BRANCH && !BRANCHES)) {
  console.log("usage: --list <strike-list.jsonl> --reason \"<the review this strike stands on>\" [--branches <branches.json> --branch B01] [--store dir] [--dry]");
  process.exit(2);
}
const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const shardOf = (k) => `${sha256(Buffer.from(k, "utf8")).slice(0, 2)}.bin`;

// ---- what is asked ------------------------------------------------------------
const listBytes = readFileSync(LIST);
const asked = listBytes.toString("utf8").split("\n").filter((l) => l.trim()).map((l, i) => {
  const e = JSON.parse(l);
  if (!["strike", "re-key"].includes(e.action)) { console.log(`REFUSED — list line ${i + 1}: action "${e.action}" is neither strike nor re-key`); process.exit(1); }
  if (e.action === "re-key" && (!e.to_key || e.to_key === e.key)) { console.log(`REFUSED — list line ${i + 1}: a re-key names no other key`); process.exit(1); }
  return { m: e.m, key: e.key, rank: e.rank, route: e.route, action: e.action, to_key: e.action === "re-key" ? e.to_key : null, why: "list", h: e.H ?? null };
});
let branch = null;
if (BRANCHES) {
  const bBytes = readFileSync(BRANCHES);
  const b = JSON.parse(bBytes.toString("utf8")).find((x) => x.id === BRANCH);
  if (!b) { console.log(`REFUSED — ${BRANCHES} names no branch ${BRANCH}`); process.exit(1); }
  const resting = (b.options || []).find((o) => o.id === b.resting);
  if (!resting || resting.id !== "withheld") { console.log(`REFUSED — branch ${BRANCH} rests on "${b.resting}", not on withholding; nothing to strike for it`); process.exit(1); }
  branch = { id: b.id, name: b.name, question: b.question, resting: b.resting, means: resting.means, file: basename(BRANCHES), sha256: sha256(bBytes) };
  for (const r of b.rows || []) asked.push({ m: r.m, key: r.key, rank: r.rank, route: r.route, action: "strike", to_key: null, why: `branch ${b.id} resting (${b.resting})`, h: null });
}

// ---- the store, and every asked row found in it -------------------------------
const index = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));
const shardNames = readdirSync(join(STORE, "shards")).filter((f) => f.endsWith(".bin")).sort();
const shards = new Map(shardNames.map((n) => [n, JSON.parse(gunzipSync(readFileSync(join(STORE, "shards", n))).toString("utf8"))]));
let routesBefore = 0, keysBefore = 0;
for (const body of shards.values()) for (const rows of Object.values(body)) { keysBefore += 1; routesBefore += rows.length; }

const same = (r, e) => String(r[3]) === e.m && r[0] === e.rank && r[1] === e.route;
const misses = [];
const seen = new Set();
for (const e of asked) {
  const id = `${e.m}|${e.key}|${e.rank}|${e.route}`;
  if (seen.has(id)) { console.log(`REFUSED — ${id} is asked twice`); process.exit(1); }
  seen.add(id);
  const body = shards.get(shardOf(e.key));
  const hits = body && body[e.key] ? body[e.key].filter((r) => same(r, e)) : [];
  if (!hits.length) misses.push(id);
  e.hits = hits.length;
}
if (misses.length) { console.log(`REFUSED — ${misses.length} asked row(s) the served store does not hold: ${misses.slice(0, 4).join(" · ")}`); process.exit(1); }

// ---- the strike, counted before anything is written ------------------------------
const ranks = { keys: {}, rows: 0, keys_touched: 0, on_struck_records: 0, on_other_records: 0 };
const taken = [];               // every row taken, whole, with what was done with it
const perSource = {}, cutsTaken = {};
const keysTouched = new Set(), keysEmptied = [], keysMadeNew = [];
let routesStruck = 0, routesRekeyed = 0;
for (const e of asked) {
  const body = shards.get(shardOf(e.key));
  const rows = body[e.key];
  const out = [];
  for (const r of rows) {
    if (!same(r, e)) { out.push(r); continue; }
    keysTouched.add(e.key);
    (ranks.keys[e.key] ||= []).push([r[0], String(r[3])]); ranks.rows += 1; ranks.on_struck_records += 1;
    perSource[r[3]] = (perSource[r[3]] || 0) + 1;
    // a re-keyed row keeps its slot [5]; only a struck cut leaves the cut table
    if (e.action === "strike" && r.length > 5 && r[5] === 1) cutsTaken[r[3]] = (cutsTaken[r[3]] || 0) + 1;
    if (e.action === "strike") { routesStruck += 1; taken.push({ action: "strike", why: e.why, key: e.key, row: r }); continue; }
    // re-key: the row, unchanged but for its rank, at the end of its word's key
    const toBody = shards.get(shardOf(e.to_key));
    const toRows = toBody[e.to_key] || [];
    if (!toBody[e.to_key]) keysMadeNew.push(e.to_key);
    const next = toRows.reduce((a, x) => Math.max(a, Number(x[0]) || 0), 0) + 1;
    const moved = [next, ...r.slice(1)];
    toBody[e.to_key] = [...toRows, moved];
    routesRekeyed += 1;
    taken.push({ action: "re-key", why: e.why, key: e.key, row: r, to_key: e.to_key, to_rank: next });
  }
  if (out.length) body[e.key] = out; else { delete body[e.key]; keysEmptied.push(e.key); }
}
ranks.keys_touched = keysTouched.size;
const keysAfter = keysBefore - keysEmptied.length + keysMadeNew.length;
const routesAfter = routesBefore - routesStruck;     // a re-key moves a row; it neither takes nor adds one
console.log(`row strike · ${routesStruck} struck, ${routesRekeyed} re-keyed, of ${routesBefore.toLocaleString()} routes · ${keysTouched.size} keys touched · ${keysEmptied.length} emptied · ${keysMadeNew.length} new · per source ${JSON.stringify(perSource)}${branch ? ` · branch ${branch.id} resting ${branch.resting}` : ""}`);
for (const t of taken.filter((x) => x.action === "re-key")) console.log(`  re-key ${t.key} rank ${t.row[0]} "${t.row[1]}" -> ${t.to_key} rank ${t.to_rank}`);
if (DRY) { console.log("dry run — nothing written"); process.exit(0); }

// ---- the shards, then the version from their bytes ---------------------------------
const touchedShards = new Set([...asked.map((e) => shardOf(e.key)), ...asked.filter((e) => e.to_key).map((e) => shardOf(e.to_key))]);
for (const name of touchedShards) writeFileSync(join(STORE, "shards", name), gzipSync(Buffer.from(JSON.stringify(shards.get(name))), { level: 9 }));
const digest = createHash("sha256"); let shardBytes = 0;
for (const name of shardNames) { const b = readFileSync(join(STORE, "shards", name)); digest.update(b); shardBytes += b.length; }
const was = index.store_version || null, now = digest.digest("hex").slice(0, 12), on = new Date().toISOString();
const ranAt = on.slice(0, 10);

// the typed hole, in the one struck-ranks record, beside the other strikes'
recordStruckRanks(STORE, ranks, {
  how: "written by the row strike as it struck",
  before_store_version: was, after_store_version: now,
  admission_rule: ROW_STRIKE_RULE_ID, rule_id: ROW_STRIKE_RULE_ID, reason: REASON,
  struck_m_ids: Object.keys(perSource), rows: ranks.rows, keys: ranks.keys_touched, on: ranAt,
});

// the record, cumulative: prior rounds carried, each round its own line
let prior = null; try { prior = JSON.parse(readFileSync(RECORD, "utf8")); } catch { prior = null; }
const rounds = [...((prior && prior.rounds) || []), {
  ran_at: on, reason: REASON,
  list: { file: basename(LIST), sha256: sha256(listBytes), lines: asked.filter((e) => e.why === "list").length },
  branch,
  counts: { routes_before: routesBefore, routes_struck: routesStruck, routes_rekeyed: routesRekeyed, keys_before: keysBefore, keys_touched: keysTouched.size, keys_emptied: keysEmptied.length, keys_made: keysMadeNew.length, per_source: perSource, cuts_taken: cutsTaken },
  store_version: { was, now },
  rows: taken.map((t) => ({ action: t.action, why: t.why, key: t.key, rank: t.row[0], m: String(t.row[3]), route: t.row[1], row: t.row, ...(t.action === "re-key" ? { to_key: t.to_key, to_rank: t.to_rank } : {}) })),
}];
const cumulative = {
  routes_struck: rounds.reduce((a, r) => a + r.counts.routes_struck, 0),
  routes_rekeyed: rounds.reduce((a, r) => a + r.counts.routes_rekeyed, 0),
  keys_touched: rounds.reduce((a, r) => a + r.counts.keys_touched, 0),
  rounds: rounds.length,
};
const record = {
  schema_version: "ROW_STRIKES_V1", rule_id: ROW_STRIKE_RULE_ID,
  what: "every store row struck or re-keyed by a named list the page lane reviewed (a provider's parse filed it under a key that is not its word's), and every row a branch's resting option withholds until the owner rules; each row is kept whole here, so what went can be read and put back; the rank each struck or re-keyed row left is typed in the store's struck-ranks record and never renumbered",
  ran_at: on, rounds, cumulative,
  counts_scope: "cumulative is the whole of this record's strikes; rounds[] holds each round's own arithmetic; a re-key moves a row and is counted apart from a strike, which takes one",
};
writeFileSync(RECORD, JSON.stringify(record, null, 1));

// the index: the counts moved, the cut table moved with the rows it counted,
// the version renamed with its reason
const counts = { ...(index.counts || {}), keys: keysAfter, routes: routesAfter, shards: shardNames.length, shard_bytes_total: shardBytes };
if (counts.cuts_by_source) {
  counts.cuts_by_source = { ...counts.cuts_by_source };
  for (const [m, c] of Object.entries(cutsTaken)) if (counts.cuts_by_source[m] !== undefined) counts.cuts_by_source[m] -= c;
  if (Number.isFinite(Number(counts.readings_that_are_a_cut_of_a_sibling_record))) counts.readings_that_are_a_cut_of_a_sibling_record = Object.values(counts.cuts_by_source).reduce((a, x) => a + x, 0);
}
index.counts = counts;
index.store_version = now;
index.store_version_history = [...(index.store_version_history || []), { was, now, why: ROW_STRIKE_RULE_ID, on }];
index.row_strikes = { rule_id: ROW_STRIKE_RULE_ID, record: "reader/data/row-strikes-v1.json", cumulative };
writeFileSync(join(STORE, "index.json"), JSON.stringify(index, null, 1));
console.log(`written · store ${was} -> ${now} · ${routesAfter.toLocaleString()} routes served · record ${RECORD}`);
