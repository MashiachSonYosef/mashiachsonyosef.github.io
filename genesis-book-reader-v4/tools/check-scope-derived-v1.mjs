#!/usr/bin/env node
// check-scope-derived-v1
//
// The check that checks the checks can run at all.
//
// On 2026-08-23 five works were withdrawn. Twenty checks went on opening
// ?b=genesis and ?b=1kings, which is to say twenty checks stopped running, and
// nothing anywhere said so. During exactly that window the export was broken
// end to end for every work in the repository — a word carrying a key and no
// shown reading threw on the first one, so no file had ever been produced —
// and check-export-v1 could not open a page to notice. A suite that cannot run
// does not report red. It reports nothing, which reads exactly like green.
//
// So this is the instrument for the failure that hides: not a check that is
// wrong, a check that is absent.
//
//   node tools/check-scope-derived-v1.mjs
//
//   S1  no check names a work in its own source
//   S2  every zone on disk is opened by at least one check
//   S3  every check that can run, runs — and the dormant ones are counted
//   S4  a check that skips says which fact about the corpus made it skip
//
// Not covered: whether a check that runs asserts anything worth asserting.
// This file proves the suite is pointed at what is here; it cannot prove the
// suite is good.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { zonesOnDisk, zonesWithCommentary } from "./zones-on-disk-v1.mjs";

const TOOLS = "tools";
let bad = 0;
const check = (name, ok, detail = "") => {
  if (!ok) bad += 1;
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${name}${detail ? `  ·  ${detail}` : ""}`);
};

const checkFiles = readdirSync(TOOLS)
  .filter((f) => /^check-.*\.mjs$/.test(f))
  .filter((f) => f !== "check-scope-derived-v1.mjs")
  .sort();

// ---- S1 : no check names a work in its own source -------------------------
//
// A slug typed into a check is a claim about the future — true until somebody
// moves a work, and silent when it stops being true. The zone a check opens
// belongs to the directory, not to the file.
const named = [];
for (const f of checkFiles) {
  const src = readFileSync(join(TOOLS, f), "utf8");
  // a slug inside a comment is prose about a book, not a target
  const code = src.split("\n").filter((l) => !/^\s*(\/\/|\*)/.test(l)).join("\n");
  // Two ways a check can name a work, and this only looked for one of them.
  // A URL target (?b=genesis) and a file target (data/zones/genesis.bin) are
  // the same claim about the future; check-antiquity-tier-v1 defaulted to the
  // second and this file called the tree clean. A filter that admits only
  // certain work names is the third and worst — it does not fail, it silently
  // examines nothing, which is how check-provider-characters-v1 came to run
  // its assertions over an empty list.
  const found = new Set();
  for (const m of code.matchAll(/[?&]b=([a-z0-9-]+)/g)) found.add(`?b=${m[1]}`);
  for (const m of code.matchAll(/data\/zones\/([a-z0-9-]+)\.bin/g)) found.add(`data/zones/${m[1]}.bin`);
  for (const m of code.matchAll(/\/\^\(([a-z0-9|-]+)\)\\\.bin\$\//g)) found.add(`filter:${m[1]}`);
  if (found.size) named.push(`${f} → ${[...found].join(", ")}`);
}
check("no check names a work in its own source", named.length === 0,
  named.length ? named.slice(0, 4).join(" · ") : `${checkFiles.length} checks, all derived`);

// ---- S2 : every zone on disk is opened by at least one check ---------------
//
// A work nobody looks at is a work nobody is checking. The suite may sample
// rather than sweep, but a zone that no check will ever open should be said
// out loud rather than discovered by a reader.
const zones = zonesOnDisk();
const sweeps = checkFiles.filter((f) => {
  const src = readFileSync(join(TOOLS, f), "utf8");
  return /zoneUrls\(|zonesOnDisk\(\)\s*\.(map|forEach)|for\s*\(\s*const\s+\w+\s+of\s+zonesOnDisk/.test(src);
});
const samplers = checkFiles.filter((f) => {
  const src = readFileSync(join(TOOLS, f), "utf8");
  return /defaultZoneUrl\(|zonesOnDisk\(\)\[0\]/.test(src);
});
// Breadth can come from the check or from the runner. A check that samples one
// work is not a defect if the runner hands it every work in turn; what would
// be a defect is a zone no path reaches. So this asks both.
const runnerSrc = existsSync(join(TOOLS, "run-all-checks.sh"))
  ? readFileSync(join(TOOLS, "run-all-checks.sh"), "utf8") : "";
const runnerSweeps = /zonesOnDisk\(\)/.test(runnerSrc) && /for URL in/.test(runnerSrc);
const reached = new Set();
if (sweeps.length || runnerSweeps) zones.forEach((z) => reached.add(z));
else if (samplers.length && zones.length) reached.add(zones[0]);
const unreached = zones.filter((z) => !reached.has(z));
check("every zone on disk is opened by at least one check", unreached.length === 0,
  unreached.length
    ? `never opened: ${unreached.join(", ")} — ${sweeps.length} sweeping check(s), ` +
      `${samplers.length} sampling, runner ${runnerSweeps ? "sweeps" : "does not sweep"}`
    : `${zones.length} zone(s) · ${runnerSweeps ? "the runner sweeps them" : `${sweeps.length} sweeping check(s)`}`);

// The runner's own default is the same kind of claim a check's was.
check("the runner does not name a work either",
  !/[?&]b=(genesis|1kings|i-kings|ruth)\b/.test(runnerSrc.split("\n").filter((l) => !/^\s*#/.test(l)).join("\n")),
  runnerSweeps ? "derived from the directory" : "check tools/run-all-checks.sh");

// ---- S3/S4 : what is dormant, and why -------------------------------------
//
// A check that exits 0 having looked at nothing is honest and invisible. Six
// of them skip today because no served work carries a commentary sidecar,
// which is a true fact about the corpus and not a defect in the reader — but
// six silent passes are how a suite comes to mean less than it appears to.
// They are counted here so the number is on the page.
const guarded = checkFiles.filter((f) =>
  /zonesWithCommentary\(/.test(readFileSync(join(TOOLS, f), "utf8")));
const commentaryZones = zonesWithCommentary();
const dormant = commentaryZones.length ? [] : guarded;

check("a check that skips says which fact made it skip",
  guarded.every((f) => /nothing to check|SKIP_LABEL/.test(readFileSync(join(TOOLS, f), "utf8"))),
  `${guarded.length} guarded check(s)`);

check("the suite is not mostly dormant",
  dormant.length * 2 < checkFiles.length,
  dormant.length
    ? `${dormant.length} of ${checkFiles.length} dormant — no served work carries commentary`
    : `${checkFiles.length} checks, none dormant`);

console.log("");
console.log(`  zones on disk        : ${zones.join(", ") || "none"}`);
console.log(`  zones with commentary: ${commentaryZones.join(", ") || "none"}`);
console.log(`  checks               : ${checkFiles.length} · ${sweeps.length} sweep · ${samplers.length} sample · ${dormant.length} dormant`);
if (dormant.length) {
  console.log("");
  console.log("  Dormant today, and they wake when a work with commentary is served:");
  for (const f of dormant) console.log(`    ${f}`);
}
console.log("");
console.log(bad ? `  ${bad} FAILED` : "  all checks passed");
process.exit(bad ? 1 : 0);
