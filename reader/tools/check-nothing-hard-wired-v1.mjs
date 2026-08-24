#!/usr/bin/env node
// GUARDS: front-door-rule-v1-the-door-lists-what-the-zones-carry, dibbur-hamatchil-rule-v2-the-window-is-the-verse
//
// A build step reads no file a flag cannot change.
//
// The difference between a pipeline and a script is whether it can be pointed
// at something else. The tool that attached the Genesis commentary could not
// be: it required one pack by its literal path and read the base text out of a
// field holding exactly one verse. It produced a correct map and could never
// have produced a second one, and nothing said so.
//
// So this says so, and says it structurally rather than by hunting for names —
// a name in a comment is prose, a name in a schema field is the pack's own
// spelling, and neither is the fault. The fault is an input nobody can
// redirect. Every call that opens something is found, and its path must come
// from a variable, not from a literal.
//
// Two things are not faults and are not reported. A path under `tools/` is part
// of the tool rather than an input to it — a declaration file travels with the
// code that reads it. And a literal inside an `arg(` call is a default that a
// flag overrides, which is the one honest place for one.
//
// Run: node tools/check-nothing-hard-wired-v1.mjs

import { readFileSync, readdirSync } from "node:fs";

let bad = 0;
const check = (name, ok, detail = "") => {
  if (!ok) bad += 1;
  console.log(`${ok ? "  ok  " : "FAIL  "}${name}${detail ? "  ·  " + detail : ""}`);
};

// Everything that opens something.
const OPENERS = /\b(readFileSync|readdirSync|createReadStream|openRouteStore|require|existsSync)\s*\(\s*(["'`])([^"'`]*)\2/g;

// The manifest is not a build step. Its subject is the tool directory, so
// reading the tool directory is the whole of its job and not an input it
// should be able to be pointed away from.
const NOT_A_BUILD_STEP = new Set(["pipeline-manifest-v1.mjs"]);
const BUILDERS = readdirSync("tools")
  .filter((f) => /\.mjs$/.test(f) && !f.startsWith("check-") && !NOT_A_BUILD_STEP.has(f))
  .sort();

console.log("— a build step reads no file a flag cannot change —");
let scanned = 0, clean = 0;
const offenders = [];
for (const f of BUILDERS) {
  const src = readFileSync(`tools/${f}`, "utf8");
  const hits = [];
  for (const m of src.matchAll(OPENERS)) {
    const path = m[3];
    // part of the tool, not an input to it
    if (/^\.{0,2}\/?tools\//.test(path) || /^\.\/[a-z-]+\.mjs$/.test(path)) continue;
    if (/^node:/.test(path)) continue;
    // a default a flag overrides: look back for the arg( that wraps it
    const before = src.slice(Math.max(0, m.index - 120), m.index);
    if (/\barg(?:Of|_)?\s*\([^)]*$/.test(before)) continue;
    hits.push(`${path || "(empty)"}`);
  }
  scanned += 1;
  if (!hits.length) clean += 1;
  else offenders.push(`${f}: ${[...new Set(hits)].slice(0, 3).join(", ")}`);
}
for (const o of offenders) check(`  ${o.split(":")[0]}`, false, o.slice(o.indexOf(":") + 2));
check("  every build step can be pointed at another book", clean === scanned,
  `${clean} of ${scanned} open nothing a flag cannot redirect`);

// And the one that matters most, named: the commentary attachment path, which
// is the reason this check exists.
const PAIR = ["generate-attachment-map-v2.mjs", "build-commentary-sidecar-v1.mjs"];
for (const f of PAIR) {
  const src = readFileSync(`tools/${f}`, "utf8");
  const flags = [...new Set([...src.matchAll(/\barg(?:Of)?\s*\(\s*["'`]([a-z-]+)["'`]/g)].map((m) => m[1]))];
  check(`  ${f} takes its inputs as flags`,
    flags.includes("pack") && flags.includes("zone") && flags.includes("out"),
    flags.join(" "));
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
