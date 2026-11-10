// The export's note counts words, and a scribal mark is not one. node 03-export-count.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
edit(join(process.argv[2], "zone.html"), [
[`      const words = g.bundles.reduce((a, x) => a + x.words.length, 0);`,
 `      // the words, the scribal marks among them not counted (the address's own count)
      const words = g.bundles.reduce((a, x) => a + x.words.filter((w) => !w.mark).length, 0);`],
]);
