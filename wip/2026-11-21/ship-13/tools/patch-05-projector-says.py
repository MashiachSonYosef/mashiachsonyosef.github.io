# Ship 13: the projector's own words on the zone for a lost tag.
import sys
p = sys.argv[1] + "/tools/project-lattice-v12-v1.mjs"
t = open(p, encoding="utf-8").read()
a = "one or a list (entry-by-lemma-rule-v1), which the gate reads where tg is absent; hg:"
if t.count(a) != 1: sys.exit("patch-05: the zone's words on te are not where they were")
t = t.replace(a, "one or a list (entry-by-lemma-rule-v1), which the gate reads where tg is absent; a tag the read words' pin lists as lost from its lattice piece is read as the piece's own (tg); hg:")
open(p, "w", encoding="utf-8").write(t)
print("patch-05 ok")
