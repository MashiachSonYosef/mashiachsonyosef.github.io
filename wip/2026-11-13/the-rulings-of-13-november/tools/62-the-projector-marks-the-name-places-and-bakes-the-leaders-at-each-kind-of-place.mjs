// The names gate's half that rides on the word, and the leaders at each kind of place (names-gate-rule-v1, with
// entry-gate-rule-v1). The projector marks np on every word place the corpus lane lists as a name, from the list
// the tree keeps under a pin (data/names/). And the leaders under "only" that the entry gate had it bake per entry
// are now baked per kind of place: the place's entry and whether it is a name, since a row its source gives as a
// name is withheld where the place is not one. They are asked in one pass over the book's words once every
// surface is graded, so a place in a verse the lattice holds whole is asked too (it has no tag; it still is or is
// not a name).
// Applies after edit 52.
// node 62-the-projector-marks-the-name-places-and-bakes-the-leaders-at-each-kind-of-place.mjs <reader dir>
import { join } from "node:path";
import { edit, span } from "./lib.mjs";
const R = process.argv[2];
const F = join(R, "tools", "project-lattice-v12-v1.mjs");

edit(F, [
  [`//            whose letters the pieces spell; a place whose pieces spell
//            neither, or whose core carries no tag, carries none.
`,
   `//            whose letters the pieces spell; a place whose pieces spell
//            neither, or whose core carries no tag, carries none.
//        np  1 where the place is a name: the corpus lane's list of name
//            places (data/names/, relay v177: TAHOT's grammar or MACULA's
//            type says so), by the verse and the word's number in it as
//            the card's head counts it (names-gate-rule-v1). A tree that
//            holds no list marks none, and its receipt says so.
`],
  [`import { ENTRY_GATE_RULE_ID, placeEntry, bdbEntriesAt, entryVerdict } from "./entry-gate-v1.mjs";
`,
   `import { ENTRY_GATE_RULE_ID, placeEntry, bdbEntriesAt, entryVerdict } from "./entry-gate-v1.mjs";
import { NAMES_GATE_RULE_ID, nameWithheld } from "./names-gate-v1.mjs";
import { leadersKey, PLACE_IS_A_NAME } from "./place-leaders-v1.mjs";
import { readPinnedLines } from "./pinned-v1.mjs";
`],
  [`places_tagged: 0, places_with_no_core_tag: 0, places_whose_pieces_spell_no_key_of_the_word: 0, surfaces_under_an_entry: 0, surfaces_whose_leader_the_entry_moves: 0,`,
   `places_tagged: 0, places_with_no_core_tag: 0, places_whose_pieces_spell_no_key_of_the_word: 0,
  name_places_listed: 0, name_places_marked: 0, name_places_with_no_word: 0, leaders_asked_at_a_kind_of_place: 0, leaders_the_place_moves: 0,`],
  [`    const place = tagged ? placeEntry(cores) : null;
    // the leaders under this place's entry, asked once for each entry a surface stands under
    const underThisEntry = (surface, key) => {
      const rec = grades[surface], held = surfaceRows.get(surface);
      if (!place || tagged.k !== key || !rec || !held) return;
      const tags = cores.join(" ");
      if (held.entries.has(tags)) return;
      held.entries.add(tags);
      stats.surfaces_under_an_entry += 1;
      const now = leadersUnderAnEntry(held, place);
      if (sameJson(now.l, rec.o.l) && sameJson(now.la, rec.o.la) && now.nl === !!rec.nl) return;
      (rec.e ||= {})[tags] = { l: now.l, la: now.la, ...(now.nl ? { nl: 1 } : {}) };
      stats.surfaces_whose_leader_the_entry_moves += 1;
    };
`,
   ``],
  [`        underThisEntry(m.surface, m.key);
        continue;
`,
   `        continue;
`],
  [`      surfaceRows.set(m.surface, { srows, gradeOfRow, attested, otherStem, nameText, entries: new Set() });
      underThisEntry(m.surface, m.key);
`,
   `      surfaceRows.set(m.surface, { srows, gradeOfRow, attested, otherStem, nameText, asked: new Set() });
`],
  [`for (const sec of zone.sections || []) {
  const on = (sec.words || []).filter((w) => !w.mark && keysOf(w).length);
  if (!on.length) continue;
`,
   `// ---- the name places of this book (names-gate-rule-v1) --------------------
// The corpus lane's list names each name place by its book, its verse and the
// word's number in the verse as the card's head counts it (the marks not
// counted). The list is kept under a pin in data/names/ and read only as those
// bytes. Every word's mark is cleared first, so a place an earlier list named
// and this one does not carries none.
const namesDir = arg("--names", join(zonePath.replace(/data\\/zones\\/.*$/u, ""), "data", "names"));
let namesSaid = null;   // what the receipt says of the list, or null where the tree holds none
for (const sec of zone.sections || []) for (const w of sec.words || []) delete w.np;
if (existsSync(join(namesDir, "PIN.json"))) {
  const pin = JSON.parse(readFileSync(join(namesDir, "PIN.json"), "utf8"));
  if (pin.schema_version !== "NAMES_PIN_V1" || !pin.place_names) { console.error(\`the pin of the names names no list of name places (\${join(namesDir, "PIN.json")})\`); process.exit(1); }
  const here = new Map();   // verse label -> the numbers of its words that are a name
  for (const l of readPinnedLines(join(namesDir, pin.folder, pin.place_names.file), pin.place_names, \`\${pin.folder}/\${pin.place_names.file}\`)) {
    if (l.book !== slug) continue;
    const cut = String(l.place).lastIndexOf(":");
    const verse = String(l.place).slice(0, cut), n = Number(String(l.place).slice(cut + 1));
    if (cut < 1 || !Number.isInteger(n) || n < 1) { console.error(\`the list of name places names a place that is no verse and word number: \${JSON.stringify(l.place)}\`); process.exit(1); }
    (here.get(verse) || here.set(verse, new Set()).get(verse)).add(n);
    stats.name_places_listed += 1;
  }
  for (const sec of zone.sections || []) {
    const listed = here.get(String(sec.label));
    if (!listed) continue;
    const words = (sec.words || []).filter((w) => !w.mark);
    for (const n of listed) { if (words[n - 1]) { words[n - 1].np = 1; stats.name_places_marked += 1; } }
  }
  stats.name_places_with_no_word = stats.name_places_listed - stats.name_places_marked;
  namesSaid = { rule: NAMES_GATE_RULE_ID, relay: pin.relay, place_names: { file: pin.place_names.file, sha256: pin.place_names.sha256, lines: pin.place_names.lines },
    listed_for_this_book: stats.name_places_listed, marked: stats.name_places_marked, with_no_word: stats.name_places_with_no_word };
}
// a place is a name where the list marks it; a book whose places were not read for names treats every place as one,
// so its names stand as they did before the gate
const isNamePlace = (w) => !namesSaid || !!w.np;

for (const sec of zone.sections || []) {
  const on = (sec.words || []).filter((w) => !w.mark && keysOf(w).length);
  if (!on.length) continue;
`],
  [`  what_the_word_carries: "tg: the tag of the word's core piece as the lattice writes it,`,
   `  what_the_word_carries: "np: 1 where the place is a name by the corpus lane's list of name places (names-gate-rule-v1), absent where it is not or where the tree holds no list; tg: the tag of the word's core piece as the lattice writes it,`],
  [`  projected_on: stamp, projected_by: "tools/project-lattice-v12-v1.mjs",
  counts: { ...stats },
`,
   `  projected_on: stamp, projected_by: "tools/project-lattice-v12-v1.mjs",
  counts: { ...stats },
  names: namesSaid,
`],
  [`if (s.held_examples.length) console.log(\`  held: \${s.held_examples.join(" | ")}\`);`,
   `console.log(\`  places: \${s.places_tagged.toLocaleString()} carry their entry's tag · \${namesSaid ? \`\${s.name_places_marked.toLocaleString()} of \${s.name_places_listed.toLocaleString()} listed name places marked\` : "no list of name places in this tree"} · leaders asked at \${s.leaders_asked_at_a_kind_of_place.toLocaleString()} kinds of place, \${s.leaders_the_place_moves.toLocaleString()} moved\`);
if (s.held_examples.length) console.log(\`  held: \${s.held_examples.join(" | ")}\`);`],
]);

span(F, [
  [`// THE ENTRY GATE'S LEADERS (entry-gate-rule-v1). Under "only this pointing"
`,
   `// ---- the name places of this book (names-gate-rule-v1) --------------------
`,
   `// THE LEADERS AT EACH KIND OF PLACE (entry-gate-rule-v1, names-gate-rule-v1;
// tools/place-leaders-v1.mjs says what the keys are). Under "only this
// pointing" the page asks two things of a place before it asks the pointing.
// Its entry: a row whose own source files it under another entry than the
// place's is withheld, a row of the place's entry stands whatever its
// headword's points, and a row with no number goes to the pointing as
// before. And whether the place is a name: where it is not, a row its own
// source gives as a name is withheld. The leaders baked for the filter (o.l,
// its alternate o.la, and nl, whether the name still leads) are computed
// with the pointing and the stem alone, and they stay so: they are what a
// place with no tag that is a name reads. For each kind of place a pointed
// surface stands at in this book they are computed again, row by row with
// the gates, and kept where they are not the same: grades[surface].e[<the
// place's key>] = { l, la, nl }. What a surface's rows grade as, and which
// stems part them, is the surface's and is kept from its first verse.
const sameJson = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const surfaceRows = new Map();   // pointed surface -> { srows, gradeOfRow, attested, otherStem, nameText, asked: the kinds of place asked so far }
const leadersAt = ({ srows, gradeOfRow, attested, otherStem, nameText }, place, isName) => {
  const bdbHere = place ? bdbEntriesAt(place, srows.map(factsOf)) : null;
  const verdict = new Map(srows.map((row) => [row, place ? entryVerdict(factsOf(row), place, bdbHere) : "none"]));
  const keeps = (row) => { const v = verdict.get(row); return v !== "other" && !nameWithheld(factsOf(row), isName) && (v === "this" || !attested || gradeOfRow(row) !== "x") && !otherStem(row); };
  const leader = (omit) => {
    const kept = srows.filter((row) => store.index.m_sources[row[3]] && !(omit && omit.has(String(row[3]))) && keeps(row));
    const pool = store.readingPool(kept, "oldest");
    if (!pool.length) return null;
    const carriers = store.carriersOf(kept, pool[0].text);
    return carriers.length ? [...credit(pool[0].text, carriers[0]), [...new Set(carriers.map((row) => String(row[3])))].sort()] : null;
  };
  const l = leader(null);
  return { l, la: l ? leader(new Set(l[4])) : null, nl: !!nameText && store.carriersOf(srows.filter(keeps), nameText).length > 0 };
};
`],
  [`// ---- the sidecar ----------------------------------------------------------
`,
   `const sideRoutes = {};
`,
   `// ---- the leaders at each kind of place, asked once every surface is graded --
// Every word of the book, and at a place written one way and read another
// each half, is a form the page may read leaders for: by its pointed surface
// (a read half's without the source's brackets), its own tags and whether its
// place is a name. A form whose surface the lattice graded under its own key
// is asked once for each kind of place it stands at.
for (const sec of zone.sections || []) for (const w of sec.words || []) {
  if (w.mark) continue;
  const isName = isNamePlace(w);
  for (const form of [w, ...(w.w || [])]) {
    if (!form || typeof form.s !== "string" || !form.k) continue;
    const surface = form === w ? form.s : form.s.replace(/^\\[+|\\]+$/gu, "");
    const rec = grades[surface], held = surfaceRows.get(surface);
    if (!rec || !held || rec.k !== form.k) continue;
    const tags = form.tg ? [].concat(form.tg) : null;
    const key = leadersKey(tags, isName);
    if (key === PLACE_IS_A_NAME || held.asked.has(key)) continue;   // no tag and a name: the surface's own leaders
    held.asked.add(key);
    stats.leaders_asked_at_a_kind_of_place += 1;
    const now = leadersAt(held, tags ? placeEntry(tags) : null, isName);
    if (sameJson(now.l, rec.o.l) && sameJson(now.la, rec.o.la) && now.nl === !!rec.nl) continue;
    (rec.e ||= {})[key] = { l: now.l, la: now.la, ...(now.nl ? { nl: 1 } : {}) };
    stats.leaders_the_place_moves += 1;
  }
}

// ---- the sidecar ----------------------------------------------------------
`],
  [`  entry: { rule: ENTRY_GATE_RULE_ID,`,
   `  ...(binyanFiles.length ? { stems: stemsByKey,`,
   `  entry: { rule: ENTRY_GATE_RULE_ID, row_entries: store.index.row_entries ? { relay: store.index.row_entries.relay, ledger_sha256: store.index.row_entries.ledger.sha256 } : null },
  names: namesSaid ? { rule: NAMES_GATE_RULE_ID, relay: namesSaid.relay, place_names_sha256: namesSaid.place_names.sha256, name_rows: store.index.name_rows ? { relay: store.index.name_rows.relay, list_sha256: store.index.name_rows.name_rows.sha256 } : null } : null,
  leaders_at_a_place: "grades[surface].e[<key>] = { l, la, nl }: the leaders under \\"only\\" at a kind of place, where the place's gates make them other than o.l, o.la and nl. The key is the place's core tags as the lattice writes them, joined by a space (none where the place carries no tag), with \\"|n\\" after them where the place is a name: at a place that is not a name a row its source gives as a name is withheld, and at a tagged place a row of another entry is. A place whose key e does not hold, and a place with no tag that is a name, reads o.l, o.la and nl. The word carries its place's tags (tg) and its name mark (np); where the tree holds no list of name places every place is read as a name",
`],
]);
