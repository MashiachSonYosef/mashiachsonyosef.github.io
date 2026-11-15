# The checks and the records, under the metals of 15 November

Part «checks-and-records» of the read-only palette survey. Checkout surveyed: `scratchpad/old` (main `ace7f07eba`), read only; nothing under `old/` or `pt/` was written. Every path below is relative to `old/` unless it starts with `scratchpad/` (short for `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/`).

The scheme read from the owner's words (`/home/user/mashiachsonyosef.github.io/wip/2026-11-15/the-palette/THE-OWNERS-WORDS-2026-11-15.md`, words 10 to 19) and the approved mockup S2 (`scratchpad/v56/metals/scheme2.mjs`, lines 27–34): linen ground, no dark face; scarlet, blue and purple as today; gold only the Masoretic marks (#a48829); bronze the card, its outline, its pointer lines and the apparatus boxes (#7f6044); silver our layering, the blobs and the compspan frames (#7c8187).

How it was measured. A small server (`scratchpad/v57/checks-and-records/work/serve-s2.mjs`) served `old/` as it is (port 8931) and with S2's style appended to `zone.html`'s head, copied verbatim from `scheme2.mjs` (port 8932; port 8934 the same with the silver one step darker, #7a7f86). The checks were run from `old/reader` against those ports, unedited; copies with the proposed record and the proposed revision ran from `scratchpad/v57/checks-and-records/work/sim*/`. Logs are in `scratchpad/v57/checks-and-records/work/`. No screenshot was saved.

Confidence: **sure** (read in the code or measured), **likely** (follows from the scheme, not run end to end), **owner's call** (the scheme does not settle it; see the questions).

## 1. The table: one row per color use

Channel names are the record's (`text_as_written` tola'at shani, `reading_as_shown` tekhelet, `our_own_voice` argaman, `structure`, `reader_selection`) plus the two the proposed record adds (`masoretic_marks` gold, `our_layering` silver). For a check, «what the reader sees» is the element the law reads.

### A. The records

| # | file | where | what the reader sees there | today | channel today | channel under the scheme | new value or token | confidence |
|---|---|---|---|---|---|---|---|---|
| A1 | reader/data/color-contract-v1.json | :14 `channels.rule` | printed at the head of /palette/ (build-front-door-v1.mjs:2994) | «… and gold is only ever the frame around one of them» | gold = the frame | gold = the marks; bronze = the frame; silver = our layering | the proposed sentence (section 4) | sure |
| A2 | reader/data/color-contract-v1.json | :15–24 `text_as_written` | the Hebrew letters | tola'at shani; dim_as names the maqaf «a mark and gold» where marks are gold | text_as_written | text_as_written | unchanged, verbatim | sure |
| A3 | reader/data/color-contract-v1.json | :32 `reading_as_shown.reads_as` | printed on /palette/: «a quiet blue, inside a gold hairline so it stays a label» | a gold hairline that has not been drawn since 2026-09-11 (zone.html:422 sets the reading's border transparent) | reading_as_shown | reading_as_shown | «the ink the reading is written in, a quiet blue, with nothing around it» | sure |
| A4 | reader/data/color-contract-v1.json | :37–45 `our_own_voice` | all of this project's prose | argaman | our_own_voice | our_own_voice | unchanged, verbatim | sure |
| A5 | reader/data/color-contract-v1.json | :46–53 `structure` (material, in_process, reads_as) | verse labels, the card's frame, rules, borders, boxes | material «gold» | structure (gold) | structure (bronze) | material «bronze», with `moved_from`, `in_exodus` and `held_apart_from_gold_by` | sure |
| A6 | reader/data/color-contract-v1.json | :54–66 `reader_selection` (in_process, held_apart_from_structure_by, reads_as, held_word, pressed_cell) | a pressed control's edge; the box around a held word; the two lines to the card | «the regular gold at their edge … at rest every edge is the dim gold»; «inside a gold box»; «two gold lines» | reader_selection (argaman ink), its edges structure (gold) | reader_selection (argaman ink), its edges structure (bronze) | the same sentences with bronze; whether bronze keeps two shades is Q2 | sure (bronze); owner's call (shades) |
| A7 | reader/data/color-contract-v1.json | new `channels.masoretic_marks` | the vowel points and accents on the line and at a card's head | not a channel; gold by class (masoretic-marks-rule-v1), excused in check-color-channels-v1.mjs:415–421 | (excused exception) | masoretic_marks (gold) | material «gold», final, borne_as «ink»; value #a48829 | sure |
| A8 | reader/data/color-contract-v1.json | new `channels.our_layering` | the line around a blob and the frame around joined words | not a channel; drawn in --gold-dim (zone.html:11386) | structure (gold) | our_layering (silver) | material «silver», borne_as «line»; value #7c8187, or #7a7f86 for 3:1 (Q1) | sure (channel); owner's call (value) |
| A9 | reader/data/color-contract-v1.json | :9 `who_decided_what.the_ledger` | printed on /palette/ | «tekhelet, argaman, tola'at shani, shesh — and gold beside them» | n/a | n/a | names gold, silver and bronze (25:3); keeps «never once says what any of them looked like» | sure |
| A10 | reader/data/color-contract-v1.json | :10 `who_decided_what.the_owner` | printed on /palette/ | «Gold is not a final color … huds, boxes, the frame» | n/a | n/a | the ruling of 2026-11-15, in the owner's quoted words | sure |
| A11 | reader/data/color-contract-v1.json | :11 `who_decided_what.this_page` | printed on /palette/ (rd-hide) | «a hex is a tradition» | n/a | n/a | kept verbatim | sure |
| A12 | reader/data/color-contract-v1.json | :68–80 `faces` | the linen ground, one face | one face, linen | ground | ground | unchanged; adds a note that the bronze night face was set aside (word 10) | sure |
| A13 | reader/data/color-contract-v1.json | :82 `what_changed_after_v2_was_written` | not printed | history, including «Gold is two: the dim at rest on every frame…» | history | history | kept verbatim; `what_changed_on_2026_11_15` added beside it | sure |
| A14 | reader/data/color-contract-v1.json | new `the_woven_name` | the logo | not recorded | n/a | fire scarlet, hail blue, «and» gold crossed with bronze, «.com» and its dot purple crossed with silver | the X weave at ±60°, 21 units (word 18) | likely (Q5) |
| A15 | reader/data/masoretic-marks-v1.json | `gold.places`, `gold.mark_words`, `ruled` (written by tools/project-masoretic-marks-v1.mjs:130–153) | which code points the page paints as marks | key «gold» | masoretic_marks | masoretic_marks | unchanged (gold keeps the marks) | sure |
| A16 | reader/data/y-genesis-navigation-v1.js | `color_contract.structure` = «gold» (fixture, 2026-07-18) | nothing on the page; check-color-channels-v1.mjs:68–80 compares to it | gold | structure | structure, retired from the fixture | not edited; the new record's `structure.moved_from` states it retired | sure |
| A17 | reader/PIPELINE-MANIFEST.md | :29, :30, :91 (rule rows) | not shown | color-channel-rule-v2 guarded by two checks; colour-role-rule-v1 guarded by check-color-channels-v1 | n/a | n/a | re-emitted by the round's door step (round-v1.sh:173) | sure |

### B. tools/check-color-channels-v1.mjs (RUN: page)

| # | file | where | what the reader sees there | today | channel today | channel under the scheme | new value or token | confidence |
|---|---|---|---|---|---|---|---|---|
| B1 | reader/tools/check-color-channels-v1.mjs | :3 `GUARDS:` | nothing; the manifest credits the guard by this id | color-channel-rule-v2-… | n/a | n/a | color-channel-rule-v3-… (same tail) | likely (D-1) |
| B2 | same | :8–12, :31–33 header | nothing | «Gold is the frame around any of them»; Exodus names four dyes | n/a | n/a | the metals' sentence; Exodus names the three metals too | sure |
| B3 | same | :61 law «the record names what it supersedes» | the record | requires `supersedes` to contain «colour-role-rule-v1» | n/a | n/a | requires «color-channel-rule-v2» | sure (measured red) |
| B4 | same | :64–65 law «the channel that moved off its v1 value says where it moved from» | the record | reader_selection.moved_from | reader_selection | reader_selection | kept; add the same law for structure.moved_from naming gold | likely |
| B5 | same | :66–85 law «the fixture's structure role is carried forward unchanged» | the fixture against the record | gold = gold | structure | structure | equal, or stated as retired with moved_from naming the fixture's value | sure (measured red) |
| B6 | same | :92 `FAMILY.gold` hue [35, 60] | any element judged «gold» | admits #a06c10 and #93661a (hue 38) | structure | masoretic_marks | hue [42, 52]: admits #a48829 and #d3af37 (46), refuses the orange | likely |
| B7 | same | `FAMILY` (new entry) | the frame | none («no measurement declared for "bronze"») | n/a | structure | bronze: hue [22, 34], sat 0.15–0.40, light 0.25–0.55 (#7f6044 is 28°, 0.30, 0.38) | sure (needed); likely (box) |
| B8 | same | `FAMILY` (new entry) | the layering lines | none | n/a | our_layering | silver: hue [180, 260], sat ≤ 0.12, light 0.35–0.80 (#7c8187 is 213°, 0.04, 0.51) | sure (needed); likely (box) |
| B9 | same | :192 `SAMPLE.structure` = `.vnum` borderColor | the verse number's box (zone.html:838 `border: 1px solid var(--gold-dim)`) | rgb(160, 108, 16) | structure (gold) | structure (bronze) | rgb(127, 96, 68) passes the bronze box (measured on S2) | sure |
| B10 | same | `SAMPLE` (new) `masoretic_marks` = `.he-text .mg, .mg-all` webkitTextFillColor | the marks on the line | --mark-ink = var(--gold-dim) (zone.html:164) | excused | masoretic_marks | rgb(164, 136, 41) on S2; absent, «not judged», where data-mark-ink is not «gold» | sure |
| B11 | same | `SAMPLE` (new) `our_layering` = `svg.wj-tie path.wj-line` stroke | the blob's line and the compspan frame | var(--gold-dim) (zone.html:11386, window.__tie default) | structure (gold) | our_layering (silver) | rgb(124, 129, 135) on S2, after waiting for `window.__tiePending` to reach 0 | sure |
| B12 | same | :193 `SAMPLE.reader_selection` = `.mode-btn.on, .blob-btn.on` color | a pressed control's letters (zone.html:1490 `color: var(--sel)`) | argaman | reader_selection | reader_selection | unchanged | sure |
| B13 | same | :195 `FINAL` (three keys typed) | the who-is-speaking law | text, reading, voice | n/a | n/a | read from the record's `final` flags; the marks join (gold vs scarlet 56°, vs blue 165°, vs purple 98°, measured) | likely |
| B14 | same | :333–347 floors: voice 4.5, selection 4.5, structure 3 | contrast on the linen | structure 3.4:1 (#a06c10) | structure | structure | bronze 4.3:1 passes (measured) | sure |
| B15 | same | same block (new floors) | the layering line and the marks | none | n/a | our_layering, masoretic_marks | layering ≥ 3:1 (#7c8187 measures 2.95, red; #7a7f86 3.03); marks ≥ 2.5:1 (#a48829 2.57) | owner's call (Q1); likely (marks) |
| B16 | same | :371–400 «no gold is laid down as a ground» | every element's background | golden filter h 30–62, s ≥ 0.45, l 0.20–0.80 | gold as thread (39:3) | masoretic_marks as thread | kept; add «nor bronze nor silver» (fittings; the linen is the only ground) | likely |
| B17 | same | :402–438 «no glyph is left gold at rest» and :414 excuse `.rail .now` | text at rest | `.rail .now` is excused, but it has been purple since (zone.html:1330–1333 use --ink, --sel, --muted) | structure | masoretic_marks | drop the stale excuse; rename «no glyph but a Masoretic mark is gold»; extend to borders, outlines and SVG strokes | sure (excuse); likely (extension) |
| B18 | same | :414 excuse `#home a.home, .wordmark` | the name printed as text; «and» is `var(--gold-dim)` (zone.html:256) | excused gold | structure (gold) | the woven name's «and» (gold and bronze) | stays excused if «and» stays gold as text (Q4) | owner's call |
| B19 | same | :513–515 «and is boxed in gold, the whole block» | the held word's outline (zone.html:974 and :976 `outline: 1.5px solid var(--gold)`) | rgb(147, 102, 26) | reader_selection edge (gold) | reader_selection edge (bronze) | judged by the structure channel's material; on S2 rgb(127, 96, 68) | sure (measured red) |
| B20 | same | (new law) the card's outline and its two pointer lines | `#hud` border (zone.html:1508 `var(--sel-dim)`), `#tether .line` (zone.html:1692 `var(--gold)`) | purple dim; gold | none read (the purple outline went unseen) | structure (bronze) | both in the frame's material (on S2: rgb(127, 96, 68) both) | likely |
| B21 | same | :517–518 law name «the amber the page keeps for its own controls» | the pressed control's color | purple since 2026-10-03 | reader_selection | reader_selection | rename «the purple the page keeps for its own controls» | sure |
| B22 | same | :545 `INKS` (eight tokens incl. --gold, --gold-dim) and :582 law «every glyph is one of the eight inks» | every glyph, a card open | the marks pass as --gold-dim | dyes + gold | dyes + masoretic_marks | six dye inks and --mark-ink; the card's address `#hud .head .wn` (zone.html:1768, `var(--gold)`) is then a stray until Q3 is ruled | sure (measured red); owner's call (.wn) |
| B23 | same | :569–576 blob fills | the blob's ground | the pressed linen (--press-wash #dccbaa) | ground | ground | unchanged; the line is silver, the fill stays linen | sure |

### C. The other checks that read, assert or name a color (the runner runs all 177 `check-*.mjs` by their `RUN:` line)

| # | file | where | what the reader sees there | today | channel today | channel under the scheme | new value or token | confidence |
|---|---|---|---|---|---|---|---|---|
| C1 | reader/tools/check-card-numbering-v1.mjs (page) | :262–264 N12 `INKS` kind «gold» = --gold-dim, --gold | pixels near each card number | numbers drawn in `var(--gold)` (zone.html:1997); marks in --gold-dim | structure + marks as «gold» | numbers (Q3), marks gold, frames silver | kind «metal»: --mark-ink, the bronze token, the silver token | likely |
| C2 | same | :281 a number's pixel = changed and classified gold | the number's own ink | by hue | n/a | n/a | by «changed between the two photographs» alone, whatever metal the number wears | likely |
| C3 | same | :311 law name «no number touches other gold (a frame's line, a point)» | the cards' numbers | gold | n/a | n/a | «no number touches a mark, a frame's line or a letter» | sure |
| C4 | reader/tools/check-masoretic-gold-v1.mjs (tree) | :90–92, :142, :146, :177–178, :198, :202 (`--mark-ink` probes); :121, :133 `data-mark-ink === "gold"` | the marks on the line and the card's head | --mark-ink = --gold-dim | masoretic marks | masoretic_marks | unchanged; keep the token name --mark-ink (6 lines here) | sure (green on S2, 7 laws) |
| C5 | reader/tools/check-hebrew-is-red-v1.mjs (tree) | :95 `RED = var(--shani)`, `MARK = var(--mark-ink)`; :149, :185, :220 | every Hebrew letter; the marks' layer | --shani, --mark-ink | text_as_written; marks | same | unchanged; keep --mark-ink | likely (not run: it serves files from disk) |
| C6 | reader/tools/check-card-channels-v1.mjs (page) | :44–45 `RED`, `BLUE` | a card's letters and readings | --shani, --tekhelet | text, reading | same | unchanged | sure |
| C7 | reader/tools/check-word-senses-v1.mjs (tree) | :103, :359 `var(--argaman)` | word-sense pills, the legend | --argaman | our_own_voice | same | unchanged | sure |
| C8 | reader/tools/check-catalog-case-v1.mjs (site) | :108–123 `var(--tekhelet-ink)` | a work's name is not the claim blue | --tekhelet-ink | reading_as_shown | same | unchanged | sure |
| C9 | reader/tools/check-contents-shut-v1.mjs (page) | :209–224 `#tocHead` color against `--faint` | the contents button | purple, not the dim | our_own_voice | same (its box bronze) | unchanged; keep the name --faint | sure |
| C10 | reader/tools/check-gloss-whole-v1.mjs (page) | :200, :204 outline style only; :211 law name «boxed in gold»; :166–189 comments | the held block and the tether | gold | reader_selection edge | bronze | rename the law; the test stays (hue-blind) | sure |
| C11 | reader/tools/check-hoh-in-card-v1.mjs (page) | :79 law name «a quoted line stands in a gold box»; :7 comment | Ben-Yehuda's quoted line | gold box | structure | structure (bronze) | rename the law | likely |
| C12 | reader/tools/check-page-agrees-with-its-record-v1.mjs (site) | :41 rule id; :120–126 L1 (each channel's material and reads_as, the two rules); :136–144 L2 retired phrases | /palette/ | v2 | n/a | n/a | v3 id; add retired phrases «in the dim gold», «gold is only ever the frame», «inside a gold hairline», «inside a gold box» | sure (L1); likely (L2) |
| C13 | reader/tools/check-ruled-mark-v1.mjs (page) | :109–111 paint with and without `.chosen` | a ruled word | equality | n/a | n/a | unchanged (hue-blind) | sure |
| C14 | reader/tools/check-no-line-under-hebrew-v1.mjs (page) | :60–64 any visible line under Hebrew | the line | any color | n/a | n/a | unchanged | sure |
| C15 | reader/tools/check-hud-runs-v1.mjs (tree) | :67–68 any visible underline | a run's ink row | any color | n/a | n/a | unchanged | sure |
| C16 | reader/tools/check-commentary-in-line-v1.mjs (page) | :223–228 the mark is painted (non-transparent) | a commentary mark | any color | n/a | n/a | unchanged | sure |
| C17 | reader/tools/check-masorah-toggle-v1.mjs (page) | :115–116 head ink equals word ink | a card's head | --shani | text_as_written | same | unchanged | sure |
| C18 | reader/tools/check-kq-lead-follows-switch-v1.mjs (page) | :113, :173, :222, :277, :300 inline `style.color` present | a ketiv/qere half | presence only | n/a | n/a | unchanged | sure |
| C19 | reader/tools/check-kq-presentation-v1.mjs (tree) | :136 `color !== ""` | a segment | presence only | n/a | n/a | unchanged | sure |
| C20 | reader/tools/check-maqaf-lattice-v1.mjs (tree) | :348 inline color names «faint» | a lit segment | token name | n/a | n/a | unchanged; keep --faint | sure |
| C21 | reader/tools/check-blob-precision-v1.mjs (tree) | :43–46 its own #fff and #000 | ink inside a blob | its own colors | n/a | n/a | unchanged | sure |
| C22 | reader/tools/check-same-product-v1.mjs (given; the gate) | :54–71 lines' text and chips, pills' text and pressed state | chapter pages, first cards | no color read | n/a | n/a | unchanged; blind to the palette | sure |
| C23 | reader/tools/check-live-v1.mjs (live) | :28–60 manifest, lane state, a bin, the door, by hash | the public site | no color read | n/a | n/a | unchanged | sure |
| C24 | reader/tools/check-chapter-pages-v3.mjs (tree) | :44, :114, :179 R1 records of this tree | the plain lists under chapters | 40 records pin zone.html sha256 4049381a… | n/a | n/a | red until the round's lines step re-reads all 40 | sure |
| C25 | reader/tools/check-chain-book-v2.mjs (tree) | :35, :163–169 K3 files of this tree | the 12 chain books | each pins zone.html's sha256 | n/a | n/a | red until the round's chain step re-reads all 12 | sure |
| C26 | reader/tools/check-manifest-prints-unguarded-v1.mjs (tree) | L1 and on: committed manifest against a fresh one | PIPELINE-MANIFEST.md | rule rows 29, 30, 91 | n/a | n/a | red if a rule id moves and the manifest is not re-emitted | sure |

### D. The tools that print a color into pages

| # | file | where | what the reader sees there | today | channel today | channel under the scheme | new value or token | confidence |
|---|---|---|---|---|---|---|---|---|
| D1 | reader/tools/build-front-door-v1.mjs | :188 `DOOR_CSS_BASE` `:root` `--gold:#93661a; --gold-dim:#a06c10` (29 `var(--gold)` and 15 `var(--gold-dim)` in the block) | the door, /census/, /palette/, /demonstrations/ and their frames | orange gold | structure | structure (bronze) | the bronze token; the rules themselves are in the other-pages part's table | sure |
| D2 | same | :188 `--line:var(--gold-dim); --chip-line:var(--gold-dim)` (60 and 5 uses) | rules and chips on those pages | --gold-dim | structure | structure | the bronze token | sure |
| D3 | same | :188 `--sel-text:rgba(160, 108, 16, 0.2)`; the same literal at zone.html:151 | the tint behind text the reader selects | the orange gold at 20% | reader_selection | not named by the scheme | Q6 (recommended: the bronze at 20%) | owner's call |
| D4 | same | :188 (missing) `--mark-ink` and the silver token | the /palette/ swatches of the two new channels | not declared in the door's sheet | n/a | masoretic_marks, our_layering | declare both, or the swatch paints nothing (`background:var(undeclared)`) | sure |
| D5 | same | :262 `SMALL_PAGE.gold: "#a06c10"` | the small pages' rules (held and moved addresses, e.g. /1kings/, /targum-1kings/) | #a06c10 | structure | structure | #7f6044 | sure |
| D6 | same | :1597–1603 `CC_TOKEN` (structure `--gold-dim`) | the swatch beside each channel on /palette/ | --gold-dim | structure | structure | the bronze token; add `masoretic_marks: "--mark-ink"`, `our_layering:` the silver token (else the swatch falls back to `--ink`, :2997) | sure |
| D7 | same | :1604–1610 `CC_WEARS` (structure «… in the dim gold at rest») | the line under each channel on /palette/ | typed in the builder, not the record | structure | structure | the bronze sentence; add entries for the two new channels (else `carries` is printed) | sure |
| D8 | same | :282 `MARK_FILE`, :284 and :289 `width="710" height="88"` | the woven name on the door | mark/fireandhail.com-woven-v1.svg | the name | the name | re-run the door only if the mark's name or proportions change | likely |
| D9 | reader/tools/build-chain-book-v2.mjs | :105 `CHAIN_CSS` `--line:#a06c10` (5 `var(--line)` uses); :106–111 comment | the 13 chain pages' rules | #a06c10 | structure | structure | #7f6044 | sure |
| D10 | reader/tools/build-toggle-design-v1.mjs | :205 `--line:#a06c10` (3 uses); :211–213 comment; :165 the rail rows photographed into toggles/shots/row-*.png | /toggles/ | #a06c10, and pictures of today's rail | structure | structure | #7f6044; the photographs taken again from the new page | sure |
| D11 | reader/tools/build-wordmark-v1.py | :66 `G = '#93661a'; G_DIM = '#a06c10'`; :73 `THREAD`; :86 `ANGLE = 60`; :162 `P=42`; :19–46 header | the woven name (mark/fireandhail.com-woven-v1.svg: #93661a ×4, #a06c10 ×6) | the orange gold, a hand-off into «and», threads one way, 42 units | the name | the name | gold #a48829 and #d3af37 crossed with bronze #7f6044 and #9a7656 on «and»; purple and silver (#7c8187, #b4b8bd) on «.com» and its dot; X at ±60°, 21 units | sure (colors); likely (weave, Q5) |
| D12 | reader/tools/project-masoretic-marks-v1.mjs | :4, :46 rule id «…every-mark-is-gold…»; :130–153 `gold` | which code points the page paints | gold | masoretic marks | masoretic_marks | unchanged | sure |

### E. The documents

| # | file | where | what the reader sees there | today | channel today | channel under the scheme | new value or token | confidence |
|---|---|---|---|---|---|---|---|---|
| E1 | reader/tools/TOGGLE-PIPELINE-v1.md | :77 «*edition* marks Leningrad differences with a dotted gold rule» | describes zone.html:880 (`underline dotted var(--gold)`) | gold | structure | not named by the scheme | follows Q7 (recommended: silver) | owner's call |
| E2 | reader/tools/BEN-YEHUDA-PIPELINE-v1.md | :48 «a quote in a gold box» | describes the card's Ben-Yehuda panel | gold | structure | structure (bronze) | «a quote in a bronze box» | likely |

Rows: 17 (A) + 23 (B) + 26 (C) + 12 (D) + 2 (E) = 80.

## 2. tools/check-color-channels-v1.mjs, line by line

What it enforces today, and what must change. The measured runs come first, so each change can be read against them.

**Measured** (logs in `scratchpad/v57/checks-and-records/work/`):

| run | page | record | check | judged | red |
|---|---|---|---|---|---|
| ccc-plain.log | today | today's | today's | 36 laws | 0 |
| ccc-s2.log | S2 | today's | today's | 36 | 3: «structure is gold» (rgb(127, 96, 68), hue 28°), «and is boxed in gold» (rgb(127, 96, 68)), «every glyph is one of the eight inks» (`span.w.mg`, `span.mg`, `span.mg-all` at rgb(164, 136, 41)) |
| ccc-proposed-record-s2-page.log | S2 | proposed | today's | 38 | 7: supersedes; fixture structure (gold vs bronze); «masoretic marks is painted at all»; «structure is bronze: no measurement declared for "bronze"»; «our layering is painted at all»; boxed in gold; eight inks |
| ccc2-s2.log | S2 | proposed | proposed revision | 47 | 2: «our layering, as a line on the ground (>= 3:1) · 2.9:1»; «every glyph is one of the seven inks · span.wn rgb(127, 96, 68)» |
| ccc2-s2-silver3.log | S2, silver #7a7f86 | proposed | proposed revision | 47 | 1: `span.wn` |
| ccc2-today.log | today | proposed | proposed revision | 47 | 7: marks gold (hue 38°), structure bronze, layering silver, 1,891 gold borders (counted per side), outlines and strokes, held box, the card's outline (rgb(117, 60, 109)) and pointer lines, `span.wn` |

The proposed revision is `scratchpad/v57/checks-and-records/proposed/check-color-channels-v1.proposed.mjs`; its diff against today's is `proposed/check-color-channels-v1.diff` (238 lines), written by `proposed/check-color-channels-v1.patch.py` (exact replacements, each asserted to occur once).

**Line by line:**

- **1–3.** Shebang; `RUN: page` (the runner hands it a reader address, or with none it opens `http://127.0.0.1:8899/zone.html`, :197); `GUARDS:` color-channel-rule-v2. *Change:* the new rule id (B1). The manifest (pipeline-manifest-v1.mjs, the RULE regex) credits a guard by finding the id in the check's text.
- **5–35.** Header. :11–12 «Gold is the frame around any of them: at rest its dim, and its regular where the reader's hand is on it.» :31–33 Exodus names four dyes. *Change:* the metals' sentence and the three metals (B2). The v1-to-v2 history (:14–29) stays as history.
- **37–48.** Imports (zones-on-disk-v1.mjs is imported twice, :38 and :43; harmless); `RECORD` = data/color-contract-v1.json (:46); `check()` counts failures.
- **50–53.** No record: SKIPPED, exit 3. Unchanged.
- **57–86. The record names its lineage.** :61 `supersedes` must contain «colour-role-rule-v1» (*change:* «color-channel-rule-v2», B3). :62–63 `who_decided_what.the_owner` and `.the_ledger` exist (kept in the proposal). :64–65 `reader_selection.moved_from` is a string (kept). :68–80 the fixture y-genesis-navigation-v1.js `color_contract.structure` must equal `channels.structure.material` (*change:* equal, or stated as retired with `moved_from` naming it, B5; the same pattern :81–83 already uses for the fixture's dropped surfaces). Add: `structure.moved_from` names gold (B4).
- **88–111. `FAMILY`, the measurement boxes.** gold [35, 60]; tola'at shani [−15, 25]; tekhelet [185, 235]; argaman [250, 320]; purple, brown (grounds of the dropped dark face); linen. Every material a record channel names must have a box, or the law at :254 fails with «no measurement declared». *Change:* add bronze and silver (B7, B8), and narrow gold to the real gold's yellow so an orange gold cannot pass (B6; the owner, word 13: «i still prefer the pale/real gold, not the orangey one»; and the page lane's note under word 19, «any gold keeps hue 46°»). `inFamily` (:131–139) gains an optional `maxSat`.
- **113–177.** rgb, hsl, L\*, the wash test, Lab and ΔE, alpha, hue distance. Unchanged.
- **179–195. `SAMPLE` and `FINAL`.** The comment at :179–180 says a channel with no bearer «is said to be absent, never scored as a fault», but :247 scores it as a fault. *Change:* add `masoretic_marks` and `our_layering` samplers (B10, B11), and make the absence the comment promises real for these two: the marks where `data-mark-ink` is not «gold» (on tikkunei-zohar it is unset; check-masoretic-gold-v1 G4, measured in work/cmg-s2.log), the layering where no blob is drawn. `FINAL` read from the record's `final` flags (B13).
- **197–228.** Keeps only the address's base (:197, `.split("?")[0]`) and always opens `?b=<first work with a commentary>&c=open`, which is amos (21 works carry a commentary), at 412×915. It waits 2.6 s and for the face to settle, then prints the channels. So the work the runner hands it is ignored, and a `--panel` run (amos, zephaniah, tikkunei-zohar, obadiah) judges amos four times. *Change:* also wait for `window.__tiePending` to reach 0 before reading the blobs' lines (the same wait check-card-numbering-v1.mjs:130 uses). Whether to honor the handed work is a separate fix; if it is honored, the absence handling above is what keeps tikkunei-zohar from going red.
- **230–241.** Reads each sample's property, the body's ground and the commentary's ground and edges. Unchanged, plus `data-mark-ink` and whether any tie line exists.
- **243–255. Each channel wears its material's box.** Today: structure gold passes at rgb(160, 108, 16). Under S2 with today's record it fails (measured). Under the proposed record and revision: structure bronze, marks gold, layering silver all pass on S2 (measured).
- **256–265.** Base and commentary grounds are linen. Unchanged.
- **267–286. Who is speaking.** Every pair of final channels is ≥ 45° apart, or differs by ≥ 0.30 in saturation or lightness. With the marks final: gold against scarlet 56°, blue 165°, purple 98° (measured). Unchanged code.
- **288–348. Legibility.** Ink on the bare ground ≥ 4.5:1 (scarlet 5.5, blue 5.8); voice ≥ 4.5 (6.0); selection ≥ 4.5 (8.0); structure ≥ 3 (3.4 today, 4.3 bronze). *Change:* add our layering ≥ 3:1 (B15; the silver #7c8187 measures 2.95:1 and is red, Q1) and the marks ≥ 2.5:1 (#a48829 2.57:1; the pale #d3af37 is 1.58:1 and could not reach the line).
- **349–367.** A commentary stands on the text's linen and is set apart by its red rail. Unchanged.
- **371–400. «No gold is laid down as a ground»** (39:3: gold is thread). Unchanged; *add* the same for bronze and silver (B16). Measured: no bronze or silver ground on S2 or today.
- **402–438. «No glyph is left gold at rest.»** Skips anything held (:410), `.rail .now, #home a.home, .wordmark` (:414), and the marks by class (:421). *Change:* drop `.rail .now` (purple since; B17); rename the law; and add borders, outlines and SVG strokes, since under the scheme no line is gold. Measured: 0 gold lines on S2 (2,618 read), 1,891 today.
- **440–468.** Every token a rule asks for is declared or has a fallback. Unchanged. It guards the token rename: a rule left asking for a removed `--gold` turns this red.
- **471–491.** The second face is gone everywhere. Unchanged (the bronze night face stays dropped).
- **493–528. The held word.** :512 keeps its ink; :513–515 «boxed in gold» (*change:* in the structure channel's material, B19); :516–518 law name says «amber» (*rename*, B21); :523–524 the box goes; :525–527 settles at its own channel, «never gold». *Add:* the card's outline and its pointer lines are the frame's material (B20). Today's card outline is `var(--sel-dim)` (zone.html:1508), the purple the owner flagged in word 4, and no law read it.
- **530–594. Two of each color and three linens.** :545 the eight inks (four colors × regular and dim); :547 the three linens; :554–568 every glyph and every ground; :569–576 blob fills; :577–592 a pressed reading is the regular blue, bold. *Change:* the inks are the three dyes' six and the marks' `--mark-ink` (B22). The «2/2/2/2» of 2026-10-10 no longer describes the metals (Q2). The card's address `#hud .head .wn` (zone.html:1768) is gold ink today, allowed because --gold is one of the eight. Under the proposal it is a stray until Q3 is ruled.
- **596–598.** Exit 0 or 1.

## 3. The other tools and checks; the gate; the runner's list

**The runner's list.** `tools/run-all-checks.sh` calls `tools/run-checks-v1.mjs`, which since 10 November keeps no typed list. It reads every `tools/check-*.mjs` and its `// RUN:` line (:71, :131). Today that is 177 files: 98 tree, 69 page, 5 site, 1 live, 4 given (counted from the `RUN:` lines; `scratchpad/v57/checks-and-records/work/runkinds.txt`). A local run runs 172 (tree, page, site) against the servers it keeps on 8899 (the reader) and 8912 (the site). check-live-v1 runs only with `--live`. The 4 «given» checks are never run by the runner; check-same-product-v1 is one of them. A new or renamed check needs no edit to the runner.

**Code that reads a color property**, counted over the 177 (lines that are not comments): 17 files. check-color-channels-v1 17 lines, check-masoretic-gold-v1 12, check-hebrew-is-red-v1 11, check-card-numbering-v1 8, check-card-channels-v1 7, check-kq-lead-follows-switch-v1 5, check-word-senses-v1 4, check-catalog-case-v1 4, check-ruled-mark-v1 3, check-contents-shut-v1 3, check-no-line-under-hebrew-v1 2, check-masorah-toggle-v1 2, and one each in check-word-address-v1 (reads `--cn`, a number and not a color, so not a row), check-maqaf-lattice-v1, check-kq-presentation-v1, check-hud-runs-v1 and check-commentary-in-line-v1. Not counted there but in the table: check-gloss-whole-v1 and check-hoh-in-card-v1 (law names), check-page-agrees-with-its-record-v1 (reads the record), check-blob-precision-v1 (its own colors), check-chapter-pages-v3 and check-chain-book-v2 (the page's hash).

**Of those, which depend on the palette:**

- **check-card-numbering-v1** (page). Measured on exodus: today 12 laws ok (work/ccn-plain.log); S2 12 laws ok (work/ccn-s2.log). It stays green but goes partly blind. With `--gold` and `--gold-dim` both bronze, N12's classifier (:265–275) finds the marks at #a48829 to be no ink at full strength or at 70% (work/measure.mjs). The silver frame line it reads as a letter's ink. So «no overlap with other gold» stops seeing the marks. If instead `--gold` is narrowed to #a48829 and the numbers move to a bronze token, the numbers' own pixels classify as «none» or «ink», and N12 turns red or unreliable. *Change:* C1 to C3.
- **check-masoretic-gold-v1** (tree). Measured with S2 (work/cmg-s2.log): G1 to G5 ok, the marks at rgb(164, 136, 41). It reads `--mark-ink` by name on 6 lines, so the name must stay.
- **check-hebrew-is-red-v1** (tree). It probes `--shani` and `--mark-ink` by name and stays green while both names stay. It serves files from disk, so S2 could not be injected without editing a file. Not run.
- **check-page-agrees-with-its-record-v1** (site). Today 22 laws ok (work/cpa-today.log). With the proposed record against today's /palette/: 20 ok, 8 red (work/cpa-proposed-on-live-palette.log). Red are L1 «how it is borne» for reading_as_shown, masoretic_marks, structure, our_layering and reader_selection; the material for structure («bronze») and our_layering («silver»); and the channel rule. All 8 are what the door step prints from the record (build-front-door-v1.mjs:2994–3000), so they clear when the door is built after the record. They also need CC_TOKEN and CC_WEARS (D6, D7) so the swatches and the «wears» lines are right. L2 does not catch the builder's own typed «in the dim gold at rest» (CC_WEARS, :1608). Hence the four retired phrases in C12.
- **check-chapter-pages-v3** R1 and **check-chain-book-v2** K3 (tree). Not color reads. Any edit to zone.html moves its sha256 (today 4049381a…, pinned in all 40 records under reader/data/resting-lines/ and in all 12 chain/*/chain-v1.json.gz, checked for amos in both). Both checks go red until the round's lines and chain steps run.
- **check-manifest-prints-unguarded-v1** (tree). Red if zone.html, a tool or a check names a new rule id and PIPELINE-MANIFEST.md is not re-emitted (the round's door step re-emits it, round-v1.sh:173).
- **Unchanged and green under the scheme:** C6 to C9 and C13 to C21. They read the dyes' tokens, or presence and equality only.

**The gate, check-same-product-v1** (RUN: given). Run by hand with `--old http://127.0.0.1:8914 --new http://127.0.0.1:8912`. It compares S1, each sampled chapter page's line text and chip, and S2, the first three cards' pill text and the pressed one. It reads no color, so the palette is invisible to it. It stays green for the palette, and in the shared ship its diff carries only the default toggles' moves. The palette is proven by the color checks above, not by the gate.

**check-live-v1** (RUN: live, the workflow `.github/workflows/live-check.yml` on `page_build`). It compares the manifest, the lane state, a chapter page's pin and bin, and the door, byte for byte. No color. Green once Pages has published the merge.

## 4. The record: its structure, and the proposed record of 15 November

**Its structure today** (reader/data/color-contract-v1.json, 14,275 bytes): `schema_version` «COLOUR_CONTRACT_V2»; `rule_id`; `basis` «TYPED_IN_THE_OPEN»; `supersedes` (v1's id); `carried_from`; `decided_on` 2026-09-10; `who_decided_what` {`the_ledger`, `the_owner`, `this_page`}; `channels` {`rule`; five channels, each with `material`, `carries`, `final`, `borne_as`, `reads_as`, and as needed `how_it_is_carried`, `held_as`, `dim_as`, `pressed_as`, `in_process`, `held_word`, `pressed_cell`, `moved_from`, `held_apart_from_*`}; `faces` {`rule`, `day` {`base_surface`, `commentary_surface`, `commentary_set_apart_by`, `linens`}, `dropped_on`, `what_was_dropped`, `what_this_costs`, `note`}; `note`; `what_changed_after_v2_was_written`.

**Its readers:** check-color-channels-v1.mjs:46 (and :51), check-page-agrees-with-its-record-v1.mjs:53, build-front-door-v1.mjs:1589 (the /palette/ page), and comments at zone.html:1400 and :1421. The path is shared by three tools, so the proposal keeps the file name, as v2 did when it kept «-v1» in the name and set the schema to V2.

**The proposed record** is `scratchpad/v57/checks-and-records/proposed/color-contract-v1.proposed-2026-11-15.json` (21,857 bytes, valid JSON). Its diff against today's is `proposed/color-contract-v1.diff`. It is written in the record's own style and keeps «a hex is a tradition» (this_page, verbatim) and that Exodus never says what the materials looked like (the_ledger and each metal's `in_exodus`). What it changes:

- `schema_version` «COLOR_CONTRACT_V3» (American spelling in what we author; the superseded id `colour-role-rule-v1-…` keeps its spelling, because it is an identifier that must match zone.html:1787, :5419, PIPELINE-MANIFEST.md:30 and the record). `rule_id` color-channel-rule-v3-the-materials-are-the-ledgers-the-channels-are-the-owners-ruling-and-the-values-are-ours. `supersedes` the v2 id. `decided_on` 2026-11-15. `carried_from` names v2, v1 and the fixture.
- `who_decided_what.the_ledger`: «Exodus names the materials — gold, silver and bronze (25:3), tekhelet, argaman, tola'at shani and shesh — over and over, and says what each was made into, and never once says what any of them looked like.»
- `who_decided_what.the_owner`: the dyes ruled 2026-09-10, the metals 2026-11-15, each in the owner's words: «gold as masoretic signs switching back to that»; «if bronze held the tent maybe that's the hud color»; «maybe silver would be like outlining all the compspan boxes since that's kind of our layering?»; «obviously purple stays as the commentary layer».
- `channels.rule`: «A channel is not a decoration. It says who is speaking. The corpus speaks in tola'at shani, its reading speaks in tekhelet, this project speaks in argaman; the metals carry no voice of their own: gold is only ever a Masoretic mark, bronze is the frame that holds the page, and silver is the layer this project draws over the text.»
- `masoretic_marks` (new): material gold, final, borne_as ink; reads_as «the ink of the vowel points and the accents, and of nothing else: a real gold, never the orange one, over letters that keep the corpus's red». `in_exodus`: gold the first metal named (25:3); the ark, the mercy seat and its cherubim, the table and the lampstand (chapter 25); beaten into plates and cut into threads worked into the tekhelet, argaman, tola'at shani and shesh (39:3); «Thread, never a ground. Exodus never says what it looked like.»
- `structure`: material bronze; reads_as «line work only: the card's outline and its pointer lines, rules, borders and boxes, never ink at rest». `in_exodus`: the altar and its vessels (27:2–6; 38:2–7); the court's sockets (27:10, 17–18); the laver and its stand (30:18; 38:8); the altar's bronze grate, the court's pillars and sockets, the pegs and their cords (35:16–18); every peg of the tabernacle and the court (27:19; 38:20); the offering's bronze made into sockets, the altar and all the pegs (38:29–31); «What held the tent and its hangings in place. Exodus never says what it looked like.» `moved_from` gold, naming the fixture's retirement. `held_apart_from_gold_by` hue 28° at 30% against the marks' 46°, quoting «bronze is distinctly not orange, and silver is distinct too».
- `our_layering` (new): material silver, borne_as line; reads_as «line work only: the outline of a blob and the frame around joined words, never ink and never a ground; the blob's own ground is the pressed linen». `in_exodus`: the sockets under the boards (26:19–25); the hooks and bands of the court's pillars (27:10–11; 38:10–12, 17, 19); the census silver cast into the sockets and made into hooks, caps and bands (38:25–28); «Exodus never says what it looked like.» `why` quotes words 11.
- `reader_selection`: bronze in `in_process`, `held_apart_from_structure_by`, `reads_as` (now printed on /palette/ as «… inside a bronze box»), `held_word` and `pressed_cell`. The owner's quote «2. bolden the gold» is kept verbatim, with «gold when this was ruled, bronze since 2026-11-15». `moved_from` is unchanged, as :64–65 requires. The shade question (Q2) is stated in the record and not decided.
- `reading_as_shown.reads_as`: the dropped hairline (A3). `text_as_written` and `our_own_voice` are verbatim.
- `faces`: verbatim, plus `no_second_face_on_2026_11_15` («but then we wouldn't change the linen background or add a darkmode»). No face key with a `base_surface` was added, so check-page-agrees L2 («Two faces», «the tent is dark») still finds them unlicensed.
- `the_woven_name` (new): fire, and, hail, .com each with its threads; no hand-off into «and» («i kind of like none. …»); the dot woven with .com («2 but i'd probably weave it tighter»); the X at ±60°, 21 units («x steep tighter still looks cool»); no orange gold; drawn by tools/build-wordmark-v1.py.
- `note` and `what_changed_after_v2_was_written` are verbatim. `what_changed_on_2026_11_15` holds the values: #a48829 (hue 46°, 2.6:1), #7f6044 (28°, 30%, 4.3:1), #7c8187 (213°, 4%, 2.9:1), and the name's thread pairs. «No hex here is attested; each is a choice made on a screen and kept.»

Proven against the checks: with the proposed revision on S2, the record's laws (supersedes, the two moved_from, the fixture retired) pass (work/ccc2-s2.log). Against today's /palette/, 8 L1 laws are red until the door is rebuilt (section 3).

## 5. The round and the ship: which steps re-run after the palette change

tools/round-v1.sh runs `zones,stamps,search,records,lines,chain,door` (:57) and stops at the first failure.

| step | lines | re-run for the palette? | why |
|---|---|---|---|
| zones | 74–116 | no | Bakes, re-glosses and lattice-projects the zones; no zone carries a color |
| stamps | 118–121 | no | Counts |
| search | 123–129 | no | The word-senses record and the search index |
| records | 131–148 | no (yes only for the default toggles' own reasons) | The refusal gate's verdicts are keyed by each zone's sha256 and the lines (check-c0-refusals-v1.mjs:167–182), not by zone.html |
| lines | 150–156 | **yes, all 40** | Each record in reader/data/resting-lines/ names zone.html's sha256 in `read_off.files`. A palette edit to zone.html leaves every record «not of this tree» (resting-lines-v1.mjs:190–202). The door throws on such a record (build-front-door-v1.mjs:3182–3185, which also compares the record's zone.html hash to the page it builds from), and check-chapter-pages-v3 R1 goes red |
| chain | 158–166 | **yes, all 12** | Each chain/<book>/chain-v1.json.gz pins zone.html's sha256 the same way (amos checked: 4049381a…). The chain pages also carry CHAIN_CSS's `--line:#a06c10` (build-chain-book-v2.mjs:105). If CHAIN_CSS changes after zone.html is final, a kept book is not rewritten (:463), so run `node tools/build-chain-book-v2.mjs --all` |
| door | 168–175 | **yes** | Cuts zone.html's style block into a new `engine-<sha>.css` and deletes the old one (build-front-door-v1.mjs:2754–2788). That rewrites every page that links it: 1,272 index.html files link `engine-b23f95d61a8c.css` today, among them the 1,224 chapter pages of chapter-pages-receipt-v1.json. It also rewrites DOOR_CSS's pages (the door, /census/, /palette/ from the new record, /demonstrations/, 404.html), the SMALL_PAGE pages (/1kings/, /targum-1kings/ and the other held and moved addresses), lane state, ledger index and PIPELINE-MANIFEST.md, then copies deploy-root to the site |

Not in the round, run by hand:

- `node tools/build-toggle-design-v1.mjs` rewrites /toggles/: its own `--line` (:205) and the rail's rows photographed again from the new page (:165).
- `python3 tools/build-wordmark-v1.py` (needs fontTools) rewrites mark/fireandhail.com-woven-v1.svg. The door embeds it by name (:282), so the door needs re-running only if the file's name or its 710×88 proportions change.
- data/color-contract-v1.json is edited by hand; no tool emits it.

**Order** (each step's inputs must be final before it runs):

1. Write the page (zone.html), the record, the door's CSS, SMALL_PAGE, CC_TOKEN and CC_WEARS, CHAIN_CSS, the toggle page's CSS, the wordmark's constants, and the checks (section 2, C1 to C3, C10 to C12) and the two documents (E1, E2).
2. `python3 tools/build-wordmark-v1.py`.
3. The round once: `tools/round-v1.sh --stamp <date> --steps lines,chain,door`. Shipped with the default toggles, their plan's `--steps defaults,records,lines,chain,door` (wip/2026-11-14/the-default-toggles/plan/PLAN-MERGED.md:624) already holds all three. Any later edit to zone.html sends lines, chain and door round again.
4. `node tools/build-toggle-design-v1.mjs` (after the page is final, against the served reader).
5. `tools/run-all-checks.sh`: the 172 local checks. The color laws are in sections 2 and 3. If a check was edited after the round, re-emit the manifest (`node tools/pipeline-manifest-v1.mjs --stamp <date>`) or check-manifest-prints-unguarded-v1 is red.
6. The gate: check-same-product-v1 against 8914 (as deployed) and 8912 (the build). Text only, so it shows only the toggles' moves.
7. Ship (CLAUDE.md): commit on main; merge main into gh-pages with «gh-pages follows main»; push both; the live-check workflow (check-live-v1) on `page_build`.

## 6. Questions for the owner, each with a recommendation

- **Q1. Silver at 2.9:1.** The silver #7c8187 measures 2.95:1 on the linen, under the 3:1 a line must clear to be seen (the floor the frame is held to, check-color-channels-v1.mjs:342). It measures 2.46:1 on the pressed linen of the blob it outlines. *Recommendation:* #7a7f86, the first darker step at the same hue and saturation (3.03:1). It is ΔE 1.0 from #7c8187, under the 2.3 the check counts as noticeable, so the owner would not see it change. Reaching 3:1 against the pressed linen needs #6e7378 (ΔE 5.6, visibly darker), and is not recommended.
- **Q2. Does bronze keep two shades?** Since 2026-10-10 gold had a dim at rest and a regular under the hand («id probably go regular and dim»). The approved mockup S2 draws every frame, the held box and the pointer lines in one bronze #7f6044 and shows the hand by weight (the tether at 1.75, pressed edges doubled). The name's thread uses a second bronze, #9a7656, as its body. *Recommendation:* one bronze on the page, the hand shown by weight, as S2 shows; #9a7656 for the name's threads only. The «two of each» law then counts two of each dye and one of each metal.
- **Q3. The numbers.** Two places draw numbers in gold today. The card numbers on the line (zone.html:1997, `var(--gold)`, ink at rest when the numbers switch is on) and the word's address on the card's head (zone.html:1768, `var(--gold)`). Are they bronze, as the apparatus, or purple, as the site's own words? *Recommendation:* bronze, like the verse label they extend: the scheme as read back to the owner after word 11 puts «the boxes of the apparatus (verse labels, buttons)» in bronze, and the owner's rule for the numbers was «the key is no overlap with other gold» (2026-11-10). The record's structure then reads «line work, and the numbers the apparatus prints; never a word's ink», and `--bronze` joins the inks the check admits. Until this is ruled, the proposed check is red on `span.wn` (measured).
- **Q4. «and» printed as text.** On pages that print the name as text («and» is `var(--gold-dim)` at zone.html:256, and the door's `.wm-and`), a word has one ink, but the woven mark crosses gold with bronze. *Recommendation:* the real gold #a48829, the warp's color. At phone size the woven «and» reads as «a deeper gold» (the page lane's note under word 15), and the check's `.wordmark` and `#home a.home` excuse then stays as it is. This is shared with the other-pages part.
- **Q5. The weave.** The brief for this survey calls the weave «still the owner's open choice». The owner's words record it as chosen: word 18, «x steep tighter still looks cool», the X at ±60°, 21 units; and «Where the palette stands» says «woven both ways, steep, 21 units». *Recommendation:* record it as chosen, as the proposed record does, and say so to the owner when the plan is sent.
- **Q6. The selection tint** (`--sel-text`, zone.html:151 and DOOR_CSS_BASE): the orange gold at 20% behind text a reader selects. The scheme does not name it. *Recommendation:* the bronze at 20%, rgba(127, 96, 68, 0.2). It is the reader's hand, and under the scheme the hand's edges are bronze. Gold stays only on the marks.
- **Q7. The edition's dotted line** (zone.html:880, `underline dotted var(--gold)` under words that differ from Leningrad when the «edition» order is on; TOGGLE-PIPELINE-v1.md:77). *Recommendation:* silver. It is a layer this project draws over the text to say where two witnesses differ, like the blob's line; it is not a frame that holds the page.

## 7. Decisions for the plan (not the owner's)

- **D-1. The rule id.** color-channel-rule-v3 with v2's tail, which stays true. Write it at data/color-contract-v1.json:3, check-color-channels-v1.mjs:3, check-page-agrees-with-its-record-v1.mjs:41, and the short forms at zone.html:425 and build-front-door-v1.mjs:188. The manifest merges a short id into the long one it prefixes. If the revised check no longer names `colour-role-rule-v1` (today only :61 does), the manifest will print that id UNGUARDED for as long as zone.html:1787 and :5419 name it. Keep it named in the check's header history, or drop it from those comments.
- **D-2. Token names.** S2 keeps the names `--gold` and `--gold-dim` and values them bronze. That makes a name say gold where the page paints bronze, in 6 typed copies and 2 checks (check-card-numbering-v1.mjs:264, check-color-channels-v1.mjs:545). Recommended: a bronze token and a silver token of their own; `--gold` for the real gold; and keep `--mark-ink` (6 lines in check-masoretic-gold-v1, 1 in check-hebrew-is-red-v1) and `--faint` (check-contents-shut-v1, check-maqaf-lattice-v1) as names. Change a token's name and the checks that probe it in the same commit: a probe of an undeclared token silently reads the inherited color, and the orphan law reads only the page's rules, not a check's probes.
- **D-3. The channel keys.** `masoretic_marks` (matching masoretic-marks-rule-v1, data/masoretic-marks-v1.json, `--mark-ink`, check-masoretic-gold-v1; the owner says «signs», and the prose says «marks, the vowel points and the accents») and `our_layering`. Keep the five existing keys exactly; CC_TOKEN, CC_WEARS and SAMPLE use them.
- **D-4. A check that the palette's typed copies agree.** The hexes are typed in six hand-kept places: zone.html `:root`, build-front-door-v1.mjs:188 and :262, build-chain-book-v2.mjs:105, build-toggle-design-v1.mjs:205–206, and build-wordmark-v1.py:65–68. No check compares them. build-front-door-v1.mjs:259–261 records that such a copy was left on the palette of before 10 October. Recommended: a check reading each copy's values against zone.html's `:root` by token name.

## 8. What will go red in the checks, and why (measured unless marked)

1. **The page alone changes** (S2's tokens on zone.html; record and checks as today):
   - check-color-channels-v1, 3 red (work/ccc-s2.log): «structure is gold» (.vnum border rgb(127, 96, 68), hue 28°, outside gold's 35–60); «and is boxed in gold» (the held outline rgb(127, 96, 68)); «every glyph is one of the eight inks» (the marks' fill rgb(164, 136, 41) is no longer `--gold-dim`).
   - check-chapter-pages-v3 R1 and check-chain-book-v2 K3, until the round's lines and chain steps re-read the 40 records and 12 books (zone.html's sha256 moves; not run here, read in the code and the pinned hashes).
   - check-card-numbering-v1 stays green (12 laws, work/ccn-s2.log), but N12 no longer sees the marks as «other gold».
   - check-masoretic-gold-v1 stays green (7 laws, work/cmg-s2.log).
2. **The record lands too, checks unchanged:**
   - check-color-channels-v1, 7 red (work/ccc-proposed-record-s2-page.log): supersedes (:61 wants «colour-role-rule-v1»); the fixture's structure (:78, gold vs bronze); the two new channels have no sampler (:247); «no measurement declared for "bronze"» (:254 against FAMILY); boxed in gold (:514); the eight inks (:582).
   - check-page-agrees-with-its-record-v1, 8 red until the door is rebuilt from the record (work/cpa-proposed-on-live-palette.log).
   - check-manifest-prints-unguarded-v1, if the new id is written and the manifest not re-emitted (read in the code).
3. **With the proposed revision of check-color-channels-v1:**
   - On S2: 2 red, both the owner's to settle. The silver line at 2.9:1 (Q1) and the card's address in bronze (Q3). With #7a7f86, 1 red (Q3).
   - On today's page: 7 red, so the revision does catch the old palette.
4. **Never red for the palette:** the gate (check-same-product-v1) and check-live-v1. Neither reads a color.

## 9. Anything surprising

- **The records have described a page that was not there.** For two months the record has told the reader something the page does not draw: reading_as_shown.reads_as says the reading sits «inside a gold hairline so it stays a label». The hairline went on 2026-09-11 (zone.html:422 sets it transparent), and /palette/ prints the sentence today (counted once in palette/index.html). text_as_written.carries and reading_as_shown.carries (with how_it_is_carried) still describe the washes retired on 2026-09-11. /palette/ prints CC_WEARS instead of `carries`, so those never show. check-page-agrees L1 checks only that the record's words are printed, not that they are true.
- **Gold has been ink at rest, against the record, unseen.**
  - The record says gold is «never ink at rest». The marks have been gold ink at rest since 2026-10-11, excused by class (check-color-channels-v1.mjs:415–421).
  - The card numbers on the line (zone.html:1997) are gold ink at rest whenever the numbers switch is on. They escape the law because it reads text nodes, not `::after`.
  - The card's address `.wn` is gold ink, allowed because `--gold` is one of the «eight inks».
  - The v3 record makes the marks a channel of their own; the numbers need Q3.
- **The card's outline was purple and no law read it.** `#hud` is `border: 1px solid var(--sel-dim)` (zone.html:1508), the purple's dim, which the owner caught in word 4. No check samples it; the proposed revision adds it (B20).
- **A stale excuse.** check-color-channels-v1.mjs:414 still excuses `.rail .now` from «gold at rest», but `.rail .now` has been purple (zone.html:1330–1333).
- **Comment and code disagree.** check-color-channels-v1.mjs:179–180 says a channel with no bearer «is said to be absent, never scored as a fault»; :247 scores it as a fault. Harmless today, and harmless under a marks channel only because of the next point.
- **The color check ignores the work it is handed.** It keeps the address's base (:197) and always opens the first work with a commentary, amos (:203). Under `tools/run-all-checks.sh --panel`, the four works of the panel (amos, zephaniah, tikkunei-zohar, obadiah, measured with `shapePanel()`) are four runs on amos. The Tikkunei Zohar, which draws no mark in gold, is never judged by it.
- **The gate cannot see a palette.** check-same-product-v1 compares text only. A ship that is only a palette change passes it by construction.
- **One zone.html edit sends the whole round's tail again.** One byte of CSS in zone.html makes all 40 resting-lines records and all 12 chain books «not of this tree», and the round must re-read them in a browser (the chain presses every word) before the door will build. If the palette's zone.html edit lands after the default toggles' round, those steps run twice.
- **The door's own sheet lacks the palette page's swatch tokens.** DOOR_CSS_BASE declares no `--mark-ink`. The /palette/ page is built from that sheet, not zone.html's, so a CC_TOKEN pointing a new swatch at `--mark-ink` would paint nothing until the door's sheet declares it (D4). The page claims its swatches «cannot drift from what a reader is shown», but they show the door's copy of the palette.
- **Nothing checks the logo against the page.** The owner said «my main point is uniform coloring between logo and site» (2026-10-10). The mark's colors come from build-wordmark-v1.py:65–68, typed by hand, and no check reads the SVG. Today the mark carries #93661a ×4 and #a06c10 ×6 (counted in mark/fireandhail.com-woven-v1.svg).
- **The brief and the owner's words differ on the weave** (Q5).
- **The silver sits just under the floor** at 2.95:1, rounded to 2.9 in the owner's words, against the 3:1 the frame is held to (Q1). The bronze clears it easily (4.31:1 on linen, 3.60:1 on the pressed linen).

## Files written by this part

- `scratchpad/v57/checks-and-records/TABLE.md` (this file)
- `scratchpad/v57/checks-and-records/proposed/color-contract-v1.proposed-2026-11-15.json`, the proposed record; `proposed/color-contract-v1.diff`, its diff against today's
- `scratchpad/v57/checks-and-records/proposed/check-color-channels-v1.proposed.mjs`, the proposed revision; `proposed/check-color-channels-v1.diff`; `proposed/check-color-channels-v1.patch.py`, which writes it from today's file
- `scratchpad/v57/checks-and-records/work/`: the servers and measuring scripts (serve-s2.mjs, measure.mjs, silver.mjs, deltae.mjs, patch-check.py), runkinds.txt, the run logs named above, and sim/ and sim2/ (copies of the two checks and two helpers, with symlinks to the fixture)
