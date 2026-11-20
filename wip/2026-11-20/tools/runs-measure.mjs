// Ship 10, read-only: the runs of the 39 books (words joined by a maqaf, as check-run-card-forms-v1 finds them), and
// how many of them a row that rests open (the twelve) files as one entry, joined or as written.
// node runs-measure.mjs <reader dir>
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const R = process.argv[2];
const { formsOfRun } = await import(join(R, "tools", "weld-forms-v1.mjs"));
const { openRouteStore } = await import(join(R, "tools", "gloss-store-v1.mjs"));
const whole = openRouteStore(join(R, "data", "route-store"));
const rest = openRouteStore(join(R, "data", "route-store"), { atRest: true, signLast: true });
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const receipt = JSON.parse(readFileSync(join(R, "data", "serve-gate-receipt-v1.json"), "utf8"));
const books = readdirSync(join(R, "data", "span-store")).filter((f) => f.endsWith(".json") && f !== "index.json").map((f) => f.replace(/\.json$/u, ""));
const t = { books: 0, words: 0, runs: 0, wordsInRuns: 0, publishedWhole: 0, publishedAtRest: 0, wordsInRunsAtRest: 0 };
const forms = {}, ex = new Map(), distinct = new Set(), distinctRest = new Set();
for (const b of books) {
  const z = gz(join(R, "data", "zones", `${b}.bin`)); t.books += 1;
  for (const sec of z.sections || []) {
    let run = [];
    for (const w of sec.words || []) {
      if (!w.mark) t.words += 1;
      const pj = w.presentation_join;
      run.push(w);
      if (pj && pj.join_next_without_separator && String(pj.why || "").startsWith("maqaf-rule-v2")) continue;
      if (run.length > 1 && run.every((x) => x.k && !x.kq)) {
        const keys = run.map((x) => x.k), key = keys.join("־");
        const fs = formsOfRun(keys).filter((f) => f.form !== "pieces");
        t.runs += 1; t.wordsInRuns += run.length; distinct.add(key);
        if (fs.some((f) => (whole.routesFor(f.key) || []).length)) t.publishedWhole += 1;
        const open = fs.filter((f) => (rest.routesFor(f.key) || []).length);
        if (open.length) {
          t.publishedAtRest += 1; t.wordsInRunsAtRest += run.length; distinctRest.add(key);
          for (const f of open) forms[f.form] = (forms[f.form] || 0) + 1;
          if (!ex.has(key)) ex.set(key, { n: 0, reads: (rest.routesFor(open[0].key) || []).slice(0, 2).map((r) => `${r[3]} «${String(r[1]).slice(0, 30)}»`) });
          ex.get(key).n += 1;
        }
      }
      run = [];
    }
  }
}
console.log(JSON.stringify({ ...t, distinctRuns: distinct.size, distinctRunsAtRest: distinctRest.size, forms }, null, 1));
console.log([...ex.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 25).map(([k, v]) => `${v.n}\t${k}\t${v.reads.join(" · ")}`).join("\n"));
