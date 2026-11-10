// The tools of the page lane, and what reaches each one: the repository's own build, the round as it
// is run, the deploy workflow, another tool's import, another tool's command line, a document.
// node inventory-tools.mjs <repo root> <round script>... > report ; writes <out json> when --json <file> is given
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from "node:fs";
import { join, basename } from "node:path";
const args = process.argv.slice(2);
const jsonAt = args.indexOf("--json"); const jsonOut = jsonAt > -1 ? args.splice(jsonAt, 2)[1] : null;
const [root, ...roundScripts] = args;
const T = join(root, "reader", "tools");
const files = readdirSync(T).filter((f) => /\.(mjs|py|sh)$/u.test(f)).sort();
const src = Object.fromEntries(files.map((f) => [f, readFileSync(join(T, f), "utf8")]));
const read = (p) => { try { return readFileSync(p, "utf8"); } catch { return ""; } };
const buildSh = read(join(root, "reader", "build.sh"));
const workflow = readdirSync(join(root, ".github", "workflows")).map((f) => read(join(root, ".github", "workflows", f))).join("\n");
const round = roundScripts.map(read).join("\n");
const docs = readdirSync(join(root, "reader")).filter((f) => f.endsWith(".md")).map((f) => [f, read(join(root, "reader", f))]);
const zoneHtml = read(join(root, "reader", "zone.html"));
const mentions = (text, f) => text.includes(f) || text.includes(f.replace(/\.(mjs|py|sh)$/u, ""));
const exact = (text, f) => new RegExp(`(^|[^A-Za-z0-9_-])${f.replace(/[.*+?^$()[\]{}|\\]/gu, "\\$&")}`, "u").test(text);
const rows = [];
for (const f of files) {
  const s = src[f];
  const kind = /^check-/u.test(f) ? "check" : f.endsWith(".sh") ? "script" : (/process\.argv|process\.exit|writeFileSync|console\.log/u.test(s) ? "tool" : "module");
  const importedBy = files.filter((g) => g !== f && new RegExp(`from\\s+["']\\./${f.replace(/\./gu, "\\.")}["']|import\\(\\s*["'\`]\\./${f.replace(/\./gu, "\\.")}`, "u").test(src[g]));
  const spawnedBy = files.filter((g) => g !== f && !importedBy.includes(g) && exact(src[g].split("\n").filter((l) => !/^\s*(\/\/|\*|#)/u.test(l)).join("\n"), f));
  const namedInCommentsOf = files.filter((g) => g !== f && !importedBy.includes(g) && !spawnedBy.includes(g) && exact(src[g], f));
  const guards = [...s.matchAll(/^\/\/ GUARDS:\s*(.+)$/gmu)].flatMap((m) => m[1].split(/,\s*/u)).map((x) => x.trim()).filter(Boolean);
  const rules = [...new Set(s.match(/\b[a-z][a-z0-9]*(?:-[a-z0-9]+)*-rule-v[0-9][a-z0-9-]*/gu) || [])];
  rows.push({ f, kind, lines: s.split("\n").length, bytes: Buffer.byteLength(s), build: exact(buildSh, f), round: exact(round, f), workflow: exact(workflow, f), importedBy, spawnedBy, namedInCommentsOf: namedInCommentsOf.length, docs: docs.filter(([, d]) => exact(d, f)).map(([n]) => n), zone: exact(zoneHtml, f), guards, rules: rules.length,
    writesZone: /writeFileSync\([^)]*(?:zone|ZONE|out|OUT)/u.test(s) && /gzipSync/u.test(s), mtimeDay: statSync(join(T, f)).mtime.toISOString().slice(0, 10) });
}
const reached = (r) => r.build || r.round || r.workflow || r.importedBy.length || r.spawnedBy.length;
const by = (k) => rows.filter((r) => r.kind === k);
const sum = (rs, k) => rs.reduce((n, r) => n + r[k], 0);
console.log(`${rows.length} files in reader/tools · ${by("check").length} checks (${sum(by("check"), "lines").toLocaleString()} lines) · ${by("tool").length} tools (${sum(by("tool"), "lines").toLocaleString()} lines) · ${by("module").length} modules (${sum(by("module"), "lines").toLocaleString()}) · ${by("script").length} scripts`);
const tools = rows.filter((r) => r.kind !== "check");
console.log(`\nNOT CHECKS: ${tools.length}. Reached by the repository's build.sh: ${tools.filter((r) => r.build).length} · by the round as run: ${tools.filter((r) => r.round).length} · by the workflow: ${tools.filter((r) => r.workflow).length} · imported by another tool: ${tools.filter((r) => r.importedBy.length).length} · run or named in another tool's code: ${tools.filter((r) => r.spawnedBy.length).length}`);
const loose = tools.filter((r) => !reached(r));
console.log(`reached by none of those: ${loose.length} (${sum(loose, "lines").toLocaleString()} lines)`);
for (const r of loose) console.log(`  ${r.f} · ${r.lines} lines · named in ${r.namedInCommentsOf} tools' comments · docs: ${r.docs.join(", ") || "none"}${r.zone ? " · named in zone.html" : ""}`);
const onlyRound = tools.filter((r) => r.round && !r.build);
console.log(`\nrun by the round and absent from build.sh: ${onlyRound.length}: ${onlyRound.map((r) => r.f).join(", ")}`);
const onlyBuild = tools.filter((r) => r.build && !r.round);
console.log(`\nin build.sh and not run by the round: ${onlyBuild.length}: ${onlyBuild.map((r) => r.f).join(", ")}`);
const checks = by("check");
console.log(`\nCHECKS: ${checks.length}. In the round's chains: ${checks.filter((r) => r.round).length} · in build.sh: ${checks.filter((r) => r.build).length} · in the workflow: ${checks.filter((r) => r.workflow).length} · with a GUARDS line: ${checks.filter((r) => r.guards.length).length} · importing zones-on-disk: ${checks.filter((r) => /zones-on-disk-v1/u.test(src[r.f])).length} · opening a browser: ${checks.filter((r) => /playwright-v1/u.test(src[r.f])).length}`);
if (jsonOut) writeFileSync(jsonOut, JSON.stringify(rows, null, 1));
