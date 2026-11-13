# One fault put into one file of a reader tree, for stems-checks-go-red-v1.sh: the stems extension.
# Each mode changes the file it is given in place and says in a line what it did; the caller keeps a copy and puts
# the file back. A row is "of the extension" where its m id is one of those given.
#   stem-change <lattice.bin> <m ids>   the first row of the extension that carries stems carries another stem
#   stem-drop <lattice.bin> <m ids>     the first row of the extension that carries stems loses them
#   stem-add <lattice.bin> <m ids>      under the first key that holds a row of the extension, a row no line names
#                                       (the same source, a rank no row has) is given stems
#   record-branch <lattice.bin>         the sidecar's record says one branch rests at NONE
#   record-count <lattice.bin>          the sidecar's record counts one row more than it gave stems
#   page-beside-off <zone.html>         the page does not ask the rows beside the store their stem
#   swap <file>                         two neighboring ASCII letters that differ change places (same size, other bytes)
# python3 -I stems-tamper-v1.py <mode> <file> [<m ids, comma separated>]
import gzip, json, sys

mode, path = sys.argv[1], sys.argv[2]
SEP = "\u0001"


def gz_read(p): return json.loads(gzip.open(p, "rb").read().decode("utf-8"))


def gz_write(p, body): gzip.open(p, "wb").write(json.dumps(body, ensure_ascii=False, separators=(",", ":")).encode("utf-8"))


def first_row(side, ms):
    for key, held in side["stems"].items():
        for rid, stems in held.items():
            if rid.split(SEP)[0] in ms and stems: return key, rid
    raise SystemExit("no row of the extension carries stems in this sidecar")


def say(key, rid): m, rank, route = rid.split(SEP, 2); return f"«{key}» {m} rank {rank} «{route[:40]}»"


if mode in ("stem-change", "stem-drop", "stem-add"):
    ms = set(sys.argv[3].split(","))
    side = gz_read(path)
    key, rid = first_row(side, ms)
    if mode == "stem-change":
        was = side["stems"][key][rid]
        side["stems"][key][rid] = ["piel"] if was != ["piel"] else ["qal"]
        print(f"{say(key, rid)}: its stems were {'+'.join(was)} and are {'+'.join(side['stems'][key][rid])}")
    elif mode == "stem-drop":
        was = side["stems"][key].pop(rid)
        print(f"{say(key, rid)}: its stems {'+'.join(was)} are gone")
    else:
        m = rid.split(SEP)[0]
        new = SEP.join([m, "999999", "a row no line names"])
        side["stems"][key][new] = ["qal"]
        print(f"«{key}»: a row of {m} at rank 999999, which no line names, is given qal")
    gz_write(path, side)
elif mode == "record-branch":
    side = gz_read(path)
    b = side["binyan"]["extension"]["branches"]
    name = sorted(b)[0]
    was = b[name]; b[name] = "NONE"
    print(f"the sidecar's record says {name} rests at NONE (it said {was})")
    gz_write(path, side)
elif mode == "record-count":
    side = gz_read(path)
    side["binyan"]["extension"]["rows_given_stems_in_this_book"] += 1
    print("the sidecar's record counts one row more than it gave stems")
    gz_write(path, side)
elif mode == "page-beside-off":
    s = open(path, encoding="utf-8").read()
    old = "      if (ofAnotherStem) {\n        const ofThisStem = extra.filter((row) => !ofAnotherStem(row));\n"
    new = "      if (ofAnotherStem) {\n        const ofThisStem = extra;\n"
    assert s.count(old) == 1, s.count(old)
    open(path, "w", encoding="utf-8").write(s.replace(old, new))
    print("the page keeps every row beside the store whatever its stem")
elif mode == "swap":
    b = bytearray(open(path, "rb").read())
    for i in range(len(b) // 2, len(b) - 1):
        if 97 <= b[i] <= 122 and 97 <= b[i + 1] <= 122 and b[i] != b[i + 1]:
            b[i], b[i + 1] = b[i + 1], b[i]
            open(path, "wb").write(bytes(b))
            print(f"bytes {i} and {i + 1} changed places; the size is the same")
            break
    else:
        raise SystemExit("no two neighboring letters to swap")
else:
    raise SystemExit(f"unknown mode {mode}")
