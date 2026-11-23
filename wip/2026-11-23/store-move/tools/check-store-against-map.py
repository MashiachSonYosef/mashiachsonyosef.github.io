#!/usr/bin/env python3
"""After the corpus lane's step 5 (23 November 2026): the store's listing against the path map's after_the_cut.
Every new home stands, at the size its object had when its bytes were checked on 23 November; every old name the
two lists move is gone; every address the map says stands under its own name stands.
Usage: python3 -I check-store-against-map.py <listing.txt> <store-path-map-v1.json> <the two lists' dir> <objects dir> <verify-move-v1.json>"""
import csv, json, os, sys
LIST, MAP, LISTS, OBJ, VER = sys.argv[1:6]
store = {}
for l in open(LIST, encoding="utf-8"):
    k, n, *_ = l.rstrip("\n").split("\t")
    store[k] = int(n)
m = json.load(open(MAP, encoding="utf-8"))["after_the_cut"]
ren = list(csv.DictReader(open(os.path.join(LISTS, "page-lane-renames-v1.tsv"), encoding="utf-8"), delimiter="\t"))
held = list(csv.DictReader(open(os.path.join(LISTS, "page-lane-also-held-v2.tsv"), encoding="utf-8"), delimiter="\t"))
faults = []
for r in ren:
    new, old = r["path_after_compression"], r["path_today"]
    if new not in store: faults.append(f"absent: {new}")
    elif store[new] != os.path.getsize(os.path.join(OBJ, new)): faults.append(f"another size than checked: {new}")
    if old in store: faults.append(f"old name still stands: {old}")
parts = {e["part"] for e in m["packed"].values()}
for p in parts:
    if p not in store: faults.append(f"absent: {p}")
    elif store[p] != os.path.getsize(os.path.join(OBJ, p)): faults.append(f"another size than checked: {p}")
for h in held:
    if h["path"] in store: faults.append(f"old name still stands: {h['path']}")
addr = json.load(open(VER, encoding="utf-8"))["addresses"]
own = [a for a, c in addr.items() if c in ("stands_under_its_own_name",)]
folders = [a for a, c in addr.items() if c in ("folder_standing_under_its_own_name", "folder_standing_or_covered")]
for a in own:
    if a not in store: faults.append(f"no longer stands: {a}")
for a in folders:
    pre = a if a.endswith("/") else a + "/"
    if not any(k.startswith(pre) for k in store): faults.append(f"folder empty: {a}")
shelf = sum(1 for k in store if k.startswith("serving-lane/shelf/"))
print(json.dumps({"store_objects": len(store), "store_bytes": sum(store.values()), "renamed_standing": len(ren),
                  "parts_standing": len(parts), "old_names_gone": len(ren) + len(held), "own_names_standing": len(own),
                  "folders_standing": len(folders), "shelf_objects": shelf, "faults": faults[:20], "fault_count": len(faults)}, indent=1))
