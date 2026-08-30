# The English-side referee census v1 — the M layer's missing corpora
Corpus lane, 2026-08-30. Probed live this session; license classes stated;
presence-in-current-routes marked for verification at acquisition time.

## Confirmed missing, open-licensed, same-channel (the big ones)
1. **BDB (Brown-Driver-Briggs, 1906, PD)** — served TODAY by Sefaria's own
   lexicon API alongside Jastrow. Same structured-dump channel our Jastrow
   came through. The scholarly biblical lexicon; its absence from our routes
   is the single largest definitional gap.
2. **BDB Augmented Strong (PD)** — also live in Sefaria's API: the
   BDB↔Strong's-number mapping, which buys every-occurrence concordance
   linkage for free.
3. **STEPBible lexicon data (TBESH etc., CC-BY)** — repo live; we already
   consume TAHOT tagging from this project but never took its LEXICONS.
4. **unfoldingWord Hebrew-Aramaic lexicon (UHAL, CC BY-SA)** — live on
   door43; a modern open lexicon built for translators.
5. **Gesenius (Tregelles translation, PD)** — digitized on English
   Wikisource under a variant page title (probe 404'd on my guess; the text
   is there — title to pin at acquisition).
6. **OpenScriptures Hebrew lexicon/Strong's XMLs (PD/open)** — repo layout
   moved; to re-pin.

## Adjacent and worth one look
- **JPS 1917 translation (PD)** — a D-source for route English at verse
  grain; we hold rights-encumbered JPS 2006 but not the free 1917.
- **Rodkinson Talmud (PD)** — weak scholarship, but PD English for Bavli
  display routes where nothing better is licensed.
- **Hebrew Wiktionary (ויקימילון, CC BY-SA)** — we take DBnary's extraction
  of English Wiktionary; the Hebrew-language Wiktionary is a separate,
  untapped witness pool.

## Exists but closed (typed, not pursued)
- CAL (Comprehensive Aramaic Lexicon) — research-use terms, not
  redistributable. Sokoloff DJPA/DJBA — copyrighted. Modern Israeli
  dictionaries (Even-Shoshan, Morfix) — copyrighted.

## The claim this census makes
The M layer's first pass took 2 of Sefaria's 4 lexicons and none of the
open biblical-scholarship stack (BDB, Strong's, Gesenius). Acquiring items
1–2 alone likely doubles route coverage on the Tanakh shelf where the
S-law currently surfaces thin defaults ("the Western Wall", "republic").
Every item above is acquisition work in construction's existing
source-class machinery; no new laws needed — M witnesses are M witnesses.

## Amendment (owner, 2026-08-30): the demand-driven M acquisition law

We do not import dictionaries; we import the datum the corpus asks for.
Acquisition = the deterministic join: candidate dictionary headwords ×
our attested K/W inventories → a per-dictionary DEMAND MANIFEST, ranked
zero-route keys first, then thin-pool keys, weighted by occurrence
frequency. Only manifest entries are acquired, each with per-entry
provenance (source, entry, year, byte-exact text). The criterion is
closed-world and re-runnable — the corpus's own attestation selects,
never taste. The manifest re-derives after every works wave, so M grows
in lockstep with the library. Next build from this lane: the thin-key
demand census (zero-route and thin-route keys from the route origins in
ldmprs), which turns this census's referee list into exact shopping lists.

## The demand census, built (corpus lane, 2026-08-30)

Staging: `corpus-lane/work/moses-thin-key-demand-census-v1/`. The join of
the route store (140,532 keys) against the attested W inventory
(1,277,980 canonical keys): **1.16M zero-route keys carrying 24.9M
occurrences; 72k thin-route keys carrying 10.7M more.** Top of the
zero-route list is the reader's real hunger: שנאמר (81k occurrences —
the citation formula on every rabbinic page), שאינו, שהרי, גמ׳, ע״כ.

Caveat, typed: many zero-route full-forms are prefix-fused; their
components may route via the span split, so the v1 ranking is candidate
demand, not proven reader-facing absence. v2 refines composition-aware.
The demand-manifest law stands: per-dictionary shopping lists = headword
joins against these CSVs, zero-route formulae first. Jastrow's entry for
שנאמר exists; the corpus is asking for it by name, 81,392 times.
