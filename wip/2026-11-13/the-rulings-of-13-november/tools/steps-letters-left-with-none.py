# From the measure steps-letters-measured.mjs wrote (--json): the kinds of place where the letter withholds every row
# a source has of the place's own number, source by source, the first by places; and the split of all kinds by the
# letters on the two sides (a capital up to F on both, or a later letter on either).
# python3 -I steps-letters-left-with-none.py <the measure's json> [how many to list]
import collections, json, re, sys
d = json.load(open(sys.argv[1], encoding="utf-8"))
top = int(sys.argv[2]) if len(sys.argv) > 2 else 25
kinds = d["kinds"]
for m in sorted({m for k in kinds for m in k["by"]}):
    all_gone = [k for k in kinds if k["by"].get(m) and k["by"][m]["ofNumber"] and k["by"][m]["gone"] == k["by"][m]["ofNumber"]]
    print(f"{m}: {len(all_gone):,} kinds of place, {sum(k['places'] for k in all_gone):,} places, where the letter withholds every row it has of the place's number. The first {min(top, len(all_gone))}:")
    for k in sorted(all_gone, key=lambda k: -k["places"])[:top]:
        lost = [l for l in k["lost"] if l["m"] == m]
        print(f"  {k['places']:6,d} places · {k['key']} at {k['tags']} · its {k['by'][m]['ofNumber']} row(s) are of {' '.join(k['by'][m]['letters'])}" + (f" · off the card: " + ", ".join(f"«{l['pill'][:36]}»" for l in lost[:5]) if lost else " · no pill leaves the card"))
# the letters on the two sides: the place's, and the withheld rows'
letter = lambda tag: (re.search(r"([A-Za-z])$", tag) or [None, ""])[1]
split = collections.Counter(); places = collections.Counter()
for k in kinds:
    here = {letter(t) for t in k["tags"].split()}
    theirs = {letter(t) for m in k["by"] for t in k["by"][m]["letters"]}
    early = lambda xs: all(x and "A" <= x <= "F" for x in xs)
    name = "a capital up to F on both sides" if early(here) and early(theirs) else "a capital up to F at the place, a later letter on the row" if early(here) else "a later letter at the place, a capital up to F on the row" if early(theirs) else "a later letter on both sides"
    split[name] += 1; places[name] += k["places"]
print("\nthe letters on the two sides, by kinds of place and by places:")
for name, n in split.most_common(): print(f"  {n:6,d} kinds · {places[name]:7,d} places · {name}")
