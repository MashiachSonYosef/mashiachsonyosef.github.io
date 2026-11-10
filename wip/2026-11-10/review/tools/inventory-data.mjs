// The records under reader/data: how big each is, whether the page reads it when a reader visits,
// which tools name it, which checks name it. A record nothing names is a candidate to be read.
// node inventory-data.mjs <repo root>
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
const [root] = process.argv.slice(2);
const D = join(root, "reader", "data"), T = join(root, "reader", "tools");
const size = (p) => { const st = statSync(p); if (!st.isDirectory()) return [st.size, 1]; let b = 0, n = 0; for (const f of readdirSync(p)) { const [x, y] = size(join(p, f)); b += x; n += y; } return [b, n]; };
const zone = readFileSync(join(root, "reader", "zone.html"), "utf8");
const tools = readdirSync(T).filter((f) => /\.(mjs|py|sh)$/u.test(f)).map((f) => [f, readFileSync(join(T, f), "utf8")]);
const buildSh = readFileSync(join(root, "reader", "build.sh"), "utf8");
const rootPages = ["index.html", "toggles/index.html"].map((f) => { try { return readFileSync(join(root, f), "utf8"); } catch { return ""; } }).join("\n");
const rows = [];
for (const name of readdirSync(D).sort()) {
  const [bytes, n] = size(join(D, name));
  const stem = name.replace(/\.(json|js|gz|bin)$/u, "");
  const named = (text) => text.includes(name) || (stem !== name && new RegExp(`(?<![\\w-])${stem.replace(/[.*+?^$()[\]{}|\\]/gu, "\\$&")}(?![\\w-])`, "u").test(text));
  const byTools = tools.filter(([f, s]) => !/^check-/u.test(f) && named(s)).map(([f]) => f);
  const byChecks = tools.filter(([f, s]) => /^check-/u.test(f) && named(s)).map(([f]) => f);
  const writers = tools.filter(([f, s]) => !/^check-/u.test(f) && named(s) && /writeFileSync|createWriteStream/u.test(s)).map(([f]) => f);
  rows.push({ name, bytes, n, page: named(zone), door: named(rootPages), build: named(buildSh), byTools, byChecks, writers });
}
const mb = (b) => (b / 1048576).toFixed(b > 10485760 ? 0 : 2);
console.log(`${rows.length} entries under reader/data, ${mb(rows.reduce((s, r) => s + r.bytes, 0))} MB`);
console.log("\nby size (the ten largest):");
for (const r of [...rows].sort((a, b) => b.bytes - a.bytes).slice(0, 10)) console.log(`  ${r.name} · ${mb(r.bytes)} MB · ${r.n} file(s) · page ${r.page ? "reads" : "no"} · tools ${r.byTools.length} · checks ${r.byChecks.length}`);
const nobody = rows.filter((r) => !r.page && !r.door && !r.byTools.length && !r.byChecks.length);
console.log(`\nnamed by nothing (not the page, the door, a tool or a check): ${nobody.length}`);
for (const r of nobody) console.log(`  ${r.name} · ${mb(r.bytes)} MB`);
const onlyChecks = rows.filter((r) => !r.page && !r.door && !r.byTools.length && r.byChecks.length);
console.log(`\nnamed only by checks (no tool names it, so nothing in the tree is seen to write it): ${onlyChecks.length}`);
for (const r of onlyChecks) console.log(`  ${r.name} · ${mb(r.bytes)} MB · ${r.byChecks.slice(0, 3).join(", ")}`);
const noCheck = rows.filter((r) => (r.page || r.door) && !r.byChecks.length);
console.log(`\nread by the page or the door and named by no check: ${noCheck.length}`);
for (const r of noCheck) console.log(`  ${r.name} · ${mb(r.bytes)} MB · tools: ${r.byTools.slice(0, 3).join(", ")}`);
const notServed = rows.filter((r) => !r.page && !r.door && (r.byTools.length || r.byChecks.length));
console.log(`\nnot read by the page or the door (a build input, a receipt, or a record for the other lane): ${notServed.length}, ${mb(notServed.reduce((s, r) => s + r.bytes, 0))} MB`);
for (const r of notServed.sort((a, b) => b.bytes - a.bytes).slice(0, 44)) console.log(`  ${r.name} · ${mb(r.bytes)} MB · writers: ${r.writers.slice(0, 2).join(", ") || "none seen"} · tools ${r.byTools.length} · checks ${r.byChecks.length}`);
