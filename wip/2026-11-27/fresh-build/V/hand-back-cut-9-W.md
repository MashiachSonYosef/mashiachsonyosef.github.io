Cut 9 with W (builder V7). The W patch is applied in S/s14 and every proof holds. Nothing was committed, pushed or written to the store, no command was refused, S/s16 was only read (two lines of its card, to fit the wording below), and the title is unchanged.

S = /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad

**What changed.** `S/s49w/patch-uhal-another-bdb-entry.diff` applied cleanly (no reject) to `reader/tools/place-answers-bridges-v1.mjs`, `reader/tools/check-place-answers-entries-v1.mjs` and S/s14's `reader/place.html`. The other three page files are unchanged (same md5).
- **A gap I closed in the check.** The patch tested that every W is right, but a W set back to N (with the pin counts moved to match) would have passed. The entries check now also fails any N whose file's own BDB Reference names another BDB entry than the one the tag reaches exactly.
- **The full tool diff** against the start of the cut is `S/s49w/cut9-tools.diff`.

**The new bridge for unfoldingWord:**
- W: 745 tags (35,398 words)
- N: 10,106 tags (238,688 words)
- 0: 636 tags (25,503 words)
- P: 49 tags

Wikisource is unchanged: N 11,487 tags (299,589 words), P 49. The measured block is unchanged: same BDB entry 10,102 tags (238,679 words), another entry 745 (35,398).

On the page, by the card's own reckoning:
- **The 293,140 rows that were «not on hand»** are now 237,768 drawn, 29,847 W and 25,525 «no entry».
- **5,571 more rows**, drawn before from the old 151 files, are now W.
- **Words:** 237,619 now draw an unfoldingWord row they did not draw before, and 60,804 draw none (W or no entry). No drawn row now names another BDB entry (it was 35,404 words before W).
- **Unfoldingword entries beside the tags:** 8,162 (was 8,168). Tag files are 5,776,048 bytes.

**Proofs:**
1. **The one command** on `S/s49w/received/fetched-cut9` ends «everything holds». It ran in 232 s, and again in 230 s after the check change, with identical pins.
2. **The comparison tool** exits 0, with exactly the 141 known differences.
3. **The entries check**, run alone, holds: UHAL 103,740 strings held, Wikisource 332,749. Two spoiled copies each fail on their own rule, with the pin and counts moved so that only the rule can catch them:
   - a wrong W (H1254A): «UHAL says W though its file's BDB reference is the tag's BDB entry»;
   - a missing W (H6213A back to N): «UHAL says N though its file's BDB reference names another BDB entry than the tag's».
4. **The eight tree checks**, each alone, exit 0 with 0 FAIL.
5. **The trial page**, with no page errors and no card errors:
   - Genesis 1: 434 words; 427 unfoldingWord rows, 359 with an entry, 39 saying W, 29 «no entry».
   - Ruth 3: 258 words; 249 rows, 192 with an entry, 42 W, 15 «no entry».
   - On browsers: I waited for H2's browser to close before starting (it ran about 40 minutes). H2 opened another one while my Genesis run was ending, so my Ruth 3 run (about a minute) overlapped with it.

**New pins:**
- joined `PIN.json` 79eb1640a5db1476f27e6e0105643e5083dd27172f0199478737844df1ecf1c1
- `entries/PIN.json` f555ad5702c952bac4223270bdd198c7a658e4631bac9f23a77c07d6c116fe29
- `page/PIN.json` a173241d9367592b923627a8bbca2e6a28ea1367a9547a829d29752160ac0341
- `places/PIN.json` 641953e29f93c701900bfc4407e58211c5223ccb50bed802610bdb537841cdd8 (unchanged)
- `sources.json` 9950bf1accad1bf8f4ac5cc3051816229dd72faa77c60487dfa0de2601b7872d (unchanged)

**The two pictures** (412 wide, scale 2) show the W sentence where the card had «press», «squeeze» and «כִּי אם־ that if, for if»:
- `S/s49w/shots/03-genesis-1-7-word-1-made-uhal-W.png`
- `S/s49w/shots/04-ruth-3-13-word-5-if-uhal-W.png`

The card numbers the Ruth word «word 5», because the paseq before it is counted among the entries but not among the words. My earlier file name «word-6» was wrong, so I renamed both Ruth files. The pictures from before W are kept beside them as `…-before-W.png`.

**The card's wording, code-ready for S/s16's `reader/tools/place-card-v1.mjs`:**

1. **The ABSENT line (its line 133).** This is the line with W added. Its words are the ones S/s14's place.html now carries.
```js
  const ABSENT = { 0: "This dictionary has no entry under this number.", B: "The index names no entry of Brown-Driver-Briggs for this number.", P: "This is STEP's own number; no dictionary is filed under it.", W: "This dictionary files one entry under this number, and by its own reference to Brown-Driver-Briggs that entry is another word of the number than the one STEP's letter names." };
```
2. **The credits line (its line 651; the same paragraph stands in S/s16's place.html:615 and zone.html:4633).** It prints the revision from the data with the card's own `rev`, as the STEP and MACULA lines do. `rev("unfoldingword_uhal")` gives «0a2b9bf1e43fc37130e331504b43c69f8c16563c (the commit the host writes in the zip's own comment)».
```js
      p(el("b", "", "unfoldingWord Hebrew and Aramaic Lexicon. "), `© unfoldingWord (CC BY-SA 4.0). The whole lexicon is read here: one entry under each Strong's number its own list names, with no letter, and unfoldingWord marks every entry as needing edits. Under a number it has no entry for, the card says so. Where its entry is, by its own reference to Brown-Driver-Briggs, another word of the number than the one STEP's letter names, the card says so and does not show it. Revision ${rev("unfoldingword_uhal")}.`),
```

**Notes for H2's card.**
- A W line has no entry ids, so `recordsShown` already returns nothing for it, and no UHAL pill can come from a W tag.
- No line says «H» for unfoldingWord now, so the card's `if (how === "H") continue` is never reached for it.

**Logs, all in S/s49w/:**
- `cut9W-make.log`
- `cut9W-lines-compare.log`
- `cut9W-check-entries.log`
- `cut9W-spoil-wrong-w.log` and `cut9W-spoil-missing-w.log`
- `cut9W-tree-*.log`
- `cut9W-words-drawn.log`
- the scripts used: `scripts/spoil-w.mjs` and `scripts/trial-page-cut9.mjs`
