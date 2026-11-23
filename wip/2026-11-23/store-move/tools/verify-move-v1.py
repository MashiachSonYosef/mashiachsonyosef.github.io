#!/usr/bin/env python3
"""The store cut of 22 November 2026: prove that every file of the page lane's two lists stands at its new home as the
same bytes, and that every store address this repository names is accounted for after the cut.

For each line of page-lane-renames-v1.tsv: the object <path>.gz, unpacked, has the list's byte count and md5.
For each line of page-lane-also-held-v2.tsv packed into a part: the part's member has the list's byte count and md5.
For each line that leaves the store: the repository holds a file of the same bytes and md5, or the list names the
corpus lane's disk as its only home.
Then the sha256 of every unpacked file is looked for among the 64-hex values the repository's records hold, so a
file a pin names by sha256 is proven against that pin.
Then every r2:mishkan/v2/ address the repository names is classified: renamed (its .gz), packed (part and member),
left the store, a folder whose files the lists cover, or standing under its own name (read from a listing).

Usage: python3 -I verify-move-v1.py <renames.tsv> <also-held.tsv> <objects dir> <repository dir> <listing.txt> <out.json>
"""
import csv, gzip, hashlib, io, json, os, re, subprocess, sys, tarfile

RENAMES, HELD, OBJ, REPO, LISTING, OUT = sys.argv[1:7]
WANT = {"renames": "d88e9eb3d068ff4264b2bf7d70650354b1d53e2b59d9a67ad6e727dae60c3511",
        "held": "ba70a5f5522063648c7413eedddf6517306a16d1816bde30d07b04d2c6d8d8da"}
for k, p in (("renames", RENAMES), ("held", HELD)):
    got = hashlib.sha256(open(p, "rb").read()).hexdigest()
    assert got == WANT[k], (k, got)

def digests(b):
    return len(b), hashlib.md5(b).hexdigest(), hashlib.sha256(b).hexdigest()

faults, files = [], {}
renames = list(csv.DictReader(open(RENAMES, encoding="utf-8"), delimiter="\t"))
for r in renames:
    p = os.path.join(OBJ, r["path_after_compression"])
    if not os.path.exists(p):
        faults.append(f"absent on the store: {r['path_after_compression']}"); continue
    n, md5, sha = digests(gzip.decompress(open(p, "rb").read()))
    if n != int(r["bytes"]) or md5 != r["md5"]:
        faults.append(f"not the same bytes: {r['path_after_compression']} ({n} {md5} against {r['bytes']} {r['md5']})")
    files[r["path_today"]] = {"home": r["path_after_compression"], "how": "gz", "bytes": n, "md5": md5, "sha256": sha}

held = list(csv.DictReader(open(HELD, encoding="utf-8"), delimiter="\t"))
tars = {}
for h in held:
    if "PACKED" in h["why"]:
        m = re.fullmatch(r"the part (\S+), member (.+)", h["new_home"])
        if not m:
            faults.append(f"a packed line whose home is not read: {h['path']}"); continue
        part, member = m.group(1), m.group(2)
        if part not in tars:
            tp = os.path.join(OBJ, part)
            if not os.path.exists(tp):
                faults.append(f"absent on the store: {part}"); tars[part] = None; continue
            t = tarfile.open(fileobj=io.BytesIO(open(tp, "rb").read()), mode="r:gz")
            tars[part] = {i.name.lstrip("./"): t.extractfile(i).read() for i in t.getmembers() if i.isfile()}
        mem = (tars[part] or {}).get(member.lstrip("./"))
        if mem is None:
            faults.append(f"no member {member} in {part}"); continue
        n, md5, sha = digests(mem)
        if n != int(h["bytes"]) or md5 != h["md5"]:
            faults.append(f"not the same bytes: {part} member {member}")
        files[h["path"]] = {"home": part, "member": member, "how": "packed", "bytes": n, "md5": md5, "sha256": sha}
    else:
        files[h["path"]] = {"home": None, "how": "left", "bytes": int(h["bytes"]), "md5": h["md5"], "kept": h["new_home"]}

# the repository's own copies of the files that leave: found by md5 among its tracked files of the same size
tracked = subprocess.run(["git", "-C", REPO, "ls-files", "-z"], capture_output=True, check=True).stdout.decode().split("\0")
by_size = {}
for f in tracked:
    fp = os.path.join(REPO, f)
    try: by_size.setdefault(os.path.getsize(fp), []).append(f)
    except OSError: pass
for path, e in files.items():
    if e["how"] != "left": continue
    hits = [f for f in by_size.get(e["bytes"], []) if hashlib.md5(open(os.path.join(REPO, f), "rb").read()).hexdigest() == e["md5"]]
    e["in_the_repository"] = hits

# every 64-hex value the repository's records hold
hexes = set()
for f in tracked:
    if f.startswith(("reader/data/", "data/")) and f.endswith((".json", ".jsonl", ".md", ".tsv")):
        try: hexes.update(re.findall(r"[0-9a-f]{64}", open(os.path.join(REPO, f), encoding="utf-8", errors="ignore").read()))
        except OSError: pass
for e in files.values():
    if "sha256" in e: e["sha256_named_by_a_record"] = e["sha256"] in hexes

# every store address the repository names, after the cut
named = set()
for f in tracked:
    if f.startswith("wip/"): continue
    fp = os.path.join(REPO, f)
    try:
        if os.path.getsize(fp) > 30_000_000: continue
        named.update(re.findall(r"r2:mishkan/(v2/[^\s\"'`)\]»,;<>]+)", open(fp, encoding="utf-8", errors="ignore").read()))
    except OSError: pass
listing = set(l.split("\t")[0] for l in open(LISTING, encoding="utf-8") if l.strip())
cls = {}
for a in sorted(named):
    a = a.rstrip(".:")
    if a in files: cls[a] = files[a]["how"]
    elif a.endswith("/") and any(k.startswith(a) for k in files): cls[a] = "folder_the_lists_cover"
    elif a in listing: cls[a] = "stands_under_its_own_name"
    elif a.endswith("/") and any(k.startswith(a) for k in listing): cls[a] = "folder_standing_under_its_own_name"
    elif any(k.startswith(a + "/") for k in listing) or any(k.startswith(a + "/") for k in files): cls[a] = "folder_standing_or_covered"
    else: cls[a] = "NOT_FOUND"
counts = {}
for v in cls.values(): counts[v] = counts.get(v, 0) + 1
out = {
    "checked_on": "2026-11-23",
    "lists": {"page-lane-renames-v1.tsv": WANT["renames"], "page-lane-also-held-v2.tsv": WANT["held"]},
    "files": len(files),
    "by_home": {h: sum(1 for e in files.values() if e["how"] == h) for h in ("gz", "packed", "left")},
    "same_bytes": sum(1 for e in files.values() if e["how"] != "left") - len([f for f in faults if f.startswith("not the same")]),
    "sha256_named_by_a_record": sum(1 for e in files.values() if e.get("sha256_named_by_a_record")),
    "left_and_in_the_repository": sum(1 for e in files.values() if e["how"] == "left" and e.get("in_the_repository")),
    "left_on_the_lane_disk_only": sorted(p for p, e in files.items() if e["how"] == "left" and not e.get("in_the_repository")),
    "addresses_the_repository_names": len(cls),
    "addresses_by_class": counts,
    "not_found": sorted(a for a, v in cls.items() if v == "NOT_FOUND"),
    "faults": faults,
}
json.dump({"summary": out, "files": files, "addresses": cls}, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(json.dumps(out, ensure_ascii=False, indent=1)[:4000])
