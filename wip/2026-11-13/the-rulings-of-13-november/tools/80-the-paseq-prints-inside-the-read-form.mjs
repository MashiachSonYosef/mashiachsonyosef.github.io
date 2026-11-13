// The paseq the edition writes inside a read form prints there (paseq-place-rule-v1; the corpus lane's relay v179).
// The zone carries the fact (tools/apply-paseq-place-v1.mjs): the place's kq.stroke names the read word the stroke
// follows and carries its glyph, taken from the mark's own position; the mark carries in_read_form. One rule says
// where the stroke stands (strokeIn): after that read word, inside the bracket where the word's own region closes it.
// The line draws an empty span there and the stylesheet draws the zone's glyph in it when the marks are shown, so the
// place's text stays its carrier for everything that reads the line; the export writes the stroke there in the
// place's Hebrew (carrierWithStroke) and nothing at the mark's own position, as the edition prints the verse. The mark
// keeps its block, its position and its count; the block never shows, and a press on the stroke opens the mark's own
// card.
// node 80-the-paseq-prints-inside-the-read-form.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "zone.html"), [
  // the stylesheet: the stroke shows with the marks, dressed as a mark is; the mark's own block never shows
  [`  body.marks-on .wb.mark-off .w { color: var(--muted); }
`,
   `  body.marks-on .wb.mark-off .w { color: var(--muted); }
  /* A PASEQ THE EDITION WRITES INSIDE A READ FORM (paseq-place-rule-v1; the
     corpus lane's relay v179, 16 places) shows there with the other marks,
     dressed as every mark is, and its own block after the place never shows:
     one mark, printed once, where the edition writes it. The glyph is the
     zone's (data-s), drawn by the style, so the place's text stays its
     carrier for everything that reads the line. */
  body.marks-on .wb .kq-stroke::before { content: attr(data-s); display: inline-block; margin-inline-start: 0.25em;
    padding: 0 0.08em; font-size: 0.8em; letter-spacing: 0.06em; line-height: 1.15; border: 1px solid var(--gold-dim);
    color: var(--muted); cursor: pointer; }
  :root[data-mark-ink="gold"] body.marks-on .he-text .kq-stroke::before { -webkit-text-fill-color: var(--mark-ink); }
  body.marks-on .wb.mark-off.in-read-form { display: none; }
`],
  // the one rule, and the place written with it, above the export that writes it
  [`  /** Gather one section. Returns everything the writer and the confirm need. */
`,
   `  // WHERE A PASEQ THE EDITION WRITES INSIDE A READ FORM STANDS
  // (paseq-place-rule-v1; the corpus lane's relay v179): after the read word
  // the zone names (kq.stroke), inside the bracket where that word's own
  // region closes it. regions are the place's atoms, as the line cuts them.
  // The line draws the stroke there with the marks (wordBlock), and the
  // export writes it there (gatherSection).
  const strokeIn = (word, regions) => {
    const st = word && word.kq && word.kq.stroke;
    if (!st || !st.s || !regions) return null;
    let n = 0;
    const i = regions.findIndex((r) => r.role === "QERE" && (n += 1) === st.after_read_word);
    return i < 0 ? null : { i, s: st.s, inside: String(regions[i].s).endsWith("]") };
  };
  // the place's carrier with that stroke written in, set off by the space a
  // mark stands apart by: the place as the edition prints it
  const carrierWithStroke = (word) => {
    const regions = (word.w || []).filter((r) => !String((r && (r.s || r.k)) || "").includes("\\u05be"));
    const at = strokeIn(word, regions);
    if (!at) return word.s;
    let rest = String(word.s), out = "";
    for (let i = 0; i < regions.length; i += 1) {
      const r = regions[i], k = rest.indexOf(r.s);
      if (k < 0) return word.s;
      out += rest.slice(0, k);
      rest = rest.slice(k + r.s.length);
      out += i !== at.i ? r.s : at.inside ? \`\${r.s.slice(0, -1)} \${at.s}]\` : \`\${r.s} \${at.s}\`;
    }
    return out + rest;
  };

  /** Gather one section. Returns everything the writer and the confirm need. */
`],
  // the export: the place's Hebrew with its stroke, and nothing at the mark's own position
  [`      if (!w.mark) wordN += 1;
      const shown = wb ? (() => {
`,
   `      if (!w.mark) wordN += 1;
      // a paseq the edition writes inside the read form of the place before
      // it is written there, in the place's Hebrew (paseq-place-rule-v1)
      if (w.mark && w.mark.in_read_form) continue;
      const shown = wb ? (() => {
`],
  [`      const rec = { he: w.s, joinNext: !!(w.presentation_join && w.presentation_join.join_next_without_separator), en: null, held: null, source: null, at: w.mark ? null : \`\${sec.label || ""}:\${wordN}\` };
`,
   `      const rec = { he: carrierWithStroke(w), joinNext: !!(w.presentation_join && w.presentation_join.join_next_without_separator), en: null, held: null, source: null, at: w.mark ? null : \`\${sec.label || ""}:\${wordN}\` };
`],
  // the mark's own block says it prints in the place before it
  [`      if (word.mark.toggleable) wb.classList.add("mark-off");
`,
   `      if (word.mark.toggleable) wb.classList.add("mark-off");
      // a paseq the edition writes inside the read form of the place before
      // it prints there (paseq-place-rule-v1), never here
      if (word.mark.in_read_form) wb.classList.add("in-read-form");
`],
  [`    const regionEls = [];
`,
   `    const regionEls = [];
    let strokeEl = null;
`],
  // the line: the stroke's span where strokeIn says
  [`      wb.classList.add("multi", "kq");
      const lmMarked = markedLettersOf(word), lmState = { li: 0 };
      let rest = word.s;
      regions.forEach((r, i) => {
        const at = rest.indexOf(r.s);
        if (at > 0) appendLettered(w, rest.slice(0, at), lmMarked, lmState);
        rest = rest.slice(at + r.s.length);
        const seg = document.createElement("span"); seg.className = "wr";
        appendLettered(seg, r.s, lmMarked, lmState);
`,
   `      wb.classList.add("multi", "kq");
      const lmMarked = markedLettersOf(word), lmState = { li: 0 };
      // a paseq the edition writes inside the read form (strokeIn): an empty
      // span where it stands, which the stylesheet draws the zone's glyph in
      // when the marks are shown, so the place reads as its carrier, whole
      const stroke = strokeIn(word, regions);
      if (stroke) {
        strokeEl = Object.assign(document.createElement("span"), { className: "kq-stroke" });
        strokeEl.dataset.s = stroke.s;
        strokeEl.dataset.mark = "PASEQ";
      }
      let rest = word.s;
      regions.forEach((r, i) => {
        const at = rest.indexOf(r.s);
        if (at > 0) appendLettered(w, rest.slice(0, at), lmMarked, lmState);
        rest = rest.slice(at + r.s.length);
        const seg = document.createElement("span"); seg.className = "wr";
        const strokeHere = !!stroke && i === stroke.i;
        if (strokeHere && stroke.inside) { appendLettered(seg, r.s.slice(0, -1), lmMarked, lmState); seg.append(strokeEl); appendLettered(seg, "]", lmMarked, lmState); }
        else appendLettered(seg, r.s, lmMarked, lmState);
`],
  [`          : "qere \\u2014 the form the source reads; opens the card, on the half the line reads from";
        w.append(seg); regionEls.push(seg);
      });
`,
   `          : "qere \\u2014 the form the source reads; opens the card, on the half the line reads from";
        w.append(seg); regionEls.push(seg);
        if (strokeHere && !stroke.inside) w.append(strokeEl);
      });
`],
  [`    return { wb, regionEls, markEls, joined, glossParts: parts,
`,
   `    return { wb, regionEls, markEls, joined, glossParts: parts, strokeEl,
`],
  // a mark that prints inside the place before it is pressed where it prints
  [`    const targets = built.regionEls.length ? built.regionEls : [built.wb];
`,
   `    const targets = built.regionEls.length ? built.regionEls : [built.pressAt || built.wb];
`],
  [`    let wIdx = 0;
    sec.words.forEach((word) => {
      const built = wordBlock(word, zone.gloss);
`,
   `    let wIdx = 0, builtBefore = null;
    sec.words.forEach((word) => {
      const built = wordBlock(word, zone.gloss);
      // a paseq the place before it holds in its read form is pressed where
      // it prints (paseq-place-rule-v1)
      if (word.mark && word.mark.in_read_form && builtBefore && builtBefore.strokeEl) built.pressAt = builtBefore.strokeEl;
      builtBefore = built;
`],
]);
