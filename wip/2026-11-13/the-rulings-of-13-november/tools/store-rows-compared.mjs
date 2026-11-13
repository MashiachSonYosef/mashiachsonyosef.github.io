// Two route stores set side by side, row by row: for every key, the rows of each in order, and for each pair of
// rows which slots differ. Said per source: how many rows differ in which slots, how many rows went from divided to
// whole (slot 7 gone), from whole to divided, or divide at other marks; and any row that stands in one store only
// or differs in a text (slots 0 to 6), which this change must not move. A few of each kind are printed.
// node store-rows-compared.mjs <old reader dir> <new reader dir> [how many to print]
// It reads; it changes nothing.
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [oldDir, newDir, many = "4"] = process.argv.slice(2);
const shard = (dir, f) => JSON.parse(gunzipSync(readFileSync(join(dir, "data", "route-store", "shards", f))).toString("utf8"));
const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const T = {}; const eg = {};
const note = (m, kind, what) => { ((T[m] ||= {})[kind] = (T[m][kind] || 0) + 1); const k = `${m} ${kind}`; (eg[k] ||= []).length < Number(many) && eg[k].push(what); };
let rows = 0, alike = 0;
for (const f of readdirSync(join(newDir, "data", "route-store", "shards")).filter((x) => x.endsWith(".bin")).sort()) {
  const a = shard(oldDir, f), b = shard(newDir, f);
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const ra = a[k] || [], rb = b[k] || [];
    if (ra.length !== rb.length) { note("any", "a key whose row count differs", `${k}: ${ra.length} and ${rb.length}`); continue; }
    ra.forEach((x, i) => {
      const y = rb[i]; rows += 1;
      if (same(x, y)) { alike += 1; return; }
      const m = String(y[3]);
      const differ = []; for (let s = 0; s < Math.max(x.length, y.length); s += 1) if (!same(x[s], y[s])) differ.push(s);
      if (differ.some((s) => s < 7)) { note(m, "A TEXT OR A FIELD BELOW SLOT 7 DIFFERS", `${k}: slots ${differ.join(",")}`); return; }
      note(m, `slots ${differ.join(",")} differ`, `${k} «${String(y[1]).slice(0, 70)}» ${JSON.stringify(x.slice(7))} -> ${JSON.stringify(y.slice(7))}`);
      if (differ.includes(7)) {
        const was = Array.isArray(x[7]), is = Array.isArray(y[7]);
        note(m, was && !is ? "was divided, is whole" : !was && is ? "was whole, is divided" : "divides at other marks", `${k} «${String(y[1]).slice(0, 90)}» ${JSON.stringify(x[7])} -> ${JSON.stringify(y[7] ?? null)}`);
      }
    });
  }
}
console.log(`${rows.toLocaleString("en-US")} rows set side by side · ${alike.toLocaleString("en-US")} the same in every slot`);
for (const [m, kinds] of Object.entries(T)) for (const [kind, c] of Object.entries(kinds)) { console.log(`${m.padEnd(5)} ${String(c).padStart(6)}  ${kind}`); for (const e of eg[`${m} ${kind}`]) console.log(`              ${e}`); }
