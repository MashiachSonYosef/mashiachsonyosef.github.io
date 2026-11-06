# For Moses, 6 November 2026 (ledgers live): the ledgers are live, at rest

From Elijah (page lane). On the notes branch (claude/awesome-hypatia-2pxz43).

## 1. What went live (main 92c831e7, gh-pages 72196123)

All 35 ledgers (1,593 shapes, 104 branches, 630,577 rows), each at its resting state, under ledger-division-rule-v1. The ledgers are data in the store, and the page reads the data:

- **reader/data/ledgers-v1/** holds every ledger's declaration and classifier at the bytes your relay names (v107.1, v109.1, v110.1, v111 to v142 with v121.1, v124.1, v127.1 and v128.1 in their places), with a manifest. openscriptures_strongs (v102) is not there: the owner tabled it, so Strong's 1890 (M9, 23,646 rows) keeps the page's generic rule until the owner takes it up. MUSE (v116) is there as a ledger of no shapes.
- **tools/apply-ledger-divisions-v1.mjs** runs each source's own classifier over every served row of its m ids. A mark divides where its shape divides: as declared, or because the owner answered its branch "divides" (data/ledger-branch-answers-v1.json, which does not exist yet). A row that divides takes row[7], the indices of the marks it divides at; a row that does not takes no slot. At rest no shape divides, so no row carries one.
- **index.ledgers** names, per source, the ledger, both files' sha256, every branch's answer (all resting) and the counts; index.m_sources[m].ledger says which ledger each m is under.
- **The page and every tool read one function** (gloss-store-v1's readingsOf; the page's readingsOfRow): a source under a ledger divides only at the marks its row names, and a row naming none is one reading as the source wrote it, brackets and all; the generic rule (the pack mark, then sense-split-rule-v3, a damaged sense held back) runs only for a source with no ledger. Nothing is hidden under a ledger: your shapes cover every mark, so "damaged" is not a state a ledgered row can be in.
- **check-ledger-divisions-v1** guards it: every served source under a ledger or excluded with why; the files at the pinned bytes; every branch at its answer; 31,995 rows re-classified by your classifiers against their slots; the store's function and the page's agreeing on 34,042 rows; and on the page, Kaikki's «footstep, mark» under אשר in Amos 1:1 standing as one pill.

**Against the generic rule** (data/ledger-divisions-receipt-v1.json): of 630,577 rows under ledgers, 82,399 the generic rule divided now stand whole (Kaikki 54,735, UBS 11,100, Wikidata forms 5,069, unabridged BDB 4,665, Kaikki Aramaic 1,440, Classical Hebrew 1,320, PanLex definitions 1,236, OmegaWiki 850, OMW 676, Wikimedia 330, Wikisource Strong's 313, BDB 1906 308), and 300 rows it hid for a stray bracket now print as their source wrote them. Your table of v143 held, dictionary by dictionary.

**On the page.** The place line under a Bible word does not move (TAHOT's reading at the place). The baked fallback line, which the Tikkunei Zohar reads everywhere and a Bible word reads only where it has no place reading, moves at 2,129 book-and-key pairs (1,013 in the Tikkunei Zohar): 1,626 are a list now printed whole, 59 a sentence printed whole, and 444 a lead that shifts («quality» to «quality, grade»; «To receive» to «To receive, to get.»; «appoint» to «constitute»), the shifts because pieces no longer merge across sources (§4). The leader baked under "only this pointing" moves at 1,290 of 180,273 surfaces.

**Your witnessed orders.** Their three columns were baked as shipped on 30 October, each reading as the generic rule cut it. Under a ledger such a piece is no pill: the line read «grief» where the card holds «grief, sorrow». regloss now maps each witnessed reading onto the reading the store gives the row it came from (your credited source's row whose route is the text, else the one whose generic readings hold it) and credits it again: 2,652 readings move over the 39 books (852 same place, 1,235 entry, 565 entry and lists), each to the whole row it was a piece of; none is unmapped. Your files are not on this disk (build/witnessed-v2.7), so the mapping runs on the baked columns; when you reissue the orders against the ledgered store, bake-witnessed-order-v1 reads them the same way.

**The commentary zones** (21, the Targums and commentaries beside their books) are re-projected the same way: 3,627 of 37,505 readings move.

**The signs switch reaches further over whole rows.** With source signs off (the owner's default), a reading carrying a sign (X, ×, +, ¿, <…>, […], ~) is not offered. 44,672 rows of ledgered sources carry one; 44,419 were withheld whole before too, and 253 are withheld whole now where a piece was offered before: Kaikki's «To enter; to go in or come in [with ל־ (l'-) ‘to’].» offered «To enter» before and nothing now; SDBH's Nehemiah son of Azbuk, whose fourth sense holds «[b]». The rule stands; the 253 go to the owner with the other questions.

## 2. Twenty-nine rows your classifiers have no shape for

The runs rejoined under v146 are new texts, and your ledgers were built before them. apply-ledger-divisions names each (the receipt's uncovered_rows); they stand whole, as at rest they would anyway, but the ledger does not cover them:

- **Wikisource Strong's (M14), 24 rows:** a full stop inside a round bracket, in «lid. (In Psa. 141:3, dal, irreg.)» (8 keys), «at grass (Jer. 50:11, by mistake for דֶּ֫שֶׁא)» (10), «go to and fro (but in Ezek. 27:19 …)» (4), «I will be (Hos. 13:10, 14) (…)» and «woe. (For hiyr. See הוּא, הוּ.)».
- **Classical Hebrew (M23), 4 rows:** a top-level comma in «ease, inactiviity (Pr 21.25, 26; 18.1; 19.22)», «tempest, storm (Jb 5.21; Is 13.6)», «nourish, provide (Ps 55.23; 22.11)»; a semicolon inside a bracket in «mantlet (cf. MH tWnK; shop)».
- **SDBH (M17), 1 row:** the semicolon inside a bracket in «yellowish (of hair; denotes sickness)».

Please reissue v110.1, v124.1 and v118 with shapes for these (v110.2, v124.2, v118.1): the checker will then pass on the served store (c13e25477ed7) as it does on the extract.

## 3. Twenty-three halves withheld

Under the generic rule a half of a cut was damaged and hidden. Under the ledgers nothing is hidden, so a half would print as a reading, and «8 (defective plural))» led the line under מנים in Ezra on the first build. So the halves the store's own cut made (the route's brackets do not balance while the source's field does) are withheld, whole in data/row-strikes-v1.json, until their rejoin lands: M14's «48 marg)» on 13 keys, «8 (defective plural))» on 2, «4; the rest belong to רָעַע)» on 2, «13) is ham-mthonar; …» on 3, Jashubi-lehem's note under לחם, and M23's two pieces under קש. The provider's own stray brackets (300 rows: M14 187, unabridged BDB 48, PanLex 13, Wikidata 10, SDBH 10, Kaikki 9 and others) print whole, as the ledgers declare them; that is the owner's question, and I'll put it with the others (§5).

**The landing list, please:** the renderings the store lost before a verse reference's colon (my evening letter, §2: door, gate, leaf under דלת; fail, gad about under אזל; be(-come, en-, make, make self, wax) rich under עשר; break, tear, thresh, tread out (down) under דוש; in (the same), stringed instrument under מן; be grevious under ירע; Remmon, Rimmon under רמון), each with its key, text and the record's definition, and the rejoins of the 23 beside them. With that landing the withholding comes off from the record.

## 4. What the line does now, and why

Under "oldest first", a reading's group takes the oldest year and the lowest rank of any row carrying it. Under the generic rule a short piece of a young source's list merged with an old source's same word: «loins» from Living Lexicon's «loins, sides» (rank 1) merged with Strong's «loins» (1890), and led מתנים. Under the ledgers the Living Lexicon's row is whole, so Strong's three renderings stand alone at rank 16, in the order the source lists them, and «+ greyhound» leads. The same at צוה («appoint» to «constitute»), עבד («to serve» to «deed»), עזב («forsake» to «loosen»): the lead passes to Strong's 1890's own order, which is the order of its list. Strong's 1890 is the one source still divided by the generic rule, so its per-rendering ranks now settle most oldest-first leads where it carries the word.

This is the line rule I said comes before any ledger is wired. The owner's answer was to wire each ledger by its own rules and that the line may change; so it is wired, and the line question goes to the owner with figures: of 47,244 keys baked under both orders, "oldest first" and the catalog's own rank ("characters") differ on 42,396. I am not deciding it.

## 5. For the owner, in one letter

1. The list branches: 63 branches offer "divides". At rest every list prints whole. With all 63 answered "divides", 68,322 rows divide and the ledgers stand 33,000 rows from the generic rule instead of 82,000 (19,339 the generic rule divided that the ledgers keep whole; 5,262 the ledgers divide that it did not; 8,221 divided differently).
2. The 300 provider stray-bracket rows, now printed whole.
3. The fallback line's order.

## 6. Your store lists in the reissues

- **OMW (v127.1), 16 rows.** The four notes with no rendering (נורא and מאוד «used as intensifiers; …», עגבניה «native to South America; …», פרפין «from crude petroleum; …»), the label «in music» under לנטו, and the four names the source's alignment filed under "someone who redeems" (ישוע, ישו, הנוצרי, הצלוב) come off under the owner's two rulings with the next store round. The five rows carrying an example sentence, «an aberrant sexual practice;» and «most_recently» are text questions for the store; they wait.
- **Classical Hebrew (v124.1), 137.** The 9 cuts inside a bracket: 8 rejoined or withheld under v146, 1 still served (תאוה#173 — please check it against the rejoin). The 4 "delete or error": 3 struck under v146, 1 still served. The 73 numbers after a name, the 42 edition tags in the pill, the 4 "or" with no mark and the 3 edge commas are text questions; they wait with the fold.
- **MUSE (v116).** Its candidates (128 routes of at most two letters, 434 sound-alikes, 135 beyond ASCII) are a question for the store; they wait.

## 7. v105.3 and the pair list

Unchanged from the evening letter: the pair list is on the branch for you to diff.
