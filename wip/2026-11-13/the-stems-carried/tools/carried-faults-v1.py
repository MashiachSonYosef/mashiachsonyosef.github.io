# One fault put into a reader tree, for the check of the stems carried (check-stems-carried-v1) or the
# extension's B4 to catch. Each mode changes one file in place; the harness keeps a copy first and puts it back.
# Data modes rewrite one book's lattice sidecar; code modes change a tool, and the harness projects the book again.
# The keys and rows a mode touches are found in the data, never named.
# python3 -I carried-faults-v1.py <reader dir> <mode> <book> <row-stems-v2.jsonl>
import gzip, json, os, sys

R, mode, book, row_stems = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
SEP = chr(1)
side_path = os.path.join(R, "data", "zones", f"{book}.lattice.bin")
zone_path = os.path.join(R, "data", "zones", f"{book}.bin")

def swap(path, old, new):
    s = open(path, encoding="utf-8").read()
    if s.count(old) != 1:
        sys.exit(f"{mode}: expected one of {old[:70]!r} in {path}, found {s.count(old)}")
    open(path, "w", encoding="utf-8").write(s.replace(old, new))

def load(path):
    return json.loads(gzip.decompress(open(path, "rb").read()))

def save(path, obj):
    open(path, "wb").write(gzip.compress(json.dumps(obj, ensure_ascii=False, separators=(",", ":")).encode("utf-8"), 9))

def inside(s):
    a, b = 0, len(s)
    while a < b and s[a] == "[": a += 1
    while b > a and s[b - 1] == "]": b -= 1
    return s[a:b]

def known(grades, s):
    g = grades.get(s) if isinstance(s, str) else None
    return bool(g and isinstance(g.get("st"), list) and g["st"])

def page_asks(zone, grades):
    out = set()
    for sec in zone.get("sections", []):
        for w in sec.get("words", []):
            if w.get("mark"): continue
            ww = w.get("w")
            forms = [((inside(h["s"]) if h.get("role") == "QERE" else h["s"]) if isinstance(h.get("s"), str) else None, h.get("k")) for h in ww if h] if isinstance(ww, list) and ww else [(w.get("s"), w.get("k"))]
            for s, k in forms:
                if isinstance(k, str) and k and known(grades, s): out.add(k)
    return out

def module_asks(zone, grades):
    out = {g["k"] for s, g in grades.items() if known(grades, s) and isinstance(g.get("k"), str) and g["k"]}
    for sec in zone.get("sections", []):
        for w in sec.get("words", []):
            if w.get("mark"): continue
            pairs = [(w.get("s"), w.get("k"))]
            for h in w.get("w") or []:
                if h and isinstance(h.get("s"), str): pairs += [(h["s"], h.get("k")), (inside(h["s"]), h.get("k"))]
            for p in w.get("pg") or []:
                if p: pairs.append((p.get("s"), p.get("k")))
            for s, k in pairs:
                if isinstance(k, str) and k and known(grades, s): out.add(k)
    return out

def file2_lines():
    by = {}
    for t in open(row_stems, encoding="utf-8"):
        if not t.strip(): continue
        l = json.loads(t)
        if l.get("stems"): by.setdefault(l["key"], []).append(l)
    return by

def ident(l):
    return f"{l['m']}{SEP}{l['rank']}{SEP}{l['route']}"

if mode in ("rule-gone", "count-off", "dead-key", "drop-key", "wrong-stem", "drop-ext-row"):
    side, zone = load(side_path), load(zone_path)
    grades, stems, carried = side.get("grades", {}), side["stems"], side["binyan"]["carried"]
    if mode == "rule-gone":
        side["binyan"].pop("carried")
    elif mode == "count-off":
        carried["rows_carried"] += 1
    elif mode == "dead-key":
        asked = module_asks(zone, grades)
        k = sorted(x for x in side["routes"] if x not in asked and x not in stems)[0]
        stems[k] = {f"M4{SEP}1{SEP}a reading": ["qal"]}
        for f in ("keys_carried", "rows_carried", "keys_with_stems", "rows_with_stems"): carried[f] += 1
    else:
        lines = file2_lines()
        read = set()
        for sec in zone.get("sections", []):
            for w in sec.get("words", []):
                ks = [h.get("k") for h in w.get("w")] if isinstance(w.get("w"), list) else [w.get("k")]
                read.update(x for x in ks + [w.get("h")] if isinstance(x, str) and x)
        ask = page_asks(zone, grades)
        pick = sorted(k for k in stems if k in ask and k in read and k in lines)
        if not pick: sys.exit(f"{mode}: no key asked, read and lined in {book}")
        if mode == "drop-key":
            k = pick[0]
            n = len(stems.pop(k))
            carried["keys_carried"] -= 1
            carried["rows_carried"] -= n
        elif mode == "wrong-stem":
            k = pick[0]
            l = next(l for l in lines[k] if ident(l) in stems[k])
            stems[k][ident(l)] = ["qal"] if l["stems"] != ["qal"] else ["hophal"]
        else:
            # a row the extension gave stems: one held on an asked key that no line of file 2 names
            for k in sorted(x for x in stems if x in ask):
                f2 = {ident(l) for l in lines.get(k, [])}
                ext = sorted(i for i in stems[k] if i not in f2)
                if ext: break
            else:
                sys.exit(f"{mode}: no row of the extension on an asked key in {book}")
            del stems[k][ext[0]]
            carried["rows_carried"] -= 1
            side["binyan"]["extension"]["rows_given_stems_in_this_book"] -= 1
    save(side_path, side)
elif mode == "proj-all":
    swap(os.path.join(R, "tools", "project-lattice-v12-v1.mjs"), "stems: stemsCarried, binyan:", "stems: stemsByKey, binyan:")
elif mode == "module-none":
    swap(os.path.join(R, "tools", "stems-carried-v1.mjs"), "export const keysAskedWithStems = (zone, grades) => {\n  const out = new Set();\n", "export const keysAskedWithStems = (zone, grades) => {\n  const out = new Set();\n  return out;\n")
else:
    sys.exit(f"no mode {mode}")
print(f"{mode}: put in")
