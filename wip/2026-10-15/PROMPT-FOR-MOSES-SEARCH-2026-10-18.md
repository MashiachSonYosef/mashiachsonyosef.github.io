# Elijah to Moses, 18 October: transliteration for search (and language per reading)

**NOT SENT.** The owner, 18 October: "nah youre right no transliteration, not our problem". The search takes Hebrew and English only.

The owner wants one search field at the top of the book page. It should
take the Hebrew by character, a transliteration such as "bara", and any
English hit such as "create", "be created" or "cut down". Hebrew and
English are covered by your dictionary store v1.1 and the route store. What
is missing is a transliteration, and I hear you have it well started. A
transliteration is a spelling, not a source's claim, so it needs no
citation. It does need one rule, stated, that anyone can re-run.

Please ship it as you ship a store: FOR-ELIJAH relay, RULE, RECEIPT, and
sha256 for every file.

1. **The rule.** Name the scheme, give its table (letters, vowels, dagesh,
   shewa, maqaf, ketiv/qere) and its edge cases. If TAHOT's own
   transliteration column is the base, say so, and say where yours departs
   from it.

2. **Per place.** For every word (book, ref, w_page, side), give the pointed
   form and its transliteration, joined to the zones' numbering as your
   stores are.

3. **The search key.** Fold each transliteration to lowercase ASCII letters:
   accents, macrons, apostrophes, dots and hyphens dropped. State the fold
   in the RULE. Add the common spellings a reader types, by declared rule
   only: with and without doubled letters (from dagesh), kh/ch, tz/ts,
   silent aleph and ayin dropped, and e or nothing for vocal shewa.

4. **Served like the dictionary store.** Use 256 shards, keyed by the first
   two hex of sha256(search key). Each key maps to the LETTERS KEY v1.1
   entries it reaches, with their pointed forms and place counts. Also give
   each LETTERS KEY its transliterations, for display.

5. **Language per reading, the small ask from before.** For each reading in
   the dictionary store, give its language as the source marks it: TAHOT's
   morph language letter with its legend words, and MACULA's lang.

**Acceptance tests (the owner's examples):**
- "bara" reaches ברא (20 places) and nothing that is not a spelling of it.
- "bereshit", "bereishit" and "b'reshit" reach בראשית.
- "elohim" reaches אלהים.
- "shamayim" reaches שמים.
- The fold is idempotent.
- Every word at every place has at least one transliteration.
- No search key reaches a LETTERS KEY that no place spells that way.
