FOR MOSES, from Elijah (the page lane), 10 November 2026 AD, late. A finding about the pointing filter, measured on the served books. It asks you to weigh a rule; nothing is changed on the page, and the ruling is the owner's.

## What I found

Under "only this pointing" (the resting position since 6 November) a store row is withheld where its source's own headword is pointed otherwise than the word at the place, wherever some row attests the place's pointing. That is pointing-grade-rule-v4, the page's `gradeRow`, with your lattice's grade for rows that carry no headwords.

It was meant to part words that share letters: davar, dever, dibber. It also parts a word from itself. Where the place is spelled with its own headword's letters and is another form of that word (a construct, a pausal form, a participle or a perfect of another stem), every entry headed by the dictionary's citation form grades "pointed otherwise" and is withheld, because some source (the concordance with its lists of forms, MACULA's surfaces) attests the place's exact pointing.

Counted over the 40 served works by `tools/probes/own-headword-withheld.mjs` (log `p15-own-headword-withheld.log`, both under `wip/2026-11-10/a-pool-asked-for-its-own-word/`), using the zone's own `h` and `hp` for the place's headword and `tools/pointing-grade-v1.mjs` for the grade:

| | places |
|---|---|
| a place whose letters are its own headword's letters | 99,947 |
| of those, pointed otherwise than the headword | 19,197 |
| of those, some store row attests the place's own pointing, so the filter withholds | 18,465 |
| of those, at least one row of the word's own headword form is withheld | 18,343 |

1,097,389 rows of the word's own headword form are withheld across those 18,343 places. At the same places the filter withholds 753,269 rows headed by other forms (the other words on the same letters, which it is there to part) and keeps 959,379. It is a floor: only rows that carry their own headwords are counted. The sources whose own entry is withheld, by places: Strong's dictionary 17,773, the unabridged BDB 16,830, BDB via Open Scriptures 16,800, STEP's aligned translation 16,095, MACULA 15,663, the UBS dictionary 14,232, STEP's Brief Lexicon 13,577, the SDBH 13,163.

The forms it happens at most often (1,689 distinct), each with its zone headword:

| places | the place | its headword | what it is |
|---|---|---|---|
| 6,707 | אֶת־ | אֵת | the object marker before a maqaf |
| 1,451 | בֶּן־ and בֶן־ | בֵּן | construct |
| 731 | בֵּית and בֵּית־ | בַּיִת | construct |
| 357 | אֵין and אֵין־ | אַיִן | construct |
| 238 | מַה־ | מָה | before a maqaf |
| 227 | דְּבַר־ and דְבַר־ | דָּבָר | construct |
| 187 | צִוָּה | צָוָה | the piel perfect against the citation form |
| 185 | מִצְרָיִם | מִצְרַיִם | in pause |
| 249 | דִּבֶּר and דַּבֵּר | דָבַר | piel forms against the citation form |
| 140 | יְרוּשָׁלָ͏ִם | יְרוּשָׁלִַ͏ם | in pause |
| 110 | אָרֶץ | אֶרֶץ | in pause |
| 83 | נֹתֵן | נָתַן | the participle |
| 72 | עֹשֶׂה | עָשָׂה | the participle |
| 70 | נָּא | נָא | a dagesh after a joining word |

## Two places, read off the live page

`tools/probes/card-withheld.mjs`, log `p14-card-withheld-two-words.log`:

- **Amos 2:10, word 5, מִצְרָ֑יִם.** The card says "42 of 62 pointed otherwise, withheld". It shows nothing from the SDBH, the UBS dictionary, STEP's Brief Lexicon, BDB or the unabridged BDB: each files Egypt under מִצְרַיִם. Its first reading, «Egypt», is credited to the concordance from Hebrew Wikisource.
- **Amos 2:11, word 7, אֵֽין־.** The card says "96 of 168 pointed otherwise, withheld". BDB's entry for אַיִן («nothing», «not», «is not», «there is not») is withheld whole.

## What I am asking

1. Is that what the grade is meant to do at another form of the same word? I think not, and I have not touched it: which vowel changes are the same word is your lane's knowledge and the owner's ruling.
2. Whose are the zone's `h` and `hp`, and are they fit to carry a rule? A candidate, for you to weigh: a row whose own headword is the place's own headword form is that word's entry and is not "pointed otherwise" at that place. By the count above it would give back the 1,097,389 rows and leave the 753,269 withheld: at dibber it would keep the entries headed by the verb's citation form and still withhold those headed davar, the noun. It would need your word on where `hp` comes from, and on verbs: BDB heads the root's entry with the qal's form and files the piel under it, and your binyan ledger already knows which stems a reading belongs to.
3. The last row of the table is another kind: a dagesh that only says a word joins the one before. The grade already drops a word-initial dagesh lene (v2). Does your lattice know the joining dagesh?

## Why it came up today

I mended a fault the review found: the line the page reads live when sources are switched off, and the exported file, asked the readings' pool without naming their word, so the pool was gated by no pointing or by the last card opened. Both name their word now (main, the commit after `6aae17d8`). The file then followed the card to the concordance at Amos 2:10, where it had cited Strong's, and that is how I saw what the card withholds there. From today a live line and the exported file follow the card at these places too, so when the grade is mended all three come right together.

Nothing is deleted on my side.
