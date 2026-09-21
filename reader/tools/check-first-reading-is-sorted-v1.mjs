#!/usr/bin/env node
// GUARDS: reading-order-rule-v1-the-first-reading-is-the-sorted-pools-first-and-not-the-stores-first-stored-row
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// WHICH READING ANSWERS FIRST, settled against the page rather than argued.
//
// Two lanes disagreed about this on 2026-09-21 and the disagreement decided
// the worth of a repair. One lane read the SHARD and reported the order the
// rows are stored in. The other read the ENGINE and reported the order the
// page sorts them into. Those are different orders, and everything downstream
// — which source a reader actually meets, what a cut is worth — follows from
// which one the page serves.
//
// So this stops being a thing either lane remembers. The rule:
//
//   the first reading a reader is shown is the first element of the SORTED
//   pool. It is not the store's first stored row, and reading one is not
//   exempt from the sort that orders readings two onward.
//
// The instrument is the disagreement itself. This walks the served book's
// own keys and looks for one where the two orders answer differently — a key
// whose lowest-ranked row is not the row the page's default order (oldest
// first: the pre-1940 tier, then year, then rank) would put in front. That
// key is the whole test: if the page serves the sorted answer the rule holds,
// and if it serves the stored answer the rule is broken and every count that
// rests on source order is wrong.
//
// Nothing here is typed. The book comes from the shelf, the key comes from
// the store, and the expected reading is computed from the rows — a check
// that named its own example would stop testing the day the store moved.
//
//   L1  the shelf offers a key where the two orders disagree
//   L2  the page answers there from the OLDEST year the key carries
//   L3  and not from its first stored row, which is not the oldest
//   L4  the engine draws its pills from a sorted pool, whole, with no
//       first element held out of the sort
//
// Not covered: whether the sorted answer is the RIGHT answer. That is a
// question about the catalog, and no amount of ordering makes a mis-keyed
// row belong to the word it sits on.
//
// Run: node tools/check-first-reading-is-sorted-v1.mjs [url]
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { zonesOnDisk } from "./zones-on-disk-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

const ARG = process.argv[2] || "";
const BASE = (ARG || "http://127.0.0.1:8899/zone.html").split("?")[0];
const BOOK = (ARG.match(/[?&]b=([a-z0-9-]+)/) || [])[1] || zonesOnDisk()[0];

const ZONE = join(K3, "data", "zones", `${BOOK}.bin`);
const SHARDS = join(K3, "data", "route-store", "shards");
if (!existsSync(ZONE)) { console.log(`SKIPPED — no zone on disk for ${BOOK}`); process.exit(3); }
if (!existsSync(SHARDS)) { console.log("SKIPPED — no route store shards on disk to read an order out of"); process.exit(3); }

// ── the store, and the two orders it can be read in ───────────────────────
const shardCache = new Map();
const rowsFor = (k) => {
  const sh = createHash("sha256").update(Buffer.from(k, "utf8")).digest("hex").slice(0, 2);
  if (!shardCache.has(sh)) {
    const p = join(SHARDS, `${sh}.bin`);
    try { shardCache.set(sh, JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"))); }
    catch { shardCache.set(sh, {}); }
  }
  return shardCache.get(sh)[k] || null;
};
// THE ENGINE'S OWN COMPARATOR, in the engine's own terms (zone.html,
// oldestFirst): a pre-1940 tier, then the year, then the store's rank. A
// second opinion typed here would test this file against itself, so the
// shape is lifted from the engine and L4 holds the engine to it.
const yearOf = (r) => { const y = String(r[4]); return /^\d{4}$/.test(y) ? Number(y) : Infinity; };
const tierOf = (r) => (yearOf(r) <= 1940 ? 0 : 1);
const oldestFirst = (rs) => [...rs].sort((a, b) => tierOf(a) - tierOf(b) || yearOf(a) - yearOf(b) || a[0] - b[0])[0];
const storedFirst = (rs) => [...rs].sort((a, b) => a[0] - b[0])[0];

const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

// ── L1 · a key on this book where the two orders answer differently ───────
// Only the first section, because the test presses the word on the page and
// the page draws the opening screen. A book whose first screen offers no
// disagreement skips rather than reaching for a word a reader cannot see.
const zone = JSON.parse(gunzipSync(readFileSync(ZONE)).toString("utf8"));
const firstSection = (zone.sections || [])[0] || { words: [] };
let site = null;
(firstSection.words || []).forEach((w, i) => {
  if (site || !w.k) return;
  const rs = rowsFor(w.k);
  if (!rs || rs.length < 2) return;
  const sorted = oldestFirst(rs), stored = storedFirst(rs);
  // the two orders must disagree on the row's AGE, which is what L2 judges;
  // a key whose stored-first row is already the oldest cannot tell them apart
  if (norm(sorted[1]) === norm(stored[1])) return;
  if (yearOf(stored) === Math.min(...rs.map(yearOf))) return;
  site = { i, key: w.k, surface: w.s, sorted, stored, rows: rs.length };
});

check("L1  the shelf offers a key where the stored order and the sorted order disagree",
  !!site,
  site ? `${site.key} · ${site.rows} rows · stored first is rank ${site.stored[0]} (${site.stored[4]}), sorted first is rank ${site.sorted[0]} (${site.sorted[4]})` : "");
if (!site) {
  console.log(`SKIPPED — every key on the opening screen of ${BOOK} answers the same in both orders, so nothing here can tell them apart`);
  process.exit(3);
}

// ── the page ──────────────────────────────────────────────────────────────
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.goto(`${BASE}?b=${BOOK}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.waitForTimeout(2600);
await p.evaluate((n) => {
  const wb = document.querySelectorAll("section.seg .he-text .wb")[n];
  (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
}, site.i);
await p.waitForTimeout(3200);
// the pool as the page sorted it, off the page's own exposure rather than
// read back out of the pills
const pool = await p.evaluate(() => (window.__pool || []).slice(0, 8));

const first = norm(pool[0]);
// A route is sense-split and reading-split before it becomes a pill, and the
// groups are keyed by the reading with the LOWEST rank any row gave it — so a
// pill cannot be traced back to one row by its wording, and several rows can
// share a rank. What is judged is therefore the thing the rule is actually
// about: the AGE of the row the first pill came from. An order that sorts
// oldest first must answer from the oldest year the key carries; an order
// that serves the stored row answers from whatever year happens to sit at
// rank one. This survives the split, the grouping and a tie.
const from = (row) => { const r = norm(row[1]); return !!first && (first === r || r.includes(first) || first.includes(r)); };
const rowsHere = rowsFor(site.key) || [];
const minYear = Math.min(...rowsHere.map(yearOf));
const carriers = rowsHere.filter(from);
const carrierYears = [...new Set(carriers.map(yearOf))].sort((a, b) => a - b);

check("L2  the page serves a reading from the OLDEST year this key carries",
  pool.length > 0 && carriers.length > 0 && carrierYears[0] === minYear,
  `first pill ${JSON.stringify(pool[0] ?? null)} · carried at ${carrierYears.join(", ") || "no row"} · oldest year on this key is ${minYear}`);

check("L3  and not the store's first stored row",
  pool.length > 0 && !(carriers.length === 1 && carriers[0] === site.stored) && yearOf(site.stored) !== minYear,
  `stored first is ${JSON.stringify(String(site.stored[1]).slice(0, 40))} (${site.stored[3]}, ${site.stored[4]}, rank ${site.stored[0]}) — ${yearOf(site.stored)}, not the oldest`);

// ── L4 · the engine holds no first element out of the sort ────────────────
// L2 and L3 prove the order at one key. This proves the SHAPE: the pills are
// drawn from a sorted pool, whole. A draw that sorted the tail and pinned the
// head would pass L2 at a key whose stored first happens to sort first, and
// this is what would catch it.
const engine = readFileSync(join(K3, "zone.html"), "utf8");
const draw = (engine.match(/const drawPills = \(\) => \{[\s\S]*?\n {6}\};/) || [""])[0];
check("L4  the engine draws its pills from a sorted pool, whole",
  /sortPool\(\[\.\.\.pool\]/.test(draw) && /sorted\.forEach\(/.test(draw)
    && !/sorted\.slice\(1\)|sorted\.shift\(|pool\[0\]/.test(draw),
  draw ? "sortPool over the whole pool, every element appended, no head held out" : "drawPills not found — the draw moved and this law needs re-reading against it");

await b.close();

console.log(`
  ${BOOK} · ${site.key} · ${site.rows} store rows
  stored order would answer : ${String(site.stored[1]).slice(0, 52)}   (${site.stored[3]}, ${site.stored[4]}, rank ${site.stored[0]})
  the page answers          : ${String(pool[0] ?? "(nothing)").slice(0, 52)}

  what this does not say: that the answer is right. Order decides which source
  a reader meets first; it cannot make a mis-keyed row belong to its key.
`);
console.log(bad ? `${bad} FAILED` : "all checks passed");
process.exit(bad ? 1 : 0);
