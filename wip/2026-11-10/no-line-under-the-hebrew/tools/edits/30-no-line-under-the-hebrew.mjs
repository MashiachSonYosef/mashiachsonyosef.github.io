// NO LINE UNDER THE HEBREW. The owner, 10 November 2026: "i think we can get rid of underlining because when things
// are underlined theyre already put into 1 card, 1 hud. it doesnt benefit i think. and maqafs are already obvious
// but even for 2 words itll be on one visible card already".
// What goes: the one line a run wore (a maqaf compound, a run a license names, a span), over its letters in the
// Hebrew reader and under them in the English; the same line drawn parted under the card numbers, and the part of
// seatNumbers that wrote the partings; the line under the hand; and the line under the Hebrew word of the title,
// which the rule of 19 October had not reached. What stays: the room the line stood in (the bottom border of a
// word's letters and of a run's ink row, unseen), so no row, blob or number moves; the dashed mark of a word the
// page typed; a pair's bracket; the frames' own lines and their partings.
// The six long blocks are replaced whole; each is kept beside this script as it stood (30-from/), and the edit
// refuses unless it stands in the page exactly once.
// node 30-no-line-under-the-hebrew.mjs <reader dir>
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { edit } from "./lib.mjs";
const R = process.argv[2];
const was = (f) => readFileSync(join(dirname(fileURLToPath(import.meta.url)), "30-from", f), "utf8").replace(/\n$/u, "");

edit(join(R, "zone.html"), [
  // the hand
  [was("01-hover.txt"),
   `  /* UNDER THE HAND THE LETTERS KEEP THEIR INK (the owner, 2026-10-16, of a
     pressed word on a phone, where a tap leaves the word hovered: "you made
     the entire hebrew word gold now thats not right"). The hover turned the
     line beneath the word gold instead, until the line itself went
     (2026-11-10, NO LINE UNDER THE HEBREW, below). The hand is shown by the
     pointer and a press by the pressed cell. */`],
  // the cell's own comment
  [was("08-cell-comment.txt"),
   `     reader a two-line reading had stood as far from its word as from its
     neighbor. A maqaf run is one cell; a section mark is no word and has
     none. The cell is what says how many words one card covers (a gold line
     said it too until 2026-11-10), and a pair's bracket which half is
     selected. */`],
  // the line itself, in both readers
  [was("02-the-line.txt"),
   `  /* NO LINE UNDER THE HEBREW (the owner, 2026-11-10: "i think we can get rid
     of underlining because when things are underlined theyre already put
     into 1 card, 1 hud. it doesnt benefit i think. and maqafs are already
     obvious but even for 2 words itll be on one visible card already"). The
     words one card joins say so by their one cell of linen and by the card
     that opens over them. The line's history, since it is why the rows are
     spaced as they are: from 2026-10-03 every word wore it ("i think
     underlining is nondistracting and can be added to every word for now");
     from 2026-10-09 a run wore one ("gold underline will indicate how many
     words are in a single hud"; and, of the strip of fused cells that stood
     here for a day, "id really just make it the gold underline itself as a
     single unit across the hebrew"); from 2026-10-19 only the words one card
     joins wore it ("lets move to only underlining when it actually combines
     words / same as how we do no blob if its a single 1:1, we do no
     underline if its a 1:1 (word:hud)"), over the letters in the Hebrew
     reader ("put it as an overline, right") and under them in the English,
     parted where a card's number stood.
     ITS ROOM IS KEPT, unseen: a word's letters and a run's ink row keep the
     bottom border they had (a named run's and a pair's the wider), so no
     row, no blob and no number moved the day the line went. A word the page
     typed keeps its dashed mark, which says that and was never a card's
     line. */
  .wb > .w { border-bottom: 1px solid transparent; border-radius: 0; }
  /* a run a license names is one cell, as a maqaf run is; a spacer stands
     where the text writes a space between its words, and a run too wide for
     the page wraps inside its cell rather than past it */
  .wjoin.lic .wj-ink { border-bottom-width: 1.5px; }`],
  [`  .wjoin > .g.parts { flex-wrap: wrap; }
  .wjoin.lic.active .wj-ink { border-bottom-color: var(--gold); }
`,
   `  .wjoin > .g.parts { flex-wrap: wrap; }
`],
  [`  .wjoin .wj-ink { display: inline-flex; align-items: flex-start;
    border-bottom: 1px solid var(--gold-dim);`,
   `  .wjoin .wj-ink { display: inline-flex; align-items: flex-start;
    border-bottom: 1px solid transparent;   /* the room of the line a run wore (NO LINE UNDER THE HEBREW) */`],
  // pairs
  [was("05-pairs.txt"),
   `  /* the halves of a pair hover on their own; held, the pair keeps its ink
     like any word */
  .wb.multi:hover .w, .wb.multi.active .w { color: var(--shani-ink); }
  .wr { border-bottom: 1px dashed transparent; border-radius: 2px; }
  .wr:hover { border-bottom-color: var(--gold); }
  /* KETIV AND QERE (the owner, 2026-10-03): both halves open one card; the
     half the English is reading from wears a gold bracket above it, on the
     Hebrew. The bracket marks the provenance of the gloss, never a choice
     about the text: both halves keep printing exactly as the source wrote
     them. It is drawn by ::after: a half's ::before carries its letters when
     its marks are gold (EVERY MASORETIC MARK GOLD). The pair wore the
     one-card line under both halves until 2026-10-19; its room is kept. */
  .wb.kq > .w { border-bottom: 1.5px solid transparent; border-radius: 0; }`],
  // with the numbers on
  [was("06-numbers-on.txt"),
   `  /* (a run's own line stood on this edge and was drawn parted for the
     numbers until 2026-11-10; no line stands there now) */`],
  [`     with a question) keep theirs. The underline under a run's words is gold
     as a maqaf run's is. */`,
   `     with a question) keep theirs. */`],
  // the script: the partings of a run's line
  [was("09-seat-tail.txt") + "\n", ``],
  [`  //      other end, else the clearest place between, and THE FRAME'S LINE
  //      GIVES WAY around it, as a run's line does (the owner's fourth point
  //      of 2026-10-19: "the underline briefly gaps");`,
   `  //      other end, else the clearest place between, and THE FRAME'S LINE
  //      GIVES WAY around it (the owner's fourth point of 2026-10-19, said of
  //      the line a run then wore: "the underline briefly gaps");`],
  [`  // the gold underline itself as a single unit across the hebrew"): the words
  // a license names as one thing stand in one cell, one ink row with one line
  // under all of it, one row of parts under their words, one card. \`link\``,
   `  // the gold underline itself as a single unit across the hebrew"): the words
  // a license names as one thing stand in one cell, one ink row (which wore
  // one line under all of it until 2026-11-10), one row of parts under their
  // words, one card. \`link\``],
  [`      // a run with no key of its own (a pair inside it) is one breath and
      // several cards, and wears the one-card underline under each word
      // rather than one line under all of them (the owner, 2026-10-08)`,
   `      // a run with no key of its own (a pair inside it) is one breath and
      // several cards: a press on a word opens that word's own card (the
      // owner, 2026-10-08, of the one line such a run then wore)`],
  [`      // the span store's cells are laid whatever the runs switch says: they
      // are the underlines the owner asked for, each one license over its words`,
   `      // the span store's cells are laid whatever the runs switch says: they
      // are the cells the owner asked for as underlines, each one license
      // over its words`],
]);
