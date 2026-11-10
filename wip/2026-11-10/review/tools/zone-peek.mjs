// A zone's section at an address, and one word of it. node zone-peek.mjs <zone.bin> <chapter:verse> [word number]
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
const [file, ref, n] = process.argv.slice(2);
const z = JSON.parse(gunzipSync(readFileSync(file)).toString("utf8"));
const secs = z.sections || [];
const keys = Object.keys(secs[0] || {});
const i = secs.findIndex((s) => Object.values(s).some((v) => typeof v === "string" && (v === ref || v.endsWith(`-${ref.replace(":", "-")}`) || v.endsWith(`:${ref}`) || v.endsWith(` ${ref}`))));
console.log("section keys:", keys.join(", "), "· sections", secs.length, "· found at index", i);
if (i < 0) process.exit(0);
const s = secs[i];
console.log(JSON.stringify(Object.fromEntries(Object.entries(s).filter(([k]) => k !== "words"))).slice(0, 300));
const words = s.words || [];
if (n) console.log(`word ${n}:`, JSON.stringify(words[Number(n) - 1]).slice(0, 900));
else console.log(words.map((w, j) => `${j + 1}:${w.s}`).join(" "));
