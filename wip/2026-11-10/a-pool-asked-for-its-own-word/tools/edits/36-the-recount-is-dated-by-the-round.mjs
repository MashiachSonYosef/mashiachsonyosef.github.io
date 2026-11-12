// The pointing grade's recount dated itself by the clock. The round of 11 November 2026, run a little past midnight
// with the stamp of the 10th, wrote "on": "2026-11-11" into a record whose every count was the same: one more record
// that changed with the hour it was built at, after the round's other records were taken off the clock on the 10th.
// It takes the round's stamp now, as tools/emit-lane-state-v1.mjs does: --stamp is the day; with none, the day the
// record already carries stands (a run by hand does not re-date it); with neither, it refuses.
// node 36-the-recount-is-dated-by-the-round.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];
const T = (f) => join(R, "tools", f);

edit(T("emit-pointing-grade-recount-v1.mjs"), [
  [`// Run: node tools/emit-pointing-grade-recount-v1.mjs [--store data/route-store] [--out data/pointing-grade-recount-v1.json]`,
   `// THE DAY IS THE ROUND'S (11 November 2026). The record says the day it is
// of ("on"). It read the clock, so a round run a little past midnight with
// the stamp of the day before wrote another day into a record whose every
// count was the same. It is the round's stamp now; with none given, the day
// the record already carries stands, so a run by hand does not re-date it.
//
// Run: node tools/emit-pointing-grade-recount-v1.mjs --stamp YYYY-MM-DD [--store data/route-store] [--out data/pointing-grade-recount-v1.json]`],
  [`  const STORE = arg("--store", "data/route-store"), OUT = arg("--out", "data/pointing-grade-recount-v1.json");
`,
   `  const STORE = arg("--store", "data/route-store"), OUT = arg("--out", "data/pointing-grade-recount-v1.json");
  const given = arg("--stamp", null);
  if (given !== null && !/^\\d{4}-\\d{2}-\\d{2}$/u.test(String(given))) { console.error("--stamp YYYY-MM-DD"); process.exit(2); }
  const day = given || (() => { try { return JSON.parse(readFileSync(OUT, "utf8")).on || null; } catch { return null; } })();
  if (!day) { console.error("no --stamp given and no record to keep the day of"); process.exit(2); }
`],
  [`schema_version: "POINTING_GRADE_RECOUNT_V1", rule: POINTING_GRADE_RULE_ID, on: new Date().toISOString().slice(0, 10),`,
   `schema_version: "POINTING_GRADE_RECOUNT_V1", rule: POINTING_GRADE_RULE_ID, on: day,`],
]);

edit(T("round-v1.sh"), [
  [`  node tools/emit-pointing-grade-recount-v1.mjs > /dev/null`,
   `  node tools/emit-pointing-grade-recount-v1.mjs --stamp "$STAMP" > /dev/null`],
]);
