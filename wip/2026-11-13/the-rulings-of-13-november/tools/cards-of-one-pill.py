# The chain books' cards at rest that print one pill only (v184 §5: "a card of one pill that only repeats the line"),
# set beside the word's shape in its zone: a word its place divides into pieces (a prefix or an ending), or one of one
# region; and how many pills the card of the word's core piece would print where the chain records a card for it.
# It reads the chain books and the zones; it changes nothing.
# python3 -I cards-of-one-pill.py <reader dir> <chain dir>
import collections, gzip, json, os, sys

R, C = sys.argv[1], sys.argv[2]
T = collections.Counter(); by_book = collections.Counter(); first = []
for book in sorted(os.listdir(C)):
    p = os.path.join(C, book, "chain-v1.json.gz")
    if not os.path.exists(p): continue
    ch = json.loads(gzip.open(p).read().decode("utf-8"))
    zone = json.loads(gzip.open(os.path.join(R, "data/zones", f"{book}.bin")).read().decode("utf-8"))
    for sec, zsec in zip(ch["sections"], zone["sections"]):
        words = [w for w in zsec.get("words") or [] if not w.get("mark")]
        cells = [c for c in sec["cells"] if "mark" not in c]
        for i, c in enumerate(cells):
            rest = c.get("rest") or {}
            if "pool" not in rest: continue
            T["words with a card of their own at rest"] += 1
            pool = ch["pools"][rest["pool"]] if rest["pool"] is not None else []
            n = len(pool)
            w = words[i] if i < len(words) else {}
            pieces = len(w.get("pg") or [])
            shape = "a word its place divides" if pieces > 1 else "a word of one piece"
            T[f"{shape}"] += 1
            if n == 1:
                T[f"  of those, one pill: {shape}"] += 1
                by_book[book] += 1
                if pieces > 1 and len(first) < 12: first.append(f"{book} {sec['label']} word {i + 1} · {w.get('s')} · pieces: {' + '.join(str((x or {}).get('g') or '') for x in w.get('pg') or [])}")
            elif n == 0: T[f"  of those, no pill: {shape}"] += 1
for k, v in T.items(): print(f"{v:9,}  {k}")
print("\nby book:", ", ".join(f"{b} {n}" for b, n in by_book.most_common()))
print("\nthe first words of several pieces whose card prints one pill:")
for f in first: print("  " + f)
