// Synthesis lane · the page's own reading of a row, read out of zone.html and run
// LEDGER: -
// no frame letter. It reads the text of zone.html it is handed and writes
// nothing.
//
// THE PAGE'S OWN READING OF A ROW, READ OUT OF THE PAGE AND RUN.
//
// What a row prints is said twice: by the store's reader, for everything
// that is baked (tools/gloss-store-v1.mjs), and by the page, for the card.
// So that the two cannot drift apart, a bake that must print as the card
// does and the checks that set the page beside the reader take the page's
// functions out of zone.html's own text and run them. Until 13 November
// 2026 each of them lifted the functions for itself (the search index's
// bake, the check of the ledger divisions, the check of the made spaces),
// naming one by one whatever readingsOfRow leans on. When the page's
// function gained a question (does the row only open a numbered sense?),
// every one of those lists was a name short. This is the one list.
//
//   pageReadingSource(html)    the text of the functions as the page holds
//                              them, in the order below (a bake fingerprints
//                              what it was made by)
//   pageReading(html, index)   the functions, run against `index`: the
//                              store's, or that of a dictionary beside the
//                              store (readingsOfRow asks it whether the
//                              row's source is under a ledger)
//       closed, routePrinted, recordPrinted   a text as it prints
//       factsOf, senseOpened                  what a row's facts say of it
//       isNoDerivs                            a license that forbids a cut
//       readingsOfRow                         the readings a row gives
//
// A function the page does not hold exactly once is said in words
// (PageFault); the caller decides what that means.
export class PageFault extends Error {}

// each function by the words it opens and closes with on the page; a body of several lines closes at its own brace
const PARTS = [
  ["closed", "\n  const closed = (text, places, from = 0, to = text.length) => {\n", "\n  };\n"],
  ["routePrinted", "\n  const routePrinted = (row) => ", ";\n"],
  ["recordPrinted", "\n  const recordPrinted = (row) => ", ";\n"],
  ["factsOf", "\n  const factsOf = (row) => ", ";\n"],
  ["senseOpened", "\n  const senseOpened = (row) => {\n", "\n  };\n"],
  ["isNoDerivs", "\n  const isNoDerivs = (key) => ", ";\n"],
  ["readingsOfRow", "\n  const readingsOfRow = (row) => {\n", "\n  };\n"],
];

export const pageReadingSource = (html) => PARTS.map(([name, head, end]) => {
  const a = html.indexOf(head);
  if (a < 0 || html.indexOf(head, a + 1) >= 0) throw new PageFault(`zone.html does not hold exactly one ${name} ("${head.trim()}")`);
  const b = html.indexOf(end, a);
  if (b < 0) throw new PageFault(`zone.html's ${name} has no end`);
  return html.slice(a, b + end.length);
}).join("");

export const pageReading = (html, index) =>
  new Function("index", `${pageReadingSource(html)}\n return { ${PARTS.map(([name]) => name).join(", ")} };`)(index);
