// Two checks held or named the line a run wore, which went on 10 November 2026 (edit 30, the owner's ruling):
//   check-hud-runs-v1 H2 asked every run for one line under or over its ink. It asks that none is drawn.
//   check-card-numbering-v1 N12 named "a run's line" among the gold a number must not touch. A run wears none.
// (check-underline-joins-v1, which held the rule of 19 October, is replaced by check-no-line-under-hebrew-v1.)
// node 32-checks-that-knew-a-runs-line.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];
const T = (f) => join(R, "tools", f);

edit(T("check-hud-runs-v1.mjs"), [
  [`// H2  a run is one cell, as a maqaf run is: its words stand in one cell that
//     carries the run, the cell's ink row wears one gold line along all of
//     it (under it, or over it in the Hebrew reader), and its parts row
//     holds one part per word under the words`,
   `// H2  a run is one cell, as a maqaf run is: its words stand in one cell that
//     carries the run, the cell's ink row draws no line (it wore one gold
//     line along all of it until the owner's ruling of 2026-11-10: "i think
//     we can get rid of underlining because when things are underlined
//     theyre already put into 1 card, 1 hud"; check-no-line-under-hebrew-v1
//     holds that for every run and word), and its parts row holds one part
//     per word under the words`],
  [`      // H2: one cell carrying the run, one line under its ink, one part per word`,
   `      // H2: one cell carrying the run, no line on its ink, one part per word`],
  [`      // one line under its ink, or, in the Hebrew reader, over it (the owner,
      // 2026-10-19: "put it as an overline, right"), drawn as a shadow
      const under = cs && parseFloat(cs.borderBottomWidth) > 0 && cs.borderBottomStyle !== "none" && !/rgba\\(.*,\\s*0\\)$/.test(cs.borderBottomColor) && cs.borderBottomColor !== "transparent";
      const over = cs && /px\\s+-[\\d.]+px\\s+0px/u.test(cs.boxShadow || "") && !/rgba\\([^)]*,\\s*0\\)/u.test(cs.boxShadow);
      if (!under && !over) { out.lineBad += 1; if (out.astray.length < 3) out.astray.push(\`line \${c.text}\`); }`,
   `      // no line under its ink and none over it (drawn as a shadow, as the
      // Hebrew reader's was)
      const under = cs && parseFloat(cs.borderBottomWidth) > 0 && cs.borderBottomStyle !== "none" && !/rgba\\(.*,\\s*0\\)$/.test(cs.borderBottomColor) && cs.borderBottomColor !== "transparent";
      const over = cs && /px\\s+-[\\d.]+px\\s+0px/u.test(cs.boxShadow || "") && !/rgba\\([^)]*,\\s*0\\)/u.test(cs.boxShadow);
      if (under || over) { out.lineBad += 1; if (out.astray.length < 3) out.astray.push(\`line \${c.text}\`); }`],
  [`  check("H2  a run is one cell: one line under all its ink, one part per word", r.cellBad === 0 && r.lineBad === 0 && r.partsBad === 0, \`\${r.cellBad} cells wrong, \${r.lineBad} lines missing, \${r.partsBad} parts rows wrong`,
   `  check("H2  a run is one cell: no line on its ink, one part per word", r.cellBad === 0 && r.lineBad === 0 && r.partsBad === 0, \`\${r.cellBad} cells wrong, \${r.lineBad} runs wearing a line, \${r.partsBad} parts rows wrong`],
]);

edit(T("check-card-numbering-v1.mjs"), [
  [`  check("N12 no number touches other gold (a frame's line, a run's line, a point) or a letter, by the page's own pixels; none lies on another number or in another card",`,
   `  check("N12 no number touches other gold (a frame's line, a point) or a letter, by the page's own pixels; none lies on another number or in another card",`],
]);
