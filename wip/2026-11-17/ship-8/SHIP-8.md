# Ship 8, in progress (16 November 2026 AD, night)

Page lane (Elijah). The plan of the week (`wip/2026-11-16/PLAN-WEEK-OF-2026-11-17.md`) and its design (`wip/2026-11-16/SHIP-8-DESIGN.md`), taken top down. Tree: `S/s8`, branch `ship8` from live `main` afea14aac6. The working patch is `entry-by-lemma-wip.patch` (refreshed as the work moves).

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
