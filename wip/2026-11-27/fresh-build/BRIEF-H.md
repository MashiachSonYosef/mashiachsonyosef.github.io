# Builder H: the place card inside the live reader (in a sandbox; nothing ships)

`S` = `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad`.

Read first, in this order:

1. `S/s42w/FRAME.md` (the why, the one rule, the house rules).
2. `/home/user/mashiachsonyosef.github.io/wip/2026-11-27/THE-LAYERS.md` (the layers; the two systems on the live page: the line and «here X reads», nearly clean, and the pool of readings matched by letters and trimmed by gates, where every card fault lives).
3. `/home/user/mashiachsonyosef.github.io/wip/2026-11-27/fresh-build/README.md`, then `V/hand-back.md`, `V/hand-back-cut-2.md` and `V/hand-back-cut-3.md` beside it (the trial page `reader/place.html`, its data, its rules, what still reads badly).

## Where things stand

The fresh build exists and is proven: `reader/data/place-answers-v1/` (places, entries, bridges, page files), its tools, and a small trial page `reader/place.html` whose card shows, for a pressed word, «At this word» (what each source says at this very word, by that source's own address) and «In the dictionaries» (each dictionary's own entry under the number STEP gives the word). It all lives untracked in the sandbox `S/s14` (a git worktree at live `main`, ea6e1ad08e). Pictures: `S/s45w/shots/`.

Held side by side, the live reader's chapter face (the Hebrew, the frames that set each English part under its letters, the bar, the menu, export) is already right: the line under a word is the fresh line character for character at 305,290 of 305,431 words. What is wrong on the live page is the card. So the live reader should keep its face and take the new card.

## What you make

In your sandbox, the live reader `reader/zone.html` opening the place card on the 39 books of the Bible, with the old card kept whole behind one named switch.

**Your sandbox:** `S/s16` (a git worktree at live `main`, ea6e1ad08e). The lead has already copied the fresh build into it as it stood after the trial page's third cut (30 untracked paths: the data folder, `reader/place.html`, the tools; the comparison tool's list `data/place-answers-v1/lines-known-to-differ.tsv` is there too). First run `reader/tools/make-place-answers-v1.sh S/s45w/fetched` once (about three minutes) and see «everything holds». From now on `reader/place.html` in `S/s16` is yours to change. `S/s14` (where another builder may still change the projection tools, never `place.html`; the lead reconciles the tools at the end), `S/base` (a copy of live, read only) and everything else are read only. Your scratch, logs and pictures: `S/s46w/`. No commit, push or ship.

### 1. The card

- On a book that has place answers (told by the data: `data/place-answers-v1/page/index.json`, never a typed list), pressing a word opens the place card in the live reader's own sheet. Keep the sheet as the live page has it: where it sits, that it holds still, its head (the Hebrew once, pointed and red; the card's number in silver), how it closes. Its body is the place card's: «At this word», then «In the dictionaries», the same words, order, credits and notes as `place.html` draws from the same page files.
- **One rule, one place.** The code that draws the card's body lives once and both pages use it. Find how this tree keeps a rule in one place when two pages need it (the comments in `tools/gloss-store-v1.mjs` near «ONE RULE, ONE PLACE» show one way: marked lines carried by the page and held equal by a check) and do it the tree's way.
- A word of a scribal mark, a written-and-read pair, a word written and not read, a tied run: each opens the place card for the form pressed, as `place.html` does.
- Every other kind of card stays exactly as it is today: a word of the Tikkunei Zohar, a commentary's or a Targum's or a dictionary's own word (the page's `bin !== zone`), a chain's card. The place card is for a word of one of the 39 books, at its place.

### 2. The old card behind one named switch

- The pool of readings matched by spelling, with its gates, grades and switches, stays in the page whole. On a book with place answers it sits behind one switch in the menu, **off at rest**, named in plain words (propose the wording; something like «Readings matched by spelling», with one line saying what it is: every reading any dictionary files under these letters, wherever it comes from).
- With the switch **on**, the page is today's page: the same card, the same menu, the same behavior, so that every existing check can still be run against it.
- With it **off**, the menu's switches that act only on the pool are not offered on these books (list each one and say why it is pool-only). A switch that acts on the line under the word (the signs, the reader's language, whatever else you find) stays.
- On a work with no place answers nothing changes and the new switch is not shown.

### 3. The line under the word: not in this step

Leave the line as the live page draws it. (The 141 words where it differs from the fresh build are a later step.) But say what, with the pool switched off, still feeds the line at rest, and whether anything the pool did reaches the line (a reading the reader pressed, the default sources): the line must not change when the switch is flipped at rest. Prove it.

## Prove it

1. **The place checks** (`make-place-answers-v1.sh`) hold in your tree.
2. **In a browser** (phone size, 412 wide; one browser at a time): every chapter of Ruth and Genesis 1 to 5 and 20 chapters across other books; press every word: the place card opens, no page error, what it prints under «At this word» is what the page file holds, the sheet does not move when entries are opened and shut. The median time to open.
3. **The switch on is today's page.** For 200 words across the books, the card with the switch on equals the card of `S/base` (the tools `S/w39/out/lead/places-for.cjs` and `S/s29w/tools/probe-cards-20.mjs` read a card off a tree's page; read them and use them or their way).
4. **The switch off does not move the line.** The resting lines of five books read off your page with the switch off equal those of `S/base` (`tools/resting-lines-v1.mjs` reads them off a page; `node S/s7w/lines-diff.mjs` compares two trees).
5. **The other works are untouched**: a Tikkunei Zohar page and a commentary's card, before and after.
6. **The suite, measured, not mended.** 87 check tools read the card. Find how they open the page and say the one smallest way to let them keep running against the old card (the switch set on by one shared hook, an address parameter, whatever the tree already has). Then run the checks that read the card (one at a time; the machine is shared) twice, with the place card at rest and with the old card forced on, and list which are red in each case and why. Do not edit a check's law to make it pass. The tree's checks that walk every tool or page (`check-no-import-side-effects-v1`, `check-ledger-declared-v1`, `check-nothing-hand-typed-v1`, `check-nothing-hard-wired-v1`, `check-sidecars-all-named-v1`, `check-build-derived-v1`, `check-scope-derived-v1`): each run alone, each result named; red before and after is not yours.
7. **Pictures for the owner**, phone size, deviceScaleFactor 2, under `S/s46w/shots/`, each of the real reader with the new card: Genesis 1:3 word 5 («and there was»); Genesis 1:1 word 4 (the object marker); Ruth 3:12 word 5 (written, not read); Amos 7:12 word 6 («go»); Psalms 44:15 word 6; one with a dictionary's entry opened whole; the menu with the new switch off; the same word's card with the switch on (today's card), for holding beside it. Look at each yourself and say what a reader sees and what still reads badly.

## House rules that bind this work

Those of `FRAME.md`, and: `reader/zone.html` carries no Hebrew letters in its own code or strings (the data carries the Hebrew); tools carry no Hebrew in string literals; American English; the page's words are plain words a first-time reader understands, none of our working words («pill», «pool», «bridge», «zone», «ledger», «tag» without saying what it is). Each source is credited on the card as it asks, as `place.html` does. Nothing is matched by letters in the new card. If a tool refuses a write or a command, do not route around the refusal: say so in your hand-back.

## Hand back

Your final message, whole (you cannot write report files; I save it): how the card is seated and why each choice stands; the switch and what it hides; each proof with its counts; the suite's two lists; the pictures' paths with what each shows; what still reads badly; what you left out and why; what a ship of this would still need; the paths of everything.
