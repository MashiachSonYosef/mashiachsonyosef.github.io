# RULE — where the stroke stands in a place written one way and read another (paseq place v1)

13 November 2026 AD. Corpus lane (Moses). Written before the builder, so a second count can be made from these words alone. It mends a defect of the lane's own, named to the serving lane in relay v167 (10 November): at 16 verse lines the paseq stands away from where the edition writes it.

## The defect

Restore v5 (5 September 2026 AD) made every scribal mark its own position, as the owner ruled (rule 11: the paseq is its own INKOFF C0). Where the edition writes a paseq inside the read form of a place written one way and read another, v5 lifted it out of the place and stood it after the whole place (`moses-tanakh-mam-restore-v1/restore-mam-apparatus-v5.mjs`, lines 129 to 132). Successor streams v3 and lattice v12 carry that order. Where the read form has two words and the edition writes the stroke between them, the stroke now stands after both. Where the edition writes the read form before the written form, the stroke now stands after the written form too. A build may not move the edition's order.

## The mend

The stroke stays its own position, as rule 11 has it. Its place is the edition's: inside the read form, after the read word the edition writes it after. No word place, count or key moves.

This list carries the edition's place for every such stroke, keyed to the positions lattice v12 serves and to the word place, so a print can set the stroke where the edition writes it. The next reissue of the restore, the streams and the lattice stands it there itself.

## What is read

- **The edition**: Miqra according to the Masorah as the Sefaria dump of 14 July 2026 AD holds it: `texts.bson`, read with the dump's own tool (`bsondump`), the first document of each book whose `versionTitle` is "Miqra according to the Masorah", as restore v5 reads it. The file is checked against the dump archive its acquisition manifest lists (check 5).
- **A site** is listed when the inside of a `<span class="mam-kq-q">` (a read form) holds the stroke, the character U+05C0. Its **read words** are that inside with its tags taken out and its entities read (`&thinsp;` is the thin space U+2009, `&nbsp;` a space), the stroke set apart, the brackets dropped, cut at whitespace (the thin space counts), empty pieces dropped. The stroke **follows read word k** when k read words stand before it.
- **The order of a site**: `k_then_q` when its written form (a `<span class="mam-kq-k">`) stands before its read form, `q_then_k` when after.
- **Restore v5**: the book's rows (`candidate-v5/mam-<book>-restored-v5.csv.gz`); the site is the verse's row with kq 1 whose qere is the read words joined by a space; the stroke is the row after it.
- **Lattice v12**: the book's positions (`moses-lattice-ledger-v1/candidate/positions-<book>-v12.jsonl.gz`); the site is the verse's ON position whose surface is the restore row's. Where a maqaf joins a word to the site, the lattice cuts the row in parts that share one `i`, each naming the row as its `maqaf_part.source_token`: the site is then the part that holds the read bracket. The stroke is the position after the site's last part, OFF, of kind PASEQ. (This sentence was amended before the builder first ran, on a look at Daniel 9:12 and Nehemiah 2:13.)
- **The word place**: the word numbering (`moses-word-numbering-v1/build/numbering-v1/<book>.jsonl`), the verse's line whose `s` is the lattice site's surface; its address `C:V.W` is written `C:V:W`.
- **The streams**: the verse's line of `moses-tanakh-successor-streams-v3/candidate/text/<book>.txt`, and of v2 beside it (v2 was cut from restore v4, which kept the stroke where the edition writes it, glued to the word before).

## The line

One line per site, in the order of the 39 books and then of chapter and verse: `book`, `ref`, `place`, `order`, `read_words`, `the_stroke_follows_read_word`, `class` (`CLOSES_THE_READ_FORM` when it follows the last read word, `BETWEEN_TWO_READ_WORDS` otherwise), `edition_html` (the site as the edition writes it, from the opening of its first form to the close of its last), `lattice_v12` (`site` with `i`, `j` and `surface`; `stroke` with `i` and `j`), `the_lattice_moved_it_past` (`read_words`: how many read words stand between the edition's place and the lattice's; `the_written_form`: true when the written form does), `prints` (the site with the stroke in its place, set off by a space on each side as the streams set every scribal mark, inside the read form's bracket), `stream_v3_line` and `stream_line_in_place` (the v3 line with the site printed so, and no stroke after it).

## Checks the builder makes, each a hard stop

1. Every site is found once; restore v4 holds the same sites (a row with kq 1 whose qere holds the stroke), and restore v5 stands one stroke row right after each.
2. The site's read words are the restore v5 row's qere words; the lattice holds the restore v5 row as the site (its surface, or the source token of its parts), and its next position after the site is the stroke.
3. `stream_line_in_place` and `stream_v3_line` are equal once the stroke and every space are taken out of both, and `stream_line_in_place` and the v2 line are equal once every space is taken out of both.
4. The read words in `prints`, in order, are the site's read words, with the stroke after word k.
5. `texts.bson` is the bytes of the member `./dump/sefaria/texts.bson` (the name as the archive writes it, with its leading `./`; amended after the builder's first run) of the archive the acquisition manifest lists, and the archive is the bytes the manifest lists.

## The second count

`verify-paseq-place-v1.mjs`, by the same hand and another road:

- it finds the sites from the streams alone: the v2 and v3 lines that are equal once the stroke and every space are taken out, and not once only the spaces are; and reads from the v2 line the read word the stroke follows;
- it reads the Leningrad Codex as tanach.us renders it in the same dump ("Tanach with Ta'amei Hamikra", public domain, extracted verbatim in `moses-wlc-count-v1/source/taamim/`), a different edition that brackets each read word apart, and finds at each site the read word the stroke follows and, where the stroke does not close the read form, the read word after it, each by its letters. The two editions may cut a site differently, so the words are held, not their count (amended after the second count's first run, which held the count and so read Jeremiah 48:20, two sites of one word each in the Leningrad Codex, as a difference);
- it must find the same sites and the same read word as the builder at every site. Where the Leningrad Codex reads otherwise, the difference is named, since two editions may differ.
