// The disk-gloss check also pins the source signs "as printed": at rest the line leaves a piece that is
// only a source's sign undrawn, which is drawing, not reading. node 07-stale-checks-b.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const T = join(process.argv[2], "tools");
edit(join(T, "check-disk-gloss-is-the-line-v1.mjs"), [
[`// the page loads. Run with nothing set, the check failed on 59 of 95 words of`,
 `// the page loads, with the source signs "as printed" (at rest the line leaves
// a piece that is only a source's sign undrawn: "<the>/ Carmel" stands as
// "Carmel", which is drawing and not reading). Run with nothing set, the check failed on 59 of 95 words of`],
[`localStorage.setItem("fh.def.order", "oldest"); localStorage.setItem("fh.pointing-stands-2026-11-06", "1"); localStorage.setItem("fh.masorah", "keep"); } catch`,
 `localStorage.setItem("fh.def.order", "oldest"); localStorage.setItem("fh.pointing-stands-2026-11-06", "1"); localStorage.setItem("fh.masorah", "keep"); localStorage.setItem("fh.parked-2026-10-24", "1"); localStorage.setItem("fh.signs", "printed"); } catch`],
]);
