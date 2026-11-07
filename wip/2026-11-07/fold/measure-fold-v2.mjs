// the fold (v142 item 4; Moses's items 3 and 5), measured on lattice v12's cards against the served store's pool (the reader's own readings and carriers)
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { openRouteStore, readingKey } from "<scratchpad>/pt/reader/tools/gloss-store-v1.mjs";
const S = "<scratchpad>";
const LAT = `${S}/lattice-dl/moses-ledgers/lattice-v12`, ZN = `${S}/old/reader/data/zones`;
const store = openRouteStore(`${S}/pt/reader/data/route-store`);
const labelOf = (m) => (store.index.m_sources[m] || {}).label || m;
const tableYear = (m) => { const y = Number.parseInt((store.index.m_sources[m] || {}).sourceYear, 10); return Number.isInteger(y) ? y : Infinity; };
const yr = (y) => { const n = Number.parseInt(String(y ?? ""), 10); return Number.isInteger(n) ? n : Infinity; };
const books = readdirSync(LAT).filter((f) => f.startsWith("routes-") && f.endsWith("-v12.jsonl.gz")).map((f) => f.slice(7, -13)).sort();
const lines = (b) => gunzipSync(readFileSync(`${LAT}/routes-${b}-v12.jsonl.gz`)).toString("utf8").split("\n").filter(Boolean);
// pass 1: the lattice's own year per source, read off its single-source cards (the mode of their earliest_year)
const votes = new Map();
for (const b of books) for (const line of lines(b)) { const r = JSON.parse(line); for (const c of r.routes || []) { const s = c.sources || []; if (s.length !== 1) continue; const y = yr(c.earliest_year); if (!Number.isFinite(y)) continue; if (!votes.has(s[0])) votes.set(s[0], new Map()); const v = votes.get(s[0]); v.set(y, (v.get(y) || 0) + 1); } }
const latYear = new Map(); for (const [s, v] of votes) latYear.set(s, [...v.entries()].sort((a, c) => c[1] - a[1])[0][0]);
const DAVIDSON = [...latYear.keys()].find((s) => /Davidson/u.test(s));
// pass 2
const C = {}; const inc = (k, n = 1) => { C[k] = (C[k] || 0) + n; };
const ex = { fold: [], yeartable: [], lead_fold: [], lead_both: [], davidson: [] };
const roadA = new Set(); let roadBgz = 0; const seen = new Set();
const ERA = 1940; const tier = (y) => (Number.isFinite(y) && y <= ERA ? 0 : 1);
const leadOf = (groups, yearOf) => { let best = null; for (const g of groups) { const y = yearOf(g); const key = [tier(y), y, g.ledger]; if (!best || key[0] < best.k[0] || (key[0] === best.k[0] && (key[1] < best.k[1] || (key[1] === best.k[1] && key[2] < best.k[2])))) best = { k: key, g }; } return best ? best.g : null; };
for (const b of books) {
  const zone = JSON.parse(gunzipSync(readFileSync(`${ZN}/${b}.bin`)).toString("utf8"));
  const words = new Map(); for (const sec of zone.sections || []) for (const w of sec.words || []) if (!w.mark && w.k) words.set(w.k, (words.get(w.k) || 0) + 1);
  const sidecar = {};
  for (const line of lines(b)) {
    const r = JSON.parse(line); const k = r.key; const routes = store.routesFor(k);
    if (!r.in_store || !routes) { inc("keys_not_in_store"); continue; }
    inc("book_keys"); const first = !seen.has(k); if (first) { seen.add(k); inc("keys_distinct"); }
    const pool = store.readingPool(routes, "oldest"); const byKey = new Map(); for (const g of pool) byKey.set(readingKey(g.text), g);
    const foldY = new Map(), bothY = new Map();
    for (const c of r.routes || []) {
      inc("cards"); const d = readingKey(c.text); const g = byKey.get(d);
      if (!g) { inc("card_text_not_a_pool_reading"); continue; }
      inc("cards_matched");
      const srcs = new Set(c.sources || []); const carriers = new Set(g.by.map(labelOf)); const missing = [...srcs].filter((s) => !carriers.has(s)); const kept = [...srcs].filter((s) => carriers.has(s));
      if (missing.length) { inc("cards_with_a_witness_the_store_lacks"); inc("witnesses_the_store_lacks", missing.length); if (first) for (const s of missing) roadA.add(`${k}\u0001${d}\u0001${s}`); }
      const yMissing = Math.min(Infinity, ...missing.map((s) => latYear.get(s) ?? Infinity));
      const yKeptLat = Math.min(Infinity, ...kept.map((s) => latYear.get(s) ?? Infinity));
      if (yMissing < g.year) { inc("cards_with_an_older_witness_the_store_dropped"); foldY.set(g, yMissing); bothY.set(g, yMissing); if (ex.fold.length < 40 && first) ex.fold.push({ book: b, key: k, text: g.text, store_year: g.year === Infinity ? null : g.year, store_by: g.by, dropped: missing.filter((s) => (latYear.get(s) ?? Infinity) === yMissing).slice(0, 3), dropped_year: yMissing }); }
      if (yKeptLat < g.year) { inc("cards_whose_carrier_the_store_knows_no_year_for"); bothY.set(g, Math.min(bothY.get(g) ?? Infinity, yKeptLat)); if (ex.yeartable.length < 30 && first) ex.yeartable.push({ book: b, key: k, text: g.text, store_year: g.year === Infinity ? null : g.year, store_by: g.by, lattice_year: yKeptLat, carriers_with_that_year: kept.filter((s) => (latYear.get(s) ?? Infinity) === yKeptLat).slice(0, 3) }); }
      if (DAVIDSON && srcs.has(DAVIDSON) && !g.by.includes("M97")) { inc("cards_davidson_witnessed_not_carried"); if (ex.davidson.length < 20 && first) ex.davidson.push({ book: b, key: k, text: g.text, store_year: g.year === Infinity ? null : g.year, store_by: g.by }); }
      if (missing.length) (sidecar[k] ||= {})[d] = [missing, Number.isFinite(yMissing) ? yMissing : null];
    }
    const a = leadOf(pool, (g) => g.year);
    if (foldY.size) { const z = leadOf(pool, (g) => Math.min(g.year, foldY.get(g) ?? Infinity)); if (a !== z) { inc("book_keys_lead_moves_fold"); inc("words_lead_moves_fold", words.get(k) || 0); if (first) inc("keys_lead_moves_fold"); if (ex.lead_fold.length < 50 && first) ex.lead_fold.push({ book: b, key: k, from: a && a.text, to: z && z.text, to_year: foldY.get(z), words: words.get(k) || 0 }); } }
    if (bothY.size) { const z = leadOf(pool, (g) => Math.min(g.year, bothY.get(g) ?? Infinity)); if (a !== z) { inc("book_keys_lead_moves_fold_and_years"); inc("words_lead_moves_fold_and_years", words.get(k) || 0); if (first) inc("keys_lead_moves_fold_and_years"); if (ex.lead_both.length < 30 && first) ex.lead_both.push({ book: b, key: k, from: a && a.text, to: z && z.text, to_year: bothY.get(z), words: words.get(k) || 0 }); } }
  }
  const raw = Buffer.from(JSON.stringify(sidecar)); const { gzipSync } = await import("node:zlib"); roadBgz += gzipSync(raw).length;
  console.error(b, JSON.stringify(C).slice(0, 200));
}
C.roadA_rows_added_upper_bound = roadA.size; C.roadB_bytes_gz_total = roadBgz;
const years = Object.fromEntries([...latYear.entries()].sort((a, c) => a[1] - c[1]));
writeFileSync(`${S}/v16/fold/measure-v2.json`, JSON.stringify({ rule: "lattice v12 cards (text, sources, earliest_year) against the served store's pool (tools/gloss-store-v1.mjs readingPool: readings under the ledgers, carriers, oldest year), store 3d8c4ef86c01; the lattice's year per source read off its single-source cards", totals: C, lattice_years: years, examples: ex }, null, 1));
console.log(JSON.stringify(C, null, 1)); console.log("davidson label:", DAVIDSON, "lattice year", latYear.get(DAVIDSON));
