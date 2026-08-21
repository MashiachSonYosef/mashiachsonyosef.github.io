#!/usr/bin/env node
// GUARDS: landed-rule-v1-work-that-exists-only-on-this-machine-does-not-exist
//
// Everything this lane has made is on the branch, or it is named.
//
// This exists because of a loss, not a theory. The machine this lane works on
// is thrown away without warning, and it has been, repeatedly — twice in one
// afternoon. Seven checks and six tools were written, run, relied on, and never
// uploaded, because uploading is a separate act performed by a person in a
// browser and nothing was counting what was owed. They were gone. Every one had
// to be written a second time from the checks that happened to import them.
//
// A working tree is not a record. The branch is. So this fetches the branch —
// the real one, not a clone that may itself be stale — and says exactly what
// exists here and not there, and what exists in both and differs. It is the
// list to upload, printed rather than remembered.
//
// It fails while anything is unlanded. That is the point: a green suite over a
// tree half of which lives nowhere but here is a green suite that is lying
// about how much of this survives the afternoon.
//
// Data is treated apart from code. A zone is a build output and can be rebuilt
// from its inputs; a tool that was never uploaded cannot be got back at all. So
// the sources — the page, the build script, every tool, every written document
// — are asserted first, and the built artifacts after them.
//
// Needs the network. Where it cannot reach the branch it skips, loudly, rather
// than reporting a clean tree it did not check.
//
// Run: node tools/check-nothing-unlanded-v1.mjs [remote] [branch]

import { execFileSync } from "node:child_process";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const REMOTE = process.argv[2] || "https://github.com/MashiachSonYosef/mashiachsonyosef.github.io.git";
const BRANCH = process.argv[3] || "gh-pages";
// where this tree sits inside the branch
const PREFIX = "genesis-book-reader-v4/";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

// ---- the branch, as it actually is ---------------------------------------
const git = (...args) => execFileSync("git", args, { cwd: K3, encoding: "buffer", maxBuffer: 1 << 28, timeout: 120000 });
let head = null;
try {
  git("init", "-q");                       // somewhere for the fetch to land
  git("fetch", "-q", "--depth", "1", REMOTE, BRANCH);
  head = git("rev-parse", "FETCH_HEAD").toString("utf8").trim();
} catch (e) {
  console.log(`SKIPPED — could not reach ${REMOTE} ${BRANCH} (${String(e.message).split("\n")[0].slice(0, 80)})`);
  process.exit(3);
}
const listing = git("ls-tree", "-r", "--name-only", "FETCH_HEAD").toString("utf8").split("\n").filter(Boolean);
const onBranch = new Set();
for (const p of listing) if (p.startsWith(PREFIX)) onBranch.add(p.slice(PREFIX.length));
console.log(`— the branch, at ${head.slice(0, 7)} —`);
check("  the branch carries this tree", onBranch.size > 0,
  `${onBranch.size} files under ${PREFIX} of ${listing.length} on the branch`);

const shaOf = (buf) => createHash("sha256").update(buf).digest("hex");
const branchBody = (p) => { try { return git("show", `FETCH_HEAD:${PREFIX}${p}`); } catch { return null; } };

// ---- what is here --------------------------------------------------------
const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    // build directories and the screenshots checks drop as they run are this
    // machine's scratch, not work owed to the branch
    if ([".git", "site", "build", "deploy-root", "shots", "node_modules"].includes(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(relative(K3, full));
  }
  return out;
};
const here = walk(K3).sort();
// A tool, the page, the build script or a written document cannot be rebuilt
// from anything. A zone, a store shard or a generated map can.
const isSource = (p) => /^tools\//.test(p) || /^(zone|dictionary|orot)\.html$/.test(p)
  || p === "build.sh" || /\.md$/.test(p) || /^synthesis\//.test(p);

const missing = [], differs = [], same = [];
for (const p of here) {
  const mine = readFileSync(join(K3, p));
  const theirs = onBranch.has(p) ? branchBody(p) : null;
  if (!theirs) missing.push(p);
  else if (shaOf(mine) !== shaOf(theirs)) differs.push(p);
  else same.push(p);
}
const owed = [...missing, ...differs].sort();
const owedSource = owed.filter(isSource);
const owedBuilt = owed.filter((p) => !isSource(p));

console.log(`\n— what only exists on this machine —`);
console.log(`  ${here.length} files here · ${same.length} identical on the branch · ${missing.length} not there · ${differs.length} differ`);
if (owedSource.length) {
  console.log(`\n  sources owed — these cannot be rebuilt from anything and are lost if this machine goes:`);
  for (const p of owedSource) console.log(`     ${missing.includes(p) ? "new    " : "changed"}  ${p}`);
}
if (owedBuilt.length) {
  console.log(`\n  build outputs owed — rebuildable from their inputs, but stale on the site until uploaded:`);
  for (const p of owedBuilt) console.log(`     ${missing.includes(p) ? "new    " : "changed"}  ${p}`);
}

check("\n  every source this lane has written is on the branch", owedSource.length === 0,
  owedSource.length ? `${owedSource.length} owed — upload them before anything else` : `${here.filter(isSource).length} sources, all landed`);
check("  and every build output on the site is the one this tree produced", owedBuilt.length === 0,
  owedBuilt.length ? `${owedBuilt.length} owed` : "in step");

// ---- and what the branch carries that this tree does not ------------------
const gone = [...onBranch].filter((p) => !existsSync(join(K3, p))).sort();
if (gone.length) {
  console.log(`\n  on the branch and not here — deleted in this tree, still served:`);
  for (const p of gone) console.log(`     ${p}`);
}
console.log(gone.length
  ? `        ${gone.length} file(s) — a deletion is an upload too, and an old file left served is the fault orot was`
  : "        nothing on the branch that this tree has dropped");

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
