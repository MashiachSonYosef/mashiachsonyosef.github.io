// Synthesis lane · zone-gloss-rule-v3-sense-level-antiquity-1940-lastuary
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
//   2. A route text packs senses with ";". Each sense is its own reading.
//      One reading is displayed at a time, in every packing — so a stored
//      gloss is one sense, never a joined list.
//   3. Senses pool across every exact route for that K, deduped by lowercased
//      text, merging the OLDEST source year and the LOWEST semantic rank seen.
//   4. Antiquity leads: senses whose oldest source is 1940 or earlier come
//      first, everything later and everything unyeared follows. Within a tier,
//      older first, then the catalog's own semantic rank.
//   5. A route whose M record is missing from the store index is not eligible
//      — the page would have no license to print beside it.
//   6. The sense is stored verbatim, "/" morpheme packing included. The page
//      joins those spans with " + " at render; the ledger text is never
//      rewritten here.

import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";

export const GLOSS_RULE_ID = "zone-gloss-rule-v3-sense-level-antiquity-1940-lastuary";
export const GLOSS_RULE_TEXT =
  "a route text packs senses with ';' — each sense is its own reading; pool = every sense of every " +
  "exact route, deduped by text with min year and min rank; oldest source year (<=1940 tier) leads, " +
  "ties by semantic rank; sense stored verbatim; the page joins '/'-packed spans with ' + '; " +
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

  /** Rules 2–5. The ordered reading pool for one K; [] when nothing displays. */
  const readingPool = (routes) => {
    const groups = new Map();
    (routes || []).forEach((row) => {
      const [rank, routeText, , mId, year] = row;
      if (!index.m_sources[mId]) return; // rule 5
      const parsed = Number.parseInt(year, 10);
      const yr = Number.isInteger(parsed) ? parsed : Infinity;
      String(routeText || "")
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((sense) => {
          const key = sense.toLowerCase();
          const g = groups.get(key);
          if (!g) groups.set(key, { text: sense, year: yr, ledger: Number(rank) });
          else {
            g.year = Math.min(g.year, yr);
            g.ledger = Math.min(g.ledger, Number(rank));
          }
        });
    });
    const tier = (r) => (Number.isFinite(r.year) && r.year <= 1940 ? 0 : 1);
    return [...groups.values()].sort(
      (a, b) => tier(a) - tier(b) || a.year - b.year || a.ledger - b.ledger,
    );
  };

  /**
   * Rule 6. The one reading a zone prints under this form, or null.
   * Returns why it is null so a builder can count the two cases apart:
   * a form the catalog never carries, and a form whose every route is
   * unlicensed to display.
   */
  const glossFor = (k) => {
    const routes = routesFor(k);
    if (!routes) return { text: null, reason: "NO_EXACT_ROUTE" };
    const pool = readingPool(routes);
    if (!pool.length) return { text: null, reason: "NO_DISPLAYABLE_ROUTE" };
    return { text: pool[0].text, reason: null, pool_size: pool.length };
  };

  /** Build the K -> sense table for exactly the forms a zone contains. */
  const tableFor = (keys) => {
    const table = {};
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
    }
    const body = JSON.stringify(table);
    return { table, counts, sha256: createHash("sha256").update(body).digest("hex") };
  };

  return { index, routesFor, readingPool, glossFor, tableFor };
};
