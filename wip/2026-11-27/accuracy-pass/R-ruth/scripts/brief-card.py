# A short form of each card for reading by hand: about four lines a card. Read only.
# Usage: python3 -I brief-card.py <out dir> <every:N:offset | verse:word,verse:word | all> [first pills shown] [chapter]
import sys, os, json, glob, re
OUT, what = sys.argv[1], sys.argv[2]
maxp = int(sys.argv[3]) if len(sys.argv) > 3 else 6
chap = sys.argv[4] if len(sys.argv) > 4 else None
SHORT = {"M4": "TAHOT", "PIECE:TAHOT": "T-pc", "M3": "MAC", "PIECE:MACULA": "M-pc", "M9": "StrOS", "M14": "StrWS", "M18": "UBS", "M17": "SDBH", "M46": "BDBu", "M5": "BDB", "M2": "TBESH", "BSB": "BSB"}
rows = []
for f in sorted(glob.glob(os.path.join(OUT, "cards-ch*.jsonl"))):
    for ln in open(f):
        rows.append(json.loads(ln))
cnt = {}
for r in rows:
    cnt[r["verse"]] = cnt.get(r["verse"], 0) + 1
    r["wv"] = cnt[r["verse"]]
def want(i, r):
    if chap and not r["verse"].startswith(chap + ":"): return False
    if what == "all": return True
    if what.startswith("every:"):
        p = what.split(":"); n = int(p[1]); off = int(p[2]) if len(p) > 2 else 0
        return i % n == off
    return f"{r['verse']}:{r['wv']}" in what.split(",")
def sh(by): return "+".join(SHORT.get(x, x) for x in by.split())
for i, r in enumerate(rows):
    if not want(i, r): continue
    div = ""
    for b in r.get("bands") or []:
        if (b.get("label") or "").startswith("Complete divisions"):
            div = " cut " + "".join(p[0] for p in b["pills"] if p[1])
        if (b.get("label") or "") == "Block" and len(b["pills"]) > 1:
            div += " block " + "".join(p[0] for p in b["pills"] if p[1])
    top = "; ".join(f"{k.replace('reading · ', '')} → {v}" for k, v in r.get("now") or [])
    print(f"\n# {r['verse']} w{r['wv']} {r['s']} «{r.get('credit') or ''}» [{top}]{div}  {r.get('label')}")
    notes = []
    for cls, t in r.get("notes") or []:
        t = re.sub(r" (CC BY(-SA)? 4\.0|Public Domain)$", "", t)
        if cls == "r-piece": continue
        if cls.startswith("r-dflt"): notes.append(t.replace("here ", "").replace(" reads ", ": ", 1))
        elif "r-sug" in cls: notes.append("BSB: " + t.replace("source suggested · the BSB reads the whole word here ", ""))
        elif "signs-off" in cls: notes.append(t.split(" ")[0] + " signed off")
        elif "withheld-line" in cls: notes.append("held: " + re.sub(r" · \d+ from (word lists|dictionaries)[^·]*|· show| · \d+ that [^·]*", "", t)[:150])
        else: notes.append(f"[{cls}] {t}")
    print("   " + " ‖ ".join(notes))
    pills = r.get("pills") or []
    pos = [k + 1 for k, p in enumerate(pills) if p["on"]]
    shown = [f"{'【' + p['t'] + '】' if p['on'] else p['t']}‹{sh(p['by'])}›" for p in pills[:maxp]]
    extra = [f"… 【{pills[k-1]['t']}】‹{sh(pills[k-1]['by'])}› at {k}" for k in pos if k > maxp]
    print(f"   {len(pills)} pills, pressed at {pos}: " + " | ".join(shown + extra))
    for d in r.get("dcard") or []:
        print(f"   record: {(d['text'] or '')[:140]} — {(d['att'] or '')[:90]}")
