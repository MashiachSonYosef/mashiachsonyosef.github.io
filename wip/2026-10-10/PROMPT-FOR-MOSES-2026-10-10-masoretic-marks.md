From Elijah (the serving lane), relayed by the owner, 10 October 2026 AD. A request for a new ledger: the Masoretic marks.

The owner's words, all of 10 October: "im actually right now leaning toward making all masoretic marks gold"; on numbering the words, "maybe we even number every word ... im not against it" and "id only count the hebrew words"; and on the color of a number, "if we follow masoretic numbering it could be gold by logic". The owner has not ruled on either yet; mockups are in front of the owner now. This ledger lets the page draw whatever the owner rules from data the lane has checked, instead of from guesses about Unicode.

## What the page serves today

- The MAM text as the zones carry it: one printed word per place, its string s, on the place axis your HUD record v1.2 and piece-blob ledger v1.3 use (305,431 places).
- The page keys every definition on the letters. Its "the pointing" switch lets a reader keep the pointing, make it the gate, or lift it inside the card, but the Hebrew on the page is never recolored or changed.
- Today every word is one color, the red, letters and marks alike.

## What the ledger should give, per place

1. **Every character of s, classified, with nothing left over.** Each character is a LETTER (U+05D0 to U+05EA) or a mark. For each mark give its codepoint, its byte and character offset in s, the letter it sits on, and its class: VOWEL, DAGESH, MAPPIQ, SHURUQ, SHIN_DOT, SIN_DOT, RAFE, METEG, SILLUQ, ACCENT, MAQAF, SOF_PASUQ, PASEQ, LEGARMEH, UPPER_DOT, LOWER_DOT, INVERTED_NUN, MASORA_CIRCLE, QAMATS_QATAN, HOLAM_HASER_FOR_VAV, and any class the text needs that this list lacks. For an ACCENT give its name and whether it is conjunctive or disjunctive.
2. **Where one codepoint is two marks, the class decided from the text, with how it was decided.** U+05BC is a dagesh, a mappiq or a shuruq. U+05BD is a meteg or a silluq. U+05C0 is a paseq alone or half of a legarmeh.
3. **The letters the scribes set apart,** each flagged on its own axis: large letters, small letters, suspended letters. They stay letters; the flag lets the owner rule on them apart.
4. **The paragraph marks and empty verses** the page draws (petucha, setuma), each as its own entry at its place.
5. **The Masoretic word count of every verse.** Give each place its number in its verse as the Masoretes counted words, and the verse's total, with the source for that convention. Above all, say how two words joined by a maqaf are counted, one word or two, with the evidence (the Masorah's own tallies, or the edition's statement). If traditions differ, give each as its own axis and say which one the lane would take.
6. **Counts,** each on its own axis: marks by class, per book and in all; letters; words per verse; the shelf's words under each counting.
7. **The license of the marks, in the edition's own words.** The page's source line credits "Masorah · CC-BY-SA 4.0". Say what the edition's license statement covers, the marks alone or the whole text, quoted with its file, line and byte.
8. **The tie.** At every place, the letters and marks in offset order rebuild s byte for byte, and no character is unclassified.

## How the page will use it

- Color: whatever the owner rules (for example, letters red and every mark gold, or vowels gold and accents a dimmer gold) is drawn from the class of each character, never from a codepoint range.
- Numbers: one faint number per printed Hebrew word, by verse, under the Masoretic count. The pieces inside a word are shown by its blob and get no number on screen. The export and screen readers will carry them in text.
- Nothing is drawn from this ledger until the owner rules. Candidate only, as ever.
