#!/usr/bin/env node
// GUARDS: route-store-rule-v1-catalog-compact-top5
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// The route store is the reader's lookup layer: a word on the page becomes a
// key, the key names one shard, and the shard answers with every licensed
// reading of that word in rank order. tools/build-route-store.mjs declares
// the rule before it writes a byte:
//
//   "Exact K only. The store is keyed by the byte-exact k_normalized_key.
//    No folding, no derivation, no related edges."
//
//   "Every route whose M is complete is shipped, in semantic_route_rank
//    order. [...] A ranking flag is not a licence, and nothing but a licence
//    removes a reading. The rank still orders them; it no longer gates them."
//
//   "Every route ships with its primary D text and full M license record."
//
//   "Shard = first 2 hex chars of sha256(utf8(K)) -> 256 gzip shards.
//    The browser recomputes the same hash and fetches one shard."
//
// The rule exists because the first draft of this store did the opposite on
// two counts. It shipped only the rows a top-5 flag had marked, which dropped
// 110,151 licensed routes on one book alone, and a reading dropped by a flag
// is a reading withheld with no license saying so. And a key that is folded,
// or a key that carries a vowel the page's key does not, is a key the browser
// will hash to a shard that does not hold it. Exact means byte-exact, or the
// lookup silently answers nothing.
//
// The build wrote the rule; nothing read the store back against it. This
// does. It opens the index and all 256 shards once and asks:
//
//   L1   the index declares the layout this check reads: ROUTE_STORE_V1,
//        rows laid out rank, route text, definition text, M id, year, and a
//        selection that says the rank orders and does not gate
//   L2   no key carries a vowel or accent mark: nothing in U+0591..U+05C7
//        except the maqaf U+05BE. Geresh U+05F3 and gershayim U+05F4 sit
//        outside that range and are letters' punctuation, not marks.
//   L3   every key sits in the one shard its sha256 names, so the browser's
//        recomputed hash finds it
//   L4   rows under a key never descend in rank
//   L5   the ranks under a key run 1..n with none missing and none repeated.
//        The index accounts for two kinds of deviation in its counts, a hole
//        where a licence struck a route and a repeat where one route was
//        divided on a declared mark, but it marks neither on the row. A hole
//        the store cannot tie to a strike is a reading gone with no licence
//        the reader can see, and a repeat it cannot tie to a division is a
//        doubled row. So the law is the plain one, and a store that keeps
//        the factory's numbering must show its work on the row to pass it.
//   L6   the top-5 flag does not gate: keys ship more than five routes where
//        they have them
//   L7   every row's M id resolves in index.m_sources, the full M record the
//        rule says ships with the route, and is not an id the index says a
//        licence struck. Nothing but a licence removes a reading; a reading
//        still shipped on a struck id is the licence contradicted.
//   L8   every row carries its route text, its definition text, and a
//        positive integer rank; no text is empty
//   L9   the index counts of keys, routes and shards are what the shards hold
//   L10  the index's shard byte total is what the shards weigh on disk
//
// What this does NOT prove. It does not prove that every route whose M is
// complete was shipped; that needs the sealed input packages, which are the
// corpus lane's and are read by check-nothing-invented-v1 where they are
// mounted. It does not prove a route text is verbatim from its source. It
// does not prove which routes a licence struck: the language admission
// record names struck sources, not struck routes, so a hole in a key's ranks
// cannot be matched to a strike from what ships. It does not prove the
// shards are the bytes the manifest pins; that is
// check-store-pinned-v1. It does not prove the page reads the store the way
// the store is laid out; that is check-page-agrees-with-store-v1.
//
// Run: node tools/check-route-store-exact-k-v1.mjs [--store data/route-store]
//                                                  [--index data/route-store/index.json]
//                                                  [--shards data/route-store/shards]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const STORE = arg("store", join(K3, "data", "route-store"));
const INDEX = arg("index", join(STORE, "index.json"));
const SHARDS = arg("shards", join(STORE, "shards"));

const RULE = "route-store-rule-v1-catalog-compact-top5";
// Named by codepoint, never typed. The Hebrew marks block, with the maqaf
// U+05BE cut out of it: vowels, cantillation, dagesh, shin and sin dots.
const MARK = /[\u0591-\u05bd\u05bf-\u05c7]/u;
const shardOf = (K) => createHash("sha256").update(K, "utf8").digest("hex").slice(0, 2);

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
// Keep the first few offenders by name and count the rest.
const keep = (list, item, cap = 12) => { if (list.length < cap) list.push(item); else list.push(null); };
const named = (list, n = 3) => list.filter(Boolean).slice(0, n).join(" · ");

// ── the index ─────────────────────────────────────────────────────────────
if (!existsSync(INDEX)) { console.log(`SKIPPED — no store index at ${INDEX}`); process.exit(3); }
if (!existsSync(SHARDS)) { console.log(`SKIPPED — no shards at ${SHARDS}`); process.exit(3); }
const bins = readdirSync(SHARDS).filter((f) => /^[0-9a-f]{2}\.bin$/.test(f)).sort();
if (!bins.length) { console.log(`SKIPPED — no shard files under ${SHARDS}`); process.exit(3); }

const index = JSON.parse(readFileSync(INDEX, "utf8"));
const mSources = index.m_sources || {};
const counts = index.counts || {};
const layout = Array.isArray(index.route_row) ? index.route_row.map(String) : [];
const struck = new Set(((index.language_admission || {}).struck_m_ids || []).map(String));

console.log(`— ${RULE} —`);
console.log(`  index names rule ${index.rule_id || "(none)"} · schema ${index.schema_version || "(none)"} · ${Object.keys(mSources).length} M records held · ${struck.size} struck\n`);

// L1 — the layout this check reads is the layout the index declares. A check
// that reads column 2 as the definition text when the index has moved it is
// a check judging the wrong thing.
const wanted = ["semantic_route_rank", "route_text", "definition_text", "m_id", "source_year"];
const layoutOk = wanted.every((w, i) => (layout[i] || "").startsWith(w));
const selection = String(index.selection || "");
const ordersNotGates = /orders/.test(selection) && /does not gate/.test(selection);
check("L1   the index declares the layout this check reads, and a rank that orders but does not gate",
  index.schema_version === "ROUTE_STORE_V1" && layoutOk && ordersNotGates,
  !layoutOk ? `route_row is ${JSON.stringify(layout.slice(0, 5))}, wanted ${wanted.join(", ")}`
    : !ordersNotGates ? `selection reads ${JSON.stringify(selection.slice(0, 80))}`
      : index.schema_version !== "ROUTE_STORE_V1" ? `schema_version is ${JSON.stringify(index.schema_version)}`
        : `route_row ${layout.slice(0, 5).join(", ")}${layout.length > 5 ? ` (+${layout.length - 5} optional)` : ""}`);

// ── the shards, read once ─────────────────────────────────────────────────
let keys = 0, rows = 0, bytesOnDisk = 0;
const marked = [], misplaced = [], descending = [], notOneToN = [], unresolved = new Map(), onStruck = new Map(), hollow = [];
let holes = 0, repeats = 0, repeatsAcrossRecords = 0, noRankOne = 0, overFive = 0, maxRows = 0, struckSeen = 0;

for (const f of bins) {
  const name = f.slice(0, 2);
  const buf = readFileSync(join(SHARDS, f));
  bytesOnDisk += buf.length;
  let body;
  try { body = JSON.parse(gunzipSync(buf).toString("utf8")); } catch (e) { keep(hollow, `${name}: unreadable shard (${e.message})`); continue; }
  for (const [K, list] of Object.entries(body)) {
    keys += 1;
    const where = `${name} · ${K}`;
    // L2 — the key is bare consonants and maqaf
    if (MARK.test(K)) keep(marked, where);
    // L3 — the key is where its hash says it is
    if (shardOf(K) !== name) keep(misplaced, `${where} (hash says ${shardOf(K)})`);
    if (!Array.isArray(list)) { keep(hollow, `${where}: rows are not a list`); continue; }
    const n = list.length;
    if (n > maxRows) maxRows = n;
    if (n > 5) overFive += 1;
    let prev = -Infinity, desc = false;
    const seen = new Set();
    for (const r of list) {
      rows += 1;
      const rank = Array.isArray(r) ? r[0] : undefined;
      // L8 — the row is whole: rank, route text, definition text
      const rankOk = Number.isInteger(rank) && rank >= 1;
      const rOk = typeof r?.[1] === "string" && r[1].trim() !== "";
      const dOk = typeof r?.[2] === "string" && r[2].trim() !== "";
      if (!rankOk || !rOk || !dOk)
        keep(hollow, `${where} rank ${JSON.stringify(rank)}: ${[!rankOk && "rank", !rOk && "route text", !dOk && "definition text"].filter(Boolean).join(", ")}`);
      // L7 — the M record is held
      const m = String(r?.[3] ?? "");
      if (!mSources[m]) unresolved.set(m || "(empty)", (unresolved.get(m || "(empty)") || 0) + 1);
      // L7 — and the record is not one a licence struck
      if (struck.has(m)) { struckSeen += 1; onStruck.set(m, (onStruck.get(m) || 0) + 1); }
      // L4 — order
      if (rankOk) { if (rank < prev) desc = true; prev = rank; seen.add(rank); }
    }
    if (desc) keep(descending, where);
    // L5 — completeness: exactly 1..n, each once
    const ranks = list.map((r) => (Array.isArray(r) ? r[0] : NaN));
    let exact = ranks.length === n;
    for (let i = 0; i < n; i += 1) if (ranks[i] !== i + 1) { exact = false; break; }
    if (!exact) {
      const top = Math.max(0, ...ranks.filter(Number.isInteger));
      let hole = false;
      for (let i = 1; i <= top; i += 1) if (!seen.has(i)) { hole = true; break; }
      if (hole) holes += 1;
      if (seen.size !== n) {
        repeats += 1;
        // A divided route's pieces stand on the route's one record. A rank
        // shared by rows on two records is no division; it is two routes
        // given one rank.
        const recordsAtRank = new Map();
        for (const r of list) {
          if (!Array.isArray(r) || !Number.isInteger(r[0])) continue;
          if (!recordsAtRank.has(r[0])) recordsAtRank.set(r[0], new Set());
          recordsAtRank.get(r[0]).add(String(r[3] ?? ""));
        }
        if ([...recordsAtRank.values()].some((s) => s.size > 1)) repeatsAcrossRecords += 1;
      }
      if (!seen.has(1)) noRankOne += 1;
      keep(notOneToN, `${where} ranks ${ranks.slice(0, 8).join(",")}${n > 8 ? ",…" : ""}`);
    }
  }
}

console.log(`— ${bins.length} shards · ${keys.toLocaleString()} keys · ${rows.toLocaleString()} routes · ${(bytesOnDisk / 1e6).toFixed(1)} MB on disk —\n`);

check("L2   no key carries a vowel or accent mark",
  marked.length === 0,
  marked.length ? `${marked.length} key(s) carry one — ${named(marked)}`
    : `${keys.toLocaleString()} keys, every one bare consonants and maqaf`);

check("L3   every key sits in the one shard its sha256 names",
  misplaced.length === 0,
  misplaced.length ? `${misplaced.length} key(s) elsewhere — ${named(misplaced)}`
    : "the browser's recomputed hash finds every key");

check("L4   rows under a key never descend in rank",
  descending.length === 0,
  descending.length ? `${descending.length} key(s) descend — ${named(descending)}`
    : "every list is in rank order");

// L5 — the plain law. The index says in its counts that a licence struck
// routes and that routes were divided into pieces, and both would leave the
// factory's numbering with holes and repeats. But the row carries no mark
// saying which hole is a strike and which repeat is a division, and the
// admission record names struck sources, not struck routes. A hole the store
// cannot tie to a strike is a reading gone with no licence a reader can see,
// so the check does not presume one. The detail shows the shape, and names
// the repeats that no division could explain: a rank shared by rows on two
// different M records, when a divided route's pieces all stand on its one.
const accounted = [
  Number.isFinite(Number(((index.language_admission || {}).counts || {}).routes_struck)) ? `${Number(index.language_admission.counts.routes_struck).toLocaleString()} routes struck by licence` : null,
  Number.isFinite(Number(counts.routes_separated_on_a_declared_mark)) ? `${Number(counts.routes_separated_on_a_declared_mark).toLocaleString()} routes divided into ${Number(counts.pieces_those_routes_divided_into || 0).toLocaleString()} pieces` : null,
].filter(Boolean);
check("L5   the ranks under a key run 1..n with none missing and none repeated",
  notOneToN.length === 0,
  notOneToN.length
    ? `${notOneToN.length.toLocaleString()} key(s) are not 1..n: ${holes.toLocaleString()} have a hole, ${repeats.toLocaleString()} repeat a rank (${repeatsAcrossRecords.toLocaleString()} across two M records, which no division explains), ${noRankOne.toLocaleString()} lack rank 1 — ${named(notOneToN)}${accounted.length ? `; the index counts ${accounted.join(" and ")} but marks neither on the row, so a hole cannot be told from a lost route nor a repeat from a doubled one` : ""}`
    : `${keys.toLocaleString()} keys, every one numbers its routes 1..n`);

check("L6   the top-5 flag does not gate: keys ship more than five routes where they have them",
  overFive > 0,
  overFive ? `${overFive.toLocaleString()} keys ship more than five routes; the widest ships ${maxRows}`
    : `no key ships more than five routes (widest ${maxRows}); this is the capped store the rule forbids`);

check("L7   every row's M id resolves in index.m_sources and is not an id a licence struck",
  unresolved.size === 0 && struckSeen === 0,
  [
    unresolved.size ? `unresolved: ${[...unresolved.entries()].slice(0, 4).map(([m, c]) => `${m} x${c.toLocaleString()}`).join(" · ")}` : null,
    struckSeen ? `${struckSeen.toLocaleString()} row(s) still shipped on a struck id: ${[...onStruck.entries()].slice(0, 4).map(([m, c]) => `${m} x${c.toLocaleString()}`).join(" · ")}` : null,
  ].filter(Boolean).join("; ")
    || `${rows.toLocaleString()} routes, every one on a record the index holds and none on the ${struck.size} struck ids`);

check("L8   every row carries its route text, its definition text, and a positive integer rank",
  hollow.length === 0,
  hollow.length ? `${hollow.length} row(s) are not whole — ${named(hollow)}`
    : "no route ships without its D text");

const claimed = (k) => (Number.isFinite(Number(counts[k])) ? Number(counts[k]) : NaN);
const countOff = [
  ["keys", claimed("keys"), keys], ["routes", claimed("routes"), rows], ["shards", claimed("shards"), bins.length],
].filter(([, c, h]) => c !== h);
check("L9   the index counts of keys, routes and shards are what the shards hold",
  countOff.length === 0,
  countOff.length
    ? countOff.map(([n, c, h]) => `${n}: index says ${Number.isNaN(c) ? "nothing" : c.toLocaleString()}, shards hold ${h.toLocaleString()}`).join(" · ")
    : `keys ${keys.toLocaleString()} · routes ${rows.toLocaleString()} · shards ${bins.length}`);

const claimedBytes = claimed("shard_bytes_total");
check("L10  the index's shard byte total is what the shards weigh on disk",
  claimedBytes === bytesOnDisk,
  claimedBytes === bytesOnDisk
    ? `${bytesOnDisk.toLocaleString()} bytes`
    : `index says ${Number.isNaN(claimedBytes) ? "nothing" : claimedBytes.toLocaleString()}, shards weigh ${bytesOnDisk.toLocaleString()}; the index describes shards that are not the ones shipped`);

// ── what this does not say ────────────────────────────────────────────────
console.log("\n  what this does not say: that every route whose M is complete was shipped.");
console.log("  That needs the sealed input packages, which are not on this shelf; where");
console.log("  they are mounted, check-nothing-invented-v1 reads them. This reads only what");
console.log("  ships, and says whether what ships keeps the shape the build promised.");

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
