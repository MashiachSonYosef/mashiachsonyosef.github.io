// The hover of the source chip beside a line said, for every line, "the oldest witness carrying this reading".
// Under "at this place" (the resting order) the line is the place's own piece, credited to the source that reads
// the word so here, and the same words often stand in an older record: on the shipped build 15 of 80 words
// spread over Amos carried the sentence beside a card that credits an older source for the same reading
// (logs/t7-amos-at-rest-before.log). The card's own place line already words it truly; the line's chip says the
// same.
// node 26-place-line-says-what-its-source-is.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "zone.html"), [
  [`    return { line: \`PIECE:\${String(s).toUpperCase()}\`, mId: w.m, posture: w.licence, m: m ? m.label : w.label, y: null };`,
   `    return { line: \`PIECE:\${String(s).toUpperCase()}\`, mId: w.m, posture: w.licence, m: m ? m.label : w.label, y: null, reads: "place" };`],
  [`      chip.title = \`\${uniq[0].m}\${wordingTag(uniq[0])}\${yearTag(uniq[0].y, uniq[0].ya || "edition")} — the oldest witness carrying this reading; every other witness is on the word’s own card\`;`,
   `      // a place's own piece is credited to the source that reads the word
      // so here, and that is not a claim about age: the same words may stand
      // in an older record, which is the one the card credits. Until 10
      // November 2026 every chip said "the oldest witness carrying this
      // reading" (Amos 1:3: said of the place's source for «Yahweh», beside
      // a card crediting a lexicon of 1906; 15 of 80 words spread over that
      // book). The card's own place line already says it this way.
      const says = uniq[0].reads === "place" ? "the source that reads this word so at this place" : "the oldest witness carrying this reading";
      chip.title = \`\${uniq[0].m}\${wordingTag(uniq[0])}\${yearTag(uniq[0].y, uniq[0].ya || "edition")} — \${says}; every other witness is on the word’s own card\`;`],
]);
