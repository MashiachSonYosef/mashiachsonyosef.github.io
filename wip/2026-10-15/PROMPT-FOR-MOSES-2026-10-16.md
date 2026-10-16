From Elijah (the serving lane), relayed by the owner, 16 October 2026 AD, evening. The owner: "i really really want blobs and compspans and megacompspans to be right, even if a ton are empty. and by the end of the week underlining too"; and tonight: "hopefully you get how its all formulaically rule based. you dont need a single english definition to have the compspans. i want to see us move away from this default is outside the system mentality ... each piece in the + sign is RMD (r pill, M license, D definition)". Item 0 is the current work, a real version of the underlining; item 1 is what the RMD rule asks of the lane; the rest ride behind.

## 0. The span store: a real version of the underlining

The owner's rules, verbatim: "an underline is one license defining both words"; "a double-word underline stands only where a single license defining both words stands under it"; "the weld of a non maqaf is not something we do"; of the HUD record's named spans, "the data is wrong lets leave it out for now"; "i kings, right, 2 words separate im sure often gets 1 license"; "right, no +, in fact basically the opposite of most compspans". So the page draws no spaced run today, and the sixteen Bethlehems the lattice kept are out with the rest.

**What a span is.** One dictionary entry whose headword is the two or more words as one thing. If no entry defines the span, there is no span. Nothing stitched from each word's own reading; nothing admitted because an entry mentions the pair in passing; no welded spelling for spaced words; a weld or fold only where a dictionary printed it, and only across a maqaf.

**One row per span, in the route store's own row shape**, so the page reads a span exactly as it reads a word:

- slot 1, the reading: the R pill ("Bethlehem", "therefore")
- slot 2, the entry's text: the D
- slot 3, the source's m id: the M, one the served admission keeps, with its license
- slot 4, the wording year
- slot 5, the cut flag, always 0 for a span: the reading is the entry whole, never a piece cut out of it
- slot 6, the source's own pointed headwords, as the v2 store carries them
- one added slot, the gap as the source writes the span: maqaf, space, or none

**The key.** The span's letters with the gap as the text writes it, maqaf or space. A span the text writes with a maqaf keys with the maqaf; a spaced span keys with one space; the same entry stands under both keys where the text writes it both ways.

**Where it stands.** A places file per book: every place the span's letters stand in the text, by byte match of the consonants, one line per place with the verse and the first and last word numbers, and a count per book. A span does not cross a verse end, and it stands straight on the ink, no prefix letter in front of its first word.

**The first set, before any other family.** The catalog's own multi-word headwords, the 4,477 the store dropped (3,375 clean), strict position only: names first (Bethlehem, ben-Hadad, En-dor, Eben-ezer, Kiriath-jearim, Baal-zebub), then the set phrases (al-ken "therefore"). I Kings is the model: two words, one license, no "+", one blob over both.

**What Elijah checks on arrival.** Every key answers in the store. Every m id resolves to a source with a license. Every place line matches the text byte for byte. A span on a maqaf chain agrees with the chain's as-written rung or is marked as the entry's own spelling. On a verse the owner names, the span reads one line, one blob, one card, with the entry's D under it. The page's rule is already in place and waits only on the rows.

## 1. Each piece of a compspan is R, M, D

The owner: "each piece in the + sign is RMD (r pill, M license, D definition)"; "you dont need a single english definition to have the compspans"; "move away from this default is outside the system mentality".

Today the page divides a word by the compspan ledger where the form has a row, and by TAHOT's pieces at the place where it has none; and the English under a piece the reader has not ruled is TAHOT's piece gloss painted as text, or the store's first reading for the piece's letters alone (the vav reads "describe"). Neither is a pill with a license and a definition behind it. Asked:

- **The division by rule for every form**, in the ledger's served table: the three- and four-piece divisions and the suffixed forms the served table omits today (two-piece rows only), so that no division on the page depends on an English gloss being present at the place. The rule itself, stated once, so the page can say it.
- **A route row per piece per place**: for every piece of every divided form at every place, the piece's reading as a row of the store (slot 1 the piece's English, slot 3 TAHOT's or MACULA's m id with its license, slot 2 the record's text, slot 5 set where the reading is a piece cut out of a whole-word record), keyed by the piece's letters with the place (book, verse, word, piece index), so the line under an unruled piece is a pill the reader could have pressed, ranked first under "at this place", with the dictionaries' own rows for the piece's letters standing after it.
- **The sign pieces** ("<the>", "<obj.>") as rows too, marked as signs, so the page can show or hide them by the signs switch without leaving the system.

**What Elijah checks on arrival.** On Genesis 1:1-2 and Malachi 2:5 the line under every divided word can be rebuilt from rows alone, piece by piece, each piece with its M and its D; no piece reads the letters' generic first word; a reader pressing any piece sees the same row the line reads, lit.

## 2. The article as its own piece inside a chain

Genesis 1:4, את־האור. The card's blocks are the chain's words, את and האור; the article is not offered as a piece. The owner: "i think we missed compspans or megacompspans. wouldnt 'the' be considered its own potential R pill definitional". On a lone word the division exists (השמים reads "the + heavens"); inside a maqaf chain the word's own division is not reached. Asked: the compspan division of every word of a chain, carried into the chain's card as pieces (את + ה + אור), with the pieces' English, keyed by place.

## 3. The English reader's word order, as a ledger

The owner, 14 October: "i think the maqaf flip is happening everywhere"; "maqafs are like reverse unos"; of ואל־כל־אשר (Joshua 1:16), "the middle maqaf would indeed just stay in the middle so obviously joshua the son of nun ... is how it should read"; and that he wants "actual rules". The page now reads a chain's English left to right in reading order (to | all | Israel) and keeps the chain's Hebrew as written. Asked: the word order ledger (relay v70) checked against these rulings and re-issued where it differs: english_reader_pieces in reading order with no reversal at a maqaf; a card's words ascending; and a list of every place the rule changes a display, so the page can compare.

## 4. The possessive hop

The owner: לביתך "to + house + your" reads "1 3 2"; על־משמרתי "appears to want to say at + my + post, although uniform rules applied could be argued should be kept at + post + my"; ועד־מבואו "'its' in english would come first eventhough technically the hebrew asks it to come second". The page hops a piece whose English is exactly my, your, his, her, its, our or their before the piece it follows, in the English reader only. Asked: the class of every suffix piece (possessive, object, subject), so the hop rests on the lattice and not on the English's spelling; and your reading of the open question, uniform order or English order, with the count of places each way.

## 5. What "source suggested" means

The owner: "what does the source recommended even mean"; and, of the line, "if most of the ones showing right now are all pieces of the word like A+B rather than the AB definition i wonder if that isnt because of how we influenced the system prior to adding the toggles". The page forces the BSB's whole-word cell onto every card as "source suggested". Asked: one page, in plain words, that says what the source-suggested ledger (relay v63, v1.1) is and is not: whose English, at what grain (the whole word in its sentence), how a place is matched, what the held list means; and, for the line, how many places read a division (A + B) against a whole-word reading (AB) under the served order, so the owner can see whether the division keys served first are steering it.
