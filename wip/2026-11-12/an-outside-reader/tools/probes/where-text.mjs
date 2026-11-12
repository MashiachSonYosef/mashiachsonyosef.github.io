// Where a text stands in a zone: every path under the zone's top-level keys (sections aside) whose value, a string,
// equals or holds the text asked for; and the shape of the value found beside it.
// node where-text.mjs <zone.bin> <text> [--holds]
// Nothing is written. It prints; it does not judge.
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
const argv = process.argv.slice(2);
const holds = argv.includes("--holds");
const [path, text] = argv.filter((a) => a !== "--holds");
const z = JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));
let n = 0;
const walk = (v, at, parent) => {
  if (typeof v === "string") {
    if (holds ? v.includes(text) : v === text) { n += 1; if (n <= 40) console.log(`${at}\n    ${JSON.stringify(parent).slice(0, 700)}`); }
    return;
  }
  if (Array.isArray(v)) { v.forEach((x, i) => walk(x, `${at}[${i}]`, v)); return; }
  if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, `${at}.${k}`, v);
};
for (const [k, v] of Object.entries(z)) if (k !== "sections") walk(v, k, z[k]);
console.log(`${n} place(s) outside the sections`);
