// check-pointing-grade-v1's law P5b presses a word under "only this pointing" and holds that what the card says the
// pointing withheld is the check's own count from the shard, and that no pill graded "pointed otherwise" survives.
// Since 13 November 2026 the page asks two things of the place first (entry-gate-rule-v1, names-gate-rule-v1): a row
// of another entry and a row given as a name where the place is not one are out before the pointing is asked, and a
// row of the place's own entry stands whatever its points. The check's count is made the same way, by the gates'
// own modules, and the first half of the law says what now holds: a pill graded x survives only where the place
// keeps a row of its own entry that is pointed otherwise. The check also said "attested" nowhere; the page
// withholds nothing for the pointing where no row points the word as the text does, and the count now says so.
// node 66-the-pointing-grades-check-counts-after-the-places-gates.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "check-pointing-grade-v1.mjs"), [
  [`//   P5  in the browser: every pill carries its grade; under "only" no pill
//       graded x survives, and what the card says it withheld is what this
//       check counts from the shard with the same two steps
`,
   `//   P5  in the browser: every pill carries its grade; under "only" a pill
//       graded x survives only where the place keeps a row of its own entry
//       that its source points otherwise (entry-gate-rule-v1: such a row
//       stands whatever its points), and what the card says the pointing
//       withheld is what this check counts from the shard with the same
//       steps: the rows pointed otherwise among those the entry and the
//       names gates leave, a row of the place's own entry not counted, and
//       none where no row points the word as the text does
`],
  [`import { openRouteStore } from "./gloss-store-v1.mjs";
`,
   `import { openRouteStore, factsOf } from "./gloss-store-v1.mjs";
import { placeEntry, bdbEntriesAt, entryVerdict } from "./entry-gate-v1.mjs";
import { nameWithheld } from "./names-gate-v1.mjs";
`],
  [`// the same two steps as the page, in node: the row's own headwords, else the
// lattice card; an overlay's row by its own headwords alone, and one whose
// source is switched off is withheld by that switch, not by the pointing
const expectFor = (s, off) => {
  const gr = side.grades[s]; const lat = gr && side.routes[gr.k]; const rows = gr ? (store.routesFor(gr.k) || []) : [];
  const fp = lat ? new Map(lat.f.map((f, i) => [f, i])) : null;
  const grades = rows.filter((r) => store.index.m_sources[r[3]]).map((r) => { const sg = gradeRow(r, s); if (sg !== "-") return sg; if (!fp) return "-"; const src = store.index.m_sources[r[3]]; const i = fp.get(fnv1a(\`\${r[1]}|\${src.label}\`)); return i === undefined ? "-" : (gr.g[i] || "-"); });
  const ov = gr ? overlayRowsFor(gr.k) : [];
  const ovX = ov.filter((r) => !off.has(r[3]) && gradeRow(r, s) === "x").length;
  const pc = target ? pieceRowsAt(target.ref, target.n, s) : 0;
  return { rows: rows.length + ov.length + pc, piece: pc, x: grades.filter((g) => g === "x").length + ovX, fromHeadwords: rows.filter(rowCarriesHeadwords).length, overlay: ov.length, overlayX: ovX };
};
`,
   `// the same steps as the page, in node. The grade: the row's own headwords, else the lattice card; an overlay's row
// by its own headwords alone, and one whose source is switched off is withheld by that switch, not by the pointing.
// Before the grade is asked, the place's two gates (\`at\`: the word's tags and whether its place is a name): a row
// of another entry and a row given as a name where the place is not one are out and are not the pointing's to
// count; a row of the place's own entry stands whatever its points. And the pointing withholds nothing where no
// row of the store points the word as the text does.
const expectFor = (s, off, at) => {
  const gr = side.grades[s]; const lat = gr && side.routes[gr.k]; const rows = gr ? (store.routesFor(gr.k) || []) : [];
  const fp = lat ? new Map(lat.f.map((f, i) => [f, i])) : null;
  const admitted = rows.filter((r) => store.index.m_sources[r[3]]);
  const grades = admitted.map((r) => { const sg = gradeRow(r, s); if (sg !== "-") return sg; if (!fp) return "-"; const src = store.index.m_sources[r[3]]; const i = fp.get(fnv1a(\`\${r[1]}|\${src.label}\`)); return i === undefined ? "-" : (gr.g[i] || "-"); });
  const place = at && at.tags ? placeEntry(at.tags) : null;
  const facts = admitted.map(factsOf);
  const bdbHere = place ? bdbEntriesAt(place, facts) : null;
  const verdicts = admitted.map((r, i) => (place ? entryVerdict(facts[i], place, bdbHere) : "none"));
  const named = (i) => verdicts[i] !== "other" && nameWithheld(facts[i], !at || at.isName);
  const left = (i) => verdicts[i] !== "other" && !named(i);
  const attested = grades.includes("m");
  const x = attested ? grades.filter((g, i) => g === "x" && left(i) && verdicts[i] !== "this").length : 0;
  const ov = gr ? overlayRowsFor(gr.k) : [];
  const ovX = attested ? ov.filter((r) => !off.has(r[3]) && gradeRow(r, s) === "x").length : 0;
  const pc = target ? pieceRowsAt(target.ref, target.n, s) : 0;
  return { rows: rows.length + ov.length + pc, piece: pc, x: x + ovX, fromHeadwords: rows.filter(rowCarriesHeadwords).length, overlay: ov.length, overlayX: ovX,
    byEntry: verdicts.filter((v) => v === "other").length, byName: admitted.filter((r, i) => named(i)).length, ownAndOtherwise: grades.filter((g, i) => g === "x" && left(i) && verdicts[i] === "this").length };
};
`],
  [`    if (s.includes(String.fromCodePoint(0x05be)) || wbs[i].querySelectorAll(".wr").length > 1) continue;
    const gr = grades[s]; if (!gr || !gr.g.includes("x")) continue;
    const sec = wbs[i].closest("section.seg");
    const all = sec ? [...sec.querySelectorAll(".he-text .wb:not(.mark)")] : [];
    return { i, s, ref: sec && sec.__sec ? sec.__sec.label : null, n: all.indexOf(wbs[i]) + 1 };
`,
   `    // one region, and in no cell the page joins to its neighbors (that cell's card is not the word's own)
    if (s.includes(String.fromCodePoint(0x05be)) || wbs[i].querySelectorAll(".wr").length > 1 || wbs[i].closest(".wjoin")) continue;
    const gr = grades[s]; if (!gr || !gr.g.includes("x")) continue;
    const sec = wbs[i].closest("section.seg");
    const all = sec ? [...sec.querySelectorAll(".he-text .wb:not(.mark)")] : [];
    const w = wbs[i].__word || {};
    return { i, s, ref: sec && sec.__sec ? sec.__sec.label : null, n: all.indexOf(wbs[i]) + 1, tags: w.tg ? [].concat(w.tg) : null, np: !!w.np };
`],
  [`  const want = expectFor(target.s, new Set(await p.evaluate(() => window.__sourcesOff || [])));
  check("P5b under only, no pill graded x survives, and the card's withheld count is this check's own count from the shard",
    pressed && only && !only.grades.includes("x") && only.withheld === want.x && only.rows === want.rows,
    only ? \`withheld \${only.withheld} of \${only.rows} · counted \${want.x} of \${want.rows} (\${want.overlayX} of \${want.overlay} overlay rows, \${want.piece} piece rows) · \${want.fromHeadwords} store rows graded from their own headwords\${v2 ? "" : " (v1 store: the lattice graded every row)"}\` : "no card");
`,
   `  // the word's place: its tags, and whether it is a name (a book whose places were not read for names reads every place as one)
  const want = expectFor(target.s, new Set(await p.evaluate(() => window.__sourcesOff || [])), { tags: target.tags, isName: !side.names || target.np });
  check("P5b under only, a pill graded x survives only where the place keeps a row of its own entry pointed otherwise, and the card's withheld count is this check's own count from the shard, after the place's gates",
    pressed && only && (!only.grades.includes("x") || want.ownAndOtherwise > 0) && only.withheld === want.x && only.rows === want.rows,
    only ? \`withheld \${only.withheld} of \${only.rows} · counted \${want.x} of \${want.rows} (\${want.overlayX} of \${want.overlay} overlay rows, \${want.piece} piece rows) · before the pointing is asked \${want.byEntry} are out as another entry's and \${want.byName} as a name's\${target.tags ? \` (the place reads \${target.tags.join(" ")})\` : " (the place carries no tag)"}; \${want.ownAndOtherwise} of its own entry stand though pointed otherwise, \${only.grades.filter((g) => g === "x").length} pill(s) graded x · \${want.fromHeadwords} store rows graded from their own headwords\${v2 ? "" : " (v1 store: the lattice graded every row)"}\` : "no card");
`],
]);
