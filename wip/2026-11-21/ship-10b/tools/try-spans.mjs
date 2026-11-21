// Ship 10b: read the spans list through the tree's pin and count each book's units (no zone needed: places are ranked by verse and word number)
import { join } from "node:path";
const [reader, ledger] = process.argv.slice(2);
const m = await import(join(reader, "tools/default-spans-v1.mjs"));
const got = m.readDefaultSpans(join(reader, m.DEFAULT_SPANS_HOME, "PIN.json"), ledger);
console.log(JSON.stringify(got.classes, null, 1));
const tot = Object.fromEntries(m.SPAN_SOURCES.map((s) => [s, { units: 0, lines: 0, nested: 0, filed_beside: 0, sizes: {} }]));
for (const [book, lines] of got.byBook) {
  const order = new Map(); const places = new Set(); for (const r of lines) { places.add(r.p); for (const p of r.places) places.add(p); }
  const key = (p) => p.split(":").map(Number);
  [...places].sort((a, b) => { const x = key(a), y = key(b); return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]; }).forEach((p, i) => order.set(p, i));
  const u = m.unitsOfBook(book, lines, order);
  for (const s of m.SPAN_SOURCES) { tot[s].units += u[s].units.length; tot[s].lines += u[s].lines; tot[s].nested += u[s].nested; tot[s].filed_beside += u[s].filed_beside; for (const x of u[s].units) tot[s].sizes[x.places.length] = (tot[s].sizes[x.places.length] || 0) + 1; }
}
console.log(JSON.stringify(tot), "books", got.byBook.size);
