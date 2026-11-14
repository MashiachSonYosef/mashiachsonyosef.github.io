# Default picks, the data lane's second measure (v49). Measures only; writes only into its own folder.
# (1) Every row the ledger names (rows-v1.jsonl, 152,423, then rows-added-v1.1.jsonl, 225, numbered on) found again
#     in the served route store by [key, rank, m id, sha16 of the route text]: found once, found twice, or missing.
# (2) Per source, for each line pick (pick 1): whether it names a row at all, whether its first named row is its own
#     source's, and (estimate) whether the entry gate would withhold every row it names at the place (the place's
#     entry read from the zone word's tg, not the lattice's core tags as the page reads it).
# (3) STEP's pick 1 words against the zone's pieces joined by "/" (the brief's short form).
# (4) Today's resting line where STEP has no pick, and where a one-word line is not credited PIECE:TAHOT.
# python3 -I rows_resolve.py <reader dir> <default-picks dir> <out dir>
import gzip, json, os, re, sys, hashlib, collections
R, L, OUT = sys.argv[1:4]
V1, V11 = os.path.join(L, "default-picks-v1"), os.path.join(L, "default-picks-v1.1")
STORE = os.path.join(R, "data", "route-store")
rows = [json.loads(l) for l in open(os.path.join(V1, "rows-v1.jsonl"), encoding="utf-8")]
n_v1 = len(rows)
rows += [json.loads(l) for l in open(os.path.join(V11, "rows-added-v1.1.jsonl"), encoding="utf-8")]
mend = {}
for line in open(os.path.join(V11, "step-mend-v1.1.jsonl"), encoding="utf-8"):
    d = json.loads(line); mend[(d["book"], d["p"])] = d["step"]
sha16 = lambda s: hashlib.sha256(s.encode("utf-8")).hexdigest()[:16]
shard_of = lambda k: hashlib.sha256(k.encode("utf-8")).hexdigest()[:2]
by_shard = collections.defaultdict(list)
for i, r in enumerate(rows): by_shard[shard_of(r[0])].append(i)
found = [None] * len(rows); C = collections.Counter(); miss_eg = []
for sh, ids in sorted(by_shard.items()):
    data = json.loads(gzip.open(os.path.join(STORE, "shards", f"{sh}.bin")).read())
    for i in ids:
        k, rank, m, h = rows[i]
        ms = [x for x in data.get(k, []) if x[0] == rank and x[3] == m and sha16(x[1]) == h]
        if not ms:
            C["rows missing"] += 1
            if len(miss_eg) < 10: miss_eg.append(rows[i])
            continue
        C["rows found" if len(ms) == 1 else "rows found more than once"] += 1
        x = ms[0]
        found[i] = {"m": x[3], "facts": x[10] if len(x) > 10 and isinstance(x[10], dict) else None}
ix = json.load(open(os.path.join(STORE, "index.json")))
C["store_version " + ix["store_version"]] = 1
C["rows named"] = len(rows); C["rows of v1"] = n_v1

def num_of(tag):
    x = re.match(r"^[HA]?0*(\d+)", str(tag)); return f"H{x.group(1)}" if x and x.group(1) != "0" else None
def tag_of(tag): return re.sub(r"^H0*", "H", str(tag))
def verdict(facts, place):
    nums = (facts or {}).get("n") or []
    if not nums: return "none"
    if not any(x in place["numbers"] for x in nums): return "other"
    t = (facts or {}).get("t") or []
    return "other" if t and place["lettered"] and not any(x in place["tags"] for x in t) else "this"
OWN = {"r": "M4", "v": "M19", "a": "M19", "macula": "M3", "ubs": "M18", "bdb": "M46"}
SIGN = re.compile(r"^(<[^>]*>|\[[^\]]*\]|¿|~|X|×|\+|-|—)$")
def spanJoin(t):
    s = " + ".join(x.strip() for x in str(t).split("/") if x.strip()); return s[:-1] if s.endswith(".") else s

P = collections.Counter(); eg = collections.defaultdict(list)
def ex(k, s):
    if len(eg[k]) < 6: eg[k].append(s)
books = sorted(f[:-6] for f in os.listdir(V1) if f.endswith(".jsonl") and f != "rows-v1.jsonl")
for book in books:
    led = {}
    for l in open(os.path.join(V1, f"{book}.jsonl"), encoding="utf-8"):
        d = json.loads(l); led[d["p"]] = d
    z = json.loads(gzip.open(os.path.join(R, "data", "zones", f"{book}.bin")).read())
    rest = json.loads(gzip.open(os.path.join(R, "data", "resting-lines", f"{book}.json.gz")).read())
    for si, (label, units) in enumerate(rest["sections"]):
        words = z["sections"][si].get("words", []); num = {}; k = 0
        for i, w in enumerate(words):
            if not w.get("mark"): k += 1; num[i] = k
        for first, count, text, credit in units:
            idx = [i for i in range(first, first + count) if i in num]
            for i in idx:
                p = f"{label}:{num[i]}"; d = led[p]; w = words[i]
                st = mend.get((book, p), d.get("step") or [])
                tg = w.get("tg"); place = None
                if tg:
                    tags = [tag_of(t) for t in str(tg).split(",") if t]
                    nums = sorted({num_of(t) for t in tags if num_of(t)})
                    if nums: place = {"tags": tags, "numbers": nums, "lettered": all(re.search(r"[A-Za-z]$", t) for t in tags)}
                # (3) short form
                if st:
                    pgj = "/".join((x.get("g") or "") for x in (w.get("pg") or []))
                    P["step pick 1"] += 1; P["step pick 1 words == '/'.join(pg g)"] += int(st[0][4] == pgj)
                # (2) each source's line pick and its rows
                picks = []
                if st: picks.append(("step", st[0][1], st[0][5], st[0][4]))
                mac = d.get("macula")
                if mac and mac[0]: picks.append(("macula", "macula", [r for pc in mac[1] for r in pc[3]], mac[0]))
                pcs = [pc for pc in (d.get("ubs") or []) if pc[2] and not SIGN.match(str(pc[2][0][2]).strip())]
                if pcs: picks.append(("ubs", "ubs", [r for pc in pcs for r in pc[2][0][3]], pcs[0][2][0][2]))
                b = d.get("bdb") or []
                if b and b[0][5]: picks.append(("bdb", "bdb", b[0][4], b[0][5]))
                for src, kind, rr, words_ in picks:
                    P[f"{src}: line picks"] += 1
                    if not rr: P[f"{src}: names no row"] += 1; ex(f"{src} no row", f"{book} {p} «{words_}»"); continue
                    f0 = found[rr[0]]
                    if f0 is None: P[f"{src}: first named row missing"] += 1; continue
                    if f0["m"] != OWN[kind]: P[f"{src}: first named row is another source's"] += 1; P[f"{src}: credit row {f0['m']}"] += 1
                    if place:
                        vs = [verdict(found[r]["facts"], place) for r in rr if found[r]]
                        if vs and all(v == "other" for v in vs):
                            P[f"{src}: every named row withheld by the entry gate (estimate)"] += 1
                            ex(f"{src} gated", f"{book} {p} «{words_}» tg {tg}")
                    if src == "bdb":
                        if all(((found[r] or {}).get("facts") or {}).get("opens") for r in rr): P["bdb: every named row is a sense opening (note)"] += 1
                # (4) today's line where STEP has no pick; one-word lines not credited PIECE:TAHOT
                if not st:
                    P["no step pick"] += 1
                    P[f"no step pick: today credit {credit}"] += 1
                    ex("no step pick", f"{book} {p} today «{text}» {credit} | mac «{(mac or [None])[0]}» ubs «{pcs[0][2][0][2] if pcs else None}»")
                elif len(idx) == 1 and credit != "PIECE:TAHOT":
                    P["one-word line not PIECE:TAHOT, STEP has a pick"] += 1
                    P[f"  credit {credit}"] += 1
                    same = signs_same = spanJoin(st[0][4]) == text
                    P["  of them STEP's pick 1 joined == today's"] += int(same)
                    ex("one-word other", f"{book} {p} today «{text}» {credit} | step «{st[0][4]}»")
                if len(idx) > 1: P["words under a run line"] += 1
    print(book, "done", flush=True)
with open(os.path.join(OUT, "rows-and-picks.txt"), "w") as o:
    for k in sorted(C): o.write(f"{C[k]:9,d}  {k}\n")
    for x in miss_eg: o.write(f"missing: {json.dumps(x, ensure_ascii=True)}\n")
    for k in sorted(P): o.write(f"{P[k]:9,d}  {k}\n")
    for k, v in eg.items():
        for x in v: o.write(f"{k} | {x.encode('ascii', 'backslashreplace').decode()}\n")
print("ok")
