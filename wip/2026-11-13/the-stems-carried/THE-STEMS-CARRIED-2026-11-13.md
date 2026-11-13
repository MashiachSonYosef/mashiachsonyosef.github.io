# The stems carried only where a card can ask them — 13 November 2026 AD

Elijah, page lane. The lane's own change, made for weight (the owner, 7 November: "the ultimate goal is lighter weight, and that doesnt just mean frontend"). No ruling was needed: nothing the page draws or withholds moves.

## What was found

Each book's lattice sidecar carried the known stems of every row under every key its words are read under: since 6 November from the corpus lane's binyan ledger (file 2, `row-stems-v2.jsonl`), and since 13 November from its extension to the UBS dictionary, the SDBH and Jastrow (ship C2). The page asks a row's stems on one kind of card only: one whose word, or the half of a word written one way and read another, has a pointed surface whose places in the book have a known stem (`grades[surface].st`), under that form's own key (zone.html: `askedWord` gives the card a pointed surface only under the form's own key, and the stem gate asks `grades[that surface].st` first). A card opened by headword, or on a piece, asks no stem. The projector asks the stems for the leaders it bakes under the same condition, under the graded surface's own key.

Measured on the live sidecars before anything was written (`logs/f-s00-…`): 13,791 of the 51,971 keys that carried stems are asked under by no card and no leader, and the stems of their 427,331 rows (of 937,350) were carried for nothing: 5.25 MB of the 37.4 MB the lattice sidecars weighed gzipped. Naming each row by its source and rank instead of its whole route text would save about 3.7 MB more, but the route text is what keeps a stale sidecar from giving a row another row's stems; that is a separate change, not made here.

## What was wired (edits 84 to 86, two new tools)

- `tools/stems-carried-v1.mjs`: the rule, `stems-carried-rule-v1-a-key-carries-its-rows-stems-only-where-a-card-of-the-book-can-ask-them`, in one place. Its pairs are taken wide: a word's surface and key, each half's (as written and without its brackets), each piece's though a piece's card asks no stem today, and each graded surface's own key, so no key a card or leader asks is left out.
- Edit 84, `tools/project-lattice-v12-v1.mjs`: the leaders are baked from every key's stems as before; then the sidecar carries the stems of the keys the rule names and no others, and its binyan record says so (`carried`: the rule, the keys and rows the projection held, the keys and rows it carries). The extension's `rows_given_stems_in_this_book` counts the rows carried; `rows_named_on_this_books_keys` keeps the count before the choice.
- `tools/check-stems-carried-v1.mjs`, three laws: C1 every sidecar that carries stems names the rule and counts what it carries as a recount does; C2 every key carried is one a card of the book asks its rows' stems under; C3, with file 2 on the machine (`--row-stems` or `ROW_STEMS`), at every key the page asks a row's stems under that the projection reads, the sidecar holds each line of file 2 with exactly its stems. C3 finds those keys as the page finds them, not through the rule's module, so a rule that left a key out is caught and not agreed with.
- Edit 85, `tools/check-stems-extension-v1.mjs`: B4 holds each line of the extension at every word asked its rows' stems under that line's key, no longer at every key of every word.
- Edit 86, PIPELINE.md.

Red first: on the live sidecars the new check fails C1 (no sidecar names the rule) and C2 (the keys no card asks), and passes C3: 38,170 keys and 394,339 lines of file 2, each held (`logs/f-s01-…`).

## Measured against the live build (v179), the round run whole

- Lines at rest: all 400,242 the same (`logs/f-s12-…`).
- The chain books: all 14,354 cards the same, at rest and lifted (`logs/f-s13-…`).
- The new check after the round (`logs/f-s10-…`): 39 books; 38,180 keys and 510,019 rows carried, of 51,971 and 937,350; every carried key asked; C3 38,170 keys and 394,339 lines, each held.
- Weight (`logs/f-s14-…`): the lattice sidecars 36,863,953 → 31,637,210 bytes; the zones folder 64,028,250 → 58,801,507 (−5,226,743, 8.2%).
- Files: outside the zones, only the zone store's pins, the ledger index (it names the two new tools) and the resting-lines records (each names the fingerprints of the files it was read off; their lines are the same) differ. The search index, the store and every receipt of the gate and the counts are the same bytes.

**Broken on purpose** (`logs/f-s17-…`), on Amos, each file put back byte for byte, the tree's fingerprint the same before and after (`c85313a0a0c55915`):

| | What was broken | The check |
|---|---|---|
| A | the sidecar's record of the rule gone | C1 red |
| B | its count of rows carried off by one | C1 red |
| C | a key no card asks given a row's stems (the counts made to agree) | C2 red |
| D | an asked key's stems dropped (the counts made to agree) | C3 red |
| E | one row's stem changed on an asked key | C3 red |
| F | a row of the extension dropped on an asked key | the extension's B4 red, and B5, B6, B8 on the page |
| G | the projector carries every key again (Amos projected anew with it) | C1, C2 red |
| H | the rule's module asks no key at all (Amos projected anew under it) | C2, C3 red |

H is the fault C3 is built for: the check finds the keys the page asks without the module, so a module that leaves keys out is caught rather than agreed with.

**Suite, gate, lint.** 152 of 153 checks pass (`logs/f-s15-…`); the other is the check that the tree is pushed, green after the push (`logs/f-s18-…`). `check-stems-carried-v1` runs in the suite with file 2 named (`ROW_STEMS`), so C3 is judged there. `check-stems-extension-v1` passes every law (`logs/f-s11-…`): B4 at 39 books, 115,680 rows of the extension carried, 15,872 words asked their rows' stems under a key that holds a line; B5 to B8 press cards on the page and find the stem withheld and kept as before. The gate against the live build (`logs/f-s16-…`): 9,383 sampled lines on 18 pages and the 54 first cards, all the same. Lint (`logs/f-s04-…`): the four changed tools, no finding their live copies lack.

**What changed besides the sidecars.** 1,069 files in the commit (two of them new: the rule's module and its check), nearly all a seal: each chapter page's line of its zones' pins (968 pages), the chain index's fingerprints of the 12 chain books, each book's resting-lines record and chain book (they name the files they were read off), the zone store's pins, the chapter pages' receipt; and the ledger index and the pipeline manifest, which name the two new tools and the rule's guards (153 rules declared, 140 named by a check).

**Shipped.** main `2646018ea9`, gh-pages `f91fd5a576` (deployment run 1363 and live check run 61, both green, `logs/f-s19-…`). The commit message is `logs/f-commit-message-2646018e.txt`.
