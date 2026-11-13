// The page learns the fourth ruling of 13 November. A row that is only the words opening a numbered sense of its
// entry gives no reading (the page's readingsOfRow, as the store reader's), so no pill stands on it; where the
// card's switches keep the row it rides on the pool as a note, and the card prints the notes in one small line with
// the record of the reading held (right under the record's own text, in the body that scrolls and is never hidden),
// the source named once and each note with its point, in the dictionary's blue. A card with no reading prints them in the readings'
// band.
// node 75-the-card-prints-the-openings-of-a-sense-as-notes.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "zone.html"), [
  // the function, name for name with the store reader's
  [`  const recordPrinted = (row) => (row[2] ? closed(String(row[2]), Array.isArray(row[9]) ? row[9][1] : null) : routePrinted(row));
`,
   `  const recordPrinted = (row) => (row[2] ? closed(String(row[2]), Array.isArray(row[9]) ? row[9][1] : null) : routePrinted(row));
  // THE WORDS THAT OPEN A NUMBERED SENSE ARE A NOTE, NOT A READING
  // (sense-openings-rule-v1, 13 November 2026). The catalog made a route of
  // the words that open each numbered sense of an entry of the unabridged
  // BDB, and BDB opens a sense with what the word is said of as often as
  // with a rendering («object heaven and earth» under "he created"). The
  // corpus lane listed the served rows that are only such an opening and
  // the owner ruled how they print (ruling 4 of relay v176): as a note
  // beside the sense's readings, not as a pill. A listed row names the
  // sense in its facts (opens: the entry and the point, as the source
  // names them). It gives no reading (readingsOfRow, below), and where the
  // card keeps it the card prints it among its notes. This is the function
  // of tools/gloss-store-v1.mjs under the same name, and
  // check-sense-openings-v1 runs the two side by side.
  const senseOpened = (row) => {
    const o = (factsOf(row) || {}).opens;
    if (typeof o !== "string" || !o) return null;
    const at = o.indexOf(" ");
    return { entry: at < 0 ? o : o.slice(0, at), point: at < 0 ? "" : o.slice(at + 1), text: routePrinted(row) };
  };
`],
  [`  const readingsOfRow = (row) => {
    const text = String(row[1] ?? "");
`,
   `  const readingsOfRow = (row) => {
    // the words that open a numbered sense are a note, not a reading (sense-openings-rule-v1)
    if (senseOpened(row)) return [];
    const text = String(row[1] ?? "");
`],
  // the pool: the rows the switches keep that open a sense leave the rows and ride on the pool as notes
  [`    // THE OVERLAYS' ROWS ARE ROWS LIKE THE STORE'S (the owner, 2026-10-03: "i
`,
   `    // THE WORDS THAT OPEN A NUMBERED SENSE ARE NOTES (sense-openings-rule-v1,
    // 13 November 2026). Such a row gives no reading, so no pill stands on
    // it. Where the switches above keep it, it leaves the rows here and
    // rides on the pool as a note, in the store's own order, and the card
    // prints the notes under its pills. A row the switches withhold is
    // counted with what withheld it and is no note: the opening of another
    // entry's sense is not said of this word. The dictionaries beside the
    // store carry no such mark.
    const notes = [];
    routes = routes.filter((row) => { const o = senseOpened(row); if (o && index.m_sources[row[3]]) notes.push({ ...o, m: row[3] }); return !o; });
    // THE OVERLAYS' ROWS ARE ROWS LIKE THE STORE'S (the owner, 2026-10-03: "i
`],
  [`    pool.withheldByEntry = withheldByEntry; pool.entry = entryHere; pool.withheldByName = withheldByName;
`,
   `    pool.withheldByEntry = withheldByEntry; pool.entry = entryHere; pool.withheldByName = withheldByName;
    pool.notes = notes;
`],
  [`    to.withheldByEntry = from.withheldByEntry; to.entry = from.entry; to.withheldByName = from.withheldByName;
`,
   `    to.withheldByEntry = from.withheldByEntry; to.entry = from.entry; to.withheldByName = from.withheldByName;
    to.notes = from.notes;
`],
  // the card: one line of notes, standing with the record
  [`      if (!pool || !pool.length) {
        const p = document.createElement("p");
`,
   `      // THE CARD'S NOTES (sense-openings-rule-v1, 13 November 2026): the words
      // a dictionary opens a numbered sense of its entry with, which the
      // owner ruled a note and not a reading. One small line: the source
      // named once, each note with its point as the source numbers it, in
      // the dictionary's blue; where the notes are of more entries than one,
      // each note names its entry before its point. The line stands with
      // the record of the reading held, right under the record's own text
      // and before its corroboration, in the body that scrolls and that no
      // fit of the bands above it hides (a band's own small print is the
      // first thing a tight card gives up, and the card of "he created" is
      // tight on a phone). On a card with no reading to hold it stands in
      // the readings' band, under what the band says.
      // What the line holds is said on it and exposed, so a check can ask
      // the page.
      const notesLine = () => {
        const notes = (pool && pool.notes) || [];
        window.__poolNotes = notes.map((x) => ({ m: x.m, entry: x.entry, point: x.point, text: x.text }));
        if (!notes.length) return null;
        const line = document.createElement("p"); line.className = "sense-notes";
        const bySource = new Map();
        for (const x of notes) (bySource.get(x.m) || bySource.set(x.m, []).get(x.m)).push(x);
        const severalEntries = new Set(notes.map((x) => x.entry)).size > 1;
        for (const [m, own] of bySource) {
          const s = index.m_sources[m];
          const name = (s && ((SHORT_REC && SHORT_REC.names && SHORT_REC.names[s.key]) || s.label)) || m;
          if (line.childNodes.length) line.append("; ");
          line.append(\`\${name} opens \${own.length === 1 ? "a numbered sense" : "its numbered senses"} with: \`);
          own.forEach((x, i) => {
            if (i) line.append(" \\u00b7 ");
            const note = document.createElement("span"); note.className = "sense-note";
            note.dataset.m = m; note.dataset.entry = x.entry; note.dataset.point = x.point;
            note.textContent = \`\${severalEntries ? \`\${x.entry} \` : ""}\${x.point} \${x.text}\`;
            line.append(note);
          });
        }
        line.dataset.notes = String(notes.length);
        return line;
      };
      if (!pool || !pool.length) {
        const p = document.createElement("p");
`],
  [`          readRow.append(p);
          dSlot.replaceChildren(); selectedRecordRef.m = null;
          paintNow(cover.map((c, i) => textOfCell(c.surface, i)).join(" + "), "every record for this block is withheld by your switches");
`,
   `          readRow.append(p);
          { const nl = notesLine(); if (nl) readRow.append(nl); }
          dSlot.replaceChildren(); selectedRecordRef.m = null;
          paintNow(cover.map((c, i) => textOfCell(c.surface, i)).join(" + "), "every record for this block is withheld by your switches");
`],
  [`        readRow.append(p);
        // THE RECORD SLOT IS THIS BLOCK'S. A block with no reading stands on
`,
   `        readRow.append(p);
        { const nl = notesLine(); if (nl) readRow.append(nl); }
        // THE RECORD SLOT IS THIS BLOCK'S. A block with no reading stands on
`],
  [`        body.append(dText(firstText, isNoDerivs((index.m_sources[firstGroup[0][3]] || {}).licensePosture), firstGroup[0]));
`,
   `        body.append(dText(firstText, isNoDerivs((index.m_sources[firstGroup[0][3]] || {}).licensePosture), firstGroup[0]));
        // the card's notes, under the record held and before its corroboration (sense-openings-rule-v1)
        { const nl = notesLine(); if (nl) body.append(nl); }
`],
  // small print, with the dictionary's own words in the dictionary's blue
  [`  #hud .d-also-read { display: block; color: var(--faint); font-size: 0.68rem; }
`,
   `  #hud .d-also-read { display: block; color: var(--faint); font-size: 0.68rem; }
  /* the card's notes: the words a dictionary opens a numbered sense of its entry with (sense-openings-rule-v1) */
  #hud .sense-notes { margin: 0.3rem 0 0; padding-top: 0.3rem; border-top: 1px dotted var(--line); font-size: 0.68rem; line-height: 1.4; color: var(--faint); }
  #hud .sense-notes .sense-note { color: var(--tekhelet-ink); }
`],
]);
