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
  return { lic: licenseName(m.licensePosture), m: m.label || "", y: m.sourceYear || "" };
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
  return { lic: licenseName(m.licensePosture), m: m.label || "", y: m.sourceYear || "", by: [...new Set(hits.map((r) => r[3]))].sort() };
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
  for (const [k, text] of Object.entries(gloss || {})) {
    const routes = store.routesFor(k);
    if (!routes) continue;
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
    out[m] = { key: src.key || null, label: src.label || "", lic: licenseName(src.licensePosture), y: src.sourceYear || "", ...t[m] };
  }
  return out;
};
