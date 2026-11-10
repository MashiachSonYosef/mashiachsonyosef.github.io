// The per-book counts of the dictionaries beside the store are held to the served set and to the
// indexes as they stand. node 29-counts-record-law.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const T = join(process.argv[2], "tools");
edit(join(T, "check-piece-store-v1.mjs"), [
[`import { readFileSync, readdirSync } from "node:fs";`,
 `import { readFileSync, readdirSync, existsSync } from "node:fs";`],
[`
// P10 THE BLANK LEDGER BESIDE THE INDEX (piece store v2.1, FOR-ELIJAH-v86):`,
 `
// P2b THE COUNTS RECORD IS TODAY'S (10 November 2026). The record the sources
// row is drawn from is baked from the served zones and from the dictionaries
// beside the store. A work went up on 8 November and the record was not
// baked again: that work's page drew no chip for any of those dictionaries,
// the record's pins were a week old, and nothing said so. The bake is a step
// of the round now, and this holds its outcome: the record lists every work
// the door serves and no other, and pins each index as it stands.
{ const rec = JSON.parse(readFileSync("data/overlay-book-counts-v1.json", "utf8"));
  const served = zonesServed();
  const counted = Object.keys(rec.books || {});
  const missing = served.filter((z) => !(rec.books || {})[z]), extra = counted.filter((z) => !served.includes(z));
  const stale = Object.entries(rec.overlays || {}).filter(([name, o]) => {
    const at = [\`data/overlays/\${name}/index.json\`, \`data/\${name}/index.json\`].find((x) => existsSync(x));
    return !at || createHash("sha256").update(readFileSync(at)).digest("hex") !== o.index_sha256;
  }).map(([name]) => name);
  check("P2b the counts record lists every served work and pins each dictionary beside the store as it stands",
    missing.length === 0 && extra.length === 0 && stale.length === 0,
    \`\${served.length} served, \${counted.length} counted\${missing.length ? \` · served and not counted: \${missing.join(", ")}\` : ""}\${extra.length ? \` · counted and not served: \${extra.join(", ")}\` : ""}\${stale.length ? \` · pinned as it no longer stands: \${stale.join(", ")}\` : \` · \${Object.keys(rec.overlays || {}).length} indexes pinned as they stand\`}\`); }

// P10 THE BLANK LEDGER BESIDE THE INDEX (piece store v2.1, FOR-ELIJAH-v86):`],
]);
