#!/usr/bin/env node
// GUARDS: import-side-effect-rule-v1-a-check-that-rebuilds-its-own-baseline-cannot-fail
//
// A tool that writes files at module scope writes them when it is IMPORTED,
// not only when it is run. That is ordinary JavaScript and it is easy to
// forget, and the way it goes wrong here is specific and quiet.
//
// It went wrong on 2026-08-31. An emitter wrote its record at module scope.
// The check for that record imported the emitter — for one exported constant,
// a list of class names. So running the check re-ran the emitter, which read
// its input path from process.argv, which the CHECK owned. The check was
// invoked with --census pointing at a census stripped on purpose; the emitter
// took that same argument, rebuilt the baseline from the stripped file, and
// the check then compared that baseline against the file it came from and
// agreed with itself.
//
// It passed. It passed against data deliberately broken to make it fail, and
// it would have gone on passing against a real stripped copy forever.
//
// Two things make that possible and this refuses the first:
//   1. a module that does work at import
//   2. a check whose baseline is derived from the same input it is judging
//
// So: any tool imported by another tool must guard its work behind a main
// check, and export only what a reader can take without the file doing
// anything. A module that means to be both a library and a program says which
// it is being.
//
// Run: node tools/check-no-import-side-effects-v1.mjs
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const TOOLS = join(HERE);

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

const files = readdirSync(TOOLS).filter((f) => f.endsWith(".mjs"));
const src = Object.fromEntries(files.map((f) => [f, readFileSync(join(TOOLS, f), "utf8")]));

// who imports whom, by relative specifier — the only way one tool reaches
// another here
const importedBy = {};
for (const [f, s] of Object.entries(src))
  for (const m of s.matchAll(/from\s+"\.\/([a-z0-9.-]+\.mjs)"/g))
    (importedBy[m[1]] = importedBy[m[1]] || []).push(f);

const MAIN_GUARD = /import\.meta\.url\s*[!=]==\s*`file:\/\/\$\{process\.argv\[1\]\}`/;
// a write standing at column zero or one level of indentation, not inside a
// function body — the shape that runs on import
const MODULE_SCOPE_WRITE = /^(?!\s*(\/\/|\*))\s{0,2}(writeFileSync|mkdirSync|unlinkSync|rmSync|renameSync|appendFileSync)\(/gm;

const risky = [];
for (const [mod, by] of Object.entries(importedBy)) {
  const s = src[mod];
  if (!s) continue;
  if (MAIN_GUARD.test(s)) continue;
  const writes = [...s.matchAll(MODULE_SCOPE_WRITE)];
  if (writes.length) risky.push({ mod, by, writes: writes.length });
}

console.log(`— ${Object.keys(importedBy).length} modules are imported by another tool —`);
check("no imported module does file work at import, unguarded",
  risky.length === 0,
  risky.length
    ? risky.map((r) => `${r.mod} (${r.writes} write${r.writes > 1 ? "s" : ""}, imported by ${r.by.join(", ")})`).join(" · ")
    : "every one either writes nothing or guards on being the program");

// And the second half of the trap, stated so it is not forgotten: a check must
// not derive its own expectation from the thing it is judging. This cannot be
// asserted mechanically — it is a fact about what a check MEANS — so it is
// printed on every run rather than silently assumed.
console.log("\n  standing rule, not machine-checked: a check may not derive its baseline from the");
console.log("  input it is judging. A check that rebuilds what it compares against will agree");
console.log("  with itself forever. Make a check fail on purpose before trusting it to pass.");

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
