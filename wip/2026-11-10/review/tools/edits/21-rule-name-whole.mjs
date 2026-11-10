// A rule's name broken across two comment lines read as a rule of its own in the manifest.
// node 21-rule-name-whole.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const T = join(process.argv[2], "tools");
edit(join(T, "emit-zone-store-v1.mjs"), [
[`//                                  A work the gate does not serve keeps its
//                                  bin out of the published tree (refusals-
//                                  gate-rule-v1, L4), so a checkout never
//                                  holds it. Where the bin stands on this`,
 `//                                  A work the gate does not serve keeps its
//                                  bin out of the published tree (L4 of
//                                  refusals-gate-rule-v1), so a checkout
//                                  never holds it. Where the bin stands on this`],
]);
