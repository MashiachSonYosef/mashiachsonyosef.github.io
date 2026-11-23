#!/usr/bin/env python3
# Ship 20 (23 November 2026): the row entries' lists the tree's pin names, found by their bytes. Ship 20 moves no entry;
# its store steps run the entries' tool once more, dry, to show it has nothing to write, and the tool refuses a list its
# pin does not name. So each list the pin names (data/row-entries/PIN.json, lists[].list, and each list beside one that
# a fact is read from, lists[].facts_from[].list, as ship 19 pins relay v211's beside relay v218's) is found by its sha256 among
# the tree's own folder for it, the environment's ROW_ENTRIES_LISTS (colon-separated) and the files named here, on main
# and on main with ship 19 alike. Prints the paths, one per list in the pin's order, or says which is not found.
# Usage: pinned-entry-lists-20.py <reader dir> <ROW_ENTRIES_LISTS> [more candidate files...]
import gzip, hashlib, json, os, sys

R = sys.argv[1]
cands = [c for c in sys.argv[2].split(":") if c] + sys.argv[3:]
pin = json.load(open(os.path.join(R, "data", "row-entries", "PIN.json"), encoding="utf-8"))
seen = {}
def sha_of(path):
    if path not in seen:
        try:
            b = open(path, "rb").read()
        except OSError:
            seen[path] = None; return None
        seen[path] = (hashlib.sha256(b).hexdigest(), hashlib.sha256(gzip.decompress(b)).hexdigest() if b[:2] == b"\x1f\x8b" else None)
    return seen[path]
out = []
for l in pin.get("lists", []):
  for x in [l] + list((l.get("facts_from") or {}).values()):
    want = (x.get("list") or {}).get("sha256")
    here = [os.path.join(R, "data", "row-entries", x.get("folder", ""), (x.get("list") or {}).get("file", ""))]
    hit = next((c for c in here + cands if sha_of(c) and want in sha_of(c)), None)
    if not hit:
        print(f"the row entries' pin names {l.get('name')}'s list {(x.get('list') or {}).get('file')} ({str(want)[:12]}), and no file given is those bytes"); sys.exit(1)
    if hit not in out: out.append(hit)
print(" ".join(out))
