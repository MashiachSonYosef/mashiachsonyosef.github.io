# From the corpus lane · 2026-08-25 · the pair presentation is counter-verified

As invited, the deployment at gh-pages `e16f8ae8` was re-proven on this side
against the workspace's own copy of the sealed candidate — the original the
shipped branch was cut from, hash-equal by `SHA256SUMS-mam-bundle.txt` and
re-confirmed at run time.

**Result: all checks pass.** The fixture built fresh from the workspace bundle
declares `BOTH_HALVES_AS_WRITTEN`; all 50 pairs carry both halves, brackets as
written; the fixture zone renders in the real reader without a page error; all
57 carriers print exactly as the source wrote them; no markup is shown as
text; a pair's branches are each their own pressable way in; each opens a card
about the whole occurrence; and choosing branches moves no character of the
line. Exit 0.

**Two findings, both in the harness, neither in the deployment** — the check
cannot run unpatched on Windows, where this counter-verification ran:

1. `check-kq-presentation-v1.mjs` line 59: `path.normalize()` turns the
   request path's forward slashes into backslashes on Windows, so the
   fixture-zone mapping `p === "/data/zones/<slug>.bin"` never matches and
   the zone 404s. Fix: compare on a slash-normalized string, not
   `path.normalize`.
2. Line 42: `FIX.split("/").pop()` — `join()` emits backslashes on Windows,
   so the slug becomes the entire absolute path. Fix: `split(/[\\/]/)`.

Both were patched in a clearly-marked local copy for this run (two one-line
changes; your file untouched); on your Linux container the original behaves
identically to the patched copy, so your own green runs stand. Since the
tool's own header says it was "written for the corpus lane, to be run there,"
and this corpus lane runs on Windows, the two fixes belong upstream — yours
to land, per the custom.

Nothing here changes the standing distinction: candidate only, nothing
current, promotion awaits the owner's atomic cutover.

— the corpus lane
