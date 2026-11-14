# tools/check-word-senses-v1.mjs: W3 asks that the count the card says is the number of word senses its press shows.
# At Obadiah 1:3, word 11, the card said «4 word senses, not definitions, held back — show» and the press brought 2
# pills: four of Jastrow's rows, two printing each sense (one reading, one pill). Refused unless each text stands once.
# python3 -I 117-the-check-counts-the-pills.py <check-word-senses-v1.mjs>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:90]!r}, found {n}")
    s = s.replace(old, new)
one("""//       no pill prints a word sense; a card whose word senses the other gates leave says how many it holds back,
//       with a press; the press shows them, each a pill of its own that begins «word sense, not definition: »,
""", """//       no pill prints a word sense; a card whose word senses the other gates leave says how many it holds back,
//       with a press; the press shows exactly that many, each a pill of its own that begins «word sense, not
//       definition: »,
""")
one("""        if (!shown.length) w3.faults.push(`${where}: the press said ${n} held back and showed no word sense`);
""", """        if (shown.length !== n) w3.faults.push(`${where}: the press said ${n} held back and showed ${shown.length} word sense${shown.length === 1 ? "" : "s"}`);
""")
open(p, "w", encoding="utf-8").write(s); print("check-word-senses-v1: W3 counts the pills the press brings")
