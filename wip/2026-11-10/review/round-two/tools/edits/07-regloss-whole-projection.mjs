// The re-gloss is a whole projection (the fifth reader's findings 2, 7 and 11).
//  - the two order columns the store itself defines (characters, corpus) are projected again with the table;
//    they had stood as the builder laid them on a store many versions ago
//  - every word is walked one way (tools/zone-walk-v1.mjs): the switch prices in lines now count a
//    commentary's words too
//  - the receipt no longer compares this run with the run before it: a second run on the same store
//    wrote "0 first readings moved" over the record of the move and changed every zone's bytes again.
//    The move is recorded when the table moves and carried untouched when it does not.
// node 07-regloss-whole-projection.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "regloss-zone.mjs"), [
  // ---- the header's rules ----
  [`//   1. Nothing is patched in place. This reads one zone and writes another.
//      Run it twice on the same inputs and you get the same bytes.`,
   `//   1. Nothing is patched in place. This reads one zone and writes another.
//      Run it twice on the same inputs and you get the same bytes; and run
//      it on its own output, with the same store and the same stamp, and
//      you get that output again (10 November 2026: the receipt had compared
//      each run with the run before it, so a second run rewrote the record
//      of what the first had moved).`],
  [`//   4. The zone records that it was re-projected, against which store, and
//      away from which gloss table, so the move is legible in the file rather
//      than only in a commit message.`,
   `//   4. The zone records that it was re-projected and against which store,
//      and, when the table this run writes is not the table the zone
//      carried, which table it moved away from and how far (last_move). A
//      run that moves nothing carries that record forward untouched, so the
//      move stays legible in the file rather than only in a commit message.
//   5. Every column the store itself defines is projected in this pass: the
//      table, the names laid over it, the licence columns, and the two
//      reader's orders the store computes (characters, corpus). A column this
//      pass does not project (the witnessed columns, baked from what the
//      corpus lane shipped) is refused unless it was baked against this store.`],
  [`import { require_ } from "./zone-lib-v1.mjs";`,
   `import { require_ } from "./zone-lib-v1.mjs";
import { wordListsOf } from "./zone-walk-v1.mjs";`],
  // ---- one walk ----
  [`for (const sec of zone.sections || []) (sec.words || []).forEach(addWord);
for (const n of zone.nodes || []) {`,
   `// every word of the zone, a book's sections and a commentary's units alike
const WORD_LISTS = wordListsOf(zone);
for (const words of WORD_LISTS) words.forEach(addWord);
for (const n of zone.nodes || []) {`],
  [`// a commentary zone carries its words under units rather than sections
for (const u of Object.values(zone.units || {}))
  for (const e of [...(u.section || []), ...Object.values(u.words || {}).flat()])
    (e.words || []).forEach(addWord);
`, ``],
  [`for (const sec of zone.sections || []) walkRuns(sec.words);
for (const u of Object.values(zone.units || {}))
  for (const e of [...(u.section || []), ...Object.values(u.words || {}).flat()]) walkRuns(e.words);
for (const f of runForms) keys.add(f);`,
   `for (const words of WORD_LISTS) walkRuns(words);
for (const f of runForms) keys.add(f);`],
  // ---- the table and the store's own two orders, in one call ----
  [`const { table: gloss, counts, sha256: baseSha256 } = store.tableFor([...cells]);`,
   `// the corpus record the page shelves languages by, and the corpus order
// sorts by: beside the zones when the zone is read from data/zones, else
// beside the store this run projects. It is required: without it every
// source shelves as "Hebrew in general" and the page, which has the record,
// shelves otherwise (6 November 2026: a round that reglossed baked copies
// from a scratch folder lost the record, and the switch check found two
// shelves with no joint price)
const corpusPath = /data\\/zones\\//u.test(String(inPath)) ? String(inPath).replace(/data\\/zones\\/.*$/u, "") + "data/source-corpus-v1.json" : join(dirname(storeDir), "source-corpus-v1.json");
if (!existsSync_(corpusPath)) { console.log(\`REFUSED — no corpus record at \${corpusPath}; the page shelves languages by it, so a projection without it would price shelves the page does not have\`); process.exit(1); }
const corpusRec = JSON.parse(readFileSync(corpusPath, "utf8"));
const corpusOf = (mId) => ((corpusRec.witnesses || {})[mId] || {}).corpus || null;
// THE READER'S ORDERS THE STORE DEFINES, PROJECTED WITH THE TABLE. tableFor
// answers the default order and, for each other order of its own (the
// catalog's rank: characters; the era's own witnesses first: corpus), the
// keys where that order leads with another reading. The builder laid those
// two columns once and this tool left them standing while it moved the
// table under them: on 10 November 2026 the 40 served zones held 47,038
// "characters" entries where the store gave 68,444, and of the 4,583
// "corpus" entries the store still gave 699. The page lays a column over
// the line (applyGlossOrder) and sorts the card live, so a stale entry is a
// line that says one reading over a card that opens on another.
const { table: gloss, deltas: orderDeltas, counts, sha256: baseSha256 } = store.tableFor([...cells], { corpusOf });`],
  // ---- counting words: the same walk ----
  [`for (const sec of zone.sections || []) (sec.words || []).forEach(countWord);
for (const u of Object.values(zone.units || {}))
  for (const e of [...(u.section || []), ...Object.values(u.words || {}).flat()])
    (e.words || []).forEach(countWord);
`,
   `for (const words of WORD_LISTS) words.forEach(countWord);
`],
  // ---- the store's two orders laid into the zone, whole ----
  [`if (Object.keys(noname).length || (zone.gloss_orders && typeof zone.gloss_orders === "object")) {`,
   `// the store's own two orders, replaced whole on every projection (rule 5);
// their M is derived below with the other columns'
const orderColumnsBefore = Object.fromEntries(Object.keys(orderDeltas).map((o) => [o, Object.keys((zone.gloss_orders || {})[o] || {}).length]));
for (const [o, col] of Object.entries(orderDeltas)) zone.gloss_orders[o] = col;
zone.emitted_from.reader_orders_layer = {
  rule: "reader-orders-rule-v1-the-orders-the-store-defines-are-projected-with-the-table-on-every-projection",
  projected_on: stamp, projected_by: "tools/regloss-zone.mjs",
  what_the_zone_carries: "gloss_orders.characters and gloss_orders.corpus — for every key of the table where that order of the store's pool leads with another reading than the default order does, that reading (gloss-store-v1 tableFor: a key absent from a column is the positive fact that the order agrees there); their M in gloss_m_orders, derived with the other columns'",
  corpus_record: "data/source-corpus-v1.json",
  columns: Object.fromEntries(Object.entries(orderDeltas).map(([o, col]) => [o, Object.keys(col).length])),
};
if (Object.keys(noname).length || (zone.gloss_orders && typeof zone.gloss_orders === "object")) {`],
  // ---- the per-order receipt: no comparison with the run before ----
  [`      ...(r.no_route_dropped ? { no_route_dropped: r.no_route_dropped } : {}),
      had_m_before: Object.keys(prevOM[o] || {}).length,
    }])),`,
   `      ...(r.no_route_dropped ? { no_route_dropped: r.no_route_dropped } : {}),
    }])),`],
  // ---- the receipt ----
  [`zone.counts.glossed_words = glossedWords;
zone.emitted_from.gloss_layer = {
  ...previous,
  rule: \`\${GLOSS_RULE_ID}: \${GLOSS_RULE_TEXT}\`,
  gloss_table_sha256: sha256,
  distinct_forms_glossed: counts.glossed,
  distinct_forms_bare: counts.no_exact_route + counts.no_displayable_route,
  store_inputs: store.index.inputs,
  reprojected: {
    rule: "regloss-rule-v1-project-the-store-over-a-zones-own-keys",
    on: stamp,
    // the store this projection read: gloss_layer.store_version stays the
    // build's own, and a re-gloss names the store it moved the zone onto
    store_version: store.index.store_version ?? null,
    from_gloss_table_sha256: previous.gloss_table_sha256 || null,
    forms_before: before.forms,
    forms_after: Object.keys(gloss).length,
    forms_whose_first_reading_moved: changed,
    words_carrying_a_reading: \`\${before.words ?? "?"} → \${glossedWords}\`,
    why: "the route store moved; a zone that does not move with it prints one reading and offers another",
    run_forms: \`\${WELD_FORMS_RULE_ID}: \${runForms.size} whole forms of this book's maqaf runs asked for (as written, joined, folded); \${[...runForms].filter((f) => gloss[f]).length} of them a dictionary published\`,
    m_layer: \`\${GLOSS_M_RULE_ID}: gloss_m re-derived over the same store for every key of the re-projected table — \${Object.keys(glossM).length} readings carry their M (was \${mBefore}), \${glossMDrift} readings no route stands on and shown without a chip\`,`,
   `zone.counts.glossed_words = glossedWords;
// THE MOVE, RECORDED WHEN THE TABLE MOVES (rule 4). A projection that writes
// the table the zone already carried moved nothing, and the record of the
// last move is carried forward as it stands. Zones projected before 10
// November 2026 carry no such record: their receipt was a comparison with
// the run before it, and every later run on the same store overwrote it
// with "0 moved". For them the field says so and is null.
const prevRe = previous.reprojected && typeof previous.reprojected === "object" ? previous.reprojected : {};
const tableMoved = !!previous.gloss_table_sha256 && previous.gloss_table_sha256 !== sha256;
const lastMove = tableMoved
  ? {
    on: stamp,
    from_store_version: prevRe.store_version ?? previous.store_version ?? null,
    to_store_version: store.index.store_version ?? null,
    from_gloss_table_sha256: previous.gloss_table_sha256,
    to_gloss_table_sha256: sha256,
    forms_before: before.forms,
    forms_after: Object.keys(gloss).length,
    forms_whose_first_reading_moved: changed,
    words_carrying_a_reading_before: before.words ?? null,
    words_carrying_a_reading_after: glossedWords,
  }
  : (prevRe.last_move ?? null);
zone.emitted_from.gloss_layer = {
  ...previous,
  rule: \`\${GLOSS_RULE_ID}: \${GLOSS_RULE_TEXT}\`,
  gloss_table_sha256: sha256,
  distinct_forms_glossed: counts.glossed,
  distinct_forms_bare: counts.no_exact_route + counts.no_displayable_route,
  store_inputs: store.index.inputs,
  reprojected: {
    rule: "regloss-rule-v1-project-the-store-over-a-zones-own-keys",
    on: stamp,
    // the store this projection read: gloss_layer.store_version stays the
    // build's own, and a re-gloss names the store it moved the zone onto
    store_version: store.index.store_version ?? null,
    forms: Object.keys(gloss).length,
    words_carrying_a_reading: glossedWords,
    last_move: lastMove,
    last_move_says: "the last projection that wrote another table than the zone carried: the stores and the tables on either side of it and how many first readings moved; null where no projection since 10 November 2026 has moved this zone's table (before that day the receipt compared each run with the run before it, and a later run on the same store overwrote the move with zeros)",
    why: "the route store moved; a zone that does not move with it prints one reading and offers another",
    run_forms: \`\${WELD_FORMS_RULE_ID}: \${runForms.size} whole forms of this book's maqaf runs asked for (as written, joined, folded); \${[...runForms].filter((f) => gloss[f]).length} of them a dictionary published\`,
    m_layer: \`\${GLOSS_M_RULE_ID}: gloss_m re-derived over the same store for every key of the re-projected table — \${Object.keys(glossM).length} readings carry their M, \${glossMDrift} readings no route stands on and shown without a chip\`,`],
  // ---- the corpus record is read above now ----
  [`// the corpus record the page shelves languages by: beside the zones when the
// zone is read from data/zones, else beside the store this run projects. It
// is required: without it every source shelves as "Hebrew in general" and the
// page, which has the record, shelves otherwise (6 November 2026: a round
// that reglossed baked copies from a scratch folder lost the record, and the
// switch check found two shelves with no joint price)
const corpusPath = /data\\/zones\\//u.test(String(inPath)) ? String(inPath).replace(/data\\/zones\\/.*$/u, "") + "data/source-corpus-v1.json" : join(dirname(storeDir), "source-corpus-v1.json");
if (!existsSync_(corpusPath)) { console.log(\`REFUSED — no corpus record at \${corpusPath}; the page shelves languages by it, so a projection without it would price shelves the page does not have\`); process.exit(1); }
const corpusRec = JSON.parse(readFileSync(corpusPath, "utf8"));
// positions per key: a word by its own key, a divided word by each part's
const weights = {};
for (const sec of zone.sections || []) for (const w of sec.words || []) {
  if (w.k) weights[w.k] = (weights[w.k] || 0) + 1;
  else if (Array.isArray(w.w)) for (const a of w.w) if (a && a.k && !String(a.k).includes("\\u05be")) weights[a.k] = (weights[a.k] || 0) + 1;
}`,
   `// positions per key: a word by its own key, a divided word by each part's;
// every word of the zone (the one walk: until 10 November 2026 this loop
// read a book's sections only, and every commentary zone priced its
// switches at 0 lines)
const weights = {};
for (const words of WORD_LISTS) for (const w of words) {
  if (w.k) weights[w.k] = (weights[w.k] || 0) + 1;
  else if (Array.isArray(w.w)) for (const a of w.w) if (a && a.k && !String(a.k).includes("\\u05be")) weights[a.k] = (weights[a.k] || 0) + 1;
}`],
  // ---- the typed post-build write names the new layer ----
  [`"gloss_orders", "emitted_from.licence_orders_layer", "gloss_names",`, `"gloss_orders", "emitted_from.licence_orders_layer", "emitted_from.reader_orders_layer", "gloss_names",`],
  // ---- what the run says of itself goes to the log, where a comparison with the run before belongs ----
  [`  \`\${names.counts.led} keys lead with a name (\${names.counts.moved} moved) · \` +`,
   `  \`\${names.counts.led} keys lead with a name (\${names.counts.moved} moved) · \` +
  \`orders \${Object.entries(orderDeltas).map(([o, col]) => \`\${o} \${Object.keys(col).length} (was \${orderColumnsBefore[o]})\`).join(", ")} · \` +
  \`gloss_m \${Object.keys(glossM).length} (was \${mBefore}) · \` +`],
]);
