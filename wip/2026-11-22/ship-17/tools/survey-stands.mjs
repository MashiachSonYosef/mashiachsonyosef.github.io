// Survey, 22 November 2026: at each place ship 17 would lay, whether STEP's reading stands there (call 4, the
// default picks' index row [n, words, 1]) and what the record of the lines at rest draws over it now. Reads only.
// Usage: node survey-stands.mjs <reader dir> <list v1.1>
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [R, LIST] = process.argv.slice(2);
const { findBridgePlace } = await import(join(R, "tools/spelling-bridge-v1.mjs"));
const { readRecord } = await import(join(R, "tools/resting-lines-v1.mjs"));
const { printedForm, signsOff } = await import(join(R, "tools/gloss-store-v1.mjs"));
const PLAIN = /^H\d+[A-Za-z]*$/u;
const L = readFileSync(LIST, "utf8").split("\n").filter(Boolean).map((x) => JSON.parse(x));
const ix = JSON.parse(readFileSync(join(R, "data/default-picks/index.json"), "utf8"));
const zones = new Map(), recs = new Map();
const zone = (b) => { if (!zones.has(b)) zones.set(b, JSON.parse(gunzipSync(readFileSync(join(R, "data/zones", `${b}.bin`))).toString("utf8"))); return zones.get(b); };
const rec = (b) => { if (!recs.has(b)) recs.set(b, readRecord(join(R, "data/resting-lines", `${b}.json.gz`))); return recs.get(b); };
const tally = new Map(); const t = (k) => tally.set(k, (tally.get(k) || 0) + 1);
const sample = [];
for (const l of L) {
  if (l.use !== "NEW_PIECES") continue;
  const isNew = l.class !== "STEP_WRITES_OUR_SPELLING";
  if (isNew && !l.pieces.every((p) => PLAIN.test(String(p.tag)))) continue;
  const m = /^(\d+):(\d+):(\d+)$/u.exec(l.place);
  const place = { ref: l.ref, n: Number(m[3]), surface: l.lattice_v12.surface, key: l.key_ours };
  const z = zone(l.book), f = findBridgePlace(z, place);
  if (f.fault) { t(`${isNew ? "new" : "206"} · not found: ${f.fault.replace(/[^\x20-\x7e]+/gu, "?")}`); continue; }
  let N = 0; for (let i = 0; i < f.si; i += 1) N += (z.sections[i].words || []).length; N += f.at + 1;
  const sw = ((ix.books[l.book] || {}).step_words || []).find((r) => r[0] === N) || null;
  const stands = !!(sw && sw[2] === 1);
  const r = rec(l.book), sec = (r.sections || []).find((s) => s[0] === l.ref);
  const u = sec ? (sec[1] || []).find((x) => x[0] <= f.at && f.at < x[0] + Math.max(1, x[1])) || null : null;
  const after = signsOff(printedForm(l.pieces.map((p) => String(p.english_tahot_as_written).trim()).join("/")));
  const stepDrawn = sw ? signsOff(printedForm(sw[1])) : null;
  t(`${isNew ? "new" : "206"} · ${stands ? "stands" : sw ? "step_words, not standing" : "no step words"} · credit now ${u ? u[3] : "none"}${stands ? ` · STEP's words ${stepDrawn === after ? "are" : "are not"} the pieces drawn` : ""}`);
  if (isNew && stands && sample.length < 4) sample.push(`${l.book} ${l.place}: now «${u && u[2]}» (${u && u[3]}) · STEP's «${sw[1]}» · pieces «${after}»`);
}
for (const [k, v] of [...tally].sort()) console.log(String(v).padStart(5), k);
console.log(sample.join("\n"));
