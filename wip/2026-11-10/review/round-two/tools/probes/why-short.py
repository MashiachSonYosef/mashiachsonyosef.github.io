"""One why-line.mjs log, cut to what decides the line and the card's first pill.
usage: python3 -I why-short.py <log> [pills to show, default 6]
Prints the word, the lattice record's grades and leaders, the table's reading, the first pills and the pressed one.
"""
import json
import re
import sys

text = open(sys.argv[1], encoding="utf8").read()
show = int(sys.argv[2]) if len(sys.argv) > 2 else 6
print(text.split("\n", 1)[0][:260])
m = re.search(r'"lattice": (\{.*?\n \}),\n "masorah"', text, re.S)
lat = json.loads(m.group(1)) if m else {}
g = lat.get("g") or ""
print(f"  grades: {len(g)} cards · m {g.count('m')} · n {g.count('n')} · x {g.count('x')} | cites its first verse: {lat.get('n')} | own verses: {len(lat.get('v') or {})}")
for k, v in (lat.get("o") or {}).items():
    print(f"  o.{k}: {json.dumps(v, ensure_ascii=False)[:190]}")
h = re.search(r'"gloss": (".*?"),', text)
print("  table:", h.group(1) if h else None)
pills = [line for line in text.split("\n") if re.match(r"^\s+\d+ [ *] \"", line)]
print(f"  pills: {len(pills)}")
for line in pills[:show]:
    print("   ", line.strip()[:230])
for line in pills[show:]:
    if re.match(r"^\s+\d+ \* ", line):
        print("    …", line.strip()[:230])
