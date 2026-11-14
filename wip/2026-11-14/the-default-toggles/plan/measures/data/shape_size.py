# The per-book file in the plan's shape (section 3 of the plan), built in memory for all 39 books and measured raw and
# gzip -9; the index's per-book block with its rest fill; nothing written but the sizes table and one sample place set.
# Shape of places[n-1]: null, or [step, macula, ubs, bdb]:
#   step   [[kind 0 r | 1 v | 2 a, words | 0, letter?], ...]        picks 1..n in STEP's order (mend applied)
#   macula words | 0
#   ubs    [[words, ...], ...]                                      one list per piece with picks, picks 1..n each
#   bdb    [[sense, w], ...]                                        sense "1" / "A" / "" (the entry); w = 1-based index
#                                                                   into bdb_words (the record's highlights), 0 = none
# Variant "short": STEP words written 1 where they equal the zone word's pieces joined by "/" (the brief's short form).
# python3 -I shape_size.py <reader dir> <default-picks dir> <out dir>
import gzip, json, os, re, sys, collections
R, L, OUT = sys.argv[1:4]
V1, V11 = os.path.join(L, "default-picks-v1"), os.path.join(L, "default-picks-v1.1")
mend = {}
for line in open(os.path.join(V11, "step-mend-v1.1.jsonl"), encoding="utf-8"):
    d = json.loads(line); mend[(d["book"], d["p"])] = d["step"]
SIGN = re.compile(r"^(<[^>]*>|\[[^\]]*\]|¿|~|X|×|\+|-|—)$")
def sense(meaning):
    m = re.match(r"^point\d+:(.+?)\.?$", str(meaning)); return m.group(1) if m else ""
rows = []; idx_books = {}; sample = None
for f in sorted(os.listdir(V1)):
    if not f.endswith(".jsonl") or f == "rows-v1.jsonl": continue
    book = f[:-6]
    led = {}
    for l in open(os.path.join(V1, f), encoding="utf-8"):
        d = json.loads(l); led[d["p"]] = d
    z = json.loads(gzip.open(os.path.join(R, "data", "zones", f"{book}.bin")).read())
    words_tab = []; wix = {}
    def w_of(t):
        if not t: return 0
        if t not in wix: words_tab.append(t); wix[t] = len(words_tab)
        return wix[t]
    out = {"full": [], "short": []}; rest_fill = []; n = 0
    for sec in z["sections"]:
        k = 0
        for w in sec.get("words", []):
            n += 1
            if w.get("mark"):
                for v in out.values(): v.append(None)
                continue
            k += 1; d = led[f"{sec['label']}:{k}"]
            st = mend.get((book, d["p"]), d.get("step") or [])
            pgj = "/".join((x.get("g") or "") for x in (w.get("pg") or []))
            mac = d.get("macula"); mac = mac[0] if mac and mac[0] else 0
            ubs = [[str(pk[2]) for pk in pc[2]] for pc in (d.get("ubs") or []) if pc[2]]
            bdb = [[sense(x[2]), w_of(x[5])] for x in (d.get("bdb") or [])]
            for var in ("full", "short"):
                step = []
                for i, x in enumerate(st):
                    words = x[4] if x[4] else 0
                    if var == "short" and i == 0 and words and words == pgj: words = 1
                    e = ["rva".index(x[1]), words]
                    if x[1] == "v" and len(x) > 6 and x[6]: e.append(x[6][0])
                    step.append(e)
                out[var].append([step, mac, ubs, bdb] if (step or mac or ubs or bdb) else None)
            if not st and mac: rest_fill.append([n, mac])
    for var, places in out.items():
        body = {"schema_version": "DEFAULT_PICKS_BOOK_V1", "book": book, "bdb_words": words_tab, "places": places}
        raw = json.dumps(body, ensure_ascii=False, separators=(",", ":")).encode()
        rows.append((book, var, len(raw), len(gzip.compress(raw, 9))))
    idx_books[book] = {"rest_fill": {"second": "macula", "places": rest_fill}}
    if book == "genesis": sample = out["full"][:9]
os.makedirs(OUT, exist_ok=True)
with open(os.path.join(OUT, "shape-sizes.tsv"), "w") as o:
    o.write("book\tvariant\traw\tgz\n")
    for r in rows: o.write("\t".join(str(x) for x in r) + "\n")
    for var in ("full", "short"):
        o.write(f"39 books\t{var}\t{sum(r[2] for r in rows if r[1] == var)}\t{sum(r[3] for r in rows if r[1] == var)}\n")
ib = json.dumps(idx_books, ensure_ascii=False, separators=(",", ":")).encode()
print("index rest-fill block raw", len(ib), "gz", len(gzip.compress(ib, 9)), "places", sum(len(v["rest_fill"]["places"]) for v in idx_books.values()))
json.dump(sample, open(os.path.join(OUT, "genesis-first-places-sample.json"), "w"), ensure_ascii=True)
print("ok")
