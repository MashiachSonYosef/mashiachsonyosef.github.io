// "Am I the program" asked one way (the fifth reader's finding 14): eleven tools compared import.meta.url with
// "file://" + process.argv[1], which is false from any path with a space or a link in it, and a tool that
// answers false writes nothing and exits 0. They ask tools/main-guard-v1.mjs.
// node 12-main-guard.mjs <reader dir>
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];
const T = join(R, "tools");

// the three this round already mended inline take the shared question
const INLINE = `// run as a program, not imported by the check: asked of the path itself (a
// path with a space or a link in it is still this file; the string compare
// this replaced answered no, and the tool then wrote nothing and exited 0)
const startedHere = (() => { try { return !!process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href; } catch { return false; } })();
if (startedHere) {`;
const INLINE2 = `// run as a program, not imported by the check: asked of the path itself (a
// path with a space or a link in it is still this file)
const startedHere = (() => { try { return !!process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href; } catch { return false; } })();
if (startedHere) {`;
const ASK = `// run as a program, not imported (tools/main-guard-v1.mjs says why it is asked this way)
if (startedAs(import.meta.url)) {`;
edit(join(T, "build-chain-book-v1.mjs"), [
  [INLINE, ASK],
  [`import { fileURLToPath, pathToFileURL } from "node:url";`, `import { fileURLToPath } from "node:url";\nimport { startedAs } from "./main-guard-v1.mjs";`],
  [`import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, realpathSync } from "node:fs";`, `import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";`],
]);
edit(join(T, "emit-lane-state-v1.mjs"), [
  [INLINE2, ASK],
  [`import { fileURLToPath, pathToFileURL } from "node:url";`, `import { fileURLToPath } from "node:url";\nimport { startedAs } from "./main-guard-v1.mjs";`],
  [`import { readFileSync, writeFileSync, existsSync, readdirSync, realpathSync } from "node:fs";`, `import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";`],
]);
edit(join(T, "emit-ledger-index-v1.mjs"), [
  [INLINE2, ASK],
  [`import { fileURLToPath, pathToFileURL } from "node:url";`, `import { fileURLToPath } from "node:url";\nimport { startedAs } from "./main-guard-v1.mjs";`],
  [`import { readFileSync, writeFileSync, readdirSync, existsSync, realpathSync } from "node:fs";`, `import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";`],
]);

// the eight that still compared the two strings
const OLD = "if (import.meta.url === `file://${process.argv[1]}`) {";
for (const f of ["build-toggle-design-v1.mjs", "emit-pointing-grade-recount-v1.mjs", "emit-struck-ranks-v1.mjs", "project-declarations-v1.mjs", "project-piece-gloss-v1.mjs", "push-toggles-v1.mjs", "run-checks-v1.mjs", "strike-language-v1.mjs"]) {
  const p = join(T, f);
  let s = readFileSync(p, "utf8");
  if (s.split(OLD).length - 1 !== 1) throw new Error(`${f}: expected one main guard, found ${s.split(OLD).length - 1}`);
  // the import goes in above the file's first import line
  const at = s.search(/^import /mu);
  if (at < 0) throw new Error(`${f}: no import line to stand beside`);
  s = `${s.slice(0, at)}import { startedAs } from "./main-guard-v1.mjs";\n${s.slice(at)}`;
  s = s.replace(OLD, ASK);
  writeFileSync(p, s);
  console.log(`${f}: the main guard asks main-guard-v1`);
}
