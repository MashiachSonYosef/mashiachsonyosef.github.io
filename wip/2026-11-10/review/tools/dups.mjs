// Repeated code: long lines that stand more than once, and runs of consecutive lines that stand more
// than once, in one file or across a folder's files. Comment lines and short lines are skipped.
// node dups.mjs <min line length> <min run> <file or folder>... [--only <regex on file name>]
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, basename } from "node:path";
const args = process.argv.slice(2);
const onlyAt = args.indexOf("--only"); const only = onlyAt > -1 ? new RegExp(args.splice(onlyAt, 2)[1], "u") : null;
const [minLen, minRun, ...paths] = args;
const files = [];
for (const p of paths) { if (statSync(p).isDirectory()) for (const f of readdirSync(p).sort()) { if (/\.(mjs|js|html|sh|py)$/u.test(f) && (!only || only.test(f))) files.push(join(p, f)); } else files.push(p); }
const norm = (l) => l.trim().replace(/\s+/gu, " ");
const isCode = (l) => { const t = l.trim(); return t.length >= Number(minLen) && !/^(\/\/|\*|\/\*|#|<!--)/u.test(t); };
// ---- long single lines ---------------------------------------------------------
const at = new Map();
const lines = {};
for (const f of files) { lines[f] = readFileSync(f, "utf8").split("\n"); lines[f].forEach((l, i) => { if (!isCode(l)) return; const k = norm(l); if (!at.has(k)) at.set(k, []); at.get(k).push([f, i + 1]); }); }
const repeated = [...at.entries()].filter(([, v]) => v.length > 1).sort((a, b) => b[0].length * b[1].length - a[0].length * a[1].length);
let chars = 0; for (const [k, v] of repeated) chars += k.length * (v.length - 1);
console.log(`${files.length} file(s) · ${repeated.length.toLocaleString()} distinct lines of ${minLen}+ characters stand more than once · ${chars.toLocaleString()} characters are a repeat of a line above them`);
for (const [k, v] of repeated.slice(0, 40)) console.log(`  ×${v.length} (${k.length} chars) ${[...new Set(v.map(([f]) => basename(f)))].length > 1 ? `in ${[...new Set(v.map(([f]) => basename(f)))].length} files` : `lines ${v.map(([, i]) => i).slice(0, 8).join(", ")}`}: ${k.slice(0, 150)}`);
// ---- runs of consecutive repeated lines inside one file (for a single file given) ------------------
if (files.length === 1) {
  const f = files[0], L = lines[f].map((l) => (isCode(l) ? norm(l) : null));
  const seen = new Map(), runs = [];
  const R = Number(minRun);
  for (let i = 0; i + R <= L.length; i += 1) { if (L.slice(i, i + R).some((x) => x === null)) continue; const k = L.slice(i, i + R).join("\n"); if (!seen.has(k)) seen.set(k, []); seen.get(k).push(i + 1); }
  for (const [k, v] of seen) if (v.length > 1) runs.push([v, k]);
  console.log(`\nruns of ${R} consecutive code lines standing more than once: ${runs.length}`);
  for (const [v, k] of runs.slice(0, 25)) console.log(`  at lines ${v.join(", ")}: ${k.split("\n")[0].slice(0, 120)}`);
}
