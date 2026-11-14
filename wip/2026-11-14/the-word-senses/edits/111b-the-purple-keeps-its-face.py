# zone.html, word-senses-rule-v1: the purple pill keeps the purple's face. The page's face rule (THE READINGS WEAR A
# STEADIER FACE, 2026-10-02) sets in the reading face every rule that paints text blue, "and only those"; "the
# purple, the Hebrew and the frame keep their faces". So a word sense's pill is the page's Georgia at its plain
# weight, and pressed, bold, as every pressed pill. Refused unless each text stands once.
# python3 -I 111b-the-purple-keeps-its-face.py <zone.html>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:90]!r}, found {n}")
    s = s.replace(old, new)
one("""     are the same?". The regular purple, as the regular blue on a reading;
     pressed, the same purple worn bold. */
  #hud .r-pills button.sense, #hud .r-pills button.sense[aria-pressed="true"] { color: var(--argaman); }
""", """     are the same?". The regular purple, as the regular blue on a reading;
     pressed, the same purple worn bold. It keeps the purple's face, the
     page's Georgia, since the reading face is the blue's alone (THE READINGS
     WEAR A STEADIER FACE, below). */
  #hud .r-pills button.sense { color: var(--argaman); font-family: Georgia, "Times New Roman", serif; font-weight: 400; }
  #hud .r-pills button.sense[aria-pressed="true"] { color: var(--argaman); font-weight: 700; }
""")
open(p, "w", encoding="utf-8").write(s); print("zone.html: the purple pill keeps the page's face")
