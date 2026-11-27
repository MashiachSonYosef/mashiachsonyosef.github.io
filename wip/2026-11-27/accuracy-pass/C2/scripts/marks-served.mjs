// Every mark of every served row of the four sources, named by the source's own ledger classifier (read only).
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
const [BASE, OUT] = process.argv.slice(2);
const SRC = { M9: "openscriptures_strongs", M14: "wikisource_strongs_explicit_forms", M5: "openscriptures_bdb_1906", M46: "unabridged_bdb_1906" };
const answers = JSON.parse(readFileSync(join(BASE, "data/ledger-branch-answers-v1.json"), "utf8")).answers;
for (const [m, key] of Object.entries(SRC)) {
  const decl = JSON.parse(readFileSync(join(BASE, "data/ledgers-v1", key, "declaration.json"), "utf8"));
  const { classify } = await import(pathToFileURL(resolve(join(BASE, "data/ledgers-v1", key, "classifier.mjs"))).href);
  const shapeBranch = new Map();
  for (const b of decl.branches || []) for (const s of b.shapes) shapeBranch.set(s, b.id);
  const shapeMeans = new Map(decl.shapes.map((s) => [s.id, s]));
  const per = new Map();   // mark -> stats
  const get = (ch) => per.get(ch) || per.set(ch, { mark: ch, served: 0, rows: 0, in_round: 0, in_square: 0, cut_at: 0, shapes: new Map(), uncovered: 0, in_notes: 0 }).get(ch);
  let rows = 0, threw = 0, distinct = new Set(), cutMismatch = 0;
  const shapeCount = new Map(), shapeCut = new Map(); const uncoveredEx = [];
  for (const line of readFileSync(join(OUT, `rows-${m}.jsonl`), "utf8").split("\n")) {
    if (!line) continue;
    const r = JSON.parse(line); rows += 1;
    const text = String(r.route ?? "");
    let marks = null;
    try { marks = classify(text); } catch (e) { threw += 1; if (uncoveredEx.length < 40) uncoveredEx.push({ k: r.k, route: text.slice(0, 160), why: String(e.message || e).slice(0, 200) }); }
    const cuts = new Set(Array.isArray(r.cuts) ? r.cuts : []);
    const seen = new Set();
    // containers by a simple stack
    const stack = [];
    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i];
      if (/[\p{L}\p{N}\s]/u.test(ch)) continue;
      const s = get(ch); s.served += 1; if (!seen.has(ch)) { seen.add(ch); s.rows += 1; }
      if (r.opened) s.in_notes += 1;
      const top = stack[stack.length - 1];
      if (top === "(" && ch !== "(" && ch !== ")") s.in_round += 1;
      if (top === "[" && ch !== "[" && ch !== "]") s.in_square += 1;
      if (ch === "(" || ch === "[") stack.push(ch);
      else if (ch === ")" && top === "(") stack.pop();
      else if (ch === "]" && top === "[") stack.pop();
      if (cuts.has(i)) s.cut_at += 1;
    }
    if (marks) for (const mk of marks) {
      const s = get(mk.mark); s.shapes.set(mk.shape, (s.shapes.get(mk.shape) || 0) + 1);
      shapeCount.set(mk.shape, (shapeCount.get(mk.shape) || 0) + 1);
      if (cuts.has(mk.i)) shapeCut.set(mk.shape, (shapeCut.get(mk.shape) || 0) + 1);
    } else for (const ch of seen) get(ch).uncovered += 1;
  }
  const outRows = [...per.values()].sort((a, b) => b.served - a.served).map((s) => ({ ...s, shapes: [...s.shapes].sort((a, b) => b[1] - a[1]) }));
  const shapes = [...shapeCount].sort((a, b) => b[1] - a[1]).map(([id, n]) => ({ id, n, cut: shapeCut.get(id) || 0, branch: shapeBranch.get(id) || null, answer: shapeBranch.get(id) ? ((answers[key] || {})[shapeBranch.get(id)] || {}).option || `rest:${(decl.branches.find((b) => b.id === shapeBranch.get(id)) || {}).resting}` : null, mark: (shapeMeans.get(id) || {}).mark, divides_declared: (shapeMeans.get(id) || {}).divides, unverified: String((shapeMeans.get(id) || {}).means || "").startsWith("unverified"), means: String((shapeMeans.get(id) || {}).means || "").slice(0, 400) }));
  writeFileSync(join(OUT, `marks-served-${key}.json`), JSON.stringify({ key, m, rows, classifier_threw_on_rows: threw, uncovered_examples: uncoveredEx, marks: outRows, shapes }, null, 1));
  console.log(key, m, "rows", rows, "classifier threw on", threw, "marks", outRows.length, "shapes hit", shapes.length, "of", decl.shapes.length);
}
