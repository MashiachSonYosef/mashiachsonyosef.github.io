# One fault put into one file of a reader tree, for gates-checks-go-red-v1.sh: the entry gate and the names gate.
# Each mode changes the file it is given in place and says in a line what it did; the caller keeps a copy and puts
# the file back.
#   find <shards dir> <fact>          prints the first shard holding a row whose facts carry that fact (n, t, b, name)
#   facts-number <shard>              the first row with numbers is filed under another number
#   facts-drop <shard>                the first row with facts loses them
#   facts-letter <shard>              the first row with STEP's lettered tags carries another letter
#   name-drop <shard>                 the first row marked a name loses the mark
#   name-add <shard>                  the first row with facts and no mark is marked a name
#   word-tag <zone.bin>               the first tagged word carries another tag
#   np-drop <zone.bin>                the first word marked a name place loses the mark
#   np-add <zone.bin>                 the first unmarked word of a verse is marked a name place
#   leader <lattice.bin>              the first leader a kind of place holds is another text
#   leader-drop <lattice.bin>         the first surface with leaders at a kind of place loses them
#   page-entry-off <zone.html>        the pool keeps the rows of another entry
#   page-entry-number <zone.html>     the page's numberOf writes a number another way
#   page-leaders-own <zone.html>      the page reads the surface's own leaders at every place
#   page-name-off <zone.html>         the pool keeps the rows given as a name
#   page-name-fn <zone.html>          the page's nameWithheld withholds at a place that is a name
#   page-entry-said <zone.html>       the card names the place's entry by its numbers alone, where a row is asked by letter
#   swap <file>                       two neighboring ASCII letters that differ change places (same size, other bytes)
#   stale <the store's index.json> <m id>
#                                     the index says that source's rows are not the rows its made-spaces list was read
#                                     from, while they are
# python3 -I gates-tamper-v1.py <mode> <file> [...]
import gzip, json, os, sys

mode = sys.argv[1]
FACTS = 10


def gz_read(path): return json.loads(gzip.open(path, "rb").read().decode("utf-8"))


def gz_write(path, body): gzip.open(path, "wb").write(json.dumps(body, ensure_ascii=False, separators=(",", ":")).encode("utf-8"))


def facts(row): return row[FACTS] if len(row) > FACTS and isinstance(row[FACTS], dict) else None


def trim(row):
    while len(row) > 7 and row[-1] is None: row.pop()


def page(path, old, new):
    s = open(path, encoding="utf-8").read()
    assert s.count(old) == 1, (old[:70], s.count(old))
    open(path, "w", encoding="utf-8").write(s.replace(old, new))


if mode == "find":
    d, fact = sys.argv[2], sys.argv[3]
    for f in sorted(os.listdir(d)):
        if not f.endswith(".bin"): continue
        body = gz_read(os.path.join(d, f))
        if any((facts(row) or {}).get(fact) for rows in body.values() for row in rows):
            print(os.path.join(d, f)); break
    else:
        raise SystemExit("no shard holds such a row")
elif mode in ("facts-number", "facts-drop", "facts-letter", "name-drop", "name-add"):
    path = sys.argv[2]
    body = gz_read(path)
    wants = {"facts-number": lambda f: f.get("n"), "facts-drop": lambda f: True, "facts-letter": lambda f: f.get("t"),
             "name-drop": lambda f: f.get("name"), "name-add": lambda f: f.get("n") and not f.get("name")}[mode]
    for k, rows in body.items():
        row = next((r for r in rows if facts(r) and wants(facts(r))), None)
        if row is None: continue
        f = facts(row)
        where = f"{k} ({row[3]}, rank {row[0]})"
        if mode == "facts-number":
            was = f["n"][0]; f["n"][0] = "H999999"
            print(f"{where}: filed under {was}, now under H999999")
        elif mode == "facts-drop":
            row[FACTS] = None; trim(row)
            print(f"{where}: its facts {json.dumps(f, ensure_ascii=False)[:80]} are gone")
        elif mode == "facts-letter":
            was = f["t"][0]; f["t"][0] = was[:-1] + ("Q" if was[-1] != "Q" else "R")
            print(f"{where}: STEP's tag {was} is now {f['t'][0]}")
        elif mode == "name-drop":
            del f["name"]
            if not f: row[FACTS] = None; trim(row)
            print(f"{where}: no longer marked a name")
        else:
            f["name"] = 1
            print(f"{where}: marked a name, though no line of the list names it")
        break
    else:
        raise SystemExit("no row to change")
    gz_write(path, body)
elif mode in ("word-tag", "np-drop", "np-add"):
    path = sys.argv[2]
    z = gz_read(path)
    done = False
    for sec in z.get("sections") or []:
        for w in sec.get("words") or []:
            if w.get("mark"): continue
            if mode == "word-tag" and w.get("tg"):
                was = w["tg"]; w["tg"] = "H99999"
                print(f"{sec.get('label')} «{w.get('k')}»: tagged {json.dumps(was)}, now H99999"); done = True
            elif mode == "np-drop" and w.get("np"):
                del w["np"]; print(f"{sec.get('label')} «{w.get('k')}»: no longer marked a name place"); done = True
            elif mode == "np-add" and not w.get("np") and w.get("k"):
                w["np"] = 1; print(f"{sec.get('label')} «{w.get('k')}»: marked a name place, though no line of the list names it"); done = True
            if done: break
        if done: break
    if not done: raise SystemExit("no word to change")
    gz_write(path, z)
elif mode in ("leader", "leader-drop"):
    path = sys.argv[2]
    side = gz_read(path)
    for s, gr in (side.get("grades") or {}).items():
        e = gr.get("e") or {}
        key = next((k for k, v in e.items() if isinstance(v.get("l"), list)), None)
        if key is None: continue
        if mode == "leader":
            was = e[key]["l"][0]; e[key]["l"][0] = "altered"
            print(f"the surface of key {gr.get('k')} at a place of the kind \"{key}\": its leader «{str(was)[:40]}» is now «altered»")
        else:
            del gr["e"]
            print(f"the surface of key {gr.get('k')}: its leaders at {len(e)} kind(s) of place are gone")
        break
    else:
        raise SystemExit("no surface holds leaders at a kind of place")
    gz_write(path, side)
elif mode == "page-entry-off":
    page(sys.argv[2], '        routes = all.filter((row, i) => verdicts[i] !== "other");\n', "        routes = all;\n")
    print("the pool keeps every row whatever its entry (the count still says how many are another entry's)")
elif mode == "page-entry-number":
    page(sys.argv[2], 'return x && x[1] !== "0" ? `H${x[1]}` : null; };\n  const tagOf = ', 'return x && x[1] !== "0" ? `H0${x[1]}` : null; };\n  const tagOf = ')
    print("numberOf writes H0 before the digits")
elif mode == "page-leaders-own":
    page(sys.argv[2], "    const own = gr && gr.e ? gr.e[leadersKey(tags, isName)] : null;\n", "    const own = null;\n")
    print("onlyLeaders reads the surface's own leaders at every place")
elif mode == "page-name-off":
    page(sys.argv[2], "      const kept = routes.filter((row) => !nameWithheld(factsOf(row), false));\n", "      const kept = routes;\n")
    print("the pool keeps the rows given as a name")
elif mode == "page-name-fn":
    page(sys.argv[2], "  const nameWithheld = (facts, placeIsAName) => !!(facts && facts.name) && !placeIsAName;\n",
         "  const nameWithheld = (facts, placeIsAName) => !!(facts && facts.name) && placeIsAName;\n")
    print("nameWithheld withholds at a place that is a name, and not where it is not one")
elif mode == "page-entry-said":
    page(sys.argv[2], "        entryHere = entrySaid(place);\n", "        entryHere = place.numbers;\n")
    print("the card names the place's entry by its numbers alone")
elif mode == "swap":
    path = sys.argv[2]
    b = bytearray(open(path, "rb").read())
    for i in range(len(b) // 2, len(b) - 1):
        if 97 <= b[i] <= 122 and 97 <= b[i + 1] <= 122 and b[i] != b[i + 1]:
            b[i], b[i + 1] = b[i + 1], b[i]
            open(path, "wb").write(bytes(b))
            print(f"bytes {i} and {i + 1} changed places; the size is the same")
            break
    else:
        raise SystemExit("no two neighboring letters to swap")
elif mode == "stale":
    path, m = sys.argv[2], sys.argv[3]
    index = json.load(open(path, encoding="utf-8"))
    rec = index["made_spaces"]["sources"][m]
    assert rec.get("texts_are_as_read") is True, rec
    rec["texts_are_as_read"] = False
    json.dump(index, open(path, "w", encoding="utf-8"), ensure_ascii=False)
    print(f"the index says {m}'s rows are not the rows its list was read from")
else:
    raise SystemExit(f"no mode {mode}")
