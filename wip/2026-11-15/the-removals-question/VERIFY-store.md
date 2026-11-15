# VERIFY-store: a skeptic's check of LENS-store.md (15 November 2026)

Read only. Nothing run in either tree. My scripts and outputs are in the scratch folder
`/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v66/verify-store/`
(the earlier, stopped run left scripts and a pre-strike store extract under `prestrike/`, but no write-up. I reran what I needed: `prescan2.py`, `hark3.py`, `hk4.py`, `pl.py`, `la3.py`, `cnt.py`, `key.py`, `scd.py`).

The inventory reached me cut off at item `store-t1-entry-ledger-v1-1` (v190). I checked every item before that one and none after it.

## What holds

- **The arithmetic.** 773,847 − 97,384 − 22,007 + 430 − 2,180 + 71 + 177 = 652,954. The struck-ranks record holds 121,594 typed ranks. The per-id language counts recompute exactly: the Jastrow ids give 60,926 (M52 and M108 hold 0), and the silent group gives 79,095. In the 16 rounds, 507 rows were struck or withheld (178+34+58+142+49+6+3+14+23). The mah branch's question and the owner's «Keep withheld» are verbatim in row-strikes-v1.json, under rulings[0].
- **Peru.** The live store holds six Peru rows under פרו: M13 rank 9 (name: 1), M32 ranks 12, 15 and 19, M42 rank 17, and M1 rank 18. The only Peru row the strike record names is round 13's «peru (n)», folded into rank 18. name-rows-v1.jsonl line 7405 is `{"k":"פרו","rank":9,"m":"M13",...}`. The names rule reads Kaikki's `pos` = `name`, and a place counts as a name when TAHOT or MACULA calls it one. The owner's words «1-3. ok agree» and the question «Names. Hide a dictionary's names, such as «Bara», where the word on the page is not a name.» are verbatim in rulings-2026-11-13-options-v1.json. One point to add: the owner was asked that one sentence. The Peru pill appears in the record's `on_the_readers_cards` list, and nothing shows that the owner saw that list.
- **The owner's frame words** of 31 August and 1 September are verbatim in frame-record-v1.js.
- **Rule 1a came before the owner's words were written down.** Commit 3419f1c690 (01:32, 1 September) wrote rule 1a. The frame that carries «Admission is affirmative» was recorded at 07:28 (0b70728124), and that commit says the rulings were «enforced in the tree before they were written down». The tool justifies 1a by «the owner's ruling that coverage is not the goal».
- **Bolls.** No verbatim words of 8 October exist in git (any branch) or in wip/. Only the paraphrase does.
- **Other quotes that check out.** The fold (7 November, «agree with r2 ...»), Davidson's year («if you know its 1855 ...»), Latin («lets keep latin negative toggled ...») and Jastrow («oh ok then yea it sounds fine, both good.») are all verbatim. The Ben-Yehuda quote in store-09 is the record's own shortened form; the full form is in commit cf3ddb0824.
- **v188.** The 4,256 lost readings and «A defect of the lane's» are verbatim in FOR-ELIJAH-v188.md.

## What does not hold

1. **store-01: PanLex and Kaikki's "non-Hebrew" tables are struck on our label, not the source's word.** M24 and M82 (PanLex, 13,221 rows) and M78, M99 and M103 (Kaikki translation tables, 925 rows) were struck as «declares itself non-Hebrew». The words «Hebrew-script-language» and «non-Hebrew-language» are the corpus lane's catalog label. Our regular expression `UNNAMED_NON_HEBREW` reads them as a declaration. Neither PanLex nor Wiktionary declares the bucket non-Hebrew: each gives a language for every row, and the strike never read it. The pre-strike rows show the result:
   - M82 holds 89 Biblical Hebrew stem-tagged definitions: קדש «(to) be holy (Qal)», שוב «(Qal:) (to) turn back», טמא «defile (Piel)», פקד «pay attention (Qal) (Niph'al: passive of Qal)».
   - M24 holds תעה «go astray», חזק «speed up» and מתפלל «one who prays» next to Yiddish הויפט and קומען.
   - M78 holds Aramaic, an admitted language: צלא «synagogue», מסמרא «nail», בטמא «terebinth».

   For these five ids the basis is OUR_RULE (the owner ruled only the class). They are in tension with 14 November. SOURCE_SAYS holds only for Kaikki's Yiddish (M40, M63, M104, M168) and Arabic (M131) dumps.
2. **store-02 (Harkavy): stronger than the reader says.** The struck rows are the dictionary's Hebrew column. 376 rows sit on 269 keys in the pre-strike extract; the record says 252. Only 2 keys show a Yiddish-only spelling (מכוער, סער), and both are Hebrew words too. 171 of the keys are also Kaikki Hebrew keys, and 150 are BDB, Strong's or MACULA keys. Samples: התעקש «to be stubborn», לבביות «sincerity», העדיף «to give in excess», דחיקה «pressing». Even the commit's own example ריאליסט «realist» is Hebrew spelling; Yiddish writes רעאַליסט. So the strike rests only on the word «yiddish» in our cache folder's name, and the record's claim that the headwords are Yiddish is false for these rows. The owner's «Provenance outranks label» is general and never names Harkavy.
3. **store-05 (Bolls): LICENSE holds; the owner's ruling is a paraphrase.** Read the basis as LICENSE, with the owner's 8 October ruling: no verbatim words found.
4. **store-o4 (name mark): the scope choices are ours.** Add OUR_RULE for the choices of which sources are read, «every entry», and «one of TAHOT or MACULA». The Peru verdict itself rests on source facts.

## What the reader missed in this lens

- **The order-column drop in regloss-zone.mjs** (source-strike-rule-v1). A reading whose credit names a struck source, or whose M cannot be derived, leaves the line's order column. It is our rule, and no ruling was found. The live zones record 0 such drops today (`scd.py` over 147 zones). type-witnessed-drops-v1.mjs says the drops of 17 October went uncounted until 23 October.
- **gloss-store-v1.mjs rule 5.** A route whose M is not in the index is not eligible. This is the downstream form of every whole-source strike.
- **The tool's own justification for 1a** is the page lane's reading of a different ruling, «coverage is not the goal».
