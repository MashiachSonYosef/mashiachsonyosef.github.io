# Default picks, the data lane's measures for the bake plan (v49). Measures only; writes only into its own folder.
# For every one of the 39 books: (1) ledger places against zone words, by verse label and word number, and the
# WORD_N index (one-based over every entry, marks included) each place lands on; (2) each source's LINE pick (the
# pick that prints under the word) and the second source that fills the most of what a first source leaves; (3) the
# size of the per-book file in the proposed shape, gzip -9, in three variants; (4) STEP's pick 1 against today's
# resting line where the line is credited PIECE:TAHOT over one word.
# python3 -I measure_defaults.py <reader dir> <default-picks dir> <out dir>
import gzip, json, os, re, sys, collections
R, L, OUT = sys.argv[1:4]
V1, V11 = os.path.join(L, "default-picks-v1"), os.path.join(L, "default-picks-v1.1")
mend = {}
for line in open(os.path.join(V11, "step-mend-v1.1.jsonl"), encoding="utf-8"):
    d = json.loads(line); mend[(d["book"], d["p"])] = d["step"]
SIGN = re.compile(r"^(<[^>]*>|\[[^\]]*\]|¿|~|X|×|\+|-|—)$")
SRC = ["step", "macula", "ubs", "bdb"]

def spanJoin(t):  # zone.html 3425, byte for byte in intent
    s = " + ".join(x.strip() for x in str(t).split("/") if x.strip())
    return s[:-1] if s.endswith(".") else s

def marker(meaning):  # "point17:11." -> "11"; "the entry" -> ""
    m = re.match(r"^point\d+:(.+?)\.?$", str(meaning))
    return m.group(1) if m else ""

def line_picks(d, book):
    """Each source's line text at a place (None = no line pick), by the plan's rules."""
    st = mend.get((book, d["p"]), d.get("step") or [])
    step = st[0][4] if st and st[0][4] else None                       # pick 1 (always kind r where STEP has a pick)
    m = d.get("macula"); mac = m[0] if m and m[0] else None             # MACULA's words, pieces joined by a space
    pcs = [pc for pc in (d.get("ubs") or []) if pc[2]]
    firsts = [str(pc[2][0][2]) for pc in pcs]
    words = [t for t in firsts if not SIGN.match(t.strip())]
    ubs = " + ".join(words) if words else None                          # pick 1 of each piece; a sign-only piece prints nothing
    b = d.get("bdb") or []
    bdb = b[0][5] if b and b[0][5] else None                            # pick 1's record highlights (slot 5), whole
    return {"step": step, "macula": mac, "ubs": ubs, "bdb": bdb}, st

def any_picks(d, book):
    """coverage.py's looser reading (any pick at all, signs and BDB openings included), for comparison only."""
    st = mend.get((book, d["p"]), d.get("step") or [])
    m = d.get("macula")
    return {"step": any(x[4] for x in st), "macula": bool(m and m[0]),
            "ubs": any(pc[2] for pc in (d.get("ubs") or [])), "bdb": any((x[5] or x[3]) for x in (d.get("bdb") or []))}

def compact(d, st, variant):
    """The per-place entry of the proposed per-book file (see the plan, section 3)."""
    step = []
    for x in st:
        e = ["rva".index(x[1]), x[4] if x[4] else 0]
        if x[1] == "v" and len(x) > 6 and x[6]: e.append(x[6][0])     # the variant's letter, never its Hebrew
        step.append(e)
    m = d.get("macula"); mac = m[0] if m and m[0] else 0
    ubs = [[str(pk[2]) for pk in pc[2]] for pc in (d.get("ubs") or []) if pc[2]]
    bdb = [[marker(x[2]), x[1] if x[5] else 0] for x in (d.get("bdb") or [])]
    if not (step or mac or ubs or bdb): return None
    return [step, mac, ubs, bdb]

os.makedirs(OUT, exist_ok=True)
books = sorted(f[:-6] for f in os.listdir(V1) if f.endswith(".jsonl") and f != "rows-v1.jsonl")
T = collections.Counter(); per = {}; sizes = []; mapping = []; bdb_rec_diff = collections.Counter()
for book in books:
    led = [json.loads(l) for l in open(os.path.join(V1, f"{book}.jsonl"), encoding="utf-8")]
    byp = {d["p"]: d for d in led}
    z = json.loads(gzip.open(os.path.join(R, "data", "zones", f"{book}.bin")).read())
    rest = json.loads(gzip.open(os.path.join(R, "data", "resting-lines", f"{book}.json.gz")).read())
    # (1) places -> WORD_N
    n_all = 0; zp = {}; marks = 0; kq = 0
    for sec in z["sections"]:
        k = 0
        for w in sec.get("words", []):
            n_all += 1
            if w.get("mark"): marks += 1; continue
            k += 1; zp[f"{sec['label']}:{k}"] = n_all
            if w.get("kq"): kq += 1
    led_order_ok = [d["p"] for d in led] == sorted(zp, key=lambda p: zp[p])
    ss = os.path.join(R, "data", "source-suggested", f"{book}.json")
    ss_len = len(json.load(open(ss))["places"]) if os.path.exists(ss) else None
    mapping.append((book, len(zp), len(byp), len(set(zp) - set(byp)), len(set(byp) - set(zp)), n_all, marks, ss_len, led_order_ok, kq))
    # (2) line picks and fills
    B = collections.Counter(); B["places"] = len(led)
    places = [None] * n_all; places_short = [None] * n_all
    rec_hl = {}
    for d in led:
        lp, st = line_picks(d, book); ap = any_picks(d, book)
        has = {s: lp[s] is not None for s in SRC}
        for s in SRC:
            B[f"line {s}"] += has[s]; B[f"any {s}"] += ap[s]
        for a in SRC:
            for b in SRC:
                if a != b and not has[a] and has[b]: B[f"fill {a}>{b}"] += 1
            for b in SRC:
                for c in SRC:
                    if len({a, b, c}) == 3 and not has[a] and not has[b] and has[c]: B[f"fill3 {a}>{b}>{c}"] += 1
        if not any(has.values()): B["no source has a line pick"] += 1
        if d.get("ubs") and any(pc[2] for pc in d["ubs"]) and lp["ubs"] is None: B["ubs sign only"] += 1
        if d.get("bdb") and lp["bdb"] is None: B["bdb pick 1 has no highlight"] += 1
        for x in d.get("bdb") or []:
            if x[1] in rec_hl and rec_hl[x[1]] != x[5]: bdb_rec_diff[book] += 1
            rec_hl.setdefault(x[1], x[5])
        # MACULA, UBS and BDB texts that spanJoin would change (the "/" trap)
        for s in ("macula", "ubs", "bdb"):
            t = lp[s]
            if t and "/" in t: B[f"{s} line text holds a slash"] += 1
        # (3) the compact entry
        n = zp[d["p"]]
        places[n - 1] = compact(d, st, {})
    # STEP pick 1 against today's line where the line is one word credited PIECE:TAHOT
    for si, (label, units) in enumerate(rest["sections"]):
        words = z["sections"][si].get("words", []); num = {}; k = 0
        for i, w in enumerate(words):
            if not w.get("mark"): k += 1; num[i] = k
        for first, count, text, credit in units:
            ws = [num[i] for i in range(first, first + count) if i in num]
            if credit != "PIECE:TAHOT" or len(ws) != 1: continue
            d = byp.get(f"{label}:{ws[0]}")
            lp, st = line_picks(d, book)
            if lp["step"] is None: B["tahot unit, no step pick"] += 1; continue
            B["tahot units"] += 1
            B["tahot unit = spanJoin(step pick 1)"] += int(spanJoin(lp["step"]) == text)
    # BDB highlights once per record (table) against per pick
    recs = {}
    for d in led:
        for x in d.get("bdb") or []:
            if x[5]: recs.setdefault(x[1], x[5])
    body = {"schema_version": "DEFAULT_PICKS_BOOK_V1", "book": book, "bdb": recs, "places": places}
    raw = json.dumps(body, ensure_ascii=False, separators=(",", ":")).encode()
    gz = gzip.compress(raw, 9)
    # a variant with the BDB words inline per pick (no record table)
    places_inline = [None if p is None else [p[0], p[1], p[2], [[mk, recs.get(r) if r else 0] for mk, r in p[3]]] for p in places]
    raw2 = json.dumps({"book": book, "places": places_inline}, ensure_ascii=False, separators=(",", ":")).encode()
    gz2 = gzip.compress(raw2, 9)
    sizes.append((book, len(raw), len(gz), len(raw2), len(gz2), len(recs)))
    per[book] = dict(B); T.update(B)
    print(book, "done", flush=True)

json.dump({"total": dict(T), "per_book": per, "bdb_records_whose_highlights_differ_between_picks": dict(bdb_rec_diff)},
          open(os.path.join(OUT, "measures.json"), "w"), indent=1)
with open(os.path.join(OUT, "places-map.tsv"), "w") as o:
    o.write("book\tzone_words\tledger_places\tzone_not_ledger\tledger_not_zone\tentries_incl_marks\tmarks\tsource_suggested_len\tledger_order_is_word_n_order\tkq_words\n")
    for r in mapping: o.write("\t".join(str(x) for x in r) + "\n")
with open(os.path.join(OUT, "sizes.tsv"), "w") as o:
    o.write("book\traw_bdb_table\tgz_bdb_table\traw_bdb_inline\tgz_bdb_inline\tbdb_records\n")
    for r in sizes: o.write("\t".join(str(x) for x in r) + "\n")
    o.write(f"39 books\t{sum(r[1] for r in sizes)}\t{sum(r[2] for r in sizes)}\t{sum(r[3] for r in sizes)}\t{sum(r[4] for r in sizes)}\t\n")
print("ok")
