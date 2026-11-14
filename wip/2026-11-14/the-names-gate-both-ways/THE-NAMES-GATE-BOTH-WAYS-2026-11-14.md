# The names gate both ways (Rimmon, H5884): measured, and put back

14 November 2026. Page lane (Elijah).

The owner's call 12 of 13 November, answered on 14 November with «just go with your recommendations its fine». The recommendation was: measure first; ship if the gate both ways is narrow and right, else put it back to the owner. It is not narrow, and as it can be built today it would not reach the row that raised it. Nothing on the page moves.

## What was asked

The names gate (ruling 8, relay v177, `names-gate-rule-v1`) withholds a row its own source gives as a name where the word on the page is not a name. It does not do the converse. Rimmon raised the converse: at the place in southern Judah (H5884, Nehemiah 11:29, «En-rimmon»), once BDB's openings became notes, the row that leads under "oldest first" is «a small explosive bomb thrown by hand or fired from a missile».

## What was found

**1. Rimmon's row is from a source nobody has read for names.** The bomb row is Hebrew WordNet's (M43, 2006, the gloss of the grenade's synset). The corpus lane read 27 m ids for names, from seven source keys: the UBS dictionary, the SDBH via HiperBiblia, Classical Hebrew Words, English Wiktionary for Hebrew and for Aramaic, and Wikidata's two Hebrew lexeme sets. Hebrew WordNet is not among them. A gate both ways can only withhold a row its source says is not a name, so it would leave this row where it is.

The line at rest is not the bomb. The place has TAHOT's own reading, «Rimmon», and that leads at rest (`data/resting-lines/nehemiah.json.gz`, 11:29, word 2). The bomb leads only when a reader chooses "oldest first"; otherwise it is one pill on the card. (Sidecar `nehemiah.lattice.bin`, surface רִמּ֛וֹן: at a place of H5884 that is a name the leader is M43's bomb and the alternate is Classical Hebrew Words' «Rimmon (pr.n.div.)», M23, 2026.)

**2. The narrow converse is broad.** Read narrowly, the converse says: at a name place, withhold a row from a source read for names that the lane did not list as a name. Measured on the store and the zones (`logs/n01-…`):

| | row × place | name places | distinct rows |
|---|---:|---:|---:|
| name places on the pages | | 34,453 | |
| rows of the key at a name place | 1,221,099 | | |
| the narrow converse, every row of the key | 123,887 | 16,645 | 11,584 |
| the same, after the entry gate's own withholding | **65,627** | **16,319** | **6,961** |

The pointing and stem gates are not applied in these counts, so they are upper bounds. Still, the converse would act at nearly half of all name places. By source, after the entry gate: English Wiktionary 38,917 (M25 20,715 · M13 14,832 · M11 3,370), Classical Hebrew Words 11,845, the SDBH 4,599, UBS 4,062, Wikidata 4,985, Aramaic Wiktionary 1,219.

It also can't be built exactly yet. The lane counted 22 rows that are partly a name (M17 9, M23 5, M13 4, M18 4) and 4 rows it could not reach (M60 2, M25 1, M72 1), but did not list them. A gate built from the list of name rows alone would treat those 26 as not names, and withhold them wrongly.

**3. The broad converse is not an option.** Read broadly ("at a name place, withhold any row not listed as a name"), it would also reach the 971,014 row × place pairs of the sources nobody read for names. Their own names would go with them: Strong's «Jehovah», «Mosheh», «Jehudah» and the like (`logs/n02-…`: 23,456 name places are led by a reading no listed name row prints, while a listed name row stands on the key; 23,334 of those leaders have a carrier from a source not read for names).

## Put back to the owner, with a recommendation

- **Keep the gate one way**, as it stands.
- **If Rimmon's kind of row should go**, the narrow road runs through the corpus lane. The lane would read Hebrew WordNet for whether each row is a name or a common word (WordNet keeps a proper name as an instance of its class, so the grenade's synset reads as a common noun), and list the 22 rows that are partly a name and the 4 not reached. Then I would measure the converse again, limited to rows their own source marks as a common word, before anything is built.

## Files

- `tools/names-gate-both-ways-reach.mjs`: the narrow converse's reach, before and after the entry gate, by source and by key.
- `tools/name-places-led-by-a-common-word.mjs`: name places whose leader no listed name row prints, while a listed name row stands on the key, by the leader's carriers.
- `logs/n01-names-gate-both-ways-reach.txt`, `logs/n02-name-places-led-by-a-common-word.txt`.

Both tools measure the reference tree (`main` at 044a49ddfc); they change nothing.
