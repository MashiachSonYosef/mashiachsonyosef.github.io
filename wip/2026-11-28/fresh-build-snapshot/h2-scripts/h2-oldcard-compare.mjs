// Scratch (builder H2): two readings of the same places' cards (h2-oldcard.mjs), held field by field.
// node h2-oldcard-compare.mjs <a.json> <b.json>
import { readFileSync } from "node:fs";
const [A, B] = process.argv.slice(2).map((p) => JSON.parse(readFileSync(p, "utf8")));
const key = (x) => `${x.book} ${x.id}:${x.n} e${x.e}`;
const a = new Map(A.filter((x) => x.si !== undefined).map((x) => [key(x), x])), b = new Map(B.filter((x) => x.si !== undefined).map((x) => [key(x), x]));
const FIELDS = ["line", "credit", "head", "pills", "held", "here", "settled", "place", "cls", "text"];
const differ = []; let same = 0;
for (const [k, x] of a) { const y = b.get(k); if (!y) { differ.push(`${k}: missing in the second`); continue; } const f = FIELDS.filter((n) => JSON.stringify(x[n]) !== JSON.stringify(y[n])); if (f.length) differ.push(`${k}: ${f.map((n) => `${n}: «${String(JSON.stringify(x[n])).slice(0, 160)}» / «${String(JSON.stringify(y[n])).slice(0, 160)}»`).join(" ; ")}`); else same += 1; }
console.log(`${a.size} places; ${same} the same in every field (${FIELDS.join(", ")}); ${differ.length} differ`);
for (const d of differ.slice(0, 12)) console.log("  " + d);
const extra = (L) => L.filter((x) => x.si === undefined); console.log("first:", JSON.stringify(extra(A)).slice(0, 400)); console.log("second:", JSON.stringify(extra(B)).slice(0, 400));
console.log(`switch said: ${[...new Set(B.map((x) => x.switched).filter((x) => x !== undefined))].join(", ")}; place cards in the second: ${B.filter((x) => x.place).length}; settled: ${A.filter((x) => x.settled).length} / ${B.filter((x) => x.settled).length}`);
