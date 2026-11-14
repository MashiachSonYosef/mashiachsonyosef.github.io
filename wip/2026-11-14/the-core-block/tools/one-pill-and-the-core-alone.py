# The chain books' cards at rest of words their place divides into pieces, beside the card of the same word without
# its prefix or ending where the book prints that core standing alone: how many pills each prints. The fresh readers
# (relay v184 §5): "a card of one pill that only repeats the line ... the same word without it opens a full card".
# It reads the chain books and the zones; it changes nothing.
# python3 -I one-pill-and-the-core-alone.py <reader dir> <chain dir>
import collections, gzip, json, os, statistics, sys
R, C = sys.argv[1], sys.argv[2]
T = collections.Counter(); sizes_core = []; eg = []
for book in sorted(os.listdir(C)):
    p = os.path.join(C, book, "chain-v1.json.gz")
    if not os.path.exists(p): continue
    ch = json.loads(gzip.open(p).read().decode("utf-8"))
    zone = json.loads(gzip.open(os.path.join(R, "data/zones", f"{book}.bin")).read().decode("utf-8"))
    cards = []   # (word, pills at rest)
    for sec, zsec in zip(ch["sections"], zone["sections"]):
        words = [w for w in zsec.get("words") or [] if not w.get("mark")]
        cells = [c for c in sec["cells"] if "mark" not in c]
        for i, c in enumerate(cells):
            rest = c.get("rest") or {}
            if "pool" not in rest or i >= len(words): continue
            pool = ch["pools"][rest["pool"]] if rest["pool"] is not None else []
            cards.append((words[i], len(pool), sec.get("label")))
    alone = collections.defaultdict(list)   # a key of one piece -> pills of its cards at rest
    for w, n, _ in cards:
        pg = w.get("pg") or []
        if len(pg) == 1 and w.get("k"): alone[w["k"]].append(n)
    for w, n, label in cards:
        pg = w.get("pg") or []
        if len(pg) < 2: continue
        cores = [x for x in pg if (x or {}).get("r") == "core"]
        T["words their place divides, with a card at rest"] += 1
        if n != 1: continue
        T["  of those, one pill"] += 1
        if len(cores) != 1: T["    with no core or more than one"] += 1; continue
        ck = cores[0].get("k")
        if ck not in alone: T["    whose core never stands alone in the book"] += 1; continue
        m = max(alone[ck])
        T["    whose core stands alone in the book"] += 1
        sizes_core.append(m)
        if m > 1: T["      and there its card prints more than one pill"] += 1
        else: T["      and there its card prints one pill or none"] += 1
        if m > 1 and len(eg) < 12: eg.append(f"{book} {label} · {w.get('s')} ({' + '.join(str((x or {}).get('g') or '').strip() for x in pg)}) · the core {ck} alone prints {m} pills")
for k, v in T.items(): print(f"{v:9,}  {k}")
if sizes_core: print(f"\nthe core's card alone, pills: median {statistics.median(sizes_core)}, the largest {max(sizes_core)}")
for e in eg: print("  " + e)
