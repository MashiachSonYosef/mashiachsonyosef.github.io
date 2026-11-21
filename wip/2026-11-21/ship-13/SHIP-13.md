# Ship 13: the lattice relays, v208 and v192.1 (begun 21 November 2026 AD, 10:35 UTC)

Page lane (Elijah). The tree: `S/s13`, branch `ship13`, a working tree of ship 11d as shipped (`main` 340cff8e3b). Applied by one script, `tools/apply-13.sh`. **Not shipped yet**: this is the record as it is built.

Both relays were fetched read-only, each file hashed against its letter (all match), and read in full.

## What the two relays give

**v208, a delta over lattice v12** (no new lattice): three lists keyed to the lattice's own lines by book, position (j) and entry.

1. *Names this verse, widened* (257,213 lines). Lattice v12 read only TAHOT's verses, passed over TAHOT's 21,917 rows whose verse carries a second number, and read none of MACULA's. The list gives each entry that gains a name its whole list of the cards that name the verse.
2. *The grade against pointing grade v5* (48,379 lines). Each card the page's rule grades otherwise than the lattice did, with both grades.
3. *The places STEP gives no tag* (1,159 lines), with the entries of MACULA's lemma as the lane reads them from this lane's rule.

**v192.1, an amendment to the read words** (relay v192): every line names its place's own word number; at Psalms 10:10 the piece TAHOT spells otherwise carries the edition's letters; and one more list, the tag a lattice piece lost (Genesis 14:17, where TAHOT writes its mark inside the word).

## What lands

| | where | what a reader sees |
|---|---|---|
| the names | the projection reads a listed entry's list in place of the lattice's | only under the order «cites here»: more readings count as naming the verse |
| the grades | each listed card carries the page's grade in the sidecar | nothing today (below) |
| the word places | each read word's place is held to its own word number | nothing; a proof |
| Psalms 10:10 | the hold of 15 November is lifted: two tags, two pieces | the line reads the place's own pieces |
| Genesis 14:17 | the projection reads the lost tag as the piece's own; the zone's piece takes TAHOT's words | «Chedorlaomer» becomes «Kedor-laomer», STEP's words for the place |
| the source corpus record | emitted again from the corpus lane's ledger as it stands (task 152) | nothing; it names fifteen refused sources where our copy named three, and the store cites none |

## Measured before the round, every book projected into scratch (`tools/try-all.sh`)

- All 39 books project with no refusal. **Names:** 257,206 of the 257,213 lines applied, 339,507 names added. The other 7 lines are for the lattice's own span cards, which this projection does not read. **Grades:** 48,379 lines; 24,587 applied at a surface's first verse (262,112 cards), 23,792 more at later verses of a surface graded already, each proved to name the same cards.
- **The only leader that moves is the one under «cites here»** (`o.c`), at 115,930 surfaces. The leaders under «masoretic», «vowels differ» and «only this pointing», the alternates, the name's lead and the leaders at each kind of place are the same at every surface of every book.
- **The grade list moves nothing on the page today.** A row is graded by its own source's headwords, and falls to its card's grade in the lattice only where it carries none. Of the 352,564 rows under Genesis's keys, 0 fall. So the list makes the fallback right and changes no reading.
- The sidecars grow from 30.12 MB to 31.18 MB over the 39 books.

## Two things the lists taught me

- **The two lists write `surface` differently.** The names list writes the position's whole surface, both halves at a place written one way and read another. The grades list writes the entry's own half. Each is proved as it is written. Put to the corpus lane.
- **Under «cites here» a reading is credited to its oldest carrier, which may not be the source that names the verse.** At Genesis 1:2 «deep» leads now, because MACULA reads it there; the pill is one pill for every dictionary that prints «deep», and its credit is the oldest of them (BDB). That is the page's standing rule (one reading, one pill). Before the list only STEP's readings named a verse, and STEP's wording is rarely another dictionary's, so it did not show.

## Measured and not landed: the third list's lemma

The list names a lemma at 105 plain words my zones give no headword at all (the places our text spells otherwise than the text MACULA follows), so those places are asked no entry. I taught the projection to read the entries from the lattice's own lemma there and measured it (`not-landed/`):

- the reading that leads stays at 73 of the 105 and moves at 32, **mostly for the worse**: Genesis 19:20 «and/ she» to «and/ he»; Esther 4:1, Ezekiel 29:18 and Nehemiah 9:37 «great» to «loud»; Deuteronomy 28:59 «large» to «elder(-est)»; Jeremiah 2:20 «fetters/ your» to nothing.
- Why: a row of the place's own entry stands whatever its points, and these places carry no pieces of their own to lead, so the oldest row of the entry leads (the concordance's list of every King James rendering).

So it is taken out. An entry alone does not make the line right at a place with no pieces; the place's own pieces do. Those are the spelling bridge's remaining 794 places, already asked of the corpus lane (ask D of 21 November). The pin says this in its own words.

Where a zone does carry a headword the two readings agree: the same entries at 931 places, none on either side at 63.

## The checks

- `check-lattice-delta-v1`, new, four laws: D1 the pin and the receipts; D2 every sidecar says the delta it was read with and the books' lines are the lists'; D3 with the lattice and the lists on the machine, each graded surface carries the lattice's grades with the delta's line applied, and the counts are a recount's; D4 the third list lands nothing and is read beside the zones.
- `check-lattice-projection-v1` L4c reads a listed entry's names from the delta's list, place by place.
- `check-entry-gate-v1` E7 reads a lost tag as the lattice piece's own.
- `check-read-words-v1`: R1 the amendment's receipts and every line's word place; R3 the word found is the one its word place numbers; R5 the zone's record names the amendment and its lost tags; R9, new, the lost tag's place on its zone and in the record of the lines at rest.
