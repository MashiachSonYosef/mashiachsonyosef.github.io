// check-pointing-gate-v1 counts what the stem withholds among the rows the pointing left. The page now asks two
// things of the place first (entry-gate-rule-v1, names-gate-rule-v1): a row of another entry than the place's is
// out before the pointing is asked, a row its source gives as a name is out where the place is not one, and a row
// of the place's own entry stays whatever its points. The check's count of the rows left is made the same way, by
// the gates' own modules, so its laws about the stem and the pointing hold what the card does.
// node 59-the-pointing-gates-check-counts-after-the-entry.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "check-pointing-gate-v1.mjs"), [
  [`// Under "only this pointing", the default, two things withhold a record, and
// each is counted on the card:
`,
   `// Under "only this pointing", the default, two things withhold a record, and
// each is counted on the card. (Since 13 November 2026 two more are asked
// before them, of the word's place: its entry, and whether it is a name.
// tools/check-entry-gate-v1.mjs and tools/check-names-gate-v1.mjs hold
// those; here the rows they leave are counted as the page counts them: a
// row of another entry is out, a row given as a name is out where the place
// is not one, and a row of the place's own entry stays whatever its points.)
`],
  [`//   G2  a verb whose key carries records of another stem: under the default
//       its card withholds exactly those records for the stem, after the
//       pointing has withheld its own, and says so on its withheld line,
//       naming the stem or stems the sidecar gives the word there
`,
   `//   G2  a verb whose key carries records of another stem: under the default
//       its card withholds exactly those records for the stem, after the
//       place's gates and the pointing have withheld their own, and says so
//       on its withheld line, naming the stem or stems the sidecar gives the
//       word there
`],
  [`import { openRouteStore } from "./gloss-store-v1.mjs";
`,
   `import { openRouteStore, factsOf } from "./gloss-store-v1.mjs";
import { placeEntry, bdbEntriesAt, entryVerdict } from "./entry-gate-v1.mjs";
import { nameWithheld } from "./names-gate-v1.mjs";
`],
  [`const rowsOf = (k) => (store.routesFor(k) || []).filter((r) => store.index.m_sources[r[3]]);
`,
   `const rowsOf = (k) => (store.routesFor(k) || []).filter((r) => store.index.m_sources[r[3]]);
// what the place's gates and the pointing leave of a word's rows, as the page gates them: a row of another entry
// than the place's is out; a row its source gives as a name is out where the place is not one; a row of the
// place's own entry stays whatever its points; any other row is out where some row of the store points the word as
// the text does and this one points it otherwise. A word with no tag is not asked its entry, and a book whose
// places were not read for names is not asked for names.
const gated = (w, rows, grades, isName) => {
  const attested = grades.includes("m");
  const place = w.tg ? placeEntry([].concat(w.tg)) : null;
  const facts = rows.map(factsOf);
  const bdbHere = place ? bdbEntriesAt(place, facts) : null;
  const verdicts = rows.map((r, j) => (place ? entryVerdict(facts[j], place, bdbHere) : "none"));
  const left = (j) => verdicts[j] !== "other" && !nameWithheld(facts[j], isName);
  return {
    kept: rows.filter((r, j) => left(j) && (verdicts[j] === "this" || !attested || grades[j] !== "x")),
    byPointing: rows.filter((r, j) => left(j) && verdicts[j] === "none" && attested && grades[j] === "x").length,
  };
};
`],
  [`  const zone = JSON.parse(gunzipSync(readFileSync(\`data/zones/\${z}.bin\`)).toString("utf8"));
`,
   `  const zone = JSON.parse(gunzipSync(readFileSync(\`data/zones/\${z}.bin\`)).toString("utf8"));
  // a place is a name where its word is marked; a book whose places were not read for names reads every place as one
  const namesRead = !!((((zone.emitted_from || {}).toggles || {}).lattice || {}).names);
  const isName = (w) => !namesRead || !!w.np;
`],
  [`      if (hasLedger && !verb && g && Array.isArray(g.st) && g.st.length && side.stems[w.k]) {
        const kept = attested ? rows.filter((r, j) => grades[j] !== "x") : rows;
        const rs = side.stems[w.k];
        const other = kept.filter((r) => isOtherStem(rs[\`\${r[3]}\\u0001\${r[0]}\\u0001\${r[1]}\`], g.st)).length;
        if (other > 0) verb = { zone: z, label: sec.label, s: w.s, k: w.k, st: g.st, other, pointed: attested ? grades.filter((x) => x === "x").length : 0 };
      }
`,
   `      // G2's word is one its place does not divide, so its card opens on its whole form (a divided word's card
      // opens on its division; G5 holds its whole form). Found on 13 November 2026, when the entry was first
      // asked before the pointing: the first verb with a record of another stem left was then a divided one
      if (hasLedger && !verb && g && Array.isArray(g.st) && g.st.length && side.stems[w.k] && !(Array.isArray(w.pg) && w.pg.length > 1)) {
        const { kept, byPointing } = gated(w, rows, grades, isName(w));
        const rs = side.stems[w.k];
        const other = kept.filter((r) => isOtherStem(rs[\`\${r[3]}\\u0001\${r[0]}\\u0001\${r[1]}\`], g.st)).length;
        if (other > 0) verb = { zone: z, label: sec.label, s: w.s, k: w.k, st: g.st, other, pointed: byPointing };
      }
`],
  [`        const kept = attested ? rows.filter((r, j) => grades[j] !== "x") : rows;
        const rs = side.stems[w.k];
        const other = kept.filter((r) => isOtherStem(rs[\`\${r[3]}\\u0001\${r[0]}\\u0001\${r[1]}\`], g.st)).length;
        if (other > 0) divided = { zone: z, label: sec.label, s: w.s, k: w.k, st: g.st, other };
`,
   `        const { kept } = gated(w, rows, grades, isName(w));
        const rs = side.stems[w.k];
        const other = kept.filter((r) => isOtherStem(rs[\`\${r[3]}\\u0001\${r[0]}\\u0001\${r[1]}\`], g.st)).length;
        if (other > 0) divided = { zone: z, label: sec.label, s: w.s, k: w.k, st: g.st, other };
`],
  [`      if (!unattested && !attested && grades.includes("x") && (w.pg || []).length === 0) unattested = { zone: z, label: sec.label, s: w.s, k: w.k, x: grades.filter((x) => x === "x").length, rows: rows.length };`,
   `      // G4's word keeps a row once its place is asked, so its card has readings to show
      if (!unattested && !attested && grades.includes("x") && (w.pg || []).length === 0 && gated(w, rows, grades, isName(w)).kept.length > 0) unattested = { zone: z, label: sec.label, s: w.s, k: w.k, x: grades.filter((x) => x === "x").length, rows: rows.length };`],
]);
