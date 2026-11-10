// A law for the door's credit, which no check held (the fifth reader's finding 6: "no check names either
// function"): the record a reading's hover names on the door is the record the store's own rule credits for
// that reading under that key, the oldest carrier by the printed form. On the door before this round it is
// red for the two names whose reading another source also wrote with a closing stop.
// node 24-door-credit-law.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "check-door-license-in-card-v1.mjs"), [
  [`//   L2  every reading under a name says on its hover the record it is read
//       from and that record's license`,
   `//   L2  every reading under a name says on its hover the record it is read
//       from and that record's license
//   L2b and that record is the one the store's own rule credits for the
//       reading under the name's key: its oldest carrier, found by the
//       printed form (gloss-store-v1 carriersOf), the record the book's own
//       page credits for the same reading. (Until 10 November 2026 the door
//       matched the reading as written, and a name another source also
//       wrote with a closing stop was credited to a later record.)`],
  [`import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";`,
   `import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { openRouteStore } from "./gloss-store-v1.mjs";`],
  [`// L3: open the card of the first keyed word of every name that has a reading`,
   `// L2b: the record each hover names, against the store's own answer. Read off
// the page as it is served: the key on the name's first keyed word, the
// reading as printed, the record's id the hover carries.
{
  const named = await p.evaluate(() => [...document.querySelectorAll(".fam-he")].map((f) => {
    const g = f.querySelector(":scope > .g"), w = f.querySelector("button.fw[data-k]");
    return g && w && g.dataset.m ? { k: w.dataset.k, reading: g.textContent.trim(), m: g.dataset.m } : null;
  }).filter(Boolean));
  const store = openRouteStore(join(dirname(fileURLToPath(import.meta.url)), "..", "data", "route-store"));
  const off = [];
  for (const x of named) {
    const oldest = store.carriersOf(store.routesFor(x.k) || [], x.reading)[0] || null;
    if (!oldest || String(oldest[3]) !== x.m) off.push(\`"\${x.reading.slice(0, 30)}": the hover names \${x.m}, the store's oldest carrier is \${oldest ? oldest[3] : "none"}\`);
  }
  check("L2b the record a hover names is the store's oldest carrier of that reading under the name's key", named.length > 0 && !off.length,
    \`\${named.length} readings under names\${off.length ? \` \\u00B7 \${off.length} name another record: \${off.slice(0, 4).join("; ")}\` : ""}\`);
}
// L3: open the card of the first keyed word of every name that has a reading`],
]);
