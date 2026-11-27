// one row per family: the store survey, the walk's counts, the hand-read tallies and the recommendation
import { readFileSync, writeFileSync } from "node:fs";
const survey = JSON.parse(readFileSync("store-survey.json", "utf8"));
const walk = JSON.parse(readFileSync("walk2-counts.json", "utf8"));
const tal = JSON.parse(readFileSync("sample-tallies.json", "utf8"));
const proj = JSON.parse(readFileSync("sample-projections.json", "utf8"));
const REC = {
  "english-wiktionary-hebrew-entries": ["reopen after a named mend", "only the rows whose entry is the one STEP's tag names (the lane's entry list already rides on the rows); the senses its own record tags modern, colloquial, slang or a misspelling rest shut"],
  "wikidata-lexemes": ["reopen after a named mend", "the core piece asked its own pointing (page lane, data held)"],
  "hebrew-wiktionary": ["needs the corpus lane", "the definition number each translation belongs to, and whether that definition cites a verse of the Bible; then the rows of the place's own entry whose definition cites Scripture"],
  "classical-hebrew-words": ["keep off", "a list of proposed homonyms; its own homonym numeral was dropped (corpus lane), and the entry list cannot part homonyms that share a head form"],
  "english-wiktionary-aramaic-entries": ["reopen after a named mend", "only at the Bible's Aramaic places (its own language field against the place's language); nothing of it on a Hebrew verse"],
  "english-wiktionary-translation-tables": ["keep off", "a reverse index of English entries; the pill prints the English headword where the source ties the Hebrew to one sense of it"],
  "panlex": ["keep off", "no entry, mostly no pointing; the source's Ancient Hebrew rows are the held ones"],
  "conceptnet": ["keep off", "no pointing and no entry: nothing binds it; it stands only where no gate asks"],
  "omegawiki": ["keep off", "encyclopedia definitions of the modern word; one in four a modern sense"],
  "muse": ["keep off", "a machine word-pair list; half names and transliterations"],
  "hebrew-wikipedia-titles": ["keep off", "article titles; adds no reading the twelve lack"],
  "hebrew-wordnet": ["keep off", "English WordNet's senses laid on a Hebrew lemma; one in five a modern sense"],
  "lexibank": ["keep off", "a 1,000-concept list of modern Hebrew; adds nothing"],
  "jastrow": ["keep off", "a rabbinic dictionary: where it is right it repeats the twelve; make the piece mend anyway, since it rests a press away"],
  "samaritan": ["keep off", "glossary apparatus printed as readings; Samaritan Aramaic on Hebrew words"],
  "kethoneth-yoseph": ["nothing to reopen", "reaches no word of the thirty-nine books"],
  "english-wikipedia-openings": ["nothing to reopen", "no row served"],
  "held-step-expanded-strong": ["needs the corpus lane", "STEP's tag as STEP gives it: at its own verse and word, never by letters"],
  "held-etcbc": ["needs the corpus lane", "entry numbers for its lexemes (or its lexeme per place), then the owner's word; with the piece mend"],
  "held-davidson-other-editions": ["needs the corpus lane", "the book's own words and its pointed forms; today's lines are bare letters and a rewording"],
  "held-panlex-own-language": ["keep off", "held for the Zohar; on the Bible one in three right, one in three unusable"],
  "held-harkavy": ["keep off", "refused by the owner by name; one in three right, one in three a modern sense"] };
const cols = ["id", "family", "kind", "status", "rows held", "distinct keys", "rows carrying an entry (n or b)", "rows with a pointed headword", "words reached (the block the card opens on)", "words reached (any block)", "words where a pill would stand", "of them on a core piece", "of them on a whole word", "row placings before the gates", "rows of the place's own entry", "rows of another entry (withheld)", "rows with no entry", "pills standing", "pills of a row of the place's own entry", "pills whose words none of the twelve print there (machine)", "words with such a pill", "words where a pill of the place's own entry stands", "words standing if the piece were asked its pointing", "pills if the piece were asked its pointing", "pills in the Aramaic stretches", "sample n", "R right in the verse", "S this word, another sense", "H another word", "M modern or post-biblical", "N a name", "G grammar or apparatus", "L wrong language", "C wrong language, cognate fits", "U unusable", "right word (R+S) of n", "right and new", "wrong", "right and new per wrong", "sample if the piece were graded: right of n", "sample, own entry only: right of n", "recommendation", "the mend or the reason"];
const lines = [cols.join("\t")];
const pct = (a, b) => (b ? `${a}/${b} (${Math.round(100 * a / b)}%)` : "");
for (const f of walk.families) {
  const sv = survey[f.id] || null, hl = walk.held_lists[f.id] || null, t = tal[f.id] || null, p = proj[f.id] || null, rec = REC[f.id] || ["", ""];
  const rows = sv ? sv.rows : hl ? hl.rows : 0, keys = sv ? sv.keys : hl ? hl.keys : 0;
  const entry = sv ? sv.rows - sv.no_entry : 0, pointed = sv ? sv.headwords_pointed : hl ? hl.headwords_pointed : 0;
  const status = f.kind === "held" ? (f.id === "held-harkavy" ? "refused, not served" : "held, not served") : rows ? "served, off by default" : "filed, no row served";
  lines.push([f.id, f.family, f.kind, status, rows, keys, entry, pointed, f.words_reached_default_block, f.words_reached_any_block, f.words_standing, f.words_standing_on_piece_block, f.words_standing_on_whole_block, f.row_placings_before_gates, f.rows_this_entry, f.rows_other_entry, f.rows_no_entry_at_tagged_place + f.rows_at_untagged_place, f.pills_standing, f.pills_this_entry, f.pills_with_a_new_word, f.words_with_a_new_word_pill, f.words_with_a_pill_of_the_places_own_entry, f.words_standing_if_the_piece_were_graded, f.pills_if_the_piece_were_graded, f.pills_in_aramaic_stretches,
    t ? t.n : "", t ? t.R : "", t ? t.S : "", t ? t.H : "", t ? t.M : "", t ? t.N : "", t ? t.G : "", t ? t.L : "", t ? t.C : "", t ? t.U : "", t ? pct(t.R + t.S, t.n) : "", p ? p.now.right_new : "", p ? p.now.wrong : "", p && p.now.wrong ? (p.now.right_new / p.now.wrong).toFixed(2) : "", p && p.if_the_piece_were_graded.n ? pct(p.if_the_piece_were_graded.right, p.if_the_piece_were_graded.n) : "", p && p.own_entry_only.n ? pct(p.own_entry_only.right, p.own_entry_only.n) : "", rec[0], rec[1]].join("\t"));
}
writeFileSync("families.tsv", lines.join("\n") + "\n");
// examples: up to five of each kind found, per set
const CALL = { R: "right for the word in this verse", S: "this word, a sense it has elsewhere", H: "another word spelled the same", M: "a modern or post-biblical sense", N: "a name", G: "a grammar note or dictionary apparatus", L: "wrong language", C: "wrong language, the cognate happens to fit", U: "unusable" };
let md = "# Five examples of each kind found, per family\n\nFrom the hand-read samples (`sample-<id>.tsv`). Each line: the place, the word, STEP's line there, and the pill as the page prints it (for a held list, the row as the corpus lane's list gives it).\n";
for (const [set, t] of Object.entries(tal)) { md += `\n## ${set} (n ${t.n})\n`; for (const [c, name] of Object.entries(CALL)) { const ex = (t.examples[c] || []).slice(0, 5); if (!ex.length) continue; md += `\n**${name}** (${t[c]})\n\n`; for (const e of ex) md += `- ${e}\n`; } }
writeFileSync("examples.md", md);
console.log(lines.length - 1, "families;", md.length, "bytes of examples");
