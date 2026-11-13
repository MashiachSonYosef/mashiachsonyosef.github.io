// check-pointing-gate-v1 holds that a verb's card withholds for the stem exactly the records of another stem (G2),
// and that a divided word's whole form says the same count (G5). It counted the store's records only, and said so:
// "the stem is asked of the store's records only". Since the stems extension the page asks the rows beside the
// store their stem too, so the check counts them as the page does (tools/rows-beside-the-store-v1.mjs): after the
// sources that rest off for a fresh reader are out and after those rows' own pointing is asked. The count it holds
// the card to is the store's and theirs together, and its words still need a record of another stem in the store.
// node 72-the-pointing-gates-check-counts-the-rows-beside-the-store.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "check-pointing-gate-v1.mjs"), [
  [`//   - the stem: a record whose stems are known (the corpus lane's binyan
//     ledger, version 2 of both files, v105.1) and none of them is in the
//     family of the word's stems.
`,
   `//   - the stem: a record whose stems are known (the corpus lane's binyan
//     ledger, version 2 of both files, v105.1, and its extension to three
//     more dictionaries, v173) and none of them is in the family of the
//     word's stems. It is asked of the store's records and, since the
//     extension, of the records of the dictionaries beside the store.
`],
  [`//   G2  a verb whose key carries records of another stem: under the default
//       its card withholds exactly those records for the stem, after the
//       place's gates and the pointing have withheld their own, and says so
//       on its withheld line, naming the stem or stems the sidecar gives the
//       word there
`,
   `//   G2  a verb whose key carries records of another stem: under the default
//       its card withholds exactly those records for the stem, the store's
//       and those beside the store, after the place's gates and the pointing
//       have withheld their own, and says so on its withheld line, naming
//       the stem or stems the sidecar gives the word there
`],
  [`import { nameWithheld } from "./names-gate-v1.mjs";
`,
   `import { nameWithheld } from "./names-gate-v1.mjs";
import { openBesideTheStore, rowsBeside, besideAtAWord, restingOff } from "./rows-beside-the-store-v1.mjs";
`],
  [`// ---- the words, from the data -----------------------------------------------
`,
   `// the records beside the store of another stem at a word, as the page counts them for a reader who has set nothing:
// the sources that rest off are out first, then those records' own pointing is asked, then their stem
const beside = openBesideTheStore(".");
const restsOff = restingOff(".", [store.index, ...beside.map((x) => x.index)]);
const besideOfAnotherStem = (w, attested, rs, st) => besideAtAWord(rowsBeside(beside, w.k), { surface: w.s, attested, rowStems: rs, wordStems: st, sourcesOff: restsOff }).ofAnotherStem.length;

// ---- the words, from the data -----------------------------------------------
`],
  [`        const other = kept.filter((r) => isOtherStem(rs[\`\${r[3]}\\u0001\${r[0]}\\u0001\${r[1]}\`], g.st)).length;
        if (other > 0) verb = { zone: z, label: sec.label, s: w.s, k: w.k, st: g.st, other, pointed: byPointing };
`,
   `        const ofTheStore = kept.filter((r) => isOtherStem(rs[\`\${r[3]}\\u0001\${r[0]}\\u0001\${r[1]}\`], g.st)).length;
        if (ofTheStore > 0) { const besideIt = besideOfAnotherStem(w, attested, rs, g.st); verb = { zone: z, label: sec.label, s: w.s, k: w.k, st: g.st, other: ofTheStore + besideIt, ofTheStore, besideIt, pointed: byPointing }; }
`],
  [`        const other = kept.filter((r) => isOtherStem(rs[\`\${r[3]}\\u0001\${r[0]}\\u0001\${r[1]}\`], g.st)).length;
        if (other > 0) divided = { zone: z, label: sec.label, s: w.s, k: w.k, st: g.st, other };
`,
   `        const ofTheStore = kept.filter((r) => isOtherStem(rs[\`\${r[3]}\\u0001\${r[0]}\\u0001\${r[1]}\`], g.st)).length;
        if (ofTheStore > 0) { const besideIt = besideOfAnotherStem(w, attested, rs, g.st); divided = { zone: z, label: sec.label, s: w.s, k: w.k, st: g.st, other: ofTheStore + besideIt, ofTheStore, besideIt }; }
`],
  [`  // the pointing's own count also grades the overlays' records, which this
  // check does not load (check-masorah-toggle-v1 holds that count); the stem
  // is asked of the store's records only, and so is this count
`,
   `  // the pointing's own count also grades the records beside the store
  // (check-masorah-toggle-v1 holds that count); the stem's count is the
  // store's records and theirs together, counted above as the page counts
`],
  [`    r.error || \`\${verb.zone} \${verb.label} \${verb.k} (\${verb.st.join(", ")}) · stem \${r.stem} of the store's \${verb.other} · pointing \${r.withheld} (the store's own \${verb.pointed}) · "\${r.line}"\`);`,
   `    r.error || \`\${verb.zone} \${verb.label} \${verb.k} (\${verb.st.join(", ")}) · stem \${r.stem} of \${verb.other} (\${verb.ofTheStore} of the store, \${verb.besideIt} beside it) · pointing \${r.withheld} (the store's own \${verb.pointed}) · "\${r.line}"\`);`],
  [`      d.error || \`\${divided.zone} \${divided.label} \${divided.k} (\${divided.st.join(", ")}) · the store's \${divided.other} · \${d.pills} readings · stem \${d.stem} · "\${d.line || d.none}"\`);`,
   `      d.error || \`\${divided.zone} \${divided.label} \${divided.k} (\${divided.st.join(", ")}) · \${divided.other} of another stem (\${divided.ofTheStore} of the store, \${divided.besideIt} beside it) · \${d.pills} readings · stem \${d.stem} · "\${d.line || d.none}"\`);`],
]);
