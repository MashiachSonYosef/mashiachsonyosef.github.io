# One small fault put into one file, for showing that check-made-spaces-v1 fails on it. The caller keeps a copy of
# the file and puts it back; nothing here restores anything. The second issue of this helper, for the relays' layout
# (data/made-spaces/<relay folder>/) and the laws added with it.
#   find   <shards dir> <m id>          prints the first shard holding a row of that source with a close on its route
#   drop   <a store shard> [m id]       the first row (of that source) that carries route closes loses its slot
#   shift  <a store shard> [m id]       the first such row's first close moves one place on
#   page   <zone.html>                  the page's `closed` keeps the space it should leave out
#   list   <a list file>                the first line's first close moves one place on
#   never  <a list file> <a never-closed file>
#                                       a line whose text also stands in the never-closed file closes a space that
#                                       stands for words taken out; its `prints` is made to agree, so only that law
#                                       and the pin's bytes are broken
#   record <the store's index.json> <m id>
#                                       the index's record of that source's rows is another sha256
#   stale  <the store's index.json> <m id>
#                                       the index says that source's rows are not the rows its list was read from
import gzip, json, os, sys

mode = sys.argv[1]


def slotted(row, m):
    return len(row) > 9 and row[9] and row[9][0] and (m is None or str(row[3]) == m)


if mode == "find":
    d, m = sys.argv[2], sys.argv[3]
    for f in sorted(os.listdir(d)):
        if not f.endswith(".bin"):
            continue
        body = json.loads(gzip.open(os.path.join(d, f), "rb").read().decode("utf8"))
        if any(slotted(row, m) for rows in body.values() for row in rows):
            print(os.path.join(d, f))
            break
    else:
        raise SystemExit("no shard holds such a row")
elif mode in ("drop", "shift"):
    path = sys.argv[2]
    m = sys.argv[3] if len(sys.argv) > 3 else None
    body = json.loads(gzip.open(path, "rb").read().decode("utf8"))
    done = None
    for key, rows in body.items():
        for row in rows:
            if slotted(row, m):
                if mode == "drop":
                    del row[9:]
                    while len(row) > 7 and row[-1] is None:
                        row.pop()
                else:
                    row[9][0][0] += 1
                done = (key, row[3], row[0], row[1][:50])
                break
        if done:
            break
    assert done, "no row with route closes in this shard"
    with gzip.open(path, "wb", compresslevel=9) as f:
        f.write(json.dumps(body, ensure_ascii=False, separators=(",", ":")).encode("utf8"))
    print(f"{mode}: the row of {done[1]} (rank {done[2]}) under a key of {len(done[0])} letters, «{done[3]}»")
elif mode == "page":
    path = sys.argv[2]
    s = open(path, encoding="utf8").read()
    a = "{ out += text.slice(at, c); at = c + 1; }\n    return out + text.slice(at, to);\n  };\n  const routePrinted"
    assert s.count(a) == 1, s.count(a)
    s = s.replace(a, a.replace("at = c + 1; }", "at = c; }"))
    open(path, "w", encoding="utf8").write(s)
    print("page: `closed` now keeps the character at each close")
elif mode == "list":
    path = sys.argv[2]
    s = open(path, encoding="utf8").read()
    first = s.split("\n", 1)[0]
    l = json.loads(first)
    was = '"closes":[' + str(l["closes"][0])
    assert first.count(was) == 1, first.count(was)
    s = s.replace(first, first.replace(was, '"closes":[' + str(l["closes"][0] + 1)), 1)
    open(path, "w", encoding="utf8").write(s)
    print(f"list: the first line's first close moved from {l['closes'][0]} to {l['closes'][0] + 1}")
elif mode == "never":
    path, never = sys.argv[2], sys.argv[3]
    stands = {}
    for s in open(never, encoding="utf8").read().split("\n"):
        if s:
            x = json.loads(s)
            stands[x["text"]] = [a for a in x["at"] if a < len(x["text"]) and x["text"][a] == " "]
    lines = open(path, encoding="utf8").read().split("\n")
    done = None
    for i, s in enumerate(lines):
        if not s:
            continue
        l = json.loads(s)
        spare = [a for a in stands.get(l["text"], []) if a not in l["closes"]]
        if not spare:
            continue
        l["closes"] = sorted(l["closes"] + [spare[0]])
        l["prints"] = "".join(c for j, c in enumerate(l["text"]) if j not in l["closes"])
        lines[i] = json.dumps(l, ensure_ascii=False, separators=(", ", ": "))
        done = (i + 1, spare[0], l["text"][:60])
        break
    assert done, "no line of the list stands in the never-closed file with a space to close"
    open(path, "w", encoding="utf8").write("\n".join(lines))
    print(f"never: line {done[0]} now closes the place {done[1]} of «{done[2]}», a space that stands for words taken out")
elif mode in ("record", "stale"):
    path, m = sys.argv[2], sys.argv[3]
    index = json.loads(open(path, encoding="utf8").read())
    rec = index["made_spaces"]["sources"][m]
    if mode == "record":
        was = rec["texts_sha256"]
        rec["texts_sha256"] = ("0" if was[0] != "0" else "1") + was[1:]
        print(f"record: the index's record of {m}'s rows is now {rec['texts_sha256'][:12]} (was {was[:12]})")
    else:
        rec["texts_are_as_read"] = False
        print(f"stale: the index now says {m}'s rows are not the rows its list was read from")
    open(path, "w", encoding="utf8").write(json.dumps(index, ensure_ascii=False, indent=1))
else:
    raise SystemExit("mode is one of find, drop, shift, page, list, never, record, stale")
