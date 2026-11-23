#!/usr/bin/env python3
"""Ship 19, patch 06: the pipeline document says that the leaders baked at rest still read only the rows that rest
open, and that the entry gate gathers BDB's entries for them from every row of the key, as the page does (patch 05).
Only words are added inside one sentence; the lines around it are kept as they stand. 23 November 2026.

Usage: python3 patch-19-06-pipeline-doc-leaders.py <reader dir>
"""
import sys
from pathlib import Path

p = Path(sys.argv[1]) / "PIPELINE.md"
t = p.read_text(encoding="utf-8")
MARK = "gathers BDB's own entries from every row of the key"
if MARK in t:
    print("stands already:", p)
    sys.exit(0)
old = """> bakes read only the rows that rest open, a word carries no headword's
"""
new = """> bakes read only the rows that rest open (the entry gate, asked for a
> leader at a kind of place, gathers BDB's own entries from every row of the key,
> as the page does, since 23 November 2026, when rows that rest shut began
> to carry them), a word carries no headword's
"""
assert t.count(old) == 1, t.count(old)
p.write_text(t.replace(old, new), encoding="utf-8")
print("patched", p)
