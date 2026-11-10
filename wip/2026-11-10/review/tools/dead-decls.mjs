// Declarations at a file's own level that nothing in the file refers to, followed to a fixed point:
// a name used only inside declarations already found dead is dead too. Exports are never dead.
// Says how many lines each one is. A first pass by names inside one file: a module's exports and a
// name read by another file through import are kept by construction (they are exported).
// node dead-decls.mjs <file.mjs|file.js> [--script] [--closure]
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const acorn = require("acorn");
const args = process.argv.slice(2);
const script = args.includes("--script"), closure = args.includes("--closure");
const file = args.find((a) => !a.startsWith("--"));
const src = readFileSync(file, "utf8").replace(/^#!.*/u, (m) => " ".repeat(m.length));
const ast = acorn.parse(src, { ecmaVersion: "latest", sourceType: script ? "script" : "module", locations: true });
const body = closure ? ast.body[0].expression.callee.body.body : ast.body;
const decls = []; // { names, node, exported }
for (const n of body) {
  if (n.type === "VariableDeclaration") for (const d of n.declarations) { if (d.id.type === "Identifier") decls.push({ name: d.id.name, node: d, stmt: n, only: n.declarations.length === 1 }); }
  else if (n.type === "FunctionDeclaration" || n.type === "ClassDeclaration") decls.push({ name: n.id.name, node: n, stmt: n, only: true });
}
// every identifier reference in the file, with the span it sits in
const refs = [];
const walk = (n, parent, key) => { if (!n || typeof n.type !== "string") return;
  if (n.type === "Identifier") {
    const isDeclId = parent && ((parent.type === "VariableDeclarator" && key === "id") || ((parent.type === "FunctionDeclaration" || parent.type === "ClassDeclaration") && key === "id"));
    const isProp = parent && ((parent.type === "MemberExpression" && key === "property" && !parent.computed) || (parent.type === "Property" && key === "key" && !parent.computed && !parent.shorthand) || (parent.type === "MethodDefinition" && key === "key"));
    if (!isDeclId && !isProp) refs.push({ name: n.name, at: n.start });
  }
  for (const k of Object.keys(n)) { const v = n[k]; if (k === "loc" || !v || typeof v !== "object") continue; if (Array.isArray(v)) v.forEach((c) => walk(c, n, k)); else walk(v, n, k); } };
walk(ast, null, null);
const dead = new Set();
let moved = true;
while (moved) {
  moved = false;
  for (const d of decls) {
    if (dead.has(d)) continue;
    const used = refs.some((r) => r.name === d.name && !(r.at >= d.node.start && r.at < d.node.end) && ![...dead].some((x) => r.at >= x.node.start && r.at < x.node.end));
    if (!used) { dead.add(d); moved = true; }
  }
}
let lines = 0;
const out = [...dead].sort((a, b) => a.node.start - b.node.start).map((d) => { const l = d.node.loc.end.line - d.node.loc.start.line + 1; lines += l; return `  ${d.node.loc.start.line}: ${d.name} (${l} line${l === 1 ? "" : "s"})`; });
console.log(`${file.split("/").pop()}: ${decls.length} declarations at its own level, ${dead.size} nothing in the file reads (${lines} lines)`);
console.log(out.join("\n"));
