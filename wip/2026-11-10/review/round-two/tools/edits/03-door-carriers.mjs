// The door asks the store who carries a reading (the review's T3; the fifth reader's finding 6).
// Its two functions matched a reading as written, lowercased: Strong's «Amos.» did not attest
// «Amos», so a title's chip and a gloss's hover could name another source than the one the
// book's own page credits for the same reading.
// node 03-door-carriers.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "build-front-door-v1.mjs"), [
  [`  const want = String(en || "").trim().toLowerCase();
  if (!want) return null;
  const hits = routes.filter((row) => {
    if (!STORE.index.m_sources[row[3]]) return false;
    return STORE.readingsOf(row).some((x) => String(x).trim().toLowerCase() === want);
  });
  if (!hits.length) return null;
  // fullest license first, and among equals the oldest source — the same
  // antiquity rule the rest of the page reads by
  hits.sort((a, c) => {
    const ra = licenseRank((STORE.index.m_sources[a[3]] || {}).licensePosture);
    const rc = licenseRank((STORE.index.m_sources[c[3]] || {}).licensePosture);
    for (let i = 0; i < ra.length; i += 1) if (ra[i] !== rc[i]) return ra[i] - rc[i];
    const ya = Number.parseInt(a[4], 10), yc = Number.parseInt(c[4], 10);
    return (Number.isInteger(ya) ? ya : 9e9) - (Number.isInteger(yc) ? yc : 9e9);
  });`,
   `  if (!String(en || "").trim()) return null;
  // who reads the name: the store's own answer (carriersOf: every admitted
  // row whose readings print as the title prints, oldest wording first).
  // Until 10 November 2026 this matched the reading as written, so Strong's
  // «Amos.» did not attest «Amos» and the chip named a later source.
  const hits = STORE.carriersOf(routes, String(en).trim());
  if (!hits.length) return null;
  // fullest license first, and among equals the oldest wording (the order
  // the store handed them over in; the sort is stable)
  hits.sort((a, c) => {
    const ra = licenseRank((STORE.index.m_sources[a[3]] || {}).licensePosture);
    const rc = licenseRank((STORE.index.m_sources[c[3]] || {}).licensePosture);
    for (let i = 0; i < ra.length; i += 1) if (ra[i] !== rc[i]) return ra[i] - rc[i];
    return 0;
  });`],
  [`  const want = String(text).toLowerCase();
  const hits = routes.filter((row) => {
    if (!STORE.index.m_sources[row[3]]) return false;
    return STORE.readingsOf(row).some((x) => x.toLowerCase() === want);
  });
  if (!hits.length) return null;
  hits.sort((a, c) => {
    const ya = Number.parseInt(a[4], 10), yc = Number.parseInt(c[4], 10);
    return (Number.isInteger(ya) ? ya : 9e9) - (Number.isInteger(yc) ? yc : 9e9);
  });
  const m = STORE.index.m_sources[hits[0][3]];`,
   `  // the store's own answer (carriersOf), the rule the book's page credits by
  const hits = STORE.carriersOf(routes, text);
  if (!hits.length) return null;
  const m = STORE.index.m_sources[hits[0][3]];`],
]);
