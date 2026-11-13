// Three checks say what the line under a word reads under "only this pointing" from the sidecar's leaders for the
// word's surface (o.l, its alternate o.la, and nl, whether the name still leads). The gates at the word's place
// move those where they withhold a row the surface's leader stood on (entry-gate-rule-v1, names-gate-rule-v1), and
// the sidecar keeps the place's own beside them (grades[surface].e, by the kind of place: its tags, and whether it
// is a name). Each check now reads the leaders at the word's own place, by tools/place-leaders-v1.mjs, as the page
// does.
// node 60-three-checks-read-the-leaders-at-the-words-place.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];
const WHY = `// the leaders under "only" at the word's own place: its own where its gates move them (its entry's tags
// and whether it is a name; a book whose places were not read for names reads every place as one)`;

edit(join(R, "tools", "check-masorah-toggle-v1.mjs"), [
  [`import { defaultZoneUrl, zonesServed } from "./zones-on-disk-v1.mjs";
`,
   `import { defaultZoneUrl, zonesServed } from "./zones-on-disk-v1.mjs";
import { onlyLeaders } from "./place-leaders-v1.mjs";
`],
  [`//   M4  ONLY moves the line under the word to the sidecar's own row-level
//       leader (o.l), and the card's first pill says the same — one answer,
//       two places
`,
   `//   M4  ONLY moves the line under the word to the sidecar's own row-level
//       leader (o.l, or its place's own where the entry or the names gate
//       moves it), and the card's first pill says the same — one answer,
//       two places
`],
  [`const gr = side.grades[target ? target.s : ""];
`,
   `const gr = side.grades[target ? target.s : ""];
${WHY}
const at = target ? await p.evaluate((i) => { const w = document.querySelectorAll("section.seg .he-text .wb")[i].__word; return { tags: w && w.tg ? [].concat(w.tg) : null, np: !!(w && w.np) }; }, target.i) : { tags: null, np: false };
const lead = onlyLeaders(gr, at.tags, !side.names || at.np);
`],
  [`check("M4  the line under the word is the sidecar's lenient leader, and the first pill says the same",
  only && gr && gr.o.l && only.line.toLowerCase().startsWith(String(gr.o.l[0]).toLowerCase().slice(0, 12)) && only.pills[0] && only.pills[0].toLowerCase() === String(gr.o.l[0]).toLowerCase(),
  only ? \`line "\${only.line}" · pill "\${only.pills[0]}" · o.l "\${gr && gr.o.l ? gr.o.l[0] : "—"}"\` : "no card");`,
   `check("M4  the line under the word is the sidecar's lenient leader at its place, and the first pill says the same",
  only && lead.l && only.line.toLowerCase().startsWith(String(lead.l[0]).toLowerCase().slice(0, 12)) && only.pills[0] && only.pills[0].toLowerCase() === String(lead.l[0]).toLowerCase(),
  only ? \`line "\${only.line}" · pill "\${only.pills[0]}" · the leader "\${lead.l ? lead.l[0] : "—"}"\${at.tags ? \` (at a place of \${at.tags.join(" ")})\` : ""}\` : "no card");`],
  [`  const l = gr && gr.o && gr.o.l;
  const ids = l && Array.isArray(l[4]) && l[4].length ? l[4] : null;
  const la = gr && gr.o ? gr.o.la : null;
`,
   `  const l = lead.l;
  const ids = l && Array.isArray(l[4]) && l[4].length ? l[4] : null;
  const la = lead.la;
`],
]);

edit(join(R, "tools", "check-names-pill-v1.mjs"), [
  [`import { defaultZoneUrl, zoneIdOf, zonesOnDisk } from "./zones-on-disk-v1.mjs";
`,
   `import { defaultZoneUrl, zoneIdOf, zonesOnDisk } from "./zones-on-disk-v1.mjs";
import { onlyLeaders } from "./place-leaders-v1.mjs";
`],
  [`      out.push({ id: \`\${si}|\${wi}\`, k, s: words[wi].s, line: c.textContent.trim(),`,
   `      out.push({ id: \`\${si}|\${wi}\`, k, s: words[wi].s, tg: words[wi].tg || null, np: !!words[wi].np, line: c.textContent.trim(),`],
  [`    if (gr.o.l && !allOff(gr.o.l[4])) return { text: gr.o.l[0], by: "pointing" };
    if (gr.o.la && !allOff(gr.o.la[4])) return { text: gr.o.la[0], by: "pointing" };
    return { text: null, by: "bare" };
`,
   `    ${WHY.split("\n").join("\n    ")}
    const lead = onlyLeaders(gr, x.tg, !DISK.lattice.names || x.np);
    if (lead.l && !allOff(lead.l[4])) return { text: lead.l[0], by: "pointing" };
    if (lead.la && !allOff(lead.la[4])) return { text: lead.la[0], by: "pointing" };
    return { text: null, by: "bare" };
`],
]);

edit(join(R, "tools", "check-source-switch-v1.mjs"), [
  [`import { defaultZoneUrl, zonesServed } from "./zones-on-disk-v1.mjs";
`,
   `import { defaultZoneUrl, zonesServed } from "./zones-on-disk-v1.mjs";
import { onlyLeaders } from "./place-leaders-v1.mjs";
`],
  [`const modelOf = (surface, k) => {
  const gm = zone.gloss_m[k]; if (!gm || !gm.by) return null;
  const gr = side && side.grades ? side.grades[surface] : null;
  if (gr && gr.o && Object.prototype.hasOwnProperty.call(gr.o, "l")) {
    if (gr.nl && zone.gloss_names && Object.prototype.hasOwnProperty.call(zone.gloss_names, k) && zone.gloss[k] === zone.gloss_names[k]) return null;
    const l = gr.o.l; if (!l || !Array.isArray(l[4]) || !l[4].length) return null;
    const la = gr.o.la;
`,
   `const modelOf = (surface, k, tags = null, np = false) => {
  const gm = zone.gloss_m[k]; if (!gm || !gm.by) return null;
  const gr = side && side.grades ? side.grades[surface] : null;
  if (gr && gr.o && Object.prototype.hasOwnProperty.call(gr.o, "l")) {
    ${WHY.split("\n").join("\n    ")}
    const lead = onlyLeaders(gr, tags, !side.names || np);
    if (lead.nl && zone.gloss_names && Object.prototype.hasOwnProperty.call(zone.gloss_names, k) && zone.gloss[k] === zone.gloss_names[k]) return null;
    const l = lead.l; if (!l || !Array.isArray(l[4]) || !l[4].length) return null;
    const la = lead.la;
`],
  [`  return { i, s: w ? w.textContent.trim() : "", bare: !g || g.classList.contains("bare"),`,
   `  return { i, s: w ? w.textContent.trim() : "", tg: wb.__word && wb.__word.tg ? [].concat(wb.__word.tg) : null, np: !!(wb.__word && wb.__word.np), bare: !g || g.classList.contains("bare"),`],
  [`    const model = modelOf(v.s, k); if (!model) continue;`,
   `    const model = modelOf(v.s, k, v.tg, v.np); if (!model) continue;`],
]);
