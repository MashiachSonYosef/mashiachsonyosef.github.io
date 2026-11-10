// How each check is run, read from its own source: what it takes from the command line, whether it
// opens a browser, which page it opens (a work's page, the door, the public site), what it reads off
// the disk, and which list of the suite runner (no URL / URL) it stands in. One row per check.
// node inventory-checks.mjs <repo root> [--json out] [chain scripts...]
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const args = process.argv.slice(2);
const jsonAt = args.indexOf("--json"); const jsonOut = jsonAt > -1 ? args.splice(jsonAt, 2)[1] : null;
const [root, ...chainFiles] = args;
const T = join(root, "reader", "tools");
const runner = readFileSync(join(T, "run-all-checks.sh"), "utf8");
const noUrlList = new Set((runner.match(/case "\$name" in\n\s+([^)]+)\) args=\(\)/u) || ["", ""])[1].split("|").map((x) => x.trim()).filter(Boolean));
const chains = chainFiles.map((f) => [f.split("/").pop(), readFileSync(f, "utf8")]);
const rows = [];
for (const f of readdirSync(T).filter((x) => /^check-.*\.mjs$/u.test(x)).sort()) {
  const s = readFileSync(join(T, f), "utf8");
  const name = f.replace(/\.mjs$/u, "");
  const code = s.split("\n").filter((l) => !/^\s*\/\//u.test(l)).join("\n");
  const browser = /playwright-v1/u.test(code);
  const argv = /process\.argv/u.test(code);
  const positional = /process\.argv\[2\]|process\.argv\.slice\(2\)\[0\]|const \[[^\]]*\] = process\.argv\.slice\(2\)|argv\.slice\(2\)\.find\(\(a\) => !a\.startsWith/u.test(code);
  const flags = [...new Set(code.match(/["'`]--[a-z][a-z0-9-]*["'`]/gu) || [])].map((x) => x.slice(1, -1));
  const defZone = /defaultZoneUrl/u.test(code);
  const zonesOnDisk = /zones-on-disk-v1/u.test(code);
  const ownServer = /createServer\(/u.test(code);
  const door = /deploy-root|toggles\/|\/index\.html|doorUrl|DOOR/u.test(code) && browser;
  const live = /mashiachsonyosef\.github\.io|https:\/\//u.test(code) && /fetch\(/u.test(code);
  const exit3 = /process\.exit\(3\)|exitCode = 3/u.test(code);
  const usage = /usage:/iu.test(code);
  const writes = /writeFileSync|createWriteStream/u.test(code);
  const lines = s.split("\n").length;
  const guards = [...s.matchAll(/^\/\/ GUARDS:\s*(.+)$/gmu)].flatMap((m) => m[1].split(/,\s*/u)).map((x) => x.trim()).filter(Boolean);
  const inChains = chains.filter(([, c]) => new RegExp(`(?<![\\w-])${name}(?![\\w-])`, "u").test(c)).map(([n]) => n);
  rows.push({ name, lines, browser, argv, positional, flags, defZone, zonesOnDisk, ownServer, door, live, exit3, usage, writes, guards: guards.length, runnerList: noUrlList.has(name) ? "no-url" : "url", inChains });
}
const n = (p) => rows.filter(p).length;
console.log(`${rows.length} checks · ${n((r) => r.browser)} open a browser · ${n((r) => r.ownServer)} start a server of their own · ${n((r) => r.defZone)} ask zones-on-disk for a default page · ${n((r) => r.exit3)} can say "skipped" (exit 3) · ${n((r) => r.writes)} write a file`);
console.log(`the runner's typed list of no-URL checks: ${noUrlList.size}; of them not a file in tools/: ${[...noUrlList].filter((x) => !rows.some((r) => r.name === x)).join(", ") || "none"}`);
const urlNoArgv = rows.filter((r) => r.runnerList === "url" && !r.argv && !r.defZone);
console.log(`\ngiven a URL by the runner and reading neither the command line nor the default page (${urlNoArgv.length}): ${urlNoArgv.map((r) => r.name).join(", ")}`);
const noUrlBrowser = rows.filter((r) => r.runnerList === "no-url" && r.browser);
console.log(`\nin the no-URL list and opening a browser (${noUrlBrowser.length}): ${noUrlBrowser.map((r) => r.name).join(", ")}`);
const urlNoBrowser = rows.filter((r) => r.runnerList === "url" && !r.browser);
console.log(`\ngiven a URL and opening no browser (${urlNoBrowser.length}): ${urlNoBrowser.map((r) => `${r.name}${r.flags.length ? ` [${r.flags.slice(0, 4).join(" ")}]` : ""}`).join(", ")}`);
const needFlags = rows.filter((r) => r.usage);
console.log(`\nprinting a usage line (need inputs of their own) (${needFlags.length}): ${needFlags.map((r) => `${r.name}${r.exit3 ? "" : " (no exit 3)"}`).join(", ")}`);
if (chains.length) {
  const none = rows.filter((r) => !r.inChains.length);
  console.log(`\nin none of the round's chains (${none.length} of ${rows.length}); of them opening a browser ${none.filter((r) => r.browser).length}`);
}
if (jsonOut) writeFileSync(jsonOut, JSON.stringify(rows, null, 1));
