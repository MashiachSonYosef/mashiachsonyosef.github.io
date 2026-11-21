# Ship 13: PIPELINE.md says the lattice delta and the read words' amendment; the read-words check's first law names its files as they are.
import sys
root = sys.argv[1]
p = root + "/PIPELINE.md"
t = open(p, encoding="utf-8").read()
def sub(a, b, n=1):
    global t
    if t.count(a) != n: sys.exit("patch-10: expected %d of: %s (found %d)" % (n, a[:100], t.count(a)))
    t = t.replace(a, b)
sub("""> place's line from the pieces, as at every place that carries them. A place
> the pin holds whole until the lane answers (Psalms 10:10, whose piece
> spells another word than its read word) carries neither, as before. The
> lattice projection clears the tags it finds, so the round lays them again
> after it, each time; the write is typed on each zone it changes and
> expires with the lane's next lattice, which carries them itself. At 206""",
    """> place's line from the pieces, as at every place that carries them. Since
> 21 November the list is the lane's amended one (relay v192.1): every line
> names its place's own word number, which the word found is held to; the
> piece at Psalms 10:10 carries the edition's letters, so that place is held
> no longer and carries its two tags and its pieces; and one more list names
> the tag a lattice piece lost (Genesis 14:17, where TAHOT writes its mark
> inside the word). The projection reads that tag as the piece's own, and
> the same tool lays TAHOT's words for the place on the zone's piece. The
> lattice projection clears the tags it finds, so the round lays them again
> after it, each time; the write is typed on each zone it changes and
> expires with the lane's next lattice, which carries them itself. Since the
> same day the lattice is read with the corpus lane's delta over it
> (`data/lattice-delta/`, relay v208, read through
> `tools/lattice-delta-v1.mjs`; its lists stay on the lane's store, as the
> lattice does, and are named on the round's command line with
> `--lattice-delta`): a listed entry's cards that name its verse are the
> delta's list, which reads MACULA's readings and every TAHOT row where the
> lattice read part of TAHOT's alone, and each card the delta grades
> otherwise carries the page's grade. A tree that pins the delta is never
> projected without it. At 206""")
open(p, "w", encoding="utf-8").write(t)
p = root + "/tools/check-read-words-v1.mjs"
t = open(p, encoding="utf-8").read()
sub("""  check("R1  the pin's five files are the bytes it names, the lane's receipt names them the same and read the strokes against the paseq pin's list, the list is well formed and recounts to the lane's own counts, and the pin holds a place's pieces or the place whole, nothing else",""",
    """  check("R1  the pin's files are the bytes it names, the lane's receipts name them the same (the amendment's having read the list it amends) and read the strokes against the paseq pin's list, every line names its word place, the list is well formed and recounts to the lane's own counts, and the pin holds a place's pieces or the place whole, nothing else",""")
open(p, "w", encoding="utf-8").write(t)
print("patch-10 ok")
