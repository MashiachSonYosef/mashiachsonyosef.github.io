# Builder H2, after the ninth cut: today's card's laws hold under the place card at rest (S/s16; the lead ships after this)

`S` = `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad`
`N` = `/home/user/mashiachsonyosef.github.io/wip/2026-11-27/fresh-build`

## Why

The owner has said the lead may ship without waiting («you can ship dont wait for my approval»). Before the place card goes live at rest, the frame the owner asked to keep must hold under it: «you dont get to skip R pills and compspan and selectable gloss just because we can play around with how the cards list off D/M».

Your pills hand-back (`N/H2/hand-back-pills.md`) found that the 70 card checks pass 70 of 70 with the old card forced, but only 33 of 70 at rest. The lead read the failing laws. This step closes what is the place card's to close, and names what is not.

**The goal:** at rest, every law of the 70 card checks holds, **without editing any law**. The only exceptions are the laws named in section 3, each with the reason written down. Each of those must pass with the old card forced.

## 1. The work

**F1. The card presses the line.**
- Under the default switches, and under each default source (STEP, MACULA, UBS, BDB, and each one's second), the card opens pressed on the word's line wherever the line's reading is among the cell's pills, and that pill stands first.
- The lines under these switches **do not move** in this ship. The gate (check-same-product-v1, S1) compares them with live.
- Laws: card-opens-on-the-line C1/C2, line-follows-card F6 (UBS «not» against «almost», BDB «also» against «even»: find why the line's reading is not the source's pill there, and say whose reading is right), default-picks D5/D12, line-reads-the-place P4 (pressed is not first: «[is] Belteshazzar»), live-line-asks-its-own-word V2/V3, source-switch S4, rulings-under-sources U7/U9.
- Where the line is a reading the cell does not offer, see F6.

**F2. The order switches and the overlays.**
- For each position of the definition-order toggle (corpus, masoretic, cites here, characters, vowels differ, outside the era, the three witnessed columns, at this place) and for the overlays, decide one of two things:
  - (a) Its meaning applies to the place answers. Reorder the place pills by it, and the line under **every** word follows the card's first pill under it. The line moves under that switch only. Count the moves per switch.
  - (b) Its meaning is a match by letters (for example «characters»: «letters match exactly … how every key on this shelf is made»). Then it is offered only behind «readings matched by spelling».
- Say which, for each, with its reason in one sentence.
- Laws: lattice-orders, witnessed-order W4, card-opens-on-the-line C1 under corpus (the line «Dibri» for «[the] words of» is a match by letters under a name).

**F3. What rests shut rests shut.**
- The dictionary kinds record (`data/dictionary-kinds-v1.json`, the owner's ruling of 15 November) names what rests shut on a card at rest. It rests shut on the place card too: held back, counted, and opened with the same press as today's.
- Today a root's cell can carry about 150 pills. Give the pill counts per cell before and after: the median, the 95th percentile and the largest.
- Laws: dictionary-kinds K4, words-stand-alone A6/A8.

**F4. The export and the chip.**
- The record cited and its year are the record and year the card shows, whether or not a card of the word was opened on the page (citations C10/C11).
- The chip rides the reading's own record (english-license).
- A pill pressed on a piece of a divided word reaches the export. Your count was 32 of 129. Make it all, and count again.

**F5. Pairs, runs and read forms.**
- read-form-offsets R3: a read form's block that only the file places offers its piece's own reading.
- kq-lead-follows-switch K7.
- readers-faults-pairs F1/F9: a ruling on a pair's written half keeps through a repaint, with its chip.
- readers-faults-cards C10: a block of several words of a run offers pills. Take them from the run's own words' place answers, by address.
- run-card-forms R6: a shard that did not arrive.
- readers-faults-load law 10.

**F6. The 141 words.** The lines at the 141 do not move in this ship; their move is the next ship's (task 169), read word by word. At rest:
- **Today's line is among the pills (54):** press it, first.
- **No resting line (14):** the card opens on the place's own reading, as now.
- **Today's line is not among the pills (73):** press no pill. Say in one plain sentence that the line is today's reading, which no source gives at this place, and name the place's own reading with its source. Model: «The line here, «mother», is today's reading, which no source gives at this place; STEP reads «if».» A press on any pill sets the line, as anywhere.
- List each law this leaves red, with its words. Those reds are owed to the next ship, not excused.

**F7. The written-form note.** Under the place card, the head must not say «its readings are matched by letters only» (your picture 05). Say what the card reads the written form by.

**F8. compspan.** Give check-compspan-coverage-v1 a verdict, run alone with the runner's own limit (`--timeout 1500`), both at rest and with the old card forced.

**F9. STEP's asked credit, on both cards and in the export.** STEP's new licence summary (relay v224) asks users to «Attribute the data to Tyndale House and STEPBible.org, and include a link to STEPBible.github.io/STEPBible-Data as the source of this data». The place card's credits already do this. Today's card does not: its record line (`mLine`) names «STEP Bible Translators Amalgamated…» with its chip and nothing more.
- Wherever today's card names a STEP record, it carries STEP's credit and the link to `https://STEPBible.github.io/STEPBible-Data`, after the chip. STEP's records are the store's sources whose key begins `stepbible_`: M4, M19 and M197. M45 is BiblicalTools; its STEPBible lemma data is said in its own license words, so leave it as it is.
- So does the export's citation of a STEP record, on either card.
- The words come from **one place**: the place card block's own credit, not a second copy. The place card names it «data created by STEPBible.org based on work at Tyndale House, Cambridge».
- Prove it with the old card forced: a STEP row's line names Tyndale House and links the source. Show it in one picture of each card.

## 2. Keep

- Every proof from the pills step still holds: the one-place check (every law, the new ones each failing on a spoiled copy), the walk, the presses, the switch proofs (switch on equals S/base on 50 places; resting lines unmoved off, on and off again, five books), and the eight tree checks, each alone.
- No resting line moves under the default switches (F1).

## 3. What may stay red at rest

Only a law about a feature that stands, by the one rule, behind «readings matched by spelling». Write the list as `N/H2/laws-of-the-spelling-card.md`. For each law give:
- the check and law letter;
- the feature;
- why its meaning is a match by letters, in one sentence;
- that it passes with the old card forced.

The lead's reading of your pills run puts these on it, if you find nothing better:
- the concordance pill and its table (dictionary-toggle D1–D5; and reset-pill, which waits on that pill. Prove reset itself at rest in your own proof: a pressed reading, then reset, then every line as it opened and the switches at their defaults);
- the store's rows withheld or graded (masorah-toggle, pointing-gate, pointing-grade, piece-class, read-words, span-grade);
- the store's own kinds of reading (form-of, kq-declared-weld, ledger-divisions, made-spaces, overlays, piece-store, strongs-hedges, word-senses);
- readers-faults-rail.

Read each of these again before you list it. If one is a frame feature the place card can answer by address, it is F-work, not the list.

## 4. Prove it

1. **The 70 card checks, each alone, at rest.** Every red is either on the section 3 list or owed by F6, each named.
2. **The same 70 with the old card forced** (your swap; restore and match the sha256 after): 70 of 70.
3. The proofs of section 2.
4. **Pictures** into `S/s46w/shots-frame/`:
   - Ruth 3:12 word 5 (F6);
   - a root's cell at rest with the shut dictionaries closed, then opened (F3);
   - Genesis 1:1 under the corpus order, or whatever F2 makes of it;
   - a piece pill pressed, then the export;
   - a run block's pills (Genesis 35:7 word 6).

## House rules

As before:
- No Hebrew in tool string literals or in zone.html's own code.
- American English.
- One browser at a time.
- Small logs (about 3 GB free).
- If a write or a fetch is refused, say so and do not route around it.
- No commit, push or ship. Leave S/s16 at the «after» state (no meta reader-card line).

## Hand back

Your final message, whole:
- what changed, per F-item, with counts;
- the 70 at rest and forced, each check's verdict;
- the section 3 list's path;
- the F6 reds;
- the proofs;
- the pictures with what each shows;
- what still reads badly;
- the paths.
