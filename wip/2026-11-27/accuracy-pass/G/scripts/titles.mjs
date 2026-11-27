// Read-only: over the walked cards at rest, the pill titles by source label and by the year they say; and the pills
// whose title sets a year beside a source that states none of its own (STEP's TAHOT). Writes pill-titles.tsv.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const S = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad";
const R = join(S, "base/reader");
const OUT = dirname(fileURLToPath(import.meta.url));
const { labelsFor, titleOf } = await import(join(R, "tools/card-readings-v1.mjs"));
const labels = labelsFor(R);
const by = new Map(), dated = [];
let pills = 0, pressed = 0;
const pressedBy = new Map();
for (const f of readdirSync(join(OUT, "walk-rest")).sort()) {
  const lines = gunzipSync(readFileSync(join(OUT, "walk-rest", f))).toString("utf8").split("\n").filter(Boolean);
  for (const l of lines.slice(1)) {
    const c = JSON.parse(l);
    for (const p of c.pills || []) {
      pills += 1;
      const t = titleOf(p[1], labels.known);
      const key = `${t ? t.label : "?"}\t${t && t.year !== null ? t.year : "no source year"}`;
      by.set(key, (by.get(key) || 0) + 1);
      if (p[3]) { pressed += 1; pressedBy.set(key, (pressedBy.get(key) || 0) + 1); }
      if (t && /^STEP Bible Translators Amalgamated/u.test(t.label) && t.year !== null) dated.push([f.replace(".jsonl.gz", ""), c.label, c.n, p[0], p[1], p[2]].join("\t"));
    }
  }
}
const rows = [["label", "year_the_title_says", "pills", "of_them_pressed"]];
for (const [k, n] of [...by].sort((a, b) => b[1] - a[1])) rows.push([k, n, pressedBy.get(k) || 0]);
writeFileSync(join(OUT, "pill-titles.tsv"), rows.map((r) => r.join("\t")).join("\n") + "\n");
writeFileSync(join(OUT, "pills-step-with-a-year.tsv"), ["book\tplace\tword\tpill\ttitle\tby", ...dated].join("\n") + "\n");
console.log(`${pills} pills, ${pressed} pressed`);
for (const r of rows.slice(1, 40)) console.log(r.join(" | "));
console.log(`pills titled STEP's TAHOT with a year: ${dated.length}`);
console.log(dated.slice(0, 8).join("\n"));
