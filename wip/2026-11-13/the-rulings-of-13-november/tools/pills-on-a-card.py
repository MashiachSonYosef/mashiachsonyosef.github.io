# Whether named readings stand on a card that entry-gate-card.mjs printed (with --pills large enough to print every
# pill). Each wanted reading is matched whole, letter case aside. It reads; it changes nothing.
# python3 -I pills-on-a-card.py <the card's printout> <reading> [<reading> ...]
import re, sys
text = open(sys.argv[1], encoding="utf-8").read()
pills = re.findall(r'"([^"]*)" \((M\d+[^)]*)\)', text)
said = re.search(r"(\d+) pills:", text)
print(f"{len(pills)} pills read" + (f" of the {said.group(1)} the card holds" if said else ""))
for want in sys.argv[2:]:
    hits = [p for p in pills if p[0].lower() == want.lower()]
    print(f"  «{want}»: " + ("on the card, credited to " + ", ".join(sorted({h[1] for h in hits})) if hits else "not on the card"))
