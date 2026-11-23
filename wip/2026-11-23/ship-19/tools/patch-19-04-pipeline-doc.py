#!/usr/bin/env python3
"""Ship 19, patch 04: the pipeline document says BDB's own entries land from both entry lists (relay v218), with English
Wiktionary's letters still read from relay v211's list beside it. Only the one line that said b waits is replaced; the
line after it is kept as it stands. 23 November 2026.

Usage: python3 patch-19-04-pipeline-doc.py <reader dir>
"""
import sys
from pathlib import Path

p = Path(sys.argv[1]) / "PIPELINE.md"
t = p.read_text(encoding="utf-8")
MARK = "BDB's own entries land from both lists since 23 November 2026"
if MARK in t:
    print("stands already:", p)
    sys.exit(0)
old = """> word; BDB's entries from a list are counted and not written until relay
"""
new = """> word; BDB's own entries land from both lists since 23 November 2026, as
> relay v218 reissues them with relay v212's two answers (English
> Wiktionary's letters are still read from relay v211's list, which names
> the same rows line for line: the pin's facts_from); they were counted and
> not written until relay
"""
assert t.count(old) == 1, t.count(old)
p.write_text(t.replace(old, new), encoding="utf-8")
print("patched", p)
