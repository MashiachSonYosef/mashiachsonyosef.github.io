# What a reader sees of each card without scrolling (seen-412.jsonl joined to the first walk). Read only.
# Usage: python3 -I analyze-seen.py <out dir>
import sys, os, json, glob, re, collections, statistics
OUT = sys.argv[1]
cards = {}
for f in sorted(glob.glob(os.path.join(OUT, "cards-ch*.jsonl"))):
    for ln in open(f):
        r = json.loads(ln); cards[(r["verse"], r["e"])] = r
seen = [json.loads(l) for l in open(os.path.join(OUT, "seen-412.jsonl"))]
print("cards", len(seen))
tight = sum(1 for s in seen if s["tight"])
print("cards that fold their notes away (tight):", tight, "; cards that show them:", len(seen) - tight)
shown = collections.Counter()
for s in seen:
    for c in set(s["shown"]): shown[c] += 1
print("notes shown, by kind:", dict(shown))
div = lambda s: any((b.get("label") or "").startswith("Complete divisions") for b in cards[(s["verse"], s["e"])].get("bands") or [])
on_out = [s for s in seen if s["on"] and s["onInView"] is False]
print("pressed pill out of view until the reader scrolls the pills:", len(on_out), "(divided:", sum(1 for s in on_out if div(s)), ")")
print("pills in view per card: median", statistics.median([s["inView"] for s in seen]), "; pills in all: median", statistics.median([s["pills"] for s in seen]))
print("cards whose pills need scrolling (more pills than in view):", sum(1 for s in seen if s["pills"] > s["inView"]))
# which of the flagged notes does a reader see
bdb_seen = collections.Counter(); ysw = 0; ubs_dash = 0; bsb_vvv = 0
out = open(os.path.join(OUT, "notes-seen.tsv"), "w")
out.write("place\thebrew\tnote\n")
for s in seen:
    if s["tight"]: continue
    r = cards[(s["verse"], s["e"])]
    for cls, t in r.get("notes") or []:
        show = (cls in s["shown"]) or any(cls == c for c in s["shown"])
        if not show: continue
        if t.startswith("here BDB reads"):
            body = re.sub(r" (CC BY(-SA)? 4\.0|Public Domain)$", "", t[len("here BDB reads"):]).strip()
            bdb_seen["all"] += 1
            head = re.split(r" · ", body)[0]
            bad = False
            if "(no words given)" in body: bdb_seen["no words given"] += 1; bad = True
            if " / " in head: bdb_seen["gloss and sub-heading pieces"] += 1; bad = True
            if re.search(r"· \d+ («|\()", body): bdb_seen["trailing second pick"] += 1; bad = True
            if bad: out.write(f"{s['verse']} w?\t{s['s']}\t{t}\n")
        if "your source switches" in t: ysw += 1
        if t.startswith("here UBS reads · 1"): ubs_dash += 1
        if "vvv" in t: bsb_vvv += 1
out.close()
print("on cards that show their notes: BDB notes", dict(bdb_seen), "; «your source switches»", ysw, "; UBS «· 1 «-»»", ubs_dash, "; BSB «vvv»", bsb_vvv)
worst = sorted(on_out, key=lambda s: -s["on"])[:8]
for s in worst: print("   ", s["verse"], s["s"], "pressed at", s["on"], "of", s["pills"], "; in view", s["inView"])
