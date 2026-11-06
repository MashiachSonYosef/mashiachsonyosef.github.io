# For the owner, 6 November 2026: the ledgers' 104 branches, in four rulings

From Elijah (page lane). The 35 ledgers are live at rest (main 92c831e7): every dictionary prints each row as its source wrote it, and no mark divides. Each ledger carries branches where Moses judged the mark's meaning to be the owner's call. There are 104, over 131,418 rows. Every branch's question and both options, in Moses's words, stand below (§5). They fall into four rulings; a ruling can be given for the whole group, or branch by branch.

## 1. Lists: one pill per word, or the list whole? (63 branches, 92,661 rows) — RULED 6 November

**The owner's ruling (6 November, after the ledgers went live): one pill per rendering, for the ledger's reasons and not a rule's.** Applied as data/ledger-branch-answers-v1.json: 54 branches answered "divides" (90,608 rows reach them; 66,955 rows of the store divide); 9 held at rest, each with why (a label or a note that is no reading: Kaikki Hebrew B05, Aramaic B05; Strong's King James lists copied into Kaikki, B07, tabled with v102; a cut that leaves a bracket behind: OMW oewn B02; a description that may not render the word: OMW pwn30 B02; pieces the ledger itself says would say something else alone: Open Scriptures BDB B02, Wikidata forms B03, Wikidata lexeme B02; a name that is another word's: TBESH B03). The held nine are 2,053 rows. Shipped the same evening: main b0910ced, gh-pages 11f61351 (66,955 rows divide; the fallback line moves at 2,279 keys; the gate's 28 differing cards each a list the card held whole now offered as its renderings).

A line such as Kaikki's «boxer, pugilist» or the unabridged BDB's «bread, food». Until today the page cut every such list at its commas and semicolons (the generic rule) and printed one pill per word. At rest the ledgers print the list as one pill. Answered "divides", each dictionary's own classifier cuts only the marks it declared as list marks: a comma inside a sentence, a verse reference, or a bracket stays.

Measured (data/ledgers-v1, apply-ledger-divisions-v1 with every one of the 63 answered "divides"): 68,322 rows divide. Against the generic rule the ledgers then stand 33,000 rows apart instead of 82,000: 19,339 rows the generic rule cut that the ledgers keep whole (sentences, references, bracketed notes), 5,262 the ledgers cut that it did not, 8,221 cut differently.

Recommendation: answer "divides" for the group. It is what the page showed until today, with the generic rule's wrong cuts gone, and a pill is meant to be one reading a reader can press. The largest: Kaikki Hebrew B09 (44,099 rows, words that mostly say the same thing), B01 (11,083, lists of words and phrases), B03 (8,744, lists with a bracket), B04 (7,053, a word and then what it means after a colon), unabridged BDB B06 (2,863), Kaikki B02 (2,731), SDBH B01 (3,288, a wording and its meaning at «=»), Kaikki Aramaic B09 (1,528), Classical Hebrew B01 (1,343). The resting answer needs no work; "divides" is one file (data/ledger-branch-answers-v1.json) and a ship.

## 2. ConceptNet's filing tags: print them or not? (4 branches, 34,732 rows) — RULED 6 November: off, and off the data itself

Every ConceptNet row ends in a tag this corpus's own script wrote, «he (n, wikt, en 2)», «meaningful (a, wn)», «seal (n, wp, musician)»: the path under which ConceptNet files the word. The page prints the tag in the pill today. The row's definition slot already holds the word alone.

Recommendation: "tag_off" for all four. The tag is not the dictionary's text. This needs one step of the page's own (print the row's definition slot for these rows); I would build it with the next store round.

## 3. Rows that are a name or a word with filing marks around it (17 branches, 3,101 rows) — RULED 6 November: the marks off

«Dolls (disambiguation)» (Wikimedia, 1,866 rows), «Merari. See also.», «Ephai (from margin)», «given name (Adva)», «Kadesh. Compare.», «tree of the ''Acer'' genus» (PanLex, 647), «SWING (SOMETHING)», «LONGING (WISH)», «fool (ish)», «Mede(-s)», «mount (1)», «Ben (1128)», «Quartz#Citrine», «day after tomorrow - translation entry». Each branch offers the row as written or the word alone (or both forms, or two readings).

Recommendation: take the option that leaves the filing marks off in every one of the 17 (name_alone, word_alone, without_marks, without_note, no_number, number_off, leave_off, before_those_words, named_part, two_forms, two_readings). Same one step of the page's own as §2: the ledger names the mark, the page prints the part the ruling keeps.

## 4. Rows that render nothing a translator could print (20 branches, 924 rows) — RULED 6 November: no pill

«<the>» (TAHOT, 338 rows: angle brackets, the source's own sign for a word best left out of a translation), «Pedah-» and «thir-» (TAHOT, 283: a piece of a name or word whose rest stands on another Hebrew word), «four-» (58), «mega-», «un-», «self-», «sub-» (hyphen stubs), «[untranslated]», «[Obj.]», «(6997a=1886a+6997)», «The definite article.», «Hebrew letter, sounds like h».

The owner ruled on 6 November that rows with no English come off the cards ("Take them off"), and v146 struck 58 such rows. These 924 are the same kind, named by the ledgers rather than by a strike list. The TAHOT angle-bracket rows are already withheld whenever source signs are off (the default).

Recommendation: "no_pill" for the 20, under the ruling already given; the page's withhold step (row-strike-rule-v2) does it, keyed by the ledger's shape rather than a list, so a row the source later changes is judged again.

**Applied (6 November, the print-step ship):** the owner took the recommendations and added, on ConceptNet, "why not just fix it": the tags were this corpus's own script's, so they came off the route text itself (row-strike-rule-v3, retext from the definition slot: 11,759 rows). The other 37 branches are served by ledger-division-rule-v2 (tools/ledger-print-v1.mjs, the one step of the page's own, written from each branch's own words and tested on its examples): 1,419 rows print a part, 600 print no pill.

## What one answer costs

Ruling 1 is one file and a ship. Rulings 2, 3 and 4 need one addition to the ledger rule (a ledgered row may print a part of itself, or no pill, where its ledger's shape and the owner's answer say so), guarded by the same checker; I would build it as ledger-division-rule-v2 and ship all three together.

Two further questions from the ledger ship, with figures, are in the letter to Moses (wip/2026-11-06/FOR-MOSES-2026-11-06-ledgers-live.md): the 300 rows a source wrote with a stray bracket, now printed as written (50 lead a fallback line), and the fallback line's order (oldest first and the catalog's rank differ on 42,396 of 47,244 keys).

## 5. Every branch, in Moses's words

Grouped by the option each offers; "rows" is the number of routes the branch reaches in the served store; "at rest" is what the page does today.

## divides: 62 branches, 92,123 rows

### Kaikki machine-readable Hebrew dictionary strict source-explicit inflection-table forms from English Wiktionary (kaikki_wiktionary_hebrew) B09 · 44,099 rows · at rest: whole

This is the question on words that mostly say the same thing. Each line of this dictionary is one wording of one sense of a word, and a sense may have more than one wording. Some lines list words that mostly say the same thing: boxer, pugilist, or to shout, to yell. Do you want separate pills for such words, or one pill as the source writes it? Today the page prints boxer and pugilist as two pills. A word said twice in two forms, where the ledger's written list names it, as center, centre, stays one pill under every answer.

- **divides**: Separate pills: each comma or semicolon of these lists cuts, and the page prints boxer and pugilist as two readings, as it does today. Where the words before a colon are parted, what follows the colon stays only with the last word, even where it speaks of all of them: to pass away, to pass on: a polite way to refer to a death prints to pass away as one pill and the rest as another; nothing is added to the others. Where the list stands after a colon, its first word keeps the colon and what stands before it. The question on a word and what it means, or on a label, may also cut at that colon.
- **whole**: One pill: no sign of these cuts, and the page prints boxer, pugilist as one reading, as the source writes it.

### Kaikki machine-readable Hebrew dictionary strict source-explicit inflection-table forms from English Wiktionary (kaikki_wiktionary_hebrew) B01 · 11,083 rows · at rest: whole

Some lines are lists of words and phrases with commas or semicolons between them: physical wound, injury, cut. Here the text alone does not show that each piece stands by itself, so the ledger read these lists and kept out those where it found a piece that cannot stand alone. Does each comma or semicolon of these lists divide? A word beside its own plural, such as history, histories, is among them. Many of these lists also say mostly the same thing, and the answer to the question on words that mostly say the same thing does not reach them.

- **divides**: Each comma or semicolon of these lists cuts: the page prints physical wound, injury and cut as three readings. A small word the source put there, such as or, stays in its piece.
- **whole**: No sign of these cuts: the page prints physical wound, injury, cut as one reading, as written.

### Kaikki machine-readable Hebrew dictionary strict source-explicit inflection-table forms from English Wiktionary (kaikki_wiktionary_hebrew) B03 · 8,744 rows · at rest: whole

Some lists have a bracket or a remark beside them: to step on, to walk on (something or someone), or gain, profit, especially that which was unjustly obtained. A bracket or a remark stands with the piece it touches and may speak of the whole list. Does each comma or semicolon of such a list divide? The comma or semicolon before the remark itself never cuts. Many of these lists also say mostly the same thing, and the answer to the question on words that mostly say the same thing does not reach them.

- **divides**: Each comma or semicolon of these lists cuts: the page prints to step on and to walk on (something or someone) as two readings. A bracket or a remark stays with the piece it touches, even where it speaks of the whole list; nothing is added to the others.
- **whole**: No sign of these cuts: the page prints to step on, to walk on (something or someone) as one reading, as written.

### Kaikki machine-readable Hebrew dictionary strict source-explicit inflection-table forms from English Wiktionary (kaikki_wiktionary_hebrew) B04 · 7,053 rows · at rest: whole

Some lines give a word and then say what it means, after a colon, a comma or a semicolon: A tunnel: an underground or underwater passage, or walker, one who walks habitually or competitively. Is what comes after that one sign a second reading of the word?

- **divides**: That one sign cuts: the page prints A tunnel and an underground or underwater passage as two readings. Commas or semicolons between words before the sign follow their own question where they have one, otherwise they stay. Commas inside the explanation stay in it while the question on words that mostly say the same thing rests; if that question is answered with separate pills, the commas of a short word list after the sign cut as well.
- **whole**: That sign does not cut: the page prints A tunnel: an underground or underwater passage as one reading, as written.

### UBS Dictionary of Biblical Hebrew v0.9.2 exact definitions and glosses (ubs_sdbh_hebrew_v0_9_2) B01 · 3,288 rows · at rest: whole

The source often gives the Hebrew word for word and then what that wording means, inside one text, like: literally: to dig (an area); hence: = action by which ... Should the word-for-word wording and what it means be two readings? A proper name or a title with its description, a wording that itself says how it turns to the meaning or that holds a description, a short gloss written with the sign >, and a text whose brackets do not pair stay as one reading under either answer. A text that opens with a label, or whose wording says in what kind of text it is found, has its own question, B04.

- **divides**: The page prints the wording as one reading and what it means as another, with any lead word of the source's own and the notes that follow it: literally: to dig (an area), and hence: = action by which ... Where a text takes two such steps, each step is its own reading.
- **whole**: The page keeps the wording and what it means together in one reading, as the source writes it.

### Unabridged Brown-Driver-Briggs Hebrew Lexicon structured source (unabridged_bdb_1906) B06 · 2,863 rows · at rest: whole

This is the question on words that mostly say the same thing. Some senses in this dictionary are lists of single words or of renderings that open with one word: crown, wreath and wipe, wipe out. In a few others, which the ledger read and listed by hand, a semicolon stands between two groups: prey, food; leaf. Do you want separate pills for such words, or one pill as the source writes it? Today the page prints crown and wreath as two pills, and prey, food and leaf as three. From the day this is wired it prints what you answer here, and one pill until you answer. A word beside its own plural stays together under every answer.

- **divides**: Separate pills: each comma of these lists and each semicolon of the listed senses cuts, and the page prints crown and wreath as two readings. A semicolon parts its two groups, and this answer cuts no comma inside a group: prey, food; leaf prints prey, food and leaf as two readings. A stop at the very end stays with the last word.
- **whole**: One pill: no comma or semicolon of these cuts, and the page prints crown, wreath as one reading, as the source writes it, and prey, food; leaf as one.

Example keys: צדק · עבת · ערב · מקרא · מרט · מטע

### Kaikki machine-readable Hebrew dictionary strict source-explicit inflection-table forms from English Wiktionary (kaikki_wiktionary_hebrew) B02 · 2,731 rows · at rest: whole

Some lists open with be, become or grow, and a later word may lean on it: to be big, large, great. Alone it says large, where the source means to be large. Other later words stand well alone, and the text cannot tell which is which. Does each comma or semicolon of such a list divide? The list may have a bracket or a remark beside it, or a colon after it; those stay with the piece they touch. Many of these lists also say mostly the same thing, and the answer to the question on words that mostly say the same thing does not reach them.

- **divides**: Each comma or semicolon of these lists cuts: the page prints to be big, large and great as three readings, the later words without to be, as the source writes them.
- **whole**: No sign of these cuts: the page prints to be big, large, great as one reading, as written.

### Kaikki machine-readable Aramaic dictionary from English Wiktionary (kaikki_wiktionary_aramaic) B09 · 1,528 rows · at rest: whole

This is the question on words that mostly say the same thing. Each line of this dictionary is one wording of one sense of a word, and a sense may have more than one wording. Some lines list words that mostly say the same thing: donkey, ass, or to lie, to deceive. Do you want separate pills for such words, or one pill as the source writes it? Today the page prints donkey and ass as two pills. A word beside a form made from it, where the ledger's written list names it, as sweet, sweetened, stays one pill under every answer.

- **divides**: Separate pills: each comma or semicolon of these lists cuts, and the page prints donkey and ass as two readings, as it does today. Where the list stands after a note on the word's form, its first word keeps the note and what stands before it. The question on a label or a note may also cut there.
- **whole**: One pill: no sign of these cuts, and the page prints donkey, ass as one reading, as the source writes it.

### Unabridged Brown-Driver-Briggs Hebrew Lexicon structured source (unabridged_bdb_1906) B01 · 1,386 rows · at rest: whole

Many senses in this dictionary are lists of renderings with commas between them. Lists like crown, wreath (all single words) and wipe, wipe out (all opening with one word) are asked about in B06. When a rendering is a phrase (come near, approach), the route text alone cannot tell a list from a sentence, so the ledger read each such list and kept whole those where it found a piece leaning on another. Lists that open with a small verb and have a later piece that may lean on it are asked about in B02 and B05; one whose later phrases have their own verb (be sorry, have compassion) stays here. Does each comma of these lists divide? The answer holds whatever you answer elsewhere.

- **divides**: Every comma of these lists cuts, except one between a word and its own plural: the page prints come near and approach as two readings. A word or a phrase prints without the words beside it; nothing is added to it.
- **whole**: No comma of these lists cuts: the page prints come near, approach as one reading, as written.

### Classical Hebrew Words database (classical_hebrew_words) B01 · 1,343 rows · at rest: whole

Inside some rows the source writes two or more words side by side, each of which could render the Hebrew alone, like: enemy, foe. Should each be its own reading? A row here is one item of the source's gloss for its word; the source parts its items with a semicolon, and the store has already made a new row at each. So words side by side in one row may mean nearly the same thing, and no test can tell when they do not. The same question covers words parted by a stop, a slash or a question mark (murderer. slayer). Rows whose words lean on each other (be dark, dim) are not in this question and stay one reading under either answer.

- **divides**: The page prints each part as its own reading: enemy, foe prints enemy, and foe. A bracket, a sign or a lead word on one part stays with that part: bud(s), blossom(s) prints bud(s), and blossom(s); gnawing pain, or perh. sinew prints gnawing pain, and or perh. sinew. The comma, stop, slash or question mark at a cut is not printed: messenger? refuter? etc prints messenger, and refuter? etc.
- **whole**: The page prints the row as one reading, as the source writes it: enemy, foe.

Example keys: אהל · מבשר

### Kaikki machine-readable Hebrew dictionary strict source-explicit inflection-table forms from English Wiktionary (kaikki_wiktionary_hebrew) B05 · 1,286 rows · at rest: whole

Some lines put a label or a note on the word's form on one side of a sign and the reading on the other: a surname: Doron, or a Hebrew form and a colon, then cups, glasses, tumblers, or To; indicating a destination or end-point. A label or a note is no reading, and this dictionary's text cannot be changed, only cut. Does the sign cut the label or the note from the reading? The same question covers a surname, Hasson and a surname. Goldberg. A few lines hold a note on both sides of the sign: An interrogative particle, introducing a yes-no question.

- **divides**: The sign cuts: the page prints a surname and Doron as two pieces. The label or the note prints as a piece of its own, beside the reading. Where a note stands on both sides, the page prints each note as a piece, and neither is a reading: An interrogative particle, and introducing a yes-no question. Commas in the same line follow their own question where they have one, otherwise they stay.
- **whole**: That sign does not cut: the page prints a surname: Doron as one reading, label and all, as written.

### Wikidata Hebrew source-explicit form linked to exact English lexeme sense (wikidata_hebrew_explicit_form_english_sense) B01 · 943 rows · at rest: whole

Here the source gives each sense of a word one text, and some texts hold several words for that sense, with a comma, a slash or a semicolon between them: big/large; alive, living; nation, ethnic group. No sign in the row can tell whether one of the words means something different from the rest, and the line between a second word and a short description is a judgment, made row by row: Anas, genus of birds is not in this question. Today the page cuts at those commas, and it does not cut at the slashes or the semicolons. Should these signs cut the row? From the day this is wired, these rows print whole, at the commas too. This answer holds whatever you answer to the other questions.

- **divides**: Every one of these signs in these rows cuts: the page prints big and large as two readings, and alive and living as two, each word as the source writes it. In a row that also holds a semicolon between two descriptions only the comma cuts: stone, rock; building material prints stone and rock; building material, and if you also rule that such a semicolon cuts, it prints stone and rock and building material.
- **whole**: No sign in these rows cuts: the page prints big/large and alive, living as one reading each, as written. At the commas this is a change from today.

### Wikidata Hebrew source-explicit form linked to exact English lexeme sense (wikidata_hebrew_explicit_form_english_sense) B02 · 873 rows · at rest: whole

Some rows open with to and hold two or more words for one sense with a slash between them, where only the first has its to: to surround/encircle. No sign in the row can tell whether one of them means something different from the rest. Today the page does not cut at these slashes. Should the slash cut the row? Until you rule the page prints each of these rows whole. This answer holds whatever you answer to the other questions.

- **divides**: Every slash in these rows cuts: the page prints to surround and encircle as two readings. A later word prints as the source writes it, without the to; in to appear/be discovered the page prints to appear and be discovered, which keeps its own be.
- **whole**: No slash in these rows cuts: the page prints to surround/encircle as one reading, as written, as it does today.

### PanLex 2025 explicit English definition joined to continuity-confirmed Hebrew meaning (panlex_hebrew_english_definitions_20250201) B01 · 756 rows · at rest: whole

Some rows give several sayings of one meaning, with a comma or a semicolon between them: rapidly, fast. A few have a colon, a slash or a spaced hyphen there instead. In this dictionary every row is one definition of one meaning, so no sign in the row can tell whether a part means something different from the rest. Today the page may cut such a row at a comma, and never at the other signs. Should these signs cut the row, at the places listed row by row? This ledger as it rests prints each of these rows whole, at the commas too, from the day it is wired. This answer holds whatever you answer to the other questions.

- **divides**: The page prints each part between the listed places as a reading of its own: rapidly, fast prints rapidly and fast. A label, a bracket or a remark stays with the part it touches, even where it speaks of every part, and nothing is added to the others: figurative: dishonest, illegal prints figurative: dishonest, and illegal with no label. On such a row that is a wrong cut, and this answer takes it. A leading or, and or also stays in its part.
- **whole**: The page prints each row as one reading, as written. At the commas this is a change from today wherever today's rule cuts.

Example keys: תורה · פלוטו

### Kaikki machine-readable Hebrew dictionary strict source-explicit inflection-table forms from English Wiktionary (kaikki_wiktionary_hebrew) B08 · 625 rows · at rest: whole

The ledger read these lines one by one and marked the places where it found two readings, or a word and what it means. Some hold a cry sign (stop!, enough!, cease!), a stop (moderation, temperance. Self-control.), a hyphen that ends a word part (Infra-, sub-, under-.) or a later reading after a remark (a person killed, especially in war; casualty); others hold no such thing (the region of the nose, the face). Does each marked place divide?

- **divides**: Each marked place cuts: the page prints stop!, enough! and cease! as three readings. Where a cry sign or a stop itself is the marked place, the page leaves it out as it leaves out a comma, and any sign at the very end stays. A closing note stays with the last piece, even when it speaks of all the pieces.
- **whole**: No sign of these cuts: the page prints stop!, enough!, cease! as one reading, as written.

### Wikidata Hebrew source-explicit form linked to exact English lexeme sense (wikidata_hebrew_explicit_form_english_sense) B03 · 359 rows · at rest: whole

Some rows hold words with a slash between them that share a word written only once. In to be beaten/hit/struck the words hit and struck mean be hit and be struck; in evil/depraved person the word evil means evil person. Alone, such a word says something else. Should the slash cut the row? Until you rule the page prints each of these rows whole, as it does today. This answer holds whatever you answer to the other questions.

- **divides**: Every slash in these rows cuts: the page prints to be beaten, hit and struck as three readings, and evil and depraved person as two. Each piece prints as the source writes it, without the word it shares, so hit stands alone where the source means to be hit.
- **whole**: No slash in these rows cuts: the page prints to be beaten/hit/struck and evil/depraved person as one reading each, as written, as it does today.

### Hebrew WordNet exact Princeton WordNet 3.0 synset alignment and English gloss (omw_hebrew_pwn30) B01 · 332 rows · at rest: whole

Some rows give two wordings of one meaning, with a semicolon, a comma or a colon between them: make free from confusion or ambiguity; make clear. In this dictionary a row is one meaning of the word, so by the source's own account the second wording offers no different meaning. No sign in the row can tell a second wording from a note, so these rows were picked by hand. Today the page never cuts at a semicolon or a colon, and it cuts at a comma where a piece is short. Should these marks cut the row? From the day this is wired, each of these rows prints whole. This answer holds whatever you answer to the other question, and each answer cuts only at its own marks.

- **divides**: The page prints each wording as a reading of its own: make free from confusion or ambiguity and make clear. It cuts only at these marks. A word like or that opens a wording stays in it, and a label or a note stays with the wording it stands beside, even where it speaks of both.
- **whole**: The page prints each row as one reading, as written: make free from confusion or ambiguity; make clear. For a row with a comma that the page cuts today, this is a change from today.

### Kaikki machine-readable Hebrew dictionary strict source-explicit inflection-table forms from English Wiktionary (kaikki_wiktionary_hebrew) B07 · 294 rows · at rest: whole

Some lines hold a list of renderings that stands in Strong's text on file, after a colon and a dash: by implication to be relaxed: - flutter, move, shake. Does the dash, and each comma after it, divide? The sentence before the dash stays one piece, a comma inside it never cuts, and a bracket that opens with the ending of the word before it, (-r, over), stays with that word.

- **divides**: The dash and each comma after it cut: the page prints the sentence as one piece and flutter, move and shake as readings of their own.
- **whole**: Nothing here cuts: the page prints the whole line as one reading, as written.

### Unabridged Brown-Driver-Briggs Hebrew Lexicon structured source (unabridged_bdb_1906) B05 · 274 rows · at rest: whole

Other lists open with a small verb, be, become, grow, have, make or shew, and no later piece is a single form in -ed like esteemed (be firm, fast). Some later pieces still lean on the small verb: alone fast says fast, where the source means be fast; so do broken in be shattered, broken and busied with in be occupied, busied with. Others stand alone (be weak, languish). The ledger did not sort them one by one. Does each comma of such a list divide? This answer holds whatever you answer to the other questions.

- **divides**: Every comma of these lists cuts: the page prints be firm and fast as two readings, and each later piece prints as the source writes it, without the opening verb, leaning on it where it did. In a few lists only the commas the ledger marked by hand cut: be, or become, far, distant prints be, or become, far and distant.
- **whole**: No comma of these lists cuts: the page prints be firm, fast as one reading, as written.

### Brown-Driver-Briggs Hebrew Lexicon via Open Scriptures (openscriptures_bdb_1906) B01 · 273 rows · at rest: whole

Each row of this dictionary is one definition as the source's editors tagged it, and their notes say a series of definitions normally gets one tag each. Yet some tagged definitions hold a list with commas, some of them giving what a related word means in Arabic or Syriac. The commas asked about here each stand before a part that stands on its own, as in oppress, injure. The text cannot say whether a part is a second meaning or a second wording of one meaning, so the row stays whole until you answer. Does each comma of these lists divide? This answer holds whatever you answer to the other questions, and a list with commas of both kinds cuts only at the commas this question rules.

- **divides**: Each comma this question rules cuts: the page prints oppress and injure as two readings. Each part prints as the source writes it, and a part that stands twice prints once.
- **whole**: No comma this question rules cuts: the page prints oppress, injure as one reading, as written.

### Wikidata Hebrew source-explicit form linked to exact English lexeme sense (wikidata_hebrew_explicit_form_english_sense) B04 · 221 rows · at rest: whole

Some rows hold two or more words for one sense beside a note in round brackets, after a description or before a long tail: to provide/imbue (with something); Citrus medica, species of plant, citron. The note or the tail may speak of all the words. Should the slash in such a row, or the commas marked by hand in the rows that have them, cut the row? Today the page cuts at those commas and not at the slashes; from the day this is wired, each of these rows prints whole. This answer holds whatever you answer to the other questions.

- **divides**: The slash or the marked comma cuts, and a note or a tail stays where it stands, with the piece beside it, even when it speaks of all of them: the page prints to provide and imbue (with something) as two readings, and Citrus medica, species of plant and citron as two. A later word prints without the to or to be it shares, and with an or the source writes before it: in to be imbued/provided (with something) the piece provided (with something) stands alone where the source means to be provided, whatever you answer on to be beaten/hit/struck. A slash inside the brackets never cuts.
- **whole**: Nothing in these rows cuts: the page prints to provide/imbue (with something) and Citrus medica, species of plant, citron as one reading each, as written.

### Wikidata Hebrew source-explicit form linked to exact English lexeme sense (wikidata_hebrew_explicit_form_english_sense) B05 · 199 rows · at rest: whole

Some rows hold two or more descriptions of the word, with a semicolon between them or, in some rows, a comma: son, male offspring; a boy or man in relation to his parents. The word at the head stands only before the first. Is each later description a further reading? Today the page cuts at those commas and not at the semicolons; from the day this is wired, each of these rows prints without a cut there. This answer holds whatever you answer to the other questions.

- **divides**: Every semicolon in these rows cuts, except one before a remark that opens with the word specifically, and so does the one comma marked by hand in the rows that have one: the page prints son, male offspring and a boy or man in relation to his parents as two readings. A later description prints without the word at the head, and with an or the source writes before it. The comma after son stays unless you also rule that such a comma cuts, in the question on several words for one sense.
- **whole**: No sign in these rows cuts there: the page prints son, male offspring; a boy or man in relation to his parents as one reading, as written.

### Kaikki machine-readable Hebrew dictionary strict source-explicit inflection-table forms from English Wiktionary (kaikki_wiktionary_hebrew) B06 · 197 rows · at rest: whole

Some lists hold, as a whole, a later word that opens with a capital: Hashem, God, or Susa, Shushan, or pistachio, Pistacia vera, or text message, SMS, or hymn, sacred song, Psalm. The later word may be another name of one thing, a Latin name or initials. Does each comma or semicolon of these lists divide? Two spellings of one name stay whole under every answer where the ledger's written list of two forms names them, as Rebekah, Rebecca, and so does a name with what is said of it where the ledger's test or its written list of names finds it.

- **divides**: Each comma or semicolon of these lists cuts: the page prints Hashem and God as two readings. A bracket stays with the piece it touches, and a colon or a stop stays in the last piece.
- **whole**: No sign of these cuts: the page prints Hashem, God as one reading, as written.

### Unabridged Brown-Driver-Briggs Hebrew Lexicon structured source (unabridged_bdb_1906) B04 · 175 rows · at rest: whole

Some lists stand beside a bracket, a quote mark, a cry sign, a grammar word or a short note (produce, furnish: Imperfect), or hold a capital, a piece opened by or, or a part that leans. The ledger read each of them and marked by hand where one rendering ends and the next begins, at a comma, a semicolon or a colon. Does each marked place divide? This answer holds whatever you answer to the other questions.

- **divides**: Every marked place cuts, beside any cut another answer makes: the page prints produce and furnish: Imperfect as two readings. A sign stays with its own piece, a label at the head stays with the first piece after it, and a tail stays with the last piece before it, even when it speaks of all of them: top, summit, of tree prints top and summit, of tree.
- **whole**: No marked place cuts: the page prints produce, furnish: Imperfect as one reading, as written.

Example keys: משמר

### Kaikki machine-readable Aramaic dictionary from English Wiktionary (kaikki_wiktionary_aramaic) B01 · 149 rows · at rest: whole

Some lines are lists of words and phrases with commas or semicolons between them: crowd, large group of people, escort. Here the text alone does not show that each piece stands by itself, so the ledger read these lists and kept out those where it found a piece that cannot stand alone. Does each comma or semicolon of these lists divide? A word beside its own plural, such as horse, horses, is among them. Some of these lists also say mostly the same thing, and the answer to the question on words that mostly say the same thing does not reach them.

- **divides**: Each comma or semicolon of these lists cuts: the page prints crowd, large group of people and escort as three readings. A small word the source put there, such as or, stays in its piece.
- **whole**: No sign of these cuts: the page prints crowd, large group of people, escort as one reading, as written.

### OmegaWiki structured Hebrew-English DefinedMeaning relations and definitions (omegawiki_structured_defined_meaning) B01 · 132 rows · at rest: whole

Each definition in this dictionary is written for one meaning of the source, but some give that meaning in two or more wordings, parted by a semicolon, a comma or a full stop: To come to a halt; to cease moving. Each wording could stand alone in a pill. No rule can find these rows, so the ledger lists the places by hand. Should each wording print as its own reading? Today the page may cut such a row at a comma; from the day this is wired, each prints as one reading, whole. Any other row is outside this question and stays whole under either answer. This answer holds whatever you answer to the other question.

- **divides**: The page cuts each of these rows at the listed places only and prints each wording as a reading of its own: To come to a halt; to cease moving. prints To come to a halt and to cease moving.. And To be in motion, to go from one place to another. prints To be in motion and to go from one place to another.. A remark or a credit after the last wording stays with it, and a word in brackets at the head stays with the first.
- **whole**: The page prints each row as one reading, as written: To be in motion, to go from one place to another.

### Unabridged Brown-Driver-Briggs Hebrew Lexicon structured source (unabridged_bdb_1906) B02 · 122 rows · at rest: whole

Some lists open with be, and a later word ends in -ed (be accounted, thought, esteemed). Such a word leans on the be: alone it says esteemed, where the source means be esteemed. Does each comma of such a list divide? This answer holds whatever you answer to the other questions.

- **divides**: Every comma of these lists outside a bracket cuts: the page prints be accounted, thought and esteemed as three readings. A later word in -ed prints without the be it leans on; a later piece with its own verb, as rise in be high, exalted, rise, stands as it is.
- **whole**: No comma of these lists cuts: the page prints be accounted, thought, esteemed as one reading, as written.

Example keys: נקע · זעף

### UBS Dictionary of Biblical Hebrew v0.9.2 exact definitions and glosses (ubs_sdbh_hebrew_v0_9_2) B04 · 101 rows · at rest: whole

Some texts hold two or more parts under one label or one note: a label in the first part says how sure the source is, what kind of word this is or in what kind of text it is found, or a note stands only after the last part, and that label or note can speak of every part, like: meaning unknown; possibly: = musical term; or: = musical ... Should the parts print as separate readings? A text whose second part leans on the first, or whose first part holds no wording of its own, stays as one reading under either answer.

- **divides**: The page prints each part as its own reading, with the source's own lead word. Nothing moves: the label stays with the first piece and a closing note stays with the last.
- **whole**: The page keeps the parts together in one reading, as the source writes them.

### Strong's Hebrew concordance with explicit source form lists via Hebrew Wikisource (wikisource_strongs_explicit_forms) B03 · 99 rows · at rest: whole

In some texts of the Wikisource edition a semicolon stands between two King James words, like: chap(-man); divers. The ledger lists these whole texts by hand, because no test can find them, so they wait for you. Should the two words be separate readings? Today the page cuts at that semicolon and prints chap(-man) and divers as two pills. From the day this is wired it prints what you answer, and one reading until you answer.

- **divides**: The semicolon cuts: the page prints chap(-man) and divers as two readings, and the semicolon at the cut is left out, as a comma is.
- **whole**: The semicolon does not cut: the page prints chap(-man); divers as one reading, as the source writes it.

Example keys: מוצאת · נספר · ספרתה · נעלית · עולה · ספרה

### Brown-Driver-Briggs Hebrew Lexicon via Open Scriptures (openscriptures_bdb_1906) B02 · 83 rows · at rest: whole

Some lists under one tag of the source, some of them giving what a related word means in Arabic or Syriac, share a word across their commas, like be firm, strong: the be serves both, so alone strong says strong where the source means be strong. In others a later word serves both sides, a part leans on words outside the list, or the last part is only half a word. Does each comma of these lists divide? This answer holds whatever you answer to the other questions, and a list with commas of both kinds cuts only at the commas this question rules.

- **divides**: Each comma this question rules cuts: the page prints be firm and strong as two readings. Each part prints as the source writes it with nothing added, so a part can lack the word it leans on or be half a word.
- **whole**: No comma this question rules cuts: the page prints be firm, strong as one reading, as written.

Example keys: חרר · כור

### Kaikki machine-readable Aramaic dictionary from English Wiktionary (kaikki_wiktionary_aramaic) B03 · 51 rows · at rest: whole

Some lists have a bracket or a remark beside them: root, stump, shoot (of a plant), or panelling, structure, wall, exact meaning dubious. A bracket or a remark stands with the piece it touches and may speak of the whole list. Does each comma or semicolon of such a list divide? The comma before the remark itself never cuts. Some of these lists also say mostly the same thing, and the answer to the question on words that mostly say the same thing does not reach them.

- **divides**: Each comma or semicolon of these lists cuts: the page prints root, stump and shoot (of a plant) as three readings. A bracket or a remark stays with the piece it touches, even where it speaks of the whole list; nothing is added to the others.
- **whole**: No sign of these cuts: the page prints root, stump, shoot (of a plant) as one reading, as written.

### Classical Hebrew Words database (classical_hebrew_words) B02 · 45 rows · at rest: whole

In some rows a bracket or a short tag stands at the head or the tail of words side by side, and may speak of all of them, like: (female) dweller, inhabitant. Should each word be its own reading? The source does not say whether the bracket or tag speaks of one word or of all.

- **divides**: The page prints each word as its own reading, and the bracket or tag stays only with the word it touches, even where it speaks of all: (female) dweller, inhabitant prints (female) dweller, and inhabitant.
- **whole**: The page prints the row as one reading, as the source writes it: (female) dweller, inhabitant.

### Semantic Dictionary of Biblical Hebrew via HiperBiblia (hiperbiblia_sdbh) B01 · 41 rows · at rest: whole

Inside one row the source sometimes writes two or more words side by side, each of which could render the Hebrew alone, like: joy, delight. Should each be its own reading? Each row is one item of the source's own list for its word, so words side by side in one row may mean nearly the same thing, and no test can tell when they do not; these rows stand in a written list. The same question covers words parted by a question mark, an exclamation mark or a colon (horn? trumpet?). Rows whose words lean on each other (to be, become weak; mouth of well, cave, pit) are not in the list and stay as one reading under either answer.

- **divides**: The page prints each part as its own reading, without the sign between them: joy, and delight. A bracket stays with the part it touches, even where it may speak of every part: serious, and grievous (suffering). A question mark or an exclamation mark at a cut is not printed, so only the last part keeps its sign: horn? trumpet? prints horn, and trumpet?
- **whole**: The page prints the row as one reading, as the source writes it: joy, delight.

Example keys: צלח · מתנים · עבד · פלח · שעשעים · עדה

### Hebrew WordNet PWN 3.0 alignment bridged to Open English WordNet 2025 by complete permanent-sense-key agreement (omw_hebrew_oewn2025_permanent_sense_key_bridge) B01 · 40 rows · at rest: whole

Some rows give two wordings of one meaning, with a semicolon or a comma between them: make a compromise; arrive at a compromise. In this dictionary a row is one meaning of the word, so by the source's own account the second wording offers no different meaning. No sign in the row can tell a second wording from a note, so these rows were picked by hand. Today the page never cuts at a semicolon, and it cuts at a comma where a piece is short. Should these marks cut the row? From the day this is wired, each of these rows prints whole unless you answer that they cut. This answer holds whatever you answer to the other question: no row stands under both, and each answer cuts only at its own marks.

- **divides**: The page prints each wording as a reading of its own: make a compromise and arrive at a compromise. It cuts only at these marks, and at no other mark of the same row. A word like or or also that opens a wording stays in it, and a note stays with the wording it stands beside, even where it speaks of both.
- **whole**: The page prints each row as one reading, as written: make a compromise; arrive at a compromise. For a row with a comma that the page cuts today, this is a change from today.

### STEP Bible Translators Brief Lexicon Hebrew scholar-created Gloss column (stepbible_tbesh_gloss) B02 · 40 rows · at rest: whole

Some rows hold two or three parts with a slash between them and no colon: rain/teacher. Each part can stand alone, and nothing in the row says whether its parts are one meaning said twice or different meanings. Should the page print each part as its own pill? They print as one pill, as written, until you rule.

- **whole**: One pill, as written, as today: rain/teacher.
- **divides**: A pill for each part: rain and teacher. The page cuts at the slash and nowhere else.

### Hebrew Wiktionary source-explicit English translations at exact Hebrew page titles (hewiktionary_hebrew_exact_english_translation) B01 · 29 rows · at rest: whole

Some rows hold several words with a comma or a semicolon between them: horror, terror. In this dictionary a row is one translation from the source's page, and the source's own guide writes two translations with another sign, so that each has a row of its own; here the words stand inside one row. No sign in the row can tell whether the words after the sign mean something different from the words before it. Should these signs cut the row? Today the page cuts at those commas and not at those semicolons; this ledger as it rests prints all of these rows whole, from the day it is wired. This answer holds whatever you answer to the other questions.

- **divides**: The page prints the words between the signs as readings of their own. The row horror, terror prints horror and terror, as it does today; the row completely; totally; entirely; utterly, whole today, prints completely, totally, entirely and utterly. A round bracket at the end stays with the last words before it: prove perjury; discredit; impeach (a witness) prints prove perjury, discredit and impeach (a witness).
- **whole**: The page prints each row as one reading, as written: horror, terror. For the rows with a comma this is a change from today.

### Kaikki machine-readable Aramaic dictionary from English Wiktionary (kaikki_wiktionary_aramaic) B04 · 22 rows · at rest: whole

Some lines give a word and what it means, in either order, with a colon, a comma or a semicolon between them: violent anger: rage, or shechinah, the divine presence of God. Is what comes after that one sign a second reading of the word?

- **divides**: That one sign cuts: the page prints shechinah and the divine presence of God as two readings. Commas inside the explanation stay in it.
- **whole**: That sign does not cut: the page prints shechinah, the divine presence of God as one reading, as written.

### Classical Hebrew Words database (classical_hebrew_words) B03 · 20 rows · at rest: whole

In some rows the source gives two names or spellings of one person, people or place side by side, like: Saul, Shaul. Should each be its own reading?

- **divides**: The page prints each name as its own reading: Saul, Shaul prints Saul, and Shaul. A tag after the second name stays with it: Enoch, Hanoch (pr.n.) prints Enoch, and Hanoch (pr.n.).
- **whole**: The page prints the row as one reading, as the source writes it: Saul, Shaul.

### Hebrew WordNet exact Princeton WordNet 3.0 synset alignment and English gloss (omw_hebrew_pwn30) B02 · 18 rows · at rest: whole

Some rows add, after a semicolon, a description with a naming word of its own that tells one property of the thing. One row reads illusory perception, then after a semicolon, a common symptom of severe mental disorder. In this dictionary a row is one meaning of the word. Such a description may render the word or may only say something about it, and no sign in the row can tell, so these rows were picked by hand. Today the page never cuts at a semicolon. Should these semicolons cut the row? Until you rule the page prints each of these rows whole. This answer holds whatever you answer to the other question, and each answer cuts only at its own marks.

- **divides**: The page prints the wording and the description as readings of their own: illusory perception and a common symptom of severe mental disorder. It cuts only at these semicolons, and a note stays with the piece it stands beside.
- **whole**: The page prints each row as one reading, as written.

### PanLex 2024 exact same-meaning Hebrew-English lexical expression (panlex_hebrew_english_meanings_20240301) B01 · 18 rows · at rest: whole

Some rows hold several words for one meaning, with a comma or a slash between them: dam, fence, barrier. In this dictionary every row is one entry of the source on one meaning, so nothing in the row can tell whether a word in such a list means something different from the rest. Today the page cuts at those commas and prints the words as separate readings, and it does not cut at the slashes. Should these signs cut the row? Until you rule the page prints each of these rows whole, at the commas too. This answer holds whatever you answer to the other questions.

- **divides**: The page prints each part between the signs as a reading of its own, as it does today at the commas: the row dam, fence, barrier prints dam, fence and barrier, and the row Elche/Elx prints Elche and Elx.
- **whole**: The page prints each row as one reading, as written (dam, fence, barrier; Elche/Elx). At the commas this is a change from today.

Example keys: מכשול · ידע · ידיעה · מיכל · הכרה · מקל

### Hebrew Wiktionary source-explicit pointed inflection forms joined to same-entry English translations (hewiktionary_hebrew_explicit_inflection_english_translation) B01 · 16 rows · at rest: whole

Some rows hold two wordings with a comma between them: horror, terror. In this dictionary a row is one item of the source's list of translations, and the source's own guide puts another sign between two items; here the two wordings stand inside one item. No sign in the row can tell whether the second means something different from the first. Today the page cuts at those commas and prints the two as separate readings. Should these commas cut the row? Until you rule the page prints each of these rows whole. This answer holds whatever you answer to the other question.

- **divides**: The page prints the wording on each side of the comma as a reading of its own, as it does today: the row horror, terror prints horror and terror.
- **whole**: The page prints each row as one reading, as written: horror, terror. This is a change from today.

### Kaikki machine-readable Aramaic dictionary from English Wiktionary (kaikki_wiktionary_aramaic) B06 · 16 rows · at rest: whole

Some lists hold, as a whole, a later word with a capital: Gehenna, Hell, or Shabbat, Sabbath, Saturday, or Persia, the Persians, or the Land of Israel, Palestine, the Levant, Syria. The later word may be another name of one thing. Does each comma of these lists divide? A name with what is said of it stays whole under every answer where the ledger's written list of names finds it, as Jesus, a Biblical character.

- **divides**: Each comma of these lists cuts: the page prints Gehenna and Hell as two readings. A bracket stays with the piece it touches.
- **whole**: No sign of these cuts: the page prints Gehenna, Hell as one reading, as written.

### Kaikki machine-readable Aramaic dictionary from English Wiktionary (kaikki_wiktionary_aramaic) B08 · 16 rows · at rest: whole

The ledger read these lines one by one and marked the places where it found two readings, or a word and what it means. Some hold a cry sign (woe!, alas!), a word for the rest of a kind (anything used for seasoning; spices, etc.) or a later reading after a remark (a show, exhibition; also metaphorically, a farce); others hold no such thing (An upper story, chamber, or room.). Does each marked place divide?

- **divides**: Each marked place cuts: the page prints woe! and alas! as two readings. A cry sign stays with the piece it touches. A comma the ledger did not mark stays inside its piece, and a small word the source put there, such as or, stays in its piece.
- **whole**: No sign of these cuts: the page prints woe!, alas! as one reading, as written.

### Wikidata Hebrew lexeme explicit English sense gloss (wikidata_hebrew_lexeme_gloss) B01 · 16 rows · at rest: whole

Here the source gives each sense of a word one text, and some texts hold several words for that sense, with a comma or a slash between them: grief/mourning; trouble, disaster; nation, ethnic group. No sign in the row can tell whether one of the words means something different from the rest, and the line between a second word and a short description is a judgment, made row by row: Anas, genus of birds is not in this question. Today the page cuts at those commas, and it does not cut at the slashes. Should these signs cut the row? From the day this is wired, these rows print whole, at the commas too. This answer holds whatever you answer to the other questions.

- **divides**: Every one of these signs in these rows cuts: the page prints grief and mourning as two readings, and trouble and disaster as two, each word or wording as the source writes it.
- **whole**: No sign in these rows cuts: the page prints grief/mourning and trouble, disaster as one reading each, as written. At the commas this is a change from today.

Example keys: לאם · אבול · איבול

### Strong's Hebrew concordance with explicit source form lists via Hebrew Wikisource (wikisource_strongs_explicit_forms) B01 · 16 rows · at rest: whole

The print ends its sentence about a word with the sign :-- and then gives the King James renderings. In some texts of the Wikisource edition a semicolon stands before the dash there, so sentence and rendering share one text. Two of those are asked here, where each part stands alone, like: or (abstractly) capture; also a fastness; --castle. Should they be separate readings? Every other such text stays one reading under either answer: what stands before the sign holds a pointer, an origin label, a spelling, a restatement after i.e., a name's description or a remark, or leans on earlier routes, or a note follows (excrement; -dung. Also chariy). So do meanings inside one round bracket.

- **divides**: The page prints or (abstractly) capture, also a fastness and --castle as three readings, and continually (i.e. to the most distant point of view) and --alway(-s) as two. The semicolon at a cut is left out, as a comma is, and the dash stays on the word.
- **whole**: The page prints each text as one reading, as the source writes it: or (abstractly) capture; also a fastness; --castle.

### UBS Dictionary of Biblical Hebrew v0.9.2 exact definitions and glosses (ubs_sdbh_hebrew_v0_9_2) B02 · 14 rows · at rest: whole

Inside one entry of its gloss list the source sometimes writes two words side by side, each of which could render the Hebrew alone, like: pain, trouble. Should they be two readings? The ledger holds these texts in a written list, so nothing here is a guess about the kind of text, and the same question covers two interjections written side by side in one gloss. Glosses whose words lean on each other are not in the list and stay as one reading.

- **divides**: The page prints two readings, the words on each side of the mark: pain, and trouble.
- **whole**: The page prints the gloss as one reading, as the source writes it: pain, trouble.

Example keys: עצבה · לחץ · ערב · חזק · עוד · אפרתה

### Strong's Hebrew concordance with explicit source form lists via Hebrew Wikisource (wikisource_strongs_explicit_forms) B02 · 12 rows · at rest: whole

In three texts of the Wikisource edition a full stop stands between the last two King James words, where the print has a comma, like: thing. word. Should the full stop divide them into two readings?

- **divides**: The full stop cuts: the page prints thing and word as two readings, and the stop at the cut is left out, as a comma is.
- **whole**: The full stop does not cut: the page prints thing. word as one reading, as written.

### Unabridged Brown-Driver-Briggs Hebrew Lexicon structured source (unabridged_bdb_1906) B03 · 11 rows · at rest: whole

A few times two renderings have only an exclamation mark, a question mark or a stray full stop between them (lo! behold!). Does that sign divide them into two readings? This answer holds whatever you answer to the other questions.

- **divides**: The sign between them cuts: the page prints lo and behold! as two readings. The sign at the cut is left out, and a sign at the very end stays.
- **whole**: The sign does not cut: the page prints lo! behold! as one reading, as written.

Example keys: טוב · מה

### UBS Dictionary of Biblical Hebrew v0.9.2 exact definitions and glosses (ubs_sdbh_hebrew_v0_9_2) B03 · 10 rows · at rest: whole

In a few texts the source offers two or more meanings side by side, parted by a comma, a semicolon or a full stop, like: a fortified town, or a fortified place within a town. Should each meaning be its own reading? The ledger lists these texts by hand, because no test can find them, so they wait for you. A text that opens with a label saying how sure the source is or what kind of word this is, or that has a note only after the last part, has its own question, B04. Today the page cuts at each semicolon outside round brackets and then by its comma rule, and prints a fortified town beside the whole text. From the day this is wired it prints what you answer, and one reading until you answer.

- **divides**: The page prints each meaning as its own reading, with the source's own lead word: a fortified town, and or a fortified place within a town or on its walls. Nothing moves: words at the head that cover both stay with the first piece, and words after the last meaning that cover both stay with the last piece.
- **whole**: The page keeps the meanings together in one reading, as the source writes them.

Example keys: האטד · אטד · בצרון · סחרה · בת · ראש

### Hebrew Wiktionary source-explicit full spellings joined to same-entry English translations (hewiktionary_hebrew_explicit_full_spelling_english_translation) B01 · 9 rows · at rest: whole

Some rows hold several words with a comma or a semicolon between them: horror, terror. In this dictionary a row is one translation from the source's page, and the source's own guide writes two translations with another sign, so that each has a row of its own; here the words stand inside one row. No sign in the row can tell whether the words after the sign mean something different from the words before it. Should these signs cut the row? Today the page cuts at those commas and not at those semicolons; this ledger as it rests prints all of these rows whole, from the day it is wired. This answer holds whatever you answer to the other question.

- **divides**: The page prints the words between the signs as readings of their own. The row horror, terror prints horror and terror, as it does today; the row prove perjury; discredit; impeach (a witness), whole today, prints prove perjury, discredit and impeach (a witness): the round bracket at its end stays with the last words before it.
- **whole**: The page prints each row as one reading, as written: horror, terror. For the rows with a comma this is a change from today.

### Kaikki machine-readable Aramaic dictionary from English Wiktionary (kaikki_wiktionary_aramaic) B02 · 9 rows · at rest: whole

Some lists open with be, and a later word may lean on it: to be strong, mighty. Alone it says mighty, where the source means to be mighty. Other later words stand well alone, and the text cannot tell which is which. Does each comma of such a list divide? Some of these lists also say mostly the same thing, and the answer to the question on words that mostly say the same thing does not reach them.

- **divides**: Each comma of these lists cuts: the page prints to be strong and mighty as two readings, the later words without to be, as the source writes them.
- **whole**: No sign of these cuts: the page prints to be strong, mighty as one reading, as written.

### Kethoneth Yoseph 1887 source-image-reviewed exact Hebrew abbreviation definitions (kethoneth_yoseph_1887_source_image_reviewed) B01 · 8 rows · at rest: whole

This book explains Hebrew short forms. Some short forms stand for several words together, one word for each letter. The short form חג״ת stands for three words, and the book writes them with commas: grace, power, beauty. They are one explanation in the book, which puts a semicolon between two explanations and none here. Should the page print such a list as one pill, or each word as its own pill? Today the page prints each word as its own pill; from the day this ledger is wired it prints the whole list as one pill until you rule. From that day, under either answer, a list whose first words speak of all its names prints as one pill.

- **whole**: The page prints the whole list as one pill, as the book writes it: grace, power, beauty.
- **divides**: The page prints each word as its own pill, with the commas gone and the book's full stop kept on the last word: three pills here, the last of them beauty.

### Semantic Dictionary of Biblical Hebrew via HiperBiblia (hiperbiblia_sdbh) B02 · 7 rows · at rest: whole

The source sometimes writes a wording, an equals sign, and what the wording means, like: "straight way" = safe journey. Should the wording and what it means be two readings? The source writes the same thing with the sign > too (blood > bloodshed), but that sign counts as a bracket with no partner, and a text with such a bracket is never cut, so those rows print as one reading under either answer. An equals sign inside a bracket (to catch up with (= happen)) or at the very start of a row also stays as it is under either answer.

- **divides**: The page prints the wording as one reading and what it means as another, without the equals sign: "straight way", and safe journey. Any quotation marks stay on the wording.
- **whole**: The page prints the wording and what it means as one reading, as the source writes them.

Example keys: אם · קשר · אטר · ישר · דוה

### Kaikki machine-readable Aramaic dictionary from English Wiktionary (kaikki_wiktionary_aramaic) B05 · 7 rows · at rest: whole

Some lines put a label or a note on the word's form on one side of a sign and the reading on the other: before me: first-person singular suffix form of קדם, or plural participle/present of יְדַע (yəḏaʿ), we know, or a male given name, Yeshu or Jeshu. A label or a note is no reading, and this dictionary's text cannot be changed, only cut. Does the sign cut the label or the note from the reading? A few lines hold a note on both sides of the sign: A greeting; similar to hello.

- **divides**: The sign cuts: the page prints the words we know and the note before them as two pieces. The label or the note prints as a piece of its own, beside the reading. Where a note stands on both sides, the page prints each note as a piece, and neither is a reading: A greeting, and similar to hello. Commas in the same line follow their own question where they have one, otherwise they stay.
- **whole**: That sign does not cut: the page prints the whole line, from first-person common plural participle/present to we know, as one reading, note and all, as written.

### Wikidata Hebrew lexeme explicit English sense gloss (wikidata_hebrew_lexeme_gloss) B03 · 6 rows · at rest: whole

Some rows hold two or more descriptions of the word, with a semicolon or a comma between them: ruby, variety of corundum, mineral, gemstone. The word at the head stands only before the first. Is each later description a further reading? Today the page cuts at those commas where the pieces are short and not at the semicolons; from the day this is wired, each of these rows prints without a cut there. This answer holds whatever you answer to the other questions.

- **divides**: Every one of these signs cuts: the page prints ruby, variety of corundum and mineral and gemstone as three readings. A later description prints without the word at the head, and with an or the source writes before it. The comma after the word at the head stays.
- **whole**: No sign in these rows cuts there: the page prints ruby, variety of corundum, mineral, gemstone as one reading, as written.

Example keys: ארוע

### Brown-Driver-Briggs Hebrew Lexicon via Open Scriptures (openscriptures_bdb_1906) B03 · 4 rows · at rest: whole

A few times two renderings under one tag of the source have no comma between them, only a semicolon, a question mark, a full stop or an & sign, like by means of what? how? Does that sign divide them? This answer holds whatever you answer to the other questions: where commas stand beside the sign, they wait on their own questions.

- **divides**: The sign between them cuts: the page prints by means of what and how? as two readings. The sign at the cut is left out, and a sign at the very end stays.
- **whole**: The sign does not cut: the page prints by means of what? how? as one reading, as written.

Example keys: ב · בצל · גמד · אלה

### Hebrew WordNet PWN 3.0 alignment bridged to Open English WordNet 2025 by complete permanent-sense-key agreement (omw_hebrew_oewn2025_permanent_sense_key_bridge) B02 · 3 rows · at rest: whole

One definition reads the end of a word, then in round brackets a suffix or inflectional ending or final morpheme. The bracket gives a second wording of the one meaning, and in this dictionary a row is one meaning of the word, so by the source's own account it offers no different meaning. No sign can tell it from a bracket that only narrows a wording, so it was picked by hand. Today the page never cuts at a round bracket and prints this row whole. Should this bracket cut the row? From the day this is wired, the row prints whole unless you answer that it cuts. This answer holds whatever you answer to the other question: no row stands under both, and each answer cuts only at its own marks.

- **divides**: The page prints the end of a word and a suffix or inflectional ending or final morpheme as readings of their own. It cuts at the opening bracket only, so the closing bracket stands at the end of the second reading until the page takes it off, and that is a step of its own that the page must add.
- **whole**: The page prints the row as one reading, as written, with its brackets.

### BiblicalTools Living Lexicon exact Strong glosses and STEPBible Hebrew-Aramaic lemmas (biblicaltools_living_lexicon) B01 · 2 rows · at rest: whole

Two rows hold two renderings with only a full stop or a slash between them: Ludim. Lydians and country/planet. Each rendering alone renders the Hebrew. Today the page prints each such row as one reading, as written, and from the day this ledger is wired it still does, unless you choose otherwise. Should the page print each rendering as its own reading?

- **whole**: The page prints each row as one reading, as written: Ludim. Lydians and country/planet.
- **divides**: The page prints two readings for each row, cut at that mark: Ludim and Lydians, country and planet.

Example keys: לודי · ארץ

### Classical Hebrew Words database (classical_hebrew_words) B04 · 2 rows · at rest: whole

A few rows set the word of one edition of the source's dictionary against the word of another, with a slash between them: tamarisk DCH / [DCHR juniper]. Should each side be its own reading?

- **divides**: The page prints each side as its own reading, with its tag and its bracket: tamarisk DCH / [DCHR juniper] prints tamarisk DCH, and [DCHR juniper].
- **whole**: The page prints the row as one reading, as the source writes it: tamarisk DCH / [DCHR juniper].

Example keys: ער · נאהבת

### Wikidata Hebrew lexeme explicit English sense gloss (wikidata_hebrew_lexeme_gloss) B02 · 2 rows · at rest: whole

Some rows hold words with a slash between them that share a word or a phrase written only once. In to be exiled/deported the word deported means be deported; in pot used for cooking food by boiling/seething the word seething means a pot used for cooking food by seething. Alone, such a word says something else. Should the slash cut the row? Today the page prints each of these rows whole, and from the day this is wired it still does, unless you rule that it cuts. This answer holds whatever you answer to the other questions.

- **divides**: Every slash in these rows cuts: the page prints to be exiled and deported as two readings, and pot used for cooking food by boiling and seething as two. Each piece prints as the source writes it, without the words it shares, so deported stands alone where the source means to be deported, and seething where the source means a pot used for cooking food by seething.
- **whole**: No slash in these rows cuts: the page prints to be exiled/deported as one reading, as written, as it does today.

Example keys: גלה · פרור

### MACULA exact Hebrew morph surfaces with Cherith English definitions (macula_hebrew_cherith_surface_english_2022) B01 · 1 rows · at rest: whole

A row writes two renderings with a slash between them, and the last word belongs to both: thumbs/big toes of. The pattern is too rare to make a rule from, so it waits for you. Should the slash cut it into two readings? This answer holds whatever you answer to the other questions.

- **divides**: The page prints thumbs and big toes of as two readings. The piece thumbs prints without the of that the two share; nothing is added to it.
- **whole**: The page prints thumbs/big toes of as one reading, as written.

Example keys: בהנות

### STEP Bible Translators Brief Lexicon Hebrew scholar-created Gloss column (stepbible_tbesh_gloss) B03 · 1 rows · at rest: whole

One row holds two names with a comma between them: Samgar, Nebu-sar-sekim. The source gives this same text to two numbers, each filed as one person. This row is the number whose Hebrew does not hold Samgar: that name stands in the other's Hebrew. Are the two names one reading or two here? Today the page prints two pills. Until you rule, this ledger holds the row as one pill.

- **whole**: One pill, as written: Samgar, Nebu-sar-sekim.
- **divides**: Two pills, as today: Samgar and Nebu-sar-sekim.


## name_alone: 5 branches, 1,960 rows

### Hebrew Wikipedia 20260701 direct English interlanguage title (wikimedia_hebrew_english_interlanguage_title_20260701) B01 · 1,866 rows · at rest: as_written

Some rows are an English Wikipedia title that carries a filing word in round brackets: Dolls (disambiguation). Wikipedia uses that word for a page that lists other pages of one name, and it says nothing about what the Hebrew means. Rows whose round brackets say which thing is meant, as in Hoe (tool), are not in this question: there the name and that word stay one reading. Should the page print the filing word? These rows print as they do today until you rule. To print the name alone the page needs one step of its own, because the store's text does not change. This answer holds whatever you answer to the other question.

- **as_written**: The page prints each row as one reading, as written, as it does today: Dolls (disambiguation).
- **name_alone**: The page prints only the name before the round brackets, as one reading: Dolls, once it has the one step of its own that this answer needs; until then these rows print as written. The store keeps each text as it is.

### BiblicalTools Living Lexicon exact Strong glosses and STEPBible Hebrew-Aramaic lemmas (biblicaltools_living_lexicon) B05 · 51 rows · at rest: as_written

Some rows give a name with a note in round brackets beside it: Ephai (from margin). The note says that the name comes from the margin, that it is given with the Hebrew article, or in which verse it stands. A name and its note count as one reading, so no answer here cuts. Today the page prints each such row as one reading, as written, and from the day this ledger is wired it still does, unless you choose otherwise. Should the page print the name alone? A declaration cannot leave words out, so that answer needs one step of the page's own.

- **as_written**: The page prints each row as one reading, as written: Ephai (from margin).
- **name_alone**: The page prints only the word just before the round bracket, which is the name: Ephai. In and Zehoar (from the margin) that also leaves out the word and, so it prints Zehoar. It needs a step of its own for this, and until it has that step the row prints as written. The store keeps the row as it stands.

### Wikidata Hebrew lexeme explicit English sense gloss (wikidata_hebrew_lexeme_gloss) B05 · 20 rows · at rest: as_written

Some rows give only a label and then a name in round brackets: given name (Adva); family name (Albert). The label is no reading, and the name in the brackets would be. Should the page print the name alone? Today the page prints each of these rows whole, label and name together, and from the day this is wired it still does, unless you rule otherwise. To print the name alone the page needs one step of its own, because a declaration keeps every character. This answer holds whatever you answer to the other questions.

- **as_written**: The page prints given name (Adva) as one reading, as written, as it does today.
- **name_alone**: The page prints the name alone, Adva, once it has the one step of its own that this answer needs; until then these rows print as written. They stay in the store as they are.

### BiblicalTools Living Lexicon exact Strong glosses and STEPBible Hebrew-Aramaic lemmas (biblicaltools_living_lexicon) B02 · 18 rows · at rest: as_written

Some rows give a name and then words that point at another entry, with the entry's number gone: Merari. See also. The words point nowhere, so they are no reading. Today the page prints each such row as one reading, as written, and from the day this ledger is wired it still does, unless you choose otherwise. A cut would print the pointing words as a reading of their own, so no answer here cuts. Should the page print the name alone? A declaration cannot leave words out, so that answer needs one step of the page's own.

- **as_written**: The page prints each row as one reading, as written: Merari. See also.
- **name_alone**: The page prints only the name, which is the word before the full stop or before the round bracket: Merari. It needs a step of its own for this, and until it has that step the row prints as written. The store keeps the row as it stands.

### BiblicalTools Living Lexicon exact Strong glosses and STEPBible Hebrew-Aramaic lemmas (biblicaltools_living_lexicon) B03 · 5 rows · at rest: as_written

One row is a sentence on a name, with the name at its end. It reads "once (Psalm 132:6) perhaps for Ephraim", then a semicolon, then "also of an Israelitish woman; Ephrath". Only the last word renders the Hebrew, and the words before it are a note. A cut at the semicolons would print the note as readings, so no answer here cuts. Today the page prints the row as one reading, as written, and from the day this ledger is wired it still does, unless you choose otherwise. Should the page print the name alone? A declaration cannot leave words out, so that answer needs one step of the page's own.

- **as_written**: The page prints the row as one reading, the whole sentence as written.
- **name_alone**: The page prints only the word after the last semicolon: Ephrath. It needs a step of its own for this, and until it has that step the row prints as written. The store keeps the row as it stands.


## two_forms: 2 branches, 23 rows

### BiblicalTools Living Lexicon exact Strong glosses and STEPBible Hebrew-Aramaic lemmas (biblicaltools_living_lexicon) B04 · 17 rows · at rest: as_written

Some rows hold a word or an ending in round brackets that may join the word beside it: fool (ish). Such a row offers two forms, here fool and foolish. A cut at the bracket would leave the part in the bracket alone, which is no reading, so no answer here cuts. Today the page prints each such row as one reading, as written, and from the day this ledger is wired it still does, unless you choose otherwise. Should the page print the two forms as two readings? A declaration can only cut, so that answer needs one step of the page's own.

- **as_written**: The page prints each row as one reading, as written: fool (ish).
- **two_forms**: The page prints two readings for each row, the row's two forms: fool and foolish, labour and labourer, to and towards, against and over against, Mede and Medes, Mehunim and Mehunims, Jobesh and Jobesh-Gilead. It needs a step of its own for this, and until it has that step the row prints as written. The store keeps the row as it stands.

### Open Scriptures Hebrew Lexical Index (openscriptures_lexical_index) B02 · 6 rows · at rest: as_written

Some rows hold an ending in round brackets that may join the word before it: Mede(-s). Such a row offers two forms, here Mede and Medes. A cut at the bracket would leave the part in the bracket alone, which is no reading, so no answer here cuts. Today the page prints each such row as one reading, as written, and from the day this ledger is wired it still does, unless you choose otherwise. Should the page print the two forms as two readings? A declaration can only cut, so that answer needs one step of the page's own.

- **as_written**: The page prints each row as one reading, as written: Mede(-s)
- **two_forms**: The page prints two readings for each row, the row's two forms: Mede and Medes, Mehunim and Mehunims. It needs a step of its own for this, and until it has that step the row prints as written. The store keeps the row as it stands.

Example keys: מדי · מעונים


## word_alone: 2 branches, 208 rows

### Lexibank Analysed v2.2 NorthEuraLex literal Hebrew source values with Concepticon English glosses (lexibank_analysed_v2_2_northeuralex_hebrew) B02 · 200 rows · at rest: as_written

Other rows add, in round brackets, words that only tell what the word before them means here and that could not stand alone for it: SWING (SOMETHING). These rows were picked by hand, because no sign in the row tells them from the other brackets. Today the page prints each of them whole, brackets and all, and from the day this is wired it still does until you rule. Should the page print the brackets and their words in the pill? With them off the pill says SWING, and nothing on the pill tells what is meant. To leave them off the page needs one step of its own, because the store's text does not change. This answer holds whatever you answer to the other question.

- **as_written**: The page prints each row as one reading, as written, as it does today: SWING (SOMETHING).
- **word_alone**: The page prints only the words before the round brackets, as one reading: SWING, once it has the one step of its own that this answer needs; until then these rows print as written. A word already on the card prints once, not twice. The store keeps each text as it is.

### PanLex 2024 exact same-meaning Hebrew-English lexical expression (panlex_hebrew_english_meanings_20240301) B04 · 8 rows · at rest: as_written

Four rows carry something beside the English word that reads as left over from the source's own files: #Barcelona |Barcelona. The others are Pole_person, labor '' '' and lioness ж. No key on file says what these are. Should the page print them as written? They print as they do today until you rule. To print the word alone the page needs one step of its own, because the store's text does not change. This answer holds whatever you answer to the other questions.

- **as_written**: The page prints each row as one reading, as written, as it does today: #Barcelona |Barcelona.
- **word_alone**: The page prints Barcelona, Pole, labor and lioness, each as one reading, once it has the one step of its own that this answer needs; until then they print as written. The store keeps each text as it is.


## without_marks: 1 branches, 647 rows

### PanLex 2025 explicit English definition joined to continuity-confirmed Hebrew meaning (panlex_hebrew_english_definitions_20250201) B02 · 647 rows · at rest: as_written

Some rows carry marks left over from the source's own files, beside the English: tree of the ''Acer'' genus. The others are web page tags, a wiki's cut-off tail after the words, a table file's doubled quotes, a wiki link's signs, and a colon alone at the head. No key on file says what they are. Should the page print these marks? These marks print until you rule. To leave them out the page needs one step of its own, because the store's text does not change. This answer holds whatever you answer to the other questions.

- **as_written**: The marks stay in what the page prints: O<sub>3</sub>. That holds today and under this ledger. Under this ledger each row prints whole; today the page's own rule still cuts such a row where it has a comma, and the marks print in the pieces.
- **without_marks**: The page prints the English without these marks, once it has the one step of its own that this answer needs: tree of the Acer genus; O3; automobile for <u>au</u>tomobile; to date for to date {{jump|t|date|s; personal pronoun "he"; Barcelona; sex partner without emotional attachment. Until then the marks print. The store keeps each text as it is.


## without_note: 1 branches, 16 rows

### PanLex 2025 explicit English definition joined to continuity-confirmed Hebrew meaning (panlex_hebrew_english_definitions_20250201) B04 · 16 rows · at rest: as_written

Some rows carry a note beside the words that renders nothing: day after tomorrow - translation entry. Others speak of the source's entry too, as David (disambiguation) and a programming language (transliterations) do, and others speak of how other languages write or render the word. Should the page print the note? It prints as written until you rule. To leave it out the page needs one step of its own, because the store's text does not change. This answer holds whatever you answer to the other questions.

- **as_written**: The page prints each row as written, as it does today.
- **without_note**: The page prints the words without the note (day after tomorrow; David; a programming language), once it has the one step of its own that this answer needs; until then they print as written. The store keeps each text as it is.


## no_number: 1 branches, 6 rows

### Hebrew Wiktionary source-explicit English translations at exact Hebrew page titles (hewiktionary_hebrew_exact_english_translation) B03 · 6 rows · at rest: as_written

Some rows end in a number in round brackets: mount (1). The number says which of the numbered definitions on the source's page the word translates. The source's guide asks writers to name the definition in brackets; here the writer typed it inside the translation itself, so it came into the row. Should the page print the number? These rows print as they do today until you rule. To print the word without the number the page needs one step of its own, because a declaration cannot change a row. This answer holds whatever you answer to the other questions.

- **as_written**: The page prints each row as written, as it does today: mount (1).
- **no_number**: The page prints the word without the bracket and the number: mount, once it has the one step of its own that this answer needs; until then they print as they do today. They stay in the store as they are.


## leave_off: 1 branches, 2 rows

### Brown-Driver-Briggs Hebrew Lexicon via Open Scriptures (openscriptures_bdb_1906) B04 · 2 rows · at rest: as_written

Two rows end in a comma or a full stop that the source's tag took in from the sentence around it and that is no part of the reading, like have a just cause, with its comma at the end. Should the page print that last sign? The stored text is kept either way, and this answer holds whatever you answer to the other questions.

- **as_written**: The page prints the row as written, last sign and all: have a just cause, as one reading.
- **leave_off**: The page leaves off the last sign when it prints the row, a step of its own: have a just cause as one reading. The stored text does not change.

Example keys: צדק · מבטח


## before_those_words: 1 branches, 82 rows

### Open Scriptures Hebrew Lexical Index (openscriptures_lexical_index) B01 · 82 rows · at rest: as_written

Some rows give a word or a name and then words that lead nowhere: Kadesh. Compare. That last word points at another entry without naming it, and in another row a bracket breaks off inside a word. Those words are no reading. Today the page prints each such row as one reading, as written, and from the day this ledger is wired it still does, unless you choose otherwise. A cut would print those words as a reading of their own, so no answer here cuts. Should the page print only what stands before them? A declaration cannot leave words out, so that answer needs one step of the page's own.

- **as_written**: The page prints each row as one reading, as written: Kadesh. Compare and Dibon. (Als
- **before_those_words**: The page prints only what stands before those words, and no full stop before them: Kadesh and Dibon, and Iddo (from the margin) See prints as Iddo (from the margin). It needs a step of its own for this, and until it has that step the row prints as written. The store keeps the row as it stands.


## named_part: 1 branches, 13 rows

### Hebrew Wikipedia 20260701 direct English interlanguage title (wikimedia_hebrew_english_interlanguage_title_20260701) B02 · 13 rows · at rest: as_written

Some rows are the address of one part of an English Wikipedia page, with a number sign between the page and the part: Quartz#Citrine. Printed so, the row is no word a translator could write. No key on file explains the sign, and nothing in the row says which side renders the Hebrew: here it is the part after the sign, in other rows the page before it, in others neither. So each row's answer stands in a list read row by row. Should the page print the address or only that side? These rows print as they do today until you rule. To print one side the page needs one step of its own. This answer holds whatever you answer to the other question.

- **as_written**: The page prints each row as one reading, as written, as it does today: Quartz#Citrine.
- **named_part**: The page prints only the side that renders the Hebrew word, as one reading, row by row: Quartz#Citrine prints Citrine; Employment#Employer prints Employer; Races of StarCraft#Terrans prints Terrans; Bereavement in Judaism#Yizkor prints Yizkor; Names of God in Judaism#Tzevaot prints Tzevaot; Moab#Moabite language prints Moabite language; Paralanguage#Sighs prints Sighs; Veil#Wedding veils prints Wedding veils; Brush#Paintbrushes prints Brush; Paintbrush#paintbrushes prints Paintbrush and Activation#Chemistry prints Activation. It prints no pill for the rows where neither side does: World#Religion and mythology and Hadith studies#The sanad and the matn. All this once it has the one step of its own that this answer needs; until then these rows print as written. The store keeps each text as it is. Of the other rows with a slash or a dash, Apollonia–Arsuf and HIV/AIDS are the only ones where printing one side would make sense; they stand outside this question, so this answer does not reach them.


## two_readings: 1 branches, 136 rows

### Lexibank Analysed v2.2 NorthEuraLex literal Hebrew source values with Concepticon English glosses (lexibank_analysed_v2_2_northeuralex_hebrew) B01 · 136 rows · at rest: whole

Some rows give a word and, in round brackets, another wording for the same idea, one that could stand alone: LONGING (WISH). On PIT (POTHOLE) under שוחה and LEAD (GUIDE) under הביא the wording fits the idea and not that Hebrew word. A row here names one idea, so by the source's own layout the brackets offer no different meaning. No sign tells these from the other brackets, so they were picked by hand. Today the page prints each whole, and from the day this is wired it still does until you rule. Should the page print the wordings as readings of their own? This needs a step of the page's own, as the store's text does not change. This answer holds whatever you answer to the other question.

- **whole**: The page prints each row as one reading, as written, as it does today: LONGING (WISH).
- **two_readings**: The page prints the words before the round brackets and the words inside them as readings of their own, LONGING and WISH, once it has the one step of its own that this answer needs, which leaves the two bracket signs out of the pills; until then these rows print as written. A comma inside the brackets cuts too: DWELL, LIVE and RESIDE. On PIT (POTHOLE) under שוחה and LEAD (GUIDE) under הביא this prints a word that does not render the key: POTHOLE and GUIDE. A word already on the card prints once, not twice. The store keeps each text as it is.


## divides+sense_only: 1 branches, 538 rows

### STEP Bible Translators Brief Lexicon Hebrew scholar-created Gloss column (stepbible_tbesh_gloss) B01 · 538 rows · at rest: whole

Many rows hold two parts with a colon between them: to set: make. The first part names the word. The second part says what this row takes the word to mean. The page prints such a row today as one pill, as written, and goes on doing so until you rule. You can keep that one pill, print a pill for each part, or print a pill for the second part alone. Which? A short list, picked by hand, prints as written under every answer: rows whose second part repeats the first (to give: give), waits for the next word (son: type of) or is a bare small word (hand: by). Rows near them (rule: to rule, house: inside) stay in this question.

- **whole**: One pill with both parts, as written, as today: to set: make.
- **divides**: A pill for each part: to set and make. A row with a slash as well is cut at the colon and at the slash, whatever you rule for rows with a slash and no colon: land: country/planet prints land, country and planet. The same piece then stands on several rows of one card; the page folds an exact repeat on a card, so such a piece prints once.
- **sense_only**: A pill for the second part alone: to set: make prints make. This needs one step of the page's own, because a declaration's pieces must keep every character of the row; until then the row prints as written. It stays in the store as it is. What you give up: where this dictionary gives the word's plain gloss nowhere else on the card, that gloss leaves the card. A second part in square brackets prints with them (to make: [do] prints [do]), and one with a slash prints as written (land: country/planet prints country/planet). The rows on the short list keep both parts: son: type of.


## no_pill: 20 branches, 924 rows

### STEP Bible Translators Amalgamated Hebrew OT aligned component translation (stepbible_tahot_aligned_translation) B01 · 338 rows · at rest: as_written

Some rows have no English outside brackets: <the>. The source's note says words in angle brackets are in the Hebrew but best left out of a translation, and words in square brackets are not in the Hebrew but implied. So such a row may give a translator nothing to print for the word. Should the page print these rows as readings? They print as they do today until you rule. To leave them out the page needs one step of its own, because a declaration cannot leave a row out. This answer holds whatever you answer to the other questions.

- **as_written**: The page prints <the> as one reading, as written, as it does today.
- **no_pill**: The page prints no pill for these rows, once it has the one step of its own that this answer needs; until then they print as they do today. They stay in the store as they are.

### STEP Bible Translators Amalgamated Hebrew OT aligned component translation (stepbible_tahot_aligned_translation) B03 · 228 rows · at rest: as_written

Some rows end on a piece of a name, or hold its last piece, and the rest of the name stands on another row: Pedah-. The piece is the word's English at that place, but it is not the whole name. Should the page print these rows as readings? They print as they do today until you rule. To leave them out the page needs one step of its own, because a declaration cannot leave a row out. A piece of a name with no hyphen, pileser, holds no sign at all, so this question cannot reach it. This answer holds whatever you answer to the other questions.

- **as_written**: The page prints Pedah- as one reading, as written, as it does today.
- **no_pill**: The page prints no pill for these rows, once it has the one step of its own that this answer needs; until then they print as they do today. They stay in the store as they are.

### STEP Bible Translators Amalgamated Hebrew OT aligned component translation (stepbible_tahot_aligned_translation) B04 · 58 rows · at rest: as_written

Some rows hold a whole English word and a hyphen, and the rest of the longer word stands on another row: four-. The word is whole, but here it is only the head of a longer word. Some of these words are the English of their Hebrew, as four is; others are whole by spelling only, as there- and in- are, and alone they are not the English of their letters. Should the page print these rows as readings? They print as they do today until you rule. To leave them out the page needs one step of its own, because a declaration cannot leave a row out. This answer holds whatever you answer to the other questions.

- **as_written**: The page prints four- as one reading, as written, as it does today.
- **no_pill**: The page prints no pill for these rows, once it has the one step of its own that this answer needs; until then they print as they do today. They stay in the store as they are.

### STEP Bible Translators Amalgamated Hebrew OT aligned component translation (stepbible_tahot_aligned_translation) B02 · 55 rows · at rest: as_written

Some rows end on a piece of an English word, or hold its last piece, and the rest of the word stands on another row: in/ thir-. A piece like that is not something a translator could print alone. Should the page print these rows as readings? They print as they do today until you rule. To leave them out the page needs one step of its own, because a declaration cannot leave a row out. The row teen holds no sign at all, so this question cannot reach it. This answer holds whatever you answer to the other questions.

- **as_written**: The page prints in/ thir- as one reading, as written, as it does today.
- **no_pill**: The page prints no pill for these rows, once it has the one step of its own that this answer needs; until then they print as they do today. They stay in the store as they are.

### PanLex 2025 explicit English definition joined to continuity-confirmed Hebrew meaning (panlex_hebrew_english_definitions_20250201) B03 · 45 rows · at rest: as_written

Some rows hold a sign and seem to render nothing: a wiki's link to an article (w:John Davies (poet)), a label alone ((physics)), a note about the source's lists, and remarks on which words such a list holds. Should the page print these rows as readings? They print as they do today until you rule. To leave them out the page needs one step of its own, because a declaration cannot leave a row out. This answer holds whatever you answer to the other questions.

- **as_written**: The page prints each row as one reading, as written, as it does today.
- **no_pill**: The page prints no pill for these rows, whatever the answer on the left-over marks, once it has the one step of its own that this answer needs; until then they print as they do today. They stay in the store as they are.

### OmegaWiki structured Hebrew-English DefinedMeaning relations and definitions (omegawiki_structured_defined_meaning) B02 · 31 rows · at rest: as_written

Some rows say only what kind of word the Hebrew is and give nothing a translator could print: The definite article. and [Conjunction that indicates an alternative.] Should the page print them as readings? Until you rule it prints each as one reading, whole. To leave them out the page needs one step of its own, because a declaration cannot leave a row out. This answer holds whatever you answer to the other question.

- **as_written**: The page prints each row as one reading, as written: The definite article.
- **no_pill**: The page prints no pill for these rows, once it has the one step of its own that this answer needs; until then they print as one reading, as written. They stay in the store as they are.

### Wikidata Hebrew source-explicit form linked to exact English lexeme sense (wikidata_hebrew_explicit_form_english_sense) B06 · 30 rows · at rest: as_written

Some rows hold only a note on the word, or only a description of a person or a place, and no word that could stand in a verse: (indicates a semantically definite direct object); Biblical name; son of Nahor by Milcah. Should the page print them as readings? They print as written until you rule. To leave them out the page needs one step of its own, because a declaration cannot leave a row out. This answer holds whatever you answer to the other questions.

- **as_written**: The page prints each row as one reading, as written: (expression of disbelief).
- **no_pill**: The page prints no pill for these rows, once it has the one step of its own that this answer needs; until then they print as written. They stay in the store as they are.

### Hebrew Wiktionary source-explicit pointed inflection forms joined to same-entry English translations (hewiktionary_hebrew_explicit_inflection_english_translation) B02 · 28 rows · at rest: as_written

Some rows hold only the beginning or the ending of a word, with a hyphen or an apostrophe on the side where the rest would go: un-. Such a piece cannot stand alone in a verse. Should the page print these rows as readings? They print as they do today until you rule. To leave them out the page needs one step of its own, because a declaration cannot leave a row out. This answer holds whatever you answer to the other question.

- **as_written**: The page prints each row as one reading, as written, as it does today: un-.
- **no_pill**: The page prints no pill for these rows, once it has the one step of its own that this answer needs; until then they print as they do today. They stay in the store as they are.

### Hebrew Wiktionary source-explicit English translations at exact Hebrew page titles (hewiktionary_hebrew_exact_english_translation) B02 · 21 rows · at rest: as_written

Some rows hold only the beginning or the ending of a word, with a hyphen or an apostrophe on the side where the rest would go: un-. Such a piece cannot stand alone in a verse. Should the page print these rows as readings? They print as they do today until you rule. To leave them out the page needs one step of its own, because a declaration cannot leave a row out. This answer holds whatever you answer to the other questions.

- **as_written**: The page prints each row as one reading, as written, as it does today: un-.
- **no_pill**: The page prints no pill for these rows, once it has the one step of its own that this answer needs; until then they print as they do today. They stay in the store as they are.

### Classical Hebrew Words database (classical_hebrew_words) B05 · 17 rows · at rest: as_written

Some rows hold no rendering at all, only a remark on the word, like: [word in writing exercise]. Should the page print such a row as a reading? Rows that name the full word (abbrev. of nesef) are not in this question and print as they stand under either answer.

- **as_written**: The page prints the row as it stands today: [word in writing exercise].
- **no_pill**: The page prints no pill for the row. This needs one step of its own from the page, because a declaration can cut a row and cannot leave one out.

### DBnary English Wiktionary source-explicit Hebrew translations and English glosses (dbnary_english_wiktionary_hebrew_translation_gloss) B01 · 17 rows · at rest: as_written

Some rows hold only the beginning or the ending of a word, with a hyphen on the side where the rest would go: mega-. Such a piece cannot stand alone in a verse. In this dictionary each of these rows is the title of a page about that word part, and the Hebrew is what that page gives as its translation. Should the page print these rows as readings? They print as they do today until you rule. To leave them out the page needs one step of its own, because a declaration cannot leave a row out.

- **as_written**: The page prints each row as one reading, as written, as it does today: mega-.
- **no_pill**: The page prints no pill for these rows, once it has the one step of its own that this answer needs; until then they print as they do today. They stay in the store as they are.

### Hebrew Wiktionary source-explicit full spellings joined to same-entry English translations (hewiktionary_hebrew_explicit_full_spelling_english_translation) B02 · 14 rows · at rest: as_written

Some rows hold one word or part of a word, with a hyphen at one end and nothing joined to it: neo-. Such a piece is written to join another word and cannot stand alone in a verse. Should the page print these rows as readings? Today the page prints each of these rows as one reading, as written; this ledger as it rests prints them the same, from the day it is wired. To leave them out the page needs one step of its own, because a declaration cannot leave a row out. This answer holds whatever you answer to the other question.

- **as_written**: The page prints each row as one reading, as written, as it does today: neo-.
- **no_pill**: The page prints no pill for these rows, once it has the one step of its own that this answer needs; until then they print as they do today. They stay in the store as they are.

### Wikidata Hebrew lexeme explicit English sense gloss (wikidata_hebrew_lexeme_gloss) B04 · 10 rows · at rest: as_written

Some rows hold only a note on a letter, a label or a description of a role, and no word that could stand in a verse: Hebrew letter, sounds like h or a; a given name, (first name). Should the page print them as readings? Today the page cuts these rows at the comma, except the row that opens either an item which provides, which it prints whole. From the day this is wired each prints as written, one reading. To leave them out the page needs one step of its own, because a declaration cannot leave a row out. This answer holds whatever you answer to the other questions.

- **as_written**: The page prints each row as one reading, as written: Hebrew letter, sounds like h or a.
- **no_pill**: The page prints no pill for these rows, once it has the one step of its own that this answer needs; until then they print as written. They stay in the store as they are.

### PanLex 2024 exact same-meaning Hebrew-English lexical expression (panlex_hebrew_english_meanings_20240301) B02 · 9 rows · at rest: as_written

Some rows hold only the beginning or the ending of a word, with a hyphen where the rest would go: self-. Such a piece cannot stand alone in a verse. Should the page print these rows as readings? They print as they do today until you rule. To leave them out the page needs one step of its own, because a declaration cannot leave a row out. This answer holds whatever you answer to the other questions.

- **as_written**: The page prints each row as one reading, as written, as it does today: self-.
- **no_pill**: The page prints no pill for these rows, once it has the one step of its own that this answer needs; until then they print as they do today. They stay in the store as they are.

### MACULA exact Hebrew morph surfaces with Cherith English definitions (macula_hebrew_cherith_surface_english_2022) B02 · 8 rows · at rest: as_written

Some rows hold no English at all, only numbers in round brackets: (6997a=1886a+6997). They belong to a ה at the head of a name in 1 Chronicles 24:15 and Ezra 8:12, and seem to say how the name's number in a word list is made of two others; no key on file says so. The store files a row under its letters with no place, so you saw them at Haggai 1:4, whose ה heads no name. Should the page print them as readings? They print as they do today until you rule. To leave them out the page needs one step of its own, because a declaration cannot leave a row out. The row X holds no sign at all, so this question cannot reach it. This answer holds whatever you answer to the other questions.

- **as_written**: The page prints (6997a=1886a+6997) as one reading, as written, as it does today.
- **no_pill**: The page prints no pill for these rows, once it has the one step of its own that this answer needs; until then they print as they do today. They stay in the store as they are.

### STEP Bible Translators Brief Lexicon Hebrew scholar-created Gloss column (stepbible_tbesh_gloss) B04 · 5 rows · at rest: as_written

Some rows hold only the first half of a place name, with the other half in another Hebrew word: King's. Such a piece cannot stand alone in a verse. Should the page print these rows as readings? They print as they do today until you rule. To leave them out the page needs one step of its own, because a declaration cannot leave a row out.

- **as_written**: The page prints each row as one pill, as written, as it does today: King's.
- **no_pill**: The page prints no pill for these rows, once it has the one step of its own that this answer needs; until then they print as they do today. They stay in the store as they are.

### PanLex 2024 exact same-meaning Hebrew-English lexical expression (panlex_hebrew_english_meanings_20240301) B03 · 4 rows · at rest: as_written

Two short texts stand as rows and seem to render nothing: Hayward?, which the source holds beside words for skill, and v., which is all the English its meaning holds. No key on file says what they are. Should the page print them as readings? They print as they do today until you rule. To leave them out the page needs one step of its own, because a declaration cannot leave a row out. This answer holds whatever you answer to the other questions.

- **as_written**: The page prints each row as one reading, as written (Hayward? and v.), as it does today.
- **no_pill**: The page prints no pill for these rows, once it has the one step of its own that this answer needs; until then they print as they do today. They stay in the store as they are.

### STEP Bible Translators Brief Lexicon Hebrew scholar-created Gloss column (stepbible_tbesh_gloss) B05 · 3 rows · at rest: as_written

One row holds only a label: [Obj.]. The Hebrew word it stands under only marks the object of a verb, and it gives a translator no word to print in a verse. Should the page print this row as a reading? It prints as it does today until you rule. To leave it out the page needs one step of its own, because a declaration cannot leave a row out.

- **as_written**: The page prints the row as one pill, as written, as it does today: [Obj.].
- **no_pill**: The page prints no pill for this row, once it has the one step of its own that this answer needs; until then it prints as it does today. It stays in the store as it is.

### Semantic Dictionary of Biblical Hebrew via HiperBiblia (hiperbiblia_sdbh) B03 · 2 rows · at rest: as_written

One row under the letters רגל holds no rendering, only the words [untranslated], with their square brackets; the source lists them beside the word foot under one sense. Today the page prints that as a reading. Should it? It prints as it does today until you rule. To leave it out the page needs one step of its own.

- **as_written**: The page prints [untranslated] as one reading, as written, as it does today.
- **no_pill**: The page prints no pill for this row, once it has the one step of its own that this answer needs; until then it prints as it does today. The row stays in the store as it is.

Example keys: רגל

### Kaikki English Wiktionary source-explicit Hebrew translation tables (kaikki_english_wiktionary_hebrew_translation_table) B01 · 1 rows · at rest: as_written

One row holds only the beginning of a word, with a hyphen on the side where the rest would go: sub-. Such a piece cannot stand alone in a verse. In this dictionary the row is the headword of an entry about that word part, and the Hebrew is what that entry gives as its translation, a word part as well. Should the page print this row as a reading? Today the page prints it as one pill, as written, and from the day this ledger is wired it prints the same until you rule. To leave it out the page needs one step of its own, because a declaration cannot leave a row out. The rows cf. and m go to the store: no sign in them marks a piece.

- **as_written**: The page prints the row as one reading, as written, as it does today: sub-.
- **no_pill**: The page prints no pill for this row, once it has the one step of its own that this answer needs; until then it prints as it does today. It stays in the store as it is.


## tag_stays+tag_off: 4 branches, 34,732 rows

### ConceptNet 5.7 exact Hebrew-English lexical assertions (CC BY-SA 4.0 edge) (conceptnet_5_7_hebrew_english_cc_by_sa_4_0) B01 · 15,894 rows · at rest: tag_stays

Many rows of this dictionary end in a small tag in round brackets, like: he (n, wikt, en 2). The tag is not ConceptNet's own text. This corpus's own script wrote it, to show the path under which ConceptNet files the English word: a letter (n, a, v or r) that says or seems to say what kind of word it is, and on some rows wikt and en with a number. The same row already holds the word alone in its definition slot. Should the page print the tag in the pill? Tags that hold words saying which thing is meant have their own question, and this answer holds whatever you answer to that one.

- **tag_stays**: The page prints the row as written, tag and all, as one reading, as it does today: he (n, wikt, en 2).
- **tag_off**: The page prints the word alone as one reading, from the row's definition slot: he. It leaves the tag off the pill. A word already on the card prints once, not twice. The store keeps the text as it is.

### ConceptNet 5.7 exact Hebrew-English lexical assertions (CC BY 4.0 edge) (conceptnet_5_7_hebrew_english_cc_by_4_0) B02 · 13,788 rows · at rest: tag_stays

Other rows of this dictionary end in a small tag in round brackets whose last part is the topic under which WordNet files that sense of the word, like: ab (n, wn, time). As with the other tags, this is not ConceptNet's own text. This corpus's own script wrote it, to show the path under which ConceptNet files the word: a letter, wn for WordNet, and the topic. Some topics are WordNet's own terms. The same row already holds the word alone in its definition slot. But with this tag off, the topic is lost: the pill says ab, and nothing on it says a time is meant. Should the page print the tag in the pill? This answer holds whatever you answer to the question about the other tags.

- **tag_stays**: The page prints the row as written, tag and all, as one reading, as it does today: ab (n, wn, time).
- **tag_off**: The page prints the word alone as one reading, from the row's definition slot: ab. It leaves the tag off the pill, so the topic no longer prints. A word already on the card prints once, not twice. The store keeps the text as it is.

### ConceptNet 5.7 exact Hebrew-English lexical assertions (CC BY-SA 4.0 edge) (conceptnet_5_7_hebrew_english_cc_by_sa_4_0) B02 · 3,014 rows · at rest: tag_stays

Some rows of this dictionary end in a tag that holds words saying which thing is meant, like: seal (n, wp, musician). As with the other tags, this is not ConceptNet's own text. This corpus's own script wrote it, to show the path under which ConceptNet files the English word. The same row already holds the word alone in its definition slot. But with this tag off, the words that say which thing is meant are lost: the pill says seal, and nothing on it says the musician is meant. Should the page print the tag in the pill? This answer holds whatever you answer to the question about the other tags.

- **tag_stays**: The page prints the row as written, tag and all, as one reading, as it does today: seal (n, wp, musician).
- **tag_off**: The page prints the word alone as one reading, from the row's definition slot: seal. It leaves the tag off the pill, so the words that say which thing is meant no longer print. A word already on the card prints once, not twice. The store keeps the text as it is.

### ConceptNet 5.7 exact Hebrew-English lexical assertions (CC BY 4.0 edge) (conceptnet_5_7_hebrew_english_cc_by_4_0) B01 · 2,036 rows · at rest: tag_stays

Some rows of this dictionary end in a small tag in round brackets that holds no topic word, like: meaningful (a, wn). The tag is not ConceptNet's own text. This corpus's own script wrote it, to show the path under which ConceptNet files the word: a letter (n, a or r) for what kind of word it is, wn for WordNet, and on some rows a code, ppl or linkdef. The same row already holds the word alone in its definition slot. Should the page print the tag in the pill? Tags that end in a topic have their own question, and this answer holds whatever you answer to that one.

- **tag_stays**: The page prints the row as written, tag and all, as one reading, as it does today: meaningful (a, wn).
- **tag_off**: The page prints the word alone as one reading, from the row's definition slot: meaningful. It leaves the tag off the pill. A word already on the card prints once, not twice. The store keeps the text as it is.


## number_stays+number_off: 1 branches, 8 rows

### MACULA exact Hebrew morph surfaces with Cherith English definitions (macula_hebrew_cherith_surface_english_2022) B03 · 8 rows · at rest: number_stays

Some names are written in two parts, one part on each Hebrew word, and each part carries the number of the whole name in round brackets: Ben (1128). The part of the name is a reading; the number seems only to point to the whole name in a word list. Should the page print the number in the pill? This answer holds whatever you answer to the other questions.

- **number_stays**: The page prints Ben (1128) as one reading, as written.
- **number_off**: The page prints Ben as one reading and leaves the number off the pill. The store keeps the text as it is.
