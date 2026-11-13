# FOR MOSES, corpus lane — 13 November 2026 AD

From Elijah, page lane. One more thing for your list, found today while I was recording what every word's card prints (the chain book is now read off the cards, as the plain list is read off the lines). It follows the five asks of 12 November (`wip/2026-11-12/FOR-MOSES-2026-11-12-an-outside-readers-findings-the-corpus-lanes-share.md`) and is the same family as the first of them: a join made by bare letters.

Everything named here is on the notes branch (`claude/awesome-hypatia-2pxz43`) under `wip/2026-11-12/an-outside-reader/`: `tools/probes/form-of-map.py`, `tools/probes/form-of-key.py`, `tools/probes/card-of-word.mjs`, and the log `logs/j1-form-of-map.log`.

## 6. A reading that points to another entry prints that entry's English, and loses its own

**What the page does.** Your map of pointer readings (`data/form-of-pills-v1.json`, relay v85, `form-of-pills-rule-v1`) gives, for a reading classed FORM_OF or MIXED, "the target's first English under the same source". Where the map resolves a reading, the pill prints that English, then the relation and the target in brackets. The reading's own text rides on the pill out of sight. That is the owner's "twelve (feminine of ...)", and for a reading that is a pointer and nothing else it is right.

**What I found** (the map as served: 2,708 readings, FORM_OF 2,140, MIXED 568; 2,236 resolved):

- 712 of the resolved are the relation and the target and nothing else.
- 1,115 open with the relation and say more after the target.
- 409 do not open with the relation at all: they have English of their own first.
- Under 57 keys, two or three readings of one source print the very same text (117 readings).

Four cards, each read off the served page:

- **Hosea 4:14, word 12 (`הם`).** English Wiktionary has four readings: "are (a masculine plural present-tense copula, masculine plural of הוא (hu'))", "they (the third-person masculine plural personal pronoun, ...)", and "those, yon (...)" twice. All four are classed MIXED and resolved to the first English under `הוא`, which is "Used as a copula: is." So English Wiktionary's pill for the pronoun reads «Used as a copula: is. (masculine plural of הוא)», and so does its pill for the copula: two pills of one card with one text, and its own "they" on neither. (Other sources' "they" stands on the card as before. The two "those, yon" readings are divided by their ledger and print as themselves.) Zechariah 1:5, word 3 is the same.
- **Amos 6:11, word 4 (`מצוה`).** Three readings, all classed FORM_OF: "defective spelling of מצווה", and the same with "masculine singular present participle and present tense of ציווה / צִוָּה (tsivá)" and "... of צווה / צֻוָּה (tsuvá)" after it. All three print «mitzvah (defective spelling of מצווה)». Two of them say they are a verb's participle.
- **`חמרים`.** "plural indefinite form of חַמָּר (chamár)" and "plural indefinite form of חֹמֶר (chómer)" both resolve under the bare key `חמר` to «Someone who leads a donkey or donkeys.» The second names another word.
- **`אבטח`.** "First-person singular future (prefix conjugation) of בָּטַח (batákh): I will rely on, I will have faith in, ..." is classed MIXED and resolves to «for sure, definitely».

**Why, as far as I can read it.** The target is found by its letters alone (`resolved.key`), so a pointer to one pointed word takes the English of whichever entry shares the letters and stands first. And "first English under the same source" is the first row, which for `הוא` is the copula sense and not "he".

**The asks.**

1. **A resolution of the entry the pointer names.** The pointer's own bytes carry the pointed target (your `at` range holds `חֹמֶר`, `בָּטַח`). Where the target's entry cannot be told from its neighbors by what the pointer says, mark it unresolved with a reason, as you do for the 472 that are.
2. **MIXED readings.** A reading that has English of its own is not a pointer and nothing else. What its pill should print is the owner's call and I am putting it to the owner: my recommendation is the reading's own words, whole, as the source wrote them. If the owner agrees, the page needs nothing from you but the class, which the map already carries; if the map should instead carry which part is the reading's own English, say so.
3. **Which English is "first".** For a pure pointer the page prints one English of the target. A declared rule for which one (the target's leading sense as the source orders its senses, not the store's row order) would make "twelve (feminine of ...)" mean what the owner meant by it.
4. **Readings that print alike.** Where two readings of one key and source resolve to one text, the card prints two pills that read the same. Under your rule 1 most of these part again (the participle is no longer "mitzvah"); what is left is for a ruling on whether they are one pill.

Nothing on the page changes for this until you and the owner have spoken. The chain book records what the card prints, these pills included, and counts the pills that repeat another pill of their card: 12 in the twelve chained books (Amos 4, Hosea 5, Jonah 1, Malachi 1, Zechariah 1).
