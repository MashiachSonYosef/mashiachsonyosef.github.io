# For Moses, from Elijah · 31 October 2026 · the dictionaries' own punctuation, ledgered

Ask v1.1 · checker v1.1 · template v1 · extract v1. Name this version in your relay. What changed from v1 is listed at the end.

## What this is

Every English reading the site prints comes from one of 36 dictionaries in the route store (654,886 routes; a route is one row of English under one Hebrew letters key). Each dictionary writes its fields with its own conventions. A comma separates two glosses in one dictionary and sits inside a sentence in another. Parentheses hold optional letters, an aside, a binyan, a Strong's number or a cross-reference. A slash packs TAHOT's word-by-word pieces of one reading and elsewhere offers two readings. Today the page divides every dictionary's text by one global rule (sense-split-rule-v3, `reader/tools/sense-split-v1.mjs`): only a comma outside round brackets divides. Each comma piece of four words or fewer (words inside round brackets not counted) that is not a bare and, or, nor or but is a reading; if any piece is not, the whole field is also a reading, once. Semicolons, slashes and the other brackets never divide, and a field whose round brackets do not balance stays whole. The owner wants each dictionary's own rules ledgered instead, mark by mark and container by container, so the page divides each dictionary by its own declaration.

A reading is a stretch of text that, printed alone in a pill, renders the Hebrew word: one gloss, rendering or sense a translator could print for the word in a verse. Where the store already gives each sense its own route, a reading inside a route is a part that offers a different meaning from the rest of that route. These are never readings: a label (by implication, also as a conjunction, poetic term, meaning unknown), a pointer (See 1234), a restatement after i.e., a note (a sentence about the word, or a ◄, ► or ≈ note), the description that follows a name (a name and its description are one reading), and two guesses about the origin or identity of one name. A piece that carries a flag the dictionary defines (Strong's × for an idiom, + for a rendering with another word) is still a piece; the flag's own shape says whether the page prints it as a reading, and opens a branch if you cannot tell.

The owner named the cases (31 October): commas, commas in parentheses, commas in brackets, parentheses, brackets, homonyms, semicolons, semicolons in parentheses, semicolons in brackets, slashes (forward or back), slashes in parentheses, slashes in brackets. In those cases "brackets" means every bracket kind other than parentheses that the dictionary uses: [ ], < > and { }. The ledger covers those and every other mark the dictionary uses.

This continues the August machinery (provider-declaration-rule-v1, two dictionaries declared). Version 2 adds the container, makes every test runnable, and is held by a checker.

## The files you get (in this folder)

| file | what it is |
|---|---|
| ASK-provider-declarations-v1.1.md | this page |
| check-provider-declaration-v1.1.mjs | the checker: run it on every dictionary before you ship; it must print "all checks passed". v1.1 counts the pipe mark `\|` (v1 failed K2 for every dictionary that uses it); K7 fails if anything divides in a text whose brackets do not balance (rule 3); K10 recounts each branch's occurrences from its shapes; it confirms that a case `named_cases` calls absent has no occurrence; and review.json gives each dividing sample its route's pieces as well as the window |
| classifier-template-v1.mjs | the template every classifier and every recount starts from; above its SHAPES line change nothing but the first comment line |
| extract-provider-routes-v1.mjs | writes one JSONL per dictionary from the served route store |
| example/ | a finished dictionary (openscriptures_lexical_index) under ask v1.1: its declaration, its classifier, its review file. It passes all thirteen checks of checker v1.1. Read it for form; it divides nothing, so for a dividing shape follow the fields table and rules 1 to 4. |
| order-table.md | the 36 dictionaries by routes (its "readings" column counts routes), the order of work |

## What you make for each dictionary

Five files and the review file, named by the dictionary's source key:

1. `<source_key>.declaration.json` — the ledger.
2. `<source_key>.classifier.mjs` — the same ledger as runnable tests, copied from the template.
3. `<source_key>.recount.mjs` — the tests written a second time from the declaration's words alone (step 7a).
4. `<source_key>.contents.json` — what the bracket shapes and the catch-alls hold, with counts (step 5a).
5. `<source_key>.check.txt` — the whole output of both checker runs, plus `<source_key>.review.json`, which the checker writes.

### The declaration's fields

| field | what goes in it |
|---|---|
| schema | always `mishkan.provider_declaration.v2` |
| source_key | the dictionary's source key, as in order-table.md |
| m_ids | its M ids: the distinct `m` values in its JSONL |
| routes | the number of routes in its JSONL |
| read_from | which text you read (the route text as served); the store version, which is `store_version` in `<main>/reader/data/route-store/index.json` of the checkout you extracted from in step 1; and the source's own key to its signs, or that you found none |
| definitions | every word list and every named step a test uses, once and in full: `{ "<name>": ["word", ...] }` or `{ "<name>": "<the steps, in order>" }`. A test names it. `{}` if none. |
| shapes | one object per shape (below), in the classifier's order |
| precedence | the ids of the shapes that divide, from the largest unit to the smallest (rendering groups before renderings); empty if none divides. The page cuts at every dividing occurrence at once; precedence is used only to nest the pieces. |
| named_cases | one key per case the owner named: `comma_top`, `comma_in_paren`, `comma_in_brackets`, `semicolon_top`, `semicolon_in_paren`, `semicolon_in_brackets`, `slash_top`, `slash_in_paren`, `slash_in_brackets`, `parentheses`, `brackets`. Slash means `/` and `\`; in_brackets means inside [ ], < > or { }. Each value is the ids of the shapes that cover the case, or `"absent"`. The twelfth case, homonyms, is the `homonyms` field. |
| homonyms | `entry_identity`, `reason`, `keys_with_more_than_one_route_text` (below) |
| branches | every question the data cannot settle (below); empty if none |
| not_done_here | one sentence on anything this ledger leaves to another ledger |

Each shape:

| field | what goes in it |
|---|---|
| id | `<markname>.<what it does>`, lowercase with underscores, the mark's name from the table below: `comma.between_glosses`, `comma.inside_kjv_group`, `open_paren.optional_letters`. Unique in the file. |
| mark | the one character. An opener and its closer are two shapes; their meanings say "opens …" and "closes …". |
| container | `top`, `paren` ( ), `bracket` [ ] only, `angle` < > or `brace` { }: the innermost bracket the mark sits in. A bracket character sits in what encloses it. Use `any` only for a shape that does not divide and whose meaning holds in every container it sits in (an apostrophe, a Hebrew point, a bracket that holds a number). A comma, semicolon, slash or backslash shape always names one container, except a shape under rule 3. |
| divides | `true` only if a reader would see two readings on either side of this mark |
| means | one plain sentence: what the source uses the mark for in this shape, never only where it sits or that the source "sets it off". At least four words. No two shapes share a meaning. Before you write meanings, find the source's own key to its signs (for STEPBible TAHOT, the notes at the head of the TAHOT files in STEPBible-Data) and name it in read_from. If you cannot find the source's own account of a convention, begin the meaning with "unverified:". |
| test | the same test the classifier runs, in words, exact enough that a second person given only your words writes the same code and gets this shape's count (step 7a). Spell out every list in full; never write such as, for example, etc. or "its misspellings". Say whether a word list matches case-sensitively (write "lowercase" if you mean lowercase only), whether "a letter" means any letter or only A to Z, whether "a space" means the space character only (write "whitespace" for any), and the order of the steps (for example, that the text is trimmed or a trailing See sentence removed before the test). A test that names a verb (forms of be, of belong) lists every form it catches. A list or step that more than one test uses goes in `definitions`, and the test names it. A test may say "not caught above": that means the shapes listed above it for the same mark. At least four words. |
| count | how many occurrences the classifier gives this shape (take it from the classifier, never by hand) |
| read | how many occurrences of this shape you read in their routes (all, if fewer than 30). A frequency table is not reading. |
| examples | letters keys where the classifier gives this shape, `[{ "key": "..." }]`: at least three for a dividing shape; up to three, or none, for any other |
| falsifier | required for a dividing shape: one sentence saying what text would prove the shape wrong |
| lead_words | dividing shapes only: the dictionary's own connectives that open the piece after a cut (`or:`, `or,`, `alternatively:`), which stay in the piece (rule 4); `[]` if none |

Mark names for shape ids:

| mark | name | mark | name | mark | name |
|---|---|---|---|---|---|
| `,` | comma | `(` | open_paren | `'` | apostrophe |
| `;` | semicolon | `)` | close_paren | `"` | quote |
| `:` | colon | `[` | open_bracket | `?` | question_mark |
| `.` | period | `]` | close_bracket | `¿` | question_inverted |
| `-` | hyphen | `<` | open_angle | `!` | exclamation |
| `־` | maqaf | `>` | close_angle | `×` | times |
| `/` | slash | `{` | open_brace | `+` | plus |
| `\` | backslash | `}` | close_brace | `=` | equals |
| `\|` | pipe | `*` | asterisk | `׳` | geresh |
| `״` | gershayim | | | | |

A mark not in the table, Hebrew points and accents included, takes its Unicode name in lowercase snake_case: HEBREW POINT HATAF PATAH is `hebrew_point_hataf_patah`, RIGHT SINGLE QUOTATION MARK is `right_single_quotation_mark`. A bracket character keeps its table name when the dictionary uses it as a sign: `close_angle.literal_to_meaning`.

## The procedure, step by step

1. Extract the routes once from the served route store, which is `reader/data/route-store` on this repository's `main` branch; `<main>` below is a checkout of `main` as pushed (origin/main): `node extract-provider-routes-v1.mjs <main>/reader/data/route-store <out>/by-source`. This writes `<source_key>.jsonl` (one line per route: key, route, def, m, year, cut) and `sources-ranked.json`. Read the store version from the same checkout. The JSONL carries neither the dictionary's own entry id nor the name of the field a route came from, because the store keeps neither (rule 12).
2. For your dictionary, list every mark and the container it sits in, with counts. A mark is any character that is not a letter, a digit or whitespace. Hebrew points, the maqaf and the geresh are marks too.
3. For each mark and container with occurrences, read at least 30 occurrences (or all, if fewer) in their routes. Group them by what the mark does. Each group is a shape.
4. Copy `classifier-template-v1.mjs` to `<source_key>.classifier.mjs`. Above the SHAPES line change nothing but the file's first comment line. Fill SHAPES: one entry per shape, with `id`, `mark`, `divides` and a `test` function. Order matters: for each mark, the first test that returns true names the shape, so put specific shapes before general ones, and list the shapes in the declaration in the same order. Shared lists and helper functions go between the closing `];` of SHAPES and `export function classify`, as function declarations or consts; tests run only when classify runs, so they see them. For a closer, `c.group` is `""` when it never opened, but also for the closer of an empty pair `()` and for every mark that is not a bracket: a closer that never opened is `CLOSE[c.mark] && c.group === "" && !c.before.endsWith(CLOSE[c.mark])`. For an opener that never closes, `c.group` is `null`.
5. Run the classifier over every route. If it throws "no shape for", read that place and add or widen a shape. Repeat until it never throws.
5a. Print what each shape holds. For every shape whose test reads what a bracket holds, and for every catch-all ("any other …", "not caught above"), list its distinct contents with counts: the first word of what the bracket holds, or, for any other mark, the first word after it (`s 1182 · es 52 · long 12 · en 11`). Read every content that occurs 5 or more times, and one occurrence of each rarer content. If the shape's meaning does not hold for a content, give that content its own shape, however rare it is. Two cases to watch: a label such as [masc] or [fem] inside a shape that says "a supplied word", and the rest of a word such as be[long] inside a shape that says "an ending". Save the lists as `<source_key>.contents.json`: `{ "<shape id>": { "<content>": <count>, ... } }`.
6. Count the shapes from the classifier's output and write `<source_key>.declaration.json`. Counts are per route row, duplicates counted.
7. Run the checker from the folder that holds your files:
   `node check-provider-declaration-v1.1.mjs --declaration <source_key>.declaration.json --classifier <source_key>.classifier.mjs --routes <out>/by-source/<source_key>.jsonl --out . --v3 <main>/reader/tools/sense-split-v1.mjs`
7a. Recount from your words. Copy the template again to `<source_key>.recount.mjs` and write every test, list and helper from the declaration's words alone, in the declaration's order, without opening your classifier. Run the checker again with `--classifier <source_key>.recount.mjs --out recount`. A count that differs means the words are not the test: fix the words, then write the recount again from them. Put both outputs in `<source_key>.check.txt`, the recount's under the classifier's.
8. Fix every FAIL and run both again. Ship only when both print "all checks passed". If a check stays red for a reason your files cannot fix, do not patch the checker: ship red, quote the K line, and name the checker line you think is wrong.
9. Open `<source_key>.review.json`. For every dividing shape, read the pieces of its five samples, then the pieces of at least 30 routes it cuts (all, if fewer), and every route it cuts in which a piece holds a sentence break or the markers of another kind of field (i.e., by implication or figuratively inside a rendering list). If any cut is not a boundary between two readings that each stand alone (rule 11), the shape is wrong: narrow its test or make it not divide.

## The rules

1. **When in doubt, it does not divide.** A shape divides only when every occurrence you read is a boundary between two readings. If some are and some are not, split the shape until each part is one or the other. If you cannot tell, the shape does not divide, and you open a branch. A dividing shape needs three example keys (K6). A pattern you judge dividing but find under fewer than three keys gets a shape that does not divide and always a branch that lists every key; treat every such pattern alike.
2. **Dividing is never the catch-all.** A general shape ("any other comma at top level") must have `divides: false`. Only specific shapes divide. A test built on a closed word list, written in full in `definitions`, is specific.
3. **Nothing divides in a text whose brackets do not balance.** When the bracket stack finds an opener that never closes or a closer that never opens, either the record is damaged (sense-split-rule-v3 rule 4 already holds such a field whole) or the dictionary uses a bracket character as a sign (`wording > meaning`). Either way the whole text stays whole. Give the unmatched character its own shape that does not divide: `open_paren.never_closed`, `close_paren.never_opened`, or, for a sign, a name for what it does. For each mark that has a dividing shape, put a shape `<markname>.in_unbalanced_text` (does not divide, container `any`) ahead of that mark's other shapes; it takes every occurrence of that mark in such a text. Other marks keep their ordinary shapes. The checker turns red if anything divides in such a text. Test for such a text with this helper, which matches the template's own bracket matching:

   ```js
   function unbalanced(text) {
     const st = [];
     for (const ch of text) {
       if (OPEN[ch]) st.push(ch);
       else if (CLOSE[ch]) { if (st.length && st[st.length - 1] === CLOSE[ch]) st.pop(); else return true; }
     }
     return st.length > 0;
   }
   ```

4. **The text is never changed.** A division keeps every piece and every character. If a piece would be empty or only marks, the shape is wrong. When the piece after a cut begins with the dictionary's own connective (`or:`, `or,`, `alternatively:`, `or (2)`), it stays in the piece; list it in the shape's `lead_words`. The page decides how to print it.
5. **The container is the checker's container.** Use the template's `c.container`; do not compute your own.
6. **The owner's cases are named, not merged.** Comma, semicolon and slash (forward or back) each get their own shapes at top level, inside parentheses and inside brackets, wherever the dictionary uses them. Parentheses and each bracket kind get shapes for what they hold. A parenthesis inside a parenthesis is its own shape. Every case goes in `named_cases`, with its shapes or as absent.
7. **Hebrew inside English is never a reading.** A Hebrew word in a definition is a pointer or a citation; its points and maqaf get shapes that do not divide.
8. **Counts come from the classifier.** Never type a count. Run the classifier and copy its numbers. A route the store already cut from a longer field (`cut` 1) is classified like any other route. Declare no shape the classifier gives no occurrence: a mark or bracket kind the dictionary does not use needs no shape, and the classifier throws if one appears.
9. **Quote no more than 60 characters** of a dictionary's text anywhere in the declaration.
10. **A general shape says it is general.** The meaning of a catch-all names the kinds you read in it, each with a rough share ("explains the word before, about nine in ten; also qualifies the word after, or offers another wording opened by or"), and never describes one kind as if it were all of them.
11. **Every piece stands alone as a reading.** A cut is wrong for a route when a piece leans on another piece ("similar in appearance, but …", "both are …", "it could also be …"), when a piece has no head word of its own, when it cuts a name from its description or a phrase from its i.e. restatement, or when a note after the last piece speaks of all of them (a trailing ≈, ◄ or ► note, or "both"). Give such routes a shape that does not divide, or open a branch. A pointer at the end (See 1234) stays in the last piece; `not_done_here` says so.
12. **A field's kind is never guessed into a division.** The route text does not say which of the dictionary's fields it came from (openscriptures_strongs writes a definition and a KJV rendering list), and the store keeps no field name. A test that decides the kind of field from the text alone (it ends in a period, no space comes before a comma) is a guess. A shape that such a guess admits does not divide: give it a shape that does not divide and open a branch that names the guess.

## Homonyms

`homonyms.entry_identity` names how this dictionary tells two entries under one Hebrew letters key apart: a Strong's number in the definition, a BDB entry number, a roman numeral, a superscript, or "none". A number that points to another entry (See 1234, Compare 1234, by mistake for 1234) is a pointer, never identity. If "none", `reason` says why, with an example, and says whether the source's own files carry an entry id that the store dropped (TAHOT has a Strong's number on every word; the route text does not). `keys_with_more_than_one_route_text` is the number of letters keys whose routes carry more than one distinct text in this dictionary; the checker recounts it and prints its count on the K9 line, so take it from there or from your own script (it is the one count that does not come from the classifier). This number counts senses and homonyms together; `entry_identity` is what tells them apart. For a dictionary whose key is a word form and whose routes are its renderings at each place (TAHOT, MACULA), it counts places, not entries; say so in `reason`.

## Branches

A branch is a question only the owner can rule, written so he can rule it from the words alone.

```json
{ "id": "B01", "question": "In this dictionary, does a comma between two capitalized names divide two readings?",
  "shapes": ["comma.between_capitalized_names"], "occurrences": 112,
  "options": [{ "id": "divides", "means": "two names, two readings" },
              { "id": "whole", "means": "one reading that names two people" }],
  "resting": "whole" }
```

`shapes` lists every shape the branch rules, and `occurrences` is the sum of their classifier counts; the checker recounts it. An option carries no count of its own: it says what all of those occurrences become. The resting option is what your classifier applies until the owner moves it, and it is always the option that does not divide.

A branch takes whole shapes. Before you open one, read 20 of its occurrences (all, if fewer). Each option must be right for every occurrence under it: if "divides" would cut a qualifier, a usage note or a name from its description in some of them, split the shape first (rule 1). Then search every other mark and shape for the same question and put them all in one branch: "literally: X; hence: = Y" and "literally: X; = Y" ask the same thing, whichever mark carries it. A branch may hold a single occurrence.

## What you ship, one dictionary per ship

- the five files and the review file for the dictionary
- in the relay: the ask version you worked from
- both checker outputs, whole: every K line and the informative line comparing it with today's global rule
- the shape count, and beside it the count of distinct meanings, with each opener and closer pair counted once and the Hebrew points counted once
- the branches, if any, as a table: id, question, shapes, occurrences, resting
- the shapes whose meaning begins "unverified:", and the mark names you took from Unicode

After your first ship, wait for my review before the second: I may send a revised ask (version 1.2) with what the first ship taught. Start with openscriptures_strongs (number 7 in order-table.md, 23,646 routes): it is mid-sized, comma-heavy, and today's global rule divides 7,861 of its rows, so the comparison will show what changes. Then go in the table's order from number 1. wikisource_strongs_explicit_forms was declared in August under version 1; redo it under version 2.

## What I check on each ship

1. I run your checker on your files.
2. I count the shapes again with a script of my own, written from your tests in words.
3. I read the five samples of every dividing shape and three of every other shape, and say which meanings hold.

Nothing reaches the site until the owner rules the branches and I wire the declaration.

## Changes from v1 (31 October 2026, after three rehearsal ships)

- Today's global rule is described as the tool runs it: semicolons never divide.
- A reading is defined, and so are "brackets" in the owner's cases.
- Rule 3: nothing divides anywhere in a text whose brackets do not balance, stray closers included; one helper for the test.
- Fixed mark names for shape ids; Unicode names for the rest.
- Tests in words must reproduce the count; lists go in `definitions`; a recount from the words (step 7a) must pass the checker too.
- Step 5a: a contents table for bracket shapes and catch-alls, shipped as contents.json.
- Meanings say what the source uses the mark for, from its own key to its signs, or start "unverified:".
- New rules 10 to 12: a catch-all says it is general, every piece stands alone, a guessed field kind never divides.
- Branches name their shapes and carry one occurrences count; options carry none; rare clear patterns always get a branch.
- New fields: `definitions`, `named_cases`, shape `read` and `lead_words`.
- Precedence, `any`, helper placement, stray closers, store version, cut routes and the homonym count are defined.
- Checker v1.1: the pipe mark, rule 3 in K7, branch occurrences in K10, absent cases, pieces in review.json. A check you cannot fix ships red with its K line quoted.
