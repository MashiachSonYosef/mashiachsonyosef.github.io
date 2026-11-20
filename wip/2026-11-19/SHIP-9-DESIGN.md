# Ship 9, the design (19 November 2026 AD)

Page lane. From the owner's read of Isaiah (`OWNER-READS-ISAIAH-2026-11-19.md`) and the owner's answers of the same evening («ok so 12 it is lets go with that for now»). Built on ship 8 once ship 8 is live.

## 1. Twelve dictionaries at rest on the 39 books (dictionary-kinds-rule-v1, a fourth resting entry)

- **The record** (`reader/data/dictionary-kinds-v1.json`) already files 29 families under six kinds; 12 are of the kind "bible":
  - Strong's (two editions), BDB (two editions), STEP's TAHOT and TBESH, MACULA, UBS, the SDBH, Davidson, the Open Scriptures lexical index, UHAL and the BiblicalTools Living Lexicon.
  - The span store's own two sources (ETCBC and STEP's expanded Strong's) are Bible material and stand in no index the rule reads.
- **A new resting entry, `not-a-bible-dictionary`**, names the kinds general-with-entries, rabbinic, aramaic and other. In the store these are:
  - English Wiktionary's Hebrew entries and its Aramaic entries;
  - Hebrew Wiktionary;
  - Classical Hebrew Words;
  - Kethoneth Yoseph;
  - English Wikipedia's opening sentences.

  Word lists and knowledge bases already rest shut (15 November).
- **The overlays.** Today the rule reaches only the store's families (`restsOffOf`: a resting entry names kinds or families of the store, and a row whose M id is not in the store's index is never asked). Jastrow (rabbinic) and the Samaritan works (other) sit beside the store, so their rows stand at rest («sproutings», «luxuriant growth» on the dross card; «Beth Sharye», «rubbed off» on the ה card). The fix: the rule reads each overlay's own index of sources, and a kind names that overlay's families too; the page asks it of overlay rows as of store rows (`overlayRowsFor`, the pool's kinds pass). Jastrow's word senses keep their own switch.
- **Kept as it is:**
  - a reader's own pressed reading stays on their line (verify: a ruling on a row that now rests shut);
  - «N shut at rest · show» opens them;
  - nothing leaves the store;
  - the Tikkunei Zohar and a Targum keep today's rest (the record's scope).
- **Measure before shipping:** resting lines moved (the lines today led by a source this shuts: about 14 on ship 7, M25, M13, M23, M29), readings shut per card (median, 90th percentile), and cards left with nothing at rest.

## 2. The rule pass over the 12, one dictionary at a time («we need to think through each dictionary rule even better»)

Each dictionary's print rule, read against its own text, its ledger and the owner's screenshots. First:
- **BDB (Open Scriptures):** the bracket after a name's label is the name's meaning, «(י׳ is perfect)»; the pill prints it whole, as the name's meaning, «Yahweh is perfect». The page cut the bracket and dropped «י׳». (Moses: the BDB ledger's name shape.)
- **Strong's concordance:** the pills are the King James renderings after «:—». His definition clause before them («Chizkijah, a king of Judah, also the name of two other Israelites») prints only in the record; it should stand as a pill of its own. (Moses: the ledger's definition clause.)
- **Strong's «Compare»:** two numbers for one name in two spellings (H2396 and H3169). The entry gate counts them as two entries and withholds UBS's row for this very king at Isaiah 1:1:14. Fix in the gate: Strong's own «Compare» pairs of one name count as one entry. Measured first.
- **UBS:** the «◄» and «►» notes are declared, and the print is right.

## 3. The page's drawing

- **The header's metals:** our counts in silver, the held edition's (Leningrad) in gold; the license chip under the title's English off.
- **The hidden sign's slot** in the English row closes (the call of 14 November reversed; the blob still marks the letters).
- **Drawing faults:**
  - a blob's line through a two-line gloss (Isaiah 1:6);
  - a gloss cut at the card's edge (2:9, 9:12, 12:2);
  - a blob's outline broken by the vowel marks beside it (12:2).

## 4. To Moses (one letter)

- BDB's name bracket and Strong's definition clause (section 2);
- entries for Jastrow's rows (the dross card's other word);
- STEP's pieces at the 861 places our text spells otherwise than STEP's (Isaiah 20:2 «feet + your», 9:16 «widows + its»).

Order: 1 first (the owner's call, and the largest change at rest), measured; then 3 (no reading moves); 2 as the ledgers come.

## For ship 10 (measured 20 November, read-only, `ship-9/tools/compare-measure.mjs`)

- **Strong's «Compare»:** 431 Strong's entries carry a «Compare» note (M14 240, M9 191). The Open Scriptures edition (M9) names the other entry by number («Hezekiah, Hizkiah, Hizkijah. Compare 3169»): 191 links, 23 of them mutual pairs (H2396 and H3169 among them). The concordance edition (M14) names the other word in Hebrew. Not every pair is one name in two spellings (H3780 and H3680, H4357 and H4356 are not names), so the gate's rule is: a mutual «Compare» pair in which both entries are names counts as one entry. Measure the lines and cards it moves before the ship.
- **The key's line under the place's entry:** where the place's entry (tg or te) leaves no row at the place, the line falls back to the key's own line without asking the entry (ship 9's «behold» at four places of אֵלָו). Measure how many resting lines stand on such a fallback whose credit the place's entry would withhold.
