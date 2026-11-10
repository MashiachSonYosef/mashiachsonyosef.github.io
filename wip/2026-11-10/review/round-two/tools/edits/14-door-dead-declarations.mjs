// The door builder's sixteen declarations that nothing in the file reads leave it (the review's section 5; the
// fifth reader's finding 18), each with the comment that stood on it. Found by parsing the file and following
// every name to a fixed point (the review's dead-decls tool); each is refused unless it stands where the review
// found it and under the name it had. What the door writes is the same bytes before and after (proven by
// building the door both ways). The code stays in the repository's history.
// node 14-door-dead-declarations.mjs <reader dir> <a node_modules holding acorn>
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
const R = process.argv[2];
const require = createRequire(join(process.argv[3], "x.js"));
const acorn = require("acorn");
const p = join(R, "tools", "build-front-door-v1.mjs");
const src = readFileSync(p, "utf8");
const DEAD = ["gateNotice", "HEB_RUN", "plainWitness", "STAMP_AX", "STAMP_CLS", "stampDelta", "stampGlyph", "stampRows", "WITNESSES_PATH", "sectionStamp", "censusDemoHtml", "censusPointer", "refPointer", "titleCase", "posSection", "benchHtml"];
const ast = acorn.parse(src, { ecmaVersion: "latest", sourceType: "module", locations: true });
const found = new Map();
for (const node of ast.body) {
  if (node.type !== "VariableDeclaration" && node.type !== "FunctionDeclaration") continue;
  const names = node.type === "FunctionDeclaration" ? [node.id.name] : node.declarations.map((d) => d.id && d.id.name).filter(Boolean);
  if (names.length !== 1) continue;
  if (DEAD.includes(names[0])) found.set(names[0], node);
}
const missing = DEAD.filter((n) => !found.has(n));
if (missing.length) throw new Error(`not found at the file's own level: ${missing.join(", ")}`);
// nothing else in the file may read any of them: every other occurrence of the name must lie inside a dead declaration
const ranges = [...found.values()].map((n) => [n.start, n.end]);
const inDead = (i) => ranges.some(([a, b]) => i >= a && i < b);
for (const name of DEAD) {
  const re = new RegExp(`(?<![A-Za-z0-9_$.])${name.replace(/\$/gu, "\\$")}(?![A-Za-z0-9_$])`, "gu");
  for (const m of src.matchAll(re)) if (!inDead(m.index)) throw new Error(`${name} is read at offset ${m.index}, outside the dead declarations`);
}
const lines = src.split("\n");
// each declaration's whole lines, and the comment lines standing directly on it (no blank line between)
const cut = new Set();
for (const [name, node] of found) {
  let a = node.loc.start.line - 1; const b = node.loc.end.line - 1;
  if (src.slice(node.start - node.loc.start.column, node.start).trim() !== "") throw new Error(`${name} does not begin its line`);
  while (a > 0 && /^\s*\/\//u.test(lines[a - 1]) && !cut.has(a - 1)) a -= 1;
  for (let i = a; i <= b; i += 1) cut.add(i);
}
// a comment block is taken only where every declaration it stands over is dead: walk each cut run and put back a
// leading comment that is followed, inside the run, by nothing dead (cannot happen by construction) — and refuse
// if a cut would leave a live declaration without the comment that stood on it
const out = [];
let removed = 0;
for (let i = 0; i < lines.length; i += 1) {
  if (cut.has(i)) { removed += 1; continue; }
  // no two blank lines where a block left
  if (lines[i].trim() === "" && out.length && out[out.length - 1].trim() === "" && cut.has(i - 1)) continue;
  out.push(lines[i]);
}
writeFileSync(p, out.join("\n"));
console.log(`build-front-door-v1.mjs: ${DEAD.length} declarations nothing reads removed, ${removed} lines with the comments standing on them (${lines.length} lines before, ${out.length} after)`);
