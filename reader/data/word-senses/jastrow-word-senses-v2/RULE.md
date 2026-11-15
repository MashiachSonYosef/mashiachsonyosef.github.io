# RULE — Jastrow's bracketed word senses v2: the bare twins, and where the legend holds

Written 14 November 2026 AD, before the builder. Corpus lane (Moses). v2 is v1 (`../jastrow-word-senses-v1/RULE.md`, read it first) with the amendments below; every term and branch of v1 stands unless an amendment says otherwise. Nothing served is changed.

## Why v2

The serving lane wired v1 on 14 November (letter `FOR-MOSES-2026-11-14-word-senses-wired.md`, kept read-only in `../../moses-elijah-asks-2026-11-14/inputs-r1/`) and asked three things:

1. "Could you send the 2,479 ONLY_SENSE_NOTES rows by key, rank and m id, in the same shape as cards-with-an-aside? Until then the legend is not shown anywhere." It shows the legend meanwhile on 3,328 rows, by its own rule: the def field holds exactly one "["; a WORD_SENSE row is listed with the same key, m id and def field; no row of the cards with an aside has that key, m id and def field. "If any of the 3,328 should not carry the legend, the list asked for in section 2 settles it, and the page will follow your list instead."
2. "The bare twins (456 rows, 428 keys). Your overlay serves a bracketed note twice: a row whose def field is the entry with its bracket, and a twin whose def field is the route itself, same key and m id. Where you found the note in the record (PLAIN_NOTE, NOTE_WITH_MORE) you list both twins. Where you found it by the def field (ITS_DEF_FIELD) you list only the bracketed row, so its bare twin stood at rest as a blue definition... Could v185.2 list them as WORD_SENSE, or say why not? Every one of your 456 ITS_DEF_FIELD senses has exactly one."
3. "A further 46 unlisted rows repeat a listed word sense's words under the same key, with def field = route, but under another of Jastrow's m ids... Are they word senses?"

## Amendments

**A1. The bare twin.** A row is WORD_SENSE, found DEF_FIELD_TWIN, when it has no record; when a WORD_SENSE row found by ITS_DEF_FIELD stands under the same key and the same m id; when its route is the same as that row's route; and when its def field, the text compared, is its route. Its def field shows no bracket, so it is found through its twin, never alone. In v1 the twins of a note found in the record were already listed, because they have records too.

**A2. A def field's words outside its brackets.** A row found by ITS_DEF_FIELD stays WORD_SENSE only when its route is not the same as any piece of its def field outside the brackets, the pieces being the def field with every bracket taken out and then cut at every comma, semicolon, full stop and round bracket, each piece then text compared. Where it is the same as such a piece, the words stand in Jastrow as a definition too, and the row is NOTE_WORDS_ALSO_A_WORDING, as v1 says of a row with a record. (A first look found eight rows whose words stand inside a longer piece, like «equal to one hundred common or fifty sacred shekels»; those are not the same as a piece, and stay word senses.)

**A3. The rows of another m id.** *Superseded by A5 before any run was shipped.* A seat of the lane traced the serving lane's 46: they are 46 pairs of 31 rows, each a row beside a listed word sense of the same words under another m id; 13 of the 31 are already bare twins (A1), and every one of the 31 is a bracketed note in the entry its own catalog card was made from. The same trace found that v1's way of reaching a row's entry, by its headwords, misses rows whose headwords are another form of the word (a plural, say) or reach another entry of the same letters, or that carry none. So A5 reaches every row's entry through its own catalog card, and the rows of another m id are found that way with all the rest.

**A5. Through its own catalog card.** v1 reached a row's entry by the letters of its headwords (term 7), so a row whose letters reach the wrong entry, or none, was misread. The catalog names the entry. A5 reads through its own catalog cards every row that v1's ways and A1 leave NOT_A_BRACKET, and every row that v1 put in NOTE_WORDS_ALSO_A_WORDING or ASIDE_WORDING by the records its letters reach. (A word sense v1 or A1 found stays one; check 6 holds every one of them to its cards.)

A row's cards are the catalog rows of Jastrow (`m_source_key` sefaria_jastrow_1903) whose key (trimmed), route, source label and licence pointer are the row's, and whose definition text (`d_exact_text`) is the row's def field, the text compared. Each card's pointer (`cit_local_pointer`) names the entry (`rid`) and the sense (`sense`, or `grammar` with `definition`) it was read from; a sense is every definition under it. A card is:
- a NOTE when the row's route is the words of a sense note of that sense, and stands as a wording nowhere in that entry;
- a NOTE AND WORDING when it is a note's words there and stands as a wording in that entry too;
- an ASIDE when it is not a note's words there, is an italic element inside an aside of that sense or a later italic inside a note WITH_MORE, and stands as a wording nowhere in that entry;
- otherwise NONE.

The wordings are those of the entry the card names, not of every entry of the same letters as in v1's term 7: an entry of the same letters is another word, and its wordings say nothing of this one's note. Jastrow's עָלַם II brackets «to surround, tie up» as II's sense ("v. preced."), and עָלַם I gives the same words as its definition: a row read from II is a word sense, a row read from I a definition. The receipt counts the rows the reading of every entry of the letters would class otherwise.

The row is then WORD_SENSE, found THROUGH_ITS_CARD, when every card is a NOTE; NOTE_WORDS_ALSO_A_WORDING when some card is a NOTE or a NOTE AND WORDING and not every card is a NOTE; ASIDE_WORDING when every card is an ASIDE; otherwise NOT_A_BRACKET. A row with no card, or with a card whose entry or sense cannot be found, is counted and stays as it was. A row v1 classed by its letters takes the branch its cards give, NOT_A_BRACKET included, and the receipt lists each such row with the entry its card names.

**A4. Where the legend holds, row by row.** Every row of the overlay whose def field holds a "[" is listed in `legend-cards-v2.jsonl`, with its key, rank, m id, route, def field, records, and one class, in this order:
- ONLY_SENSE_NOTES and SOME_ASIDE, as v1 matched them to a sense of their records, or, where none of their records matches, to a sense their own cards were read from (A5), matched the same way; the legend holds on the first and not on the second.
- BY_THE_LIST: not matched to a sense, and the serving lane's own rule holds of it: its def field holds exactly one "[", a WORD_SENSE row is listed with the same key, m id and def field, and no SOME_ASIDE row has that key, m id and def field. The legend holds.
- NOT_MATCHED: every other. The legend is not shown.

The row's class is the lane's answer to "where the legend holds". Beside it, the receipt sets the serving lane's 3,328 against it, row by row, and names every row on one side only and why.

## Checks, each a hard stop

1. As v1's check 1, for v2's branches.
2. Every DEF_FIELD_TWIN has exactly one twin found by ITS_DEF_FIELD, and every ITS_DEF_FIELD row has exactly one twin.
3. Every row of v1's lists stands in v2's with the same branch, or with the branch an amendment gives it, named in the receipt.
4. The second count agrees: the twins counted again from the rows by another loop; the notes found in the record counted again from the records, as v1's second road does; the rows found through their cards counted again from the other end, from every sense note of every entry to the cards read from that sense and so to their rows.
5. No path of this machine and no name of its owner stands in any file written.
6. Every word sense v1's ways or A1 found is, on every card it was read from, a NOTE.
