// Synthesis lane · zone-gloss-rule-v4-reading-level-antiquity-1940-lastuary
//
// The default reading printed under a word used to be chosen in the browser,
// which meant the rule lived in a page: it could not be reviewed, diffed, or
// rerun. It lives here now, in one function, and both the table emitter and
// the zone builder call it. The page still computes the same pool for the HUD
// — it has to, so the pill that comes up pressed is the reading already
// printed under the word — but what they agree on is a build output.
//
// The rule, declared before output:
//   1. Key exactly. A gloss is found by the byte-exact K of the written form
//      (k-normalization-v1.mjs, FRAME rule 7). Nothing folded, nothing split.
//   2. A route text packs senses with ";", and a sense divides into readings
//      at the commas outside the provider's parentheses — sense-split-rule-v2,
//      imported from its own file, never re-guessed here. One reading is
//      displayed at a time, in every packing — so a stored gloss is one
//      reading, never a joined list. A sense the rule holds back as damaged
//      is not printable and does not pool: corrupted text is not a word's face.
//   3. Senses pool across every exact route for that K, deduped by lowercased
//      text, merging the OLDEST source year and the LOWEST semantic rank seen.
//   4. Antiquity leads: senses whose oldest source is 1940 or earlier come
//      first, everything later and everything unyeared follows. Within a tier,
//      older first, then the catalog's own semantic rank.
//
//      The number 1940 is this project's, not anybody's record. Nothing
//      attests it, no source proposes it, and it was chosen here. It sits in
//      the rule's own name, which advertises it as the thing deciding which
//      reading a reader meets first — and it is not.
//
//      Measured over the 4,984 distinct keys the store answers for in Genesis:
//      moving the cutoff to 1900 changes 0 printed readings. Moving it to 1950
//      changes 0. Removing the tier entirely changes 0. It cannot change any,
//      because the sort that follows it is already ascending by year and an
//      unyeared sense carries Infinity — so the tier can only ever agree with
//      the comparison after it. It is inert.
//
//      It is left in place rather than removed because the rule id is written
//      into the receipts of every zone already published, and rebuilding the
//      corpus to delete a clause that does nothing is a worse trade than
//      saying plainly that it does nothing. check-antiquity-tier-v1 asserts
//      the inertness on every run, so if a catalog ever arrives where the tier
//      would decide something, that is a finding and not a surprise.
//   5. A route whose M record is missing from the store index is not eligible
//      — the page would have no license to print beside it.
//   6. The sense is stored verbatim, "/" morpheme packing included. The page
//      joins those spans with " + " at render; the ledger text is never
//      rewritten here.

import { readFileSync, existsSync } from "node:fs";
import { senseSplit as readingSplit } from "./sense-split-v1.mjs";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";

export const GLOSS_RULE_ID = "zone-gloss-rule-v4-reading-level-antiquity-1940-lastuary";
export const GLOSS_RULE_TEXT =
  "a route text packs senses with ';' and a sense divides into readings at the commas outside the " +
  "provider's parentheses (sense-split-rule-v2); each division is one reading; a damaged sense is " +
  "held whole and neither printed nor pooled; pool = every reading of every exact route, deduped by " +
  "text with min year and min rank; oldest source year (<=1940 tier) leads, ties by semantic rank; " +
  "reading stored verbatim; the page joins '/'-packed spans with ' + '; " +
  "one reading on display at a time, everywhere";

export const openRouteStore = (storeDir) => {
  const index = JSON.parse(readFileSync(join(storeDir, "index.json"), "utf8"));
  if (index.schema_version !== "ROUTE_STORE_V1")
    throw new Error(`unexpected store schema ${index.schema_version} — refusing output`);

  const shardCache = new Map();
  const shardBody = (name) => {
    if (!shardCache.has(name)) {
      const p = join(storeDir, "shards", `${name}.bin`);
      shardCache.set(name, existsSync(p) ? JSON.parse(gunzipSync(readFileSync(p)).toString("utf8")) : {});
    }
    return shardCache.get(name);
  };
  const shardOf = (k) => createHash("sha256").update(k, "utf8").digest("hex").slice(0, 2);

  /** Every exact route row for K, or null when the catalog has no exact entry. */
  const routesFor = (k) => shardBody(shardOf(k))[k] || null;

  const packSplit = (text) => {
    const t = String(text || "");
    const out = []; let start = 0, d = 0;
    for (let i = 0; i < t.length; i += 1) {
      const c = t[i];
      if (c === "(") d += 1;
      else if (c === ")") { if (d > 0) d -= 1; }
      else if (c === ";" && d === 0) { out.push(t.slice(start, i)); start = i + 1; }
    }
    out.push(t.slice(start));
    if (out.join(";") !== t) return [t.trim()].filter(Boolean);
    return out.map((x) => x.trim()).filter(Boolean);
  };

  /** THE ORDERS A READER MAY PUT THE POOL IN.
   *
   *  Rule 4 above is one of them and stays the default, because it is the one
   *  every published zone was built under. The others are the reader's own
   *  positions, and they are computed HERE rather than in the page for the
   *  same reason rule 4 is: an order that lives in a browser cannot be
   *  reviewed, diffed or rerun, and an order chosen at read time can fail its
   *  fetch and leave the page showing one thing while it claims another.
   *
   *    oldest      antiquity tier, then year, then the catalog's rank — rule 4.
   *    characters  the catalog's own rank alone, undisturbed. This is the
   *                order the shelf's keys are made in, so it disturbs nothing.
   *    corpus      witnesses the corpus lane declared BIBLICAL first; everything
   *                else keeps its own order under them. Note what this does NOT
   *                do: it does not rank UNDECLARED below anything. Unknown is
   *                not the same as later, and ordering on unknown would be the
   *                claim this project refuses — so undeclared and declared-other
   *                share one bucket and are separated only by the rule above.
   */
  const ORDERS = ["oldest", "characters", "corpus"];

  /** Rules 2–5. The ordered reading pool for one K; [] when nothing displays. */
  const readingPool = (routes, order = "oldest", corpusOf = null) => {
    const groups = new Map();
    let arrived = 0;
    (routes || []).forEach((row) => {
      const [rank, routeText, , mId, year] = row;
      if (!index.m_sources[mId]) return; // rule 5
      const parsed = Number.parseInt(year, 10);
      const yr = Number.isInteger(parsed) ? parsed : Infinity;
      // The pack mark separates at parenthesis depth zero and nowhere else: a
      // semicolon inside the provider's own brackets is part of what the
      // bracket says, and cutting there produces a run they never wrote.
      // Each sense then divides into readings under the declared comma rule;
      // a sense the rule holds back as damaged is provider text something
      // already edited — it neither prints nor pools.
      packSplit(routeText).forEach((sense) => {
        const r = readingSplit(sense);
        if (r.damaged) return;
        r.readings.forEach((reading) => {
          const key = reading.toLowerCase();
          const g = groups.get(key);
          // The corpus rank merges the same way year and rank do: a reading
          // carried by any BIBLICAL witness is a BIBLICAL-carried reading,
          // whatever else also carries it.
          const cr = corpusOf && corpusOf(mId) === "BIBLICAL" ? 0 : 1;
          if (!g) groups.set(key, { text: reading, year: yr, ledger: Number(rank), corpus: cr, at: arrived += 1 });
          else {
            g.year = Math.min(g.year, yr);
            g.ledger = Math.min(g.ledger, Number(rank));
            g.corpus = Math.min(g.corpus, cr);
          }
        });
      });
    });
    const tier = (r) => (Number.isFinite(r.year) && r.year <= 1940 ? 0 : 1);
    const byOldest = (a, b) => tier(a) - tier(b) || a.year - b.year || a.ledger - b.ledger;
    // Every order ends in the same tie-break, so two readings the order cannot
    // separate come out in the order rule 4 gives them rather than in whatever
    // order the shards happened to be read in.
    const cmp = order === "characters"
      ? (a, b) => a.ledger - b.ledger || byOldest(a, b) || a.at - b.at
      : order === "corpus"
        ? (a, b) => a.corpus - b.corpus || byOldest(a, b)
        : byOldest;
    return [...groups.values()].sort(cmp);
  };

  /**
   * Rule 6. The one reading a zone prints under this form, or null.
   * Returns why it is null so a builder can count the two cases apart:
   * a form the catalog never carries, and a form whose every route is
   * unlicensed to display.
   */
  const glossFor = (k, order = "oldest", corpusOf = null) => {
    const routes = routesFor(k);
    if (!routes) return { text: null, reason: "NO_EXACT_ROUTE" };
    const pool = readingPool(routes, order, corpusOf);
    if (!pool.length) return { text: null, reason: "NO_DISPLAYABLE_ROUTE" };
    return { text: pool[0].text, reason: null, pool_size: pool.length };
  };

  /** Build the K -> sense table for exactly the forms a zone contains.
   *
   *  `table` is the default order and is what it has always been, byte for
   *  byte, so every zone already published and every guard over them is
   *  unaffected. `deltas` carries the other orders — and carries only the
   *  keys where an order DISAGREES with the default. Three full columns would
   *  have tripled the table to say the same thing three times: measured on
   *  Genesis, most keys have one reading, and most of the rest are read the
   *  same way by every order. A key absent from a delta is not a gap and not
   *  a fallback; it is the positive fact that this order agrees here.
   *
   *  A caller with no corpus record gets no corpus column at all rather than
   *  a corpus column that quietly equals the default — a position whose
   *  record is missing is a position that is not live, and it must be
   *  possible to tell those apart from outside.
   */
  const tableFor = (keys, opts = {}) => {
    const corpusOf = opts.corpusOf || null;
    const orders = ORDERS.filter((o) => o !== "oldest" && (o !== "corpus" || corpusOf));
    const table = {};
    const deltas = {};
    for (const o of orders) deltas[o] = {};
    const counts = { keys_asked: 0, glossed: 0, no_exact_route: 0, no_displayable_route: 0 };
    for (const k of [...new Set(keys)].sort()) {
      counts.keys_asked += 1;
      const g = glossFor(k);
      if (g.text === null) {
        counts[g.reason === "NO_EXACT_ROUTE" ? "no_exact_route" : "no_displayable_route"] += 1;
        continue;
      }
      table[k] = g.text;
      counts.glossed += 1;
      if (g.pool_size > 1) for (const o of orders) {
        const alt = glossFor(k, o, corpusOf);
        if (alt.text !== null && alt.text !== g.text) deltas[o][k] = alt.text;
      }
    }
    const body = JSON.stringify(table);
    for (const o of orders) counts[`differs_${o}`] = Object.keys(deltas[o]).length;
    return { table, deltas, counts, sha256: createHash("sha256").update(body).digest("hex") };
  };

  // packSplit rides on the store so a consumer that must ask "which licensed
  // route carries this exact reading" divides the route text under the
  // store's own depth rule instead of re-implementing it.
  return { index, routesFor, readingPool, glossFor, tableFor, packSplit, ORDERS };
};
