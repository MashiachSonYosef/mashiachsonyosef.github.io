# One small fault put into one file, for showing that check-made-spaces-v1 fails on it. The caller keeps a copy of
# the file and puts it back; nothing here restores anything.
#   python3 -I made-spaces-tamper.py drop  <a store shard>   the first row that carries route closes loses its slot
#   python3 -I made-spaces-tamper.py shift <a store shard>   the first such row's first close moves one place on
#   python3 -I made-spaces-tamper.py page  <zone.html>       the page's `closed` keeps the space it should leave out
#   python3 -I made-spaces-tamper.py list  <a list file>     the first line's first close moves one place on
import gzip, json, sys

mode, path = sys.argv[1], sys.argv[2]
if mode in ("drop", "shift"):
    body = json.loads(gzip.open(path, "rb").read().decode("utf8"))
    done = None
    for key, rows in body.items():
        for row in rows:
            if len(row) > 9 and row[9] and row[9][0]:
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
    s = open(path, encoding="utf8").read()
    a = "{ out += text.slice(at, c); at = c + 1; }\n    return out + text.slice(at, to);\n  };\n  const routePrinted"
    assert s.count(a) == 1, s.count(a)
    s = s.replace(a, a.replace("at = c + 1; }", "at = c; }"))
    open(path, "w", encoding="utf8").write(s)
    print("page: `closed` now keeps the character at each close")
elif mode == "list":
    s = open(path, encoding="utf8").read()
    first = s.split("\n", 1)[0]
    l = json.loads(first)
    was = '"closes":[' + str(l["closes"][0])
    assert first.count(was) == 1, first.count(was)
    s = s.replace(first, first.replace(was, '"closes":[' + str(l["closes"][0] + 1)), 1)
    open(path, "w", encoding="utf8").write(s)
    print(f"list: the first line's first close moved from {l['closes'][0]} to {l['closes'][0] + 1}")
else:
    raise SystemExit("mode is one of drop, shift, page, list")
