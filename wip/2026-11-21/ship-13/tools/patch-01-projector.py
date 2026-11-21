# Ship 13: tools/project-lattice-v12-v1.mjs reads the corpus lane's lattice delta (relay v208) over lattice v12, and
# the lost tags of the read words' amendment (relay v192.1) as the lattice pieces' own.
import sys
p = sys.argv[1] + "/tools/project-lattice-v12-v1.mjs"
t = open(p, encoding="utf-8").read()
def sub(a, b, n=1):
    global t
    if t.count(a) != n: sys.exit("patch-01: expected %d of: %s (found %d)" % (n, a[:100], t.count(a)))
    t = t.replace(a, b)

RULE = "lattice-delta-rule-v1-a-listed-entry-of-the-lattice-takes-the-corpus-lanes-own-later-names-and-grades-and-every-other-entry-stands-as-the-lattice-has-it"
sub("""// GUARDS: lattice-projection-rule-v1-the-lattice-is-projected-over-a-zones-own-positions-and-never-replaces-the-store, dictionary-kinds-rule-v1-each-dictionary-is-filed-by-what-it-says-it-is-and-a-kind-or-a-category-it-marks-in-its-own-data-may-rest-shut
""", """// GUARDS: lattice-projection-rule-v1-the-lattice-is-projected-over-a-zones-own-positions-and-never-replaces-the-store, dictionary-kinds-rule-v1-each-dictionary-is-filed-by-what-it-says-it-is-and-a-kind-or-a-category-it-marks-in-its-own-data-may-rest-shut, %s
""" % RULE)
sub("""//
// Run: node tools/project-lattice-v12-v1.mjs --zone data/zones/genesis.bin
//        --lattice <dir with positions-<book>-v12.jsonl.gz, routes-<book>-v12.jsonl.gz, lattice-<book>-v12.json>
//        --stamp YYYY-MM-DD --out build/lattice/genesis.bin [--sidecar data/zones/genesis.lattice.bin]
""", """//   8. THE CORPUS LANE'S DELTA IS READ OVER THE LATTICE (lattice-delta-rule-v1,
//      tools/lattice-delta-v1.mjs; relay v208, 20 November 2026). Where the
//      tree pins the delta (data/lattice-delta/PIN.json) the projection is
//      handed the folder of its lists (--delta) and reads each list that
//      lands only as the bytes the pin names. A listed entry's cards that
//      name its verse are the delta's list, whole (TAHOT's and MACULA's
//      readings at the verse, where v12 read TAHOT's alone and passed over
//      its rows with a second verse number); and each card the delta grades
//      otherwise moves from the lattice's grade to the page's (pointing
//      grade v5), so a row that carries no headwords of its own and falls to
//      its card's grade is graded as a row that carries them is. A line that
//      is not the lattice's entry (its verse, surface and key; a name the
//      lattice gave and the list lost; a grade the lattice does not give the
//      card) refuses the book. The grades of a surface are read at its first
//      verse, so the lines of one surface must name the same cards; one that
//      does not refuses the book. A tree that pins the delta is never
//      projected without it, and a tree that pins none is never handed one.
//      The sidecar says what was applied (delta).
//   9. A LOST TAG IS THE PIECE'S OWN (read-words-rule-v1, the amendment of
//      relay v192.1). Where the pin of the read words names a lattice piece
//      that lost TAHOT's tag (data/read-words/, its list of lost tags), the
//      piece is read with the tag the list sets, proved first to be the
//      piece as the list says the lattice has it: the place then carries tg
//      as any tagged place does, and no entry of MACULA's lemma (te).
//
// Run: node tools/project-lattice-v12-v1.mjs --zone data/zones/genesis.bin
//        --lattice <dir with positions-<book>-v12.jsonl.gz, routes-<book>-v12.jsonl.gz, lattice-<book>-v12.json>
//        --stamp YYYY-MM-DD --out build/lattice/genesis.bin [--sidecar data/zones/genesis.lattice.bin]
//        [--delta <the folder holding the lists data/lattice-delta/PIN.json names>]
""")
sub("""import { readKinds, restsOffIn, restsOffIds, DICTIONARY_KINDS_RECORD } from "./dictionary-kinds-v1.mjs";
""", """import { readKinds, restsOffIn, restsOffIds, DICTIONARY_KINDS_RECORD } from "./dictionary-kinds-v1.mjs";
import { LATTICE_DELTA_RULE_ID, LATTICE_DELTA_HOME, readLatticeDelta, namesFault, gradesFault, sameChanges } from "./lattice-delta-v1.mjs";
import { READ_WORDS_HOME, readReadWords, lostTagsOf } from "./read-words-v1.mjs";
""")
# the delta and the lost tags, read once the stats exist
sub("""const grades = {};          // pointed surface -> { k, g, n, o, v? }
""", """const grades = {};          // pointed surface -> { k, g, n, o, v? }
// ---- the corpus lane's delta over the lattice (rule 8) ----------------------
const dataDir = join(zonePath.replace(/data\\/zones\\/.*$/u, ""), "data");
const deltaPin = join(dataDir, LATTICE_DELTA_HOME.replace(/^data\\//u, ""), "PIN.json");
const deltaDir = arg("--delta");
let delta = null;
if (existsSync(deltaPin)) {
  if (!deltaDir) { console.error(`REFUSED — this tree pins the corpus lane's lattice delta (${LATTICE_DELTA_HOME}/PIN.json): name the folder of its lists with --delta`); process.exit(1); }
  try { delta = readLatticeDelta(deltaPin, deltaDir, slug); } catch (e) { console.error(`REFUSED — the lattice delta: ${String((e && e.message) || e)}`); process.exit(1); }
  Object.assign(stats, { delta_names_lines: delta.listed.names_this_verse ?? 0, delta_names_lines_applied: 0, delta_names_added: 0, delta_names_lines_for_span_cards: delta.spans.length,
    delta_grade_lines: delta.listed.grade_v5 ?? 0, delta_grade_lines_applied: 0, delta_cards_regraded: 0, delta_grade_lines_of_a_surface_graded_at_an_earlier_verse: 0 });
} else if (deltaDir) { console.error(`REFUSED — --delta names a folder, and this tree pins no lattice delta (${LATTICE_DELTA_HOME}/PIN.json)`); process.exit(1); }
const deltaRefused = (what, why) => { console.error(`REFUSED — the lattice delta's ${what}: ${why}`); process.exit(1); };
const NO_LINES = new Map();
const deltaGradesAt = new Map();   // pointed surface -> the delta's grades line read at its first verse, or null
const GRADE_NAME = { m: "VOWEL_MATCH", n: "NORMALIZED", x: "VOWEL_MISMATCH" };
// ---- the lost tags of the read words' amendment (rule 9) --------------------
const lostTagAt = new Map();       // lattice position j -> the lost tag
{
  const pinPath = join(dataDir, READ_WORDS_HOME.replace(/^data\\//u, ""), "PIN.json");
  if (existsSync(pinPath)) {
    let lostList = null;
    try { lostList = lostTagsOf(readReadWords(pinPath)); } catch (e) { console.error(`REFUSED — the read words' pin: ${String((e && e.message) || e)}`); process.exit(1); }
    if (lostList.faults.length) { console.error(`REFUSED — the read words' list of lost tags: ${lostList.faults[0]}`); process.exit(1); }
    for (const l of lostList.tags) if (l.book === slug) lostTagAt.set(l.lattice.j, l);
    if (lostList.tags.length) Object.assign(stats, { lost_tags_listed_for_this_book: lostTagAt.size, lost_tags_set: 0 });
  }
}
""")
sub("""    const p = rows[i];
    // the entry at the place: the tags of its core pieces, on the word, or on the half the pieces spell
    const cores = (p.pieces || []).filter((x) => x && x.role === "core" && x.tag).map((x) => String(x.tag));
    const spelled = (p.pieces || []).map((x) => (x && x.consonants) || "").join("");""",
    """    const p = rows[i];
    // rule 9: a piece that lost TAHOT's tag is read with it, once it is proved to be the piece the list names
    const lost = lostTagAt.get(p.j) || null;
    let pieces = p.pieces || [];
    if (lost) {
      const has = pieces[lost.index] || null, m0 = (p.megacompspan || [])[0] || {};
      const same = !!has && ["role", "hebrew", "consonants", "english_tahot", "english_macula", "tag", "macula_class", "source"].every((k) => (has[k] ?? "") === (lost.now[k] ?? ""));
      if (sec.label !== lost.ref || m0.surface !== lost.surface || !same || i + 1 !== lost.word_number && on.length === (sec.words || []).filter((x) => !x.mark).length) {
        console.error(`REFUSED — the read words' lost tag at ${slug} ${lost.ref} word ${lost.word_number}: lattice position ${p.j} is ${sec.label} ${m0.surface}, piece ${lost.index} ${JSON.stringify(has)}, and the list names ${lost.surface} with the piece ${JSON.stringify(lost.now)}`); process.exit(1);
      }
      pieces = pieces.map((x, at) => (at === lost.index ? { ...x, tag: lost.tag } : x));
      stats.lost_tags_set += 1;
    }
    // the entry at the place: the tags of its core pieces, on the word, or on the half the pieces spell
    const cores = pieces.filter((x) => x && x.role === "core" && x.tag).map((x) => String(x.tag));
    const spelled = pieces.map((x) => (x && x.consonants) || "").join("");""")
sub("""    for (const m of p.megacompspan || []) {
      const rg = m.route_grades;
      const list = routes.get(m.key);
      if (!rg || !list) continue;
      const names = (rg.names_this_verse || []).filter((ix) => ix < list.length);
      // the surface is graded already, at its first verse: this verse adds
      // only what is its own, the cards that name it, where they are not
      // the first verse's
      if (grades[m.surface]) {
        const base = grades[m.surface];""",
    """    for (const [ei, m] of (p.megacompspan || []).entries()) {
      const rg = m.route_grades;
      const list = routes.get(m.key);
      if (!rg || !list) continue;
      // rule 8: the cards that name the verse are the delta's list where it lists the entry
      const dn = delta ? (delta.names.get(p.j) || NO_LINES).get(ei) || null : null;
      if (dn) {
        const why = namesFault(dn, { ref: sec.label, surface: p.surface, reading: m.reading, key: m.key, was: rg.names_this_verse || [] });
        if (why) deltaRefused(`names line for ${slug} position ${p.j} entry ${ei}`, why);
        stats.delta_names_lines_applied += 1; stats.delta_names_added += dn.added.length;
      }
      const names = ((dn ? dn.names_this_verse : rg.names_this_verse) || []).filter((ix) => ix < list.length);
      const dg = delta ? (delta.grades.get(p.j) || NO_LINES).get(ei) || null : null;
      // the surface is graded already, at its first verse: this verse adds
      // only what is its own, the cards that name it, where they are not
      // the first verse's
      if (grades[m.surface]) {
        // rule 8: a grade repeats wherever the surface does, so this verse's line names the cards the first verse's did
        if (delta && grades[m.surface].k === m.key) {
          if (!sameChanges(deltaGradesAt.get(m.surface), dg)) deltaRefused(`grades line for ${slug} position ${p.j} entry ${ei}`, `it grades ${m.surface} otherwise than the line of the surface's first verse in the book does`);
          if (dg) stats.delta_grade_lines_of_a_surface_graded_at_an_earlier_verse += 1;
        }
        const base = grades[m.surface];""")
sub("""      const g = new Array(list.length).fill("-");
      for (const [tier, idxs] of Object.entries(rg.grade_of_index || {})) for (const ix of idxs) if (ix < g.length) g[ix] = GRADE_CHAR[tier] || "-";
""", """      const g = new Array(list.length).fill("-");
      for (const [tier, idxs] of Object.entries(rg.grade_of_index || {})) for (const ix of idxs) if (ix < g.length) g[ix] = GRADE_CHAR[tier] || "-";
      // rule 8: each card the delta grades otherwise moves from the lattice's grade, proved to be the one the line names, to the page's
      if (dg) {
        const why = gradesFault(dg, { ref: sec.label, surface: m.surface, reading: m.reading, key: m.key, gradeOf: (ix) => (ix < g.length ? GRADE_NAME[g[ix]] || null : null) });
        if (why) deltaRefused(`grades line for ${slug} position ${p.j} entry ${ei}`, why);
        for (const [ix, , to] of dg.changes) g[ix] = GRADE_CHAR[to];
        stats.delta_grade_lines_applied += 1; stats.delta_cards_regraded += dg.changes.length;
      }
      if (delta) deltaGradesAt.set(m.surface, dg);
""")
sub("""  routes: sideRoutes, grades,
""", """  routes: sideRoutes, grades,
  // rule 8: the corpus lane's delta read over the lattice; absent where the tree pins none
  ...(delta ? { delta: { rule: LATTICE_DELTA_RULE_ID, relay: delta.pin.relay, pin: `${LATTICE_DELTA_HOME}/PIN.json`,
    lists: Object.fromEntries(Object.entries(delta.pin.lists).map(([k, d]) => [k, { file: d.file, sha256: d.sha256, lands: d.lands }])),
    names: { lines_for_this_book: stats.delta_names_lines, applied: stats.delta_names_lines_applied, names_added: stats.delta_names_added, lines_for_span_cards: stats.delta_names_lines_for_span_cards },
    grades: { lines_for_this_book: stats.delta_grade_lines, applied_at_a_surfaces_first_verse: stats.delta_grade_lines_applied, cards_regraded: stats.delta_cards_regraded, lines_of_a_surface_graded_at_an_earlier_verse: stats.delta_grade_lines_of_a_surface_graded_at_an_earlier_verse },
    what: "a listed entry's cards that name its verse (n, v[<verse>].n) are the delta's list in place of lattice v12's; each card the delta grades otherwise carries the page's grade in g in place of the lattice's. A line whose verse the projection held or did not find, or whose entry the store's routes do not reach, is not applied; a line for one of the lattice's own span cards is counted and not read" } } : {}),
""")
sub("""console.log(`  places: ${s.places_tagged.toLocaleString()} carry their entry's tag""",
    """if (delta) console.log(`  delta ${delta.pin.relay}: names ${s.delta_names_lines_applied.toLocaleString()} of ${s.delta_names_lines.toLocaleString()} lines applied (${s.delta_names_added.toLocaleString()} names added; ${s.delta_names_lines_for_span_cards} for span cards, not read) · grades ${s.delta_grade_lines_applied.toLocaleString()} lines applied at a surface's first verse (${s.delta_cards_regraded.toLocaleString()} cards), ${s.delta_grade_lines_of_a_surface_graded_at_an_earlier_verse.toLocaleString()} more of surfaces graded already, of ${s.delta_grade_lines.toLocaleString()}`);
if (s.lost_tags_listed_for_this_book) console.log(`  lost tags: ${s.lost_tags_set} of ${s.lost_tags_listed_for_this_book} set`);
console.log(`  places: ${s.places_tagged.toLocaleString()} carry their entry's tag""")
open(p, "w", encoding="utf-8").write(t)
print("patch-01 ok")
