# For the card in S/s16 (`reader/tools/place-card-v1.mjs`, carried by place.html and zone.html), from the ninth cut

Builder V7 wrote these two pieces of the card, code-ready. They go in when S/s14's cut-9 tools and data are reconciled into S/s16.

1. **The ABSENT line** (block line 133), with W added:
```js
  const ABSENT = { 0: "This dictionary has no entry under this number.", B: "The index names no entry of Brown-Driver-Briggs for this number.", P: "This is STEP's own number; no dictionary is filed under it.", W: "This dictionary files one entry under this number, and by its own reference to Brown-Driver-Briggs that entry is another word of the number than the one STEP's letter names." };
```
2. **The credits paragraph for unfoldingWord** (block line 651), replacing «Only part of this lexicon is on hand here…»:
```js
      p(el("b", "", "unfoldingWord Hebrew and Aramaic Lexicon. "), `© unfoldingWord (CC BY-SA 4.0). The whole lexicon is read here: one entry under each Strong's number its own list names, with no letter, and unfoldingWord marks every entry as needing edits. Under a number it has no entry for, the card says so. Where its entry is, by its own reference to Brown-Driver-Briggs, another word of the number than the one STEP's letter names, the card says so and does not show it. Revision ${rev("unfoldingword_uhal")}.`),
```
3. **Notes:**
   - A W line has no entry ids, so no unfoldingWord pill can come from a W tag.
   - The card's `if (how === "H") continue` is never reached for unfoldingWord now.
   - The title stays «unfoldingWord Hebrew and Aramaic Lexicon» until both lanes agree on the source's own title, «Unlocked Hebrew and Aramaic Lexicon».

**Cut 9 with W, pins in S/s14:**

| PIN | sha256 |
|---|---|
| joined | 79eb1640a5db… |
| entries | f555ad5702c9… |
| page | a173241d9367… |
| places | 641953e29f93… (unchanged) |
