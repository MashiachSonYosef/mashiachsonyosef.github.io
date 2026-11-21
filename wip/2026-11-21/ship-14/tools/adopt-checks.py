#!/usr/bin/env python3
"""Ship 14: the five builders' checks, made checks of the repository.

Each builder handed back a browser check written against a served copy (--base). Here each becomes
tools/check-readers-faults-<name>-v1.mjs: the repository's header (RUN, LEDGER), Playwright found the repository's
way, and the tree served by the check itself unless --base or SERVE_BASE names another (the live build, to see the
laws red before the mend). Nothing else of a check is changed.

Usage: python3 adopt-checks.py <builders dir> <reader dir>
"""
import re
import sys
from pathlib import Path

BUILD, READER = Path(sys.argv[1]), Path(sys.argv[2])
WHAT = {
    "rail": "the panel of switches, the search and a section laid again (the third reader's findings 3, 4, 6, 9, 13 and 15)",
    "pairs": "a pair written one way and read another: its rulings and the source switches (the first reader's findings 1, 4 and 9)",
    "place": "a card stays at its word when a pill is pressed (task 130, the card that moved)",
    "load": "the load, the export and the card's head (the first reader's findings 5, 6, 7, 10 and 11)",
    "cards": "the card's memory, a failed shard, and a run's card and line (the second reader's findings 2, 4, 9, 10, 11, 12 and 13)",
}
for name, what in WHAT.items():
    src = (BUILD / name / "check.mjs").read_text(encoding="utf-8")
    out_name = f"check-readers-faults-{name}-v1.mjs"
    lines = src.split("\n")
    if lines and lines[0].startswith("#!"):
        lines = lines[1:]
    src = "\n".join(lines)
    # the usage line names the repository's file
    src, n_use = re.subn(r"node check\.mjs --base http://127\.0\.0\.1:(?:<port>|\d+)", f"node tools/{out_name} [--base <a served reader>]", src)
    assert n_use >= 1, (name, "usage line")
    # Playwright the repository's way
    old = 'import { createRequire } from "node:module";\nconst { chromium } = createRequire(import.meta.url)("playwright");'
    if src.count(old) != 1:
        old = 'import { createRequire } from "node:module";\nimport { readFileSync } from "node:fs";\nconst { chromium } = createRequire(import.meta.url)("playwright");'
        assert src.count(old) == 1, (name, "playwright lines")
        keep = 'import { readFileSync } from "node:fs";\n'
    else:
        keep = ""
    new = (keep + 'import { dirname, join } from "node:path";\n'
           'import { fileURLToPath } from "node:url";\n'
           'import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";\n'
           'import { serveTree } from "./serve-tree-v1.mjs";\n'
           'const { chromium } = await loadPlaywright();\n'
           '// the tree is served here, unless --base or SERVE_BASE names another (the live build, to see these laws red)\n'
           'const TREE = process.argv.includes("--base") || process.env.SERVE_BASE ? null : await serveTree(join(dirname(fileURLToPath(import.meta.url)), ".."));\n'
           'const SERVED = process.env.SERVE_BASE || (TREE ? TREE.base : "");')
    src = src.replace(old, new)
    assert src.count('"http://127.0.0.1:8899"') == 1, (name, src.count('"http://127.0.0.1:8899"'))
    src = src.replace('"http://127.0.0.1:8899"', "SERVED")
    assert src.count("chromium.launch()") == 1, (name, "launch")
    src = src.replace("chromium.launch()", "chromium.launch(launchOptions())")
    assert "8899" not in src and "127.0.0.1" not in src, (name, "an address left")
    head = ("#!/usr/bin/env node\n// RUN: tree\n// LEDGER: -\n"
            "// no frame letter. A check opens the page and reads what it draws; it is not the ledger for anything.\n//\n"
            f"// FAULTS READERS REPORTED, PROVEN ON THE LIVE PAGE AND MENDED (ship 14, 21 November 2026): {what}.\n"
            "// Each law is a short scenario that failed on the build before the mend (c1ed776b65) and holds after it.\n"
            "// The readers' reports are of 10 November 2026; each was decided again in a browser before it was mended.\n//\n")
    (READER / "tools" / out_name).write_text(head + src, encoding="utf-8")
    print("wrote", out_name, src.count("\n") + head.count("\n"), "lines")
