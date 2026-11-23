# Ship 18: the corpus lane's resting call for the translation tables' rows (relay v221)

Page lane, 23 November 2026. Being built by a helper in the sandbox `S/s12` (branch `ship18` from main b1acf1e220), from the brief `S/s26w/BRIEF.md`. Not shipped.

## What v221 says

The two lines ship 16 held by their line are right as English Wiktionary's own words: «necromancy» is Jastrow's נְגִידָא III («dragging out of the grave by necromancy»), «zaatar» is Jastrow's מַרְוָא («marva, a medicinal plant»). At the Targum's places the word is another word written alike. Nothing is struck.

The corpus lane's resting call, for every translation-table row at a place in the Targum or the Zohar where a dictionary we hold lists the spelling as two or more words: **held at rest** by citation (Jastrow cites that verse under another of the words), by the place's points (the printed points belong only to another of the words), or by corpus (Jastrow cites the row's word only outside the place's corpus); two branches labelled and **off at rest**; everything else stands. Its list `places-v3.1.jsonl` marks each of 4,065 row-places; **134 are held at rest**: 122 in the Targum (our commentary zones) and 12 in the Zohar proper and Zohar Chadash, which this site does not serve. All 68 files are the bytes the letter names.

What the holds catch, by row: «sour grapes» 69 (the Targum's בִּסְרָא is «flesh»), «yoke» 17, «necromancy» 11, «sword» 11, «midsummer» 8, «smith» 6, and 12 more. The lane names three of its holds as misfires (the row may be right there, held by points): «midsummer» at 8 places, «Lord» at Targum Jonathan on 2 Kings 5:13, «preach» at Targum Jonathan on Deuteronomy 13:7. Held is the safe side: I read what those places show before shipping.

## What ship 18 does

1. The two rows land (126 of the list's translation-table lines in all).
2. Each row is kept off every place the list holds at rest, keyed by row, work, verse unit and class, on our commentary zones; the 12 Zohar places are recorded as works not served.
3. The record fixes: the spelling bridge's pin cites the owner's ruling of 23 November («steps is fine») for its 724 places; the path map says the 7 superseded builder files are also in git on corpus-staging (the lane's correction).

## The build (the helper's, from `S/s26w/BRIEF.md`)

- **The two rows land.** On the pin's v1.1 list each held line now carries `let_go` (relay v221, its why, and the list it lands in); a new pin list, `send-back-own-language-v1.1-let-go-v221`, re-reads the same list (same rule, receipt and list) on the store as it stands. Derived: 2 land, 124 named as printed by their own source, PanLex's 3,944 still held with their source. Patch 18-01 teaches every law that reads held lines to follow the pin (the derivation, `check-landings-v1` G5, the re-admission tool and its check, the source record and L4). Store 105bcd11a72c → c7b18a753d0e; M78 114 of 114 rows served, 126 in all; every store step run, then each again dry, nothing left to write.
- **A row held at a place**, after the names gate (and the span grade): a fact of the row and a fact of the place, the row withheld there alone, counted on the card under «only this pointing», lifted by «keep» and «letters» (seen in a browser). `tools/apply-held-places-v1.mjs` runs in the round right after the commentary regloss and writes `ph` on each held word: the held rows and the line without them. Found by row, work, verse unit and key: all 36 places the site serves found, each verse holding the key once. The 12 Zohar places and the Targum places of works no zone serves are named in the pin with their reason.
- **The pin:** `data/held-places/PIN.json`, with v221's RULE, ANSWER, both receipts, the places (gzipped, as ship 16 kept its large list), known misfires, two rows and strike list, each the bytes the letter names.
- **The check:** `tools/check-held-places-v1.mjs`, H1 to H5; a deliberate fault (the hold taken off Judges 2:18) failed H2 and H5, and was undone.
- **The record fixes:** the bridge's pin and its tool (`spelling-bridge-v1.mjs`, its reason and comment) both say: «The owner ruled on 23 November 2026 («steps is fine»): STEP's reading governs the card at these places, and the pieces are not laid.» The path map's 7 entries keep their disk path and add where they stand in git on corpus-staging.
- `apply-18.sh` run twice from a clean reset; the second run wrote nothing (3,889 files the same bytes).

## What moves, read on the sandbox before the round (`measures/what-moves.tsv`)

36 places, all in the commentary zones; the Tikkunei Zohar moves nothing. **No line changes.** Every one of the 36 cards says «1 held at this place»; 27 lose a reading: «sour grapes» 18 (the line «flesh» stays), «midsummer» 7 (the line «summer» stays, in «summer house» and «summer fruit»), «preach» 1 (Deuteronomy 13:7: the line «to proclaim» stays), «marble» 1. The other 9 keep their readings: «coriander» 1 (reordered), «sword» 2 (another source gives it), «necromancy» 4 and «zaatar» 2 (those rows were not on live). The two rows' 13 places: the 6 we serve stay bare; 7 are in works we do not serve. «Lord» at 2 Kings 5:13: no commentary zone for 2 Kings.

Left as live: at the 4 «necromancy» places the card offers «leader» and Jastrow's own «dragging out of the grave by necromancy» from the Jastrow dictionary beside the store, and presses «stretched» while the line is bare.

## The round on the real tree (S/s13 on b1acf1e220) began 07:24 UTC (`S/s27w`).

