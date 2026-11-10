// The commentary's line is its row: the bar and the works button beside it. node 09-levels-row.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
edit(join(process.argv[2], "tools", "check-levels-v1.mjs"), [
[`    segBottom: r(seg)?.bottom, barTop: r(bar)?.top, barW: r(bar)?.width,`,
 `    // the commentary's line is its row: the bar and, beside it, the button
    // that names the works (they share one row since the works list folded)
    segBottom: r(seg)?.bottom, barTop: r(bar)?.top, barW: r(bar ? bar.closest(".c-barrow") || bar : null)?.width,`],
]);
