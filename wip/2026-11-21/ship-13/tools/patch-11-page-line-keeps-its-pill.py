# Ship 13: zone.html. The reading the line reads keeps its pill under the signs switch when a lattice order moved the
# line after the card opened. Until now only the reading the card opened on was kept, so pressing «cites here» (or
# «masoretic», «vowels differ») with a card open could move the line to a reading that carries a source's own sign
# while the card, with the signs at rest, did not offer that reading at all. And the row now says how many readings
# the signs switch has off, so a check can count the pool whole.
import sys
p = sys.argv[1] + "/zone.html"
t = open(p, encoding="utf-8").read()
def swap(a, b, what):
    global t
    if t.count(a) != 1: sys.exit("patch-11: " + what + " is not where it was")
    t = t.replace(a, b)
swap("""        // the reading standing on the line keeps its pill whatever it carries:
        // the line reads it, so the card must offer it to press
        const unsigned = signsPref === "off" ? every.filter((r) => r === selected || !hasSourceSign(r.text)) : every;
""", """        // the reading standing on the line keeps its pill whatever it carries:
        // the line reads it, so the card must offer it to press. That is the
        // reading the card opened on, and, where a lattice order pressed
        // since moved the line (lineUnder reads the order's baked leader for
        // the word), that leader too: until 21 November 2026 only the first
        // was kept, so "cites here" pressed over an open card moved the line
        // of the first word of Amos to STEP's "[the] words of" while the card
        // offered no such pill
        const lineNow = (() => {
          const at = DEF_POS.find((q) => q.id === defOrder);
          if (!at || at.needs !== "lattice") return null;
          const W = askedWord(surface);
          const gr = latticeStore && latticeStore.grades && W.pointed ? latticeStore.grades[W.pointed] : null;
          const first = latticeLeader(gr, at.lattice, W.verse);
          return first ? readingKey(first[0]) : null;
        })();
        const unsigned = signsPref === "off" ? every.filter((r) => r === selected || (lineNow !== null && readingKey(r.text) === lineNow) || !hasSourceSign(r.text)) : every;
""", "the signs filter")
swap("""        pills.dataset.withheld = String(pool.withheld || 0);
""", """        pills.dataset.withheld = String(pool.withheld || 0);
        // and how many readings the signs switch has off (the line the card
        // prints above the pills says the same number in words)
        pills.dataset.signsOff = String(every.length - sorted.length);
""", "the row's withheld count")
open(p, "w", encoding="utf-8").write(t)
print("patch-11 ok")
