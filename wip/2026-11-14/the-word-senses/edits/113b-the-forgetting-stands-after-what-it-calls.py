# zone.html, word-senses-rule-v1: forgetSensePicks and the switch's reopenForSenses stand after the relay they call
# (relayBuiltSections), so nothing they name is used before it is declared. Nothing they do changes.
# Refused unless each text stands once.
# python3 -I 113b-the-forgetting-stands-after-what-it-calls.py <zone.html>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:90]!r}, found {n}")
    s = s.replace(old, new)
block_start = "  // A WORD SENSE PRESSED IS HELD BACK WITH THE REST (word-senses-rule-v1). A\n"
block_end = "    relayBuiltSections();\n    repaintGlossOrder();\n    return gone;\n  };\n"
i = s.index(block_start); j = s.index(block_end, i) + len(block_end)
if s.count(block_start) != 1: sys.exit("the block stands more than once")
block = s[i:j]
s = s[:i] + s[j:]
hook_old = """  // off, a word sense the reader pressed is forgotten first (forgetSensePicks);
  // where one was, the sections are laid again and the card stands closed,
  // as under every switch that lays them again
  reopenForSenses = () => {
    if (sensesPref !== "on") forgetSensePicks();
    if (document.getElementById("railRows")) railSwitch();
    reopenCard();
  };
"""
one(hook_old, "")
one("""  HUD_LANES.relaySections = relayBuiltSections;
""", "  HUD_LANES.relaySections = relayBuiltSections;\n" + block + """  // THE WORD SENSES SWITCH, ANSWERED (chooseSenses): the rail drawn again and
  // the open card built again under it. Off, a word sense the reader pressed
  // is forgotten first; where one was, the sections are laid again and the
  // card stands closed, as under every switch that lays them again.
  reopenForSenses = () => {
    if (sensesPref !== "on") forgetSensePicks();
    if (document.getElementById("railRows")) railSwitch();
    reopenCard();
  };
""")
open(p, "w", encoding="utf-8").write(s); print("zone.html: the forgetting and the switch's answer stand after the relay")
# (and, by hand on the same tree, the declaration's comment: "the switch answered on the page (set after the
# sections' relay, below)" where it said "the card open now, asked again (set where the card is drawn)")
