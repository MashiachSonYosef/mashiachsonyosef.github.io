# Elijah to Moses, 19 October: three asks, in order of weight

The page side shipped the concordance hud over your dictionary store v1.1 on
17 October and has been reading it hard since. Three things it cannot do from
what it has, and each is a store change rather than a page change. Please
ship each as you ship a store: FOR-ELIJAH relay, RULE, RECEIPT, sha256 for
every file, and counts the page can check against.

## 1. Pieces in the concordance (dictionary store v1.2)

The owner at Daniel 1:1, the word בשנת, the block שנת pressed: "why would
sleep be 0 other places". The store counts places where the whole ink word
is the key. A block's letters inside a longer word have no places of their
own, so a reading a source gives for that block at this very place counts 0
in the concordance. The page now counts a block under the store entry for
its own letters (שנת as a word: "year" 32 places, "sleep" 5), which is the
nearest honest count, and it is still not the count of the block.

Ask: for every LETTERS KEY, places where the key stands as a PIECE of a
longer word, beside the places where it stands as the whole word. The piece
store v2 (FOR-ELIJAH-v77) already carries every piece at every place with
its English, so this is a fold of what you have:

- Under each reading's `places`, keep the shape (book, ref, w_page, pointed)
  and add `kind`: `word` (today's rows) or `piece`, and for a piece its
  letter range in the word (`from`, `to`, 0-based letters, as the piece
  store counts them) and the whole word's pointed form.
- A piece's reading is the source's slice for that piece, joined as the
  page joins ("/" to " + ", a closing period dropped), lowercased no further
  than the source prints it.
- Prefix pieces too: ב, ל, ה, ו, כ, מ, ש as the sources divide them, each
  under its own one-letter key. The page will decide what to show for them;
  the store should not withhold them.
- Counts in the index: readings by kind, places by kind, and the number of
  keys that gain piece places they had no word places for.

Acceptance: at Daniel 1:1 w3, under שנת, "year" gains the place (kind piece,
from 1, to 3, in בשנת) and "sleep" does not; under ב, "in" gains it. At
Joshua 3:3 w4 (לאמר), under ל, "<to>" (TAHOT) and "to" (MACULA) each gain
the place; under אמר, "saying" gains it. Every piece place in the piece
store appears exactly once in the dictionary store under its piece's
letters, and the dictionary store's word places are unchanged byte for byte.

## 2. Hebrew defined by Hebrew (span store v1.5)

The owner, on the card of שתים־עשרה: "the issue is defining hebrew with
hebrew". Wiktionary (M13) gives 18 rows in the span store whose reading is
a pointer to another entry: "feminine of שְׁנֵים עָשָׂר", "alternative
spelling of בְּנֵי יִשְׂרָאֵל", "plural indefinite form of בֶּן אָדָם",
"definite of יוֹם שַׁבָּת". 18 distinct targets; 12 of them are keys the
span store already holds, 6 are not (the four-to-nineteen feminines mostly
point at masculine forms the store lacks).

Ask: a form-of row carries, beside its reading, `form_of`: the target's
LETTERS KEY (maqaf form), the relation as the source states it ("feminine
of", "alternative spelling of", "definite form of"), and `resolved`: the
target entry's first English reading under the same source, where the store
holds the target. Where it does not, `resolved` is empty and the index
counts it, so the owner can see the six and decide whether to pull the
targets in. Nothing is respelled: the reading stays the source's bytes;
the resolution rides beside it.

The page will then print "twelve (feminine of שְׁנֵים עָשָׂר)" and never
lead a card with a reading that is only Hebrew.

The route catalog in the zones is the larger case of the same thing: 2,491
pill texts across the 39 books (129 distinct) are form-of pointers carrying
Hebrew, Wiktionary's and Kaikki's: "singular construct state form of שנה
(shaná)" under שנת at Daniel 1:1, "Form of ל־ (l-) including second-person
masculine plural personal pronoun as object", "masculine plural definite
form of טוֹב (tóv)". Same ask there: `form_of` with the target key and
relation, and `resolved` with the target's first English under the same
source, in the next zone bake. The dictionary store's 195,341 readings hold
none (7 records carry Hebrew, none a pointer).

## 3. The meta-replacement file: review the map

The owner wants the hundreds of R2 builds deletable. The condition, by the
owner's own rule, is one overlapped build that carries everything the site
serves, so that no deletion can take an input the serve still needs. The
page side mapped what that file must hold: the notes repo,
`wip/2026-10-18/meta-file-map/` (README, MAP, SURVEYS, JUDGING, CHANGES,
designs, scripts). The site serves 0.343 GB; its R2 inputs are about 2.9
GB; the zone bins (591 MB, remakeable from history by
restore-shelf-from-history-v1, RESTORE_OK 2026-10-03) are the one input
that lives only in a session unless step 0 copies them to R2 cas/.

Ask: read MAP.md against your build ledgers and say, per row, whether the
input it names is (a) in R2 under a path you own, (b) derivable from another
kept input by a named tool, or (c) nowhere but a session. For (c), the
owner decides on step 0. Then the deletion ledger can resume, one tier at a
time, with the map as its keep list. No writes to R2 from this side until
the owner names them.

## 4. Pieces with no English (piece store v2.1), small

Counted on the served piece store, 19 October: 3,095 MACULA rows (2,931
DIVISION, 160 WHOLE_WORD, 4 RUN) at 3,079 places carry `null` or an empty
English, and 24 TAHOT rows at 11 places (Daniel 10:19:10 and its kin, which
name no record at all). The MACULA blanks are mostly the object marker אֶת
(314 as the piece אֶתְ alone, hundreds more pointed otherwise), the article
ה (291), and פְּנֵי inside לִפְנֵי (196). At 3,077 of the 3,095 the other
source reads the same range ("<obj.>", "the", " before"); 42 have no
reading from either source.

Ask: say which it is, per row: MACULA prints nothing there (a function word
its English leaves untranslated, which the page should draw as a typed gap
with MACULA's name on it), or the bake lost the slice. For the 11 TAHOT
places with no record, the record. The page will not invent an English for
any of them.

## Not asked, for the record

- Most of what the owner circled as blank on the page ("+ the + people",
  "+ saying", "+ it") is the page's own signs-off gap: the piece store reads
  "<obj.>", "<to>", "the", "it" there. That is a page toggle question for
  the owner. Ask 4 is the remainder.
- The search transliteration (18 October) stays NOT SENT.
