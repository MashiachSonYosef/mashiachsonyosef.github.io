# The woven name under the metal scheme (part: woven-name)

Surveyed 15 November 2026 on the live site's source at `old/` (main ace7f07eba), read only. Nothing under `old/` or `pt/` was touched. Files beside this table, all under `v57/woven-name/`:

- `build-wordmark-v1.proposed.py`: the builder as changed, patch-ready (239 lines; the live one has 230).
- `build-wordmark-v1.patch`: the same change as a unified diff against main (134 lines added, 125 removed). `git apply --check` passes on a copy of the one file, and applying it yields the proposed file byte for byte.
- `prove-woven-name.py` and its output `prove-woven-name.out`: the proof, run here without fontTools (section 3.6).
- `render-compare.mjs`: rendered comparisons in Chromium, and each part's mean color.
- `one-42-dot-woven.svg`, `one-42-dot-bronze.svg`: the builder's one-way setting at 42 units.
- `home-button.mjs`, `home-button-today.png`, `home-button-x60-21.png`: the reader's home button on `/amos/1/`, at deviceScaleFactor 1, with today's mark and with the chosen drawing.

**In one paragraph.** The owner's choices of 15 November (words 13 to 18 in `THE-OWNERS-WORDS-2026-11-15.md`) are all data in the proposed builder: no hand-off; «and» gold crossed with bronze; «.com» and its dot purple crossed with silver; the X, steep (60°), stepping 21 units. With those settings the builder writes `wip/2026-11-15/the-palette/pictures/woven-x60-21.svg` byte for byte: 12,366 bytes, sha256 `ddc8301262911b7f07121b76fc8d2497259b30a51fcdc1e11fc86573c020f4e7`. This is proven here without fontTools. A control run comes first: fed the same way, the live builder redraws today's mark byte for byte (10,521 bytes, sha256 `a1b7c0d7c036bbbf005a324cd30fcac72714703c1c6b447cce35ba663fb31a50`). At 28 units, and at the square crossing, the same builder writes the other three X drawings byte for byte. Set one way at 42, it renders pixel for pixel identical to both drawings of word 15.

**On the brief.** The brief calls the weave "still the owner's open choice". The owner's words record it as chosen: word 18, «x steep tighter still looks cool», means the X, steep, at 21 units. The request relayed for this run is «like X pattern». The builder holds the weave as data either way.

## 1. Where the mark and the name's colors appear (counted)

- **The mark file.** `mark/fireandhail.com-woven-v1.svg` is one line of 10,521 bytes. Only `reader/tools/build-wordmark-v1.py` writes it (l.225–230). The builder is not part of `reader/build.sh` (searched), so it is run by hand.
- **Where it is shown: three ways, 1,274 pages.**
  1. The door. `index.html:1200` holds `<h1 class="wordmark"><img class="wm-mark" src="/mark/fireandhail.com-woven-v1.svg" … width="710" height="88">`, drawn 26rem wide (`index.html:90`). It is written by `build-front-door-v1.mjs:284` (`WORDMARK_DOOR`) and `:1824` (the masthead).
  2. The census. `census/index.html:1200` holds `<a class="wordmark" href="/"><img class="wm-mark wm-mark-s" …>`, 1.5rem tall (`census/index.html:93`). It is written by `:289` (`WORDMARK_SMALL`) and `:1824`.
  3. 1,272 pages carry `<meta name="site-mark" content="/mark/fireandhail.com-woven-v1.svg">`, written by `build-front-door-v1.mjs:2833`. They are the 39 books' book and chapter pages (968), 8 demonstration pages and 296 Tikkunei Zohar pages, in 41 top-level folders. The reader's script (`zone.html:2659–2661`; `engine-948ef173fc14.js:106–108`) turns the meta into `#home a.home img.wm-mark-s`, 1.15em tall (`zone.html:255`; `engine-b23f95d61a8c.css:235`): 126.2 × 15.6 CSS px, measured on `/amos/1/`.
- **Not anywhere else (searched).**
  - `404.html` (13 lines) has no mark and no name color: its ink is #642460 and its link #753c6d.
  - The tree has no favicon, no `.ico`, no apple-touch icon, no web manifest, no `<link rel="icon">` and no `og:` or `twitter:` tags.
  - `README.md` does not name the mark.
  - The switches page prints «The Tabernacle» as a link (`toggles/index.html:62`).
  - The palette and demonstrations pages print «fireandhail.com» as a plain link (`palette/index.html:1156`, `demonstrations/index.html:1156`, `.poc-back`).
  - The held page prints it as its one link, in the old gold (`targum-1kings/index.html:26`, row P1).
  - `1kings/index.html` names the site only in its `<title>`.
- **The typed name** is four spans, `.wm-fire`, `.wm-and`, `.wm-hail` and `.wm-tld`: the fallback where no drawn mark exists. They are written by `build-front-door-v1.mjs:272–275` (used only when `MARK_WOVEN` is empty, `:283`) and by `zone.html:2662–2663` (only when a page has no `site-mark` meta). **They show on no page of the live site.** Their rules have two sources. `DOOR_CSS_BASE` (`build-front-door-v1.mjs:188`) generates `index.html:95`, `census/index.html:95`, `palette/index.html:82` and `demonstrations/index.html:82`. `zone.html:256` is copied to `engine-b23f95d61a8c.css:236`.
- **Checks.** No check reads the mark file or its colors (section 5).
- **Records and comments that name the name's colors.** There are seven, in table R (section 2.7).

## 2. The table

Columns are as the brief asks. «Today's channel» follows the contract (`reader/data/color-contract-v1.json`: "The woven name is dyed in the same pairs"). Contrast is measured against linen #ebdec3.

Counted: **42 color-use rows**. 35 are sure, 4 likely and 3 the owner's call; one of those 3 is a sibling part's question. Table R adds 7 rows of words that name the name's colors and paint nothing.

### 2.1 The builder: `reader/tools/build-wordmark-v1.py` (13 rows)

| # | file | where | what the reader sees | today | channel today | channel under the scheme | new | confidence |
|---|---|---|---|---|---|---|---|---|
| W1 | build-wordmark-v1.py | l.65 `S`, `S_DIM`; l.73 `THREAD['S'] = (S, S, S_DIM)`; patterns `p{uid}S`, `q{uid}S` from `thread()` l.127–133 | «fire» (its f, the stem of its i, r, e) and the flame over the i: a red thread lit along its middle | edge and body #a52035, light #be6367 | shani (the name's fire) | scarlet: «fire scarlet» | `SHANI = ('dye', '#a52035', '#be6367')`; `WORDS['S'] = (SHANI, SHANI)`, woven with itself | sure |
| W2 | build-wordmark-v1.py | l.66 `G`, `G_DIM`; l.73 `THREAD['G'] = (G, G_DIM, G_DIM)`; regions l.164 `(AND[1:-1], 'G')` | «and»: its n whole, and the gold side of its a and d | edge #93661a, body and light #a06c10 (hue 38°, saturation 70% and 82%: the orange gold) | gold (the frames' dim gold at rest, 2026-10-10) | «and» woven of gold and bronze | `WORDS['A'] = (GOLD, BRONZE)`. The warp is the gold (edge #a48829, hue 46°, 2.57:1; body #d3af37, hue 46°, 1.58:1); the weft is the bronze (edge #7f6044, hue 28°, 4.31:1; body #9a7656, hue 28°, 3.09:1) | sure (words 13, 15, 17, 18) |
| W3 | build-wordmark-v1.py | l.66, l.73; l.213 `fill("G")` | the flame's heart, over fire's i | as W2 | gold | gold, the real one | `WORDS['G'] = (GOLD, GOLD)` | sure (word 13; word 17: "the flame's heart gold with gold") |
| W4 | build-wordmark-v1.py | l.67 `B`, `B_DIM`; l.73 `THREAD['B']`; l.216 `fill("B")` | «hail» (h, a, the stem of its i, l) and the hailstone | #23558a, light #768ea2 | tekhelet | blue: «hail blue» | `TEKHELET = ('dye', '#23558a', '#768ea2')`; `WORDS['B'] = (TEKHELET, TEKHELET)` | sure |
| W5 | build-wordmark-v1.py | l.218–220, the glint `<ellipse … fill="{B_DIM}">` | the hailstone's glint | #768ea2, solid | tekhelet, its dim | blue, its dim | `TEKHELET[2]` = #768ea2, unchanged | sure |
| W6 | build-wordmark-v1.py | l.68 `U`, `U_DIM`; l.73 `THREAD['U']`; regions l.164 `(TLD, 'U')` | «.com»'s c, o and m | #642460, light #753c6d | argaman | purple crossed with silver: «purple and silver woven on .com» | `WORDS['U'] = (ARGAMAN, SILVER)`. The warp is the purple (#642460 lit with #753c6d); the weft is the silver (edge #7c8187, hue 213°, 2.95:1; body #b4b8bd, 1.50:1) | sure (words 15, 17) |
| W7 | build-wordmark-v1.py | l.202–209, the dot's gradient `d{uid}` (x 4968 → 5131) from `B` to `U` | the dot of .com, turning from blue into purple | #23558a → #642460 | tekhelet into argaman (2026-10-03: "purple and blue blend nicely") | woven with .com (word 16: «2 …», the second drawing) | `fill="url(#pwU)"` with `DOT_FILL = 'woven'`; the gradient is gone | sure |
| W8 | build-wordmark-v1.py | l.164 `([AND[0]], ('turn', 'S', 'G'))`; l.118 `X0`; l.119–125 `turn_x()`; l.185–201 | «and»'s a: fire's red runs into half of its ink (50%, as the notes measured), with one red thread crossing into the gold | red handing to gold | shani handing to gold | none (word 15: «i kind of like none»; word 14: «less aggressively red/blue trailing into it») | region `([AND[0]], 'A')`, drawn like the n | sure |
| W9 | build-wordmark-v1.py | l.164 `([AND[-1]], ('turn', 'G', 'B'))`; `X0` | «and»'s d: hail's blue runs out of two thirds of its ink (66%) | gold handing to blue | gold handing to tekhelet | none | region `([AND[-1]], 'A')` | sure |
| W10 | build-wordmark-v1.py | l.127–133 `thread()`, stripes 400 × P under `rotate(ANGLE)`; l.86 `ANGLE = 60`; l.162 `P=42` | every letter's threads: one way, steep, a step of 42 units (2.46 CSS px at the door's 416) | one way, 60°, 42 | the weave (it carries no channel) | the X: a plain weave, steep at 60°, stepping 21 (word 18) | `WEAVE = 'x'`, `ANGLE = 60`, `P = 21`, `threads()`, `CROSS[60]`. The step is 1.23 px at 416 px, 1.10 on a 412-px phone, 0.57 on the census and 0.37 on the home button | sure |
| W11 | build-wordmark-v1.py | new: `shade()`, the gradients `xsv` and `xsh` | an over thread darkens toward its two ends, where it dips under | none | none | the weave's shading (it holds no color) | #000 at opacity .26 (`DEPTH`) | likely: all four X drawings are drawn so and the owner approved them by sight, but the owner never named the value |
| W12 | build-wordmark-v1.py | l.175 the `q{uid}{n}` patterns (`rotate(0)`); l.193 the clip paths `c{uid}r1` and `c{uid}r3`; l.196 the rect bands | nothing of its own: the turn's machinery | 4 patterns, 2 clip paths | none | none | removed | sure |
| W13 | build-wordmark-v1.py | l.176 and l.197 `THREAD[n][1]` in `mark(uid, False)` | nothing: no unwoven file is written (l.227; l.26–28 say so) | the bodies #a52035, #a06c10, #23558a, #642460 | none | none | removed: a two-thread word has no one flat color without the owner's word | sure |

### 2.2 The mark file: `mark/fireandhail.com-woven-v1.svg` (line 1; 8 rows)

| # | file | where | what the reader sees | today | channel today | channel under the scheme | new | confidence |
|---|---|---|---|---|---|---|---|---|
| M1 | mark/…-woven-v1.svg | `pwS`/`pwSl` (60°) and `qwS`/`qwSl` (0°) | fire, the flame, and the red bands of the a's turn | #a52035 / #be6367 | shani | scarlet | `pwS` = `pwSw` (warp) + `pwSf` (weft), the X | sure |
| M2 | mark/…-woven-v1.svg | `pwG`/`pwGl` and `qwG`/`qwGl`; fills: the n `url(#pwG)`, the heart `url(#pwG)`, and the gold bands of the a and the d | «and» and the flame's heart | #93661a / #a06c10 | gold | «and»: gold × bronze; heart: gold × gold | the n `url(#pwA)` (`pwAw` gold, `pwAf` bronze); the heart `url(#pwG)` (`pwGw`, `pwGf`, both gold) | sure |
| M3 | mark/…-woven-v1.svg | `pwB`/`pwBl` and `qwB`/`qwBl` | hail, the hailstone, and the blue bands of the d's turn | #23558a / #768ea2 | tekhelet | blue | `pwB` (`pwBw`, `pwBf`) | sure |
| M4 | mark/…-woven-v1.svg | `pwU`/`pwUl` and `qwU`/`qwUl` | «.com» | #642460 / #753c6d | argaman | purple × silver | `pwU` (`pwUw` purple, `pwUf` silver) | sure |
| M5 | mark/…-woven-v1.svg | `<linearGradient id="dw">` and the dot `fill="url(#dw)"` | the dot of .com | #23558a → #642460 | tekhelet into argaman | purple × silver | the dot `fill="url(#pwU)"`; `dw` gone | sure |
| M6 | mark/…-woven-v1.svg | `<clipPath id="cwr1">` and its group of bands `qwG` / `qwS` / `qwG` / `qwS` at y −6636 / −1806 / −1764 / −1722 | the a, red into gold | 4 bands | shani into gold | «and»'s gold × bronze | `<path d="…" fill="url(#pwA)"/>` | sure |
| M7 | mark/…-woven-v1.svg | `<clipPath id="cwr3">` and its bands `qwB` / `qwG` / `qwB` / `qwG` at −6636 / −2730 / −2688 / −2646 | the d, gold into blue | 4 bands | gold into tekhelet | «and»'s gold × bronze | `<path d="…" fill="url(#pwA)"/>` | sure |
| M8 | mark/…-woven-v1.svg | the `<ellipse … fill="#768ea2">` | the hailstone's glint | #768ea2 | tekhelet, its dim | blue, its dim | unchanged | sure |

### 2.3 Where the mark is shown (3 rows; the image carries its own colors)

| # | file | where | what the reader sees | today | channel today | channel under the scheme | new | confidence |
|---|---|---|---|---|---|---|---|---|
| S1 | index.html (generated) | l.1200 `h1.wordmark img.wm-mark`, 26rem (l.90); from `build-front-door-v1.mjs:284`, `:1824` | the woven name heading the door | the mark file | the woven name | the woven name | no edit: the same URL serves the rebuilt file | sure |
| S2 | census/index.html (generated) | l.1200 `a.wordmark img.wm-mark.wm-mark-s`, 1.5rem tall (l.93); from `:289`, `:1824` | the census's way home | the mark file | the woven name | the woven name | no edit | sure |
| S3 | 1,272 built pages; zone.html; engine-948ef173fc14.js | the meta `site-mark` (`build-front-door-v1.mjs:2833`) → `zone.html:2661` / `engine-948ef173fc14.js:108` → `#home a.home img.wm-mark-s` at 1.15em (`zone.html:255`, `engine-b23f95d61a8c.css:235`) | the home button on every book and chapter page | the mark file | the woven name | the woven name | no edit. At this size the X holds without banding: «and» reads as one deeper gold and «.com» as a grayer purple (`home-button-x60-21.png`) | sure |

### 2.4 The name's frame: the rules and outlines around it (4 rows)

| # | file | where | what the reader sees | today | channel today | channel under the scheme | new | confidence |
|---|---|---|---|---|---|---|---|---|
| F1 | build-front-door-v1.mjs l.188 (`DOOR_CSS_BASE`) → index.html:85 | `.wordmark { border-bottom:1px solid var(--gold-dim) }` | the rule under the woven name on the door (seen in `pictures/door-x60-21-phone.png`) | #a06c10 | gold, structure at rest | bronze: «the door's rules and outlines around the name … turn bronze with the palette» (word 18) | #7f6044, the door's at-rest bronze (other-pages row D32) | sure |
| F2 | zone.html:247 · engine-b23f95d61a8c.css:227 | `#home a.home { border: 1px solid var(--line) }` | the pill outline round the small mark on 1,272 pages | `--line` → `--gold-dim` #a06c10 | gold, structure at rest | bronze: a button of the apparatus | `--line` → the at-rest bronze #7f6044 (reader-page row 5) | sure |
| F3 | zone.html:571 · engine-b23f95d61a8c.css:551 | `header.top #home a.home { border-bottom: 1px solid var(--line) }` | the same button's bottom edge inside the top header | #a06c10 | gold, structure at rest | bronze | as F2 | sure |
| F4 | zone.html:257 · engine-b23f95d61a8c.css:237 | `#home a.home:hover { border-color: var(--gold) }` | the button's outline under the pointer | #93661a | gold, under the hand | bronze, under the hand | reader-page's `--bronze`: #7f6044 as S2 drew it, which equals the outline at rest; reader-page recommends #6d523a (5.40:1) | likely (S2 drew it; the reader-page part decides the hand's shade) |

F1's rule also stands in `census/index.html:85`, where `a.wordmark { border-bottom:none }` (l.92) cancels it, and in `palette/index.html:72` and `demonstrations/index.html:72`, which have no `.wordmark` element. All four are generated from the one builder string, so they follow it.

### 2.5 The typed name: the fallback, shown on no page today (12 rows)

| # | file | where | what the reader sees | today | channel today | channel under the scheme | new | confidence |
|---|---|---|---|---|---|---|---|---|
| T1 | `DOOR_CSS_BASE` → index.html:85 (census:85, palette:72, demonstrations:72) | `.wordmark { color:var(--shani-ink) }` | a name that does not split, typed whole | #a52035 | shani | scarlet, by the name's own rule (index.html:82: "any other name stands whole in shani") | unchanged | sure |
| T2 | `DOOR_CSS_BASE` → index.html:95 (census:95, palette:82, demonstrations:82) | `.wordmark .wm-fire { color:var(--shani) }` | typed «fire» | #a52035 | shani | scarlet | unchanged | sure |
| T3 | as T2 | `.wordmark .wm-and { color:var(--gold-dim) }` | typed «and» | #a06c10 (the orange gold) | gold | gold and bronze, which a typed letter cannot weave | Q1: `var(--mark-ink)`, = #a48829 | owner's call |
| T4 | as T2 | `@supports (… background-clip:text) { .wordmark .wm-tld { background-image:linear-gradient(90deg, var(--tekhelet) 0%, var(--argaman) 30%, var(--argaman) 100%) … } }` | typed «.com», its dot turning out of the blue | #23558a → #642460 | tekhelet into argaman | purple: no blue (the drawn dot is woven with .com now) | drop the `@supports` block; plain `var(--argaman)` | likely |
| T5 | as T2 | `.wordmark .wm-hail { color:var(--tekhelet) }` | typed «hail» | #23558a | tekhelet | blue | unchanged | sure |
| T6 | as T2 | `.wordmark .wm-tld { color:var(--argaman) }` | typed «.com» where background-clip is missing | #642460 | argaman | purple | unchanged | sure |
| T7 | zone.html:256 · engine-b23f95d61a8c.css:236 | `#home a.home .wm-fire { color:var(--shani) }` | typed «fire» on the home button (only on a page without the meta) | #a52035 | shani | scarlet | unchanged | sure |
| T8 | zone.html:256 · engine css:236 | `#home a.home .wm-and { color:var(--gold-dim) }` | typed «and» | #a06c10 | gold | as T3 | Q1: `var(--mark-ink)` (#a48829) | owner's call |
| T9 | zone.html:256 · engine css:236 | `@supports … #home a.home .wm-tld { background-image: … var(--tekhelet) 0% … }` | typed «.com», its dot out of the blue | #23558a → #642460 | tekhelet into argaman | purple | as T4 | likely |
| T10 | zone.html:256 · engine css:236 | `#home a.home .wm-hail { color:var(--tekhelet) }` | typed «hail» | #23558a | tekhelet | blue | unchanged | sure |
| T11 | zone.html:256 · engine css:236 | `#home a.home .wm-tld { color:var(--argaman) }` | typed «.com» | #642460 | argaman | purple | unchanged | sure |
| T12 | zone.html:248 · engine css:228 | `#home a.home { color: var(--shani-ink) }` | the home button's typed name standing whole (the bare reader prints «The Tabernacle») | #a52035 | shani | scarlet, as T1 | unchanged (reader-page row 7 agrees) | sure |

### 2.6 The name as plain text (2 rows)

| # | file | where | what the reader sees | today | channel today | channel under the scheme | new | confidence |
|---|---|---|---|---|---|---|---|---|
| P1 | targum-1kings/index.html:21, :26, from `build-front-door-v1.mjs:3112` (`heldPage`, `a{color:${SMALL_PAGE.gold}}`; `SMALL_PAGE` l.262) | `<a href="/">fireandhail.com</a>` | the name as the held page's one link | #a06c10 | gold used as ink | not gold: gold is the signs alone | the other-pages part's S4 and its Q2: links move to the purple dim #753c6d, as on `404.html` | owner's call (the other-pages part's Q2) |
| P2 | palette/index.html:1156, demonstrations/index.html:1156 | `.poc-back a` | the name as a plain link back | the page's own link color | our voice | our voice | no edit for the name | sure |

### 2.7 Words that name the name's colors (7 rows; they paint nothing)

| # | file and where | says today | proposed |
|---|---|---|---|
| R1 | `reader/data/color-contract-v1.json`, `what_changed_after_v2_was_written` | "Gold is two: the dim at rest on every frame, chip and line, on the Masoretic marks and on the and of the name" … "The woven name is dyed in the same pairs." | Append, and leave the history as it stands: "On 2026-11-15 the owner wove the name of the tabernacle's dyes and metals (wip/2026-11-15/the-palette/THE-OWNERS-WORDS-2026-11-15.md, words 13 to 18): fire scarlet and hail blue, each woven with itself; and the real gold (edge #a48829, the Masoretic signs' gold; body #d3af37, the swatch's pale gold) crossed with the card's bronze (#7f6044; its light #9a7656); .com and its dot argaman crossed with the blobs' silver (#7c8187; its light #b4b8bd); no color handing off into and ("i kind of like none"); a plain weave, steep at 60 degrees, stepping 21 font units ("x steep tighter still looks cool"). The orange gold is gone from the name ("i still prefer the pale/real gold, not the orangey one"). Each thread's edge is a value the page paints; the metals' lights are the name's own." |
| R2 | `zone.html:38` | "The woven name is dyed in the same pairs (tools/build-wordmark-v1.py), and the door's stylesheet carries the same values." | "The woven name's dyes are these pairs, and its metals' edges are the page's gold, bronze and silver (tools/build-wordmark-v1.py, 2026-11-15); the door's stylesheet carries the same values." |
| R3 | `zone.html:251` and `:253` (`engine-b23f95d61a8c.css:231`, `:233`) | 251: "fire in shani, and in gold, … the .com in argaman, its dot still turning out of the blue (…)"; 253: "…prints the name in its four colors, each solid, only the dot of .com turning blue to purple." | 251: "and in the gold the woven and is edged in" and "the .com and its dot in argaman (the drawn dot has not turned out of the blue since 2026-11-15: it is woven with .com)"; 253: "…prints the name in its four colors, each solid." |
| R4 | `DOOR_CSS_BASE` (`build-front-door-v1.mjs:188`) → index.html:82 and :87 (census:82, :87; palette and demonstrations :69, :74) | 82: "…its dot still turning out of the blue … the and the dim gold every frame wears at rest, the very pairs the drawn mark is woven in"; 87: "its threads two to three pixels apart" | 82: the same clauses as R3, and "the and the gold its woven threads are edged in, the Masoretic signs' gold; the drawn mark is woven of the same values with bronze and silver"; 87: "its threads stepping 1.2 pixels (21 font units at 26rem)" |
| R5 | `build-front-door-v1.mjs:276–281` | "…the dot of .com turning blue to purple). … It stands on the door alone ("just our 1 logo on the homepage alone"); every other page prints the name as text." | "…a flame and a hailstone for the dots of its i's; since 2026-11-15 woven of the dyes and the metals, the dot of .com woven with it). … It stands large on the door alone ("just our 1 logo on the homepage alone"), and small wherever a page points home (2026-10-08)." |
| R6 | `reader/tools/check-color-channels-v1.mjs:412–413` | "and the site's name, whose .com is gold as a mark, not as ink" | "and the site's name, whose and is gold and bronze as a mark, not as ink" |
| R7 | `build-wordmark-v1.py` l.1–52 (the header) | the rule of 2026-10-03 and 2026-10-10 | the proposed header, section 3.4 (the proposed file's l.1–63) |

## 3. The builder change (patch-ready)

The whole change is `build-wordmark-v1.patch`. It touches the palette, the turn, the thread and `mark()`. Everything that reads the face is unchanged: the imports, the paths, `TEXT` and `PARTS`, the index lists, `KERN`, `TRACK`, `EXTRA`, `fmt`, the `TTFont` load, `layout`, `gpath`, `gl`, `FLAME`, `HEART`, `place`, `circle` and the flame and hailstone constants.

### 3.1 Constants: the owner's choices as data (replacing l.64–73, and `ANGLE` from l.86)

```python
SHANI = ('dye', '#a52035', '#be6367')       # --shani, --shani-dim
TEKHELET = ('dye', '#23558a', '#768ea2')    # --tekhelet, --tekhelet-dim
ARGAMAN = ('dye', '#642460', '#753c6d')     # --argaman, --argaman-dim
GOLD = ('metal', '#a48829', '#d3af37')      # the Masoretic signs' gold; the swatch's pale gold
BRONZE = ('metal', '#7f6044', '#9a7656')    # the card's bronze; its light
SILVER = ('metal', '#7c8187', '#b4b8bd')    # the blobs' silver; its light
WORDS = {'S': (SHANI, SHANI),           # fire, and the flame
         'G': (GOLD, GOLD),             # the flame's heart
         'B': (TEKHELET, TEKHELET),     # hail, and the hailstone
         'A': (GOLD, BRONZE),           # and
         'U': (ARGAMAN, SILVER)}        # .com, and its dot
WEAVE = 'x'         # 'x': warp and weft crossing; 'one': side by side, one way
ANGLE = 60          # the threads' slant from level; the X also takes 45, square
P = 21              # the weave's step in font units, thread to thread (42 until 15 November)
DOT_FILL = 'woven'  # the dot of .com: 'woven' with .com, or one color, solid
DEPTH = .26         # an over thread darkens toward its two ends: black at this opacity
CROSS = {60: 'matrix(0.5 -0.8660254 0.5 0.8660254 0 0)', 45: 'rotate(45)'}
```

A thread is `(kind, edge, light)`. A dye's cross-section is edge, edge .22, light .46, edge .78, edge: the live builder's shape for fire, hail and .com. A metal's is edge, light .22, light .78, edge: the shape of the drawings' metals. Every hex above is in the approved drawing. Each metal keeps one hue across its two values, as word 19's plan asks: gold 46°/46°, bronze 28°/28°, silver 213°/213°.

### 3.2 Functions

- **Removed:** `X0` and `turn_x()` (l.116–125), `thread()` (l.127–133), and the unwoven `mark(uid, False)` path.
- **`grad(id, thread, across)`:** one thread's cross-section, across x (a warp, running down the tile) or across y.
- **`shade(id, along)`:** the dark at an over thread's two ends; ids `xsv` and `xsh`, shared by every part.
- **`threads(id, warp, weft, weave, angle, p)`:** one part's pattern.
  - `'one'`: stripes under `rotate(angle)`. One rect of height `p` when warp is weft; otherwise warp and weft side by side in a `2p` tile, as `woven-metals.py` drew them.
  - `'x'`: a `2p` × `2p` tile under `CROSS[angle]`, warp over in cells (0,0) and (p,p), weft over in the other two, each cell followed by its shade, as `woven-x.py` drew it.
- **`mark(uid, weave=WEAVE, angle=ANGLE, p=P, dot=DOT_FILL)`** (was `mark(uid, woven, P=42)`).
  - The regions without turns: `[(FIRE,'S'), ([AND[0]],'A'), (AND[1:-1],'A'), ([AND[-1]],'A'), (HAIL,'B'), (TLD,'U')]`.
  - The defs: the shade pair (the X only), then one pattern per `WORDS` entry, in the order S, G, B, A, U.
  - The body: six region paths, the dot (`url(#p{uid}U)` or its one color), the flame, the heart, the hailstone and the glint. This is the order of the live mark and of the approved drawing.
  - It asserts `weave in ('one','x')`, and that the X's `angle` is in `CROSS`.
- **`__main__`:** writes the one file, `mark/<name>-woven-v1.svg`, and prints the weave with the size.

### 3.3 Why it is shaped so

- **The a and the d stay their own paths** ("the regions without turns"), so the output equals the approved drawing path for path. One «and» path would render the same: one pattern in user space, and the three glyphs do not overlap. But it would differ in bytes, and the proof would first have to join the drawing's three «and» paths.
- **`xsv` and `xsh` carry no `uid`**, as drawn. The mark is only ever an `<img>` (`index.html:1200`, `census/index.html:1200`, `zone.html:2661`), so its ids never meet another document's.
- **`CROSS` is data, not computed.**
  - Steep is `matrix(0.5 -0.8660254 0.5 0.8660254 0 0)`: the tile's columns run along today's thread slant and its rows mirror them. It is a shear, so the threads cross at 60°, not square.
  - Square is `rotate(45)`, as `woven-x.py` drew it. Computing it from the steep formula would give `matrix(0.7071068 -0.7071068 0.7071068 0.7071068 0 0)`: a different drawing, with warp and weft swapped in direction, and not the one the owner saw.
- **The file name stays `mark/fireandhail.com-woven-v1.svg`.** The door, the census and the 1,272 metas keep pointing at it, so no page changes for the mark alone. A browser may show the old drawing until its cache lets go.
- **The RULE id moves to v2.** Only the builder names it (searched).

### 3.4 The header's rule text (the proposed file, l.1–63)

```
# build-wordmark-v1 · the site's name drawn as its mark, from the face's own outlines
#
# RULE: wordmark-rule-v2-the-name-is-the-mark-woven-of-the-dyes-and-the-metals-with-a-flame-and-a-hailstone-for-its-dots
# LEDGER: -
# no frame letter. This reads the subset face beside the site (fonts/, SIL OFL
# 1.1) and the name the site answers under (CNAME), and writes one drawing of
# the name, mark/<name>-woven-v1.svg: the door's (the owner: "just our 1 logo
# on the homepage alone"), shown small wherever a page points home. Nothing in
# the reader's data is read or written. A name that is not fire, and, hail and
# a dot is not drawn: it stands as text, whole, as the pages already print it.
#
# The owner, 2026-10-03, choosing among six drawn concepts: "lets do this one
# with the 2 stylized i dots" (the woven one, with the flame and the hailstone
# of another). So each letter is filled with fine threads (Exodus 39:3, the
# threads cut from beaten gold), the dot of fire's i is a flame with a gold
# heart, and the dot of hail's i is a hailstone.
#
# WOVEN OF THE TABERNACLE'S DYES AND METALS (the owner, 15 November 2026; their
# words in order are in wip/2026-11-15/the-palette/THE-OWNERS-WORDS-2026-11-15.md,
# 13 to 18). Each choice is data below (the threads, WORDS, WEAVE, ANGLE, P,
# DOT_FILL), and so set the builder writes the drawing the owner chose,
# wip/2026-11-15/the-palette/pictures/woven-x60-21.svg (sha256 ddc83012...f4e7),
# byte for byte:
#
#   - fire and the flame in shani, hail and the hailstone in tekhelet, each
#     woven with itself, each dye lit along its middle by its dim, the pairs
#     the page paints
#   - "i still prefer the pale/real gold, not the orangey one": the gold is
#     the real gold, its body the swatch's pale gold and its edge the same
#     gold made darker, the gold of the Masoretic signs. The flame's heart is
#     that gold woven with itself; the orange gold (#93661a, #a06c10) is gone
#   - "i kind of like none": no color hands off into and. Until now fire's red
#     turned into its a and hail's blue out of its d ("maybe the and as less
#     aggressively red/blue trailing into it"); the a and the d are drawn like
#     the n
#   - "what if we did gold/bronze woven on and, and purple and silver woven on
#     .com": and is the gold crossed with bronze, the card's bronze; .com is
#     argaman crossed with silver, the silver of the blobs
#   - "2 but i'd probably weave it tighter": the dot of .com is woven with
#     .com (the second of two drawings; the first kept the dot solid bronze),
#     and the weave steps 21 font units from thread to thread, not 42
#   - "maybe weave it 4 ways" ... "like X pattern", then "x steep tighter still
#     looks cool": a plain weave, warp and weft crossing, each thread over one
#     and under the next, the over thread darkened toward its ends where it
#     dips under; steep, both ways at the slant the threads have run at since
#     2026-10-03, 60 degrees from level (the square crossing, at 45, was the
#     other drawing)
#
# What stands of 2026-10-10 ("my main point is uniform coloring between logo
# and site"): every thread's edge is a value the page paints, and the dyes'
# lights are the page's dims. What does not: "no shade is mixed" held the name
# to the page's pairs alone; the metals' lights (the pale gold #d3af37, the
# bronze's #9a7656, the silver's #b4b8bd) are the name's own, as the owner saw
# them drawn.
#
# At the door's 26rem a step of 21 is 1.2 pixels (1.1 on a 412-pixel phone);
# on the home button it falls under half a pixel, and each two-metal word
# reads as one shade (the owner's notes: and a deeper gold, .com a lighter
# purple). The steep crossing is not square: its threads meet at 60 degrees,
# so across its width a thread is 21 x sin 60 = 18.2 units.
#
# Run: python3 tools/build-wordmark-v1.py   (from reader/; needs fontTools, and
# brotli for the woff2)
```

### 3.5 What the patch does not change

The face, the layout, the outlines, the flame, the hailstone, the viewBox (−14 −845 7102 879), `width="710.2" height="87.9"`, `role="img"` and the title are all unchanged. The output grows from 10,521 to 12,366 bytes. No page budget exists for it: `check-page-fetches-v1.mjs` F1–F5 count fetches, not bytes.

### 3.6 How to prove it

1. **Here, without fontTools (done).** Run `python3 -I prove-woven-name.py <old> <pictures> build-wordmark-v1.proposed.py <out>`. The builder's drawing code runs as written. Only the face is stubbed: each region's outline, and the three positions the drawing reads (fire's i at 427, hail's i at 4427, the ink's end at 7064), come from the live mark. The result, in `prove-woven-name.out`:
   - control: the live builder redraws the live mark, 10,521 bytes, sha256 `a1b7c0d7…1a50`: equal, so the stub is faithful;
   - `mark('w')` (the settings as written) equals `woven-x60-21.svg`, 12,366 bytes, `ddc83012…f4e7`;
   - `mark('w', p=28)` equals `woven-x60-28.svg` (`923cd84c…1bca`);
   - `mark('w', angle=45)` equals `woven-x45-21.svg` (`47101950…ea6d`);
   - `mark('w', angle=45, p=28)` equals `woven-x45-28.svg` (`ca8c26ad…968d`).
2. **The one-way setting (rendered, since the bytes differ by design).** Run `render-compare.mjs` at 1664 × 206 px.
   - `mark('w', weave='one', p=42)` against `woven-gold-bronze-purple-silver-woven-dot.svg`: 0 of 342,784 pixels differ.
   - With `dot='#7f6044'` against `woven-gold-bronze-purple-silver.svg`: 0 differ.
   - The control (live mark against the chosen drawing) differs in 115,537 pixels, so the comparison does see a difference.
   - The bytes differ only in ids, in the defs' order (`woven-metals.py` put U before A), and in the heart's redundant `.46` stop.
3. **On landing, where fontTools and brotli are installed.** From `reader/`, run `python3 tools/build-wordmark-v1.py`. Then `sha256sum ../mark/fireandhail.com-woven-v1.svg` must print `ddc8301262911b7f07121b76fc8d2497259b30a51fcdc1e11fc86573c020f4e7`. The drawing lives on the notes branch `claude/awesome-hypatia-2pxz43` (commit 36ba663a8c), not on main, so the proof pins it by hash. Where fontTools is not installed, the mark can land as the approved drawing itself, which step 1 proves byte-identical to the builder's output. Running the builder later must leave `git diff --exit-code mark/` empty.

## 4. Questions for the owner

**Q1. The typed name's «and», and whether to keep the typed name at all.** If the drawn mark is ever missing, the door and the reader type the name in four colors (T3, T8). Today «and» is the orange gold #a06c10, which no longer belongs anywhere. A typed letter cannot weave gold with bronze. The choices:
- (a) The gold #a48829, the edge of the woven «and»'s gold thread and the Masoretic signs' gold: hue 46°, 2.57:1. A logotype has no contrast floor (WCAG 1.4.3 exempts it).
- (b) The bronze #7f6044 (4.31:1). It reads brown, not gold.
- (c) One mixed shade: the drawing's own mean over «and» is #a2823e (hue 41°, 2.7:1, measured); the mean of the two edges is #927437 (hue 40°, 3.30:1).
- (d) Delete the typed name. It shows on no page of the live site.

**Recommendation: (a), written `var(--mark-ink)` in both stylesheets, with «.com» plain argaman (T4, T9).** `--mark-ink` resolves to #a48829 under both sibling plans, so one name serves both files. It keeps «and» gold, as it has been since 2026-10-03 ("maybe and should be gold"), on a value the page paints. A mixed shade is a color the site paints nowhere, against 2026-10-10's "no shade is mixed". Its hue also sits between the gold's 46° and the bronze's 28°, which word 19's plan keeps apart.

The sibling parts differ here: other-pages (D34, Q3) recommends #a48829; reader-page (rows 9 and 12, Q9) offers #927437, `--bronze-dim`, or deleting the typed name. The owner's answer should go to both.

No other use in this part falls outside the scheme. Two further owner questions touch the name but belong to the siblings:
- the held page's link (P1): the other-pages part's Q2;
- the hover shade of the home button's outline (F4): the reader-page part's Q1 and Q2.

## 5. What will go red in the checks, and why

- **Nothing goes red because of the mark, and nothing guards it.**
  - No check opens `mark/fireandhail.com-woven-v1.svg`.
  - `check-color-channels-v1.mjs:414` excuses `.wordmark` and `#home a.home` from its no-gold-ink test, and reads computed text colors, never image pixels.
  - `check-clean-address-v1.mjs:91` and `check-page-fetches-v1.mjs:29` only serve `.svg` as `image/svg+xml`.
  - Neither `chapter-pages-receipt-v1.json` nor `front-door-counts-receipt-v1.json` hashes the mark or the door.

  So a wrong redraw would pass the whole suite. **Recommend a standing check, `check-woven-name-v1.mjs` (RUN: tree):**
  - the mark's sha256 equals the drawing the owner chose, held in a small record with the settings and the owner's words;
  - every color in the mark is one of the 12 thread values or #000, and neither #93661a nor #a06c10 appears;
  - «and»'s three paths fill with the gold × bronze pattern, and «.com» and its dot with the purple × silver one;
  - the door's image, the census's image and all 1,272 `site-mark` metas name a file that exists.
- **`check-color-channels-v1.mjs` stays green.** With T3 and T8 at #a48829 (gold by the check's own test: hue 46°, saturation 60%, lightness 40%), the excuse at l.414 is still needed and still holds. The typed name renders on no page the check opens: the bare reader types «The Tabernacle», and built pages show the image. Only its comment (R6) is wrong.
- **The engine's hash changes, and the built pages must follow.** Editing T7–T12 or F2–F4 in `zone.html` changes `engine-b23f95d61a8c.css`, which is byte for byte the page's `<style>`, and with it the hash in its name. The 1,272 pages follow when the door builder re-extracts it. Until then, a check that holds the served engine to `zone.html` is red. The reader-page part covers this.
- **The builder cannot run here.** `python3 tools/build-wordmark-v1.py` fails at its import (l.54) without fontTools and brotli. No round runs it (`reader/build.sh` does not name it), so this is not a red check, but the mark must be built, or landed as the proven drawing (section 3.6, step 3).

## 6. Anything surprising

1. **Stale words about the name** (table R).
   - The builder says the flat mark goes unwritten "since the mark stands on the door alone and every other page prints the name as text" (l.26–28). The door builder says the same (l.280–281). Since 2026-10-08 the mark has also stood small on the census and on 1,272 home buttons.
   - The channels check says the name's «.com» is gold (l.413); it was «and».
2. **The siblings clash on a token name.** The door's at-rest bronze is `--bronze` (other-pages D5–D7). The reader's at-rest bronze is `--bronze-dim`, and its `--bronze` is the hand's (reader-page §1). The name's frame reads both: F1 on the door, F2–F4 on the reader. One name meaning two values in two files breaks the house rule. Recommendation: reader-page's pair in both files (`--bronze-dim` at rest, `--bronze` under the hand). The door's 29 `var(--gold)` uses are the hand's by other-pages' own row D4, so the door needs both names too.
3. **Each two-metal word averages to a shade the site paints nowhere.** «and» averages to #a2823e (hue 41°, saturation 45%, 2.7:1) and «.com» to #7f6481 (a grayer purple, 3.9:1). These are measured over each part's wholly inked pixels at 1664 px (`render-compare.mjs`). This is what the owner approved on the door pictures, and the home button shows it holding at 15.6 px (`home-button-x60-21.png`).
4. **The logo needs no page token.** The reader-page part offers an optional `--gold-pale` for the name. Nothing on a page paints #d3af37, #9a7656 or #b4b8bd; the mark is an image, and the builder holds its own values.
5. **The steep X is a shear, not a rotation.** Its threads cross at 60°, so a thread is 18.2 units across while the step is 21. Measured across, the owner's "tighter" weave is a little finer than 21.
6. **The approved drawings were made by text surgery on SVGs, not by the builder.** No script in `wip/2026-11-15/the-palette/tools/` writes the first links of the chain (`woven-final-candidate.svg`, nor the pale and three-metal drawings before it). The proof does not depend on that chain: the builder's output is compared with the final drawing directly. Since the builder, fed the live mark's outlines, reproduces the drawing byte for byte, the drawing's outlines are the live builder's own.
7. **Neither the door nor the brief's picture is on main.** `wip/` exists only on the notes branch, so the proof pins the drawing by sha256 rather than by path.
8. **The site has no icon.** There is no favicon, web manifest or social image, so the woven name appears in no tab, bookmark or link preview, and a browser asking for `/favicon.ico` gets the 404 page. This is not a palette question. If the owner wants one, the flame with its gold heart is already a square shape in the mark.
