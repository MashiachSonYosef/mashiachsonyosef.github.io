# Ship 8, in progress (16 November 2026 AD, night)

Page lane (Elijah). The plan of the week (`wip/2026-11-16/PLAN-WEEK-OF-2026-11-17.md`) and its design (`wip/2026-11-16/SHIP-8-DESIGN.md`), taken top down. Tree: `S/s8`, branch `ship8` from live `main` afea14aac6. The code patch is `ship-8-code.patch` (zone.html and tools only, refreshed as the work moves).

## Item 1: the entry where STEP gives no tag, from MACULA's lemma (task 138)

**What is built** (entry-by-lemma-rule-v1):
- `tools/entry-gate-v1.mjs`:
  - `lemmaEntries(lemma, routesFor, factsOf)`: the numbers (facts `n`) of the store's rows under the lemma's letters whose own headword is the lemma as MACULA points it. It skips a headword carrying cantillation, since MACULA's and STEP's rows head their renderings with forms copied from a verse: Daniel's «he went in» (H5954) is headed by an accented form that points as the preposition עַל. It also skips a lemma of several words (a name such as Eben-ezer).
  - `placeTags(form)`: the gate's tags, TAHOT's `tg` else the lemma's `te`.
- **The projector** (`tools/project-lattice-v12-v1.mjs`) writes `te` on a plain word that carries no tag after the join, in a verse joined or held. It skips pairs, read forms apart and marks. `te` is cleared first on every word and recorded in the receipt's `entry.by_lemma`. The leaders at a kind of place are keyed by `placeTags`, so a `te` place gets leaders of its own.
- **The page** (`zone.html`):
  - the gate's copy carries `placeTags`;
  - `tagHolder`, `tagsAt`, `coreTagsAt`, the line's three readers of a word's tags (the named word, the leaders at a place, the line stands) and the open card read it;
  - the card's sentence names where the entry came from: «… under another entry than H5920 or H5921 or H5922, the entries of MACULA's lemma here, where STEP gives the word no tag».
- **The checks that model the gate** read the same tags: names gate, sense openings, pointing gate, stems extension, sign, same product (the gate), names pill, Masorah switch, pointing grade, source switch, read words.
- **check-entry-gate-v1** adds E15:
  - on the zone, `te` stands exactly where the lemma gives entries off the store the projector read, as the module reads them; never beside a tag; the page reads the gate's tags as the module does, and E6 runs the page's gate under them side by side;
  - on the page, a `te` word whose key carries rows of another entry: its card withholds exactly those and names the lemma's entries.

  E12 now picks a word with neither a tag nor a lemma's entry.

**Measured off the projections** (`tools/te-measure.mjs`, `logs/te-measure.json`): 936 words in 39 books carry `te`, 456 of them a list of several (homographs: «tent» and the name Ohel; the son family H1121/H1122/H1123/H4192 as one source files it). The leader under «only» at the place (the sidecar's, a proxy: the line takes a default source's pick and the place's own reading first) moves at 290 of the 936:
- **Right:**
  - 1 Samuel 2:10: «unjust one» → «concerning» (H5920 H5921 H5922; the line before ship 7 read «about»);
  - 2 Samuel 7:22: «The Lord» → «God» (H3069);
  - 1 Samuel 18:14: «archer» → «way/ its»;
  - Ezekiel 37:16 and 37:19: «charm(- er)» → «companion».
- **Bare:** where every row under the key is another entry's, as at a tagged place. Daniel 4:16, «form» of מַרְאֶה at "my lord", goes bare; so do Exodus 27:11 and Ezekiel 40:9, 40:21 and 40:29, STEP's verb readings «and/ they will stand» and «woe! to him» at "pillars".
- **Worse on the leader:** Strong's concordance's first rendering in alphabetical order now leads where its rows of the entry, pointed as the dictionary points them, come back: Deuteronomy 18:22 «he will come» → «abide» (H935), 2 Chronicles 34:32 «lived» → «(make to) abide(-ing)» (H3427), Esther 4:11 «know» → «acknowledge». A tagged place keeps those rows too; its line is read from the default source's pick or the place's own reading first. So whether these reach a resting line is for the round's line diff to say.
- **A pointer:** 2 Kings 6:25: «dove» → «plural indefinite form of יוֹנָה (yoná)» (English Wiktionary's pointer; task 137's class).

**A narrower rule, measured and set aside.** I measured whether a row of the lemma's entries should escape only the no-pointing hold, and not the hold on a row pointed otherwise (`logs/te-measure-narrower.json`, projected from a copy of the tools). It moves 245 leaders against 290, and Strong's concordance leads 151 of them against 169. Under these keys Strong's concordance's rows mostly carry no pointing, so both rules bring them back alike. The full rule stays: it is the entry gate the owner ruled (13 November), with the place's entry taken from MACULA's lemma, and it needs no exception in the ten readers that spare a row of the place's entry.

**Lost and redone.** The worker restarted twice; the second restart killed the first round and a projection running beside it, which likely ran the container out of memory. The round wrote nothing before it died. It now runs alone (`tools/pipeline-8a.sh`, from 23:39Z): the whole round, every resting line against live, and the checks that model the gate. The suite and the gate wait on the line diff.

## Item 2: a pointer leads no line, in the Bible books (task 137, first half)

Item 1 does not reach these four lines. At 1 Samuel 22:13, אֵלָו takes H413 by its lemma, and the gate then withholds Strong's «behold» (H431) as another entry. But no row of H413 stands under the key אלו, so English Wiktionary's pointer (no entry) still leads.

The line at rest prints the pointing's leader raw; the map's resolution reached only a ruled line and the card. Written as `tools/item2-pointer-line.py`, applied once item 1's round is done:
- **The page** (pointer-line-rule-v1): the leader and its alternate print `formOfText`, the resolution with the pointer beside it, as the pill prints it, credited to the pointer's own source. A resolution that is a name stands aside at a place that is not one. Where the map has failed to arrive, `window.__formOf` is now set to null as well.
- **The line recorder** (`tools/resting-lines-v1.mjs`) waits on the map as it waits on the lattice, so a line is never recorded before its resolution paints.
- **check-form-of-v1 F15:** no resting line prints a pointer's own words where the map resolves it. A data law over the recordings and the zones; it is red on live's four lines.
- **Not done here:** in the projector, the next reading that is not a pointer would lead where the map resolves nothing. In the Bible books every pointer that leads a line is resolved, so it would change nothing today. The Tikkunei Zohar's 1,261 wait on the corpus lane's map (card 3).

## Item 1, the round (17 November, 00:15Z)

The whole round passed in 2,098 s (40 records, the chain books, the door). Every resting line against live (`logs/lines-diff-item1.json`): 86 entries moved in 40 works; 5 of them change only the credit. Read one by one:

- **Right where they were wrong** (about 45):
  - Ezekiel 40:9 to 40:37, «and + woe! to + him», «and + an antelope» and «and + if» → «and + pillars + its» and «and + chambers + its» (8 lines); also «came up + it» → «stairways + its» (40:26) and «when + came out + he» → «swamps + its» (47:11);
  - Daniel 4:16 and 4:21: «form» → «O lord + my», «lord + my»;
  - Deuteronomy 22:23 and 22:28: «boy» → «girl»; 22:26: «servant» → «young woman»;
  - Exodus 27:11: «and + they will stand» → «and + pillars + its»;
  - «build» → «child» at "his sons" (Deuteronomy 2:33, 33:9, 1 Samuel 30:6);
  - «abolish» → «under» (2 Samuel 2:23, 3:12, 16:8; Job 9:13);
  - «archer» → «way + its» (Job 26:14, Psalms 10:5);
  - «charm(- er)» → «companion» (Ezekiel 37:16 twice, 37:19);
  - 1 Samuel 2:10: «unjust one» → «concerning»;
  - 1 Samuel 26:7, 26:11, 26:16: «more than + beginning + his» → «place of head + his»;
  - 2 Samuel 7:22: «The Lord» → «God»; 2 Samuel 20:8: «go up» → «over + it»;
  - 1 Kings 18:42: «bless» → «knee»; 2 Kings 9:25: «Shilshah» → «captain»; Ezekiel 12:14: «Ezrah» → «aid»;
  - Job 15:15: «sanctuary» → «holy [ones]»; Job 15:31: «shamed» → «worthlessness»; Job 38:41: «bear» → «a (male) child»;
  - Joshua 8:11: «consider» → «between + himself»; Lamentations 3:39: «bear the blame» → «sin + his»;
  - Obadiah 1:11: «be (horribly) afraid» → «gateway (entrance)»; Proverbs 22:25: «allowance + his» → «ways + his»; Psalms 58:8: «divide» → «arrow + his»;
  - Jeremiah 17:24: «Hephzi-bah» → «on + it»; Jeremiah 22:4: «they will serve» → «servant + his»;
  - Isaiah 27:2: «fermenting» → «delight»; Job 6:21: «without» → «no(t)»;
  - Ezra 4:7 and 4:23: a description → «Artaxerxes»; Numbers 2:12 and 10:19: «my rock is Shadday» → «Zurishaddai»;
  - a name for a word: «Tsepho» → «behold» (Isaiah 56:10, "his watchmen"), «Seth» → «apply» (Psalms 90:8). The right entry, but Strong's concordance's first rendering in alphabetical order.
- **Wrong before and after** (about 15):
  - «woe! to + him» → English Wiktionary's «which?» (Ezekiel 40:24, 40:26, 40:31, 40:37);
  - «transgress» → «to embezzle» (Ezekiel 40:31, 40:34, 40:37), where the word is "its steps";
  - «stripe» → «buffalo» (Ezekiel 40:36);
  - «city + towards» → «town» (Genesis 49:11, "his colt");
  - «from + Gaza» → «to dare» (Daniel 11:10);
  - «desire» → «abide» (1 Kings 21:29, "I will bring");
  - «arm (self)» → «to rescue» (Job 31:20); «be afraid» → «dread of + him» (Job 40:17, "his thighs");
  - «Most High» → «height» (Psalms 9:1); «tower» → «advance» (Psalms 18:51);
  - Genesis 13:3: «Oholah, a symbolic name for Samaria» → «Oholah», where the word is "his tent".
- **Worse, mildly:** «(here-)after» → «behind» at "after this" (1 Chronicles 20:4, 2 Chronicles 20:1, 24:4); rows of the entry pointed as the dictionary points them come back and sort first.
- **A pointer now leads** (task 137's class): 2 Kings 6:25 «plural indefinite form of יוֹנָה (yoná)», where «dove» stood; Psalms 9:1 «Masculine singular imperative of מֵת (mét).», where «kill» stood. Item 2 prints the map's resolution where the map holds one.
- **Credit only** (5): «Iddo» at "his hand" (Leviticus 9:22, 16:21; Ezekiel 43:26), «Hamonah», «Sharezer». Iddo is a name standing where the place is not one, live as well (the names gate's ledger).

Net: the gate now keeps the place's own entry at 936 untagged places, and the lines show it.

## Items 2 and 4 applied; the second pass (from 00:34Z)

- **Item 1's checks** (`tools/pipeline-8a.sh`, all 14 pass):
  - check-entry-gate-v1: E6, 60,028 keys and 1,170,258 verdicts agree, the lemma's included; E15 on the zone, 936 words; E15 on the page, Daniel 2:5's card withholds 7 of its 8 rows as another entry's, under H4405 and H4406; E12 picks a word with neither tag nor lemma;
  - the projection, the names gate, the pointing gate, the sign, the sense openings, the stems extension, the Masorah switch, the source switch, the names pill, the pointing grade, the read words, form-of and the rulings.
- **F15, dry, on item 1's lines** (`tools/f15-dry.mjs`): 6 faults, exactly the pointer lines: live's four «defective spelling of אליו» and item 1's two. The map resolves all six: «to, towards, into», «pigeon, dove» (2 Kings 6:25), «Dead, having died.» (Psalms 9:1).
- **Items 2 and 4 applied** (`tools/item2-pointer-line.py`, `tools/item4-suite-alone.py`). `tools/pipeline-8b.sh` then runs the round's page steps again, every resting line against live, F15 alone, form-of, the rulings and the entry gate, the whole suite under the new runner, and the gate.
- **A fault in the second pass, fixed:** the recorder's new wait on the pointer map refused the Tikkunei Zohar («the pointer map did not arrive»); the 39 other works recorded. The page asks for the map after its first paint. On a quiet machine the Zohar asks at 8.6 s and has it at 8.9 s (`tools/zohar-map.mjs`), and under the round's load that passed the 30 s the wait allowed. The wait is now up to three minutes; a Bible book's map is there within a second. The pass runs again from the lines step (00:40Z).
- **It failed again, and the cause is narrower.** Opened as the round opens it (a phone's window, every section built at once), the Zohar page never asks for the pointer map; with a desktop window it asks at 8.6 s. The leader item 2 resolves is the pointing's, which stands only on a work the lattice leads: the 39 books, not the Zohar. So the recorder now waits on the map only where it waits on the lattice, up to a minute. Open question for later: why the Zohar, opened so, never asks for the map (no line of it changes, since the map holds none of its keys).
- **The door refused the page** («zone.html itself carries Hebrew»): item 2's comment quoted the pointer's Hebrew. The comment now names it in English, and no changed file carries a Hebrew character. The pass runs again from the lines step (00:59Z).
- **The machine rebooted during the chain step (about 01:05Z)** after the lines were recorded whole: 40 records, the six pointer lines among them. `tools/pipeline-8c.sh` resumes from the chain books, two at a time (the round runs three), then the door, every resting line against live, F15, the checks, the suite (two at a time) and the gate. Each step that finishes leaves a mark, and a rerun skips it.

## The second pass (resumed 01:07Z)

- The chain books (986 s, two at a time; 632,114 links at rest) and the door passed.
- **Every resting line against live** (`logs/lines-diff-ship8.json`): 90 entries moved in 40 works, 5 of them credit only. These are item 1's 86 and the four live pointer lines, which now print what their pills print:
  - «to, towards, into (defective spelling of אליו)» at Ezekiel 9:4, 40:34 and 40:36 and 1 Samuel 22:13;
  - item 1's two: «pigeon, dove (plural indefinite form of יוֹנָה)» at 2 Kings 6:25 and «Dead, having died. (Masculine singular imperative of מֵת)» at Psalms 9:1;
  - English Wiktionary's «which?», at four of Ezekiel 40's "its pillars", is no pointer and stands (wrong to wrong, item 1).
- **F15 alone:** 85,602 resting lines at keys the map holds, in 40 books; no fault (six before item 2).
- **check-form-of-v1 failed on its own F14** («the pointer map did not arrive»): the map wait sat in `linesOnPage`, which a dozen checks share, and F12 and F14 hold the map back on purpose to judge a card opened while it is on its way. The wait now sits only where the round records the lines at rest (`readAtRest`), gated as before; the recorder reads 1 Samuel and the Zohar (`tools/rec-probe`, by hand). The lines need no new recording: on the recorder's path the wait is the same. The pass resumes at check-form-of (01:5xZ).
- **check-form-of-v1 passes** (173 s; F12, F14 and F15 among its laws).
- **The machine rebooted again (01:54Z), 26 checks into the suite**, all 26 passed. Reboots have come every 20 to 50 minutes under the browser checks' load, which is shorter than a whole suite. `tools/suite-resumable.sh` runs each check through the suite's own runner (`--only`, one at a time) and keeps each verdict on disk; a rerun skips every check that has one. The 26 passed are carried over. The gate follows the suite.
- **The suite, 02:55Z:** 142 of 194 checks judged, every one passed (two lanes; a fourth reboot at about 02:45Z, the lanes restarted and kept every verdict).
- **The suite, whole (03:23Z):** 194 checks judged in two lanes across one more reboot; 192 pass.
  - check-nothing-unlanded-v1 is red until landing, as on every ship.
  - check-press-paints-before-seen-v1 gave no verdict in 1,500 s beside the other lane. It took 1,257 to 1,263 s in ship 7's suite, so it sits near the limit. It reads lines with the page's own in-page reader, not the recorder, so the map wait is not in its way. Item 4's rule says it runs again alone; it is running alone now, under an 1,800 s limit.
- **check-press-paints-before-seen-v1 alone (19 November, 1,214 s): a real fault, not time.** Its L2 read Psalms 9:1 under STEP before the pointer map arrived, so the first paint held the pointer's own words, and the repaint printed the resolution. Since item 2 the map is an input of the line at rest, so a reader of the first paint as the line at rest waits on it. `pointerMapSaid` in `tools/resting-lines-v1.mjs` is now the one wait: the recorder (`readAtRest`) and this check use it. `linesOnPage` keeps no wait, since check-form-of's F12 and F14 hold the map back on purpose. The lines need no new recording; on the recorder's path the wait is the same. The check runs alone again, then the gate.
- **check-press-paints-before-seen-v1 passes alone with the shared wait** (4 laws, 1,125 s; L2 on Psalms included). The suite is whole: 193 of 194 pass, and check-nothing-unlanded-v1 is red until landing, as on every ship.
- **The gate** first refused at once: an expect file named `PIN.js`, my copying slip (the copy of ship 7's command was cut at 250 characters). It runs now with `PIN.json` (`tools/gate-8.sh`, from 23:22Z).
