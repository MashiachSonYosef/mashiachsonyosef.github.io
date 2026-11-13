# The chain books of two trees, card by card at rest: for every word, the links its card printed before and prints
# now (each a reading's fingerprint), how many went and how many came; how many cards lost a link, gained one, did
# both, or stand as they were; how many open on another reading; and the same for the lifted state, which a change
# to what "only this pointing" withholds must not move. It measures; it changes nothing.
# python3 -I chain-cards-before-and-after.py <chain dir before> <chain dir after>
import collections, gzip, json, os, sys
A, B = sys.argv[1], sys.argv[2]
T = collections.Counter()
by_book = {}
for book in sorted(os.listdir(B)):
    fa, fb = os.path.join(A, book, "chain-v1.json.gz"), os.path.join(B, book, "chain-v1.json.gz")
    if not (os.path.exists(fa) and os.path.exists(fb)): continue
    a, b = (json.loads(gzip.open(f).read().decode("utf-8")) for f in (fa, fb))
    T["books"] += 1
    gone_b = came_b = 0
    for sa, sb in zip(a["sections"], b["sections"]):
        assert sa["label"] == sb["label"] and len(sa["cells"]) == len(sb["cells"]), (book, sa["label"])
        for ca, cb in zip(sa["cells"], sb["cells"]):
            if "mark" in cb: continue
            T["words"] += 1
            for state in ("rest", "lifted"):
                xa, xb = ca.get(state), cb.get(state)
                if not xa or not xb or "pool" not in xa or "pool" not in xb:
                    if state == "rest": T["words with no card of their own at rest in one tree or both"] += 1
                    continue
                # a card that prints no reading holds no pool
                la = [l["r"] for l in a["pools"][xa["pool"]]] if xa["pool"] is not None else []
                lb = [l["r"] for l in b["pools"][xb["pool"]]] if xb["pool"] is not None else []
                gone = [r for r in la if r not in set(lb)]; came = [r for r in lb if r not in set(la)]
                T[f"{state}: links gone"] += len(gone); T[f"{state}: links come"] += len(came)
                if state == "rest": gone_b += len(gone); came_b += len(came)
                if gone and came: T[f"{state}: cards that lost a link and gained one"] += 1
                elif gone: T[f"{state}: cards that lost a link and gained none"] += 1
                elif came: T[f"{state}: cards that gained a link and lost none"] += 1
                else: T[f"{state}: cards with the same links"] += 1
                oa = la[xa.get("on", 0)] if la else None; ob = lb[xb.get("on", 0)] if lb else None
                if oa != ob: T[f"{state}: cards that open on another reading"] += 1
                if la and not lb: T[f"{state}: cards left with no link"] += 1
    by_book[book] = (gone_b, came_b)
for k in sorted(T, key=lambda k: (not k.startswith("books"), not k.startswith("words"), k)): print(f"{T[k]:9,d}  {k}")
print("at rest, by book (links gone, links come):")
print(" · ".join(f"{k} −{v[0]:,} +{v[1]:,}" for k, v in by_book.items()))
