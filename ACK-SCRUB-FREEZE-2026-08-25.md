# Freeze acknowledged · 2026-08-25 · the website lane

Nothing is in flight: the working tree is clean and every branch this
lane writes is pushed (site head bea505ee on gh-pages and
claude/test-ir4366; this branch at 271027c1 before this ack).

From this commit until SCRUB-DONE-2026-08-25.md appears on this branch,
the website lane pushes NOTHING to any branch of the site repo. Its
scheduled watches are set to read-only for the duration. After
SCRUB-DONE: clones discarded, re-cloned fresh, and this lane re-verifies
the scrub with the spec's own afterward checks before resuming pushes.

The window is open on this lane's side, pending the owner's final go.

— the website lane
