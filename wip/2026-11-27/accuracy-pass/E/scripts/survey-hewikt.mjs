// Read-only: what Hebrew Wiktionary's own pages (as the dictionary store serves them, field D) say: part of speech,
// root, binyan, and which numbered definitions cite a verse of the Bible.
import { readFileSync, readdirSync } from "node:fs"; import { gunzipSync } from "node:zlib"; import { join } from "node:path";
const R = process.argv[2]; const dir = join(R, "data", "dictionary-store", "shards");
const kinds = JSON.parse(readFileSync(join(R, "data", "dictionary-kinds-v1.json"), "utf8"));
const idx = JSON.parse(readFileSync(join(R, "data", "dictionary-store", "index.json"), "utf8"));
const keys = new Set(kinds.families.find((f) => f.id === "hebrew-wiktionary").keys);
const want = new Set(Object.entries(idx.m_sources).filter(([, s]) => keys.has(s.key)).map(([m]) => m));
const seen = new Set(); let recs = 0, withPos = 0, withRoot = 0, withBinyan = 0, citesBible = 0, defs = 0, defsCiting = 0, withTranslation = 0, transNumbered = 0; const pos = {};
for (const f of readdirSync(dir)) {
  const body = JSON.parse(gunzipSync(readFileSync(join(dir, f))).toString("utf8"));
  for (const v of Object.values(body)) for (const r of v.records || []) {
    if (!want.has(r.m) || seen.has(r.D) || !r.D) continue; seen.add(r.D); recs += 1;
    const D = r.D;
    const p = /\|\s*חלק דיבר\s*=\s*([^\n|]*)/u.exec(D); if (p && p[1].trim()) { withPos += 1; const x = p[1].trim().slice(0, 30); pos[x] = (pos[x] || 0) + 1; }
    if (/\|\s*שורש\s*=\s*\S/u.test(D)) withRoot += 1;
    if (/בניין|דרך תצורה\s*=\s*\{\{בניין/u.test(D)) withBinyan += 1;
    if (/\{\{צט\/תנ/u.test(D)) citesBible += 1;
    // numbered definitions: lines that begin with "# " and the citation lines after them
    const lines = D.split("\n"); let cur = -1; const cite = [];
    for (const l of lines) { if (/^#[^:*#]/u.test(l)) { cur += 1; cite[cur] = false; } else if (cur >= 0 && /^#[:*]/u.test(l) && /צט\/תנ/u.test(l)) cite[cur] = true; else if (/^==/u.test(l)) cur = cur; }
    defs += cite.length; defsCiting += cite.filter(Boolean).length;
    if (/===\s*תרגום\s*===/u.test(D)) { withTranslation += 1; if (/\{\{ת\|אנגלית\|[^}]*\}\}\s*\(\d/u.test(D) || /\(\d+\)\s*\{\{ת\|אנגלית/u.test(D)) transNumbered += 1; }
  }
}
console.log(JSON.stringify({ m_ids: want.size, recs, withPos, withRoot, withBinyan, citesBible, defs, defsCiting, withTranslation, transNumbered }));
console.log(JSON.stringify(Object.entries(pos).sort((a, b) => b[1] - a[1]).slice(0, 15)));
