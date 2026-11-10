// Write a variant of the page for bisecting: the current file with chosen hunks of the diff against the
// committed file taken back. node bisect-variant.mjs <reader dir> <out file> <list|keep-spec>
// keep-spec: comma list of hunk numbers to REVERT (take back to the committed text), or "none"/"all".
import { execFileSync } from "node:child_process";
import { writeFileSync, readFileSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
const [R, OUT, SPEC = "list"] = process.argv.slice(2);
const diff = execFileSync("git", ["diff", "HEAD", "--", "zone.html"], { cwd: R, encoding: "utf8", maxBuffer: 1 << 28 });
const lines = diff.split("\n"); while (lines.length && lines[lines.length - 1] === "") lines.pop();
const headEnd = lines.findIndex((l) => l.startsWith("@@"));
const header = lines.slice(0, headEnd);
const hunks = [];
for (const l of lines.slice(headEnd)) { if (l.startsWith("@@")) hunks.push([l]); else if (hunks.length) hunks[hunks.length - 1].push(l); }
if (SPEC === "list") {
  hunks.forEach((h, i) => console.log(`${String(i).padStart(3)} ${h[0].slice(0, 40).padEnd(40)} ${(h.find((l) => /^[-+]/.test(l)) || "").slice(0, 110)}`));
  process.exit(0);
}
const revert = SPEC === "all" ? hunks.map((_, i) => i) : SPEC === "none" ? [] : SPEC.split(",").map(Number);
const dir = mkdtempSync(join(tmpdir(), "bis-"));
writeFileSync(join(dir, "zone.html"), readFileSync(join(R, "zone.html")));
if (revert.length) {
  const patch = [...header.map((l) => l.replace("reader/zone.html", "zone.html")), ...revert.flatMap((i) => hunks[i])].join("\n") + "\n";
  writeFileSync(join(dir, "p.diff"), patch);
  execFileSync("git", ["init", "-q", "."], { cwd: dir });
  execFileSync("git", ["apply", "-R", "--unidiff-zero", "--recount", "p.diff"], { cwd: dir });
}
writeFileSync(OUT, readFileSync(join(dir, "zone.html")));
console.log(`${OUT}: ${revert.length} of ${hunks.length} hunks taken back`);
