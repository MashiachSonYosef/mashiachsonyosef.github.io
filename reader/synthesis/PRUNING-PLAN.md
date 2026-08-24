# Pruning plan — 2026-08-11 (amended 2026-08-12)

> **Amendment, on reading the workshop.** With `999 footsteps` connected,
> the workspace-storage half of this document is superseded by
> `corpus-refinement-v1/whole-workspace-storage-plan-v1.json` — a sealed,
> zero-action classification of the full 243.5 GB (measured, 1,001,497
> files: 178.8 GB under `research/`, 64.7 GB outside it), with nine
> deletion gates (G0–G9), SHA-256 allowlists, and cold-copy restore
> probes required before any byte moves. That plan is Bezalel's and it is
> stricter than anything below; nothing here authorizes an action it does
> not. Its own projection lands the workspace at a 44–49 GB steady state.
> What survives of this document is the part about the **published**
> repository and reader — the gh-pages/GitHub slice — which is this
> lane's to keep small.

The POC is finished, so what the reader consumes is now measurable
rather than guessable. This is the plan for making the corpus fit,
written from that measurement. Synthesis lane.

Everything marked **measured** was computed from the shipped data.
Everything marked **projected** is arithmetic on those measurements and
is labelled as such.

---

## Correction, and where the disk actually went

Two errors in the first version of this document, both mine.

**1. The tree is ~20 GB, not 11.9 GB.** The first estimate multiplied file
count by *median* size. File sizes are heavily skewed — on the blobs
whose real sizes are available, mean/median is **10.7×** — so medians
understate badly. Re-measured with means over random samples per area:
**~20.2 GB**.

**2. The repository is not where the disk is.** `main` is **one commit**.
`gh-pages` is 21. There is no history bloat: a chunk file that has been
rewritten many times locally still has exactly one version committed.
The repo is ~20 GB, full stop.

So a ~300 GB working folder is **not** the repo. It is the material the
project deliberately keeps out of it. From `.gitignore` on `main`:

```
data/lexical/.cache/
data/import-cache/
.local-cache/
.codex-tmp/
data/workbench-evidence/*.json          data/workbench-evidence/*.jsonl
data/workbench-evidence/*/*.json        data/workbench-evidence/batch-runs/
data/paraphrase-evidence/prototype-*.json
**/overlay-export.csv                   **/overlay-export.json
**/overlay-export.md
```

with the project's own comment on the largest of them:

> `# Generated high-volume workbench evidence stays local; regenerate with scripts.`

That is the answer, and it needs no proof of regenerability from me —
**git already declares these are not inputs.** A path in `.gitignore` is
by definition not a source of truth; it was excluded precisely because it
is bulky and rebuildable. Deleting it risks nothing but rebuild time.

Measure them (PowerShell, from the repo root):

```powershell
'.local-cache','data\lexical\.cache','data\import-cache','.codex-tmp',
'data\workbench-evidence','data\paraphrase-evidence' | ForEach-Object {
  $s = (Get-ChildItem $_ -Recurse -File -EA SilentlyContinue | Measure-Object Length -Sum).Sum
  '{0,9:N2} GB  {1}' -f ($s/1GB), $_
}
$o = (Get-ChildItem -Recurse -File -Include overlay-export.* -EA SilentlyContinue |
      Measure-Object Length -Sum).Sum
'{0,9:N2} GB  overlay-export.* (scattered across work folders)' -f ($o/1GB)
```

Order of attack, by ratio of size to risk:

1. **The gitignored caches.** Zero risk, likely most of the 300 GB.
2. **Derived artifacts inside the repo** (~19.6 GB of the 20 GB) — the
   keep-list below. Needs the three-work regenerability proof first.
3. **Format** — per-form instead of per-occurrence, so what comes back is
   small. Everything after this section.

## The short version: two inputs. Everything else is output.

The repository declares its own dependency graph, in
`scripts/generate_build_graph.mjs`:

```js
depends_on: {
  overlay:         ['source'],
  lexical_cache:   ['source', 'lexical_source_layers'],
  lexical_payload: ['token_index', 'lexical_source_layers'],
  html:            ['source', 'overlay', 'occurrence', 'lexical_manifest', 'renderer'],
  public_exports:  ['source', 'token_index', 'lexical_manifest'],
}
```

Trace it to the roots and only three things are not the output of
something else: **`source`** (the captured Hebrew, with its license
custody), **`lexical_source_layers`** (the dictionary pool), and
**`renderer`** (the scripts). Every other artifact in the repository is
derived, and can be rebuilt from those.

| | files | size | |
|---|---|---|---|
| `data/sources/` | 1,361 | **~1.39 GB** | **ROOT** — captured text + license, the one irreplaceable thing |
| `data/lexical/source-layers/` | 9 | **~0.04 GB** | **ROOT** — 14,652 dictionary entries |
| `scripts/` (the ~308 real ones) | 308 | ~0.01 GB | **ROOT** — the renderer |
| the reader itself | ~80 | ~0.02 GB | the product |
| — | | | |
| `data/lexical/*-chunks/` | 10,199 | ~7.95 GB | derived · `lexical_payload` |
| `data/lexical/token-indexes/` | 1,366 | ~2.73 GB | derived · `lexical_cache` |
| `data/lexical/occurrences/` | 1,366 | ~2.60 GB | derived · `lexical_cache` |
| `data/definitions/` | 8,073 | ~0.97 GB | derived · route build |
| corpus `index.html` (1,366 works) | 1,366 | ~0.80 GB | derived · `html` |
| `data/public-lexical/`, `public-hud/` | 12,888 | ~0.85 GB | derived · `public_exports` |
| `data/lexical/` manifests, overlays | 2,727 | ~0.36 GB | derived |
| unclassified remainder | 5,230 | ~2.32 GB | mixed |
| `reports/` | 4,932 | ~0.01 GB | agent workflow ledger — no runtime role |
| `scripts/` one-shot `agentN` files | 753 | ~0.01 GB | spent bookkeeping |

**Keep ~1.45 GB. Regenerate the other ~18.8 GB.** 93% of the committed
repository is output stored alongside its own inputs — and that is before
counting the gitignored caches above, which are larger still.

That is the whole answer, and it is the same shape as every other finding
today: the corpus writes down, once per occurrence, a fact that is true
once. Chunks re-embed a 41 MB dictionary 10,199 times. HUD fixtures
re-embed a bundle per word instead of per form. The pipeline commits its
outputs next to its inputs. Same mistake, three scales.

### Sequence

1. **Confirm regenerability before deleting anything.** Pick three works,
   delete their derived artifacts, rebuild from `source` +
   `source-layers`, diff. If the rebuild is byte-identical the graph is
   honest and the rest follows. If it is not, the delta is the real root
   set and it must be found before a single file is removed.
2. Delete derived artifacts, largest first: chunks, token-indexes,
   occurrences, definitions, public exports.
3. Keep `reports/` out of the repository going forward — it is a work
   log, not a build input.
4. Then apply the format changes below, so what gets regenerated is
   per-form rather than per-occurrence.

Step 1 is not optional. The build graph is a declaration, not a proof,
and two generators named in the provenance of shipped files
(`build_genesis_1_1_pass.mjs`, the lexical enricher that produced
`possible_entries`) **are not in the repository**. Anything only those
tools can produce is not regenerable and must be treated as a root until
proven otherwise. Find out on three works, not on eleven gigabytes.

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
the seven words of Genesis 1:1, which are among the most heavily recorded
words in the language (בראשית, ברא, אלהים, את, הארץ). Route counts follow
a power law — rare forms carry one or two records, not 356. The true
average across 3,744 forms will be far below 102 KB.

Worst case, if matching improves and **every** unique form gets a bundle:
11,363 × 102 KB ≈ 1.2 GB. Still bounded, still fits. That is the point —
storage stops scaling with text length and starts scaling with
vocabulary, which is finite.

---

## What this makes of the committed ~20 GB

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

## Order of work — format (after the keep-list above)

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

Note the interaction with the keep-list: if the derived layers are being
regenerated anyway, steps 1–4 should be applied to the *emitter* rather
than run as passes over old output. Prune once, on the way out.

## What is not pruned

Route depth. A common word carrying 356 dictionary records keeps all 356
— that depth is the project, and the reader already handles it (ten pills,
the rest in a filterable panel, ordered by antiquity). Pruning routes
would be pruning the thing worth having. The waste is writing those 356
records down again for every occurrence of the word, not holding them
once.
