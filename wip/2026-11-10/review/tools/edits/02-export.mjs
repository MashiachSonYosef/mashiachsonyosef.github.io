// The exported file: a scribal mark is text and not a withheld reading; a pair says why its reading is
// not carried; a record's wording year is its row's own; the file does not speak of marks it does not print.
// node 02-export.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];
edit(join(R, "zone.html"), [
// the word loop: marks and pairs told apart from a word the ledger holds
[`      } else if (!w.k) rec.held = "held by the ledger; no reading is offered";`,
`      }
      // A SCRIBAL MARK IS TEXT, NOT A READING, AND A PAIR IS NOT A HOLD. Neither
      // carries a key of its own, and both fell to the branch below: every
      // exported verse counted its verse-end mark as a reading "not exported",
      // and every word written one way and read another was listed as "held
      // by the ledger" though the page reads it (found by review, 10 November
      // 2026). A mark stands in the Hebrew and is counted nowhere; a pair
      // says what is true of it, that this file does not carry its reading.
      else if (w.mark) rec.mark = true;
      else if (w.kq) rec.held = "written one way and read another: the page reads this word from one of its two forms, and this file does not carry that reading yet";
      else if (!w.k) rec.held = "held by the ledger; no reading is offered";`],
[`    for (const w of words) {
      if (w.unreachable) { unreachable += 1; continue; }
      if (w.held) { held += 1; continue; }
      const s = w.source;`,
`    for (const w of words) {
      if (w.mark) continue;
      if (w.unreachable) { unreachable += 1; continue; }
      if (w.held) { held += 1; continue; }
      const s = w.source;`],
[`      for (const w of b.words) {
        if (w.unreachable) notReached += 1; else if (w.held) held += 1;`,
`      for (const w of b.words) {
        if (w.mark) continue;
        if (w.unreachable) notReached += 1; else if (w.held) held += 1;`],
// the record's own year: the row's wording year, with the catalog's mark where it has one
[`      ? { ok: true, text: ownText, piece, received, label: m.label, posture: m.licensePosture,
          pointer: m.licensePointer, year: hasYear(m.sourceYear) ? m.sourceYear : "", obligations: post.obligations,`,
`      ? { ok: true, text: ownText, piece, received, label: m.label, posture: m.licensePosture,
          // two years, said apart (TWO YEARS, above): year is the edition's, for
          // the Sources list; wy is this row's own, the year its wording was
          // written, for the record. The file printed the edition's year under
          // the word "wording", so a Strong's row of 1890 read "wording year
          // not supplied" beside a chip on the page that said 1890.
          pointer: m.licensePointer, year: hasYear(m.sourceYear) ? m.sourceYear : "", wy: hasYear(lead[4]) ? lead[4] : "", obligations: post.obligations,`],
[`        L.push(\`    source: [\${cite(src)}] \${src.label}\${src.year ? \` \\u00b7 wording \${src.year}\` : " \\u00b7 wording year not supplied"}\`);`,
`        L.push(\`    source: [\${cite(src)}] \${src.label}\${hasYear(src.wy) ? \` \\u00b7 wording \${adYear(src.wy)}\${yearMarkOf(src.received.mId, src.wy) ? \` (\${yearMarkOf(src.received.mId, src.wy)})\` : ""}\` : " \\u00b7 wording year not supplied"}\`);`],
// the two sentences that spoke of marks in the text
[`not exported. Each is marked [withheld] where it stood, carrying no citation number because there is no source to cite. A reading is withheld when its record carries a license that does not permit redistribution, when it carries no license at all, or when the reading on the page could not be matched to a record.`,
`not exported. Each is named below with its reason and carries no citation number, because there is no source to cite. A reading is withheld when its record carries a license that does not permit redistribution, when it carries no license at all, when the reading on the page could not be matched to a record, or when the word is written one way and read another.`],
[`it could not be reached when this file was made. Each is marked [not reached] where it stood and carries no citation number.`,
`it could not be reached when this file was made. None of them carries a citation number.`],
]);
