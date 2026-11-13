// Two changes to the made spaces' tool and check, both owed since 13 November's first ship.
//
// 1. A ROW MAY CARRY A SLOT PAST ITS CLOSES. The tool told "this row carries the closes slot" by the row's length
//    and took the slot off by cutting the row there. A row now carries its facts in slot 10 (the entry its own
//    source files it under), so the closes slot can stand empty inside a longer row and cannot be cut off it. The
//    slot is asked by what it holds, and set and taken off by the store's own setSlot.
//
// 2. THE FLAG FOLLOWS TWO FINGERPRINTS. The index said of each source whether its rows are the rows its list was
//    read from, and kept one sha256 of them as they stand. A flag turned false by hand could not be told from a
//    store that had honestly moved on: the corpus lane's counts were then said and not judged, and the check
//    passed (the eighth of the ways the check was made to fail on purpose, and the one it did not catch). The
//    index now also keeps the sha256 the rows had when a run found them as read (texts_sha256_as_read), the tool
//    asks that one, and the check holds that the flag is true exactly where the two are the same.
// node 58-the-closes-slot-is-not-a-rows-last.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "apply-made-spaces-v1.mjs"), [
  [`// on a row of a listed source whose route text or definition text is a line
// of its source's list with at least one close, and on no other row. A row
// with no close keeps the length it had. The readers take the characters at
`,
   `// on a row of a listed source whose route text or definition text is a line
// of its source's list with at least one close, and on no other row. A row
// with no close carries none: the slot is absent, or stands empty where the
// row carries a later one (its facts, slot 10). The readers take the characters at
`],
  [`// source's rows hold exactly the texts they held when an earlier run found
// them so (index.made_spaces.sources: the sha256 of the source's rows, each
// as its key, its route text and its definition text). A ledger answered
// anew or a year written moves the store's version and none of these texts,
// and the counts are still held. After a row of the source is struck, landed
// or re-keyed the same comparisons are recorded and no longer refuse: the
// closes of every text the list names still hold.
`,
   `// source's rows hold exactly the texts they held when an earlier run found
// them so. The index keeps two sha256 of each source's rows, each row as its
// key, its route text and its definition text (index.made_spaces.sources):
// texts_sha256, the rows as they stand, and texts_sha256_as_read, the rows as
// they stood when a run last found them the rows the list was read from.
// While the two are the same the rows are those rows, and texts_are_as_read
// says so. A ledger answered anew, a year written or an entry set on a row
// moves the store's version and none of these texts, and the counts are
// still held. After a row of the source is struck, landed or re-keyed the
// two differ, the same comparisons are recorded and no longer refuse: the
// closes of every text the list names still hold.
`],
  [`import { MADE_SPACES_RULE_ID, CLOSES_SLOT, closed } from "./gloss-store-v1.mjs";`,
   `import { MADE_SPACES_RULE_ID, CLOSES_SLOT, closed, setSlot } from "./gloss-store-v1.mjs";`],
  [`      if (row.length > CLOSES_SLOT) refuse(\`\${name} \${k}: a row of \${m}, which no list names, carries the closes slot\`);`,
   `      if ((row[CLOSES_SLOT] ?? null) !== null) refuse(\`\${name} \${k}: a row of \${m}, which no list names, carries the closes slot\`);`],
  [`    const has = row.length > CLOSES_SLOT ? row[CLOSES_SLOT] : null;
    if (same(has, want)) continue;
    t.rows_moved += 1; moved += 1;
    if (DRY) continue;
    if (want) { while (row.length < CLOSES_SLOT) row.push(null); row[CLOSES_SLOT] = want; }
    else { row.length = CLOSES_SLOT; if (row[8] === null) { row.length = 8; if (row[7] === null) row.length = 7; } }
`,
   `    const has = row[CLOSES_SLOT] ?? null;
    if (same(has, want)) continue;
    t.rows_moved += 1; moved += 1;
    if (DRY) continue;
    setSlot(row, CLOSES_SLOT, want);   // a later slot stays where it is
`],
  [`const recorded = ((index.made_spaces || {}).sources) || {};
const asRead = (m, L, fingerprint) => {
  if (index.store_version === L.readAt) return "the store is the version the list was read from";
  if (movedOnlyByThisRule(L.readAt)) return "every move of the store since that version is this rule's, which changes no text";
  const r = recorded[m];
  if (r && r.texts_are_as_read === true && r.read_at_store_version === L.readAt && r.texts_sha256 === fingerprint) return "the source's rows hold the texts they held when an earlier run found them as read";
  return null;
};
`,
   `const recorded = ((index.made_spaces || {}).sources) || {};
// the sha256 a source's rows had when a run last found them the rows its list was read from, as the index keeps it
// for the same relay's reading. A record written before the index kept it apart held one sha256 and the flag:
// where that flag says the rows were as read, its sha256 is the one.
const asReadWas = (m, L) => {
  const r = recorded[m];
  if (!r || r.read_at_store_version !== L.readAt) return null;
  return r.texts_sha256_as_read !== undefined ? r.texts_sha256_as_read : r.texts_are_as_read === true ? r.texts_sha256 : null;
};
const asRead = (m, L, fingerprint) => {
  if (index.store_version === L.readAt) return "the store is the version the list was read from";
  if (movedOnlyByThisRule(L.readAt)) return "every move of the store since that version is this rule's, which changes no text";
  if (asReadWas(m, L) === fingerprint) return "the source's rows hold the texts they held when an earlier run found them as read";
  return null;
};
`],
  [`  named[m] = { key: L.key, relay: L.relay, read_at_store_version: L.readAt, texts_sha256: fingerprint, texts_are_as_read: !!road };`,
   `  named[m] = { key: L.key, relay: L.relay, read_at_store_version: L.readAt, texts_sha256: fingerprint, texts_sha256_as_read: road ? fingerprint : asReadWas(m, L), texts_are_as_read: !!road };`],
]);

edit(join(R, "tools", "check-made-spaces-v1.mjs"), [
  [`//   M4  the store's index names the rule, the pin, the relays, the lists and
//       the never-closed files, each source's rows as they stand now (the
//       sha256 of their keys and texts) and totals that are a recount's
`,
   `//   M4  the store's index names the rule, the pin, the relays, the lists and
//       the never-closed files, each source's rows as they stand now (the
//       sha256 of their keys and texts) and totals that are a recount's; and
//       it says a source's rows are the rows its list was read from exactly
//       where they stand as they stood when a run found them so (the second
//       sha256 it keeps)
`],
  [`//       shows no move but this rule's since the version the relay read, or
//       where they hold the texts the index recorded when that was so. For a
//       source whose rows have moved on, the counts are said and not judged
`,
   `//       shows no move but this rule's since the version the relay read, or
//       where they hold the texts the index recorded when that was so. For a
//       source whose rows have moved on, the counts are said and not judged.
//       (That record is the index's own witness: an index whose flag and
//       second sha256 were both rewritten cannot be told from a store that
//       moved on, and its counts are then said, not judged.)
`],
  [`    const has = row.length > CLOSES_SLOT ? row[CLOSES_SLOT] : null;
    if (row.length > CLOSES_SLOT + 1) rowFaults.push(\`\${f} \${k} (\${m}): \${row.length} slots\`);
    if (!L) { if (has !== null || row.length > CLOSES_SLOT) rowFaults.push(\`\${f} \${k} (\${m}): a row of a source no list names carries the slot\`); continue; }
`,
   `    // the slot is asked by what it holds: a row may carry a later slot (its facts), whose shape is its own check's
    const has = row[CLOSES_SLOT] ?? null;
    if (!L) { if (has !== null) rowFaults.push(\`\${f} \${k} (\${m}): a row of a source no list names carries the slot\`); continue; }
`],
  [`    else if (r.texts_sha256 !== standsAs(m)) indexFaults.push(\`the index's record of \${m}'s rows (\${String(r.texts_sha256).slice(0, 12)}) is not the rows as they stand (\${standsAs(m).slice(0, 12)}): the tool has not run since they moved\`);
`,
   `    else if (r.texts_sha256 !== standsAs(m)) indexFaults.push(\`the index's record of \${m}'s rows (\${String(r.texts_sha256).slice(0, 12)}) is not the rows as they stand (\${standsAs(m).slice(0, 12)}): the tool has not run since they moved\`);
    else if (r.texts_are_as_read !== (typeof r.texts_sha256_as_read === "string" && r.texts_sha256_as_read === r.texts_sha256)) indexFaults.push(\`the index says \${m}'s rows \${r.texts_are_as_read ? "are" : "are not"} the rows its list was read from, and its two records of them (as read \${String(r.texts_sha256_as_read).slice(0, 12)}, as they stand \${String(r.texts_sha256).slice(0, 12)}) say otherwise\`);
`],
  [`const whole = (r) => r.length > CLOSES_SLOT && !Array.isArray(r[7]) && !Array.isArray(r[8]);`,
   `// a row that carries closes, asked by what the slot holds (a row may carry a later slot and none here), and that
// its ledger leaves whole
const whole = (r) => Array.isArray(r[CLOSES_SLOT]) && !Array.isArray(r[7]) && !Array.isArray(r[8]);`],
  [`  const byRecord = !!rec && rec.texts_are_as_read === true && rec.read_at_store_version === L.readAt && rec.texts_sha256 === standsAs(m);`,
   `  const byRecord = !!rec && rec.read_at_store_version === L.readAt && typeof rec.texts_sha256_as_read === "string" && rec.texts_sha256_as_read === standsAs(m);`],
]);
