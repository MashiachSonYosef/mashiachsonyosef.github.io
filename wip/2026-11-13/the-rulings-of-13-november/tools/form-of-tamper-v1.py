# One fault put into one file of a reader tree, for form-of-check-goes-red-v1.sh. Each mode changes the file it is
# given in place and says in a line what it did; the caller keeps a copy and puts the file back.
#   swap <file>                      two neighboring ASCII letters that differ change places (same size, other bytes)
#   record-english <record>          the first resolved pointer's English is another text
#   record-drop <record>             the first unresolved pointer leaves the record, its counts kept true to it
#   record-resolve <record>          the first unresolved pointer is given an English
#   record-mixed-all <record> <map>  every reading with English of its own is carried as a pointer with an English
#   page-as-written <zone.html>      the page finds a pointer's entry by its text as written, as it did before
#   page-says <zone.html>            the page prints a resolved pointer's English without the pointer beside it
#   page-no-pointer <zone.html>      the pill no longer carries the pointer's own text
# python3 -I form-of-tamper-v1.py <mode> <file> [<the lane's map>]
import json, sys

mode, path = sys.argv[1], sys.argv[2]


def page(old, new):
    s = open(path, encoding="utf-8").read()
    assert s.count(old) == 1, (old[:70], s.count(old))
    open(path, "w", encoding="utf-8").write(s.replace(old, new))


if mode == "swap":
    b = bytearray(open(path, "rb").read())
    for i in range(len(b) // 2, len(b) - 1):
        if 97 <= b[i] <= 122 and 97 <= b[i + 1] <= 122 and b[i] != b[i + 1]:
            b[i], b[i + 1] = b[i + 1], b[i]
            open(path, "wb").write(bytes(b))
            print(f"bytes {i} and {i + 1} changed places ({chr(b[i + 1])}{chr(b[i])} -> {chr(b[i])}{chr(b[i + 1])}); the size is the same")
            break
    else:
        raise SystemExit("no two neighboring letters to swap")
elif mode.startswith("record-"):
    rec = json.load(open(path, encoding="utf-8"))
    entries = [(k, e) for k, l in rec["keys"].items() for e in l]
    if mode == "record-english":
        k, e = next((k, e) for k, e in entries if e.get("resolved"))
        was = e["resolved"]["text"]
        e["resolved"]["text"] = "altered"
        print(f"under {k}, the English of «{e['t'][:50]}» was «{was[:40]}» and is «altered»")
    elif mode == "record-drop":
        k, e = next((k, e) for k, e in entries if not e.get("resolved"))
        rec["keys"][k].remove(e)
        if not rec["keys"][k]: del rec["keys"][k]
        rec["counts"]["carried"] -= 1
        print(f"under {k}, the unresolved pointer «{e['t'][:50]}» left the record; the record's count of pointers carried follows")
    elif mode == "record-resolve":
        k, e = next((k, e) for k, e in entries if not e.get("resolved"))
        e["resolved"] = {"key": k, "text": "altered"}
        e.pop("why", None)
        rec["counts"]["resolved"] += 1
        print(f"under {k}, the unresolved pointer «{e['t'][:50]}» is given the English «altered»; the record's count of resolved follows")
    elif mode == "record-mixed-all":
        n = 0
        for line in open(sys.argv[3], encoding="utf-8"):
            l = json.loads(line)
            if l.get("class") != "MIXED": continue
            rec["keys"].setdefault(l["key"], []).append({"m": l["m_id"], "t": l["text"], "sha": "0" * 16, "class": "FORM_OF", "at": None, "relation": "form of",
                                                         "target": "x", "kind": "FORM", "resolved": {"key": l["key"], "text": "altered"}})
            n += 1
        rec["counts"]["carried"] += n
        rec["counts"]["resolved"] += n
        print(f"{n} readings with English of their own are carried as pointers, each with the English «altered»; the record's counts follow")
    else:
        raise SystemExit(f"no mode {mode}")
    json.dump(rec, open(path, "w", encoding="utf-8"), ensure_ascii=False)
elif mode == "page-as-written":
    page("""    const t = spanJoin(text);
    const mids = Array.isArray(m) ? m.map(String) : m ? [String(m)] : [];
    return l.find((e) => mids.includes(e.m) && spanJoin(e.t) === t) || l.find((e) => spanJoin(e.t) === t) || null;
""", """    const noDot = (x) => String(x).replace(/\\.$/u, "");
    const ts = new Set([String(text), noDot(text), Array.isArray(text) ? spanJoin(text) : String(text)].map(noDot));
    const mids = Array.isArray(m) ? m.map(String) : m ? [String(m)] : [];
    return l.find((e) => mids.includes(e.m) && ts.has(noDot(e.t))) || l.find((e) => ts.has(noDot(e.t))) || null;
""")
    print("formOfFor sets the texts side by side as written, a closing period aside (the page's code until 13 November)")
elif mode == "page-says":
    page("`${e.resolved.text} (${e.relation} ${formOfTarget(e)})`", "`${e.resolved.text}`")
    print("formOfSays prints the English alone")
elif mode == "page-no-pointer":
    page("if (fo && fo.resolved) { btn.dataset.pointer = spanJoin(route.text); btn.textContent = formOfSays(fo); }", "if (fo && fo.resolved) { btn.textContent = formOfSays(fo); }")
    print("the pill is not given data-pointer")
else:
    raise SystemExit(f"no mode {mode}")
