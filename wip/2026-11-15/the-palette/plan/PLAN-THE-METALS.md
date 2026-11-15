# The metals: the plan (15 November 2026)

Written by the page lane from the four surveys in `survey/` (the reader page, the other pages and their builders, the checks and the records, the woven name). The surveys ran read only on the live main (ace7f07eba). The plan writer and the critic they were to feed did not run: the account's weekly limit for helper agents stopped them (it resets 19 November, 8pm UTC). So this plan is the lead's own, and the lead builds it.

## The scheme, in the owner's words

`../THE-OWNERS-WORDS-2026-11-15.md`, words 1 to 19. In short: linen the ground, no dark mode; scarlet the Hebrew; blue the readings; purple our voice; silver our layering (the blobs and the compspan boxes); bronze the card, its outlines, its pointer lines and the apparatus (it «held the tent»); gold the Masoretic signs, the real gold and never the orange. The woven name: no hand-off into «and»; «and» gold crossed with bronze; «.com» and its dot purple crossed with silver; woven both ways, steep, 21 units.

## Values

| token | value | on linen | what it paints |
|---|---|---|---|
| `--bronze-dim` | #7f6044 | 4.31:1 | structure at rest: every frame, rule and box, the card's outline, pills and buttons at rest |
| `--bronze` | #6d523a | 5.40:1 | structure under the hand (hover, pressed), the held word's box, the tether, the numbers (text) |
| `--silver` | #6e7378 | 3.59:1 | the line of every blob and every frame around a run's words |
| `--gold` | #a48829 (the owner's choice; #967c26 if the owner takes the darker) | 2.57:1 | the Masoretic signs only, through `--mark-ink` |
| `--sel-text` | rgba(127, 96, 68, 0.17) | | the reader's drag selection (bronze at a sixth keeps scarlet and blue at 4.5:1) |

Both bronzes keep hue 28° and saturation 30% (word 19). Two bronzes keep the site's pairs, «regular and dim» (the owner, 10 October), and the numbers need 4.5:1, which #7f6044 does not reach. Silver is #6e7378, not the swatch's #7c8187: a frame line sits on the blob's pressed fill, where #7c8187 reads 2.46:1, under the 3:1 a needed outline must reach; #6e7378 reads 3.00 there. The woven name's silver thread takes the same #6e7378 edge, so the name and the page keep one silver.

## The lead's calls on the surveys' questions

Each is within the scheme; the owner can overturn any.

1. Two bronzes, as above (reader-page Q1–Q2, other-pages Q1, checks Q2–Q3). The door uses the same two.
2. Silver #6e7378 (reader-page Q3, checks Q1).
3. The edges that are purple today and are structure go bronze: the card's outline and its moved ring (`--bronze-dim`), a chip's hover edge, the count's flash, the opened count and contents spines (`--bronze`). The drift chip, the note rails and the typed-here underline stay purple: they are our voice. The focus ring stays purple: the reader's own hand (reader-page Q4, Q10).
4. The brick gap's hairline and ticks `--bronze`, the empty verse's rule `--bronze-dim` (reader-page Q5).
5. The edition's dotted underline (where Leningrad differs) `--bronze`: the page's own comment calls such a mark the text's apparatus (reader-page Q6; the checks part had said silver).
6. The ketiv/qere bracket `--bronze`, a pointer; the dead text-decoration-color beside it goes (reader-page Q7).
7. The selection tint, bronze at 0.17 (reader-page Q8, other-pages Q4, checks Q6).
8. The typed name (a fallback no live page shows): «and» in the gold #a48829 through `--gold`, «.com» plain purple without the blue stop (reader-page Q9, other-pages Q3, woven-name Q1).
9. The card's weave and the blobs' pressed fill stay linen (reader-page Q12).
10. The small pages' gold ink: links the purple dim, as on the door and 404; the reference page's title the ink; its chip edge bronze (other-pages Q2).
11. The switches page's purple rules beside this project's statements stay purple (other-pages Q6).
12. The color record: a new rule, color-channel-rule-v3, in the same file, from the checks part's proposal (survey/color-contract-v1.proposed-2026-11-15.json), with the values above (other-pages Q5).
13. Held for the owner, not built: English printed in scarlet (the porch's readings through `--en-word`, the volume numerals, the «+ Aramaic» letters). The scheme says scarlet is the Hebrew; changing those is a channel ruling, not a metal.

## The one question for the owner

The signs: #a48829 as chosen (2.6:1 on linen, a little fainter than today's 3.4:1), or the same gold a shade darker #967c26 (3.0:1). Picture: `../pictures/signs-three-golds.png`. The build takes #a48829 until the owner answers; it is one token.

## The edits

1. `reader/zone.html` (whose style the door builder copies byte for byte into `reader/engine-*.css` for the 1,272 built reader pages): the tokens above in `:root`; every `var(--gold)` that paints structure to `var(--bronze)` (83), every `var(--gold-dim)` to `var(--bronze-dim)` (17 of 18; the typed «and» goes to `var(--gold)`); `--line`, `--line-c`, `--chip-line` to `var(--bronze-dim)`; `--mark-ink: var(--gold)`; the purple edges of call 3; the frame line's script default (`window.__tie`, zone.html:11386) to `var(--silver)`; `--gold-dim` and `--sel-dim` retired; the rows of calls 4 to 8. Row by row: `survey/TABLE-reader-page.md` §3.
2. `reader/tools/build-front-door-v1.mjs`: the door's stylesheet tokens to the same values (65 rules follow the tokens; 44 direct uses edited, `survey/TABLE-other-pages.md`); the palette page's `CC_TOKEN` and `CC_WEARS` learn bronze and silver; the small pages' `SMALL_PAGE.gold` (call 10).
3. `reader/tools/build-chain-book-v2.mjs` (CHAIN_CSS) and `reader/tools/build-toggle-design-v1.mjs`: their gold to bronze and silver as the table says.
4. `reader/tools/build-wordmark-v1.py`: the woven-name part's patch (`survey/build-wordmark-v1.patch`), proven to redraw the approved drawing byte for byte; the silver edge #6e7378 (values above), so the drawing is re-proven against itself.
5. `reader/data/color-contract-v1.json`: color-channel-rule-v3.
6. Checks: `check-color-channels-v1` (the checks part's revision, survey/check-color-channels-v1.proposed.mjs, read again against the final values), `check-card-numbering-v1` (its inks learn the three metals), and a new `check-woven-name-v1` (the drawing's sha256; only the thread colors; the door, census and every reader page name a file that exists).

## How it is proven

Lint at baseline. The color checks on the tree. The round's lines, chain and door steps (any zone.html change makes the 40 resting-line records and the 12 chain books stale; the door re-extracts the engine css and reprints /palette/). The switches builder and the wordmark builder by hand. The whole suite. The gate (it reads text, not color, so it should show no difference). Before-and-after pictures of the door, a chapter, a card, the chain, the switches page and the palette page, for the owner. Then the ship and the live check.

This palette ship goes from main on its own, ahead of the default toggles, whose third fix round the same limit stopped; the toggles then take main in.
