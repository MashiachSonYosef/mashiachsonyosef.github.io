// Three page checks needed an address handed to them and did not run without one; a fourth said SKIP
// and exited as a pass. Each picks its own work as every page check does, and a skip exits as a skip.
// node 20-checks-pick-their-work.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const T = join(process.argv[2], "tools");
edit(join(T, "check-maqaf-lattice-v1.mjs"), [
[`import { gunzipSync } from "node:zlib";

// Named by codepoint, never typed.`,
 `import { gunzipSync } from "node:zlib";
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";

// Named by codepoint, never typed.`],
[`const asUrl = positional.find((a) => /^https?:\\/\\//.test(a)) || flagUrl;
const asPath = positional.find((a) => !/^https?:\\/\\//.test(a));`,
 `// Handed nothing, it picks its own work as every page check does: the first
// the door serves. (Until 10 November 2026 it printed its usage and failed.)
const asPath = positional.find((a) => !/^https?:\\/\\//.test(a));
const asUrl = positional.find((a) => /^https?:\\/\\//.test(a)) || flagUrl || (asPath ? null : defaultZoneUrl(null));`],
]);
edit(join(T, "check-maqaf-pair-drawn-v1.mjs"), [
[`import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const URL_ARG = process.argv[2];
if (!URL_ARG || !/^https?:/u.test(URL_ARG)) { console.log("SKIPPED — needs a served zone url"); process.exit(3); }`,
 `import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
// handed nothing, the first work the door serves
const URL_ARG = defaultZoneUrl();
if (!/^https?:/u.test(URL_ARG)) { console.log("SKIPPED — needs a served zone url"); process.exit(3); }`],
]);
edit(join(T, "check-parts-read-right-to-left-v1.mjs"), [
[`import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";

const URL_ARG = process.argv[2];
if (!URL_ARG || !/^https?:/u.test(URL_ARG)) { console.log("SKIPPED — needs a served zone url"); process.exit(3); }`,
 `import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";

// handed nothing, the first work the door serves
const URL_ARG = defaultZoneUrl();
if (!/^https?:/u.test(URL_ARG)) { console.log("SKIPPED — needs a served zone url"); process.exit(3); }`],
]);
edit(join(T, "check-title-from-c0-v1.mjs"), [
[`  console.log("SKIP — the verified body, the bridge, and the openings survey live on the fleet machine; nothing to prove here without them");
  process.exit(0);`,
 `  // exit 3, the tree's code for "could not reach its inputs": a skip that
  // exits 0 is counted as a pass by everything that reads exit codes
  console.log("SKIPPED — the verified body, the bridge, and the openings survey live on the fleet machine; nothing to prove here without them");
  process.exit(3);`],
]);
