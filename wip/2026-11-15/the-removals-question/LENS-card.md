# The card lens: every way the page or the projection keeps a store row off a card, off the line, or apart from the readings

15 November 2026. One of several independent readers for the owner's question of today: «explain to me the justification for removing Peru and any time we wrote our own rule to remove?» This lens reads the page (`reader/zone.html`) and the projection (`tools/project-lattice-v12-v1.mjs`, the re-gloss, the bakes, `tools/gloss-store-v1.mjs`). Read only; nothing was changed in any tree.

Trees read:
- LIVE (what readers see, main 857a3dc0fb): `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/old/reader`
- SHIP (today's ship, read only, none of its tools run): `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/rt/reader`
- My measures (scripts and outputs): `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v66/card/` (`measure-gates.mjs` → `gates-all.json`, `measure-gates2.mjs` → `gates2.json`, `measure-more.mjs` → `more.json`, `measure-overlays.mjs` → `overlays.json`, `measure-kq.mjs`, `one-place.mjs`, `key.mjs`). They import the LIVE tree's own gate modules and read its store, zones and sidecars. They count the 301,466 plain word places of the 39 books (a word with its own key and points; 3,965 pairs and joined words are not counted), the whole form's pool, at rest.

## Peru, from the card's side

Genesis 1:22 word 5, פְּר֣וּ, key פרו, place entry H6509, not a name place. 23 store rows and 2 rows beside the store are asked (`one-place.mjs`, `key.mjs`):

- Withheld, 1: «Peru (a country in South America)», English Wiktionary via Kaikki (M13). Its facts slot carries `name: 1`: Kaikki's own `pos` for the entry is `name` (the corpus lane's names v1 list). The names gate withholds it because the place is not a name. The card says «1 given as a name by its source, withheld». The owner ruled it: «1-3. ok agree», 13 November (ruling 8, asked as «Names. Hide a dictionary's names, such as «Bara», where the word on the page is not a name.»); the ruling file itself lists this pill with the verdict "withheld".
- Still printed on the same card: «Peru» (OmegaWiki M32, with ConceptNet's «peru» behind the same pill), «Republic of Peru» and «A country in South America, with capital Lima.» (OmegaWiki), «country in South America» (PanLex M42), «Tarica» (PanLex M21), «pro» (ConceptNet), «Pro-» (Wiktionary, a part of its row). Those sources were not read for a name mark, so nothing they say sets the rows apart.
- Withheld on the same card, 2: «to bear fruit, be fruitful» and «to procreate, multiply, increase», Wiktionary via Kaikki (M25). Their headword is פָּרוּ (the past) and the verse reads פְּרוּ (the imperative); they carry no entry number, so the pointing gate takes them as "pointed otherwise". The card says «2 of 25 pointed otherwise, withheld». This is the same gate doing what it was ruled to do, and it takes the right meaning off the card.
- All three rows are whole in the served store. A reader brings them back with «the pointing: keep», which is on the rail only under `?rail=all`.

## What rests on the source's word, what on the owner's, what on ours

Counted at rest over the 39 books, the store's rows, place by place (one row withheld at 100 places counts 100):

| gate | places where it withholds | rows, place by place | distinct rows | card says |
|---|---:|---:|---:|---|
| entry | 188,661 | 5,867,997 | 130,407 | «N of another entry than H…, withheld» |
| … by number | 162,597 | 5,406,492 | | |
| … by STEP's letter | 75,990 | 450,153 | | |
| … by BDB's own entry | 5,950 | 11,352 | | |
| names | 35,028 | 72,312 | 1,385 of 7,412 marked | «N given as a name by its source, withheld» |
| pointing | 133,520 | 833,825 | 32,080 | «N of M pointed otherwise, withheld» |
| stem | 20,291 | 192,372 | 16,969 | «N of another stem than qal, withheld» |
| any of the four | 213,980 of 301,466 | | | |
| a row of the place's own entry kept though pointed otherwise | 149,917 | 1,891,349 | | (nothing) |
| pills not offered under «signs off» | 193,842 | 1,788,869 of 10,732,736 pills | 45,230 readings in the store | «N readings carrying a source's own sign switched off» |
| sense openings printed as notes | 52,410 | 117,182 | 2,008 | «… opens its numbered senses with: …» |
| rows that print no pill | 33,634 | 114,083 | 603 | (nothing) |

Beside the store (Jastrow, the Samaritan sources), the same places:

| | places | rows, place by place | card says |
|---|---:|---:|---|
| Jastrow rows pointed otherwise | 97,529 | 827,617 | counted in «pointed otherwise» |
| Jastrow rows of another stem | 5,152 | 38,652 | counted in «of another stem» |
| Jastrow word senses held back | 12,770 | 27,318 | «N word senses, not definitions, held back — show» |
| Uhlemann's Latin, resting off | 67,298 | 132,317 | «N withheld by your source switches (1 source off)» |
| Samaritan rows whose lane awaits the owner | 39,709 | 41,076 (282 rows) | (nothing) |

The four place gates and the stem's and names' lists all hang on one switch: they act only while «the pointing» stands at «only this pointing», its resting position since 6 November. Under «keep» or «the letters only» none of them withholds. That switch is not on a book page today; it works under `?rail=all` (`zone.html:14182-14194`). The short list of 15 November proposes bringing it back first.

Rests on a source's own statement, held against a statement about the place (with the owner's ruling):
- the entry gate (row: its entry numbers, STEP's lettered tags, BDB's own entries; place: TAHOT's tag on the core piece);
- the names gate (row: the provider's part of speech; place: TAHOT's grammar or MACULA's type);
- the pointing gate (row: its headword's points; place: the edition's points);
- the stem gate where a source labels the stem itself (BDB's headings, the UBS forms, Jastrow's `verbal_stem`, TAHOT's and MACULA's parse of the place);
- the sense openings (BDB's numbered senses), the phrases to come (Strong's X × +, UBS's collocations).

Ours, plainly (the page lane's or the corpus lane's own criterion, table, pattern or default):
1. The pointing grade's normalizations (page lane, 6 and 7 November): the word-initial dagesh lene dropped, the qamats qatan read as a qamats, a shureq read as a vowel, "any one headword matches", a pointing no store row attests withholds nothing, a row of the place's entry stands whatever its points. Each one makes the gate withhold less. The owner ruled the gate and its default; no ruling found on any one normalization. The joining dagesh (971 words) still waits on the owner.
2. The equation the gate rests on, "pointed otherwise means another word": ruled by the owner on 6 November, and known since 10 November to part a word from itself (1,097,389 rows of a word's own headword form at 18,343 places before the entry gate). The entry gate gave back the rows of sources that number their entries; rows of sources that carry no number are still withheld this way.
3. The one-letter piece table (page lane, 6 November): which vowels make a vav or a he a prefix or a suffix.
4. The stem families table, and two inferences the owner approved on 13 November before the principle of 14 November: an SDBH row takes the UBS edition's stem for the same gloss (5,599 lines), a Jastrow reading before the first heading takes the base stem (3,240 lines). Neither is a stem the row's own source names for it.
5. Withholding by stem at all: the owner's words of 5 November were «therefore should stand, meaning bara cant be cut down» and «a binyan ledger, maybe not for toggling though just to check correctness». The page lane wired it as a gate. No ruling found that says "withhold a reading of another stem".
6. The sign patterns: five patterns from the corpus lane's signs ledger, applied by the page to every source's readings, so a square bracket in a Wiktionary usage note counts as "a source's own sign" (M25 211, M11 111, M23 72 readings).
7. Word senses: which of Jastrow's brackets is a sense note is the corpus lane's classifier (an italic first in the bracket); resting off was left to the page lane by the owner; the 456 twins are the page lane's own addition. The page's own registry files this switch under "this project's claim".
8. The rows that print no pill (603): the kinds are the corpus lane's shape classes under the owner's «Take them off»; the card prints nothing about them.
9. The Samaritan lanes: 282 rows are never asked because their lane is "awaiting the owner"; several lanes are defined by the source tying its square word with no tie word. Nothing on the card, not in the "of N".
10. The written half of a pair: every catalog row under the written letters is withheld, whatever its source says (owner's ruling of 30 October; 26,755 readings at 813 places).
11. The names lead: a capital letter in TAHOT's English read as "a name here", matched to Strong's King James form (page lane, 27 to 28 September). An order; nothing leaves the card.
12. Oldest first and the 1940 line: the page's own order under the place's reading; the 1940 tier is ours and decides nothing.
13. In today's ship: a pointer pill is withheld as a name's where the row it points to is marked a name (page lane, from the review of 14 November; not put to the owner).
14. Queued: call 6's rows that only name a kind of word (449) and the 18 picks whose words go with them; the phrases switch resting off.

## The pointing grade, version by version (`tools/pointing-grade-v1.mjs`, mirrored at `zone.html:3057-3076`, `3150-3155`)

- v1 (September; the corpus lane's two lines `vowelForm` and `isPointed`): U+034F dropped, NFKD, the accents and meteg, maqaf, rafe, paseq and U+05C3 to U+05C7 deleted, everything but vowel points, dagesh, the shin and sin dots and the letters removed. A row's grade: no pointed headword → `n` (silent, stays); any one headword equal to the word → `m`; else `x`. A row with no headword slot takes the lattice card's grade (no store row is in that case today: `rows_without_headwords: 0`).
- v2 (6 November, main 372bc3300e, page lane): the dagesh of a word-initial bet, gimel, dalet, kaf, pe or tav is dropped before comparing. 72,092 store rows had been withheld for it alone; Ruth 1:7's line was bare.
- v3 (6 November, main e34ef19dec, page lane): U+05C7 qamats qatan is read as U+05B8. 126,745 row grades on 7,363 words. Same ship: a pointing no store row attests withholds nothing (5,376 word places by my count; 6,711 of 180,273 graded surfaces by the zones' receipts; the default had emptied 3,164 cards).
- v4 (7 November, main 1df6558cf2, page lane): a vav carrying a dagesh and no vowel is a shureq and points. 3,339 store rows had graded as silent.
- 7 November: at a pair the read half is graded by its own vowels and the written half by letters only (kq-grade-rule-v1, the owner adopting the corpus lane's v151).
- 13 November (main 90eedeb6f3): a row of the place's own entry stands whatever its points.
- Not graded at all: a word with no vowels of its own (a title from the catalog), `zone.html:7222-7227`.
- Open: the joining dagesh, 971 words, waits on the owner (task 84).

## The stem gate (`zone.html:7287-7320`, `3077-3090`; `tools/stem-family-v1.mjs`; `tools/project-lattice-v12-v1.mjs:203-309`, `556-558`)

- Sources that name a stem for a row: BDB via Open Scriptures (M5) and the unabridged BDB (M46) by their own headings; TAHOT (M4) and MACULA (M3) by the stems of the places where the row's pointed headword stands; the UBS dictionary (M18) by its `LEXForms`; the SDBH (M17) only through the branch `the_ubs_edition`; Jastrow (M12, M39, M49) by `grammar.verbal_stem` and through the branch `the_base_stem`. Strong's names none and always stays.
- The place: the stems of the word's pointed surface in the book, MACULA's and TAHOT's (both where they disagree); a pair gives its stem to the read half.
- Joined by family, never by name: polel, poel, pilpel and three more with piel; polal, poal and two more with pual; seven with hithpael; qal passive with qal; the Aramaic names with their Hebrew stems (peal with qal, pael with piel, haphel and aphel with hiphil).
- History: live 6 November (e34ef19dec) on the lane's version 1 files; suspended the same night (bf121d78b1) when the lane withdrew both files (6 wrong and 2 partly wrong of 40 read by hand); live again later that night on version 2 (6df4b4c770); the extension 13 November (bdf3735238).
- At rest today: 192,372 store rows at 20,291 places (M18 56,947, M5 42,386, M4 41,497, M3 32,688, M17 10,552, M46 8,302) and 38,652 Jastrow rows at 5,152 places.

## The entry gate (`zone.html:3092-3135`, `7174-7197`; `tools/entry-gate-v1.mjs`)

- Row side: `n` its Strong's numbers (373,815 rows; 69,332 carry several), `t` STEP's lettered tags (39,738 rows of TAHOT and TBESH), `b` BDB's own entries (15,238 rows), written from the corpus lane's row entries ledger (relay v172). 15 sources carry any.
- Place side: TAHOT's tag on the word's core piece (298,975 of the 301,466 plain places).
- A row with several numbers is this entry's where any one of them is the place's. Leading noughts are taken off; a small letter is read as STEP's (22 places).
- The letter parting was asked of the owner as «which would hide 4 more wrong pills on the Genesis 1 cards»; over the 39 books it withholds 450,153 rows at 75,990 places (the Name: «The Lord» of TBESH's H3068H at 5,698 places tagged H3068G). The owner kept it as ruled on 14 November.
- Today's ship lands row entries v1.1 (relay v190): 12,257 rows at 11,895 places come back («Lo-» on 4,976 words that mean "not"), withheld live today on a filing the lane has since corrected.

## The line (`zone.html:12320-12400`, `4189-4194`)

One reading at a time. At rest, in this order: a reading the reader pressed; the place's own pieces (STEP's TAHOT; MACULA's at a few places) at 304,326 of 305,431 words; else the pointing's leader from the sidecar (the oldest reading among the rows the gates keep, the name where it leads); else the table (oldest first, names laid over it). Under «signs off» a piece that is only a sign is drawn as a gap (14,191 word lines; the notes of 14 November say 15,483 resting lines). The 1940 tier is inert.

## Evidence index (LIVE tree unless said)

- pool and gates: `zone.html:7155-7498`; notes on the card `10286-10299`, `10328-10363`, `9728-9773`; order `7513-7647`
- rules written out: `zone.html:2847-2893` (pointing), `2894-2916` (sources), `2917-2928` (1940), `3092-3148` (entry, names), `3293-3364` (signs), `3526-3548` (word senses), `3597-3672` (overlays, sources resting off), `5072-5083` (two selections), `7708-7719` (no weld), `8770-8788` (the set), `8910-8974` (pairs)
- tools: `tools/gloss-store-v1.mjs:10-57`, `94-155`, `221-253`, `337-401`; `tools/pointing-grade-v1.mjs`; `tools/entry-gate-v1.mjs`; `tools/names-gate-v1.mjs`; `tools/stem-family-v1.mjs`; `tools/place-leaders-v1.mjs`; `tools/proper-name-v1.mjs`; `tools/project-lattice-v12-v1.mjs:26-31`, `349-379`, `535-611`, `629-637`; `tools/regloss-zone.mjs:139-158`, `278-326`; `tools/card-readings-v1.mjs:78-91`
- records: `data/rulings/rulings-v1/rulings-2026-11-13-v1.json`, `data/rulings/rulings-v2/rulings-2026-11-13-options-v1.json`, `data/names/names-v1/RULE.md`, `data/stems-extension/stems-extension-v1/RULE.md`, `data/word-senses/jastrow-word-senses-v1/RULE.md`, `data/ledger-branch-answers-v1.json`, `data/ledger-divisions-receipt-v1.json`, `data/source-defaults-v1.json`, `data/overlays/samaritan/index.json`, `data/route-store/index.json`
- notes: `wip/2026-10-15/STATUS-2026-10-16.md:894-945`, `988-1025`; `wip/2026-11-06/ASK-binyan-ledger-v1.md:9`, `53-57`; `wip/2026-11-06/OWNER-QUESTIONS-2026-11-06-ledger-branches.md:27-35`; `wip/2026-11-10/FOR-MOSES-2026-11-10-the-pointing-filter-withholds-a-words-own-entry.md`; `wip/2026-11-13/the-rulings-of-13-november/THE-RULINGS-2026-11-13.md`; `wip/2026-11-14/the-names-gate-both-ways/THE-NAMES-GATE-BOTH-WAYS-2026-11-14.md`; `wip/2026-11-14/OWNER-ANSWERS-2026-11-14.md`; `wip/2026-11-14/the-relays-v185-2-to-v195/specs/v189-audit-calls.md`

## Not covered by this lens

- The store's own strikes (whole sources, rows by list): the store lens.
- The eleven relays one by one: the queued lens. Only what changes a card gate or the line is named here.
- The search index, the chain books, the door and the exported file, except where a card rule reaches them.
- The 3,965 pairs and joined words are not in the place counts; the pairs' written half is counted apart.
- The Tikkunei Zohar and the commentary zones: no lattice, so the four place gates never act there.
- The owner's ruling of 17 September 2026 on the two selection switches is cited by the page (`zone.html:5079`); its words are not in any file I could read.
