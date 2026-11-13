# PROTOTYPE, not a tool of the tree: each source's own picks at each word place of a book, from the corpus lane's
# default picks ledger (relay v180) with its v1.1 mend of STEP's picks (relay v180.1), laid as a small file per book
# the page fetches the first time a card asks (as data/source-suggested/ is). Each place keeps, per source, its picks
# in the source's own order: STEP's kind (its reading here, a meaning variant, an alternative number), its entry and
# its words; MACULA's English for the word; UBS's meanings piece by piece; BDB's sense (its point), the words that
# open the sense, and the entry's own highlighted words.
# python3 -I bake-default-picks-proto.py <ledger dir default-picks/> <out dir> <book> [<book> ...]
import json, os, sys

D, OUT, books = sys.argv[1], sys.argv[2], sys.argv[3:]
mend = {}
for line in open(os.path.join(D, "default-picks-v1.1", "step-mend-v1.1.jsonl"), encoding="utf-8"):
    d = json.loads(line)
    mend[(d["book"], d["p"])] = d["step"]
os.makedirs(OUT, exist_ok=True)
for book in books:
    places, counts, mended = {}, {"step": 0, "macula": 0, "ubs": 0, "bdb": 0}, 0
    for line in open(os.path.join(D, "default-picks-v1", f"{book}.jsonl"), encoding="utf-8"):
        d = json.loads(line)
        c, v, w = d["p"].split(":")
        step = mend.get((book, d["p"]))
        if step is not None: mended += 1
        else: step = d.get("step") or []
        rec = {}
        if step:
            rec["step"] = [{"n": x[0], "kind": x[1], "entry": x[2], "meaning": x[3], "words": x[4]} for x in step]
        mac = d.get("macula")
        if mac and mac[0]:
            rec["macula"] = {"words": mac[0]}
        ubs = [{"he": piece[1], "picks": [{"n": m[0], "words": m[2]} for m in piece[2]]} for piece in (d.get("ubs") or []) if piece[2]]
        if ubs:
            rec["ubs"] = ubs
        bdb = [{"n": x[0], "entry": x[1], "point": str(x[2]).split(":", 1)[-1], "words": x[3], "entry_words": x[5]} for x in (d.get("bdb") or [])]
        if bdb:
            rec["bdb"] = bdb
        for k in counts:
            if k in rec: counts[k] += 1
        if rec:
            places.setdefault(f"{c}:{v}", {})[w] = rec
    body = {"schema_version": "DEFAULT_PICKS_PROTOTYPE", "book": book, "from": "the corpus lane's default picks ledger v1 (relay v180), STEP's picks mended by v1.1 (relay v180.1)",
            "counts": {"places_with_a_pick": counts, "step_mended": mended}, "places": places}
    p = os.path.join(OUT, f"{book}.json")
    with open(p, "w", encoding="utf-8") as f:
        json.dump(body, f, ensure_ascii=False, separators=(",", ":"))
    print(f"{book}: {os.path.getsize(p):,} bytes · picks at {counts} · {mended} places with STEP's picks mended")
