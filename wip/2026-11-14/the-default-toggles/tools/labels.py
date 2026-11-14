# The resting pill's label per book, from the resting-lines record: the share of the book's words (counts.words,
# every word, bare ones included) whose line is credited PIECE:TAHOT, and each other default's coverage (words where
# its first pick gives a line, from defaults_lines.py's per-book output). Measures only.
# python3 -I labels.py <reader dir> <defaults-lines.json>
import gzip, json, os, sys, math
R, DL = sys.argv[1], sys.argv[2]
per = json.load(open(DL))["per_book"]
order = json.load(open(os.path.join(R, "data", "book-order-v1.json")))
files = order.get("files") or order.get("books") or []
names = [f if isinstance(f, str) else (f.get("id") or f.get("slug") or f.get("file")) for f in files]
names = [n.replace(".json", "").replace(".bin", "") for n in names if n]
tot = {"w": 0, "t": 0}
def pct(a, b): return 100.0 * a / b if b else 0
print(f"{'book':16s} {'words':>7s} {'TAHOT%':>7s} label                 {'STEP%':>6s} {'MAC%':>6s} {'UBS%':>6s} {'BDB%':>6s}")
for b in names:
    p = os.path.join(R, "data", "resting-lines", f"{b}.json.gz")
    if not os.path.exists(p) or b not in per: continue
    rec = json.loads(gzip.open(p).read())
    z = json.loads(gzip.open(os.path.join(R, "data", "zones", f"{b}.bin")).read())
    t = 0
    for si, (label, units) in enumerate(rec["sections"]):
        words = z["sections"][si].get("words", [])
        for first, count, text, credit in units:
            if credit == "PIECE:TAHOT": t += sum(1 for i in range(first, first + count) if i < len(words) and not words[i].get("mark"))
    W = rec["counts"]["words"]; tot["w"] += W; tot["t"] += t
    a = math.floor(pct(t, W)); rest = 100 - a
    lab = f"{a}% TAHOT, {rest}% other" if t < W else "100% TAHOT"
    pb = per[b]; ww = W
    print(f"{b:16s} {W:7d} {pct(t,W):7.2f} {lab:21s} {pct(pb.get('step: has a line',0),ww):6.1f} {pct(pb.get('macula: has a line',0),ww):6.1f} {pct(pb.get('ubs: has a line',0),ww):6.1f} {pct(pb.get('bdb: has a line',0),ww):6.1f}")
print(f"{'39 books':16s} {tot['w']:7d} {pct(tot['t'],tot['w']):7.2f}")
