# Faithfulness review of the ships 5 and 6 design

I read the design against the owner's and the lead's words, the calls' RULE.md, the plan and its specs, the letter sent today, the ship tree's code and data, and the relays. I wrote nothing into S/ship or any other tree. I ran only light node and `python3 -I` reads. Every figure I give either comes from one of my scripts (full paths at the end) or names the file:line it was read from.

## Findings, most severe first

### 1. BLOCKING: Decision 2 reverses the lead's call on the 306 «(» lines and widens the signs switch at rest
- **What the lead and the lane have been told.**
  - The lead's call holds the 306 «(» lines out of Strong's sign: the task text, and /home/user/mashiachsonyosef.github.io/wip/2026-11-15/the-ledgers-go-live/THE-OWNERS-WORDS-2026-11-15.md:34.
  - Today's letter to the lane (/home/user/mashiachsonyosef.github.io/wip/2026-11-15/FOR-MOSES-2026-11-15-each-dictionary-as-a-category.md:18) names «(+) archer» among them.
  - The plan holds the 306 at rest and has an open put-back asking the lane whether they belong (LANDING-PLAN.md:27 and :248).
- **What the owner ruled on.** The owner's «preselect it off» (S/ship/reader/zone.html:3487-3494) was taken on source-signs ledger v1. That ledger's STRONG_SIGN is «reading begins with "X ", "× " or "+ "» (RULE-source-signs-v1.md).
- **What the design does.** It makes its decision the default: `SOURCE_SIGN[0]` (zone.html:3510) becomes the widened pattern. As a result:
  - under «off», the card newly hides 81 readings at up to 7,739 word places (the design's own figure);
  - 6 Tikkunei Zohar lines «(+) archer» move.
- **The count is off by one.**
  - Of the 306 lines, 80 (all M14) hold the sign alone in a bracket.
  - The 4 M9 «(» lines all hold words, for example «(× every) province.» and «(× male or female) barren (woman).».
  - The design's 81st reading is M9 גדול r61 «(×) very.». It is a rendering of an M9 list and not one of 7a's 306 lines (call7a-grain-v1, m9-whole-lists-v1).
- **The declaration does not settle it.** The declaration the design cites reads the edition's round bracket as what a rendering «may take» (declaration.json:571-575). So whether a sign inside one is «carried» is the lead's question to answer, not the design's.
- **What the design must say instead.**
  - Build the lead's call as it stands: the ledger's head pattern for `STRONG_SIGN` and `SOURCE_SIGN[0]`; G1 to G4 and gate class (b) on that pattern; no «plus 6»; the 306 held as planned.
  - Carry `open_paren.holds_sign_alone` (declaration.json:424-428, count 83; 80 readings on the ship) to the lead as a question, with this evidence.
  - Put-back 1 should ask the lane to reconcile its two documents, not tell it the opposite of today's letter.

### 2. SHOULD FIX: Question 9 is never named
The task asks the design to say exactly where the lead's call supersedes question 9 and the plan's `phrase` facts. Question 9 (OWNER-QUESTIONS-2026-11-14.md:23) was taken as recommended:
- a separate «phrases» switch, off at rest, over 17,046 readings;
- the card's words «part of a longer phrase, by Strong's sign X» and, for UBS, «a phrase's meaning: …»;
- in the plan, `apply-phrase-rows-v1` writing `phrase` on 7a less the 306 (15,785 rows) and on 7b (1,261), plus a phrases gate beside the names gate (LANDING-PLAN.md:79, :197-199).

The design quotes only question 10. It must state each of these:
- **(a) The switch.** There is no «phrases» switch and no phrases gate.
  - Strong's signed renderings stay in the pool and are a press away under the signs switch, as today («N readings carrying a source's own sign switched off», zone.html:11562-11569).
  - UBS's rows rest shut under the kinds' one switch. One `fh.kinds` preference (zone.html:3791-3794, 3826-3832) opens them together with the word lists and English Wiktionary's names, so a reader cannot open UBS's collocations alone.
- **(b) The card's words.**
  - «part of a longer phrase, by Strong's sign X» is not printed.
  - «a phrase's meaning: …» is replaced by «N that the UBS dictionary gives under a collocation · show». The collocation itself appears only in an opened pill's title.
- **(c) The facts.** No `phrase` is written on Strong's 15,785 rows. `phrase` and `picked_at` go on UBS's 2,649 rows, not on 7b's 1,261.
- **(d) The reach.** Question 9's 17,046 lifted readings become 0 Strong's rows lifted and 2,649 UBS rows shut (2.1 times 7b), less question 10's places.
- **(e) The headings.** The lead's own words are «belongs with the headings on the card by kind» (THE-OWNERS-WORDS:34). Headings by kind are the kinds' later ship; this ship rests the mark shut under the count line.

### 3. SHOULD FIX: The UBS kind's edges are drawn by the design, not by UBS
State them, and ask the lead where they differ from the «phrase mark» he named. All figures below are from my own re-derivation (ubs-marked-classes-v1, ubs-collocation-shapes-v1, b7-names-v1).

- **7b is misdescribed.** The calls' RULE.md (S/ship/reader/data/audit-calls/calls-v1/RULE.md:73-76) splits 7b from 7c by UBS's own LEXCollocations. Only the pool the split was drawn from was an English test: v184's 3,655 rows that open «literally:» or hold « > », which is 1,261 + 2,202 + 192.
  - The design should say: 7b is UBS's own mark, read only inside v184's English-test rows; the mark's whole field reaches 3,121 M18 rows.
- **UBS's field is not always a phrase.** Of the design's 2,649 rows, 154 carry only collocations of one written word.
  - 35 of them are the key's own letters, for example שוב r148 and r149 | שׁוב, קדש r174 | קָדֵשׁ, חזיון r10 | חֶזְיֹון.
  - Others are another form of the word: תשע r11 «ninety» | תִּשְׁעִים, and מצודה r11 «(trammel) net» under its three spellings.
  - The lane flagged 23 such rows in 7b (RULE.md amendment 3).
  - The card's «under a collocation» is literal (UBS's field), so the card makes no claim. But the lead said «phrase mark», and the fact name `phrase` is our word. Name the 154 and the 35, ask whether a collocation that is the word itself belongs, and consider naming the fact `collocations`.
- **The 47 «also a plain meaning» rows depart from the call the owner accepted.** RULE.md:76 makes a row PHRASE «if one of its meanings is so marked», and amendment 4 (:130) keeps it so. Three of the 47 are 7b rows: מלא 72, עמד 159, שסע 20. Keeping them is the faithful side, but say it is a departure.
- **The 425 name rows.**
  - Quote the deciding rule exactly: «The Bible dictionaries' own name entries keep the gate as it is: they stand where the text's word is a name» (wip/2026-11-15/each-dictionary-as-a-category/THE-OWNERS-WORDS-2026-11-15.md).
  - Say that 7 of 7b's rows follow that rule instead of call 7:
    - בוא r175 and לבוא r129 | לְבֹא חֲמָת;
    - גבעא r5, גבעה r14, גבעת r8 | גִּבְעַת הָעֲרָלֹות;
    - הנם r14 | גֵּי הִנֹּם;
    - חרוץ r27 | עֵמֶק הֶחָרוּץ.
  - UBS's own data partly supports the carve-out: for 297 of the 425, the collocation is one written word, the name's own forms (יוידע r3 | יְהֹויָדָע); 128 are several words (דקר r22 | בֶּן־דֶּקֶר).

### 4. SHOULD FIX: Four of the «136 whole lists» are read whole, so the rendering grain the lead asked for does not hold for them
- 132 of the 136 are divided by the M9 ledger. For those, the head test runs per rendering (call7a-grain-v1).
- 4 are one reading on the page (m9-whole-lists-v1), 52 renderings with no sign at their head in all:
  - אשר r166: 30 parts, 19 with no sign at the head;
  - יעל r53: 6 parts, 5;
  - עבד r175: 24 parts, 23;
  - שתה r43: 7 parts, 5.
- At rest, the signs switch already hides each of these whole (zone.html:11562), and the design's head test sorts each whole.
- אשר's list is on the card at up to 4,836 word places under the word's own key and 718 more under a piece's key (whole-list-places-v1; no gate applied, so an upper bound).
- «Its 136 whole lists lose nothing» is true only against today. Name the 4, say the switch already hides their unsigned renderings at the row grain, and either put the 4 back to the lane for the M9 ledger to divide or ask the lead.

### 5. SHOULD FIX: Decision 1 decides a Tikkunei Zohar scope the lead has not ruled
- The lead's scope ruling (S/ship/reader/data/dictionary-kinds-v1.json:11; STATE-2026-11-15.md:58): «a work whose zone carries no rests_off stamp (the Tikkunei Zohar, which is in progress …) keeps today's rest exactly».
- The design reads the lead's reason as «bare places» only and runs the sign rule on the Tikkunei Zohar:
  - 1,871 of that work's 98,037 resting lines move (1.9%), 6 more with decision 2;
  - that is every line the rule moves except Job 1:21.
- The design's own output shows where the lines go (signed-lines-on-ship-v1.out.json `tikkunei_zohar.top`), and the design itself calls these «not better meanings»:
  - «X burn (incense)» → «be male» (10 keys);
  - «X abundantly» → «blaspheme» (10 keys);
  - «X after» → «appear» (20 keys).
- Put the scope to the lead with these examples. Until he answers, build on the 39 books, as the kinds are.

### 6. SHOULD FIX: Question 12's fold drops the owner's pointer display and credits the pointer's source
- The page's rule (zone.html:3647-3651): «the pill stays the pointer's own row, credited to its own source. The page prints the English with the pointer beside it, on the pill and on the line». The owner's example is «twelve (feminine of ...)» (:11504-11506).
- Question 12's case: M13's «mighty, valiant (plural indefinite form of אביר)» beside M25's «mighty, valiant» (specs/v191-pointer-map.md:187).
- The design joins the pointer rows to the other group «as carriers» and moves the pointer's words into the title. The pointer leaves the pill's face, and `data-by` names M13 as carrying English its row does not print.
- The design must say:
  - the one pill keeps the pointer visible, for example «mighty, valiant (also plural indefinite form of אביר)»;
  - the pointer's source rides in its own attribute, apart from the carriers;
  - F12 checks both.

### 7. SHOULD FIX: G3 and the census test only a line's head, and the lead's own example was a later piece
- On live, Nehemiah 2:13:16 reads «them + X abroad» (M9 M14): the sign opens the second piece, not the line.
- The census and G3 test `^(X|×|\+) ` on the whole line, so they would miss it.
- On the combined ship that place now reads «they + were broken down» (PIECE:TAHOT). Later pieces opening with the sign number 1 on live and 0 on the ship (signed-pieces-v1, bible-signed-vs-call4-v1). The design never says what became of the lead's example.
- G3 (and G2, for joined lines) should test every piece split at « + ». The design should report the example and the 0.

### 8. NOTE: Which sources the sign predicate reaches
- `opensWithStrongSign` is not scoped by source, just as the ledger's pattern is not.
  - It also takes MACULA's «X and» and «X also» under ו (M3). MACULA's own sign, by the ledger, is «~».
  - MACULA's «~» itself leads 4 Tikkunei Zohar lines («take ~ back»), which the rule leaves alone (signed-pieces-v1: tilde M3, 4 lines).
- Lines with STEP's brackets (M4: 2,526 square, 1,023 angle) are STEP's words at the place and rightly outside the rule.
- State the scope (Strong's sign in M9 and M14) and these two leftovers.

### 9. NOTE: The search drops the rows question 10 keeps on the card
- A row its source's category rests shut leaves the search «open or shut» (bake-search-index-v1.mjs:237, :290, :328).
- With `stands_at`, the 2,649 rows stand on the card at 4,156 places (the design's figure), yet no search finds them there.
- Either index them at their `picked_at` places or say so.

### 10. NOTE: 7d is held, but the mark is in the same dictionary's file
- The kinds record files M17 by its own words: every record ends «UBS Dictionary of Biblical Hebrew © United Bible Societies, 2023. Adapted from Semantic Dictionary of Biblical Hebrew». That is the same dictionary as M18's file.
- 7d's «to go to the stones of the pit > to die» (אבן r6) is the same UBS meaning as 7b's אבן r42, collocation ירד אֶל־אַבְנֵי־בֹור.
- Holding 7d follows the lead. But put-back 5's «SDBH's mark, if it has one» should instead ask the lane to tie M17's rows to the UBS file's meanings.

### 11. NOTE: The v187 seam hold
- **The figures hold** (words-back-seams-v1, run on the relay's own `prints`). There are 11 seams:
  - joined inside words_back by rule 25: 5 done (יהורם 13, נבל 83, שבט 48, ארבעים 10, גנזים 5) and 3 settled;
  - made by a close under rule 23: 3 done (אחר 71 «מֵאַחֲרֵי57», טרם 7 «בְּטֶרֶם39», יהוה 24 «יְהוָֺהC518»).
- The design is right where the 14 November spec filed יהוה 24 under rule 25.
- 740 = 512 + 228 holds. The 231 settled rows are question 18's: the spec's owner question reads «May the whole Hebrew pieces of 231 BDB openings be put in BDB's printed order», and the note of 15 November takes it.
- **Two changes.**
  - Cite «an example names a class», not «a rule … runs over the whole shelf»: the hold tests the lane's output text, not a dictionary's category.
  - For the 3 close-made seams, the words back could land with only that one close held. If the whole row stays held, say why.

### 12. NOTE: Wrong cross-reference
§3 sends Lamentations 4:3:10 to «put-back 5», but put-back 5 is UBS's collocations. The Lamentations point is the plan's own put-back (LANDING-PLAN.md:252); add it to §10.

## What held when I tried to break it
- **The 14 Bible lines that open with the sign** on the ship (bible-signed-vs-call4-v1; S/v77/ship56-design/call7-signs/q3-class.out.json):
  - 13 are call-4 stands places: action `steps_words_are_the_line`, STEP's words free of « | », none a ketiv/qere pair;
  - Job 1:21:3 «X after» is not a call-4 place, and its STEP pick is in question 3's class, which stays held;
  - the 1,885 head-signed lines and the 6 bracketed lines reproduce (signed-pieces-v1).
- **The rule is a sort, not a filter.** A card whose every reading is signed keeps them all (zone.html:11557-11563).
- **The code citations are right** at: zone.html:3510-3511, 8651, 11501, 11551, 2865, 2875; gloss-store-v1.mjs:65, 80, 391, 442; bake-witnessed-order-v1.mjs:113; project-lattice-v12-v1.mjs:578; dictionary-kinds-v1.mjs:204, 224.
- **The UBS figures reproduce by my own road:** 2,649 rows, 425 name rows, 47 also plain; 1,251 of 7b inside the set, the other 10 being 7 name rows and 3 also plain.
- **«0 lines» for the UBS kind holds.** The only resting lines that print a reading of the set are the 8 «Sea of Reeds» run lines, credited to M18 alone (ubs-set-lines-v1).
- **Question 10:** all 5,222 of 7e's references name a pick whose meaning is the row's own.
- **Question 3 stays held:** STEP's words print only at a stands place or a bare line.
- **Question 11 is untouched.**
- **Question 8:** the joined reading stays on the run card's rung.
- **Call 4's category** is the lane's enumeration of STEP's own tie layers (RULE.md, call 4: every place whose TAHOT tie is open-q11, open-q1 or open-q14), not a hand-made list.
- **Questions 17 and 18** are taken as recommended.

## Not measured here
I did not recount these; they are the design's figures:
- call 4's 432 moved lines;
- call 3's 2,153 runs;
- the UBS kind's card reach (121,941 and 303,057 pills);
- question 12's 153 pills.

## Scripts and outputs
The outputs sit beside each script. String literals carry no Hebrew (\u escapes); I re-ran every script after escaping and the outputs were byte for byte the same.
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v77/ship56-design/review-faithfulness/signed-pieces-v1.mjs (outputs signed-pieces-v1.ship.out.json and .live.out.json). It reads the ship's resting-line records and S/v76/live-records.
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v77/ship56-design/review-faithfulness/call7a-grain-v1.mjs (outputs call7a-grain-v1.out.json). It reads 7a's pinned list and the ship's store through gloss-store-v1's readingsOf.
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v77/ship56-design/review-faithfulness/m9-whole-lists-v1.mjs (outputs m9-whole-lists-v1.out.txt).
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v77/ship56-design/review-faithfulness/whole-list-places-v1.mjs (outputs whole-list-places-v1.out.json). It reads the 39 zones.
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v77/ship56-design/review-faithfulness/ubs-marked-classes-v1.mjs, ubs-collocation-shapes-v1.mjs and ubs-set-lines-v1.mjs (each with its .out.json). They read UBSHebrewDic-v0.9.2-en.JSON and ubs-sdbh-hebrew-definition-routes-v1.csv.gz from S/v77/ship56-design/call7-signs/dl-ubs, plus the ship's store, records and zones.
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v77/ship56-design/review-faithfulness/b7-names-v1.mjs (outputs b7-names-v1.out.txt).
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v77/ship56-design/review-faithfulness/bible-signed-vs-call4-v1.mjs (outputs bible-signed-vs-call4-v1.out.txt). It reads the records, the zones and call 4's pinned list.
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v77/ship56-design/review-faithfulness/words-back-seams-v1.py (outputs words-back-seams-v1.out.txt). It reads S/dl-v195/v187/v2/ledgers/all/made-spaces/words-back-v1/words-back-final-v1.jsonl.