#!/usr/bin/env node
// check-workspace-staged-v1 · the first thing to run after a rollback
//
// Reads data/workspace-manifest-v1.json — written on the branch, which
// survives what the container does not — and says which corpus files are
// missing from the staged workspace. It prints them twice: once as a list a
// person can read, and once as the exact JSON array of workspace-relative paths, so the
// whole recovery is one staging call instead of a guess-and-fail loop.
//
// Exit 0 when nothing is missing, 1 when something is. Exit 3 when the
// manifest itself is absent, because a check that cannot reach its input has
// not passed and has not failed.
import { readFileSync, existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : dflt;
};
const K3 = join(dirname(fileURLToPath(import.meta.url)), "..");
const WORKSPACE = arg("workspace", "/mnt/user-data/uploads/999 footsteps");
const MAN = arg("manifest", join(K3, "data", "workspace-manifest-v1.json"));

if (!existsSync(MAN)) {
  console.log(`SKIPPED — ${MAN} is not on this branch; run emit-workspace-manifest-v1 once from a warm workspace`);
  process.exit(3);
}
const M = JSON.parse(readFileSync(MAN, "utf8"));

const missing = [], wrong = [], here = [];
for (const f of M.files) {
  const abs = join(WORKSPACE, f.path);
  if (!existsSync(abs)) { missing.push(f); continue; }
  // A file that is present but a different size is not the file the manifest
  // recorded. Said, not silently accepted — a truncated stage is worse than
  // an absent one, because everything downstream trusts it.
  const n = statSync(abs).size;
  if (f.bytes != null && n !== f.bytes) wrong.push({ ...f, found: n });
  else here.push(f);
}

console.log(`workspace: ${WORKSPACE}`);
console.log(`manifest:  ${M.counts.files} files · ${M.counts.works_planned} works planned`);
console.log(`present:   ${here.length}${wrong.length ? ` (+${wrong.length} present at a different size)` : ""}`);
console.log(`missing:   ${missing.length}`);

if (wrong.length) {
  console.log("\nthese are present but not the size the manifest recorded — stage them again:");
  for (const f of wrong) console.log(`  ${f.path}  ·  manifest ${f.bytes} B, found ${f.found} B`);
}
if (missing.length) {
  console.log("\nmissing, by what it is for:");
  for (const f of missing) console.log(`  ${f.path}\n      ${f.why}${f.works.length ? `  ·  ${f.works.join(", ")}` : ""}`);
  console.log("\nstage these — one call, paths under the workspace root:\n");
  console.log(JSON.stringify([...missing, ...wrong].map((f) => f.path), null, 0));
}

console.log();
if (missing.length || wrong.length) {
  console.log(`${missing.length + wrong.length} to stage. Recovery, in order:`);
  for (const step of M.recovery) console.log(`  · ${step}`);
  process.exit(1);
}
console.log("every file the manifest names is staged at the size it recorded — this lane can serve and build");
