// The door builder and the search index builder, each run with one record it is built from taken away: does it refuse,
// and what does it say. A record with a flag is pointed at a path that does not exist; a record read at a fixed path
// is moved aside for the run and put back, whatever happens. The door is written to a scratch folder, never the tree's.
// node door-refuses-without.mjs <reader dir> <scratch out dir> [--tool <path to another build-front-door-v1.mjs>]
// With --tool, that copy of the builder is run in the same tree (to show what the builder before this edit did).
import { spawnSync } from "node:child_process";
import { existsSync, renameSync, rmSync, mkdirSync, cpSync } from "node:fs";
import { join } from "node:path";
const argv = process.argv.slice(2);
const ti = argv.indexOf("--tool"); const other = ti >= 0 ? argv.splice(ti, 2)[1] : null;
const [reader, out] = argv;
// another copy of the builder is run from the tree's own tools folder (its imports are relative), under a probe name
const DOOR = other ? "tools/zz-door-probe-copy.mjs" : "tools/build-front-door-v1.mjs";
if (other) cpSync(other, join(reader, DOOR));
const run = (tool, args) => {
  rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
  const r = spawnSync("node", [tool, ...args], { cwd: reader, encoding: "utf8", maxBuffer: 1 << 28 });
  const said = `${r.stderr || ""}\n${r.stdout || ""}`.split("\n").map((l) => l.trim()).filter((l) => /refus|REFUSED|Error:|ENOENT/u.test(l))[0] || "";
  return { code: r.status, said: said.slice(0, 230) };
};
const aside = (path, fn) => {
  const held = `${path}.held-aside-by-probe`;
  renameSync(path, held);
  try { return fn(); } finally { renameSync(held, path); }
};
const rows = [];
const flagged = [["work-status", "data/work-status-v1.json"], ["grouping", "data/book-grouping-v1.json"], ["book-order", "data/book-order-v1.json"], ["grouping-attestation", "data/grouping-attestation-v1.json"], ["postures", "data/license-postures-v1.json"], ["overlay-counts", "data/overlay-book-counts-v1.json"], ["reference-groups", "data/reference-groups-v1.json"], ["history", "data/address-history-v1.json"]];
try {
  for (const [flag, path] of flagged) rows.push([`door without ${path}`, run(DOOR, ["--out", out, `--${flag}`, join(out, "no-such-record.json")])]);
  for (const path of ["data/source-corpus-v1.json", "data/color-contract-v1.json", "data/rule-demonstrations-v1.json"])
    rows.push([`door without ${path}`, aside(join(reader, path), () => run(DOOR, ["--out", out]))]);
  if (!other) {
    // the search index: an overlay whose index cannot be read, and a store one shard short. It writes into a folder of
    // its own beside data/search and renames it into place only at the end, so a refusal leaves the index as it was.
    rows.push(["search index without data/overlays/jastrow/index.json", aside(join(reader, "data/overlays/jastrow/index.json"), () => run("tools/bake-search-index-v1.mjs", []))]);
    rows.push(["search index with the route store one shard short", aside(join(reader, "data/route-store/shards/00.bin"), () => run("tools/bake-search-index-v1.mjs", []))]);
  }
} finally {
  if (other) rmSync(join(reader, DOOR), { force: true });
  rmSync(out, { recursive: true, force: true });
}
let refused = 0;
for (const [what, r] of rows) { if (r.code !== 0) refused += 1; console.log(`${r.code === 0 ? "BUILT   " : "refused "} exit ${r.code} · ${what}${r.said ? ` · ${r.said}` : ""}`); }
console.log(`${rows.length} runs · ${refused} refused · ${rows.length - refused} built without the record`);
for (const p of ["data/source-corpus-v1.json", "data/color-contract-v1.json", "data/rule-demonstrations-v1.json", "data/overlays/jastrow/index.json", "data/route-store/shards/00.bin"]) if (!existsSync(join(reader, p))) console.log(`NOT RESTORED: ${p}`);
