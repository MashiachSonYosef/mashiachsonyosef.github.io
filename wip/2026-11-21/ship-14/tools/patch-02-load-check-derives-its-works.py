#!/usr/bin/env python3
"""Ship 14, patch 02: the adopted load check takes two of its works from the shelf, not from its own source.

check-scope-derived-v1 holds that no tool names a work by a zone's path or by a slug of the plan. The builder's check
named Genesis (the plan's own work) for the run files and Amos's bin by its path for the faults at load. Both laws
need only a book the run indexes list, so the check asks the served indexes for the first book both list and uses it
for the run files and for the faults at load.

Usage: python3 patch-02-load-check-derives-its-works.py <reader dir>
"""
import sys
from pathlib import Path

path = Path(sys.argv[1]) / "tools" / "check-readers-faults-load-v1.mjs"
src = path.read_text(encoding="utf-8")


def rep(old, new, n=1):
    global src
    assert src.count(old) == n, (src.count(old), old[:80])
    src = src.replace(old, new)


rep('''  const BOOK = "genesis";
''', '''  const BOOK = await runBook();
  if (!BOOK) { law("6", "at rest a book asks for neither run file", false, "no book stands in both run indexes of this build"); return; }
''')
rep('''    ["the book’s bin dropped", await said("amos", "**/data/zones/amos.bin*", "abort"), false],
    ["the book’s bin answered 503", await said("amos", "**/data/zones/amos.bin*", "503"), false],
''', '''    ["the book’s bin dropped", await said(SHELF, `**/data/zones/${SHELF}.bin*`, "abort"), false],
    ["the book’s bin answered 503", await said(SHELF, `**/data/zones/${SHELF}.bin*`, "503"), false],
''')
rep('''    ["the catalog’s index dropped", await said("amos", "**/data/route-store/index.json*", "abort"), false],
''', '''    ["the catalog’s index dropped", await said(SHELF, "**/data/route-store/index.json*", "abort"), false],
''')
rep('''  const ABSENT = "No book is published on this page yet";
''', '''  const ABSENT = "No book is published on this page yet";
  const SHELF = await runBook();
  if (!SHELF) { law("11a", "a fault at load is said as a fault", false, "no book stands in both run indexes of this build"); return; }
''')
# the one derivation, before the first law that uses it
anchor = "// ---- 6 ----"
assert src.count(anchor) == 1
rep(anchor, '''// a book of the shelf for the laws that need any served book with run files: the first, in the indexes' own
// spelling order, that both run indexes of the served build list (asked of the build, never typed here)
let RUN_BOOK;
const runBook = async () => {
  if (RUN_BOOK !== undefined) return RUN_BOOK;
  const ask = (f) => fetch(`${BASE}/data/${f}/index.json`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  const [cards, runs] = await Promise.all([ask("run-cards"), ask("hud-runs")]);
  const both = cards && runs ? Object.keys(cards.books || {}).filter((b) => runs.books && runs.books[b] && runs.books[b].runs).sort() : [];
  RUN_BOOK = both[0] || null;
  return RUN_BOOK;
};

''' + anchor)
path.write_text(src, encoding="utf-8")
print("patched", path)
