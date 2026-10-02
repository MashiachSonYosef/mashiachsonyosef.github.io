// work-holds-v1 · which works this lane is not serving, asked of the hold ledgers
//
// A hold on a commentary already has a home: a CSV in data/ carrying hold_id,
// base_work_id and status, found by its shape and never by its filename, so a
// new hold lands by putting a file in the directory. emit-work-basis-v1 has
// read them that way since the day the pages started printing their own
// incompleteness.
//
// A hold on a WORK had no home. It was worked out from the absence of a zone
// file, which cannot tell a work deliberately held from a build that failed or
// a file deleted by accident — and build.sh, which never saw the distinction,
// went on naming every work the plan derived. Three works had been withdrawn
// from the site and one run of the build would have put all three back.
//
// So a work-level hold is a row in the same ledgers, with the same shape, read
// the same way: base_work_id names the work, and the status says the work
// itself is held rather than something attached to it.
//
//     status begins HOLD_WORK__        or   current_effect is WORK_WITHHELD
//
// Until such a row exists, data/work-records-v1.js may carry the hold typed in
// the open under a basis that says exactly that — the same law typed_awaiting_
// ledger stands under, and it dies the same way: the day the ledger lands, the
// typed entry is deleted, and plan-build-v1 refuses while both exist.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, "..", "data");

export const splitCsvLine = (line) => {
  const out = []; let cur = "", inQ = false;
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i];
    if (inQ) {
      if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i += 1; } else inQ = false; }
      else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
};

/** True when a hold row holds the WORK, not something attached to it. */
export const isWorkHold = (status, currentEffect) =>
  /^HOLD_WORK__/u.test(String(status || "")) ||
  /^WORK_WITHHELD/u.test(String(currentEffect || ""));

/**
 * Every work-level hold any ledger in data/ carries, keyed by work id.
 * The reason is the ledger's own status string; nothing here composes one.
 */
export function workHoldsFromLedgers(dataDir = DATA) {
  const held = {};
  if (!existsSync(dataDir)) return held;
  for (const f of readdirSync(dataDir).filter((x) => x.endsWith(".csv")).sort()) {
    const lines = readFileSync(join(dataDir, f), "utf8").split(/\r?\n/u).filter((l) => l.trim());
    if (!lines.length) continue;
    const head = splitCsvLine(lines[0]);
    const col = (n) => head.indexOf(n);
    if (col("hold_id") < 0 || col("base_work_id") < 0 || col("status") < 0) continue;
    for (const line of lines.slice(1)) {
      const row = splitCsvLine(line);
      const workId = row[col("base_work_id")];
      const status = row[col("status")];
      const eff = col("current_effect") > -1 ? row[col("current_effect")] : "";
      if (!workId || !isWorkHold(status, eff)) continue;
      held[workId] = {
        hold_id: row[col("hold_id")],
        status,
        current_effect: eff,
        source: f,
        basis: "SEALED_HOLD_LEDGER",
      };
    }
  }
  return held;
}
