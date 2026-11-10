// The shape of the page script: the one closure's own statements, how long each is, where it awaits,
// the longest functions anywhere in it, and how deep the nesting goes.
// node script-shape.mjs <zone-script.js (lines kept)>
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const acorn = require("acorn");
const src = readFileSync(process.argv[2], "utf8");
const ast = acorn.parse(src, { ecmaVersion: "latest", sourceType: "script", locations: true });
const body = ast.body[0].expression.callee.body.body;
const len = (n) => n.loc.end.line - n.loc.start.line + 1;
const kinds = {};
let awaitsTop = 0;
const walk = (n, f, depth = 0) => { if (!n || typeof n.type !== "string") return; f(n, depth); for (const k of Object.keys(n)) { const v = n[k]; if (k === "loc" || !v || typeof v !== "object") continue; if (Array.isArray(v)) for (const c of v) walk(c, f, depth + 1); else walk(v, f, depth + 1); } };
const hasTopAwait = (n) => { let found = false; const go = (x) => { if (!x || typeof x.type !== "string" || found) return; if (x.type === "AwaitExpression") { found = true; return; } if (/Function/u.test(x.type)) return; for (const k of Object.keys(x)) { const v = x[k]; if (k === "loc" || !v || typeof v !== "object") continue; if (Array.isArray(v)) v.forEach(go); else go(v); } }; go(n); return found; };
const top = [];
for (const n of body) {
  kinds[n.type] = (kinds[n.type] || 0) + 1;
  const aw = hasTopAwait(n); if (aw) awaitsTop += 1;
  let name = n.type;
  if (n.type === "VariableDeclaration") name = `${n.kind} ${n.declarations.map((d) => (d.id.name || "{…}")).join(", ")}`;
  else if (n.type === "FunctionDeclaration") name = `function ${n.id.name}`;
  else if (n.type === "ExpressionStatement" && n.expression.type === "CallExpression") name = `call ${src.slice(n.expression.callee.start, Math.min(n.expression.callee.end, n.expression.callee.start + 60)).split("\n")[0]}`;
  else if (n.type === "ExpressionStatement" && n.expression.type === "AssignmentExpression") name = `assign ${src.slice(n.expression.left.start, n.expression.left.end).slice(0, 50)}`;
  top.push({ line: n.loc.start.line, end: n.loc.end.line, lines: len(n), name: name.slice(0, 90), aw });
}
console.log(`the closure holds ${body.length} statements of its own: ${Object.entries(kinds).map(([k, v]) => `${v} ${k}`).join(", ")} · ${awaitsTop} of them await at the closure's own level`);
console.log("\nthe statements that await (the order they stand in is the order the page comes up in):");
for (const t of top.filter((x) => x.aw)) console.log(`  ${t.line}-${t.end} (${t.lines}) ${t.name}`);
console.log("\nthe 30 longest statements:");
for (const t of [...top].sort((a, b) => b.lines - a.lines).slice(0, 30)) console.log(`  ${t.line}-${t.end} (${t.lines} lines) ${t.name}`);
const fns = [];
walk(ast, (n) => { if (/Function/u.test(n.type) && len(n) >= 120) fns.push({ line: n.loc.start.line, lines: len(n), name: (n.id && n.id.name) || "" }); });
// name an arrow by the declarator that holds it
const named = new Map();
walk(ast, (n) => { if (n.type === "VariableDeclarator" && n.init && /Function/u.test(n.init.type) && n.id.name) named.set(n.init.start, n.id.name); if (n.type === "Property" && n.value && /Function/u.test(n.value.type) && n.key.name) named.set(n.value.start, n.key.name); });
walk(ast, (n) => { if (/Function/u.test(n.type) && len(n) >= 120) { const f = fns.find((x) => x.line === n.loc.start.line && x.lines === len(n)); if (f && !f.name) f.name = named.get(n.start) || "(anonymous)"; } });
console.log(`\nfunctions of 120 lines or more: ${fns.length - 1} (the closure aside)`);
for (const f of fns.sort((a, b) => b.lines - a.lines).slice(1, 41)) console.log(`  ${f.line} (${f.lines} lines) ${f.name}`);
// bucket the closure's statements by thousand lines
const bucket = {};
for (const t of top) { const b = Math.floor(t.line / 1000) * 1000; bucket[b] = bucket[b] || { n: 0, lines: 0 }; bucket[b].n += 1; bucket[b].lines += t.lines; }
console.log("\nstatements by thousand lines:", Object.entries(bucket).map(([k, v]) => `${k}: ${v.n}`).join(" · "));
