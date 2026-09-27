// gloss-m-v1 · which source a shown reading stands on
//
// The M of a reading: the oldest licensed route in the store whose own text
// divides, under the store's pack and reading rules, to exactly the reading
// shown. One function, used in two places that must agree:
//
//   tools/build-zone.mjs        — writes gloss_m in its single pass, beside
//                                 the gloss table it derives (rule v8: one
//                                 pass, one set of inputs, nothing patched)
//   tools/enrich-gloss-m-v1.mjs — the same derivation over a zone built
//                                 before the builder wrote it, under a typed
//                                 exemption that expires when the zone is
//                                 rebuilt
//
// Until 2026-09-02 this lived only in the enrichment, and the builder could
// not write the M it did not know how to derive. The M is a build input now:
// read before the zone is written, written during, never after.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { senseSplit as readingSplit } from "./sense-split-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");

export const GLOSS_M_RULE_ID = "gloss-m-rule-v1-a-reading-shown-is-a-reading-licensed";

// the posture names are the declarations record's, same as everywhere
let postureNames = null;
const licenseName = (posture) => {
  if (!postureNames) {
    postureNames = Object.fromEntries(
      Object.entries(JSON.parse(readFileSync(join(K3, "tools", "declarations-v1.json"), "utf8")).export_postures)
        .map(([key, row]) => [key, row.name]));
  }
  const p = String(posture || "");
  if (!p) return "License unrecorded";
  return postureNames[p] || p;
};

// TWO YEARS (year repair, store 3411c86e94e7). y is the source's EDITION year,
// what the copy prints of itself (index sourceYear). wy is the WORDING year of
// the row that leads: the year the words themselves were written, which is
// why this reading leads under oldest first — a collector repeating Brown-
// Driver-Briggs word for word carries 1906 here whatever its edition says.
// Written only when the row has one; the store's no-year marker never is.
const wordingYearOf = (row) => {
  const y = Number.parseInt(row && row[4], 10);
  return Number.isInteger(y) ? { wy: String(y) } : {};
};
/** The M of one reading, or null when no admitted route divides to it. */
export const glossSource = (store, key, text) => {
  if (!key || !text) return null;
  const routes = store.routesFor(key);
  if (!routes) return null;
  const want = String(text).toLowerCase();
  const hits = routes.filter((row) => {
    if (!store.index.m_sources[row[3]]) return false;
    return store.packSplit(row[1]).some((sense) => {
      const r = readingSplit(sense);
      return !r.damaged && r.readings.some((x) => x.toLowerCase() === want);
    });
  });
  if (!hits.length) return null;
  hits.sort((a, c) => {
    const ya = Number.parseInt(a[4], 10), yc = Number.parseInt(c[4], 10);
    return (Number.isInteger(ya) ? ya : 9e9) - (Number.isInteger(yc) ? yc : 9e9);
  });
  const m = store.index.m_sources[hits[0][3]];
  return { lic: licenseName(m.licensePosture), m: m.label || "", y: m.sourceYear || "", ...wordingYearOf(hits[0]) };
};

// THE CARRIERS, AND THE READING THAT LEADS WHEN THEY ARE ALL SWITCHED OFF.
//
// The M above is the oldest witness of the printed reading — right for the
// chip, and useless for a source switch: a reader who turns Strong's off
// needs the page to know whether anyone ELSE carries the word under the word,
// and if nobody does, what leads instead. Two harms, and they are different:
// a line that CHANGES and a line that goes DARK. Measured on Genesis before
// this was written: Strong's off changes 3,320 lines and darkens 3; STEP off
// changes 737 and darkens 2,762, because STEP is the sole carrier at 2,762
// keys. A switch that cannot tell those apart is a switch the reader cannot
// weigh.
//
//   by   every admitted source whose route divides to the printed reading —
//        the set a switch subtracts from, sorted so two runs agree byte for
//        byte. This is the store's own `by`, baked (gloss-store-v1.mjs,
//        source-switch-rule-v1).
//   alt  the reading that leads when EVERY carrier in `by` is off — the
//        store's pool with those ids omitted, oldest first — with its own M
//        and its own carriers, so the line can move without a fetch and the
//        chip names the witness that actually carries what the line says.
//        null when nothing survives: the word goes bare under that switch,
//        which the frame calls a finding and not an error.
//
// The M of the alternate is found among the rows that SURVIVE the omit, not
// by glossSource over all rows: a source that carries both the leader and the
// alternate would otherwise be named as the alternate's witness while
// switched off, which is the switch contradicted on its own chip.
const sourceAmong = (store, key, text, omit) => {
  const routes = store.routesFor(key) || [];
  const want = String(text).toLowerCase();
  const hits = routes.filter((row) => store.index.m_sources[row[3]] && !omit.has(row[3])
    && store.packSplit(row[1]).some((sense) => { const r = readingSplit(sense); return !r.damaged && r.readings.some((x) => x.toLowerCase() === want); }));
  if (!hits.length) return null;
  hits.sort((a, c) => { const ya = Number.parseInt(a[4], 10), yc = Number.parseInt(c[4], 10); return (Number.isInteger(ya) ? ya : 9e9) - (Number.isInteger(yc) ? yc : 9e9); });
  const m = store.index.m_sources[hits[0][3]];
  return { lic: licenseName(m.licensePosture), m: m.label || "", y: m.sourceYear || "", ...wordingYearOf(hits[0]), by: [...new Set(hits.map((r) => r[3]))].sort() };
};

/** The carriers of one printed reading, and the alternate under their absence. */
export const glossCarriers = (store, key, text) => {
  if (!key || !text) return null;
  const routes = store.routesFor(key);
  if (!routes) return null;
  const want = String(text).toLowerCase();
  const by = [...new Set(routes.filter((row) => store.index.m_sources[row[3]]
    && store.packSplit(row[1]).some((sense) => { const r = readingSplit(sense); return !r.damaged && r.readings.some((x) => x.toLowerCase() === want); }))
    .map((row) => row[3]))].sort();
  if (!by.length) return null;
  const omit = new Set(by);
  const next = store.glossFor(key, "oldest", null, omit);
  const alt = next.text === null ? null : (() => { const src = sourceAmong(store, key, next.text, omit); return src ? { text: next.text, ...src } : null; })();
  return { by, alt };
};

/**
 * The M table over a gloss table: { key: { lic, m, y, by, alt } } for every
 * key whose reading a route stands on, and the count of readings no route
 * stands on (which the caller reports; a reading with no M is shown without
 * a chip). `by` and `alt` ride beside the three fields the chip has always
 * read; nothing that read {lic, m, y} has to change.
 */
export const glossMFor = (store, gloss) => {
  const gm = {};
  let drift = 0;
  for (const [k, t] of Object.entries(gloss || {})) {
    const src = glossSource(store, k, t);
    if (!src) { drift += 1; continue; }
    const c = glossCarriers(store, k, t);
    gm[k] = c ? { ...src, by: c.by, ...(c.alt ? { alt: c.alt } : {}) } : src;
  }
  return { gloss_m: gm, drift };
};

/**
 * What each source's switch costs on ONE zone — the two numbers the rail
 * prints beside every source, computed here rather than on the page because
 * the page holds one shard at a time and this needs every key. Grouped by
 * m id; the page groups ids by the source's own `key` (the three Jastrow
 * framings, the three Kaikki Aramaic extractions) because "the source itself,
 * each one removable" is the owner's unit, and the ids are the ledger's.
 *
 *   leads    keys whose printed reading this source carries
 *   carries  keys where any reading of the pool is this source's
 *   changes  keys whose printed reading MOVES when this source alone is off
 *   darkens  keys whose printed reading has no successor when it is off
 */
export const sourceSwitchCosts = (store, gloss, gm) => {
  const t = {};
  const row = (m) => (t[m] = t[m] || { leads: 0, carries: 0, changes: 0, darkens: 0 });
  // wc: this source's rows under this book's keys, by the WORDING year's
  // century (AM; "none" where the row gives no year) — the owner's ruling
  // that a card belongs to the century its English was written in. A source
  // can carry words written in more than one century; the counts say so.
  const wc = {};
  const centuryAM = (y) => { const n = Number.parseInt(y, 10); return Number.isInteger(n) ? String(Math.ceil((n + 3760) / 100)) : "none"; };
  for (const [k, text] of Object.entries(gloss || {})) {
    const routes = store.routesFor(k);
    if (!routes) continue;
    for (const r of routes) { if (!store.index.m_sources[r[3]]) continue; const c = centuryAM(r[4]); (wc[r[3]] = wc[r[3]] || {})[c] = (wc[r[3]][c] || 0) + 1; }
    const pool = store.readingPool(routes);
    for (const m of new Set(pool.flatMap((e) => e.by))) row(m).carries += 1;
    const e = gm[k];
    if (!e || !e.by) continue;
    for (const m of e.by) {
      row(m).leads += 1;
      const g = store.glossFor(k, "oldest", null, new Set([m]));
      if (g.text === null) row(m).darkens += 1; else if (g.text !== text) row(m).changes += 1;
    }
  }
  const out = {};
  for (const m of Object.keys(t).sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)))) {
    const src = store.index.m_sources[m] || {};
    out[m] = { key: src.key || null, label: src.label || "", lic: licenseName(src.licensePosture), y: src.sourceYear || "", ...t[m], ...(wc[m] ? { wc: wc[m] } : {}) };
  }
  return out;
};

// THE COST OF A SET OF SWITCHES THROWN TOGETHER. The rail throws sets: a
// chip (every ledger id of one source), a shelf (every source of one
// century, language or licence). The page priced a set by adding its
// members' costs, and a joint throw is not a sum — a line one member
// leads and another also carries changes under the set and under
// neither alone; a line every member carries between them goes bare
// under the set and under none of them. On Amos the "no year given"
// shelf said 295 change and 560 go bare; thrown, it left 2,303 bare.
// So every set the rail can throw is priced here, thrown as one, against
// the served store, and keyed by its own ids so the page can only read
// the price of exactly the set it holds — never add, never guess.
//
// The sets: one per source key (the chips), and one per shelf of each
// shelving, grouped as the page groups them (its own rules, mirrored
// here and named in the record so a drift shows as a set the page does
// not find). A set the page cannot find prices as "not baked", never as a
// sum.
// THE LICENSE PREFERENCE, BAKED AS COLUMNS. The page's licence switch is a
// sort, never a filter: readings under the preferred class answer first
// and everything else keeps its place under them (zone.html, sortPool).
// It reached only the card. The line under the word came from the base
// column, so on a fresh load the card's pressed pill and the line said two
// readings for one word (the owner, 2026-09-27, on Israel: BDB's public
// domain reading pressed, Strong's on the line). The order switch already
// moves the line through a baked column per order (gloss_orders, applied
// by applyGlossOrder); the licence preference is three more such columns,
// one per class the switch offers, each holding the class's first reading
// under oldest-first for every key where it differs from the base. The
// class of a reading is the best class any carrier of it holds — the same
// rule the page reads off each pill.
export const LICENCE_COLUMNS_RULE_ID = "licence-columns-rule-v1-the-licence-preference-is-a-baked-order-column-so-the-line-and-the-card-answer-as-one";
export const LICENCE_COLUMNS = { pd: "licence_pd", by: "licence_by", "by-sa": "licence_by_sa" };
export const licClass = (posture) => {
  const p = String(posture || "");
  if (/^(public_domain|cc0)/u.test(p)) return 0;
  if (/^cc_by_nc/u.test(p)) return 3;
  if (/^cc_by_sa/u.test(p) || /gfdl/u.test(p)) return 2;
  if (/^cc_by/u.test(p)) return 1;
  return 4;
};
export const licenceColumns = (store, gloss) => {
  const want = { licence_pd: 0, licence_by: 1, licence_by_sa: 2 };
  const columns = Object.fromEntries(Object.keys(want).map((c) => [c, {}]));
  const counts = Object.fromEntries(Object.keys(want).map((c) => [c, { moved: 0, same: 0, none: 0 }]));
  const classOf = (entry) => Math.min(...entry.by.map((id) => licClass((store.index.m_sources[id] || {}).licensePosture)));
  for (const k of Object.keys(gloss)) {
    const routes = store.routesFor(k);
    if (!routes) continue;
    const pool = store.readingPool(routes, "oldest");
    if (!pool.length) continue;
    for (const [c, cls] of Object.entries(want)) {
      const lead = pool.find((e) => classOf(e) === cls);
      if (!lead) { counts[c].none += 1; continue; }
      if (lead.text === gloss[k]) { counts[c].same += 1; continue; }
      columns[c][k] = lead.text; counts[c].moved += 1;
    }
  }
  return { rule: LICENCE_COLUMNS_RULE_ID, columns, counts };
};
const licShelf = (lic) => {
  const p = String(lic || "").toLowerCase();
  if (/\bnc\b|non-?commercial/.test(p)) return "non-commercial";
  if (/public domain|cc0/.test(p)) return "public domain";
  if (/by-sa/.test(p)) return "share-alike (CC BY-SA)";
  if (/cc by|cc-by/.test(p)) return "credit required (CC BY)";
  return "other terms";
};
const ordinal = (n) => `${n}${(n % 100 >= 11 && n % 100 <= 13) ? "th" : ({ 1: "st", 2: "nd", 3: "rd" })[n % 10] || "th"}`;
export const JOINT_COST_RULE_ID = "joint-switch-cost-rule-v1-a-set-of-switches-is-priced-thrown-together-and-read-by-its-own-ids";
// weights: key -> the positions on the book that read under that key, so a
// price can be said in LINES a reader sees as well as in distinct forms
export const jointSwitchCosts = (store, gloss, gm, table, corpusRec, weights = null) => {
  // the chips: ids grouped by the source's own key
  const byKey = new Map();
  for (const [id, s] of Object.entries(table)) { const k = s.key || id; if (!byKey.has(k)) byKey.set(k, []); byKey.get(k).push(id); }
  const groups = [...byKey.entries()].map(([key, ids]) => {
    const wc = {}; for (const id of ids) for (const [c, n] of Object.entries(table[id].wc || {})) wc[c] = (wc[c] || 0) + n;
    const cs = Object.entries(wc).sort((a, b) => b[1] - a[1] || (a[0] === "none") - (b[0] === "none") || Number(a[0]) - Number(b[0]));
    const wcMain = cs.length ? cs[0][0] : "none";
    const corpus = ids.map((id) => ((corpusRec && corpusRec.witnesses && corpusRec.witnesses[id]) || {}).corpus || null).find(Boolean) || "UNDECLARED";
    return { key, ids: [...ids].sort(), wcMain, corpus, lic: table[ids[0]].lic };
  });
  const shelfOf = {
    century: (g) => (g.wcMain && g.wcMain !== "none" ? `${ordinal(Number(g.wcMain))} century AM` : "no year given"),
    language: (g) => (g.corpus === "ARAMAIC" ? "Aramaic" : g.corpus === "BIBLICAL" ? "the Bible\u2019s Hebrew" : "Hebrew in general"),
    license: (g) => licShelf(g.lic),
  };
  const sets = new Map();   // ids key -> { ids, what }
  const put = (ids, what) => { const k = [...new Set(ids)].sort().join(" "); if (!sets.has(k)) sets.set(k, { ids: k.split(" "), what: [] }); sets.get(k).what.push(what); };
  for (const g of groups) put(g.ids, `chip ${g.key}`);
  for (const [sid, of] of Object.entries(shelfOf)) {
    const shelves = new Map();
    for (const g of groups) { const title = of(g); if (!shelves.has(title)) shelves.set(title, []); shelves.get(title).push(...g.ids); }
    for (const [title, ids] of shelves) put(ids, `shelf ${sid}: ${title}`);
  }
  // priced: only a key whose printed reading some member carries can move
  const priced = new Map([...sets.keys()].map((k) => [k, { changes: 0, darkens: 0, lines_change: 0, lines_bare: 0 }]));
  const setsOfId = new Map();
  for (const [k, s] of sets) for (const id of s.ids) { if (!setsOfId.has(id)) setsOfId.set(id, []); setsOfId.get(id).push(k); }
  for (const [k, text] of Object.entries(gloss || {})) {
    const e = gm[k];
    if (!e || !Array.isArray(e.by) || !e.by.length) continue;
    const touched = new Set(e.by.flatMap((id) => setsOfId.get(id) || []));
    for (const sk of touched) {
      const g = store.glossFor(k, "oldest", null, new Set(sets.get(sk).ids));
      const w = weights ? (weights[k] || 0) : 0;
      if (g.text === null) { priced.get(sk).darkens += 1; priced.get(sk).lines_bare += w; }
      else if (g.text !== text) { priced.get(sk).changes += 1; priced.get(sk).lines_change += w; }
    }
  }
  const out = {};
  for (const [k, s] of sets) out[k] = { ...priced.get(k), what: s.what };
  return { rule: JOINT_COST_RULE_ID, counts: "changes/darkens count distinct forms; lines_change/lines_bare count the positions on this book that read under them (a word by its own key, a divided word by each part's key)", sets: out, groupings: "chips by source key; shelves as the page shelves them: century by the majority wording century (ties to the older), language by the corpus record's corpus of the key's first id, licence by the posture's family" };
};
