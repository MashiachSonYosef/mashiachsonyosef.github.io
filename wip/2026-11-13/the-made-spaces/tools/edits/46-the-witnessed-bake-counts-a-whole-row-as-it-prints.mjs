// The witnessed-order bake counts, per column, the lines that are a row's whole text and the lines cut to a row's
// first reading. A row whose route closes a made space (made-spaces-rule-v1) prints its whole text closed, so the
// baked line is compared with the shipped text as it prints: without this, every such whole row would be counted
// as cut.
// node 46-the-witnessed-bake-counts-a-whole-row-as-it-prints.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "bake-witnessed-order-v1.mjs"), [
  [`import { openRouteStore } from "./gloss-store-v1.mjs";`,
   `import { openRouteStore, routePrinted } from "./gloss-store-v1.mjs";`],
  [`    if (line !== text) cut += 1; else whole += 1;`,
   `    // whole where the line is the shipped text as it prints: a made space in a row's route closes there (made-spaces-rule-v1)
    if (line !== (String(row[1]) === text ? routePrinted(row) : text)) cut += 1; else whole += 1;`],
]);
