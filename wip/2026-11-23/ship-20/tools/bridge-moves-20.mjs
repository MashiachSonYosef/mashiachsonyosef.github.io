// Read-only measure (23 November 2026): the spelling bridge on main (bridge v1.1 laid) against the bridge with ship 20
// (bridge v1.2 laid): the places each lays, the places v1.2 lays that v1.1 did not, every place whose hold moved, by
// the hold it stands under now, and the zones whose record of the bridge moves. Writes JSON to stdout.
// Usage: node bridge-moves-20.mjs <reader at main> <reader with ship 20>
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [OLD, NEW] = process.argv.slice(2);
const A = await import(join(OLD, "tools", "spelling-bridge-v1.mjs")), B = await import(join(NEW, "tools", "spelling-bridge-v1.mjs"));
const a = A.readBridge(join(OLD, "data", "spelling-bridge", "PIN.json")), b = B.readBridge(join(NEW, "data", "spelling-bridge", "PIN.json"));
const la = A.laidOf(a), lb = B.laidOf(b);
const id = (p) => `${p.book} ${p.place}`;
const was = new Map(la.laid.map((p) => [id(p), p])), now = new Map(lb.laid.map((p) => [id(p), p]));
const newly = [...now.keys()].filter((k) => !was.has(k)), gone = [...was.keys()].filter((k) => !now.has(k));
const changedPieces = [...now.keys()].filter((k) => was.has(k) && JSON.stringify(was.get(k).pieces) !== JSON.stringify(now.get(k).pieces));
const each = [], by = {};
for (const [at, l] of b.places12.entries()) {
  const h0 = A.heldOf(a.places11[at], a.call4), h1 = B.heldOf(l, b.call4);
  if (h0 === h1) continue;
  each.push({ line: at + 1, book: l.book, place: l.place, cls: l.class, use: l.use, was: h0, now: h1 });
  by[`${l.class} · ${l.use} · ${h0} -> ${h1}`] = (by[`${l.class} · ${l.use} · ${h0} -> ${h1}`] || 0) + 1;
}
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const books = [...new Set(lb.laid.map((p) => p.book))];
const rewritten = books.filter((bk) => { const r0 = (gz(join(OLD, "data", "zones", `${bk}.bin`)).emitted_from || {}).spelling_bridge || {}, r1 = (gz(join(NEW, "data", "zones", `${bk}.bin`)).emitted_from || {}).spelling_bridge || {}; return JSON.stringify((r0.list || {}).sha256) !== JSON.stringify((r1.list || {}).sha256); });
console.log(JSON.stringify({ laid: { v1_1: la.laid.length, v1_2: lb.laid.length }, newly_laid: newly.length, newly, no_longer_laid: gone.length, laid_whose_pieces_changed: changedPieces.length, faults: { v1_1: la.faults, v1_2: lb.faults }, by, each, zones_rewritten: rewritten.length, zones: rewritten }, null, 1));
