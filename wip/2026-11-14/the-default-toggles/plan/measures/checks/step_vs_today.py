# STEP's own pick at every place (default picks v1, STEP mended by v1.1) against today's line, book by book.
# Today's line is read two ways: (1) the resting-lines record (what the page drew at rest, data/resting-lines),
# (2) the zone's baked place reading (word.pg pieces joined, which placeLine prints). Measures only; writes one
# small JSON beside this script. python3 -I step_vs_today.py <reader dir> <default-picks dir> <out json> [book ...]
import gzip, json, os, re, sys, collections
R, L, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
ONLY = sys.argv[4:]
V1, V11 = os.path.join(L, "default-picks-v1"), os.path.join(L, "default-picks-v1.1")
mend = {}
for line in open(os.path.join(V11, "step-mend-v1.1.jsonl"), encoding="utf-8"):
    d = json.loads(line); mend[(d["book"], d["p"])] = d["step"]
GAP = "​"
SIGN = re.compile(r"^(<[^>]*>|\[[^\]]*\]|¿|~|X|×|\+)$")  # zone.html signOnly
UBS_SIGN = re.compile(r"^(<[^>]*>|\[[^\]]*\]|¿|~|X|×|\+|-|—)$")
def span_join(t):  # zone.html spanJoin
    s = " + ".join(x.strip() for x in str(t).split("/") if x.strip())
    return s[:-1] if s.endswith(".") else s
def fold(t):
    # the line's words with joiners, gaps and sign-only pieces taken out, case folded, a closing stop off
    ps = [p.strip() for p in re.split(r" \+ |/", str(t).replace(GAP, " ")) if p.strip()]
    keep = [p for p in ps if not SIGN.match(p)]  # a sign-only line is drawn as a gap at rest (signs off)
    s = " ".join(" ".join(keep).split())
    return (s[:-1] if s.endswith(".") else s).lower()
def step_pick1(d, book):
    st = mend.get((book, d["p"]), d.get("step") or [])
    return (st[0][4] or "") if st else "", len(st)
def mac(d):
    m = d.get("macula"); return (m[0] or "") if m else ""
def ubs(d):
    pcs = [p for p in (d.get("ubs") or []) if p[2]]
    if not pcs or all(UBS_SIGN.match(str(p[2][0][2]).strip()) for p in pcs): return ""
    return " + ".join(p[2][0][2] for p in pcs if p[2][0][2])
def bdb(d):
    b = d.get("bdb") or []; return (b[0][5] or "") if b else ""
SRC = ("step", "macula", "ubs", "bdb")
books = sorted(f[:-6] for f in os.listdir(V1) if f.endswith(".jsonl") and f != "rows-v1.jsonl")
if ONLY: books = [b for b in books if b in ONLY]
T = collections.Counter(); per = {}; eg = collections.defaultdict(list)
for book in books:
    rec = json.loads(gzip.open(os.path.join(R, "data", "resting-lines", f"{book}.json.gz")).read())
    z = json.loads(gzip.open(os.path.join(R, "data", "zones", f"{book}.bin")).read())
    led = {}
    for l in open(os.path.join(V1, f"{book}.jsonl"), encoding="utf-8"):
        d = json.loads(l); led[d["p"]] = d
    B = collections.Counter(); fill = {a: collections.Counter() for a in SRC}
    for si, (label, units) in enumerate(rec["sections"]):
        words = z["sections"][si].get("words", []); num = {}; n = 0
        for i, w in enumerate(words):
            if not w.get("mark"): n += 1; num[i] = n
        under = {}
        for first, count, text, credit in units:
            for i in range(first, first + count): under[i] = (first, count, text, credit)
        for i, w in enumerate(words):
            if i not in num: continue
            p = f"{label}:{num[i]}"; d = led.get(p)
            if d is None: B["zone word with no ledger place"] += 1; continue
            B["places"] += 1
            s1, ns = step_pick1(d, book)
            have = {"step": bool(s1), "macula": bool(mac(d)), "ubs": bool(ubs(d)), "bdb": bool(bdb(d))}
            for a in SRC:
                if not have[a]:
                    for c in SRC:
                        if c != a and have[c]: fill[a][c] += 1
            u = under.get(i)
            today = u[2] if u else ""
            kind = "bare" if not u else ("run" if u[1] > 1 else "single")
            B[f"today {kind}"] += 1
            pg = w.get("pg") or []
            zone_place = "/".join(str((x or {}).get("g") or "").strip() for x in pg) if pg and all(str((x or {}).get("g") or "").strip() for x in pg) else ""
            if not s1:
                B["step: no pick with words"] += 1
                B[f"step none · today {kind}{' with words' if today.replace(GAP, '').strip() else ''}"] += 1
                for c in ("macula", "ubs", "bdb"):
                    if have[c]:
                        B[f"step none · {c} has a line"] += 1
                        if fold({"macula": mac, "ubs": ubs, "bdb": bdb}[c](d)) != fold(today): B[f"step none · {c} would differ from today"] += 1
                if len(eg["step none"]) < 8: eg["step none"].append(f"{book} {p} today «{today}» ({u[3] if u else '-'}) mac «{mac(d)}» ubs «{ubs(d)}»")
                continue
            if kind == "run":
                B["step at a run word"] += 1
                continue
            if kind == "bare":
                B["step has a pick, today bare"] += 1
                if len(eg["today bare"]) < 6: eg["today bare"].append(f"{book} {p} step «{s1}»")
                continue
            sj = span_join(s1)
            exact = sj == today
            folded = fold(s1) == fold(today)
            B["single: exact"] += int(exact)
            B["single: equal folded only"] += int(folded and not exact)
            B["single: differ"] += int(not folded)
            B[f"single by today's credit {u[3] if u[3] in ('PIECE:TAHOT',) else 'other'}: {'same' if folded else 'differ'}"] += 1
            if zone_place:
                B["zone place: step folded equal"] += int(fold(s1) == fold(zone_place))
                B["zone place: step differs"] += int(fold(s1) != fold(zone_place))
            else:
                B["zone place: none (a piece unglossed or no pieces)"] += 1
            if not folded:
                k = "differ, today credited TAHOT" if u[3] == "PIECE:TAHOT" else "differ, today another source"
                if len(eg[k]) < 10: eg[k].append(f"{book} {p} step «{s1}» today «{today}» ({u[3]}) zone-place «{zone_place}»")
    # runs: does STEP have a pick at every word of a run line
    runs = 0; runs_all = 0
    for si, (label, units) in enumerate(rec["sections"]):
        words = z["sections"][si].get("words", []); num = {}; n = 0
        for i, w in enumerate(words):
            if not w.get("mark"): n += 1; num[i] = n
        for first, count, text, credit in units:
            ws = [num[i] for i in range(first, first + count) if i in num]
            if len(ws) < 2: continue
            runs += 1
            runs_all += int(all(step_pick1(led[f"{label}:{x}"], book)[0] for x in ws))
    B["run lines"] += runs; B["run lines where step has every word"] += runs_all
    best = {}
    for a in SRC:
        order = sorted(((fill[a][c], -SRC.index(c), c) for c in SRC if c != a), reverse=True)
        top = order[0]; tie = [c for (v, _, c) in order if v == top[0]]
        best[a] = {"second": top[2], "fills": top[0], "tied": tie if len(tie) > 1 else [], "all": {c: fill[a][c] for c in SRC if c != a}}
    per[book] = {"counts": dict(B), "best_second": best}
    T.update(B)
json.dump({"total": dict(sorted(T.items())), "per_book": per, "examples": eg}, open(OUT, "w"), indent=1, ensure_ascii=False)
P = T["places"]
for k, v in sorted(T.items()): print(f"{v:9,d}  {100*v/P:7.3f}%  {k}")
for k, v in eg.items():
    print("--", k)
    for x in v: print("   ", x)
