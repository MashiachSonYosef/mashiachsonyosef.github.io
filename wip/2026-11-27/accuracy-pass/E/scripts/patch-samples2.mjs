// Read-only on the tree: the samples after the signs switch was added to the model. The Samaritan set is drawn again;
// in every other set a sampled reading that carries a source's own sign is set aside (the page at rest does not offer
// it), and Classical Hebrew Words takes one more replacement.
import { readFileSync, writeFileSync } from "node:fs";
const SOURCE_SIGN = [/^(X|×|\+) /u, /¿/u, /<[^>]*>/u, /\[[^\]]*\]/u, / ~ /u];
const hasSourceSign = (t) => SOURCE_SIGN.some((re) => re.test(String(t)));
let seed = 7039; const rnd = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const shuffle = (rows) => { for (let i = rows.length - 1; i > 0; i -= 1) { const j = Math.floor(rnd() * (i + 1)); [rows[i], rows[j]] = [rows[j], rows[i]]; } return rows; };
const load = (f) => readFileSync(f, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
let s = JSON.parse(readFileSync("samples2.before-signs.json", "utf8")).filter((r) => r.set !== "samaritan");
let signed = 0;
for (const r of s) if (!r.set_aside && hasSourceSign(r.reading)) { r.set_aside = true; r.page = { status: "not on the card", why: "the signs switch, where it rests, does not offer a reading that carries a source's own sign" }; signed += 1; console.log("set aside for its sign:", r.set, r.i, r.reading.slice(0, 40)); }
const pool = shuffle(load("reservoir2-samaritan.jsonl")); const seen = new Set(); let i = 0;
for (const r of pool) { const k = `${r.block}\u0001${r.rk}`; if (seen.has(k)) continue; seen.add(k); i += 1; s.push({ ...r, i, set: "samaritan" }); if (i === 60) break; }
const taken = new Set(s.filter((r) => r.set === "classical-hebrew-words").map((r) => `${r.block}\u0001${r.rk}`));
const extra = shuffle(load("reservoir2-classical-hebrew-words.jsonl")).find((r) => !taken.has(`${r.block}\u0001${r.rk}`));
s.push({ ...extra, i: 63, set: "classical-hebrew-words", replacement: true });
writeFileSync("samples2.json", JSON.stringify(s));
writeFileSync("samples3-to-probe.json", JSON.stringify(s.filter((r) => r.set === "samaritan" || (r.set === "classical-hebrew-words" && r.i === 63))));
console.log("samaritan", i, "books", new Set(s.filter((r) => r.set === "samaritan").map((r) => r.book)).size, "signed set aside", signed);
