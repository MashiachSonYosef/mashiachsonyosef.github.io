# The word number (from 1, marks not counted) of each surface asked in a section of a zone. python3 -I word-at.py <zone.bin> <label> <surface>...
import gzip, json, sys
z = json.loads(gzip.open(sys.argv[1]).read().decode("utf-8"))
sec = next(s for s in z["sections"] if str(s.get("label")) == sys.argv[2])
words = [w for w in sec.get("words") or [] if not w.get("mark")]
for s in sys.argv[3:]:
    print(s, [i + 1 for i, w in enumerate(words) if w.get("s") == s])
