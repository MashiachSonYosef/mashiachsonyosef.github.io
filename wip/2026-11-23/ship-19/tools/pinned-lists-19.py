#!/usr/bin/env python3
"""Ship 19 (23 November 2026): every list the tree's row entries' pin names, the lists beside a list (facts_from) among
them, each found by its sha256 among the file kept in the tree's folder for it and the candidates given (paths, or
lists of paths parted by ":"). Prints the paths found, one per list, in the pin's order; stops, naming the list, where
one is not here. Usage: python3 -I pinned-lists-19.py <reader dir> [candidate...]"""
import hashlib
import json
import os
import sys

R = sys.argv[1]
home = os.path.join(R, "data", "row-entries")
pin = json.load(open(os.path.join(home, "PIN.json"), encoding="utf-8"))
cands = [c for a in sys.argv[2:] for c in a.split(":") if c]
seen, out = {}, []


def sha(path):
    if path not in seen:
        try:
            seen[path] = hashlib.sha256(open(path, "rb").read()).hexdigest()
        except OSError:
            seen[path] = None
    return seen[path]


for l in pin.get("lists", []):
    for x, folder in [(l["list"], l["folder"])] + [(o["list"], o["folder"]) for o in (l.get("facts_from") or {}).values()]:
        got = [c for c in [os.path.join(home, folder, x["file"])] + cands if sha(c) == x["sha256"]]
        if not got:
            print(f"MISSING {x['file']} {x['sha256'][:12]} ({l['name']})")
            sys.exit(1)
        if got[0] not in out:
            out.append(got[0])
print("\n".join(out))
