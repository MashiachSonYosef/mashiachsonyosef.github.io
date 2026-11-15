# Kinds shut at rest: the pipeline and the measure

15 November 2026. The pipeline part of the design (workflow kinds-shut-at-rest-design). Everything here is read only, from the tree main 46bbbf7d50 at `scratchpad/rt`. The scripts and their outputs are in `scratchpad/v70/pipeline/` (the full path is `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v70/pipeline/`). An earlier run of this part was stopped partway. Its scripts (lib.mjs, gates.mjs, validate-leaders.mjs, credited.mjs, chain-pills.mjs) were read, checked, and reused here. It had left no notes.

## Which dictionaries are in the shut kind

The table now exists: `../TABLE-what-each-dictionary-is.md`. `MEASURES-what-each-kind-supplies.md` does not exist yet. Two memberships are measured:

- **A, the brief's six families.** PanLex (M21, M42), ConceptNet (M1, M32), OmegaWiki (M6), MUSE (M16 and the others under muse_), Hebrew Wikipedia's titles (M15) and Lexibank (M64). Membership is decided by the store's own source key (`lib.mjs`, `familyOf`).
- **B, the table's three kinds.** B is A plus Wikidata, Hebrew WordNet and English Wiktionary's translation tables (M34, M37). The table files these three kinds as word-pair-list, knowledge-base and encyclopedia-titles, and its kind column puts Wikidata, Hebrew WordNet and M34/M37 there too.

2b, the category: a `kaikki_wiktionary_hebrew` row (M11, M13, M25, M50, M69) whose facts slot carries `name`. The store holds 1,590 such rows, counted by one pass over all 256 shards. The measure runs AN = A + 2b and BN = B + 2b.

## 1. The tools that bake or pin what the page shows at rest

| tool | what it bakes | where it gets "rest" | what it needs if the kind rests shut |
|---|---|---|---|
| `tools/regloss-zone.mjs` | zone.gloss (the table, oldest-first over every admitted row), gloss_m (`by` lists every carrier and `alt` is the reading once they are all off), and the switch costs `emitted_from.toggles.sources` (per chip and per shelf, `jointSwitchCosts` in `gloss-m-v1.mjs` l.249) | **its own rule**: `store.tableFor`, with no gates and no defaults | The table is the line only for ungraded words and the names lead; the page answers sources that are off through `alt`, then bare (zone.html l.13132). Nothing has to be re-baked for A or B carried as sources that rest off. Two changes need it: a "kind" shelf on the rail must be priced (`shelfOf` in gloss-m-v1.mjs l.260 has century, language and license; check-source-switch S1f wants every shelf to carry its baked joint price, never a sum), and so must a table that drops the shut kind. Re-baking means rerunning the zones step. |
| `tools/project-lattice-v12-v1.mjs` | The sidecar's leaders under "only": o.l and o.la, plus e[place key].l/la per entry and name place. `leadersAt` is at l.366, its keep test at l.369 (entry gate, `nameWithheld`, pointing, stem). | **its own copy of the page's gates** (the keep test), checked against the page by its checks; my rebuild of it agrees with the baked o.l at 183,430 of 183,434 asks | Today the page meets sources that are off with l, then la, then bare (zone.html l.13111-13125). It never looks for a third leader. A true re-lead needs the projector to bake leaders over the rows that are open at rest, beside the leaders over every row for when the kind is opened. 2b cannot be done any other way: it is a filter on rows, not an M id, so `sourcesOff` cannot express it. This means rerunning the lattice step (the longest). |
| `tools/bake-resting-lines-v1.mjs` with `resting-lines-v1.mjs` | data/resting-lines/<work>.json.gz: what the page drew on a first visit, with credits | **the page, in a browser**. It records `state.sources_off` (today `["MSAM2"]`, from source-defaults-v1.json) and refuses only a default-picks leak (`defaultsNotAtRest` l.90) | Nothing in the code. Every record names the files its page read (read_off.files by sha256), so a new or changed record file makes all 40 records read again. |
| `tools/build-chain-book-v2.mjs` with `card-readings-v1.mjs` | chain/<book>/chain-v1.json.gz for 12 books: every card read off the page twice, at rest and lifted | **the page**. The "lifted" state is set by `state.keep` localStorage keys (card-readings-v1.mjs l.187) and means "every source on" | Lifted must also open the shut kind and 2b. If the open choice is a new storage key or switch, card-readings has to set it. Otherwise "lifted" is no longer lifted, and check-chain-book-v2 l.176 compares `sources_off` against what it expects. All 12 books are read again (16 min). |
| `tools/bake-search-index-v1.mjs` | the en/he search index: per English reading the places "all sources together and each on its own" | **its own pass** over the store and the page's reading functions (page-reading-v1.mjs) | A and B work as they are: the page leaves out sources that are off, and check-search l.428 already says "a source the owner rests off ... is left out of every count here as the page leaves it out". 2b does not: the index counts per source, not per category, so a Kaikki «name» pill can still be found. It needs a per-category count, or the search has to say so. |
| `tools/bake-default-picks-v1.mjs` | data/default-picks (STEP, MACULA, UBS, BDB, and the second source) | **the corpus lane's ledger plus the resting-line records**: where STEP's line is bare, and the lines over more than one word | No member of A or B is a default source. The resting lines move at 29-39 places (§3), all of them lines credited to the store, not to STEP. check-default-picks D3 holds the index to the records. Whether D3 goes red at those places is **not established**. The round says that if it does, the defaults are baked again after the lines. |
| `tools/build-front-door-v1.mjs` | each chapter page's plain list | **the resting-line records** (refuses a record not of this tree) | Nothing in the code. It is rebuilt after the lines. |
| count stamps (`restamp-zone-v1.mjs`, `check-bookword-count-v1.mjs --write`, `check-c0-refusals-v1.mjs --write`) | word, letter and verse counts against the witness record | the zone's words | Not touched: no word leaves the text. |
| `emit-zone-store-v1`, `emit-store-manifest-v1`, `bake-overlay-book-counts-v1`, `emit-lane-state-v1`, `emit-ledger-index-v1`, `pipeline-manifest-v1` | manifests and pins | the files | They follow whatever moved. |
| `tools/round-v1.sh` | the steps zones, stamps, search, defaults, records, lines, chain, door (l.54) | n/a | See §4. |

**The one rule the page already has.** `data/source-defaults-v1.json` (source-defaults-rule-v1) rests sources off by their source key. zone.html l.4383-4390 gives each reader that record's defaults once per version (key `fh.sources.defaults`). A reader who turns one back on keeps it on. The line, the pool (`readingPool(..., omit)`), the span line (`spanRowsOn` l.4047), the place line (l.13060/13073) and the withheld count on the card (l.10472, 11063) all follow `sourcesOff`. So A or B can rest shut with no new code on the line or the pool: add a row per source key to that record, or have the page read dictionary-kinds-v1.json into the same set. Those are the lead's words for the record, which also carries the category. 2b needs new code wherever the gates are typed: the page's pool gate, the projector's `leadersAt` keep test, and gates.mjs here. The record should name it as data: (source key, fact, value). Today the only fact a row carries for a category is `name`. A later category such as a label, topic or part of speech becomes "one line of data" only once the store's facts slot carries it. The table's "It has, and no row carries" column lists those facts: for Kaikki, the binyan, period labels, form-of, alt-of, topics. Until then a later category means one apply tool (like `apply-name-rows-v1.mjs`) per fact, not new gate code.

## 2. The checks that pin the resting state

Found with a grep for `sources_off|sourcesOff|source-defaults|fh.sources` (24 tools), plus the ones the brief names. **Watch this**: many checks set `fh.sources.off` with `localStorage.clear()` and do not set `fh.sources.defaults`. The page then adds the record's resting-off sources on top. Once A or B rests off through that record, those checks run with the kind shut.

| check | law | what it must hold after |
|---|---|---|
| check-source-switch-v1 | S0: a fresh reader finds exactly the record's resting-off keys off, and every other chip on (l.129). S1: every chip on once the defaults are seen. S1f: every shelf carries its baked joint price. S3/S4: the sole carrier moves to `alt` or o.la. | S0 reads the record's `off` keys, so it holds if the kind goes into that record. If the kind lives in a new record, S0 must read that record. S1f goes red if a "kind" shelf is drawn and regloss does not price it. |
| check-same-product-v1 (the gate) | S1: every sampled line and chip is the same, old against new. S2: the first cards of a chapter carry the same pills in the same order with the same one pressed. `--expect data/default-picks/index.json` explains only default-pick differences (l.13-29) | **Goes red on S2 everywhere**: on the chain books 66% of cards lose a pill. S1 goes red at the moved lines that fall on a sampled page. It needs a second expectation, for example `--expect data/dictionary-kinds-v1.json`: every pill that differs is one whose every carrier is shut, every line that differs was credited only to shut ids (or ranked first by one), and it now reads the re-lead. |
| check-line-reads-the-place-v1 | P1-P6. P5 sets `fh.sources.off ["M4"]` with no defaults key (l.229) and expects the baked line (o.l) | With the kind shut through the defaults, P5's lines whose o.l is carried only by the kind move to la or go bare. They must follow the rest leaders, or the check must set the defaults key. |
| check-disk-gloss-is-the-line-v1 | L1: under "oldest" and "keep", the page's line = zone.gloss[key] (l.84, 103) | localStorage is cleared, so the defaults apply. A line the table credits to the kind alone now draws `alt`. Either the table is baked without the kind, or L1 accepts `gloss_m.alt` where every carrier rests off. |
| check-card-opens-on-the-line-v1 | C1: the pressed pill is the line under every remembered setting. C2: baked columns | It holds if the line and the pool both read the same rest set. It sets `fh.sources.off` = the overlays (l.85) and then gets the kind on top. |
| check-ruled-equals-first-paint-v1 | E1-E4 on a fresh reader (l.42) | Cell sizes follow the lines. It goes red only if a ruled cell's reading is one of the moved lines. |
| check-default-picks-v1 | D3: the index against the resting-line records. Its page laws carry `sources_off` from the record (l.1538) | Re-run after the lines. It may need defaults baked again (see above). |
| check-chain-book-v2 | K3: the file belongs to this tree. l.176: the lifted state must match what it expects (`sources_off`, defaults) | K3 goes red until the chain is read again. Its idea of "lifted" must include the kind opened. |
| check-chapter-pages-v3 | P3: the plain list is the record | It holds once the lines and the door have been re-run. |
| check-search-v1 | it already leaves out what the record rests off (l.428) | It holds for A and B. For 2b, see the search row in §1. |
| check-overlays-v1, check-names-pill-v1, check-proper-name-v1, check-masorah-toggle-v1, check-line-follows-card-v1, check-entry-gate-v1, check-pointing-gate-v1, check-ledger-divisions-v1, check-live-line-asks-its-own-word-v1, check-witnessed-order-v1, check-span-store-v1, check-piece-store-v1, gated-card-v1 | each sets or reads `fh.sources.off` | Each must be read once for how it treats the defaults. check-overlays sets the defaults version and `off = []` (l.91, 170), so the kind comes on there. The others clear storage and so get the kind off. check-names-pill-v1 and check-proper-name-v1 meet 2b directly: the names gate's rows at a name place. |

The baked switch costs do not answer the rest question. They price the table line (oldest-first over every row), not what the page draws at rest. At rest the line is STEP's default pick or the place's piece in 99% of cases, and the lattice leader for the rest. No baked set equals A or B: the sets are single chips and the century, language and license shelves. A sum of chip costs is not the joint price, as the receipt itself says. So the line measure below rests on the page's own resting-line records plus a rebuild.

## 3. The measure, over the 39 books

### How

- **The line**: `data/resting-lines/<book>.json.gz`, the page's own recording of a first visit with its credits (credited.mjs). 303,191 lines over 305,431 words. 299,879 are credited to TAHOT's piece and 54 to MACULA's piece. Those stand: the shut kind never carries a place piece.
- **The re-lead**: rebuilt in node from the tree's own modules (gates.mjs imports gloss-store-v1, pointing-grade-v1, stem-family-v1, entry-gate-v1, names-gate-v1, place-leaders-v1; leaderOf = `readingPool(kept,"oldest")[0]` and its carriers). **Rebuild check 1** (validate-leaders.mjs) compares the rebuilt o.l and o.la with the baked sidecar over every graded (surface, place) of the 39 books. o.l is the same in 183,430 of 183,434 asks, o.la in 183,428. The 4 that differ are כׇּל־ at Daniel 2:8, Ezra 4:14, Nehemiah 3:15 and 11:5: Classical Hebrew Words' «mallow» (M23) graded differently through a maqaf surface. **Rebuild check 2**: of the single-word lines credited to the store, 773 match the rebuilt leader. 41 do not, and all of those are TAHOT M4 lines drawn with the hidden sign's gap (e.g. «​great» against «<the>/ great»).
- **The pills**: readingPool groups over the rows the gates keep at each word's place. A pill leaves when every row behind it is dropped. **Rebuild check 3** (cmp-shut.mjs) compares the 12 chain books, where every card is read off the page at rest. On single-key cards the number of pills that leave is exact on 7,192 of 7,888 cards. The total is 45,903 rebuilt against 43,010 read (+6.7%; most misses are one pill, e.g. «אָמַר» 24 against 23). The rebuild does not model the card's own display rules for open dictionaries (Strong's «×» renderings, TAHOT readings of other places), which is why whole pools differ. Words whose card is a piece card (blocks per piece, `w.pg` of 2 or more) are not rebuilt: 144,258 words of the 39 books. For those the chain books are the measure.
- The fourteen Genesis 1 dumps were not used; the 12 chain books are the page-read check.

### The resting line

| filter | single-word lines credited only to the kind | lines that change (re-lead) | to a Bible dictionary | to the place's own source (TAHOT or MACULA rows) | bare | other | through today's switch (l, then la, then bare), graded lines only |
|---|---|---|---|---|---|---|---|
| A | 27 (33 with run lines; 1 more mixed, which stands) | **29** | 21 | 7 | 1 | 0 | 7: 5 to la (place source), 1 to la (Bible dictionary), 1 bare |
| B | 38 | **39** | 23 | 8 | 7 | 1 (Kaikki M25) | 17: 8 bare, 6 to la (place), 2 to la (Bible dictionary), 1 to la (Kaikki) |
| AN, BN | the same as A and B | 2b moves **no** resting line | | | | | |

The 29 under A fall into these classes (all examples are in measure.out):

1. **The kind alone carried the line; a Bible dictionary takes it (19 under A).** The Rabshakeh name at 2 Kings 18:17, 19, 26, 27, 28 and 37: «Rabshakeh» [M21, PanLex] becomes «Rabshakeh, a Babylonian official» [M9]. Ezekiel 16:22 «nudity» [M21] becomes «naked(-ness).» [M9]. Ezra 5:3 «you» [M1] becomes «thee» [M14], and so on.
2. **The kind alone carried the line; the place's own source takes it (7).** Deuteronomy 28:49 and Isaiah 25:1 «Distance» [M1] become «from/ a distance» [M4]. Habakkuk 2:5 «garment» [M1] becomes «faithless» [M3]. 2 Samuel 10:3 «explore» becomes «search out». Jeremiah 19:1 «walk» becomes «to leave». Micah 2:7 «walk» becomes «walks». Psalms 8:4 «action» becomes «work of».
3. **The line goes bare (1).** Judges 19:9 «vouch» [M21]: no row the gates keep is left.
4. **An open dictionary's line loses its rank (2).** Esther 9:17 and 1 Chronicles 23:23 «three» [M14] become «+ fork» [M14]. Strong's carries «three», but it ranked first only because a shut co-carrier gave it a year. With that carrier gone the catalog's row order puts «+ fork» first. This class is check-source-switch S4's own ("the switched-off carrier can be what ranked the reading first"). The result is worse than the line it replaces. That is a fault of the oldest-first tie-break on Strong's rows that carry no year, not of the kind. The re-lead must not ship it unseen: it is a class to size in the full card population.

B adds Wikidata, WordNet and the translation tables. That brings 7 more lines that go bare (Ecclesiastes 11:9 «young woman» [M10], Genesis 49:13 «ship» [M28], Isaiah 40:21, Jeremiah 15:8, Psalms 63:3 «war front, ...», Psalms 64:5 «lyre, ...»), 1 line that goes to the place's own source (Genesis 49:11 «an urban area ... smaller than a city» [M43] becomes «city/ towards» [M4]), and Proverbs 30:10 «railroad tie, ...» [M10] becoming «a vapour» [M25, Kaikki].

**Today's switch would not be enough for a true re-lead.** Under "only" the page meets sources that are off with l, then la, then bare. It never looks further. Under B that leaves 8 graded lines bare that a re-lead fills. The projector should bake rest leaders.

**2b on the line.** The page credits 1,127 resting lines to English Wiktionary's Hebrew entries. 1,098 of those are run lines from the span store (M13 has 718 span rows), and the span store's rows have no facts slot, so they carry no name mark. In the other 29 no reading comes only from «name» rows. So 2b moves no line at rest. The span store is silent on names, and silence is silence.

### The cards

The rebuild covers single-piece cards: 160,111 words of the 39 books, holding 9,549,682 pills.

| filter | cards losing a pill | pills lost | cards left with no pill | cards left with the place's reading alone |
|---|---|---|---|---|
| A | 118,910 (74%) | 941,870 (9.9%) | 39 | 35 |
| B | 125,367 | 1,108,024 | 48 | 50 |
| AN | 120,971 | 987,345 (2b adds 45,475) | 43 | 37 |
| BN | 126,944 | 1,153,535 | 59 | 52 |

The pills that leave under A, by family (a pill two shut families carry counts under each): PanLex 697,093; ConceptNet 123,821; OmegaWiki 89,478; MUSE 49,444; Lexibank 43,102; Hebrew Wikipedia's titles 30,919. Cards by number of pills lost: 1 pill on 13,188 cards, 2 on 11,087, 3 on 7,086, 4 on 10,779, 5-9 on 32,119, 10-19 on 39,689, 20 or more on 4,962.

From the page itself (chain-pills.mjs, the 12 chain books, every card including piece cards, A): 9,478 of 14,354 cards lose a pill. 79,088 of 760,166 pills leave (10.4%): PanLex 61,766, ConceptNet 8,904, OmegaWiki 7,690, MUSE 3,381, Wikipedia's titles 2,134, Lexibank 1,829. On 59 cards the pill the card opens on is shut. Two cards keep no pill: Amos 8:3, cells 10 and 11, a run with no place line. Five cards had only the place's reading before and still do after.

**An estimate for all 39 books, all cards.** It is not counted directly. On single-piece cards: 941,870 × (43,010 ÷ 45,903) ≈ 0.88 million. On piece cards: 144,258 × 5.59 (the chain books' 36,005 ÷ 6,441) ≈ 0.81 million. That is about **1.7 million pills, near 10%**, on about two cards in three.

**Cards left with no pill** (A; 39 single-piece cards). These are name places where only a shut dictionary had a pill. The card still prints the place's own line (TAHOT's piece). Peor at Deuteronomy 3:29, 4:3 (twice), 4:46 and 34:6: «gaping» [M6]. Moab at Ezra 2:6, 8:4 and 10:30: «moab» [M1]. Paran at Genesis 14:6: «Paran (moshav)», «Paran, Israel», «farren». Zoar at Genesis 19:22: «Officer cadet», «cadet». Under B, Daniel 3:25 and 7:17 «four» lose all five of their pills («the number 4» [M53], «three» [M21], …).

**Cards left with the place's reading alone** (A; 35). Daniel 2:41 keeps «divided» and loses «Fission (biology)». Esther 3:12 and 8:9 keep «[the] scribes of» and lose «Sper», «Sifre», «Sper (Georgia)», «tell». Ezekiel 47:16 keeps «hattikon» and loses «middle». Ezra 2:55 keeps «Sotai» and loses «ste». 1 Kings 4:12 keeps «Shean» and loses «Shan», «Schaan». Under B the camels at Genesis 24:10, 24:63 and 32:16 and Ezekiel 25:5 also lose «Camelus, genus of mammals».

## 4. What the round would cost

Timings come from the last round (v63, 2,610 s in all), taken from the file times in `rt/reader/build/round-v1`. The pipeline log gives only the total.

| step | took | needed? |
|---|---|---|
| zones: bake-witnessed + regloss over 40 books (06:15:42-06:20:58) | ~5 min | Only if the table or the switch costs change: a "kind" shelf priced on the rail, or the table baked without the kind |
| zones: commentary regloss (-06:22:07) | ~1 min | the same as above |
| zones: lattice projection (-06:38:11) | **~16 min** | **Yes for 2b, and for a true re-lead** (rest leaders beside the opened leaders). Not for A or B carried through the existing switch alone, which goes bare where l and la are both shut. |
| stamps | seconds | no |
| search: word senses + search index | under 1 min (with defaults) | Not for A or B. For 2b, only if the index learns categories. |
| defaults: bake + node laws (-06:39:11) | ~1 min | Re-run after the lines if D3 goes red |
| records: gate, count, zone store, manifests, overlay counts (-06:39:58) | ~1 min | yes (manifests follow the files) |
| lines: 40 works read off the page (-06:42:51) | **~3 min** | **yes**: every record names the files the page read |
| chain: 12 books, every card pressed (-06:58:41) | **~16 min** | **yes**, and card-readings' lifted state must learn the kind |
| door (-06:59:08) | ~0.5 min | yes |

**With the projector change (the right one): about 43 min, the whole round. Without it: about 21 min** (search, defaults, records, lines, chain, door). Then come the suite (2,646 s in v63) and the gate (532 s; red on S2 until it has an expectation).

## Not established

- The exact pill counts on the 144,258 piece cards of the 39 books. Only the 12 chain books count them; the rest is the estimate above.
- What today's switch draws for the 20 lines under A that come from the table or names path (gloss_m.alt), not from the lattice leaders. Only the 7 graded ones were run through l and la.
- Whether check-default-picks D3 goes red at the 29-39 moved lines.
- The class "an open reading loses its rank" in the whole card population. Only the 2 resting lines were sized.
- The Genesis 1 cards of the outside reader (`../the-accuracy-question/dumps/`) were not read. The rebuild was checked against the 12 chain books instead.
- Tikkunei Zohar, the 40th work, is not in this measure.
