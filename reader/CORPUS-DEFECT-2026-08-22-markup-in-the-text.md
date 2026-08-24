# Corpus defect · 2026-08-22 · the ingest swallowed the page, not the text

For the corpus lane. Found while answering a question about a two-word count
gap in Genesis. The gap was real, the explanation was not what either lane
assumed, and following it down found something larger.

**Short version: the sealed chain carries raw HTML markup as scripture. 377
occurrences in I Kings, 51 in Genesis. They are on the live site right now,
printed as words, with glosses under them.**

## What a reader sees today

I Kings 1:13, third word:

    <b/>|<thinsp;<b&וּבֹ֣אִי

printed as a word block, glossed "X again". The verse is otherwise correct.

## What the rows actually are

Serving `tanakh/i-kings` and `tanakh/genesis` from the sealed artifacts and
classifying every `exact_surface_form`:

| work | c0 rows | raw markup | apparatus as text | mid-word split |
|---|---:|---:|---:|---:|
| I Kings | 11,368 | **377** | 33 | 0 |
| Genesis | 17,807 | **51** | 137 | 5 |
| Ruth | 1,132 | 0 | 12 | 1 |
| Aramaic Targum to Ruth | 2,139 | 0 | 0 | 0 |

Every one of those 616 occurrences is listed by c0 id in
`data/corpus-defect-manifest-2026-08-22.json`, emitted by
`tools/check-corpus-clean-v1.mjs`. Run that tool against a serve after a
re-ingest; an empty markup column is the proof, and it exits non-zero while
any markup remains.

The markup is Hebrew Wikisource's own, ingested verbatim:

    'וּבֹ֣אִי&thinsp;<b>׀</b>'                     paseq wrapped in bold
    'אֶֽת־<span'                                   an opening tag, split
    'class="mam-kq-q">[עַבְדְּךָ֔]</span>'          qere, as markup
    'class="mam-kq-k">(עבדיך)</span></span>'       ketiv, as markup
    'class="mam-spi-samekh">{ס}</span>&nbsp;&nbsp;…' setuma marker
    'class="footnote">(בספרי'                      a footnote, opened
    'מִנְּשֽׂוֹא)</i>׃'                              …and closed, mid-verse

Alongside the markup, the notes it wrapped came in as text too — at Genesis
4:13 and 9:29, `בספרי ספרד ואשכנז` ("in Sephardic and Ashkenazic books"); at
5:1, `בספרי תימן בסמ״ך גדולה` ("in Yemenite books, with a large samekh"); at
41:45, 41:50 and 46:20, `בספרי תימן בתיבה אחת` ("in Yemenite books, as one
word"). Genesis 7:11 and 49:4 additionally carry an entire unpointed
duplicate of their own verse.

## Why this also explains the word-count gap

Genesis has five c0 rows whose whole surface is a single letter:

    1:1    בְּ | רֵאשִׁית
    2:4    בְּ | הִ | בָּרְאָם
    5:1    סֵ | פֶר      (inside the ingested footnote)
    27:46  קַ | צְתִּי

The obvious reading is "c0 records morphology, one row per morpheme." It does
not. **10,848 other Genesis rows begin with the same prefix letters
(ו 4,133 · ה 1,516 · ל 1,394 · ב 1,370 · מ 934 · ש 768 · כ 733) and are not
split.** Five splits against ten thousand counterexamples is not a grain
rule; it is damage.

And the damage has one cause with the rest of this report. Every split falls
exactly where the source page wraps *part of a word* in a tag for a scribal
feature — the small he of בְּהִבָּרְאָם, the large samekh of סֵפֶר. The
tokenizer broke on tag boundaries. The proof is at Genesis 5:1, where the
footnote that says *"in Yemenite books, סֵפֶר with a large samekh"* and the
split of סֵפֶר sit in the same verse, ingested together: the note explains the
markup, and the markup made the split.

## What this lane did and did not do about it

Did not: repair it reader-side. That has been tried here twice in one week,
in both directions — once merging rows wherever an English definition catalog
had an entry for the merged form (an English catalog deciding Hebrew
wordhood), once splitting them because "the chain's row count is the record."
Both were wrong, and `w-grain-rule-v1` was written to stop a third attempt.
It stopped this one: a Genesis rebuild was built, tested against the sealed
W list, found to disagree, and deleted unlanded.

Did: measure it, and say so here.

**Note for whoever rebuilds Genesis next.** The published `genesis.bin`
prints 7 words at 1:1 and matches the sealed W list character for character.
The builder in the repository today produces 8 for the same verse — it maps
c0 rows one-to-one and so inherits the split. Rebuilding Genesis with the
current tools would break a verse that is currently correct. `check-w-grain`
catches it for Genesis 1:1, which is the one section on this disk with a W
list; it would not catch the same fault anywhere else.

## The asks, in the order that helps most

1. **Re-ingest the Miqra text from the source's text, not its rendered HTML.**
   428 occurrences across two books are markup. This is the whole defect.
2. **Keep ketiv/qere, section markers, footnotes and manuscript notes as
   their own recorded layers**, not as occurrences of the work. The reader can
   render a qere or a setuma properly once it arrives as a marked thing; it
   cannot un-swallow one that arrived as a word.
3. **Then the five splits close on their own** — they are the same bug — and
   Genesis's 17,807 c0 rows and 17,805 W will agree.
4. **W lists per section.** The rule that would have caught all of this is
   already written and already enforced; it can only be checked where a W
   list exists, which today is 1 section of 1,533 in Genesis and none at all
   in I Kings, Ruth or the targums.

**A correction to an earlier reading of this.** Ruth is clean of *markup*,
not clean. It carries twelve unpointed ketiv forms as occurrences (יעשה,
מידע, שמלתך, וירדתי, ושכבתי, קניתי, לגאול …), one stray `י`, one section
marker, and one mid-word split — `לִ֣י [נִ] י`, which is לִינִי of Ruth 3:13
cut into three. So the ketiv-as-occurrence and mid-word-split faults reach
every Hebrew work measured; only the HTML fault is confined to Genesis and
I Kings.

The Aramaic Targum to Ruth is the one work with nothing at all: 2,139
occurrences, no markup, no apparatus, no splits. Whatever path it took
through the ingest is the one to look at first — it is the only proof on
this disk that the pipeline can produce a clean book.
