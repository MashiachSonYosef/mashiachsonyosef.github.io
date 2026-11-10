// What a commentary sidecar says of the works it carries and of how it was made. Read-only.
// node sidecar-peek.mjs <reader dir> <book>
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [R, B] = process.argv.slice(2);
const c = JSON.parse(gunzipSync(readFileSync(join(R, "data", "zones", `${B}.commentary.bin`))).toString("utf8"));
console.log("keys:", Object.keys(c).join(", "));
console.log("works:", JSON.stringify(c.works, null, 1).slice(0, 1800));
console.log("emitted_from:", JSON.stringify(c.emitted_from, null, 1).slice(0, 3500));
console.log("units:", Object.keys(c.units || {}).length);
