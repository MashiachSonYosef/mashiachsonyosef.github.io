#!/usr/bin/env python3
"""The store cut of 22 November 2026, in the path map: where every store address this repository names stands after
the corpus lane's cut, written from the lane's two lists (kept in the tree byte for byte) and the check of every file.

It copies the two lists into reader/data/store-path-map/, then writes the section after_the_cut into
reader/data/store-path-map-v1.json. Nothing in this repository reads a store address at run time, and no record a
tool or a zone wrote is rewritten: as with the v2 layout of 10 November, this file says where the same bytes stand now.

Usage: python3 -I emit-path-map-after-cut-v1.py <reader dir> <renames.tsv> <also-held.tsv> <verify-move-v1.json>
"""
import hashlib, json, shutil, sys
from pathlib import Path

R, RENAMES, HELD, VERIFY = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3]), Path(sys.argv[4])
v = json.loads(VERIFY.read_text(encoding="utf-8"))
s = v["summary"]
assert not s["faults"] and not s["not_found"], (s["faults"][:3], s["not_found"][:3])
assert s["files"] == 3000 and s["same_bytes"] == s["by_home"]["gz"] + s["by_home"]["packed"], s

home = R / "data" / "store-path-map"
home.mkdir(exist_ok=True)
kept = {}
for src in (RENAMES, HELD):
    dst = home / src.name
    shutil.copyfile(src, dst)
    b = dst.read_bytes()
    kept[src.name] = {"file": f"data/store-path-map/{src.name}", "bytes": len(b), "sha256": hashlib.sha256(b).hexdigest(),
                      "lines": b.decode("utf-8").count("\n") - 1}
assert kept["page-lane-renames-v1.tsv"]["sha256"] == s["lists"]["page-lane-renames-v1.tsv"]
assert kept["page-lane-also-held-v2.tsv"]["sha256"] == s["lists"]["page-lane-also-held-v2.tsv"]

files = v["files"]
packed = {p: {"part": e["home"], "member": e["member"]} for p, e in sorted(files.items()) if e["how"] == "packed"}
left = {}
for p, e in sorted(files.items()):
    if e["how"] != "left": continue
    left[p] = ({"in_this_repository": e["in_the_repository"]} if e.get("in_the_repository")
               else {"on_the_corpus_lane_disk_only": e["kept"].split("kept on the disk at ", 1)[-1].split(" (", 1)[0]})

section = {
    "recorded_on": "2026-11-23",
    "what": "where each store address this repository names stands after the corpus lane's store cut (the act of relay v216, its step 3 done on 22 November 2026): the kept text files went up compressed, and their old names go at the act's step 5, after this record",
    "from": {
        "renames": {**kept["page-lane-renames-v1.tsv"], "on_the_store": "r2:mishkan/v2/ledgers/all/store-free/inventory-v1/page-lane-renames-v1.tsv"},
        "also_held": {**kept["page-lane-also-held-v2.tsv"], "on_the_store": "r2:mishkan/v2/ledgers/all/store-free/act-v1/page-lane-also-held-v2.tsv"},
        "note": "the corpus lane's note of 22 November 2026, relayed by the owner: step 3 done, these two lists the new names",
    },
    "rule": [
        "an address of the renames list stands as the same address with .gz after it: the same bytes, compressed",
        "an address of the also-held list packed into a part stands as a member of that part (a .tar.gz), named below",
        "an address of the also-held list that leaves the store (16, superseded) stands in this repository or on the corpus lane's disk, named below",
        "every other address this repository names stands under its own name",
    ],
    "checked": {
        "on": "2026-11-23",
        "how": "every object of the two lists read from the store, unpacked, and held to the list's byte count and md5; then each unpacked file's sha256 looked for among the sha256 values this repository's records hold; then every r2:mishkan/v2/ address this repository names outside wip/ classified, from the lists and a listing of the store",
        "files": s["files"],
        "by_home": s["by_home"],
        "the_same_bytes_at_the_new_home": s["same_bytes"],
        "of_which_a_record_here_names_the_sha256": s["sha256_named_by_a_record"],
        "faults": len(s["faults"]),
        "addresses_this_repository_names": s["addresses_the_repository_names"],
        "addresses_by_where_they_stand": s["addresses_by_class"],
        "addresses_not_found": len(s["not_found"]),
        "ships_15_to_17": "pin nothing the cut touched: their files keep their names (the corpus lane's pins check, 0 hits)",
    },
    "packed": packed,
    "left_the_store": left,
    "the_shelf": "serving-lane/shelf/ stays where it is (3,594 objects on 23 November 2026): the store record's backup of the zones, read by tools/restore-shelf-from-history-v1.mjs",
}
mp = R / "data" / "store-path-map-v1.json"
m = json.loads(mp.read_text(encoding="utf-8"))
assert "after_the_cut" not in m, "the section stands already"
m["after_the_cut"] = section
m["standing"] = m["standing"] + "; the corpus lane's store cut of 22 November 2026 compressed the kept text files and moved some into parts: see after_the_cut"
mp.write_text(json.dumps(m, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
print("written", mp, "· packed", len(packed), "· left", len(left), "· lists kept", [k["sha256"][:12] for k in kept.values()])
