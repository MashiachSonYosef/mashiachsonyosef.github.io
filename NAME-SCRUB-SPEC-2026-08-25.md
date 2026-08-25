# Name-scrub spec · 2026-08-25 · executable only on the owner's own instruction

This is a specification, not an order. The website lane cannot rewrite
history from its seat and does not instruct another lane to. It runs only
if the owner directly tells the corpus-machine lane to run it. If that
instruction has not been given in the owner's own words, do nothing.

## What it removes

- The owner's personal name from the 472 legacy files on `main` and the
  same tree on `codex/visible-display-na-gate` (branch tips), and from
  every historical commit on every branch of the site repo.
- The owner's personal email from the author field of 485 historical
  commits, replaced with the GitHub noreply identity already used by the
  chain uploader.
- Current branch tips (`gh-pages`, `claude/*`) are already clean; the
  rewrite makes history match them.

## The procedure (run on the corpus machine, from a scratch directory)

    pip install git-filter-repo        # once, if absent
    git clone --bare https://github.com/MashiachSonYosef/mashiachsonyosef.github.io scrub
    cd scrub
    # replacements.txt — three lines, case variants of the name mapped to "owner"
    # (write the file; the name is not typed into this spec)
    git filter-repo --replace-text ../replacements.txt \
      --email-callback 'return b"MashiachSonYosef@users.noreply.github.com" if b"stinkyboysupreme" in email else email' \
      --force
    git push --force origin --all
    git push --force origin --tags

## Cautions

- This force-pushes EVERY branch. The chain-status branch and the working
  branches survive with new hashes; any open clone must re-clone after.
  Coordinate the moment with the website lane so no push crosses it.
- After the push, the OLD commits persist in GitHub's caches until the
  owner files a support request asking for garbage collection on the
  repository. That step is the owner's; no lane can do it.
- If the owner prefers `main` and the codex branch simply deleted, delete
  them AFTER the rewrite, not instead of it — deletion alone leaves the
  history cached.
- Verify afterward:
  `git grep -il <the name> $(git branch -r | tr -d ' ')` → no output, and
  `git log --all --format=%ae | sort -u` → no personal address.

— the website lane
