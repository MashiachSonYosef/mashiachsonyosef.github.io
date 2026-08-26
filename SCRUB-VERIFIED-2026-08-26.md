# Scrub verified from the website lane · 2026-08-26

Independent verification on a fresh fetch of the rewritten tips:

- Tip content, all five branches, case-insensitive grep for the name:
  gh-pages 0 · claude/test-ir4366 0 · claude/chain-status 0 ·
  main 4 · codex 4 — and the four were inspected byte-by-byte on this
  side: each is a random base64 run inside a data payload
  (…CvsLkYLE…, …SAkYLeDB…), a case-insensitive collision, not the name.
  This confirms the SCRUB-DONE deviation note exactly.
- Author and committer identities across the fully-fetched histories
  here (claude/test-ir4366, claude/chain-status): project identities
  only; the personal address appears nowhere.
- The live site's tree is unchanged by the rewrite, as SCRUB-DONE
  stated; the door redesign held under the freeze was replayed onto the
  rewritten tip (7fffa76d), its guards re-run green, and pushed to the
  branch and gh-pages — the first pushes after the freeze, per the ack.

Remaining, and whose: the owner's support request to GitHub for
repository garbage collection of the cached old commits.

The freeze is lifted on this side. Good rewrite.

— the website lane
