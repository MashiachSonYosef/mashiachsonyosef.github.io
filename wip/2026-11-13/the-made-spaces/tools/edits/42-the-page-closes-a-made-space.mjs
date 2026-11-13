// The page prints a row's texts with the made spaces closed (made-spaces-rule-v1): its pills (readingsOfRow, and
// the whole route of a NoDerivatives record), the record under a pill and the key two records are told the same
// by, the note that says a reading is a piece of its record, and the file a reader takes away. The keys into the
// lattice and the stems are made of the served bytes and are not touched.
// node 42-the-page-closes-a-made-space.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "zone.html"), [
  // the three functions, where the first of them is needed
  [`  const pKeyOf = (row) => readingKey(row[2] || row[1] || "");
`,
   `  const pKeyOf = (row) => readingKey(recordPrinted(row));
`],
  [`  // P \u00b7 two D records are one record when their wording is the same by the
`,
   `  // MADE SPACES CLOSE AT PRINT (made-spaces-rule-v1, 13 November 2026). Our
  // own build put one space where each tag of a provider's XML stood, so the
  // store serves «Amos , an Israelite prophet» where the provider wrote
  // «Amos, an Israelite prophet». The corpus lane listed the places that
  // close, and a row of such a text carries them in row[9]: [the route
  // text's closes or null, the definition text's or null], UTF-16 units from
  // 0, rising. The texts stay the served bytes, which every key into the
  // lattice and the stems is made of; the characters at those places are
  // left out wherever a text is printed, compared as printed, or handed to
  // a reader in a file. tools/gloss-store-v1.mjs carries the same three
  // functions under the same names, and check-made-spaces-v1 runs these
  // against those on every row that carries a close.
  const closed = (text, places, from = 0, to = text.length) => {
    let out = "", at = from;
    for (const c of places || []) if (c >= at && c < to) { out += text.slice(at, c); at = c + 1; }
    return out + text.slice(at, to);
  };
  const routePrinted = (row) => closed(String(row[1] ?? ""), Array.isArray(row[9]) ? row[9][0] : null);
  const recordPrinted = (row) => (row[2] ? closed(String(row[2]), Array.isArray(row[9]) ? row[9][1] : null) : routePrinted(row));
  // P \u00b7 two D records are one record when their wording is the same by the
`],
  // the readings of a row: each piece takes the closes that fall inside it
  [`  const readingsOfRow = (row) => {
    const text = String(row[1] ?? "");
    const src = index.m_sources[row[3]];
    if (src && src.ledger) {
      // the print slot (ledger-division-rule-v2): the texts the row prints
      // where its ledger and the owner say it prints a part of itself, or
      // no pill ([]); the row prints those and nothing else
      if (Array.isArray(row[8])) return row[8].map((x) => String(x));
      const cuts = Array.isArray(row[7]) ? row[7] : [];
      if (!cuts.length) { const t = text.trim(); return t ? [t] : []; }
      const pieces = []; let from = 0;
      for (const i of cuts) { pieces.push(text.slice(from, i)); from = i + 1; }
      pieces.push(text.slice(from));
      return pieces.map((x) => x.trim()).filter(Boolean);
    }
    const t = text.trim();
    return t ? [t] : [];
  };
`,
   `  const readingsOfRow = (row) => {
    const text = String(row[1] ?? "");
    // the made spaces of the route text that close (made-spaces-rule-v1)
    const shut = Array.isArray(row[9]) ? row[9][0] : null;
    const src = index.m_sources[row[3]];
    if (src && src.ledger) {
      // the print slot (ledger-division-rule-v2): the texts the row prints
      // where its ledger and the owner say it prints a part of itself, or
      // no pill ([]); the row prints those and nothing else
      if (Array.isArray(row[8])) return row[8].map((x) => String(x));
      const cuts = Array.isArray(row[7]) ? row[7] : [];
      if (!cuts.length) { const t = closed(text, shut).trim(); return t ? [t] : []; }
      const pieces = []; let from = 0;
      for (const i of cuts) { pieces.push(closed(text, shut, from, i)); from = i + 1; }
      pieces.push(closed(text, shut, from));
      return pieces.map((x) => x.trim()).filter(Boolean);
    }
    const t = closed(text, shut).trim();
    return t ? [t] : [];
  };
`],
  // the file a reader takes away: a reading is a piece when it is not its row's route as printed, and the record is
  // handed over as the provider wrote it, which is the served text with our own spaces closed
  [`    const piece = lead[5] === 1 || spanJoin(String(lead[1] || "")).toLowerCase() !== spanJoin(ownText).toLowerCase();
    // the record exactly as the source handed it over, field by field: its
    // own headwords, its reading text, its definition text, byte for byte
    const received = { mId, headwords: Array.isArray(lead[6]) ? lead[6].map(String) : [], route: String(lead[1] || ""), definition: String(lead[2] || "") };
`,
   `    const piece = lead[5] === 1 || spanJoin(routePrinted(lead)).toLowerCase() !== spanJoin(ownText).toLowerCase();
    // the record exactly as the source handed it over, field by field: its
    // own headwords, its reading text, its definition text, byte for byte
    // (a space our own build put where a tag stood is not the source's, and
    // is closed here as it is on the card: made-spaces-rule-v1)
    const received = { mId, headwords: Array.isArray(lead[6]) ? lead[6].map(String) : [], route: routePrinted(lead), definition: lead[2] ? recordPrinted(lead) : "" };
`],
  // the pool: a NoDerivatives record's route prints whole, with our own spaces closed
  [`      const [rank, routeText, , mId, year] = row;
`,
   `      const [rank, , , mId, year] = row;
`],
  [`        const [rank, routeText, , mId] = row;
`,
   `        const [rank, , , mId] = row;
`],
  [`(nd ? [String(routeText)] : readingsOfRow(row)).forEach((reading) => {`,
   `(nd ? [routePrinted(row)] : readingsOfRow(row)).forEach((reading) => {`, 2],
  // the record card
  [`        const cutNote = (selected.records.some((r) => r[5] === 1) || (leadRow && spanJoin(String(leadRow[1] || "")).toLowerCase() !== spanJoin(selected.text).toLowerCase()))`,
   `        const cutNote = (selected.records.some((r) => r[5] === 1) || (leadRow && spanJoin(routePrinted(leadRow)).toLowerCase() !== spanJoin(selected.text).toLowerCase()))`],
  [`          const text = row[2] || row[1] || "";
          const key = pKeyOf(row);
`,
   `          const text = recordPrinted(row);
          const key = pKeyOf(row);
`],
  [`          if (src && src.ledger && String(text) === String(row[1])) {
            const s = document.createElement("span");
            const sel = readingKey(selected.text);
            const whole = String(row[1]);
`,
   `          if (src && src.ledger && String(text) === routePrinted(row)) {
            const s = document.createElement("span");
            const sel = readingKey(selected.text);
            const whole = routePrinted(row);
`],
  [`            alsoCarry.push({ row, group: selected, text: row[2] || row[1] || "" });
`,
   `            alsoCarry.push({ row, group: selected, text: recordPrinted(row) });
`],
  [`              const t = row[2] || row[1] || "";
              if (pKeyOf(row) !== firstKey) continue;
`,
   `              const t = recordPrinted(row);
              if (pKeyOf(row) !== firstKey) continue;
`],
]);
