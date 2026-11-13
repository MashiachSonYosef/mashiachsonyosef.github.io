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
