// Two bakes and two checks follow the fourth ruling of 13 November.
// The search index's bake and the checks of the ledger divisions and of the made spaces each lifted the page's own
// reading functions out of zone.html for itself, naming one by one what readingsOfRow leans on. The page's function
// now asks whether a row only opens a numbered sense, so each of those lists was a name short. They read the
// functions through one module now (tools/page-reading-v1.mjs), and the search index gives a note no pill, as the
// page's pool gives it none.
// The witnessed columns refuse, by name, a shipped reading whose row prints no pill; until now the only reason a row
// could print none was its ledger's branch. The refusal now says which of the two it was.
// node 76-the-search-index-and-the-witnessed-columns-follow.mjs <reader dir>
import { join } from "node:path";
import { edit, span } from "./lib.mjs";
const R = process.argv[2];

const BAKE = join(R, "tools", "bake-search-index-v1.mjs");
edit(BAKE, [
  [`// made space closed, made-spaces-rule-v1), and the page's own functions are
// read out of zone.html and run (isNoDerivs, closed, routePrinted and
// readingsOfRow), so the two cannot drift apart (until 13 November 2026 the
// reading rule was typed here a second time).`,
   `// made space closed, made-spaces-rule-v1), and the page's own functions are
// read out of zone.html and run (tools/page-reading-v1.mjs), so the two
// cannot drift apart (until 13 November 2026 the reading rule was typed here
// a second time). A row that only opens a numbered sense is a note on the
// card and no pill (sense-openings-rule-v1), and is indexed as none.`],
  [`import { join } from "node:path";
`,
   `import { join } from "node:path";
import { pageReading, pageReadingSource, PageFault } from "./page-reading-v1.mjs";
`],
  [`zone_split_sha256: sha(Buffer.from(String(isNoDerivs) + PAGE_CLOSED + PAGE_ROUTE + PAGE_READINGS)).slice(0, 12)`,
   `zone_split_sha256: sha(Buffer.from(pageReadingSource(zone))).slice(0, 12)`],
]);
span(BAKE, [
  [`// the page's own split, read out of the page
`, `
const dix = JSON.parse(readFileSync(join(DATA, "dictionary-store/index.json"), "utf8"));`,
   `// the page's own split, read out of the page
const zone = readFileSync(ZONE, "utf8");
const pageAt = (ix) => { try { return pageReading(zone, ix); } catch (e) { if (e instanceof PageFault) fail(e.message); throw e; } };
// THE PILLS OF A ROW ARE THE PAGE'S OWN. A row that only opens a numbered
// sense is a note and gives no pill (sense-openings-rule-v1). A
// no-derivatives record prints its route whole. Any other row prints the
// readings the page's readingsOfRow gives: as its ledger says
// (ledger-division-rule-v2), whole where its source has none, a made space
// closed in either (made-spaces-rule-v1). The functions are the page's, run
// against the index the row's source stands in: the store's, or an
// overlay's own.
const pillsUnder = (ix) => {
  const page = pageAt(ix);
  return (row, src) => (page.senseOpened(row) ? [] : page.isNoDerivs(src.licensePosture) ? [page.routePrinted(row)] : page.readingsOfRow(row));
};
`],
]);

edit(join(R, "tools", "bake-witnessed-order-v1.mjs"), [
  [`import { openRouteStore, routePrinted } from "./gloss-store-v1.mjs";`,
   `import { openRouteStore, routePrinted, senseOpened } from "./gloss-store-v1.mjs";`],
  [`      if (store.ledgerOf(row[3])) { noPill.push({ key: k, text, m: String(row[3]), on: STAMP, why: "ledger-division-rule-v2: the row this reading came from prints no pill under the owner's answer to its ledger's branch" }); refused.push([k, "prints no pill"]); }`,
   `      if (senseOpened(row)) { noPill.push({ key: k, text, m: String(row[3]), on: STAMP, why: "sense-openings-rule-v1: the row this reading came from is only the words opening a numbered sense of its entry, which the owner ruled a note and not a pill" }); refused.push([k, "prints as a note"]); }
      else if (store.ledgerOf(row[3])) { noPill.push({ key: k, text, m: String(row[3]), on: STAMP, why: "ledger-division-rule-v2: the row this reading came from prints no pill under the owner's answer to its ledger's branch" }); refused.push([k, "prints no pill"]); }`],
  [`// the row prints no pill under the owner's answer to its ledger's branch
// (ledger-division-rule-v2: the card does not hold it, so no column may name
// it), or when no served row accounts for the text any more`,
   `// the row prints no pill under the owner's answer to its ledger's branch
// (ledger-division-rule-v2: the card does not hold it, so no column may name
// it), or when the row is only the words opening a numbered sense of its
// entry (sense-openings-rule-v1, 13 November 2026: the card prints it as a
// note, and a note is no line), or when no served row accounts for the text any more`],
]);

// the two checks that set the page's functions beside the store reader's
edit(join(R, "tools", "check-ledger-divisions-v1.mjs"), [
  [`import { printOf, PRINT_RULES } from "./ledger-print-v1.mjs";
`,
   `import { printOf, PRINT_RULES } from "./ledger-print-v1.mjs";
import { pageReading } from "./page-reading-v1.mjs";
`],
  [`  const zone = readFileSync(join(K3, "zone.html"), "utf8");
  const grab = (head, end) => { const a = zone.indexOf(head); if (a < 0 || zone.indexOf(head, a + 1) >= 0) throw new Error(\`zone.html does not hold exactly one "\${head.trim()}"\`); const b = zone.indexOf(end, a); return zone.slice(a, b + end.length); };
  let pageFn = null, why = "";
  try {
    pageFn = new Function("index", \`\${grab("\\n  const closed = (text, places, from = 0, to = text.length) => {\\n", "\\n  };\\n")}\${grab("\\n  const readingsOfRow = (row) => {\\n", "\\n  };\\n")} return readingsOfRow;\`)(index);
  } catch (e) { why = e.message; }
`,
   `  let pageFn = null, why = "";
  try { pageFn = pageReading(readFileSync(join(K3, "zone.html"), "utf8"), index).readingsOfRow; } catch (e) { why = e.message; }
`],
]);
edit(join(R, "tools", "check-made-spaces-v1.mjs"), [
  [`import { zonesServed } from "./zones-on-disk-v1.mjs";
`,
   `import { zonesServed } from "./zones-on-disk-v1.mjs";
import { pageReading } from "./page-reading-v1.mjs";
`],
  [`  const zone = readFileSync(join(K3, "zone.html"), "utf8");
  const grab = (head, end) => { const a = zone.indexOf(head); if (a < 0 || zone.indexOf(head, a + 1) >= 0) throw new Error(\`zone.html does not hold exactly one "\${head.trim()}"\`); const b = zone.indexOf(end, a); return zone.slice(a, b + end.length); };
  let page = null, why = "";
  try {
    page = new Function("index", \`\${grab("\\n  const closed = (text, places, from = 0, to = text.length) => {\\n", "\\n  };\\n")}\${grab("\\n  const routePrinted = (row) => ", ";\\n")}\${grab("\\n  const recordPrinted = (row) => ", ";\\n")}\${grab("\\n  const readingsOfRow = (row) => {\\n", "\\n  };\\n")} return { routePrinted, recordPrinted, readingsOfRow };\`)(index);
  } catch (e) { why = e.message; }
`,
   `  let page = null, why = "";
  try { page = pageReading(readFileSync(join(K3, "zone.html"), "utf8"), index); } catch (e) { why = e.message; }
`],
]);
