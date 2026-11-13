# One fault put into one file of a reader tree, for openings-checks-go-red-v1.sh: the openings of a numbered sense.
# Each mode changes the file it is given in place and says in a line what it did; the caller keeps a copy and puts
# the file back.
#   mark-drop <shard.bin>          the first row that carries the mark (opens) loses it
#   mark-add <shard.bin> <m id>    the first row of that source that carries no mark is given one no line names
#   mark-point <shard.bin>         the first row that carries the mark names another point than its line gives
#   index-count <index.json>       the index's record counts one row more than is marked
#   index-print <index.json>       the index's record cites the ruling with another print than the pinned one
#   leader-note <lattice.bin> <shard dir>   the first surface whose key holds a marked row is given that row's words
#                                  as its leader under "only this pointing"
#   page-reads <zone.html>         the page's readingsOfRow reads a marked row as any other
#   page-keeps <zone.html>         the page's pool leaves the marked rows among its rows and takes no notes
#   page-all <zone.html>           the page takes its notes from every row of the key, whatever its switches withhold
#   page-band <zone.html>          the page puts no notes line with the record
#   reader-reads <gloss-store-v1.mjs>   the store's reader reads a marked row as any other
#   swap <file>                    two neighboring ASCII letters that differ change places (same size, other bytes)
# python3 -I openings-tamper-v1.py <mode> <file> [<argument>]
import glob, gzip, hashlib, json, os, sys

mode, path = sys.argv[1], sys.argv[2]


def gz_read(p): return json.loads(gzip.open(p, "rb").read().decode("utf-8"))


def gz_write(p, body, level=9): open(p, "wb").write(gzip.compress(json.dumps(body, ensure_ascii=False, separators=(",", ":")).encode("utf-8"), level))


def facts(row): return row[10] if len(row) > 10 and isinstance(row[10], dict) else None


def text_edit(old, new, said):
    s = open(path, encoding="utf-8").read()
    assert s.count(old) == 1, (s.count(old), old[:60])
    open(path, "w", encoding="utf-8").write(s.replace(old, new))
    print(said)


if mode in ("mark-drop", "mark-add", "mark-point"):
    body = gz_read(path)
    done = False
    for k, rows in body.items():
        for row in rows:
            f = facts(row)
            if mode == "mark-drop" and f and "opens" in f:
                was = f.pop("opens")
                if not f:
                    row[10] = None
                    while len(row) > 7 and row[-1] is None: row.pop()
                print(f"«{k}» rank {row[0]} of {row[3]}: its mark {was} is gone"); done = True
            elif mode == "mark-point" and f and "opens" in f:
                was = f["opens"]; entry = was.split(" ")[0]
                f["opens"] = f"{entry} 99."
                print(f"«{k}» rank {row[0]} of {row[3]}: its mark was {was} and is {f['opens']}"); done = True
            elif mode == "mark-add" and str(row[3]) == sys.argv[3] and not (f and "opens" in f):
                while len(row) < 10: row.append(None)
                g = dict(f or {}); g["opens"] = "BDB0 1."
                g = {x: g[x] for x in sorted(g)}
                if len(row) > 10: row[10] = g
                else: row.append(g)
                print(f"«{k}» rank {row[0]} of {row[3]}, which no line names, is given the mark BDB0 1."); done = True
            if done: break
        if done: break
    if not done: raise SystemExit("no row to change in this shard")
    gz_write(path, body)
elif mode in ("index-count", "index-print"):
    ix = json.load(open(path, encoding="utf-8"))
    rec = ix["sense_openings"]
    if mode == "index-count":
        rec["totals"]["rows_marked"] += 1
        print("the index's record counts one row more than is marked")
    else:
        rec["ruling"]["print"] = "as a pill"
        print("the index's record cites the ruling with the print «as a pill»")
    open(path, "w", encoding="utf-8").write(json.dumps(ix, indent=1, ensure_ascii=False))
elif mode == "leader-note":
    side = gz_read(path)
    shard_dir = sys.argv[3]
    done = False
    for s, g in side["grades"].items():
        k = g.get("k")
        if not k or not isinstance((g.get("o") or {}).get("l"), list): continue
        shard = gz_read(os.path.join(shard_dir, hashlib.sha256(k.encode("utf-8")).hexdigest()[:2] + ".bin"))
        rows = shard.get(k) or []
        others = {str(r[1]).lower() for r in rows if not (facts(r) and "opens" in facts(r))}
        note = next((r for r in rows if facts(r) and "opens" in facts(r) and str(r[1]).lower() not in others), None)
        if not note: continue
        was = g["o"]["l"][0]; g["o"]["l"][0] = note[1]
        print(f"the leader of {s} (key {k}) was «{was}» and is «{note[1][:50]}», the words of a note"); done = True
        break
    if not done: raise SystemExit("no surface of this book stands on a key that holds a note")
    gz_write(path, side)
elif mode == "page-reads":
    text_edit("    if (senseOpened(row)) return [];\n    const text = String(row[1] ?? \"\");\n    // the made spaces of the route text that close (made-spaces-rule-v1)\n",
              "    const text = String(row[1] ?? \"\");\n    // the made spaces of the route text that close (made-spaces-rule-v1)\n",
              "the page's readingsOfRow reads a marked row as any other")
elif mode == "page-keeps":
    text_edit("    routes = routes.filter((row) => { const o = senseOpened(row); if (o && index.m_sources[row[3]]) notes.push({ ...o, m: row[3] }); return !o; });\n", "",
              "the page's pool leaves the marked rows among its rows and takes no notes")
elif mode == "page-all":
    text_edit("    routes = routes.filter((row) => { const o = senseOpened(row); if (o && index.m_sources[row[3]]) notes.push({ ...o, m: row[3] }); return !o; });\n",
              "    routes = routes.filter((row) => !senseOpened(row));\n    for (const row of all) { const o = senseOpened(row); if (o && index.m_sources[row[3]]) notes.push({ ...o, m: row[3] }); }\n",
              "the page takes its notes from every row of the key, whatever its switches withhold")
elif mode == "page-band":
    text_edit("        { const nl = notesLine(); if (nl) body.append(nl); }\n", "        notesLine();\n",
              "the page puts no notes line with the record")
elif mode == "reader-reads":
    text_edit("    if (senseOpened(row)) return [];\n    const text = String(row[1] ?? \"\");\n    if (!ledgerOf(row[3]))", "    const text = String(row[1] ?? \"\");\n    if (!ledgerOf(row[3]))",
              "the store's reader reads a marked row as any other")
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
