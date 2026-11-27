# Writes flags.tsv: every flagged place of Ruth with its word, line and credit read from the sheet, and the kind,
# the reason, the cause and how often it recurs as judged in the reading. Read only on the tree.
# Usage: python3 -I build-flags.py <out dir>
import sys, os, csv
OUT = sys.argv[1]
sheet = {}
with open(os.path.join(OUT, "sheet.tsv")) as f:
    rd = csv.reader(f, delimiter="\t", quoting=csv.QUOTE_NONE)
    next(rd)
    for verse, section, entry, word_no, heb, key, line, credit, tag, head, pieces, extra in rd:
        if word_no:
            sheet[(verse, int(word_no))] = (heb, line.replace("​", "␀"), credit)
C = {
 "KETIV_ONLY": ("a word written and not read has no pointing and no STEP tag in the book file, so the line is the first reading of its bare letters (Strong's), although TAHOT's own row names the word in its «K=» note (here: K= 'im (אִם) \"if\" (H0518B)); rule: a ketiv-only row is matched by letters only",
                "8 places in the 39 books, all 8 read by letters: (אם) mother ×4 (Ruth 3:12, 2 Samuel 13:33, 15:21, Jeremiah 39:12), (נא) raw 2 Kings 5:18, (את) sign Jeremiah 38:16, (חמש) fifth Ezekiel 48:16, (ידרך) archer Jeremiah 51:3"),
 "JOINED_ROW": ("TAHOT gives the written word and the read-only word after it on one row («you are saying/ /to/ me»); the row is not divided at its own «/ /», so neither word gets STEP's pieces or tag and MACULA's piece leads",
                "9 places in the 39 books where a word is read and not written; the word before each is led by MACULA (recur-places.tsv)"),
 "PAIR_BRIDGE": ("the spelling bridge knows the pair (LENINGRAD_PLUS:ה, TAHOT's read word קָנִיתָה against ours קָנִיתָ) but carries no pieces and no tag from TAHOT's row, so the line is baked from an unpointed Strong's form-list row that the card itself holds back",
                 "12 written-and-read pairs in the 39 books are not led by STEP (recur-places.tsv); 5 of them show another source's line"),
 "STEP_OWN": ("TAHOT's own Translation cell at this row (Rut.1.6#07) is «if»; the page serves it as given",
              "the source's own reading; not counted elsewhere; for the list to send to STEP"),
 "BRIDGE_DRAW": ("a word the spelling bridge maps to TAHOT's row (credit M4) carries no pieces in the book file, so its line is the row's text printed as one string, left to right with «+», and its card offers no division and one pill",
                 "799 words in the 39 books are credited M4; 465 of them have more than one piece"),
 "BLOCK_ORDER": ("the place's reading leads only the whole form's pool (zone.html placeOfCell, about line 10968: it answers for surface === region.k and for no block of a division); a block's pills are then sorted by sortPool with the piece store's rows last and oldest first, so Strong's list leads",
                 "every divided word: 692 cards in Ruth, 565 with the pressed pill not first; 145,559 of the 305,411 lines of the 39 books have more than one piece"),
 "PAIR_PRESS": ("suspected: on the read half of a written-and-read pair the open block's place is not matched to TAHOT's piece, so no pill is marked as the place's and the first pill is pressed",
                "5 of the 6 divided pairs in Ruth; not counted in other books (needs the browser)"),
 "SIGN_BLOCK": ("on a block whose reading at this place is only a sign, the signs switch (off by default) leaves the sign unoffered as a pill and the card presses its first pill instead",
                "1 card in Ruth; every divided word whose core is the object marker (וְאֵת, וְאֶת־) in the 39 books; not counted"),
 "READ_ONLY_CARD": ("same cause as the joined row: the read-only word has no STEP tag, so the entry gate has nothing to hold and every word spelled אל stands on the card (157 pills), the first of them pressed",
                    "9 read-only words in the 39 books"),
}
F = [
 # line flags
 ("3:12", 5, "line: homonym", "the written-not-read word is אִם «if»; the line says «mother»", "KETIV_ONLY"),
 ("4:5", 13, "line: wrong sense, no person or tense", "STEP reads «you have acquired»; the line says «attain», and the card under it presses «purchased» and has no «attain» pill", "PAIR_BRIDGE"),
 ("3:5", 5, "line: person and tense lost", "STEP reads «you are saying» (as the same word does at 3:11); the line says «say»", "JOINED_ROW"),
 ("3:17", 8, "line: person lost", "STEP reads «he said»; the line says «said»", "JOINED_ROW"),
 ("1:6", 7, "line: against the verse's plain sense", "«for she had heard»; the line says «if she had heard» (MACULA on the card: for; BSB: When)", "STEP_OWN"),
 ("1:7", 8, "line: drawn unlike its neighbors", "printed as plain text «daughters-in-law + her», left to right, where every other divided word draws its pieces right to left in frames", "BRIDGE_DRAW"),
 ("1:5", 1, "line: drawn unlike its neighbors", "plain «and + they died», unframed, left to right", "BRIDGE_DRAW"),
 ("1:19", 4, "line: drawn unlike its neighbors", "plain «came + they»", "BRIDGE_DRAW"),
 ("1:19", 8, "line: drawn unlike its neighbors", "plain «when + came + they»", "BRIDGE_DRAW"),
 ("2:6", 13, "line: drawn unlike its neighbors", "plain «from + [the] region of»", "BRIDGE_DRAW"),
 ("2:14", 16, "line: drawn unlike its neighbors", "plain «the + harvesters»; the same word at 2:7 word 7, spelled with a vav, is framed and has 13 pills; this card has 1", "BRIDGE_DRAW"),
 ("4:7", 5, "line: drawn unlike its neighbors", "plain «the + redemption»", "BRIDGE_DRAW"),
 # card flags
 ("3:5", 6, "card: pressed reading contradicts the line", "line «to + me»; the card opens on «power» pressed, with 157 pills of every word spelled אל (God, these, to, not)", "READ_ONLY_CARD"),
 ("3:17", 9, "card: pressed reading contradicts the line", "line «to + me»; pressed «power», 157 pills", "READ_ONLY_CARD"),
 ("3:3", 4, "card: pressed reading is not the line's", "line «garments + your»; pressed «apparel», «garments» is the last pill", "PAIR_PRESS"),
 ("3:3", 6, "card: pressed reading is not the line's", "line «and + you will go down»; pressed pill is a whole definition sentence «a primitive root; to descend (…); causatively»", "PAIR_PRESS"),
 ("3:4", 12, "card: pressed reading contradicts the line", "line «and + you will lie down»; pressed «cast down»", "PAIR_PRESS"),
 ("4:4", 20, "card: pressed reading is not the line's", "line «so + let me know»; pressed «acknowledge»", "PAIR_PRESS"),
 ("4:6", 5, "card: pressed reading contradicts the line", "line «to + redeem [it]»; pressed «avenger»", "PAIR_PRESS"),
 ("1:12", 16, "card: the line's reading buried", "line «to + a husband»; pressed «a husband» is pill 69 of 69, «husband» is pill 3, the first is «person»", "BLOCK_ORDER"),
 ("4:7", 14, "card: the line's reading buried", "line «and + he gave [it]»; pressed pill 121 of 135, first pill «Make»", "BLOCK_ORDER"),
 ("1:1", 1, "card: first reading contradicts the line", "line «and + it was»; first pill «beacon», then «be(-come)», «accomplished», «committed», «like)»; pressed «it was» is pill 60 of 81 (13 divided cards of the verb «to be» open on «beacon»)", "BLOCK_ORDER"),
 ("1:2", 2, "card: the line's reading buried", "line «the + man»; first pills «person», «people», «husband», «each»; pressed «man» is pill 60 of 78", "BLOCK_ORDER"),
 ("1:8", 1, "card: first reading contradicts the line", "line «and + she said»; first pill «answer»; pressed «she said» is pill 41 of 53 (27 divided cards open on «answer»)", "BLOCK_ORDER"),
 ("2:4", 6, "card: first reading contradicts the line", "line «and + he said»; first pill «declare»; pressed «he said» is pill 27 of 83 (18 divided cards open on «declare»)", "BLOCK_ORDER"),
 ("3:10", 7, "card: first reading contradicts the line", "line «loyalty + your»; first pills «mercy», «reproach», «reproof», «beauty»; pressed «loyalty» is pill 45 of 56", "BLOCK_ORDER"),
 ("4:9", 15, "card: pressed reading contradicts the line", "line «and» and a gap for the object marker; the block את opens on «self» pressed (with the signs off its own «<obj.>» is not a pill, so the first pill is pressed)", "SIGN_BLOCK"),
 ("4:1", 4, "card: the line's reading buried", "line «and + he sat down»; pressed pill 131 of 140, 21 pills in view", "BLOCK_ORDER"),
 ("2:7", 7, "card: first reading contradicts the line", "line «the + harvesters»; first pills «cut down», «much discouraged», «grieve»; pressed «harvesters» is the last of 13", "BLOCK_ORDER"),
]
with open(os.path.join(OUT, "flags.tsv"), "w") as f:
    f.write("place\tword\tline\tcredit\tkind\twhy\tcause\trecurs\n")
    for verse, wn, kind, why, c in F:
        heb, line, credit = sheet[(verse, wn)]
        cause, recurs = C[c]
        f.write(f"Ruth {verse} word {wn}\t{heb}\t{line}\t{credit}\t{kind}\t{why}\t{cause}\t{recurs}\n")
    # the groups that touch many places, one row each, with the file that lists every place
    G = [
     ("Ruth, 565 cards (card-checks.tsv, pressed_pill_not_first_divided)", "(every divided word)", "", "PIECE:TAHOT", "card: the line's reading buried", "on a divided word the pressed pill is not the first: median place 10, beyond the tenth on 338 cards, the last pill on 124, worst 131", C["BLOCK_ORDER"][0], C["BLOCK_ORDER"][1]),
     ("Ruth, 36 cards (card-checks.tsv, first_pill_is_a_letter_name)", "ִי / ָהּ suffix blocks", "", "", "card: a reading of another entry", "the first pill on a one-letter suffix block is the letter's name: «Yôdh» on 19 cards of the suffix «me», «Hē» on 17 of «her»", "the BDB (Open Scriptures) entry for the letter itself stands in the pool of the one-letter key and is the oldest row there", "every card of a one-letter suffix י or ה; not counted beyond Ruth"),
     ("Ruth, 117 pill instances on 72 cards (pill-fragments.tsv)", "", "", "", "card: a pill cut in the wrong place", "«like)» 21, «that (belongs, belong» 42 and «belonged) to» 42, «is not always clearly defined)» 6, «what) time», «times)», «quails ?)»; also «-s», «-th», «hence», and 44 pills that carry a cross-reference («worthy. Compare 802» 19, «the Lord. Compare 3050, 3069» 18)", "the print steps of the Strong's form lists (M14) and of the unabridged BDB (M46) divide a row at commas that stand inside parentheses; Strong's own cross-reference rides on the last gloss", "wherever these entries are served (היה, אשר, מן, עת, שבע, איש, יהוה …): the pass on each dictionary counts them"),
     ("Ruth, 20 pills on 18 cards (card-checks.tsv, pill_holds_hebrew)", "עַד, לָשׁוּב, בֵּן", "", "M18", "card: a reading that belongs to another word", "UBS's pointers stand as readings: «witness (read עֵד)» on 14 cards of «until», «to sit down (read ישׁב)» on «to return», «Benjaminite (see בֶּן־יְמִינִי)» and «valley (see גַּיְא)» on «a son»", "UBS rows that point to another entry are served as readings of this word", "every card of these keys in the 39 books"),
     ("Ruth, 16 cards", "חֲמוֹת, יְבֵמֶת, נִצָּב …", "", "M5 M46", "card: one reading twice", "two pills that differ only in the apostrophe glyph: «husband's mother» and «husband’s mother» (10 cards)", "the key that pools one reading into one pill does not fold the two apostrophes", "wherever the two BDB editions print an apostrophe"),
     ("Ruth, 130 pill titles and 10 records under the pills", "", "", "", "card: a year beside the wrong source", "«1890 · MACULA exact Hebrew morph surfaces…» on a pill; «MACULA … · wording 1890» under the pills (לָמָּה 1:11, 1:21; נֶגֶד 4:4 twice; לְפָנִים 4:7); «STEP … TAHOT · wording 2026» (2:11 שִׁלְשׁוֹם), «· wording 2023» (2:19 וְאָנָה), «· wording 1890» (3:8 אִשָּׁה); «SDBH · wording 1890» twice", "the row carries the oldest witness's year of the wording, printed beside the name of the source that is credited", "not counted beyond Ruth"),
     ("Ruth, notes above the pills (picks-bdb.tsv): 457 «here BDB reads» notes", "", "", "M46", "card: a note that is not a reading, or is another word's", "117 notes print the gloss and then pieces of sub-headings («near / of God», «go, come, walk / of wine / of letters / of shadow on dial», «house / of land of Ephraim as»); 49 say «· 1 (no words given)»; 74 trail «· 2 «…» (sense N)»; at 2:7 the notes for וְעַד and זֶה are the entry of עַתָּה («now / drawing a conclusion…»); שָׂדֶה «home of beasts» at 1:1, 1:2, 2:2; אֲדֹנִי to Boaz «of God» at 2:13; הֻגַּד «be conspicuous» at 2:11", "BDB's pick at each place (data/default-picks, relays v180 to v195) printed through the unabridged BDB's sense openings", "at a phone's width 1,194 of the 1,296 cards fold these notes away; a reader sees 38 of the 457 notes, about 9 of them faulty (notes-seen.tsv); the pass on BDB measures the 39 books"),
     ("Ruth, 451 of 1,296 cards", "", "", "", "page's own words", "«N withheld by your source switches (1 source off)» on a first visit, when the reader has switched nothing (in the markup of 451 cards; shown on 14 at a phone's width, the rest fold it away)", "one source rests off by default (the first-visit state names MSAM2) and the note speaks as if the reader had switched it", "every book"),
     ("Ruth, 9 words (recur-places.tsv, piece_is_exclamation_mark)", "תִדְבָּקִין, יִקְצֹרוּן, סוּרָה …", "you will stay + !", "PIECE:TAHOT", "STEP's style (noted, not a fault)", "the closing nun or he of emphasis is drawn as a piece «!»", "TAHOT's own piece (H9013 = emph.)", "714 words in the 39 books"),
     ("Ruth, 54 words", "לִי, לָהּ, בִי, לָכֶם …", "to <the> + me", "PIECE:TAHOT", "STEP's style (noted, not a fault)", "a preposition with a pronoun prints «<the>» though no article stands in the word («<in> <the> + her» for «rebuke her»)", "TAHOT's own Translation cell", "4,877 lines in the 39 books hold «<the> + »"),
    ]
    for row in G:
        f.write("\t".join(row) + "\n")
print("flags written:", len(F), "places and", len(G), "groups")
