# K-lane repair spec — for Oholiab's agents (2026-08-11, rev 2)

Repairs in the lexical corpus (`data/lexical/`, main branch). The reader
needs no changes for any of them: when the corpus updates, the shard
generator reruns and the words re-derive. Findings and receipts:
`synthesis/HOSTILE-REVIEW-2026-08-11.md` §0–2.

**Rev 2 changed the priority order.** The synthesis lane found a defect
of its own first (review §0): the generator was reading only
`lexicon.entries` and ignoring `token_index.forms[].surface_renderings`,
where the corpus records its *contextual* resolution. Shard rule v2 now
consumes that layer and lets it lead. Consequence for the K lane: **the
contextual resolution layer is the highest-leverage place to put work**,
because whatever lands there now leads the reader directly. Repair 0 is
new and comes first.

## Repair 0 · Extend contextual resolution coverage (highest leverage)

`token_index.forms[]` already carries, for some forms:
`surface_renderings[]`, `surface_context_status`, `surface_context_note`,
and sometimes `breakdown[]`. Where present it is *right*, and it is now
what the reader shows. Observed statuses: `resolved_particle`,
`resolved_prefix_base`, `resolved_abbreviation`, `resolved_affix_parser`.

Coverage today is thin: **4 of the 64 words in Rashi on Genesis 1:1:1**.
Those four are now correct in the reader (של → "of", לעמו → "to the
nation", וברצונו → "and delight", הקב״ה → "the Holy One, blessed be He").
Every additional form resolved here is a word that stops being led by a
homograph.

**Priority forms** (Rashi 1:1:1, currently wrong or held):
`הם` `לנו` `להם` `בה` `לכם` `מהם` `אתם` `שאם` `שהיא` `היא` `אלא`
`ראשונה` `שנצטוו` `שכבשתם` `בראה` `ונתנה` `נטלה` `לסטים` `אמות`
`מהחדש` `בבראשית` `שבעה`.

## Repair 1 · Short-form linking (הם → "egg")

Mechanism, confirmed from the data: the `הם` entry (lex-2a211473204c)
links twelve content words — H1 אָב "father", H1000 בֵּיצָה "egg", H1004
בַּיִת "house" — all carrying `match_key: "המ"`. Every one of those lemmas
has WLC surface forms bearing the 3mp possessive suffix ־הם ("their
father", "their egg"). **The matcher matched the standalone pronoun
against a suffix inside longer surface forms.** H1992 (הֵם "they") is in
the capture, but linked to המה/ההם — and, by the same bug, into the
בהמה "beast" family.

**Fix:** for forms ≤3 letters, require a whole-form match (optionally
with a clitic prefix), never a substring/suffix match; add the missing
bare-form links (`הם` → H1992 at minimum); strip containment false-links
(בהמה ↛ H1992). Verified-sane controls to regression-test against:
`הוא` ↔ H1931 and `את` ↔ H859 link correctly today.

## Repair 2 · Sense-span renderings (the comma split)

`strict_renderings` items are comma-fragments of one definition. Strong's
H4480 (מִן) is one sense span — "properly, a part of; hence
(prepositionally), from or out of…" — stored as
`['properly', 'a part of', 'hence (prepositionally)', 'from', …]`. Each
item becomes one selectable pill downstream, so one meaning presents as
eight, fragments like "properly" masquerade as senses, and parentheticals
arrive cut in half ("the earth (at large").

**Fix:** each `strict_renderings` item = one complete sense span. Split
on the source's own sense boundaries (for Strong's, roughly the
semicolons / numbered senses), never on commas. Keep parentheses balanced
within an item. Applies to every layer and every chunk lexicon.

## Repair 3 · License line on project-authored rows

Project-authored contextual records (e.g. `grammar-particle:של`) carry
the license string `"N/A - project lexical rule"`, which maps to no
declared posture, so the generator must skip them. **Fix:** use the exact
string `project-authored / CC0`, matching the existing project layers.
(Lower priority since rev 2 — the contextual layer already covers של —
but any project row the generator must skip is a record wasted.)

## Repair 4 · Populate `breakdown` for prefix/suffix compounds

`breakdown[]` is populated for 679 entries corpus-wide with the right
shape:

```json
[{"hebrew":"לָ־","strict_renderings":["to","for","toward","belonging-to"]},
 {"hebrew":"עַמּוֹ","strict_renderings":["nation","people"]}]
```

The compounds that produce the worst defaults (לנו, להם, בה, לכם, מהם)
have no single Strong's headword and no breakdown. Populating it makes
them decomposable rather than mis-matched. Note: the reader's HUD schema
supports multi-cell words natively (COMPspan/COMPcell, glosses join with
" + "), so once breakdown coverage exists, the generator can present
compounds part-by-part — that generator change is queued on this lane's
side, not yours.

## Contract the shard generator consumes (do not break)

- `token_index.forms[]`: `normalized_word`, `surface_renderings[]`,
  `surface_context_status`, `surface_context_note`, `breakdown[]`.
  **Consumed as of rule v2; leads all dictionary routes.**
- `lexicon.entries[]` keyed by `hebrew_word` (final-letter normalized),
  with `possible_entries[]`: `entry_key`, `lemma`, `source_name`,
  `source_family`, `source_id`, `strict_renderings[]`, `context_role`
  (`likely_contextual` leads), `source_row_keys`.
- Source rows: entry-level `source_rows[]` and/or chunk-level
  `source_rows` keyed `family|id|license`, carrying `license`,
  `license_url`, `source_url`.
- Stable `entry_id`s across chunks.

## Acceptance (rerun after corpus lands)

```
# refresh tools/corpus-cache/ from main, then:
node tools/generate-rashi-word-shards.mjs
node tools/test-word-shards.mjs        # against local :8321
```

Baseline to beat, measured today under rule v2: **49 woken / 15 held,
662 routes**, and by the review's §2 method **~184 fragment routes**.

Expected after repairs: הם defaults to "they"; לנו/להם/בה/לכם/מהם either
resolve contextually or decompose; fragment count collapses toward zero;
`skipped_unresolvable_license` rows disappear from
`synthesis/ledger-rashi-1-1-1-word-shards.json`. Everything else holds:
49+ words woken, audit PASS.
