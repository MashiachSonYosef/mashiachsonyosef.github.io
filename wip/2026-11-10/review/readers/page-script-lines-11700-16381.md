A. FINDINGS (25, most important first)
File reviewed: /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/pt/reader/zone.html, lines 11700-16381. Nothing was written or run in a browser; data facts come from read-only scans of reader/data, and the unused/undeclared names from an in-memory TypeScript no-emit pass over the script.

1.
kind: bug
lines: 15547-15549, 15671-15674, 15647-15657 (gate bypassed: 10008-10020)
summary: The commentary index box is drawn on every plain book page that has a sidecar, although commentary is parked behind ?commentary=on / ?c=open / ?rail=all, and its hits open nothing.
evidence: buildCommentaryIndex reads `commentaryStore.units` with no COMMENTARY_ON test and `main.prepend(ci)` is unconditional. A hit runs openFromIndex -> toggleSectionInline -> buildSectionInline -> sectionCommentaryFor, whose first line is `if (!COMMENTARY_ON) return null;`, so nothing is built. Comment 10002-10005: "A book page draws no commentary bar, handle or switch unless the address asks". 21 of the 48 zones on disk have a sidecar.
why it matters: On 21 books the first thing above the text is a searchable list (146 units on Amos, 1,291 on Isaiah) whose buttons scroll the page and open nothing.
verify: Open amos with no query, open "C146 Commentary", press a hit: `document.querySelectorAll(".c-inline").length` stays 0. (tools/check-contents-shut-v1.mjs already finds #cIndex on a bare `?b=<book>`.)
confidence: high

2.
kind: bug
lines: 12041-12051, 12094-12100, 12112-12122, 12604-12612 (the pairs painter it relies on: 5034-5069)
summary: A ketiv/qere pair's line never follows the source switches; it keeps the reading and the chip of a source the reader switched off.
evidence: Pair parts are read raw: `const g = table ? table[shownKey(r)] : null; return g ? spanJoin(g) : "—";` (lineUnder, which answers the switches, is skipped by `if (!(regions && regions.length > 1))`). Pairs are kept out of the live ledger (`if (table === zone.gloss && !wasRuled && !word.kq) GLOSS_STANDS.push(...)`) and repaintLive receives only GLOSS_STANDS; paintPairs re-reads `s.table[r.k]` the same way. carriersOff/switchedReading are used only for ruled lines and card cells (4616-4729, 8447, 8478). Data: the half the line falls to rests on one ledger id at 844 of 1,062 pairs, on M4 (STEP, also the "place" source) at 489.
why it matters: This is the failure the comment at 12615-12634 says was removed ("lines kept a chip naming a source the reader had turned off"); plain words move, pairs do not, and the pair's card no longer offers what its line prints.
verify: Daniel 2:4, (לעבדיך) [לְעַבְדָ֖ךְ]: both halves are baked by ["M4"]. Switch the STEP chip off; the line still reads "for + servant + your" under the STEP chip.
confidence: high

3.
kind: bug
lines: 13578, 13583, 13617-13618, 13431-13495 (first-load order: 15900-15908)
summary: Reset calls railSwitch() a second time, which rebuilds the rail without its sources strip, its "reads first" row, its pairs row and the scribes' marks button.
evidence: `chooseBlanks = (id) => { signsSwitch.set(id); if (document.getElementById("railRows")) railSwitch(); }` (same for chooseNames). railSwitch does `rows.replaceChildren()`, creates empty hosts (`host.id = "defRow" / "pairRow" / "sourcesRow"`) and calls only readsSwitch() and railSay(); at load the hosts are filled by pairSwitch(), sourceSwitch(), defSwitch() called after it. The marks button was moved into the old fold, so `document.getElementById("marksToggle")` is null on the second run.
why it matters: After a reset with "source signs" or "names lead" off their default (set under ?rail=all, kept in localStorage), the rail's main control, the dictionary strip, is gone until reload.
verify: `?rail=all`, press source signs "as printed", press reset: `document.getElementById("sourcesRow").childElementCount === 0` and `document.getElementById("marksToggle") === null`.
confidence: high

4.
kind: bug
lines: 13005-13018, 13372
summary: The live box on a "whole source" declaration line does nothing when pressed.
evidence: `const t = box.closest(".src-row"); const s2 = t && t.querySelector(".dfp:not(.decl-bx)"); if (s2) s2.click();` but the panel is appended to the shelf (`if (shelf) shelf.append(declPanel(g, d));`), and `.src-row` is the chip span in `.src-strip`, never an ancestor of `.decl`. So `t` is null.
why it matters: 46 of the 163 branches in source-declarations-v1.bin get this box, titled "this is the source's own switch", with "the box above turns it off" printed under it. (If it did work, the chip's refresh would redraw the shelves and close the panel being read.)
verify: Open any dictionary's name in the rail; `document.querySelector(".decl-bx:not(:disabled)").closest(".src-row")` is null.
confidence: high

5.
kind: bug
lines: 14363 (also 15807, 15811)
summary: A malformed percent escape in the address hash throws before the text is built.
evidence: `const hashAt = decodeURIComponent(location.hash || "").replace(/^#/, "");` at the top level of the main async function, with no try; the same call is guarded at 15933 and 16207.
why it matters: Any link whose hash was cut mid-escape (`#%`, `#%D7%91%D7`) raises URIError before `zone.sections.forEach` (14681): no sections, no nav bar, no contents panel.
verify: Load `/genesis/#%`; the console shows "URIError: URI malformed" and no `section.seg` exists.
confidence: high

6.
kind: bug
lines: 15763-15772, 14423-14428, 15519-15525 (CSS 2276)
summary: Laying built sections again destroys a section's commentary for good and leaves an empty bar row behind each time.
evidence: The relay removes direct children with class "he-text", "c-bar", "c-slot" or "xp-row". The bar now lives in `.c-barrow` (15524), which is not on the list, so the old row stays, emptied when buildBody moves the bar into a new one (it keeps `margin: 0.55rem 0 0.32rem`). The removed `.c-slot` held the built commentary, and `inlineBuilt` (a WeakSet keyed by the section) still has the section, so `if (inlineBuilt.has(el)) return;` stops any rebuild and toggleSectionInline returns false.
why it matters: On ?rail=all (which turns on commentary and the two switches that relay) and on ?c=open after a reset with picks, an opened commentary vanishes and its bar can never open it again; "open all commentary" stays lit over relaid sections that show none.
verify: I Kings `?rail=all`: open a verse's commentary, flip "joined words"; the text is gone, the bar is dead, and `document.querySelectorAll("section.seg > .c-barrow:empty").length` grows with each flip.
confidence: high

7.
kind: bug
lines: 12736-12738 (compare 12074, 12570, 12585, 5049)
summary: The live repaint under the source switches prints sign-only pieces that every other painter leaves as gaps.
evidence: `const line = parts.filter((x) => x !== "—").length ? parts.join(" + ") : "";` then `st.ge.textContent = line` with no signsOffLine; first paint and the order repaint wrap the same join in signsOffLine. Data: 132 of Genesis's 6,414 baked readings are STEP readings with a sign-only piece among others ("<in>/ daughter/ your").
why it matters: With signs off (the default) and any source off, a re-asked line reads "<in> + daughter + your" where the same reading baked shows a gap, the regression the comment at 12567-12568 records for the sibling painter.
verify: Read 12736 against 12585; or in Genesis switch a source off and look for `.g[data-live]` lines containing "<".
confidence: high on the code, medium on how often the live leader carries a sign

8.
kind: bug
lines: 12705 (state it depends on: 6745-6761, 7006, 7797, 7809, 4539-4553)
summary: The pool repaintLive asks is filtered by the pointing gate only for the last-opened card's word, so a live line is either ungated or gated by another word's pointing.
evidence: `pool = await poolFor(k, { storeOnly: true })`. In poolFor the gate reads `latticeStore.grades[openPointed]` only when `surface === openKey`; openKey/openPointed are set in openHud and never cleared by closeHud. The baked line under the gate is the sidecar's gated leader (11664-11685) and falls to "sources-bare", which partNeedsLive (12670) sends to this pool.
why it matters: Under the default gate ("only", 2906) a live line can print a reading its own card withholds, and the answer depends on which card was opened last; 12626-12630 ("the line asks the same live pool the card asks ... says what the card's first pill says") no longer holds.
verify: Read 6745-6761 against 12705; or switch off the carriers of a graded word's leader and alternate and compare its line with its card's first pill.
confidence: medium

9.
kind: bug
lines: 12850-12852 (helper it ignores: 12652-12666; the fold's own count: 13314-13317)
summary: The rail's summary counts ledger ids as dictionaries switched off.
evidence: `${drawn} dictionaries${sourcesOff.size ? ` · ${sourcesOff.size} off` : ""}`: `drawn` is the number of chips, `sourcesOff.size` the number of ids, ids of other books included (the set is shared across books). sourcesOffSay() exists for this: "one source per chip ... an id this book's record does not know ... is not counted". Genesis: 79 ids on 35 chips, 9 chips with several ids, one with 11.
why it matters: One chip off reads "N dictionaries · 11 off" beside the fold's "N sources · 1 switched off".
verify: Genesis, switch off the hewiktionary "exact English translation" chip and read both lines.
confidence: high

10.
kind: bug
lines: 13592-13600 (load defaults: 3296-3299, 13531; HTML 2478, 2483, 2493-2496, 2502)
summary: What reset restores is not what a fresh device opens with.
evidence: `return BLOBS.includes(v) ? v : "every"` (3298); numbers `=== "on" ? "on" : "off"` (13531); `SWITCHES_DEFAULT = { mode: "he", blobs: "off", nums: "on", ... }`; `resetPill.disabled = !n && at`.
why it matters: On an untouched first visit the reset pill is live with an empty state, and pressing it turns blobs off and numbering on and stores both, against "It cannot be pressed while there is nothing to put back" (13591). The HTML comment at 2493-2496 still says "The switches in this row keep their settings".
verify: Clear site data and load a book: the pill is enabled, `resetState` is empty; press it.
confidence: high that it happens; which default is intended is the owner's call

11.
kind: bug
lines: 14666, 14767, 14783
summary: `lastServedC0` is declared inside scopeCensus, where nothing reads it, and used undeclared in the section loop.
evidence: 14666 `let lastServedC0 = -Infinity;`; 14767 `if (!(at <= Number(sec.c0_first) && at > lastServedC0)) continue;`; 14783 `lastServedC0 = Number(sec.c0_last);`. The script is not strict, so 14783 creates `window.lastServedC0` on every load. The TypeScript pass reports exactly two undeclared names in the whole script, both these.
why it matters: A zone whose first omission stands before its first served section reads the name before it exists: ReferenceError inside the loop and no text. Latent today (no zone carries served_in_part); the implicit global is live now.
verify: After any book loads, `window.lastServedC0` is a number.
confidence: high

12.
kind: bug
lines: 14363-14378, 14405, 15810-15820 (hashes written at 14260, 16363-16366)
summary: The hash forms read at load and on hashchange are disjoint: the page's own section hashes do not survive a reload, and a verse hash set later does nothing.
evidence: At load openAt accepts `c:v:w`, `c:v`, `c`, `v3-7`; an element id (`#s40`, written by ``a.href = `#${sc.id}` ``) matches none, the sections do not exist when the browser looks for the fragment, and `openSpot` is blanked by `!hashAt`. On hashchange only WORD_AT and element ids are handled; `#8:17` falls to `document.getElementById("8:17")`, null.
why it matters: `/genesis/#s40` reloaded or shared opens at the top with the kept place ignored, though 16165-16166 assumes "a reopened tab would land on it"; 14373-14375 ("#8:17 a verse, #8 a chapter; each opens the book there") holds only on a fresh load.
verify: Load `/genesis/#s40`; then on a loaded page change the hash to `#9:1`.
confidence: medium (fragment timing reasoned, not run)

13.
kind: bug
lines: 15773 (enrollment: 12122, 12136-12141; ledgers: 4774, 4585-4590)
summary: A relay prunes GLOSS_STANDS only; KQ_STANDS and standsOf keep every element it replaced.
evidence: 15773 splices GLOSS_STANDS; no splice, filter or delete on KQ_STANDS or standsOf exists anywhere in the file, and wordBlock pushes to both on every rebuild.
why it matters: Every reset-with-picks or joined-words flip leaves all built sections' old word elements held and repainted (paintPairs walks every stale pair), against 15761-15762 "the lines' registry forgets the elements that went".
verify: `grep -n "KQ_STANDS\|standsOf" zone.html`.
confidence: high

14.
kind: bug
lines: 12880-12884 (the refusal: 3463; the row is always live: 3459)
summary: segRow lights the pressed position without asking the toggle whether it took it.
evidence: `onPick(pos.id); for (const x of seg.children) { const on = x.textContent === pos.lab; ... }`. The pointing toggle's set returns early for "only" on a book with no lattice, and its `live` is `() => true`, so the button is pressable (3456 says "drawn dead without it"; it is not).
why it matters: On Tikkunei Zohar (no lattice sidecar) "only this pointing" shows pressed while the gate stays "keep".
verify: tikkunei-zohar `?rail=all`, press "only this pointing": `aria-pressed="true"` and `window.__masorah === "keep"`.
confidence: high

15.
kind: bug
lines: 13819-13825
summary: The search asks the dictionary for the letters as typed, not for the row it found, so a hit found by its final-letter form shows no readings.
evidence: `if (r.exact) { ... const { v } = await dictKey(L);` while `exact` may come from `rows.find((r) => r[0] === ending)` or the folded match; dictKey is an exact lookup (`data[key]`). go() correctly uses `row[0]`.
why it matters: Typing מלכ finds מלך (the index holds מלך, not מלכ) but its "reads" line is missing; it appears while typing any longer word and for readers who do not type finals.
verify: Type מלכ, then מלך, and compare the first hit.
confidence: high

16.
kind: stale-comment
lines: 12969-12972 (code: 13005-13018)
summary: The comment says no control is drawn for an expression; the code draws a box on every one.
evidence: "never draws a control that does not exist. A second checkbox for a whole-source expression would imply a second, independent switch" against `bx.className = "dfp decl-bx"` on every branch and, twenty lines down, "EVERY EXPRESSION CARRIES ITS OWN BOX (owner, 2026-09-20)".
why it matters: The stale half states the design rule the later ruling reversed; read alone it makes finding 4 look intended.
verify: Read the two blocks together.
confidence: high

17.
kind: stale-comment
lines: 15888-15890, 15898-15899
summary: Two comments above the nav bar code say the opposite of the code under them.
evidence: "offsets are measured once — nothing reflows after paint" sits directly above "Read live: ..." and `get top() { return h.el.offsetTop; }`. "the marks switch counts what the page drew" against marksSwitch's `(zone.sections || []).flatMap(...)` and its own comment (12437-12440: "a count taken from the DOM named only the marks already drawn").
why it matters: Both describe the bug that was fixed as the current design.
verify: Read 15888-15899 and 12437-12442.
confidence: high

18.
kind: stale-comment
lines: 14556-14557, 14561-14562, 14910-14911, 15025, 15137-15138
summary: The commentary scope rule states a mark the code withholds and cites Genesis counts for data that is not on disk.
evidence: "It opens under the section and the whole section carries the mark" against 14510 `w.classList.remove("c-open")` and 14504-14505 ("withheld here"). "(181 of 181 in Genesis ...)", "Genesis 1:1 carries four hundred and thirty-one", "31,089 of the 37,900 words of Genesis commentary", "55 of the 58 works": there is no genesis.commentary.bin, and each of the 21 sidecars lists one work.
why it matters: The numbers read as current evidence for code that nothing on the shelf exercises (finding 21).
verify: `ls data/zones | grep commentary`.
confidence: high

19.
kind: stale-comment
lines: 12166-12171, 13585-13586
summary: A pair is said to open on "the half the reader pressed in the head at this place"; nothing remembers one.
evidence: kqLead (12244-12250) says "never a half pressed on the card", openAt says "nothing is remembered" (12345), and `const site = `${unitId}:${wordPos}`;` (12171), the key such a memory would use, is never read. The reset's list ("a half of a pair") names the same store that does not exist; reset clears pickedByForm, pickedQForm and ruledAt.
why it matters: Describes a precedence step that was removed.
verify: `grep -n "\bsite\b" zone.html` inside wireWord.
confidence: high

20.
kind: stale-comment
lines: 11949-11951, 12454-12466, 12904-12908, 12834-12842, 14054-14057
summary: Comments left standing where their code moved or went.
evidence: 11949: "the empty verse prints its reason on the line" closes the `if (word.mark)` block with no code under it; the stylesheet (406-413) says "Nothing in English stands on the line" and hides `.g`. 12454: "The pair switch ... Three positions, cycled" and "WHICH READING ANSWERS FIRST" sit above applyGlossOrder; pairSwitch (12889) draws three pressable buttons. 12904: "THE SOURCE SWITCHES' ROW ... sorted by how many of this book's lines it leads" sits above declReady. 12834-12841 says the summary recites every switch; the code draws two indicators. 12842 and 14056 are cut mid-sentence ("... the forced source suggested label", "... so the ledger's").
why it matters: With this much comment, an orphan reads as a claim about the code it now sits on.
verify: Read each range with the five lines after it.
confidence: high

21.
kind: dead
lines: 14992-15000, 15002-15361, 15378-15449, 15454-15470, 15512-15513, 15658-15664 (also scopeOf cases 2 to 6 at 14632-14648, and 16015)
summary: The word-anchored commentary machinery (handles, chooser, panel, counters, span scope) cannot run on any sidecar on disk.
evidence: Across the 21 sidecars, 7,694 entries all sit under `units[*].section`; no unit has `words`, no entry has `covers` or `v_words`, no ref reads "X on Y,". So `wb.__cm` is never set and placeLineHandles returns at `if (!marked.length) return;`.
why it matters: About 500 lines carried untested, with two defects waiting: the "answering this" row is appended to `body` outside paint() (15276), which starts with `body.replaceChildren()` (15014), so choosing another unit wipes it; and openFromIndex takes `[...querySelectorAll(".he-text .wb")][r.pos]` (15658) before removing open panels, counting their words (15376 and 15460 filter them).
verify: A node one-liner over data/zones/*.commentary.bin counting units with `words` prints 0.
confidence: high for today's data (the sidecar builder can still emit word anchors)

22.
kind: dead
lines: 14249-14258, 14684-14708, 14196-14238, 14764-14782
summary: Three branches wait on zone fields no builder writes.
evidence: Part heads and "Part N": every node in all 48 zones has only num, name_en, sections, and tools/build-zone.mjs has no `part_`. `zone.title_suggestion`: on no zone, attached only by tools/check-suggested-title-v1.mjs to its own fixture. Omissions: `served_in_part` on no zone, named only by tools/check-partial-serve-declared-v1.mjs ("Nothing on this shelf is partial today").
why it matters: Unexercised branches are where finding 11 hid.
verify: Scan data/zones for the three fields; `grep -n "part_" tools/build-zone.mjs`.
confidence: high

23.
kind: dead
lines: 15909, 13416, 12986, 12808-12819, 13263-13264, 13305-13306, 15769, 14369
summary: Small leftovers that cannot do anything.
evidence: `if (paintNames) paintNames();`: paintNames and paintBlanks are `let ... = null` (3144, 3153) and never assigned. `window.__eraCutCE` ("read by an older check, for one release"): no file in reader/tools reads it. `stemKey`: declared, passed at 13149-13150, never read. `|| masorah !== gateWas`: only settleDefaultPointing can change masorah there, and it returns true when it does. `g.changes`, `g.darkens`, `g.costKnown`: written, never read (the chip uses `g.costs`). "c-bar" and "xp-row" in the relay list are no longer direct children of a section. WORD_AT's third group (a span's end) is never read. Latent: `String(secIdx)` at 14853-14855 is read at menu-build time, so a section with no label would be named by the total count (all sections have labels today).
why it matters: Each is a line a reader has to rule out.
verify: The TypeScript unused-locals output names `site`, `stemKey`, and scopeCensus's `lastServedC0`; grep for the rest.
confidence: high

24.
kind: simplify
lines: 13005, 13065, 13124
summary: The "whole source" test is computed three times.
evidence: `const whole = !klass && coversEverything(b);` then, sixty lines down in the same function, `if (!klass && coversEverything(b))`; declPanel counts `stem.branches.filter(coversEverything)` again.
why it matters: The box, the "the box above turns it off" line and the head count must agree; one value makes that structural.
verify: Replace the test at 13065 with `whole`.
confidence: high

25.
kind: simplify
lines: 14289-14290 and 16347; 14114-14116 and 14140-14142; 12573, 12591, 12725, 12743
summary: Three small helpers are written out more than once.
evidence: The contents head's close branch repeats closePanel's body line for line. The attestation chip's expand wiring (role, tabIndex, click, keydown) is pasted in both title branches. `st.ge.parentElement && st.ge.parentElement.closest && st.ge.parentElement.closest(".wjoin")` appears four times in the two line repainters.
why it matters: Each pair has to change together.
verify: Call closePanel() from the tocHead handler (it runs at click time, after closePanel is defined); lift the other two into named helpers.
confidence: high

B. HEALTH
1. Solid: the search block (13633-13849), the landing and reading-place code (15940-16340) and applyGlossOrder's in-place column swap read true against their comments; the cancellation counters and the guards around storage and history are consistent.
2. Fragile: the line under a word is composed in five places (first paint, order repaint, live repaint, pairs repaint, ruled paint) and they have drifted; findings 2, 7 and 8 are one rule applied in some painters and not others.
3. Fragile: the two rebuild paths (relayBuiltSections, a second railSwitch) assume first-build state they do not restore (findings 3, 6, 13).
4. Parked features are half-gated: the commentary index, the declaration boxes, hooks for removed pills, and about 500 lines of word-anchored commentary no sidecar reaches, with comments still citing counts for data that is gone.
5. The script runs in sloppy mode, which is how an undeclared variable shipped; an in-memory TypeScript no-emit pass (about 3 seconds) finds it and every unused binding. Comment history is stacked rather than replaced, and two comments are cut mid-sentence.

C. THE THREE PLACES TO REFACTOR FIRST
1. Lines 12036-12145, 12557-12613 and 12678-12745 (with 5034-5069): one function that answers "what does this stand's line say, and under which chip" for plain words, pairs and ruled forms under every switch, called by all the painters.
2. Lines 15480-15537 with 14423-14474 and 15714-15778: give a built section one body container that a relay removes whole, and hang inlineBuilt and the three ledgers on it, so a rebuild cannot inherit state from the build it replaces.
3. Lines 12766-12903, 13224-13495 and 13577-13583: make the rail one render function that fills its hosted rows and re-homes the marks button itself, with segRow painting from `t.get()` after `t.set()`; reset and the parked switches then call that one function.