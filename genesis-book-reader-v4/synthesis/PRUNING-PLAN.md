# Pruning plan — 2026-08-11

The POC is finished, so what the reader consumes is now measurable
rather than guessable. This is the plan for making the corpus fit,
written from that measurement. Synthesis lane.

Everything marked **measured** was computed from the shipped data.
Everything marked **projected** is arithmetic on those measurements and
is labelled as such.

---

## The problem is not storage. It is that the corpus is stored per occurrence.

**Measured.** Genesis 1:1 is 5.71 MB of HUD fixture for **seven words**.
Genesis is 17,808 word occurrences. At that rate the book is ~14 GB and
the project cannot cover its own first chapter, let alone Torah.

Two prunes were tried against that number. Only the second one works.

### Prune 1 — drop unread fields. Real, insufficient.

Of 162 field slots in the fixture, the reader reads 35. Dropping the
other 127 — the whole `presentation` ranking subtree, every `stats`
counter, definition-level `helperRoutes`, the S-layer bookkeeping
(`sWitnessId`, `sStatus`, `pGroupIds`, `supportCount`) — gives:

```
before 5.71 MB · 143,479 leaves
after  2.39 MB ·  42,245 leaves      −58.1%      (measured)
```

`evidenceOnlyDefinitions` is **kept** despite being currently unread:
those 32 records are the verse-aligned contextual glosses, and for four
of the seven words they hold the only correct reading. They are the fix
for the "Palestine" default, not waste.

58% off is worth having, but 2.39 MB ÷ 7 words is still 341 KB per word,
so Genesis is still ~6 GB. The format is the constraint, not the fields.

### Prune 2 — store by form, not by occurrence. This is the one.

**Measured.** Inside Genesis 1:1 there are 21 cells but only **18
distinct L-bundles** — three are byte-identical objects shared across
different words (ב in בראשית and ברא; את in words 4 and 6; ה in words 5
and 7) and get serialized twice anyway. Average unique bundle: 102 KB.

An L-bundle is a property of a **Hebrew form**, not of a position in a
verse. The join key already exists in the data and is never read:
`cells[].kNormalizedKey`. Every occurrence of את in Genesis wants the
same bundle.

**Measured**, from the corpus's own token indexes:

| work | occurrences | unique forms | forms that matched a dictionary |
|---|---|---|---|
| `tanakh/genesis` | 17,808 | 11,363 | **3,744** |
| `tanakh/rashi-on-genesis` | 41,392 | 14,570 | 5,014 |
| `targum/targum-jonathan-on-genesis` | 27,751 | 9,226 | 894 |

Only a form that matched needs a bundle at all; an unmatched form has no
routes to store. So Genesis needs **3,744 bundles, not 17,808**.

**Projected**, at the measured 102 KB average:

```
per occurrence   17,808 × 341 KB  ≈ 6.1 GB      does not fit
per form          3,744 × 102 KB  ≈ 382 MB      fits
                                    ~16× smaller
```

382 MB is a **ceiling**, and a loose one: the 102 KB average comes from
the seven words of Genesis 1:1, which are among the most heavily attested
words in the language (בראשית, ברא, אלהים, את, הארץ). Route counts follow
a power law — rare forms carry one or two records, not 356. The true
average across 3,744 forms will be far below 102 KB.

Worst case, if matching improves and **every** unique form gets a bundle:
11,363 × 102 KB ≈ 1.2 GB. Still bounded, still fits. That is the point —
storage stops scaling with text length and starts scaling with
vocabulary, which is finite.

---

## What this makes of the existing 11.9 GB

**Measured**, by sampling median file size × file count across
`origin/main`:

```
lexical/chunks         10,199 files   ~7.74 GB
lexical/token-indexes   1,366 files   ~1.53 GB
lexical/occurrences     1,366 files   ~0.78 GB
definitions             8,073 files   ~0.62 GB
sources                 1,361 files   ~0.52 GB
corpus index.html       1,366 files   ~0.41 GB
everything else                       ~0.30 GB
```

Almost all of it is the same disease. **Measured** on 15 cached
`rashi-on-genesis` chunks: 47.1% of chunk bytes are `lexicon`, 36.8% are
`source_rows`, 21.6% is the actual token payload — and **2,966 of 2,966**
distinct embedded entries already exist in the shared 41.2 MB
`source-layers/` pool. Zero are work-specific. `tools/slim-lexical-chunks.mjs`
removes the embedded copies and measures **−79.8%** on that work
(18.40 MB → 3.71 MB), refusing any chunk whose ids would not resolve.

And a third of the stored bulk describes nothing: Genesis matched 3,744
of 11,363 forms; Peri Tzadik matched 9,926 of 57,464. The sitewide rate
is 26.5%. Most of what is stored per occurrence is stored for a token the
pipeline never resolved.

---

## Order of work

1. **Slim the chunks.** Tool exists and is proven on one work; the
   consumer must resolve `lexicon_entry_id` against the pool first.
   `−79.8%` measured, ~6 GB projected corpus-wide.
2. **Re-key the HUD by form.** One bundle per `kNormalizedKey`, verses
   reference it. This is the change that decides whether Genesis is
   possible. Needs a new emitter; the old one
   (`build_genesis_1_1_pass.mjs`) is not in the repository, so this is a
   rewrite either way.
3. **Prune fields on the way through.** `tools/prune-hud-to-consumed.mjs`
   exists; fold it into the emitter rather than running it as a pass.
4. **Store nothing for unmatched forms.** They have no routes; a token
   index entry is enough.

Steps 1 and 3 are reversible and safe today. Step 2 is the one worth
doing carefully, because it is the difference between a proof on one
verse and a reader that covers a book.

## What is not pruned

Route depth. A common word carrying 356 dictionary records keeps all 356
— that depth is the project, and the reader already handles it (ten pills,
the rest in a filterable panel, ordered by antiquity). Pruning routes
would be pruning the thing worth having. The waste is writing those 356
records down again for every occurrence of the word, not holding them
once.
