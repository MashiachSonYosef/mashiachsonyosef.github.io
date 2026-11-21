import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [A, B] = process.argv.slice(2);
const open = (d, f) => { try { const z = JSON.parse(gunzipSync(readFileSync(join(d, f))).toString("utf8")); return z.sections ? z : null; } catch { return null; } };
const keys = new Set(); let places = 0, bible = 0;
for (const f of readdirSync(B).filter((f) => f.endsWith(".bin") && !/\.(lattice|volume|commentary)\.bin$/.test(f))) { const a = open(A, f), b = open(B, f); if (!a || !b) continue; const ga = a.gloss || {}, gb = b.gloss || {}; for (const sec of b.sections) for (const w of sec.words || []) if (w.k && ga[w.k] === undefined && gb[w.k] !== undefined) { keys.add(w.k); places += 1; if (f !== "tikkunei-zohar.bin") bible += 1; } }
console.log("places", places, "in the 39 books", bible, "distinct keys", keys.size);
