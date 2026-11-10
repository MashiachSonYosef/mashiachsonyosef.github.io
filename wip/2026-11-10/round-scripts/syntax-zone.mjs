// Parse every inline script of a page: node syntax-zone.mjs <zone.html>
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs"; import { execFileSync } from "node:child_process"; import { tmpdir } from "node:os"; import { join } from "node:path";
const html = readFileSync(process.argv[2], "utf8");
const dir = mkdtempSync(join(tmpdir(), "syn-"));
let n = 0, bad = 0;
for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gu)) {
  if (/\bsrc=/u.test(m[1]) || /type="application\/(ld\+)?json"/u.test(m[1])) continue;
  n += 1;
  const f = join(dir, `s${n}.${/type="module"/u.test(m[1]) ? "mjs" : "js"}`); writeFileSync(f, m[2]);
  try { execFileSync(process.execPath, ["--check", f], { stdio: "pipe" }); } catch (e) { bad += 1; console.log(`script ${n}: ${String(e.stderr || e.message).split("\n").slice(0, 6).join("\n")}`); }
}
console.log(`${n} inline scripts parsed, ${bad} with a syntax error`);
process.exit(bad ? 1 : 0);
