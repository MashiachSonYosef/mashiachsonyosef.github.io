# The cards at rest of words their place divides that still print one pill under core-block-rule-v1: each with its
# core piece's surface, the one pill, and the surfaces of the same key standing alone in the book with their pills.
# It reads the chain books and the zones; it changes nothing. python3 -I the-fifteen.py <reader dir> <chain dir>
import collections, gzip, json, os, sys
R, C = sys.argv[1], sys.argv[2]
for book in sorted(os.listdir(C)):
    p = os.path.join(C, book, "chain-v1.json.gz")
    if not os.path.exists(p): continue
    ch = json.loads(gzip.open(p).read().decode("utf-8"))
    zone = json.loads(gzip.open(os.path.join(R, "data/zones", f"{book}.bin")).read().decode("utf-8"))
    cards = []
    for sec, zsec in zip(ch["sections"], zone["sections"]):
        words = [w for w in zsec.get("words") or [] if not w.get("mark")]
        cells = [c for c in sec["cells"] if "mark" not in c]
        for i, c in enumerate(cells):
            rest = c.get("rest") or {}
            if "pool" not in rest or i >= len(words): continue
            pool = ch["pools"][rest["pool"]] if rest["pool"] is not None else []
            cards.append((words[i], pool, sec.get("label")))
    alone = collections.defaultdict(collections.Counter)
    for w, pool, _ in cards:
        pg = w.get("pg") or []
        if len(pg) == 1 and w.get("k"): alone[w["k"]][(w.get("s"), len(pool))] += 1
    for w, pool, label in cards:
        pg = w.get("pg") or []
        if len(pg) < 2 or len(pool) != 1: continue
        cores = [x for x in pg if (x or {}).get("r") == "core"]
        core = cores[0] if len(cores) == 1 else None
        print(f"{book} {label} · {w.get('s')} · pieces {' + '.join(str((x or {}).get('g') or '').strip() + '/' + str((x or {}).get('r')) + '/' + str((x or {}).get('s')) for x in pg)}")
        print(f"    the one pill: {json.dumps(pool[0], ensure_ascii=False)[:160]}")
        if core: print(f"    core key {core.get('k')} · alone in the book: {', '.join(f'{s} ({n} pills) x{m}' for (s, n), m in alone.get(core.get('k'), collections.Counter()).most_common(4)) or 'never'}")
