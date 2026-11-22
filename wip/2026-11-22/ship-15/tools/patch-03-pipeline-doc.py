#!/usr/bin/env python3
"""Ship 15, patch 03: the pipeline document says English Wiktionary's list lands STEP's letters too (relay v211)."""
import sys
from pathlib import Path

p = Path(sys.argv[1]) / "PIPELINE.md"
t = p.read_text(encoding="utf-8")
old = """> pointed head form meets: the numbers land, and STEP's letters and BDB's
> entries from a list are counted and not written, as the pin says) and whether its source gives"""
new = """> pointed head form meets: the numbers land; STEP's letters land from
> English Wiktionary's list since 22 November 2026, as relay v211 widens
> them by TBESH's own columns so that none holds back a letter of the same
> word; BDB's entries from a list are counted and not written until relay
> v218, as the pin says) and whether its source gives"""
assert t.count(old) == 1
p.write_text(t.replace(old, new), encoding="utf-8")
print("patched", p)
