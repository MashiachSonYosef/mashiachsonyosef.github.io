// WHO CARRIES A READING, asked in one place (the review's T1, T2, T3 and the fifth reader's
// findings 1, 5 and 6). The store gains carriersOf; the credit module's three copies of the
// rule become three calls of it. Nothing these two files write moves: the copies here already
// matched by the printed form and sorted by the row's wording year.
// node 01-carriers-of.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "gloss-store-v1.mjs"), [
  [`  /** The m ids a source label names, for a credit that carries the label alone. */`,
   `  /** WHO CARRIES A READING. One rule, asked here by every tool that credits a
   *  reading or sorts by who stands behind it (the credit beside the line, the
   *  lattice's leaders, the door's chips, the chain's links): the admitted rows
   *  of \`routes\` whose own readings, under readingsOf, print as \`text\` prints
   *  (readingKey, rule 3), oldest WORDING year first (the row's own year, row[4],
   *  never the edition year of its source), a row with no year after every dated
   *  one, the catalog's row order breaking ties. \`omit\` leaves a set of sources
   *  out before anything is matched, as readingPool's does.
   *
   *  Until 10 November 2026 this was typed again wherever it was needed, and
   *  the copies had drifted: the projector matched the reading as written, so
   *  Strong's «Eden.» was not counted as carrying «Eden» and a lattice order's
   *  leader stood on an incomplete set of carriers; the chain chose the oldest
   *  carrier by the edition year, which most sources do not state; the door's
   *  chips matched as written too. */
  const wordingYear = (row) => { const y = Number.parseInt(row && row[4], 10); return Number.isInteger(y) ? y : Infinity; };
  const carriersOf = (routes, text, omit = null) => {
    const want = readingKey(text);
    return (routes || [])
      .map((row, at) => ({ row, at, y: wordingYear(row) }))
      .filter((x) => index.m_sources[x.row[3]] && !(omit && omit.has(x.row[3])) && readingsOf(x.row).some((t) => readingKey(t) === want))
      .sort((a, b) => (a.y === b.y ? 0 : a.y < b.y ? -1 : 1) || a.at - b.at)
      .map((x) => x.row);
  };
  /** The m ids a source label names, for a credit that carries the label alone. */`],
  [`  return { index, routesFor, readingPool, glossFor, tableFor, readingsOf, readingsOfText, rowOfText, mIdsOfLabel, ledgerOf, ORDERS };`,
   `  return { index, routesFor, readingPool, glossFor, tableFor, readingsOf, readingsOfText, rowOfText, mIdsOfLabel, ledgerOf, carriersOf, wordingYear, ORDERS };`],
]);

edit(join(R, "tools", "gloss-m-v1.mjs"), [
  [`import { readingKey } from "./gloss-store-v1.mjs";
`, ``],
  [`  const routes = store.routesFor(key);
  if (!routes) return null;
  const want = readingKey(text);
  const hits = routes.filter((row) => {
    if (!store.index.m_sources[row[3]]) return false;
    return store.readingsOf(row).some((x) => readingKey(x) === want);
  });
  if (!hits.length) return null;
  hits.sort((a, c) => {
    const ya = Number.parseInt(a[4], 10), yc = Number.parseInt(c[4], 10);
    return (Number.isInteger(ya) ? ya : 9e9) - (Number.isInteger(yc) ? yc : 9e9);
  });
  const m = store.index.m_sources[hits[0][3]];
  return { lic: licenseName(m.licensePosture), m: m.label || "", y: m.sourceYear || "", ...wordingYearOf(hits[0]) };`,
   `  const routes = store.routesFor(key);
  if (!routes) return null;
  // who carries it, oldest wording first: the store's own rule (carriersOf)
  const hits = store.carriersOf(routes, text);
  if (!hits.length) return null;
  const m = store.index.m_sources[hits[0][3]];
  return { lic: licenseName(m.licensePosture), m: m.label || "", y: m.sourceYear || "", ...wordingYearOf(hits[0]) };`],
  [`  const routes = store.routesFor(key) || [];
  const want = readingKey(text);
  const hits = routes.filter((row) => store.index.m_sources[row[3]] && !omit.has(row[3])
    && store.readingsOf(row).some((x) => readingKey(x) === want));
  if (!hits.length) return null;
  hits.sort((a, c) => { const ya = Number.parseInt(a[4], 10), yc = Number.parseInt(c[4], 10); return (Number.isInteger(ya) ? ya : 9e9) - (Number.isInteger(yc) ? yc : 9e9); });
  const m = store.index.m_sources[hits[0][3]];`,
   `  const hits = store.carriersOf(store.routesFor(key) || [], text, omit);
  if (!hits.length) return null;
  const m = store.index.m_sources[hits[0][3]];`],
  [`  const want = readingKey(text);
  const by = [...new Set(routes.filter((row) => store.index.m_sources[row[3]]
    && store.readingsOf(row).some((x) => readingKey(x) === want))
    .map((row) => row[3]))].sort();`,
   `  const by = [...new Set(store.carriersOf(routes, text).map((row) => row[3]))].sort();`],
]);
