// The tools that stand around the closes slot (made-spaces-rule-v1):
//   - the ledger tool keeps a row's slot 9 when it writes or clears its own two slots;
//   - the ledger check reads the page's reading rule with the function it now calls, and looks for a whole row on
//     the page as the row prints;
//   - the search bake stops carrying a copy of the reading rule: it runs the page's own, read out of the page, as
//     it already ran the page's no-derivatives test;
//   - the search check, which recomputes the pieces on its own, closes a made space in them;
// The front door's card is edit 44.
// node 43-the-tools-around-the-closes-slot.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "apply-ledger-divisions-v1.mjs"), [
  [`    row[7] = now; row[8] = prints;
    if (!prints) { row.length = 8; if (!now) row.length = 7; }
`,
   `    row[7] = now; row[8] = prints;
    // a row ends where its last slot stands; the slot past these two is the made
    // spaces' (apply-made-spaces-v1), another tool's, and a row that carries it keeps it
    if (row.length === 9 && !prints) { row.length = 8; if (!now) row.length = 7; }
`],
]);

edit(join(R, "tools", "check-ledger-divisions-v1.mjs"), [
  [`import { openRouteStore } from "./gloss-store-v1.mjs";`,
   `import { openRouteStore, routePrinted } from "./gloss-store-v1.mjs";`],
  // D4: the page's reading rule calls the page's own \`closed\`, so both are read out and run
  [`    pageFn = new Function("index", \`\${grab("\\n  const readingsOfRow = (row) => {\\n", "\\n  };\\n")} return readingsOfRow;\`)(index);`,
   `    pageFn = new Function("index", \`\${grab("\\n  const closed = (text, places, from = 0, to = text.length) => {\\n", "\\n  };\\n")}\${grab("\\n  const readingsOfRow = (row) => {\\n", "\\n  };\\n")} return readingsOfRow;\`)(index);`],
  // D5: the row is looked for on the page as it prints (a made space closed: made-spaces-rule-v1)
  [`            if (!index.m_sources[r[3]].ledger || Array.isArray(r[7]) || Array.isArray(r[8]) || !/,/u.test(String(r[1])) || outside(String(r[1]), ";").length !== 1) return false;
            // a list of short glosses, so every comma piece is a piece and none is the whole text
            const whole = String(r[1]).trim().toLowerCase();
            const pieces = outside(String(r[1]), ",").map((x) => x.toLowerCase());`,
   `            const route = routePrinted(r);   // the route as it prints: a made space closed (made-spaces-rule-v1)
            if (!index.m_sources[r[3]].ledger || Array.isArray(r[7]) || Array.isArray(r[8]) || !/,/u.test(route) || outside(route, ";").length !== 1) return false;
            // a list of short glosses, so every comma piece is a piece and none is the whole text
            const whole = route.trim().toLowerCase();
            const pieces = outside(route, ",").map((x) => x.toLowerCase());`],
  [`            return pieces.every((pc) => !others.has(disp(pc))) && !others.has(disp(String(r[1]).trim()));`,
   `            return pieces.every((pc) => !others.has(disp(pc))) && !others.has(disp(route.trim()));`],
  [`    const { opened, got } = await pillsOnCard(pw, launchOptions, defaultZoneUrl, pick);
    const whole = String(pick.row[1]).trim();
    const pieces = outside(whole, ",").filter((pc) => pc.trim().toLowerCase() !== whole.toLowerCase());`,
   `    const { opened, got } = await pillsOnCard(pw, launchOptions, defaultZoneUrl, pick);
    const whole = routePrinted(pick.row).trim();
    const pieces = outside(whole, ",").filter((pc) => pc.trim().toLowerCase() !== whole.toLowerCase());`],
]);

edit(join(R, "tools", "bake-search-index-v1.mjs"), [
  [`// its word. The division is the row's own (ledger-division-rule-v2: the cuts
// and the prints the ledger wrote; whole where the source has no ledger),
// and isNoDerivs is read out of zone.html and run, so the two cannot drift
// apart (until 7 November 2026 the page's comma rule was read out the same
// way; it retired that day). Only the keys a word's card asks for are read (a key`,
   `// its word. The division is the row's own (ledger-division-rule-v2: the cuts
// and the prints the ledger wrote; whole where the source has no ledger; a
// made space closed, made-spaces-rule-v1), and the page's own functions are
// read out of zone.html and run (isNoDerivs, closed, routePrinted and
// readingsOfRow), so the two cannot drift apart (until 13 November 2026 the
// reading rule was typed here a second time). Only the keys a word's card asks for are read (a key`],
  [`const { isNoDerivs } = new Function(\`\${grab("\\n  const isNoDerivs = (key) => ", ";\\n")}; return { isNoDerivs };\`)();
// a source under a ledger prints as its row says (ledger-division-rule-v2):
// the texts in row[8] (a part of itself, or no pill), else the pieces at the
// marks in row[7], else the whole text; a source with no ledger prints whole
// (7 November 2026: the comma rule the page guessed for it retired)
const pills = (row, src) => {
  const text = String(row[1]);
  if (isNoDerivs(src.licensePosture)) return [text];
  if (src.ledger) {
    if (Array.isArray(row[8])) return row[8].map((x) => String(x));
    const cuts = Array.isArray(row[7]) ? row[7] : [];
    if (!cuts.length) { const t = text.trim(); return t ? [t] : []; }
    const out = []; let from = 0;
    for (const i of cuts) { out.push(text.slice(from, i)); from = i + 1; }
    out.push(text.slice(from));
    return out.map((x) => x.trim()).filter(Boolean);
  }
  const t = text.trim();
  return t ? [t] : [];
};
`,
   `const { isNoDerivs } = new Function(\`\${grab("\\n  const isNoDerivs = (key) => ", ";\\n")}; return { isNoDerivs };\`)();
// THE PILLS OF A ROW ARE THE PAGE'S OWN. A no-derivatives record prints its
// route whole; any other row prints the readings the page's readingsOfRow
// gives: as its ledger says (ledger-division-rule-v2), whole where its source
// has none, a made space closed in either (made-spaces-rule-v1). The
// functions are the page's, read out of it and run against the index the
// row's source stands in: the store's, or an overlay's own.
const PAGE_CLOSED = grab("\\n  const closed = (text, places, from = 0, to = text.length) => {\\n", "\\n  };\\n");
const PAGE_ROUTE = grab("\\n  const routePrinted = (row) => ", ";\\n");
const PAGE_READINGS = grab("\\n  const readingsOfRow = (row) => {\\n", "\\n  };\\n");
const { routePrinted } = new Function(\`\${PAGE_CLOSED}\${PAGE_ROUTE}; return { routePrinted };\`)();
const pillsUnder = (ix) => {
  const readingsOfRow = new Function("index", \`\${PAGE_CLOSED}\${PAGE_READINGS} return readingsOfRow;\`)(ix);
  return (row, src) => (isNoDerivs(src.licensePosture) ? [routePrinted(row)] : readingsOfRow(row));
};
`],
  // the store's rows and the span store's stand under the store's index; an overlay's under its own
  [`const rix = JSON.parse(readFileSync(join(DATA, "route-store/index.json"), "utf8"));
`,
   `const rix = JSON.parse(readFileSync(join(DATA, "route-store/index.json"), "utf8"));
const pills = pillsUnder(rix);
`],
  [`  const rows = readShards(join(DATA, "overlays", id, "shards"), (oix.counts || {}).shards);
`,
   `  const rows = readShards(join(DATA, "overlays", id, "shards"), (oix.counts || {}).shards);
  const pillsHere = pillsUnder(oix);
`],
  [`      for (const p of pills(served, src)) add(joinSpan(p), L, row[3], null);`,
   `      for (const p of pillsHere(served, src)) add(joinSpan(p), L, row[3], null);`],
  // what was read out of the page, fingerprinted whole
  [`zone_split_sha256: sha(Buffer.from(String(isNoDerivs))).slice(0, 12) },`,
   `zone_split_sha256: sha(Buffer.from(String(isNoDerivs) + PAGE_CLOSED + PAGE_ROUTE + PAGE_READINGS)).slice(0, 12) },`],
]);

edit(join(R, "tools", "check-search-v1.mjs"), [
  [`// the pieces a row prints: whole for a NoDerivatives source; as its row says for
// a source under a ledger (ledger-division-rule-v2: the print slot row[8], else
// the cuts in row[7], else whole); whole for a source with no ledger (7 November
// 2026: the comma rule the page guessed for it retired)
const piecesOf = (row, src) => {
  const t = String(row[1]);
  if (isNoDerivs(src.licensePosture)) return [t];
  if (src.ledger) { if (Array.isArray(row[8])) return row[8].map((x) => String(x)); const cuts = Array.isArray(row[7]) ? row[7] : []; if (!cuts.length) return [t.trim()].filter(Boolean); const out = []; let from = 0; for (const i of cuts) { out.push(t.slice(from, i)); from = i + 1; } out.push(t.slice(from)); return out.map((x) => x.trim()).filter(Boolean); }
  return [t.trim()].filter(Boolean);
};
`,
   `// the pieces a row prints: whole for a NoDerivatives source; as its row says for
// a source under a ledger (ledger-division-rule-v2: the print slot row[8], else
// the cuts in row[7], else whole); whole for a source with no ledger (7 November
// 2026: the comma rule the page guessed for it retired); and in every one a
// space our own build made is closed (made-spaces-rule-v1: the places row[9]
// names for the route text are left out of the piece they fall in). Typed
// here on its own, as the rest of this check's reading of a row is: the bake
// runs the page's functions, and this is the second count beside them.
const piecesOf = (row, src) => {
  const t = String(row[1]), shut = Array.isArray(row[9]) ? row[9][0] || [] : [];
  const part = (a, b) => { let s = ""; for (let i = a; i < b; i += 1) if (!shut.includes(i)) s += t[i]; return s; };
  if (isNoDerivs(src.licensePosture)) return [part(0, t.length)];
  if (src.ledger) { if (Array.isArray(row[8])) return row[8].map((x) => String(x)); const cuts = Array.isArray(row[7]) ? row[7] : []; const out = []; let from = 0; for (const i of cuts) { out.push(part(from, i)); from = i + 1; } out.push(part(from, t.length)); return out.map((x) => x.trim()).filter(Boolean); }
  return [part(0, t.length).trim()].filter(Boolean);
};
`],
]);
