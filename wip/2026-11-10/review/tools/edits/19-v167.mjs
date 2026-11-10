// The corpus lane's v167: the three Leningrad counters state the read branch counted apart
// (words_read_split). The witness record reads it as it reads every other figure; the letters-only
// shortcut, and the note that one book has no read row, go.
// node 19-v167.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const T = join(process.argv[2], "tools");
edit(join(T, "emit-masorah-witnesses-v1.mjs"), [
[`// Run: node tools/emit-masorah-witnesses-v1.mjs --cards <book-cards-v2.json>
//        --reconcile <RECONCILE-v1.md> --counters <the folder holding wlc-nikkud/, wlc-taamim/ and wlc-letters/, each with its counts.json>
//        [--out data/masorah-witnesses-v1.json] --stamp YYYY-MM-DD`,
 `// Run: node tools/emit-masorah-witnesses-v1.mjs --cards <book-cards-v2.json>
//        --reconcile <RECONCILE-v1.md> --counters <the folder holding wlc-nikkud/, wlc-taamim/ and wlc-letters/, each with its counts.json>
//        [--correction <RECONCILE-v1-correction-1.md>] [--out data/masorah-witnesses-v1.json] --stamp YYYY-MM-DD`],
[`const STAMP = arg("stamp") || die("MISSING_ARG", "--stamp");
const sha = (b) => createHash("sha256").update(b).digest("hex");`,
 `const STAMP = arg("stamp") || die("MISSING_ARG", "--stamp");
const CORRECTION = arg("correction");
const sha = (b) => createHash("sha256").update(b).digest("hex");`],
[`// can carry, and the three agree on all four in every book: verses,
// words_split (the written branch, each maqaf piece a word), letters_written
// and letters_read. Those are read here, and a book the three count
// differently is refused.`,
 `// can carry, and the three agree on all four in every book: verses,
// words_split (the written branch, each maqaf piece a word), letters_written
// and letters_read. Those are read here, and a book the three count
// differently is refused. (Since the same day each states a seventh, the
// read branch counted apart; see THE READ BRANCH below.)`],
[`// THE READ BRANCH. No counter states a split count of the read branch. Where
// the letters-only rendering carries no maqaf, its count of the read branch
// is one; and whether it carries none is in the figures themselves, since its
// joined count of the written branch then equals the split count the three
// agree on. There the read row is written, from that counter's
// words_read_joined. Where it does not (one book today) the record holds no
// figure on that axis and no row is written. The stamp says what a witness
// counted; a figure worked out here would not be one.`,
 `// THE READ BRANCH (the corpus lane's relay v167, 10 November 2026). Until
// that day no counter stated a split count of the read branch. This wrote
// the read row from the letters-only counter's joined count wherever that
// rendering carried no maqaf, and where it carried them (one book) the record
// held no figure and the stamp showed no row. The corpus lane then added the
// count to all three counters (words_read_split: the read branch, each maqaf
// piece a word; the six figures each counter shipped unchanged), and the
// three, which build the read branch three different ways, agree on it in
// every book and every total. So the read row is read as every other figure
// is: what the three agree on, or a refusal. Nothing is worked out here, and
// a set of counters that does not state the figure is refused by name.`],
[`const READ_SRC = \`\${counter.letters.name} (corpus lane; the read branch, where the rendering carries no maqaf)\`;
`, ``],
[`// the read branch counted apart: the letters-only counter's read count, where
// its joined count of the written branch is the split count; else no figure
const readSplit = (kind, key) => {
  const L = counter.letters.d[kind][key];
  if (!L || !Number.isInteger(L.words_read_joined) || !Number.isInteger(L.words_written_joined)) die("LENINGRAD_FIGURE_MISSING", \`\${key} read branch\`);
  return L.words_written_joined === agreed(kind, key, "words_split") ? L.words_read_joined : null;
};
const heldRow = (measure, axis, figure, source) => ({ measure, axis, figure, witness: LENINGRAD, class: "HELD_EDITION", source });
const NO_READ_SPLIT = [];
const lenRows = (slug) => {
  const read = readSplit("books", slug);
  if (read === null) NO_READ_SPLIT.push(slug);
  return [
    heldRow("verses", "verses", agreed("books", slug, "verses"), AGREED_SRC),
    ...(read === null ? [] : [heldRow("words", "words", read, READ_SRC)]),
    heldRow("words", "words_written", agreed("books", slug, "words_split"), AGREED_SRC),
    heldRow("letters", "letters", agreed("books", slug, "letters_written"), AGREED_SRC),
  ];
};
// the sections: the rows this record has always carried for each, from the
// counters' own totals. A section's read row stands only where every book of
// it has one, which the same test says of the section's totals
const lenSections = {
  torah: [
    heldRow("verses", "verses", agreed("totals", "torah", "verses"), AGREED_SRC),
    ...(readSplit("totals", "torah") === null ? [] : [heldRow("words", "words", readSplit("totals", "torah"), READ_SRC)]),
    heldRow("words", "words_written", agreed("totals", "torah", "words_split"), AGREED_SRC),
    heldRow("letters", "letters", agreed("totals", "torah", "letters_written"), AGREED_SRC),
  ],
  neviim: [heldRow("verses", "verses", agreed("totals", "neviim", "verses"), AGREED_SRC)],
  ketuvim: [heldRow("verses", "verses", agreed("totals", "ketuvim", "verses"), AGREED_SRC)],
  tanakh: [
    heldRow("verses", "verses", agreed("totals", "tanakh", "verses"), AGREED_SRC),
    heldRow("words", "words_written", agreed("totals", "tanakh", "words_split"), AGREED_SRC),
    heldRow("letters", "letters", agreed("totals", "tanakh", "letters_written"), AGREED_SRC),
  ],
};`,
 `const heldRow = (measure, axis, figure) => ({ measure, axis, figure, witness: LENINGRAD, class: "HELD_EDITION", source: AGREED_SRC });
// verses, the read branch and the written branch counted apart, and the
// written letters: the four rows a book's stamp sets beside ours
const fourRows = (kind, key) => [
  heldRow("verses", "verses", agreed(kind, key, "verses")),
  heldRow("words", "words", agreed(kind, key, "words_read_split")),
  heldRow("words", "words_written", agreed(kind, key, "words_split")),
  heldRow("letters", "letters", agreed(kind, key, "letters_written")),
];
const lenRows = (slug) => fourRows("books", slug);
// the sections, from the counters' own totals. The Torah and the whole carry
// the four rows; the Prophets and the Writings carry the verses, as this
// record has always carried them. (The whole had no read row while one book
// of it had none.)
const lenSections = {
  torah: fourRows("totals", "torah"),
  neviim: [heldRow("verses", "verses", agreed("totals", "neviim", "verses"))],
  ketuvim: [heldRow("verses", "verses", agreed("totals", "ketuvim", "verses"))],
  tanakh: fourRows("totals", "tanakh"),
};`],
[`    ...RENDERINGS.map((r) => ({ record: counter[r].name, sha256: counter[r].sha, what: \`the corpus lane's count of Leningrad on the \${r === "letters" ? "letters-only" : r === "nikkud" ? "vowelled" : "accented"} rendering of tanach.us: six numbers per book, the figures the held edition's rows are read from\` })),`,
 `    ...RENDERINGS.map((r) => ({ record: counter[r].name, sha256: counter[r].sha, what: \`the corpus lane's count of Leningrad on the \${r === "letters" ? "letters-only" : r === "nikkud" ? "vowelled" : "accented"} rendering of tanach.us: seven numbers per book (the six it shipped, and the read branch counted apart, added on 10 November 2026), the figures the held edition's rows are read from\` })),`],
[`    { record: basename(RECON), sha256: sha(reconBytes), what: "the corpus lane's Leningrad reconciliation of the three counts: every figure its per-book tables state is held to the counters' own, and a disagreement refuses the record" },
  ],
  ...(NO_READ_SPLIT.length ? { held_edition_no_read_split: { books: NO_READ_SPLIT, why: "no counter states the read branch counted apart; the letters-only rendering's read count is one only where that rendering carries no maqaf, and here it carries them, so the record holds no figure on that axis and the stamp shows none" } } : {}),`,
 `    { record: basename(RECON), sha256: sha(reconBytes), what: "the corpus lane's Leningrad reconciliation of the three counts: every figure its per-book tables state is held to the counters' own, and a disagreement refuses the record" },
    ...(CORRECTION ? [{ record: basename(CORRECTION), sha256: sha(readFileSync(CORRECTION)), what: "the corpus lane's correction to that reconciliation: the sentence that the letters-only rendering's joined count is a split count in every book is true of 38 and not of one; the tables stand" }] : []),
  ],`],
]);
