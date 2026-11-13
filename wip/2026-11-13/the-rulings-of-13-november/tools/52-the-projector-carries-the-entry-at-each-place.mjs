// The lattice projector, for the entry gate (entry-gate-rule-v1; the owner's rulings 1 and 6 of 13 November 2026).
// 1. Each word carries the tag of its core piece as the lattice writes it (tg): the entry TAHOT reads at the place.
//    At a place written one way and read another it rides on the half the pieces spell.
// 2. The leaders the sidecar bakes for "only this pointing" (o.l, o.la, nl) are computed row by row as the page
//    filters. The page now filters by the place's entry first, so for every entry a pointed surface stands under in
//    the book the leaders are computed again with the gate, and kept where they differ (grades[surface].e[<tags>]).
//    The leaders as they were stay where they were: a place with no tag still reads them.
// node 52-the-projector-carries-the-entry-at-each-place.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "project-lattice-v12-v1.mjs"), [
  [`//        ld  where the Leningrad codex differs: the kind and its letters.
`,
   `//        ld  where the Leningrad codex differs: the kind and its letters.
//        tg  the tag of the word's core piece, as the lattice writes it:
//            the entry TAHOT reads at this place (entry-gate-rule-v1). At a
//            place written one way and read another it rides on the half
//            whose letters the pieces spell; a place whose pieces spell
//            neither, or whose core carries no tag, carries none.
`],
  [`import { openRouteStore } from "./gloss-store-v1.mjs";
`,
   `import { openRouteStore, factsOf } from "./gloss-store-v1.mjs";
`],
  [`import { isOtherStem, stemsOfPlaceLine, STEM_FAMILY_RULE_ID } from "./stem-family-v1.mjs";
`,
   `import { isOtherStem, stemsOfPlaceLine, STEM_FAMILY_RULE_ID } from "./stem-family-v1.mjs";
import { ENTRY_GATE_RULE_ID, placeEntry, bdbEntriesAt, entryVerdict } from "./entry-gate-v1.mjs";
`],
  [`  bare: 0, bare_without_pieces: 0, pc: 0, pc_pieces: 0, pc_both_witnesses: 0, pc_skipped_word_has_an_english: 0,
`,
   `  bare: 0, bare_without_pieces: 0, pc: 0, pc_pieces: 0, pc_both_witnesses: 0, pc_skipped_word_has_an_english: 0,
  places_tagged: 0, places_with_no_core_tag: 0, places_whose_pieces_spell_no_key_of_the_word: 0, surfaces_under_an_entry: 0, surfaces_whose_leader_the_entry_moves: 0,
`],
  [`const sameList = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
`,
   `const sameList = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
// THE ENTRY GATE'S LEADERS (entry-gate-rule-v1). Under "only this pointing"
// the page asks the place's entry before it asks the pointing: a row whose
// own source files it under another entry than the place's is withheld, a
// row of the place's entry stands whatever its headword's points, and a row
// with no number goes to the pointing as before. The leaders baked for that
// filter (o.l, its alternate o.la, and nl, whether the name still leads)
// were computed with the pointing alone, and they stay so, for a place the
// lattice gives no tag. For each entry a pointed surface stands under in
// this book they are computed again here, row by row with the gate, and
// kept where they are not the same: grades[surface].e[<the place's core
// tags, as the lattice writes them, joined by a space>] = { l, la, nl }.
// The page reads the place's own by the word's tg, and the leaders as they
// were where no e speaks. What a surface's rows grade as, and which stems
// part them, is the surface's and is kept from its first verse.
const sameJson = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const surfaceRows = new Map();   // pointed surface -> { srows, gradeOfRow, attested, otherStem, nameText, entries: the tags asked so far }
const leadersUnderAnEntry = ({ srows, gradeOfRow, attested, otherStem, nameText }, place) => {
  const bdbHere = bdbEntriesAt(place, srows.map(factsOf));
  const verdict = new Map(srows.map((row) => [row, entryVerdict(factsOf(row), place, bdbHere)]));
  const keeps = (row) => { const v = verdict.get(row); return v !== "other" && (v === "this" || !attested || gradeOfRow(row) !== "x") && !otherStem(row); };
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
  [`  for (const w of on) { delete w.hg; delete w.hm; delete w.ld; delete w.pc; }
`,
   `  for (const w of on) { delete w.hg; delete w.hm; delete w.ld; delete w.pc; delete w.tg; for (const r of w.w || []) delete r.tg; }
`],
  [`  on.forEach((w, i) => {
    const p = rows[i];
`,
   `  on.forEach((w, i) => {
    const p = rows[i];
    // the entry at the place: the tags of its core pieces, on the word, or on the half the pieces spell
    const cores = (p.pieces || []).filter((x) => x && x.role === "core" && x.tag).map((x) => String(x.tag));
    const spelled = (p.pieces || []).map((x) => (x && x.consonants) || "").join("");
    const tagged = !cores.length ? null : w.w ? w.w.find((r) => r.k === spelled) || null : w.k === spelled ? w : null;
    if (tagged) { tagged.tg = cores.length === 1 ? cores[0] : cores; stats.places_tagged += 1; }
    else if (cores.length) stats.places_whose_pieces_spell_no_key_of_the_word += 1;
    else stats.places_with_no_core_tag += 1;
    const place = tagged ? placeEntry(cores) : null;
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
`],
  [`          stats.verses_with_their_own_citations += 1;
        }
        continue;
      }
`,
   `          stats.verses_with_their_own_citations += 1;
        }
        underThisEntry(m.surface, m.key);
        continue;
      }
`],
  [`      if (st) stats.surfaces_with_stems += 1;
      stats.grades += 1;
`,
   `      if (st) stats.surfaces_with_stems += 1;
      stats.grades += 1;
      surfaceRows.set(m.surface, { srows, gradeOfRow, attested, otherStem, nameText, entries: new Set() });
      underThisEntry(m.surface, m.key);
`],
  [`  routes: sideRoutes, grades,
`,
   `  routes: sideRoutes, grades,
  entry: { rule: ENTRY_GATE_RULE_ID, row_entries: store.index.row_entries ? { relay: store.index.row_entries.relay, ledger_sha256: store.index.row_entries.ledger.sha256 } : null,
    what: "grades[surface].e[<the core tags of a place, as the lattice writes them, joined by a space>] = { l, la, nl }: the leaders under \\"only\\" at a place of that entry, where the entry gate makes them other than o.l, o.la and nl; a place whose tags are not a key of e, and a place with no tag, reads o.l, o.la and nl. The word carries its place's tags (tg)" },
`],
  [`  what_the_word_carries: "hg: `,
   `  what_the_word_carries: "tg: the tag of the word's core piece as the lattice writes it, the entry TAHOT reads at this place (on a place written one way and read another, on the half whose letters the pieces spell), which the entry gate reads against each row's own entries; hg: `],
]);
