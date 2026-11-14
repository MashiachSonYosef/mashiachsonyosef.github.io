// Three checks' comments still described the comma rule retired on 7 November 2026 (chain A) as the way a row
// divides. They say now what the store's reader and the page do: a row divides only where its source's ledger
// divides it, and a source with no ledger stands whole. Comments only; no line of code moves.
// node 87-three-checks-say-the-reading-as-the-ledger-divides-it.mjs <reader dir>
import { join } from "node:path";
import { edit } from "../v36/edits/lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "check-first-reading-is-sorted-v1.mjs"), [
  [`// A route is sense-split and reading-split before it becomes a pill, and the
// groups are keyed by the reading with the LOWEST rank any row gave it — so a`,
   `// A route is divided where its source's ledger divides it (a source with no
// ledger stands whole) before it becomes a pill, and the groups are keyed by
// the reading with the LOWEST rank any row gave it — so a`],
  [`// rank one. This survives the split, the grouping and a tie.`,
   `// rank one. This survives the division, the grouping and a tie.`],
]);
edit(join(R, "tools", "check-pill-whole-v1.mjs"), [
  [`// page's: the store's own readingsOf (a source under a ledger as its row says,
// the rest at the pack mark and the declared comma rule).`,
   `// page's: the store's own readingsOf (a source under a ledger as its row says,
// a source with no ledger whole).`],
]);
edit(join(R, "tools", "check-span-store-v1.mjs"), [
  [`    // ledger's slots on a ledgered source's row, else the generic rule), so a`,
   `    // ledger's slots on a ledgered source's row, else the row whole), so a`],
]);
// and the ledgers' check named a source with no ledger "on the generic rule" in its report, where since that day
// such a source prints whole until its ledger lands
edit(join(R, "tools", "check-ledger-divisions-v1.mjs"), [
  ["· on the generic rule: ", "· whole until a ledger lands: "],
]);
