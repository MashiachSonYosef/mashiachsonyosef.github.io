# Corpus handoff · 2026-08-24

The corpus lane and the website lane now run on different machines, and the
road between them is GitHub. This is the runbook for the corpus side —
what to ship, how the website side verifies it, and the one law that was
not yet written down when the Hebrew came down.

## 1 · Ship the workspace

Push the contents of the corpus workspace ("999 footsteps") to a private
GitHub repository. The website lane will attach and clone it; nothing in it
is published by that alone.

- The files this lane is owed are named, with sizes, in
  `data/workspace-manifest-v1.json` — 89 of them. The rest of the workspace
  is welcome, but those are the debt.
- A file over 100 MB will be refused by GitHub; ship those through Git LFS
  (`git lfs track "*.csv.gz"` before adding, then commit and push as usual).

## 2 · How arrival is verified

On the website side, from the reader directory:

```
node tools/check-workspace-staged-v1.mjs --workspace <path-to-clone>
```

`present: 89 / missing: 0` is arrival. Anything less, the report names the
missing files and what each is for.

## 3 · The pair law, before the Hebrew returns

Where the source writes a ketiv and a qere it writes both, and its licence
is the licence of the pair: MAM prints the qere in square brackets and the
ketiv in parentheses, in the running text, as the text. The build that
selected one half is why every Hebrew work was withdrawn on 2026-08-23.
The rule is now declared and guarded — `kq-rule-v1-both-halves-as-written`,
held by `tools/check-kq-carried-v1.mjs` — and a rebuilt zone that stands on
MAM must carry:

- `emitted_from.kq_policy: "BOTH_HALVES_AS_WRITTEN"`
- on each paired word, `kq: { q, k }` — the qere wearing its `[ ]`, the
  ketiv its `( )`, exactly as the source bytes have them
- for a book that truly carries no pair, `emitted_from.kq_none_attested`
  naming the record that says so

A zone that arrives without these does not serve. The reader's display of
the pair (both visible; a selection routing only the English; the Hebrew
never departing from what the licence fixed) is the website lane's work and
waits on the first conforming zone.

## 4 · Also owed, when convenient

- The sealed W lists (`check-w-grain-v1` runs red until the first one lands).
- The Y ledgers for works still on `TYPED_AWAITING_LEDGER` basis.

The website lane is this repository, branch `gh-pages`. Everything it does
to what you ship is derived, checked, and pushed back where you can read it.
