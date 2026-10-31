> **Superseded by ASK-provider-declarations-v1.1.md (31 October 2026, after a rehearsal of this ask on three dictionaries).** Work from v1.1 and its checker, check-provider-declaration-v1.1.mjs.

# For Moses, from Elijah · 31 October 2026 · the dictionaries' own punctuation, ledgered

## What this is

Every English reading the site prints comes from one of 36 dictionaries in the route store (654,886 readings). Each dictionary writes its fields with its own conventions. A comma separates two glosses in one dictionary and sits inside a sentence in another. Parentheses hold optional letters, an aside, a binyan, a Strong's number or a cross-reference. A slash packs TAHOT's word-by-word pieces of one reading and elsewhere offers two readings. Today the page divides every dictionary's text by one global rule (sense-split-rule-v3: semicolons, then commas between short pieces). The owner wants each dictionary's own rules ledgered instead, mark by mark and container by container, so the page divides each dictionary by its own declaration.

The owner named the cases (31 October): commas, commas in parentheses, commas in brackets, parentheses, brackets, homonyms, semicolons, semicolons in parentheses, semicolons in brackets, slashes (forward or back), slashes in parentheses, slashes in brackets. The ledger covers those and every other mark the dictionary uses.

This continues the August machinery (provider-declaration-rule-v1, two dictionaries declared). Version 2 adds the container, makes every test runnable, and is held by a checker.

## The files you get (in this folder)

| file | what it is |
|---|---|
| ASK-provider-declarations-v1.md | this page |
| check-provider-declaration-v1.mjs | the checker: run it on every dictionary before you ship; it must print "all checks passed" |
| classifier-template-v1.mjs | the template every classifier starts from; do not change anything above its SHAPES line |
| extract-provider-routes-v1.mjs | writes one JSONL per dictionary from the served route store |
| example/ | a finished dictionary (openscriptures_lexical_index): its declaration, its classifier, its review file; it passes all eleven checks |
| order-table.md | the 36 dictionaries by readings, the order of work |

## What you make for each dictionary

Three files, named by the dictionary's source key:

1. `<source_key>.declaration.json` — the ledger.
2. `<source_key>.classifier.mjs` — the same ledger as runnable tests, copied from the template.
3. `<source_key>.check.txt` — the checker's whole output, plus `<source_key>.review.json`, which the checker writes.

### The declaration's fields

| field | what goes in it |
|---|---|
| schema | always `mishkan.provider_declaration.v2` |
| source_key | the dictionary's source key, as in order-table.md |
| m_ids | its M ids |
| routes | the number of routes in its JSONL |
| read_from | which text you read (the route text as served), and the store version |
| shapes | one object per shape (below) |
| precedence | the ids of the shapes that divide, in the order they apply; empty if none divides |
| homonyms | `entry_identity`, `reason`, `keys_with_more_than_one_route_text` (below) |
| branches | every question the data cannot settle (below); empty if none |
| not_done_here | one sentence on anything this ledger leaves to another ledger |

Each shape:

| field | what goes in it |
|---|---|
| id | `<markname>.<what it does>`, lowercase with underscores: `comma.between_glosses`, `comma.inside_kjv_group`, `paren.optional_letters`. Unique in the file. |
| mark | the one character |
| container | `top`, `paren`, `bracket`, `angle` or `brace`: the innermost bracket the mark sits in. A bracket character sits in what encloses it. Use `any` only for a shape that does not divide. |
| divides | `true` only if a reader would see two readings on either side of this mark |
| means | one plain sentence: what the mark does in this dictionary, in this shape. At least four words. No two shapes share a meaning. |
| test | the same test the classifier runs, in words. At least four words. |
| count | how many occurrences the classifier gives this shape (take it from the classifier, never by hand) |
| examples | letters keys where the shape occurs: at least three for a dividing shape, `[{ "key": "..." }]` |
| falsifier | required for a dividing shape: one sentence saying what text would prove the shape wrong |

## The procedure, step by step

1. Extract the routes once from the served route store, which is `reader/data/route-store` on this repository's `main` branch: `node extract-provider-routes-v1.mjs <main>/reader/data/route-store <out>/by-source`. This writes `<source_key>.jsonl` (one line per route: key, route, def, m, year, cut) and `sources-ranked.json`.
2. For your dictionary, list every mark and the container it sits in, with counts. A mark is any character that is not a letter, a digit or whitespace. Hebrew points, the maqaf and the geresh are marks too.
3. For each mark and container with occurrences, read at least 30 occurrences (or all, if fewer) in their routes. Group them by what the mark does. Each group is a shape.
4. Copy `classifier-template-v1.mjs` to `<source_key>.classifier.mjs`. Fill SHAPES: one entry per shape, with `id`, `mark`, `divides` and a `test` function. Order matters: for each mark, the first test that returns true names the shape, so put specific shapes before general ones.
5. Run the classifier over every route. If it throws "no shape for", read that place and add or widen a shape. Repeat until it never throws.
6. Count the shapes from the classifier's output and write `<source_key>.declaration.json`.
7. Run the checker:
   `node check-provider-declaration-v1.mjs --declaration <source_key>.declaration.json --classifier <source_key>.classifier.mjs --routes <out>/by-source/<source_key>.jsonl --out <dir> --v3 <main>/reader/tools/sense-split-v1.mjs`
8. Fix every FAIL and run it again. Ship only when it prints "all checks passed".
9. Open `<source_key>.review.json`. For every dividing shape, read its five samples. If any sample is not two readings, the shape is wrong: narrow its test or make it not divide.

## The rules

1. **When in doubt, it does not divide.** A shape divides only when every occurrence you read is a boundary between two readings. If some are and some are not, split the shape until each part is one or the other. If you cannot tell, the shape does not divide, and you open a branch.
2. **Dividing is never the catch-all.** A general shape ("any other comma at top level") must have `divides: false`. Only specific shapes divide.
3. **Nothing divides after an opener that never closes.** Give unclosed brackets their own shape (`paren.never_closed`) that does not divide. The checker turns red if anything after one divides.
4. **The text is never changed.** A division keeps every piece and every character. If a piece would be empty or only marks, the shape is wrong.
5. **The container is the checker's container.** Use the template's `c.container`; do not compute your own.
6. **The owner's cases are named, not merged.** Comma, semicolon and slash each get their own shapes at top level, inside parentheses and inside brackets, wherever the dictionary uses them. Parentheses and brackets get shapes for what they hold. A parenthesis inside a parenthesis is its own shape.
7. **Hebrew inside English is never a reading.** A Hebrew word in a definition is a pointer or a citation; its points and maqaf get shapes that do not divide.
8. **Counts come from the classifier.** Never type a count. Run the classifier and copy its numbers.
9. **Quote no more than 60 characters** of a dictionary's text anywhere in the declaration.

## Homonyms

`homonyms.entry_identity` names how this dictionary tells two entries under one Hebrew letters key apart: a Strong's number in the definition, a BDB entry number, a roman numeral, a superscript, or "none". If "none", `reason` says why, with an example. `keys_with_more_than_one_route_text` is the number of letters keys whose routes carry more than one distinct text in this dictionary; the checker recounts it. This number counts senses and homonyms together; `entry_identity` is what tells them apart.

## Branches

A branch is a question only the owner can rule, written so he can rule it from the words alone.

```json
{ "id": "B01", "question": "In this dictionary, does a comma between two capitalized names divide two readings?",
  "options": [{ "id": "divides", "means": "two names, two readings", "count": 112 },
              { "id": "whole", "means": "one reading that names two people", "count": 112 }],
  "resting": "whole" }
```

The resting option is what your classifier applies until the owner moves it, and it is always the option that does not divide.

## What you ship, one dictionary per ship

- the three files for the dictionary
- the checker's output, whole, in the relay: every K line and the informative line comparing it with today's global rule
- the branches, if any, as a list the owner can read

After your first ship, wait for my review before the second: I may send a revised ask (version 1.1) with what the first ship taught. Start with openscriptures_strongs (number 7 in order-table.md, 23,646 routes): it is mid-sized, comma-heavy, and today's global rule divides 7,861 of its fields that the dictionary may keep whole, so the comparison will show what changes. Then go in the table's order from number 1. wikisource_strongs_explicit_forms was declared in August under version 1; redo it under version 2.

## What I check on each ship

1. I run your checker on your files.
2. I count the shapes again with a script of my own, written from your tests in words.
3. I read the five samples of every dividing shape and three of every other shape, and say which meanings hold.

Nothing reaches the site until the owner rules the branches and I wire the declaration.
