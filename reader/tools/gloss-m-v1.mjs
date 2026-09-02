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

/**
 * The M table over a gloss table: { key: { lic, m, y } } for every key whose
 * reading a route stands on, and the count of readings no route stands on
 * (which the caller reports; a reading with no M is shown without a chip).
 */
export const glossMFor = (store, gloss) => {
  const gm = {};
  let drift = 0;
  for (const [k, t] of Object.entries(gloss || {})) {
    const src = glossSource(store, k, t);
    if (src) gm[k] = src; else drift += 1;
  }
  return { gloss_m: gm, drift };
};
