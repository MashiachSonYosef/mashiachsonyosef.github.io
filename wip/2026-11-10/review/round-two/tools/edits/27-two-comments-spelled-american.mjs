// Two comments this round wrote spelled "licence". The repository's rule is American spelling in everything authored
// (the names stamped into served records keep their spelling until those records are built again; these are prose).
// node 27-two-comments-spelled-american.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];
edit(join(R, "tools", "project-lattice-v12-v1.mjs"), [
  [`// carrier's label and licence key, and that row's wording year`, `// carrier's label and license key, and that row's wording year`],
]);
edit(join(R, "tools", "regloss-zone.mjs"), [
  [`//      table, the names laid over it, the licence columns, and the two`, `//      table, the names laid over it, the license columns, and the two`],
]);
