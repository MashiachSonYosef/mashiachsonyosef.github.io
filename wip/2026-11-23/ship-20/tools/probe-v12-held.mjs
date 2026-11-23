// Read-only (23 November 2026): the places of bridge v1.1 held for STEP's «}+» tag, and what holds each of them when
// the list read is bridge v1.2's lines (their tags as STEP names them). Usage: node probe-v12-held.mjs <reader dir> <bridge-places-v1.2.jsonl>
import { readFileSync } from "node:fs";
import { join } from "node:path";
const [R, V12] = process.argv.slice(2);
const sb = await import(join(R, "tools", "spelling-bridge-v1.mjs"));
const b = sb.readBridge(join(R, "data", "spelling-bridge", "PIN.json"));
const v12 = readFileSync(V12, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const out = {}, each = [];
for (const [at, l] of b.places11.entries()) {
  const was = sb.heldOf(l, b.call4);
  const now = sb.heldOf(v12[at], b.call4);
  if (v12[at].book !== l.book || v12[at].place !== l.place) throw new Error(`line ${at + 1} is another place`);
  if (was === now) continue;
  const k = `${l.class} · ${l.use} · ${was} -> ${now}`;
  out[k] = (out[k] || 0) + 1;
  each.push({ line: at + 1, book: l.book, place: l.place, cls: l.class, use: l.use, was, now, surface: (l.lattice_v12 || {}).surface });
}
console.log(JSON.stringify(out, null, 1));
for (const e of each) console.log(JSON.stringify(e));
// the places whose class changed besides
let other = 0; for (const [at, l] of b.places11.entries()) if (l.class !== v12[at].class || l.use !== v12[at].use) other += 1;
console.log("class or use changed:", other);
