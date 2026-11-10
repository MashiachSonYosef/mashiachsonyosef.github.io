// The names the pipeline manifest orders (the tools of the tree), sorted the way localeCompare sorts them under several
// locales, against the order of their code points. Shows whether a machine set to another language would have written
// another manifest. Nothing is written.
// node locale-sort-differs.mjs <reader dir>
import { readdirSync } from "node:fs";
import { join } from "node:path";
const names = readdirSync(join(process.argv[2], "tools")).filter((f) => /\.(mjs|sh)$/u.test(f)).map((f) => `tools/${f}`);
const byCodePoint = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const base = [...names].sort(byCodePoint);
console.log(`${names.length} tool names · this process's own locale: ${Intl.DateTimeFormat().resolvedOptions().locale}`);
for (const loc of [undefined, "en-US", "cs", "da", "sv", "tr", "lt"]) {
  const sorted = [...names].sort((a, b) => (loc ? a.localeCompare(b, loc) : a.localeCompare(b)));
  const moved = sorted.filter((n, i) => n !== base[i]).length;
  const first = sorted.findIndex((n, i) => n !== base[i]);
  console.log(`  ${String(loc || "the machine's default").padEnd(22)} ${moved === 0 ? "the same order as the code points" : `${moved} names stand at another place; the first, at ${first + 1}: ${sorted[first]} where the code points put ${base[first]}`}`);
}
