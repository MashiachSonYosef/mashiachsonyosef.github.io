// The card withholds a row whose source files it under another stem, and says how many. It never said which stem
// the word has here, though the page holds it and withholds by it (an outside reader, 12 November 2026: "the stem
// is not named on the card"). Where the stem withholds, the card now names the stem or stems the place's own
// parsing gives the word: "6 of another stem than qal, withheld". The names are the lattice sidecar's own, as the
// gate reads them; two are said where the place's sources disagree. The gate itself is not changed.
// node 47-the-card-names-the-stem-it-held-the-rows-to.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "zone.html"), [
  // the stems the gate held the rows to ride on the pool beside its count
  [`    // disagree), baked in the lattice sidecar beside its grades.
    let withheldByStem = 0;
`,
   `    // disagree), baked in the lattice sidecar beside its grades. Where the
    // gate is asked, the stems it held the rows to ride on the pool, and
    // the card names them beside its count (13 November 2026: until then
    // the card said "of another stem" and never said than which).
    let withheldByStem = 0, stemsHere = null;
`],
  [`        const kept = routes.filter((row) => !other(row));
        withheldByStem = routes.length - kept.length;
        routes = kept;
`,
   `        const kept = routes.filter((row) => !other(row));
        withheldByStem = routes.length - kept.length;
        stemsHere = st;
        routes = kept;
`],
  [`pool.withheldByStem = withheldByStem; pool.rows = asked;`,
   `pool.withheldByStem = withheldByStem; pool.stems = stemsHere; pool.rows = asked;`],
  // the two sentences that speak of the stem name it
  [`          if (pool.withheldByStem) bits.push(\`\${pool.withheldByStem} record\${pool.withheldByStem === 1 ? "" : "s"} withheld by the stem — their source reads another stem of this verb\`);`,
   `          if (pool.withheldByStem) bits.push(\`\${pool.withheldByStem} record\${pool.withheldByStem === 1 ? "" : "s"} withheld by the stem — their source reads another stem of this verb than \${(pool.stems || []).join(" or ")}\`);`],
  [`        pills.dataset.stemWithheld = String(pool.withheldByStem || 0);
`,
   `        pills.dataset.stemWithheld = String(pool.withheldByStem || 0);
        pills.dataset.stems = (pool.stems || []).join("|");
`],
  [`textContent: \`\${pool.withheldByStem} of another stem, withheld\` }));`,
   `textContent: \`\${pool.withheldByStem} of another stem than \${(pool.stems || []).join(" or ")}, withheld\` }));`],
]);

edit(join(R, "tools", "check-pointing-gate-v1.mjs"), [
  [`//       its card withholds exactly those records for the stem, after the
//       pointing has withheld its own, and says so on its withheld line`,
   `//       its card withholds exactly those records for the stem, after the
//       pointing has withheld its own, and says so on its withheld line,
//       naming the stem or stems the sidecar gives the word there`],
  [`      stem: pills ? Number(pills.dataset.stemWithheld || 0) : -1,
`,
   `      stem: pills ? Number(pills.dataset.stemWithheld || 0) : -1,
      stems: pills ? String(pills.dataset.stems || "") : "",
`],
  [`  check("G2  a verb's card withholds exactly the records of another stem, after the pointing's own", !r.error && r.stem === verb.other && r.withheld >= verb.pointed && /of another stem, withheld/u.test(r.line),`,
   `  check("G2  a verb's card withholds exactly the records of another stem, after the pointing's own, and names the stem it held them to", !r.error && r.stem === verb.other && r.withheld >= verb.pointed
    && r.line.includes(\`\${verb.other} of another stem than \${verb.st.join(" or ")}, withheld\`) && r.stems === verb.st.join("|"),`],
]);
