# The Tabernacle · synthesis lane · the pipeline

> **Read this first (10 November 2026).** This document records the pipeline
> as it stood in August 2026, and its opening claim is no longer true of the
> site. `build.sh` builds the plan tier's works from the corpus lane's
> workspace and does not run on a checkout. What the site publishes today is
> made in two steps: a route builder writes a work's zone once, from the
> corpus lane's text; and `tools/round-v1.sh` projects every served zone
> again over the records this repository holds, each write typed on the zone
> it changes. Since 12 November 2026 the round also opens the reader itself
> and keeps the lines it draws as each work first opens
> (`tools/bake-resting-lines-v1.mjs`, `data/resting-lines/`): the plain list
> under every chapter is that recording, and the door refuses one that is not
> of the tree it builds from. Since 13 November the chain books are a
> recording of the same kind (`tools/build-chain-book-v2.mjs`, `../chain/`):
> every word of a chained book is pressed and the card the page opens is
> read, and the chain's index is not written over a book that is not of the
> tree. Since the same day a row of the store carries, where the corpus
> lane's list names one, the places of a space our own build made in its
> text (`tools/apply-made-spaces-v1.mjs`, `data/made-spaces/` with one folder
> per relay of the corpus lane's), and every
> reader closes them where the text prints; the store's texts are the served
> bytes, unchanged. The map of readings that point at another entry is baked
> from the corpus lane's own files, kept here byte for byte and laid together
> as each relay's pin names them (`tools/pointer-map-v1.mjs`,
> `tools/bake-form-of-pills-v1.mjs`, `data/pointer-entries/`), under the
> owner's rulings as the lane pinned them (`data/rulings/`, read through
> `tools/rulings-v1.mjs`); a file another lane wrote is read only as the
> bytes its pin names (`tools/pinned-v1.mjs`). Since the same day a row
> also carries a slot of facts: the entry its own source files it under
> (`tools/apply-row-entries-v1.mjs`, from the corpus lane's row entries
> ledger, which stays on the lane's store and is named in
> `data/row-entries/` by its size and sha256; since 20 November 2026 the
> ledger is v1.2, relay v197, read from the store as served, with the lines
> of the rows struck before it was read kept beside it for the twin of a
> struck row; and from the facts lists the pin names under `lists`, the
> entry ledgers of relays v203 and v204, which give a row of a source that
> names no entry the numbers of the Bible dictionaries' entries its own
> pointed head form meets: the numbers land; STEP's letters land from
> English Wiktionary's list since 22 November 2026, as relay v211 widens
> them by TBESH's own columns so that none holds back a letter of the same
> word; BDB's own entries land from both lists since 23 November 2026, as
> relay v218 reissues them with relay v212's two answers (English
> Wiktionary's letters are still read from relay v211's list, which names
> the same rows line for line: the pin's facts_from); they were counted and
> not written until relay
> v218, as the pin says) and whether its source gives
> it as a name (`tools/apply-name-rows-v1.mjs`, from the lists kept in
> `data/names/`: since 20 November 2026 the list of name rows is names
> v2's, relay v198, every dictionary that marks a name read by its own
> mark, and the list of name places is still names v1's; the pin gives each
> its own folder, rule and receipt. Since 23 November 2026 (ship 20) the
> rows the lane marks by the same rule in lists of their own are marked
> beside names v2's: relay v213's, the 22 rows relays v200 and v202
> landed, and relay v219's, 6 rows of the translation tables, each list
> with its own rule and receipt and the way its lines find their row; and
> the list of places read is names v1's with relay v219's addition laid
> on it, Ezekiel 27:6 word 11 added and TAHOT a witness at 6 more places,
> names v1's file kept as it is: `tools/name-lists-v1.mjs`). The round's projection writes on each word the entry that
> stands at its place and whether the place is a name. The reader asks both
> of the place before it asks the pointing: a row of another entry than the
> word's is withheld, a row of the word's own entry stands whatever its
> points, and a row given as a name is withheld where the word is not one
> (`tools/entry-gate-v1.mjs`, `tools/names-gate-v1.mjs`; the line under
> each word follows by `tools/place-leaders-v1.mjs`), as is a pointer whose
> English is such a row: the map marks it from the list of name rows, read
> as the bytes `data/names/PIN.json` names (`tools/bake-form-of-pills-v1.mjs`).
> The projection also
> bakes, for each row a source names a stem for, that stem: from the corpus
> lane's two binyan files and, since 13 November, from their extension to
> the UBS dictionary, the SDBH and Jastrow (`data/stems-extension/`, read
> through `tools/stems-extension-v1.mjs` under the owner's setting of its
> two branches). The three files stay on the lane's store and are named on
> the round's command line. The reader withholds a reading of another stem
> than the word's, and asks that of the rows of the dictionaries beside the
> store as of the store's own (`tools/rows-beside-the-store-v1.mjs` is how a
> check counts those rows). A book's sidecar carries the rows' stems only
> under the keys a card of that book, or a leader baked for it, can ask
> them under (`tools/stems-carried-v1.mjs`). A row's facts also say, since the same day,
> where the row is only the words that open a numbered sense of its entry
> (`tools/apply-sense-openings-v1.mjs`, from the corpus lane's list of the
> unabridged BDB's openings kept in `data/sense-openings/`, under the
> owner's ruling that such a row prints as a note and not as a pill). The
> store's reader gives such a row no reading, so no line, pill, link or
> index entry stands on it, and the reader prints the ones its switches
> keep as the card's notes, with the record of the reading held. At the
> 16 places where the edition writes a paseq inside a read form, a zone
> carries since the same day the read word the stroke follows
> (`tools/apply-paseq-place-v1.mjs`, from the corpus lane's list kept in
> `data/paseq-place/`): the stroke keeps its own position and its count,
> and the reader prints it inside the read form, with the marks. That write
> was made by hand, is typed on each zone it changed, and expires when the
> zones are built from the lane's next lattice, which stands each stroke in
> its place itself; the round's projections keep it. At the 28 places whose
> read form holds two or three words, a zone carries since 15 November each
> read word's own entry and, where the lattice gave the place none and the
> pin does not hold them back until the lane answers, the place's pieces
> (`tools/apply-read-words-v1.mjs`, from the corpus lane's list kept in
> `data/read-words/`, read through `tools/read-words-v1.mjs`):
> the reader asks each read word its entry by its own key, and draws the
> place's line from the pieces, as at every place that carries them. Since
> 21 November the list is the lane's amended one (relay v192.1): every line
> names its place's own word number, which the word found is held to; the
> piece at Psalms 10:10 carries the edition's letters, so that place is held
> no longer and carries its two tags and its pieces; and one more list names
> the tag a lattice piece lost (Genesis 14:17, where TAHOT writes its mark
> inside the word). The projection reads that tag as the piece's own, and
> the same tool lays TAHOT's words for the place on the zone's piece. The
> lattice projection clears the tags it finds, so the round lays them again
> after it, each time; the write is typed on each zone it changes and
> expires with the lane's next lattice, which carries them itself. Since the
> same day the lattice is read with the corpus lane's delta over it
> (`data/lattice-delta/`, relay v208, read through
> `tools/lattice-delta-v1.mjs`; its lists stay on the lane's store, as the
> lattice does, and are named on the round's command line with
> `--lattice-delta`): a listed entry's cards that name its verse are the
> delta's list, which reads MACULA's readings and every TAHOT row where the
> lattice read part of TAHOT's alone, and each card the delta grades
> otherwise carries the page's grade. A tree that pins the delta is never
> projected without it. At the
> places where our text spells a word otherwise than the Leningrad text STEP
> follows and the corpus lane's spelling bridge cuts STEP's pieces onto our
> letters, a zone carries the place's pieces: our letters as the bridge cuts
> them, and for each piece STEP's own words for the place, as STEP writes them
> (`tools/apply-spelling-bridge-v1.mjs`, from the lists kept in
> `data/spelling-bridge/`, read through `tools/spelling-bridge-v1.mjs`).
> Since 21 November, at the 206 places where STEP's own spelling column names
> our spelling, each piece is worded by the form row named for the place.
> Since 22 November (ship 17), at the other places of new pieces too: bridge
> v1.1 (relay v214) gives each piece its part of STEP's column as STEP writes
> it, brackets kept, and the piece is worded by that part with its ends
> trimmed. v1.1 is read only where each of its lines, its added fields taken
> off, is v1's line, and only where the marks taken off each part give v1's
> English; at the 206 each form row's part is v1.1's part byte for byte, so
> nothing laid there moves. Since 23 November (ship 20) the list laid from
> is bridge v1.2 (relay v220), v1.1's lines with STEP's «{…}+» tags read as
> STEP's key says, read only where each of its lines, its added fields taken
> off and the changes it names set back, is v1.1's line; no laid place is
> among the 43 it mends, so nothing laid moves. The lattice reads STEP under the Leningrad
> spelling and gives these places nothing, so the line there was whatever row
> led under the key; with the pieces it is the place's own reading, as
> everywhere else. The pin says which of the list's kinds are laid and why
> each of the others is not; the places that are pairs keep a pair's
> line, and two kinds wait on call 4 of relay v189, read where call 4 itself
> is read (the audit calls' pin and the list the default picks' bake reads),
> never listed (22 November 2026): the places call 4 holds as they rest
> (STEP's words written with « | ») keep their line until the corpus lane
> says how STEP reads them, and the places where call 4 makes STEP's own
> reading stand keep it: the page asks STEP's reading before the place's
> pieces, so laid there the pieces read the place a second way beside the
> line, on its card and across words, until the page lane says how such a
> place is drawn (the owner ruled on 23 November 2026, «steps is fine»: STEP's
> reading governs there). The 42 places of new pieces held for STEP's «}+»
> tag until bridge v1.2 stand under these two holds now: 40 that call 4
> holds as they rest, 2 where STEP's reading stands. The rule's id and the pin's shape keep their
> versions (22 November 2026): no rule of the house asks either to move when a
> pin lays more of a list it names; the id's words name the class it was first
> laid at, and the pin names every class laid now. The round lays the pieces
> first in its zones step, before the line is read again: that reading takes a
> name's lead from a place's pieces, and so does the lattice projection. No tag
> is written.
> Since 15 November the rows call 5 of the corpus lane's audit calls names
> are struck or moved to their word's key by `tools/strike-rows-v1.mjs` from
> the lane's list, kept here byte for byte with the other calls'
> (`data/audit-calls/`, whose pin says how each call lands, and that calls 6
> and 2 are held and land nothing, with the reason: a row is set apart only
> on what its own source says of it; `tools/emit-call5-rekey-map-v1.mjs`
> writes, for the rows call 5 moved, the name each had and the name it
> has). The lane's
> landing list for the readings the store lost when a source that held their
> credit was struck whole (`data/fold-strike-landing/`) is landed as its own
> rule reads on the store it meets: `tools/derive-fold-strike-landing-v1.mjs`
> derives the list that lands and names every line that does not, with why,
> and the pin names both lists by their bytes. Every round is kept whole in
> `data/row-strikes-v1.json`. A made-spaces receipt that read a store no
> page served as such has its counts held by a second road, from that record
> (`tools/made-spaces-second-road-v1.mjs`). A step that changes the store
> may be given the moment it is recorded under (`tools/step-moment-v1.mjs`),
> so a step rehearsed on one tree is held, file by file, to the same step on
> the tree that ships. `tools/check-audit-calls-v1.mjs` and
> `tools/check-fold-strike-landing-v1.mjs` hold the store to the lists.
> A list read at an older store is laid on this one through
> `tools/row-strikes-follow-v1.mjs`, which follows each row the list names
> through that record and answers one of: served as named, moved to another
> key (with the name it has now), struck or withheld (with the round and its
> list), or, for a row the store holds now, landed since (no line of such a
> list is expected for it), or retexted since, at its key and rank under the
> words a round gave it (named by their sha16, with the words it was read
> with: row-strikes-follow-rule-v2, since ship 6); a retext that folded the
> row into another, a retext that names no words, and a row both moved to
> another key and retexted since are refused by name. The tools that lay
> the lane's facts on the
> rows (`tools/apply-row-entries-v1.mjs`, `tools/apply-name-rows-v1.mjs`,
> `tools/apply-sense-openings-v1.mjs`), the default picks' bake and the
> checks of each read through it, record in the store's index what they
> followed, and refuse what the record does not explain; the switch they had
> for a store that had moved on is gone. `tools/check-audit-calls-v1.mjs`
> asks it too where each row call 5 moved stands now, and walks no round of
> the record itself. Where a row was struck as the twin
> of a row of its own source (call 5: the same words under the key without
> the maqaf), that row takes the entries the struck row's line alone carried,
> and the index names each pair.
> Since 15 November 2026 a record files every dictionary by what it says
> it is and names what rests shut on the cards of the thirty-nine books
> (`data/dictionary-kinds-v1.json`, read through
> `tools/dictionary-kinds-v1.mjs`): the word lists, knowledge bases and
> encyclopedia titles, and what English Wiktionary files as a name. It is an
> input of the round's zones and lattice steps. `tools/regloss-zone.mjs` and
> `tools/project-lattice-v12-v1.mjs` ask the record's scope of each zone's
> own fields, and for a book it holds they open the store through
> `openRouteStore(…, { atRest: true })` (`tools/gloss-store-v1.mjs`): the
> line under a word, every column beside it and every leader the sidecar
> bakes read only the rows that rest open (the entry gate, asked for a
> leader at a kind of place, gathers BDB's own entries from every row of the key,
> as the page does, since 23 November 2026, when rows that rest shut began
> to carry them), a word carries no headword's
> reading (hg, the line under «the headword») whose lattice card is of a
> source shut whole or that its source gives only in rows that rest shut,
> a witnessed reading the corpus lane credited to a shut source is
> credited from the store at rest, and
> the zone (`emitted_from.rests_off`, with what each resting entry holds
> shut on the book) and the sidecar (`rests_off`) name the record by its
> sha256. Every other zone (the Tikkunei Zohar, a Targum beside a book, a
> fixture) is projected over the store whole, as before, and the lattice
> step refuses a book whose zone was not projected at rest under the same
> record. The search index leaves out the rows a category inside a source
> rests shut (`tools/bake-search-index-v1.mjs`, `rests_off.facts_left_out`);
> a whole source stays in it, and the page leaves it out while it rests
> shut, on the page of any work, since every place the index answers is of
> a book at rest.
> Ship 5 (calls 7, 4 and 3 of the corpus lane's relay v189 and question 12,
> as the lead landed them on 15 November 2026) adds no step to the round.
> On the books the record holds, Strong's sign follows:
> `openRouteStore(…, { atRest, signLast })` puts a reading that carries it (the source-signs ledger's
> STRONG_SIGN at its head, or the sign held alone in a round bracket there,
> «(+) archer», which the M14 declaration sets on that rendering;
> `opensWithStrongSign`) after every reading that does not, the first key
> of every order, a sort and never a filter (zone-gloss-rule-v8). The zones
> step bakes the zone, its columns and its sidecar's leaders so (the sidecar's
> o.m and o.x and the headword's line hg take the sign first too), and both
> carry the stamp `emitted_from.signs_rest_last` (`signsRestLastStamp`); the
> lattice step refuses a zone whose stamp is not the one it would make. The
> witnessed bake refuses an entry whose row prints only signed renderings
> where the key's pool at rest holds a plain one (its rule v2; the receipt
> lists the keys, `strongs_sign_refused_keys`), so the line under that order
> reads the table there. The page carries the same predicate between markers
> and orders a card so in every position of the signs switch on a zone that
> carries the stamp; the Tikkunei Zohar and a Targum beside a book keep
> today's order (`tools/check-sign-does-not-lead-v1.mjs`). UBS's own
> collocation mark is a kind of the record: `tools/derive-ubs-collocations-v1.mjs`
> reads UBS's own file and the catalog's route file (both on the corpus
> lane's store, named in `data/ubs-collocations/PIN.json` by their bytes and
> sha256, and given on the command line) and the default picks' ledger, and
> writes the rows of UBS's category with the places UBS's own pick names
> each (`data/ubs-collocations/`, the bytes the pin names);
> `tools/apply-ubs-collocations-v1.mjs` lays them on the rows as the facts
> `collocations` and `picked_at`, through the row-strikes follower, and
> records itself under the store index's `ubs_collocations`. The record's
> entry `ubs-collocation` rests those rows shut and stands each at the places
> its own `picked_at` names (`stands_at`): the bakes ask the rule with no
> place, so no line reads such a row, and the card asks it at the place of
> the word it is open on. The facts slot names its keys and the tool that
> writes each (`FACTS_WRITTEN_BY`). The two run once, as store steps, before
> the round and never by it, and the form-of record is baked again after
> them (`tools/bake-form-of-pills-v1.mjs`, which reads the store at rest and
> records question 12's one pill as `one_pill`; the page folds a pointer's
> pill into the reading its resolution prints). The category holds no
> name row, so a new list of name rows is followed by the category derived
> and laid again, before the round (names v2: three rows relay v188 landed
> were marked names and left it, 2,646 rows on 762 keys);
> `tools/check-dictionary-kinds-v1.mjs` K6 refuses a store where a row
> carries its collocations beside a name. Call 4: the default picks'
> bake stands STEP's own pick 1 as the line under STEP, credited to STEP,
> whatever today's line is, at the places STEP spells or parts the word
> otherwise (the index's `step_words` rows `[n, words, 1]`; the places it
> writes with « | », those the list makes no line of, and a read form of
> several words are held by class, and its receipt counts them,
> `steps_reading_stands`). Call 3 is the page's: a run keeps its joined line
> only where some word of it has no reading of its own at the place (its
> place pieces, or a place where STEP's reading stands), and every other run
> reads word by word, the joined reading a press away; relay v181's list of
> the lines over several words is kept in `data/audit-calls/lines-and-pills-v1/`.
> `data/audit-calls/PIN.json` names how each of calls 7, 4 and 3 lands and
> under which rule (its `rule_id` and `landings`), and
> `tools/check-audit-calls-v1.mjs` (A10 to A12) and the gate read it.
> The words a source's line reads (`default-spans-rule-v1`, relay v209): the
> corpus lane's spans list gives, for every default-pick line, the first and
> the last word the line reads by its own source's data. Its rule and
> receipts are kept in `data/default-picks/spans-v1/` and named by the pin
> there; the list stays on the lane's store beside the default picks and is
> read through `--default-picks` (`spans-v1/`), by `tools/default-spans-v1.mjs`
> alone. The default picks' bake lays, in each book's file, the units of two
> or more words that MACULA's, UBS's and BDB's first pick reads (`spans`),
> each line proved to be the pick the bake read at its place. The page reads
> a unit's words as one under that source set first: one line over them in
> one cell, each word as it rests where they stand apart. Nothing at rest
> moves. `tools/check-default-spans-v1.mjs` holds the pin, the book files
> and the page under each source, and the gate takes the spans as owed
> lines under a source pressed.
> Ship 6 (relay v187, the unabridged BDB's words back, under the owner's
> questions 17 and 18 of 14 November 2026) moves no line and no pill, and
> adds no step to the round. The lane's folder is kept byte for byte
> (`data/made-spaces/words-back-v1/`). `tools/derive-words-back-v1.mjs`
> proves every line of it again on the store it meets and derives, only as
> the bytes `data/made-spaces/PIN.json` names (`words_back.derived`), the
> rows that land and the rows held, the ones whose printed text sets a
> Hebrew character directly against a Latin letter or a digit among them
> (words-back-landing-rule-v1). `tools/strike-rows-v1.mjs` (row-strike-rule-v7)
> lands that list as a retext from the slot `words_back`: the words in both
> of the row's texts and its closes in slot 9, its facts and the rest of the
> row kept, the old row recorded whole, never folded, and a line refused
> whose words, closes or sense do not stand as it says. After it the ledgers'
> divisions are derived again, `tools/apply-made-spaces-v1.mjs` takes a
> retexted row's closes from the derived list (counted apart), the facts
> tools lay their lists again through the follower, which finds each
> retexted row under its new words, and the form-of record is baked again:
> store steps, each run once before the round. In the round, the lattice
> projection follows a row the binyan files name by its old words through
> the retext to the words it serves now (`followed_through_retexts`).
> `tools/check-words-back-v1.mjs` holds the landing.
> Ship 11c (the corpus lane's relays v200, v201 and v202 of 20 November
> 2026: the landings that need no ruling) adds no step to the round. Each of
> the lane's lists is kept byte for byte in its own folder
> (`data/landings/`), and `data/landings/PIN.json` names them in the order
> they land. `tools/derive-landings-v1.mjs` proves every line of a list
> again on the store it meets when its turn comes and derives, only as the
> bytes the pin names, the rows that land and the lines not landed: a line
> its own source already prints under its key is named, not landed; a line
> with no rank takes the highest rank under its key plus one; lines of one
> source with the same words under one key are one row (landings-rule-v1).
> `tools/strike-rows-v1.mjs` (row-strike-rule-v8) lands each derived list,
> and a landing writes onto its row the entries its line names (`n`, `t`,
> `b`), which the row-strikes record keeps with the row. After the landings
> the store steps run once each, before the round and never by it, in this
> order: the ledgers' divisions; the made spaces, whose second road counts a
> row a later list landed as a row more
> (`tools/made-spaces-second-road-v1.mjs`); the own pointing; the row
> entries, which leave a landed row's entries to its landing and give a row
> landed back under the key a struck row's words stand under what that row's
> line alone said; the name rows; the sense openings; UBS's collocation
> rows. Then the form-of record is baked again.
> `tools/check-landings-v1.mjs` holds the landings: every line accounted for
> once, one round per list in the pin's order, and each landed line standing
> as its row with its entries.
> Ship 16 (the corpus lane's relay v210 of 21 November 2026, which corrects
> its relay v207: the rows our own label struck, judged again by what each
> row's own source says, under the source ledger v1.1) adds no step to the
> round either. A source the language admission struck
> returns by `tools/readmit-sources-v1.mjs` (readmission-rule-v1), run once
> before its rows land: `data/readmission-v1.json` names each returning
> source with what its own source says it is, the languages that names and
> its index entry as the store held it; the tool puts the entry back with
> those languages (the admission reads them before any label), moves the
> source from the struck to the re-admitted in the index, and marks it in
> the admission's record. The strike's own figures stand: 49 sources were
> struck. A source returns whole, or for its listed rows alone where each
> row's own language field decides: English Wiktionary's translation
> tables (M78, M103) return so, for the 126 rows the ledger v1.1 admits
> (124 landed with the list; the two it held by their line land since
> 23 November 2026, below).
> Only the landings write rows, and
> `tools/project-lattice-v12-v1.mjs` takes a lattice card of such a source
> for the headword's line only where a served row of that source speaks it.
> The lists of this relay are lists of HOLES (`a_named_rank_is` in the pin):
> a line's rank is the hole its row left, which the struck-ranks record
> must hold for that source under that key; the row lands at it, or, where
> another row stands at the hole now, after the last row and the last typed
> hole of its key, as a line with no rank does. A large list is kept
> gzipped and weighed as the bytes it holds (`tools/pinned-v1.mjs`). A
> list's pin may hold sources back (`held_sources`, each with why): every
> line of such a source is named not landed, held with its source, and
> nothing of it lands. PanLex's lines of the own-language list (M24, M82)
> wait so on the Zohar's prefix split, and the record names PanLex as held,
> so it stays struck. A pin may also hold back single lines (`held_lines`,
> each its source, key, words and why, matched to exactly one line of the
> list): two of the translation tables' rows that read wrongly at the
> Targum's places wait so for the corpus lane, each named not landed, held
> by its line, and counted in the record as a listed row not served.
> The corpus lane's relay v221 (ship 18, 23 November 2026) found both right
> as English Wiktionary's own words and the Targum's word at their places
> another word written alike, and lets them go (`let_go` on each held line,
> by relay and why): they land in a list of the pin that RE-READS the list
> v1.1 (`re_reads`: the same rule, receipt and list, derived again on the
> store after it landed), which lands exactly the lines let go to it, while
> every line that landed before is printed by its own source and PanLex's
> stay held with their source. The record counts them as let go
> (`held_lines_let_go`), and the source record as served. A row may be held
> at a place instead (`place-hold-rule-v1`): a row of the translation tables
> names a spelling and no place, and the commentary zones carry no tag or
> grade that parts it from another word written alike. The lane's resting
> call for every row of the tables at every place of the Targum and the
> Zohar is kept byte for byte in `data/held-places/` (relay v221; the list
> gzipped). At each place it marks held at rest, found on our commentary
> zone by the row, the work, the verse unit and the key (the lane's token
> row is its own edition's), `tools/apply-held-places-v1.mjs`, in the
> round's zones step right after the commentary's line is read again, writes
> on the word the rows held there and the line the place reads without them
> (`ph`); the reader draws that line there and keeps the rows off the word's
> card under «only this pointing», counted as the names gate counts its own;
> they stand at every other place. The lane's two branches (WIDE_HOLD and the
> corpus hold on a points tie) are off at rest and hold nothing. A held
> place of a work no zone serves (Onkelos, the other Targumim, the Zohar and
> Zohar Chadash) is named in the pin as not served, with why.
> `tools/check-held-places-v1.mjs` holds every held place to the zones.
> Harkavy's list (withdrawn by the lane, refused by the
> owner) and the Bible dictionaries' (the owner's to add) are not pinned;
> the record names both, with why. The ledgers' manifest says why a
> returning source has no ledger (`excluded`), and the kinds record files
> its key. `data/source-corpus-v1.json` is emitted from the source ledger
> v1.1, and `tools/check-source-corpus-v1.mjs` holds a witness of a label
> the ledger judges row by row (BY_ROW) to the rows its `admitted_rows`
> names, by m, key and words.
> `tools/check-readmission-v1.mjs` holds the re-admission: the record
> against the lists, the index, the admission's record, and every row of a
> returning source a landed line's. `tools/strike-language-v1.mjs` keeps a
> re-admission when it is run again.
> Ship 7's span grade (relay v169, under the owner's card 1 of 16 November
> 2026 and task 134) adds no step to the round. The lane's grade of every
> row at every place where the span store joins words is kept byte for byte
> (`data/span-grade/`), and `tools/apply-span-grade-v1.mjs`, a store step
> run once, writes on each place of the span store's book files the rows it
> holds back under «only this pointing» (`held`: a row with no pointing, and
> a row pointed otherwise where STEP's own tags on the place's words name
> separate entries), records itself under the span store index's
> `span_grade` and writes `data/span-grade-receipt-v1.json`. The page reads
> `held` off the place a run's card stands on, never off the key; a span
> row is ordered as every row is; and a pointer (a form_of row) leads no
> joined line. `tools/check-span-grade-v1.mjs` holds the grade and the cards.
> `PIPELINE-MANIFEST.md` is generated from the code and the
> published bins on every round and says what is declared, what is guarded,
> and which tool wrote which bins. The sections below are kept as the record
> of why the rules are what they are.
>
> Since 23 November 2026 the corpus lane's store keeps its text files
> compressed (its store cut of 22 November). A file this document says stays
> on the lane's store, and every other store address a pin or record here
> names, now stands as the same address with `.gz` after it, or as a member
> of a part, or (16 superseded files) in this repository or on the lane's own
> disk: `data/store-path-map-v1.json`, its section `after_the_cut`, says
> which, from the lane's two lists kept in `data/store-path-map/`, every file
> held to the bytes its list names. The round reads no store address: its
> inputs are local copies held to the bytes their pins name, and no pin or
> record is rewritten for the move.

As recorded on 2026-08-15: run `./build.sh` and every published byte is
rebuilt from sealed inputs. Run it twice and the outputs are byte-identical.
Nothing here edits a zone after it is written, and nothing reaches for text
the corpus lane has not sealed.

Recorded 2026-08-15. Component layer and the deep catalog added 2026-08-16.

## Why this exists

The Orot zone could not be rebuilt. It was produced by running four patch
scripts in sequence over the same file — `patch-orot-gloss`, `patch-bins`,
`patch-orot-envelope`, `patch-bins-v3`, `patch-orot-titles`, `patch-nodenums` —
each mutating the output of the last. That file was an heirloom, not an output.
A gloss rule lived in a page rather than in a script, so it could not be
reviewed or diffed. A mirror of the sealed corpus was assembled by hand: copy a
file, run, see what breaks, copy another.

Every one of those is now a script with its rule declared at the top of it.

## The stages

| # | Script | In | Out |
|---|---|---|---|
| 0 | `tools/plan-mirror.mjs` | the chain's shard indexes | the exact file list the resident reader needs |
| 1 | `tools/mishkan-serve-v1.mjs` | a C0 range, the sealed mirror | one NDJSON row per occurrence, oracle-checked |
| 2 | `tools/build-route-store.mjs` | the sealed definition packages | 256 gzip shards, keyed by exact K |
| 2b | `tools/regloss-zone.mjs` | a zone + a store + the record of dictionary kinds | the same zone re-projected onto the store (at rest for a book the record holds) |
| 3 | `tools/extract-y-nodes.mjs` | the Y navigation ledger | a work's title words, verbatim |
| 3b | `tools/span-slice-v1.mjs` | the COMPspan template | each form's component list, for the forms one book contains |
| 4 | `tools/build-zone.mjs` | 1 + 2 + 3 + 3b + the identity bridge | `<book>.bin` |
| 5 | `tools/build-commentary-zone.mjs` | two serves + the bridge | `<book>.commentary.bin` |
| 6 | `tools/verify-zone.mjs` | the built site | pass/fail against the rendered DOM |

Rules that used to be implicit now live in one file each, quoted from the
authority that governs them:

- `tools/k-normalization-v1.mjs` — exact K, `definition-poc/FRAME.md` rule 7.
- `tools/gloss-store-v1.mjs` — which reading is printed under a word,
  `synthesis-default-gloss-rule-v2-antiquity-primacy-1940-lastuary` at sense
  level, as attested 2026-08-10.
- `tools/span-slice-v1.mjs` — how a form divides, read from
  `w-to-compspan-template-v6` and never invented here.

## The maqaf

Genesis shipped with the wrong key rule. The builder stripped the maqaf before
looking a word up, which fuses two written words into one and asks the catalog
about a form nobody wrote. FRAME rule 7 says the opposite: K removes niqqud,
cantillation, bidi controls, sof pasuq and paseq, and *preserves* Hebrew
letters, abbreviation punctuation, and boundary maqaf.

131 word instances across 65 distinct forms were affected. What the page showed:

| written | fused key | printed |
|---|---|---|
| אֶל־קַיִן "to Cain" | אלקין | a hydrocarbon with a triple bond between two carbon atoms |
| אֶל־גְּבִרְתָּהּ "to her mistress" | אלגברתך | algebra |
| כִּי־אִם | כיאם | khayyam |
| עַל־עֵין | עלעין | rib |
| בֹּא־נָא | באנא | nose |

On 1 Kings the same rule would have printed **crowley** under קִרְאוּ־לִי.

Keying correctly stopped the page asking about fused forms, and left 1,828
occurrences of 1 Kings bare,
because `אל־קין` is not a key the catalog holds. That was the state as of
2026-08-15, and it was incomplete rather than wrong: the W inventory records
the pieces either side of a maqaf as **separate W**, so the reader was asking
about a form the ledger never claimed existed.

The rule now is the ledger's own: **the block on the page is the occurrence,
and what is clickable inside it is whatever the ledger says the occurrence
contains.** An occurrence written with a maqaf prints as one word, holds two W,
and each of them opens on its own. Nothing is glued, nothing is folded, and no
new identity is minted — the two W were already in the inventory under their
own keys.

The regions are cut from the printed surface rather than rebuilt from the key,
so a region is always a substring of what the page shows, and the builder
refuses if the pieces do not rejoin to the exact K. An edge maqaf — `לחם־`,
seven occurrences in this work — yields one W and a maqaf that belongs to the
next occurrence; it prints, and it does not open, because it is not a W.

Measured on 1 Kings: 4,297 distinct whole-surface forms, of which 3,085 (71.8%)
have a component system in the ledger. Reading the same text as W: 3,494 forms,
of which 3,486 (99.8%) do. The eight that do not are listed under *Open* below.

## The component system

A W's COMPspan is its attested component list, and it is determinable without
any definition work at all — no L, no D, no M. Everything the card offers
follows from that list by arithmetic:

- **n(n+1)/2 blocks** — every contiguous run of components.
- **2^(n-1) complete divisions** — every way of cutting the form so that each
  component is used exactly once and none is used twice.

Neither is stored. The zone ships the component list and the reader computes
the rest, which is why the whole layer costs 62 KB gzipped on 1 Kings.

The derivation was checked against the ledger rather than assumed: for the
6,193 forms these two books contain, `w-to-compcell-template-v6` holds 27,323
cell rows, and all 27,323 match the derived surface exactly, every form has
exactly n(n+1)/2 of them, and every maximal cell equals its own key.

The catalog is keyed by **cell surface**, not by whole word. That is the gain:
1 Kings' forms expand to 6,492 distinct cell surfaces, of which 5,748 carry
readings — so a reader can open ה inside והמלך and get what the sources attest
for ה, which was previously unreachable.

The card opens on the whole W, one block, first reading, because a complete
word is what a reader came for. Every finer division is one tap away and none
is hidden.

**On the boundaries.** 5,025 of the 6,193 forms carry
`formulaic_clitic_candidate_v1` boundaries, 84 carry
`stepbible_tahot_explicit_source_alignment_v1`, and 1,084 are single-component.
The formulaic pass over-splits: it offers `מקום` as `מ + קו + ם` and `הכהנים`
as `ה + כ + ה + ני + ם`. The card says where the boundaries came from and says
nothing else about them. That line is provenance on the cut, not a verdict on
any reading the cut makes reachable — a reading is removed by its licence and
by nothing else. Over-splitting is also the recoverable direction: the correct
coarser cut is still one of the complete divisions, and it is the one the card
opens on.

## Commentary

The Genesis sidecar was fetched from outside the corpus: no C0 identity, no
chain receipts, no route the corpus lane could check. 1 Kings takes the other
road. **Targum Jonathan on I Kings** is a work in the sealed chain, served
id-by-id by the same resident reader, verified against the same identity
bridge, and attached to the base text by the coordinates both works already
carry in their sealed unit ids: `i-kings-7-14` receives
`targum-jonathan-on-i-kings-7-14`.

817 of 817 sections carry it. Every commentary unit found its section and no
commentary unit was orphaned — the builder refuses to emit if either side is
short. It ships as words rather than as a paragraph, so the Targum's own text
is tappable and answers from the same catalog: 9,686 of its 13,651 words carry
a reading. Its licence is its own, computed from its own rows (Public Domain,
`LIC-PUBLIC-DOMAIN-PROVIDER-ASSERTED`), and nothing inherits from the base text.

## The commentary belongs to the book

Targum Jonathan on I Kings is the only commentary the sealed chain carries for
this book — for any book of Nevi'im, in fact. Eleven works that would attach to
I Kings are not in the corpus: **Radak, Metzudat David, Metzudat Zion, Minchat
Shai and Malbim are marked `CURRENT_PRESENT` and are absent** (the Malbim row
matched `tanakh/malbim-ayelet-hashachar`, a different book — the same
title-collision fault as the Bavli tractates), and **Rashi, Ralbag, Abarbanel,
Chomat Anakh, Marot HaTzoveot and Steinsaltz on I Kings are queued at
`V_ATTACHMENT_REVIEW_NOT_COUNTED_B`** and deferred. Both are the corpus lane's
to repair; this builder attaches any of them the day they exist, because the
rule is coordinate identity and needs nothing added.

A commentary is not a book of its own. It is *served* like one — the same
walker, the same identity oracle, the same component system, 817 units and
13,651 words verified against the bridge — and then it belongs to the sections
it comments on, which is where a reader meets it. Organizationally a commentary
work may span several books; for a reader it combines into whichever book they
have open.

So the reader carries a layer rather than a second book. Turned on, Targum
Jonathan reads beneath each verse of I Kings in the same word blocks, a size
down and behind a rule so the base text stays the text: **817 rows, 13,651
words, 9,686 carrying a reading**, every one of them tappable and answering
from the same catalog with its own definition, source and licence. The layer is
built once on first use — 855 ms for the whole book — and the per-verse card
stays for the attachment receipt.

Nothing inherits. The Targum's licence is its own (Public Domain), computed
from its own rows, and it is named on every row of the layer.

## Titles

A title is corpus text, so its words need their own definition and source
records before this page prints one. Genesis has a promoted Y node and its
chapter titles are the ledger's words with the ledger's own keys. 1 Kings does
not: Y version 1 materializes Genesis only, and the 37-work Tanakh extension is
a validated candidate that has not been promoted. So 1 Kings carries English
locators — "Chapter 7 · 51 verses" — read out of the sealed unit id, and no
title in either language. No Hebrew numeral is invented to fill the gap.

Where the ledger marks a token as a NUMBER, it carries no lexical key. The
ledger is explicit about this: a `CHAPTER_NUMBER` token has an empty
`selected_gloss` and a pointer basis of
`REUSED_EXACT_NORMALIZED_W_C0_POINTER__NOT_A_NEW_C0_OCCURRENCE`. It reuses a
letter's identity to name a number. Handed to the catalog it would print *the*
under chapter א׳ — the catalog answering correctly about a word nobody wrote.

## The top-five gate

The route store used to ship only rows the definition package flags
`selected_visible_top5` — at most five routes per form. For the 6,490 surfaces
I Kings can open, that dropped **110,151 of 132,717 routes: 83% of the
catalog**. `נשא` carries 448 and a reader met 5.

Every one of the dropped rows was checked, and every one is licensed: 0 missing
route text, 0 missing definition text, 0 missing M, 0 with an M short of a
source key, label, licence posture or pointer. CC BY 4.0 (33,641), CC BY-SA
(14,307), public domain (35,491 across three postures), CC0, and the rest. The
earlier build's `refused: 0` was not evidence they were sound — the flag test
ran one line *above* the licence test, so those rows were never examined.

The flag is a ranking, not a licence. Nothing but a licence removes a reading,
so rule 2 now ships every route with a complete M record and lets
`semantic_route_rank` order them rather than gate them. **646,441 routes over
140,532 keys, 13.1 MB gzipped, largest shard 68 KB.** דוד goes from 5 readings
to 115, בא to 165, and Genesis's ב to 249.

Two consequences, both handled:

**The default reading moves.** Rule v3 orders antiquity first and the catalog's
own `semantic_route_rank` only third. With five routes that hardly showed; with
a hundred and thirty it decides throughout. Every leader before and after is a
licensed reading from a named source, so what changed is which attested reading
prints first, and nothing here ranks them. Rule v3 has not been changed.

**A shared store desynchronises every zone.** A zone bakes one reading per key
so the page paints without fetching 256 shards, while the card computes from
the store live. Move one and not the other and the printed word disagrees with
the pressed pill — 55.6% of Genesis's words, 53.6% of Orot's. So every zone was
re-emitted or re-projected: Genesis and I Kings rebuilt from their serves,
Orot — which came through the acquisition route and cannot be re-served here —
re-projected by `regloss-zone.mjs`, which recomputes only the gloss layer and
copies everything else through untouched.

## Cache, and why a shard is addressed by its store

Deploying a moved store is not enough. A reader whose browser holds yesterday's
shard keeps being answered from it while the page prints today's reading, and
the two disagree on screen exactly as if the zone had never been rebuilt.

So the index now carries a `store_version` derived from its input hashes, its
rule id and its route count, and every shard URL carries that version. The
index itself is the one file that must never be stale, and it is fetched with
`cache: "no-cache"` — a conditional request that costs a 304 when nothing has
moved. Everything downstream is then addressed by which store it belongs to
rather than by name alone.

## What is published

| | occurrences | W | sections | reading | notes |
|---|---|---|---|---|---|
| Genesis | 17,807 | 20,691 | 1,533 | 17,729 | 50 chapters, Y titles, 56 held, no component layer |
| I Kings | 11,368 | 12,883 | 817 | 10,969 | 22 chapters, locators only, 377 held |
| Targum Jonathan on I Kings | 13,651 | 13,651 | 817 | 9,686 | a layer of I Kings, not a book |
| Orot | 59,759 | 59,759 | 416 | 45,957 | acquisition route, 6 declared drifted units, re-projected |

Genesis gained 2,816 reading words from the maqaf rule alone — it had the same
defect I Kings did, and 2,835 of its occurrences hold more than one W.

I Kings gained 1,826 reading words against 2026-08-15 — the maqaf occurrences,
which were bare and are now two words each. The component layer adds no words
to that count; it adds 2,300-odd sub-word surfaces the reader can open, which
the count of glossed *words* cannot show.

Component layer, I Kings: 3,424 distinct forms, widths 1×460, 2×1,422, 3×1,123,
4×317, 5×102 — 16,164 blocks and 11,964 complete divisions, all derived.
Targum Jonathan: 3,239 forms, and its distinct forms carrying a reading go from
1,804 to 3,284 once the catalog is asked per block.

Every unit verified against the bridge on count, C0 range and ordinals:
1,533/1,533 and 817/817, no drift. Sealed-CLI oracle: 24/24 field-exact on each
serve.

## Open, and not decided here

1. **Which reading leads is decided by rule v3, and rule v3 is not visible on
   the card.** The order is tier (source year ≤ 1940 first), then year, then
   the catalog's `semantic_route_rank`. The card names the source and year of
   the reading a reader has selected; it does not say that antiquity is why
   that one led. Every reading is licensed and every one is one tap away, so
   nothing is hidden — but the basis of the default is inferable rather than
   stated. Making it stated is a fidelity question, not a ranking one.
2. **Genesis still carries its fetched commentary sidecar.** It was not built
   from the corpus and was never authorized. It has been left exactly as
   deployed rather than removed on my own initiative.
3. **Orot is untouched.** Its gap is A-0017 in the acquisition ledger, and the
   slice that closes it is `hewikisource`. The federation slice sealed
   2026-08-13 does not include it.
4. **Eight W of 1 Kings have no component system, and six of them are a C0
   defect.** Three carry a MAM section marker fused to the next word
   (`<span class="mam-spi-samekh">{ס}</span>&nbsp;…יְהוֹשָׁפָט` at 4:3, and the
   same at 4:5 and 4:6) and three carry ketiv markup (`(מירכותי)` 6:16,
   `(שושק)` 14:25, `(ובשגיב)` 16:34). Source HTML is inside the occurrence
   surface and was tokenized on whitespace with it. 377 occurrences of this
   book — 3.3% — carry markup this way; the chain's own script rule catches
   every one of them as `SCRIPT-UNRESOLVED-V1` and the page holds them dark, so
   nothing false is printed, but the underlying C0 is wrong and this page
   cannot fix it. The W inventory is clean: it carries no markup key at all.
   The two genuine absences are `וַיּוֹרִדֻהוּ` (1:53) and `כַּצִּדֹנִים` (5:20).
5. **The deep catalog moved which reading leads, on most words.** With five
   routes per form the order rarely changed anything; with up to 448 it
   decides the default throughout — 1,478 of Genesis's 4,464 forms, 55.6% of
   its printed words. Rule v3 produced both the old leader and the new one
   from licensed sources, so this is a record of a change, not of a fault.
6. **Genesis has no component layer.** Retrofitting a published book changes
   what every word on it offers, so `build.sh` builds Genesis without `--spans`
   deliberately. The page reads a zone with no component layer as whole forms
   only and says so in its own receipts; that path is verified.
