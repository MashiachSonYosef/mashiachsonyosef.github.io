// Names a tool imports and never uses, read from the linter's report, and (with --write) taken out of
// the import line they stand on. Only a one-line named import is touched; anything else is listed.
// node unused-imports.mjs <eslint json> [--write]
import { readFileSync, writeFileSync } from "node:fs";
const [REPORT] = process.argv.slice(2);
const WRITE = process.argv.includes("--write");
const report = JSON.parse(readFileSync(REPORT, "utf8"));
let files = 0, names = 0; const left = [];
for (const r of report) {
  const unused = r.messages.filter((m) => m.ruleId === "no-unused-vars");
  if (!unused.length) continue;
  const lines = readFileSync(r.filePath, "utf8").split("\n");
  let touched = 0;
  // by line, so two names of one import are taken out together
  const byLine = new Map();
  for (const m of unused) { const name = (/'([^']+)'/u.exec(m.message) || [])[1]; if (name) (byLine.get(m.line) || byLine.set(m.line, []).get(m.line)).push(name); }
  for (const [ln, drop] of byLine) {
    const line = lines[ln - 1];
    const m = /^import \{ ([^}]+) \} from ("[^"]+");\s*$/u.exec(line || "");
    if (!m) { if (/^import\b/u.test(line || "")) left.push(`${r.filePath.split("/").pop()}:${ln} ${drop.join(", ")} (not a one-line named import)`); continue; }
    const keep = m[1].split(",").map((s) => s.trim()).filter((s) => !drop.includes(s.split(/\s+as\s+/u).pop()));
    lines[ln - 1] = keep.length ? `import { ${keep.join(", ")} } from ${m[2]};` : null;
    touched += drop.length;
  }
  if (!touched) continue;
  files += 1; names += touched;
  console.log(`${r.filePath.split("/").pop()}: ${touched}`);
  if (WRITE) writeFileSync(r.filePath, lines.filter((l) => l !== null).join("\n"));
}
console.log(`${names} unused imported name(s) in ${files} file(s)${WRITE ? ", taken out" : " (dry run)"}`);
for (const l of left) console.log(`left: ${l}`);
