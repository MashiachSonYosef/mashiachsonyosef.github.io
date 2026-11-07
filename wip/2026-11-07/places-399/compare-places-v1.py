import gzip, json, os, collections, unicodedata, sys
S = "<scratchpad>"  # the session scratchpad: old/reader/data/zones is the served tree at main 1df6558c; dl-moses holds the relay
Z = f"{S}/old/reader/data/zones"
PF = f"{S}/dl-moses/corpus-lane-builds/moses-binyan-ledger-v1/build-r2/place-stems-v2.jsonl"
ACC = set(chr(c) for c in range(0x0591, 0x05AF + 1)) | {"ֽ", "׀", "׃", "ׄ", "ׅ", "׆"}  # cantillation, meteg, paseq, sof pasuq, marks
def strip_acc(t): return "".join(ch for ch in t if ch not in ACC)
def bare(t): return "".join(ch for ch in unicodedata.normalize("NFKD", t) if not unicodedata.combining(ch)).replace("־", "").replace("־", "")
zones = {}
books = sorted(f[:-4] for f in os.listdir(Z) if f.endswith(".bin") and ".lattice" not in f)
verse_words = {}
verse_kq = {}
for b in books:
    z = json.loads(gzip.open(f"{Z}/{b}.bin").read())
    if "sections" not in z: continue
    for sec in z["sections"]:
        label = sec.get("label")
        ws = [w.get("s", "") for w in sec.get("words", []) if not w.get("mark")]
        kq = [bool(w.get("kq")) for w in sec.get("words", []) if not w.get("mark")]
        verse_words[(b, label)] = ws
        verse_kq[(b, label)] = kq
pf_books = set()
n = 0; agree = 0
cause = collections.Counter(); ex = collections.defaultdict(list)
for line in open(PF, encoding="utf8"):
    if not line.strip(): continue
    l = json.loads(line); n += 1
    b = l["book"]; pf_books.add(b)
    c, v, i = l["place"].split(":"); i = int(i)
    ws = verse_words.get((b, f"{c}:{v}"))
    if ws is None:
        k = "verse absent from the zone" if b in set(books) else "book not served"
        cause[k] += 1; ex[k].append(l); continue
    if i < 1 or i > len(ws):
        k = "word index past the verse's words"; cause[k] += 1; ex[k].append((l, len(ws), ws)); continue
    s = ws[i - 1]
    if s == l["surface"]:
        agree += 1
        if verse_kq[(b, f"{c}:{v}")][i - 1]: cause["agree, but the zone word is a ketiv/qere half"] += 1; ex["agree, but the zone word is a ketiv/qere half"].append((l, s, ws))
        continue
    if verse_kq[(b, f"{c}:{v}")][i - 1]:
        k = "a ketiv/qere place: the zone holds the half as written, the file another form"; cause[k] += 1; ex[k].append((l, s, ws)); continue
    # the surface differs: find the cause
    if strip_acc(s) == strip_acc(l["surface"]): k = "same letters and points, accents differ"
    elif bare(s) == bare(l["surface"]): k = "same letters, points differ"
    else:
        # is the place file's surface elsewhere in the verse?
        js = [j + 1 for j, w in enumerate(ws) if w == l["surface"]]
        if js: k = f"the surface stands at another index in the verse (shift {js[0]-i:+d})"
        else:
            js = [j + 1 for j, w in enumerate(ws) if bare(w) == bare(l["surface"])]
            if js: k = f"the same letters stand at another index (shift {js[0]-i:+d})"
            elif any(bare(l["surface"]) in bare(w) for w in ws): k = "the surface is a part of a zone word (a maqaf join)"
            elif any(bare(w) in bare(l["surface"]) and bare(w) for w in ws): k = "a zone word is a part of the surface"
            else: k = "the surface is nowhere in the verse"
    cause[k] += 1; ex[k].append((l, s, ws))
print("place file lines", n, "· agree on book, place and surface", agree, "· apart", n - agree)
print("books in the place file", len(pf_books), "· served zones", len(books))
for k, c in cause.most_common(): print(f"  {c:5d}  {k}")
json.dump({k: [e for e in v[:12]] for k, v in ex.items()}, open(f"{S}/v16/places/examples.json", "w"), ensure_ascii=False, indent=1)
# the 399 by book and by cause, whole
with open(f"{S}/v16/places/apart.tsv", "w") as f:
    for k, v in ex.items():
        for e in v:
            l = e if isinstance(e, dict) else e[0]
            s = "" if isinstance(e, dict) else (e[1] if isinstance(e[1], str) else str(e[1]))
            f.write(f"{l['book']}\t{l['place']}\t{l['surface']}\t{s}\t{k}\n")
