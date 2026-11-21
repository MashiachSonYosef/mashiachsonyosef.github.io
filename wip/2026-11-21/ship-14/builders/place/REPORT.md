# Builder «place»: the card that moves when a second pill is pressed (task 130), mended

As handed back, 21 November 2026. `patch.py` (three exact replacements in `zone.html`, 64 lines with their comments, no stylesheet rule touched), `check.mjs` (one law, 95 seconds).

**What the trace showed.** The first cause is not the placement's last fit, which changed a height by 1px at most. Every record drawn adds its «the record, whole» control a frame later and calls the clamp, which fits again and keeps the top. At Obadiah 1:1 word 1 the card went 688px to 768 at the press and was placed again 80px up, then 668 with the top kept. The same happens as cards open: live opens Obadiah 1:1 word 3 28px from its word.

**What changed.**

1. The clamp (`placeInBounds`) holds a placed card at its word (8px, 4px either way) while the page has not scrolled, or scrolled and left the word in place. If the fit leaves it away, a card above an unmoved word is stood on its foot again with no new fit; any other is placed again by `placeHud()`. `placeHud` notes the hold in its last line.
2. `paintReset` writes the reset pill's line through the page's own `holdingSection`, pinned on the open card's word. The first pick scrolls the page by the row's 16px instead of moving the Hebrew.

**The check**, three runs each, the same every time:

- live: FAIL, 36 presses, 19 left the card off its word (412x915, 1:1 word 1, pill 2: above, 124.6px from its word); the first pick of each visit moved its word 16.4px where the word stands low.
- the copy: ok, 0 of 36 left the card off its word; 1:1 word 1 pill 2 on a phone: 8.2px to 8.6px from its word; the first pick moved its word 0.4px in all four.

Wider sweeps on the copy: 212 presses (Obadiah 1:1 and 1:6, Genesis, Ruth, 1440x900, `&commentary=on`, first and later cards). 209 ended at 8px, 3 at 11.4px, none further.

**Repository checks, live and copy side by side: the same verdict on every law.** check-levels-v1 21 ok (two runs; the card opens at 88.28 instead of 82.28, at its word); check-reading-rows-v1 R1 red, outputs identical line for line («9 short»); check-card-opens-on-the-line-v1 2 ok; check-reset-pill-v1 7 ok; check-nothing-overlaps-v1 42 ok; check-drag-offscreen-v1 11 ok; check-landing-holds-the-card-v1 6 ok; check-usable-card-v1 56 ok; check-gloss-whole-v1 13 ok; check-contents-shut-v1 50 ok; check-menu-switches-v1 5 ok. Not run by the builder: the whole suite; check-line-follows-card-v1.

**The builder's worries.**

- The two edits go together. Without the pin, the card follows its word 16px on the first pick, and check-levels reads that as a moved card.
- check-levels and this mend pull opposite ways for a card above its word: the check wants the top still, the mend keeps the foot. They agree on Amos because pill 2 leaves the card at 752px and the drawer takes 1px, inside the 4px. A card that ends more than 4px shorter will move its top.
- The first pick at the top of a book now scrolls the page 16px, as the browser already does farther down. The page counts it as the reader having moved.
- The reset line's room was not kept in the stylesheet, as the first report suggested: it costs every phone 16.4px at rest, and put Amos's first word at 914 of 915 in check-contents-shut.
- Cards as they open now stand at their word where live left them away. Pills and lines are untouched.
- A page the reader scrolled is left alone, as on live.

Read by me: the page diff whole. The clamp's new wrapper cannot call itself: `placeHud` reaches the clamp only for a card the reader moved, and the wrapper holds no such card. Applied to the integration copy on top of the rail and pairs patches; the law holds there and fails on live (`check-on-the-integration-copy.txt`, `check-on-live.txt`). The whole suite is the judge of the placement laws, as on every ship.
