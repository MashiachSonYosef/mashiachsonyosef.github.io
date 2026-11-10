// The page file read as text: what its script declares and never uses again, what its sheet styles
// that nothing sets, and which custom properties are set and never read (or read and never set).
// A first pass by names; every hit is a candidate to be read, not a verdict.
// node inventory-page.mjs <repo root> [--json out]
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const args = process.argv.slice(2);
const jsonAt = args.indexOf("--json"); const jsonOut = jsonAt > -1 ? args.splice(jsonAt, 2)[1] : null;
const [root] = args;
const html = readFileSync(join(root, "reader", "zone.html"), "utf8");
const L = html.split("\n");
const styleA = L.findIndex((l) => l.trim() === "<style>"), styleB = L.findIndex((l) => l.trim() === "</style>");
const scriptA = L.findIndex((l, i) => i > styleB && l.trim() === "<script>"), scriptB = L.findIndex((l, i) => i > scriptA && l.trim() === "</script>");
const css = L.slice(styleA + 1, styleB).join("\n");
const body = L.slice(styleB + 1, scriptA).join("\n");
const jsLines = L.slice(scriptA + 1, scriptB);
const js = jsLines.join("\n");
// the script with whole-line comments blanked (line numbers kept)
const code = jsLines.map((l) => (/^\s*\/\//u.test(l) ? "" : l)).join("\n");
// everything outside the page that can set a class or read a name: the builders and the tools
const T = join(root, "reader", "tools");
const toolSrc = readdirSync(T).filter((f) => /\.(mjs|py)$/u.test(f)).map((f) => [f, readFileSync(join(T, f), "utf8")]);
const builders = toolSrc.filter(([f]) => !/^check-/u.test(f)).map(([, s]) => s).join("\n");
const checks = toolSrc.filter(([f]) => /^check-/u.test(f)).map(([, s]) => s).join("\n");

// ---- the script's declarations --------------------------------------------
const decl = new Map();
const lineOf = (idx) => code.slice(0, idx).split("\n").length + scriptA + 1;
for (const m of code.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/gu)) if (!decl.has(m[1])) decl.set(m[1], { line: lineOf(m.index), how: "binding" });
for (const m of code.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/gu)) if (!decl.has(m[1])) decl.set(m[1], { line: lineOf(m.index), how: "function" });
for (const m of code.matchAll(/\b(?:const|let|var)\s+\{([^}=]+)\}\s*=/gu)) for (const n of m[1].split(",").map((x) => x.split(":").pop().trim()).filter((x) => /^[A-Za-z_$][\w$]*$/u.test(x))) if (!decl.has(n)) decl.set(n, { line: lineOf(m.index), how: "destructured" });
const count = (text, name) => (text.match(new RegExp(`(?<![\\w$.])${name.replace(/\$/gu, "\\$")}(?![\\w$])`, "gu")) || []).length;
const unused = [];
for (const [name, d] of decl) {
  if (name.length < 3) continue;
  const n = count(code, name);
  if (n <= 1) unused.push({ name, ...d, uses: n, inChecks: count(checks, name) });
}
// ---- the sheet's classes and ids ---------------------------------------------
const cssNoComments = css.replace(/\/\*[\s\S]*?\*\//gu, "");
const selectors = cssNoComments.replace(/\{[^{}]*\}/gu, "{}");
const classes = new Set([...selectors.matchAll(/\.(-?[A-Za-z_][\w-]*)/gu)].map((m) => m[1]));
const ids = new Set([...selectors.matchAll(/#(-?[A-Za-z_][\w-]*)\b/gu)].map((m) => m[1]).filter((x) => !/^[0-9a-f]{3,8}$/iu.test(x)));
const everywhere = `${body}\n${code}\n${builders}`;
const has = (text, name) => new RegExp(`(?<![\\w-])${name.replace(/\$/gu, "\\$")}(?![\\w-])`, "u").test(text);
const deadClasses = [...classes].filter((c) => !has(everywhere, c)).sort();
const deadIds = [...ids].filter((c) => !has(everywhere, c)).sort();
// a class the script builds from parts (prefix + value) is not dead: say which prefixes the script composes
const composed = [...new Set([...code.matchAll(/["'`]([a-z][a-z0-9]*-)["'`]\s*\+|`([a-z][a-z0-9]*-)\$\{/gu)].map((m) => m[1] || m[2]))];
const maybeComposed = deadClasses.filter((c) => composed.some((p) => c.startsWith(p)));
// ---- custom properties -------------------------------------------------------------
const setProps = new Set([...cssNoComments.matchAll(/(--[A-Za-z][\w-]*)\s*:/gu)].map((m) => m[1]));
for (const m of code.matchAll(/setProperty\(\s*["'`](--[A-Za-z][\w-]*)/gu)) setProps.add(m[1]);
const readProps = new Set([...`${cssNoComments}\n${code}\n${body}`.matchAll(/var\(\s*(--[A-Za-z][\w-]*)/gu)].map((m) => m[1]));
for (const m of code.matchAll(/getPropertyValue\(\s*["'`](--[A-Za-z][\w-]*)/gu)) readProps.add(m[1]);
const setNeverRead = [...setProps].filter((p) => !readProps.has(p) && !has(`${code}\n${builders}\n${checks}`, p.slice(2))).sort();
const readNeverSet = [...readProps].filter((p) => !setProps.has(p) && !new RegExp(`${p}\\s*[:=]|["'\`]${p}["'\`]`, "u").test(`${code}\n${body}\n${builders}`)).sort();

console.log(`zone.html: sheet lines ${styleA + 2} to ${styleB}, script lines ${scriptA + 2} to ${scriptB} · ${decl.size.toLocaleString()} names declared in the script`);
console.log(`\nDECLARED AND NOT USED AGAIN IN THE SCRIPT (${unused.length}; "in checks" counts mentions in the checks' sources):`);
for (const u of unused.sort((a, b) => a.line - b.line)) console.log(`  ${u.line}: ${u.name} (${u.how})${u.inChecks ? ` · in checks ${u.inChecks}` : ""}`);
console.log(`\nSHEET: ${classes.size} classes, ${ids.size} ids in selectors. Classes nothing in the page, its script or the builders names: ${deadClasses.length}${maybeComposed.length ? ` (${maybeComposed.length} may be composed from a prefix: ${maybeComposed.join(", ")})` : ""}`);
console.log("  " + deadClasses.filter((c) => !maybeComposed.includes(c)).join(", "));
console.log(`ids nothing names: ${deadIds.length}: ${deadIds.join(", ")}`);
console.log(`\nCUSTOM PROPERTIES: ${setProps.size} set, ${readProps.size} read. Set and never read: ${setNeverRead.length}: ${setNeverRead.join(", ")}`);
console.log(`read and never set: ${readNeverSet.length}: ${readNeverSet.join(", ")}`);
if (jsonOut) writeFileSync(jsonOut, JSON.stringify({ unused, deadClasses, deadIds, setNeverRead, readNeverSet }, null, 1));
