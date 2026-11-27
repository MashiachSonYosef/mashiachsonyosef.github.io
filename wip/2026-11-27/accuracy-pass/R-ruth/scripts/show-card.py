# Print cards from the walk in a compact, readable form. Read only.
# Usage: python3 -I show-card.py <out dir> <verse:word_no | every:N[:offset] | all> [max pills]
import sys, os, json, glob
OUT, what = sys.argv[1], sys.argv[2]
maxp = int(sys.argv[3]) if len(sys.argv) > 3 else 40
SHORT = {"M4": "TAHOT", "PIECE:TAHOT": "TAHOT-pc", "M3": "MACULA", "PIECE:MACULA": "MACULA-pc", "M9": "StrOS", "M14": "StrWS", "M18": "UBS", "M17": "SDBH", "M46": "BDBu", "M5": "BDB-OS", "M2": "TBESH", "M1": "M1", "BSB": "BSB"}
rows = []
for f in sorted(glob.glob(os.path.join(OUT, "cards-ch*.jsonl"))):
    for ln in open(f):
        rows.append(json.loads(ln))
def want(i, r):
    if what == "all": return True
    if what.startswith("every:"):
        p = what.split(":"); n = int(p[1]); off = int(p[2]) if len(p) > 2 else 0
        return i % n == off
    return f"{r['verse']}:{r['word_no_in_verse']}" in what.split(",")
# word number within the verse
cnt = {}
for r in rows:
    cnt[r["verse"]] = cnt.get(r["verse"], 0) + 1
    r["word_no_in_verse"] = cnt[r["verse"]]
for i, r in enumerate(rows):
    if not want(i, r): continue
    line = (r.get("credit") or "")
    print(f"\n### {r['verse']} w{r['word_no_in_verse']} {r['s']}  line: «{line}»  head {r.get('head')}  [{r.get('tg')}]")
    for k, v in r.get("now") or []:
        print(f"   top: {k} → {v}")
    for b in r.get("bands") or []:
        print(f"   band {b['label']}: " + "  ".join(f"{'【' if p[1] else ''}{p[0]}{'】' if p[1] else ''}" for p in b["pills"]))
    print(f"   {r.get('label')}   ({r.get('kindsTitle')})")
    for cls, t in r.get("notes") or []:
        print(f"   note[{cls}]: {t}")
    pills = r.get("pills") or []
    out = []
    for p in pills[:maxp]:
        by = "+".join(SHORT.get(x, x) for x in p["by"].split())
        yr = p["ti"].split(" · ")[0] if p["ti"] else ""
        mark = "【" + p["t"] + "】" if p["on"] else p["t"]
        out.append(f"{mark} ‹{by} {yr} {p['gr']}{' ptr' if p['ptr'] else ''}›")
    pos = [i + 1 for i, p in enumerate(pills) if p["on"]]
    print(f"   pills ({len(pills)}; pressed at {pos}): " + " | ".join(out) + (f" … (+{len(pills) - maxp} more)" if len(pills) > maxp else ""))
    for d in r.get("dcard") or []:
        print(f"   record: {d['text']} — {d['att']} — {d['also']}")
    if r.get("parts"): print("   parts:", r["parts"][:300])
    if r.get("hoh"): print("   hoh:", r["hoh"][:300])
    if r.get("prov"): print("   prov:", r["prov"])
