# zone.html, word-senses-rule-v1: a word sense's pill is purple, not blue. Blue is a reading; a word sense is the
# source's own note on the word's sense, which is a comment, and a comment is the page's purple. The owner,
# 14 November 2026: «maybe instead of in blue it should be in purple, purple is usually our comments but it could be
# arguable that the licenses comments are the same?». The pill says so on itself (data-sense="1"), so a check can
# ask the page which pills it drew as word senses. Refused unless each text stands once.
# python3 -I 111-a-word-sense-pill-is-purple.py <zone.html>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:90]!r}, found {n}")
    s = s.replace(old, new)
one("""        // who carries it, on the pill and exposed, so a check can ask the
        // page whether a switched-off source still stands behind a reading
        btn.dataset.by = [...new Set(route.records.map((r) => r[3]))].sort().join(" ");
""", """        // who carries it, on the pill and exposed, so a check can ask the
        // page whether a switched-off source still stands behind a reading
        btn.dataset.by = [...new Set(route.records.map((r) => r[3]))].sort().join(" ");
        // a word sense is the source's note on the word, not a reading, so its
        // pill wears the page's purple and says so (word-senses-rule-v1)
        if (route.records.every((row) => SENSE_ROWS.has(row))) { btn.classList.add("sense"); btn.dataset.sense = "1"; }
""")
one("""  #hud .r-pills button[aria-pressed="true"] { color: var(--tekhelet-ink); font-weight: 700; border-color: var(--gold); background: var(--press-wash); box-shadow: 0 0 0 1px var(--gold); }
""", """  #hud .r-pills button[aria-pressed="true"] { color: var(--tekhelet-ink); font-weight: 700; border-color: var(--gold); background: var(--press-wash); box-shadow: 0 0 0 1px var(--gold); }
  /* A WORD SENSE IS PURPLE (word-senses-rule-v1). Blue is a reading, a source's
     word for the word; a word sense is the source's own note on the word's
     sense, which is a comment, and our comments are purple. The owner,
     2026-11-14: "maybe instead of in blue it should be in purple, purple is
     usually our comments but it could be arguable that the licenses comments
     are the same?". The regular purple, as the regular blue on a reading;
     pressed, the same purple worn bold. */
  #hud .r-pills button.sense, #hud .r-pills button.sense[aria-pressed="true"] { color: var(--argaman); }
""")
open(p, "w", encoding="utf-8").write(s); print("zone.html: a word sense's pill is purple")
