// Synthesis lane · zone-gloss-rule-v5-ledger-division-antiquity-1940-lastuary
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
//      at the commas outside the provider's parentheses where every piece is a gloss — sense-split-rule-v3,
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

export const GLOSS_RULE_ID = "zone-gloss-rule-v5-ledger-division-antiquity-1940-lastuary";
// the era cut, one constant: 1940 AD is 5700 AM, the last year of the 57th
// century; the engine derives the same number from ERA_CUT_AM
export const ERA_CUT_AD = 1940;
export const GLOSS_RULE_TEXT =
  "a source under a ledger (index.m_sources[m].ledger; ledger-division-rule-v2) divides its route text into readings " +
  "only at the marks its row names (row[7]), prints the texts its print slot names (row[8]: a part of itself, or no pill) where its ledger and the owner say so, and a row that names neither is one reading as the source wrote it, brackets and all; " +
  "a source with no ledger packs senses with ';' and a sense divides into readings at the commas outside the " +
  "provider's parentheses, where every piece is shaped like a gloss (sense-split-rule-v3); each division is one reading; a damaged sense is " +
  "held whole and neither printed nor pooled; pool = every reading of every exact route, deduped by " +
  "text with min year and min rank; oldest source year (<=1940 tier) leads, ties by semantic rank; " +
  "reading stored verbatim; the page joins '/'-packed spans with ' + '; " +
  "one reading on display at a time, everywhere";

// THE SWITCH, declared here rather than in the check that guards it, because a
// rule whose only witness is its own guard has no author.
//
// A reader may turn a source off. For that to mean anything, a reading has to
// remember who carried it — and until 2026-09-15 it did not: the pool merged
// year and rank and threw identity away, so a switch had nothing to subtract
// and an attribution had nothing to read. The rule is what that costs to fix,
// written out so it cannot quietly narrow to whatever the code does today.
export const SWITCH_RULE_ID = "source-switch-rule-v1-a-reading-remembers-who-carried-it";
export const SWITCH_RULE_TEXT =
  "every pooled reading names, in `by`, the m ids whose licensed routes yield that exact reading, " +
  "and that set survives the merge which collapses year, rank and corpus; `sole` is true of exactly " +
  "one carrier; `omit` withholds those ids' routes BEFORE the pool is built, never filters readings " +
  "after, so order and tie-breaks run unchanged over what is left; a switched pool holds no reading " +
  "the unswitched pool did not hold; and a pool the switch emptied is named apart from a form the " +
  "catalog never carried";

export const openRouteStore = (storeDir) => {
  const index = JSON.parse(readFileSync(join(storeDir, "index.json"), "utf8"));
  // v1, or v2 — the same rows with one slot added at [6], the source's own
  // headwords (pointing-store-landing-rule-v1: the served v2 folds to the
  // served v1 byte for byte), and from 6 November 2026 a slot at [7] on the
  // rows a ledger divides (ledger-division-rule-v2), read by readingsOf below.
  if (index.schema_version !== "ROUTE_STORE_V1" && index.schema_version !== "ROUTE_STORE_V2")
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

  /** LEDGER DIVISION (ledger-division-rule-v2, 6 November 2026). The readings
   *  of one store row. A source under a ledger (index.m_sources[m].ledger: the
   *  corpus lane's own declaration of every mark of that dictionary, ask v1.1)
   *  divides only where tools/apply-ledger-divisions-v1.mjs wrote the marks
   *  into row[7] from the source's own classifier under the owner's answers;
   *  with no slot the row is one reading, as the source wrote it, brackets and
   *  all: the ledger declared every mark, so nothing is "damaged" and nothing
   *  is hidden. A source with no ledger keeps the generic rule: senses at the
   *  pack mark, readings at the comma rule, a damaged sense held back. From 7
   *  November 2026 every store source is under a ledger (Strong's 1890, the
   *  last, untabled by the owner); the dictionaries beside the store and the
   *  span store's own two sources keep the generic rule until their ledgers
   *  land, and the store's index names them (index.ledgers.unledgered). */
  const ledgerOf = (mId) => ((index.m_sources || {})[String(mId)] || {}).ledger || null;
  const genericReadings = (text) => {
    const out = [];
    for (const sense of packSplit(text)) { const r = readingSplit(sense); if (r.damaged) continue; out.push(...r.readings); }
    return out;
  };
  const readingsOf = (row) => {
    const text = String(row[1] ?? "");
    if (!ledgerOf(row[3])) return genericReadings(text);
    // the print slot (ledger-division-rule-v2): where the row's ledger and the
    // owner's answer say the row prints a part of itself, or no pill, row[8]
    // holds the texts ([] for no pill), and the row prints those and nothing else
    if (Array.isArray(row[8])) return row[8].map((x) => String(x));
    const cuts = Array.isArray(row[7]) ? row[7] : [];
    if (!cuts.length) { const t = text.trim(); return t ? [t] : []; }
    const pieces = []; let from = 0;
    for (const i of cuts) { pieces.push(text.slice(from, i)); from = i + 1; }
    pieces.push(text.slice(from));
    return pieces.map((x) => x.trim()).filter(Boolean);
  };
  /** The served row a text the corpus lane shipped came from (the witnessed
   *  orders: a row's whole text, or, before 6 November, a piece the generic
   *  rule cut from one). The credited sources' rows are searched first, and
   *  the others only when none of theirs accounts for the text: the row whose
   *  route is the text, else one whose readings under the store's rule now
   *  hold it, else one whose generic readings hold it. null where no served
   *  row accounts for the text. (The code review of 6 November 2026: an exact
   *  row of ANY source was taken before the credited source's holding row, so
   *  a column kept a reading its credited source no longer gave.) */
  const rowOfText = (k, text, mIds = null) => {
    const t = String(text ?? "");
    const rows = (routesFor(k) || []).filter((r) => (index.m_sources || {})[r[3]]);
    const ids = Array.isArray(mIds) ? mIds.map(String) : [];
    const tl = t.toLowerCase();
    const exact = (list) => list.find((r) => String(r[1]) === t) || null;
    const holds = (list) => list.find((r) => readingsOf(r).some((x) => x.toLowerCase() === tl)) || list.find((r) => genericReadings(String(r[1])).some((x) => x.toLowerCase() === tl)) || null;
    if (ids.length) { const mine = rows.filter((r) => ids.includes(String(r[3]))); const hit = exact(mine) || holds(mine); if (hit) return hit; }
    const others = ids.length ? rows.filter((r) => !ids.includes(String(r[3]))) : rows;
    return exact(others) || holds(others);
  };
  /** The readings the store gives such a text now: its row's; a text no served row
   *  accounts for has none, since the card holds none (7 November 2026: until then
   *  the generic rule cut such a text, and a column could name a reading no card held). */
  const readingsOfText = (k, text, mIds = null) => {
    const row = rowOfText(k, text, mIds);
    return row ? readingsOf(row) : [];
  };
  /** The m ids a source label names, for a credit that carries the label alone. */
  const mIdsOfLabel = (label) => Object.entries(index.m_sources || {}).filter(([, s]) => s && s.label === label).map(([id]) => id);

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
  // `omit` is the source switch, and it lives here rather than on the page
  // because a page that filters readings after the fact is a page choosing
  // what a source said. Given a set of m ids, their routes never enter the
  // pool at all, and everything downstream — the order, the tie-breaks, what
  // leads — runs exactly as it always does over what is left. Switching every
  // source off leaves an empty pool, which is a bare word: a finding, not an
  // error, and the frame already rules it so.
  const readingPool = (routes, order = "oldest", corpusOf = null, omit = null) => {
    const groups = new Map();
    let arrived = 0;
    (routes || []).forEach((row) => {
      const [rank, routeText, , mId, year] = row;
      if (!index.m_sources[mId]) return; // rule 5
      if (omit && omit.has(mId)) return;
      const parsed = Number.parseInt(year, 10);
      const yr = Number.isInteger(parsed) ? parsed : Infinity;
      // The row's readings are what its source's rule gives (readingsOf above):
      // a ledgered source's own division, or the generic one. Under the generic
      // rule the pack mark separates at parenthesis depth zero and nowhere
      // else, each sense divides at the declared comma rule, and a sense the
      // rule holds back as damaged neither prints nor pools.
      readingsOf(row).forEach((reading) => {
          const key = reading.toLowerCase();
          const g = groups.get(key);
          // The corpus rank merges the same way year and rank do: a reading
          // carried by any BIBLICAL witness is a BIBLICAL-carried reading,
          // whatever else also carries it.
          const cr = corpusOf && corpusOf(mId) === "BIBLICAL" ? 0 : 1;
          // AND WHO CARRIED IT SURVIVES THE MERGE.
          //
          // Every other field here collapses by Math.min, because for sorting
          // that is the right answer: the oldest year any witness gives this
          // reading, the best rank any witness gives it. Identity does not
          // collapse. Two sources carrying "words" is a different fact from
          // one, and the merge was throwing it away — after this function, a
          // reading knew when it was first attested and not by whom.
          //
          // That cost two things. A per-source toggle could not fire at all:
          // switching a source off cannot remove a reading if nothing records
          // that the source carried it. And on 2026-09-15 it cost a wrong
          // finding — `ledger` holds Number(rank), and reading it as a source
          // id produced a confident, fabricated attribution that had to be
          // retracted. A field that looks like an identity and is not one is
          // worse than no field.
          //
          // `by` is the set of m ids whose licensed routes yield this exact
          // reading. It is what a switch removes and what a credit line names.
          if (!g) groups.set(key, { text: reading, year: yr, ledger: Number(rank), corpus: cr, at: arrived += 1, by: new Set([mId]) });
          else {
            g.year = Math.min(g.year, yr);
            g.ledger = Math.min(g.ledger, Number(rank));
            g.corpus = Math.min(g.corpus, cr);
            g.by.add(mId);
          }
      });
    });
    const tier = (r) => (Number.isFinite(r.year) && r.year <= ERA_CUT_AD ? 0 : 1);
    const byOldest = (a, b) => tier(a) - tier(b) || a.year - b.year || a.ledger - b.ledger;
    // Every order ends in the same tie-break, so two readings the order cannot
    // separate come out in the order rule 4 gives them rather than in whatever
    // order the shards happened to be read in.
    const cmp = order === "characters"
      ? (a, b) => a.ledger - b.ledger || byOldest(a, b) || a.at - b.at
      : order === "corpus"
        ? (a, b) => a.corpus - b.corpus || byOldest(a, b)
        : byOldest;
    // `by` leaves as a sorted array, never as the Set it was accumulated in:
    // a Set survives no JSON boundary, and a pool entry that serialises to
    // {} in one consumer and a list in another is the kind of difference
    // nobody finds until a receipt is already written. Sorted so two runs
    // over the same shards produce the same bytes.
    return [...groups.values()]
      .map((g) => ({ ...g, by: [...g.by].sort(), sole: g.by.size === 1 }))
      .sort(cmp);
  };

  /**
   * Rule 6. The one reading a zone prints under this form, or null.
   * Returns why it is null so a builder can count the two cases apart:
   * a form the catalog never carries, and a form whose every route is
   * unlicensed to display.
   */
  const glossFor = (k, order = "oldest", corpusOf = null, omit = null) => {
    const routes = routesFor(k);
    if (!routes) return { text: null, reason: "NO_EXACT_ROUTE" };
    const pool = readingPool(routes, order, corpusOf, omit);
    // A pool emptied by the switch is a different silence from a form the
    // catalog never carried, and the two must stay countable apart: the first
    // is a reader's own choice and the second is the catalog's limit.
    //
    // Which means the switch only gets the blame when the switch is what did
    // it. A form whose every route was unlicensed to display is the catalog's
    // limit whether the reader switched anything off or not, and blaming the
    // switch for it would let a reader's own setting take credit for silence
    // it never caused — the same overstatement in miniature as a mark that
    // covers every word. So when the switched pool is empty the unswitched
    // one is asked, and only a pool that HAD something names the switch.
    if (!pool.length) {
      if (!omit || !omit.size) return { text: null, reason: "NO_DISPLAYABLE_ROUTE" };
      const full = readingPool(routes, order, corpusOf, null);
      return { text: null, reason: full.length ? "EVERY_CARRIER_SWITCHED_OFF" : "NO_DISPLAYABLE_ROUTE" };
    }
    // by/sole ride along for a caller building a source switch: `by` is who
    // carries the printed reading, `sole` says whether turning one of them
    // off leaves the word bare or merely changes it. Measured 2026-09-15:
    // dropping a carried reading NEVER returns the same word, so those are
    // two different harms and a switch has to be able to name both.
    return { text: pool[0].text, reason: null, pool_size: pool.length, by: pool[0].by, sole: pool[0].sole };
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
  // store's own depth rule instead of re-implementing it. readingSplit rides
  // for the same reason and was missing: on 2026-09-15 this lane needed the
  // comma rule to attribute a reading to its sources, could not import it,
  // and wrote a second copy. Two implementations of one rule is the fault
  // packSplit's own comment names, and it had it half done.
  return { index, routesFor, readingPool, glossFor, tableFor, packSplit, readingSplit, readingsOf, readingsOfText, rowOfText, mIdsOfLabel, ledgerOf, ORDERS };
};
