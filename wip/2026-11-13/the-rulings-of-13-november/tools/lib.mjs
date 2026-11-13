// Exact-text edits of a file, each refused unless its text stands the stated number of times.
import { readFileSync, writeFileSync } from "node:fs";
export const edit = (file, pairs) => {
  let s = readFileSync(file, "utf8");
  for (const [from, to, n = 1] of pairs) {
    const c = s.split(from).length - 1;
    if (c !== n) throw new Error(`${file}: expected ${n} of ${JSON.stringify(from.slice(0, 90))}, found ${c}`);
    s = s.split(from).join(to);
  }
  writeFileSync(file, s);
  console.log(`${file.split("/").pop()}: ${pairs.length} edit(s)`);
};
// A stretch of a file replaced whole: everything from the start of `from` up to the start of `to`, each of which
// must stand exactly once, `from` before `to`. For a block too long to quote as an exact-text edit.
export const span = (file, stretches) => {
  let s = readFileSync(file, "utf8");
  for (const [from, to, put] of stretches) {
    for (const x of [from, to]) { const c = s.split(x).length - 1; if (c !== 1) throw new Error(`${file}: expected 1 of ${JSON.stringify(x.slice(0, 90))}, found ${c}`); }
    const a = s.indexOf(from), b = s.indexOf(to);
    if (a >= b) throw new Error(`${file}: ${JSON.stringify(from.slice(0, 60))} does not stand before ${JSON.stringify(to.slice(0, 60))}`);
    s = s.slice(0, a) + put + s.slice(b);
  }
  writeFileSync(file, s);
  console.log(`${file.split("/").pop()}: ${stretches.length} stretch(es) replaced`);
};
