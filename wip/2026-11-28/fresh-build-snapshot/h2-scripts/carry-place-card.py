# Scratch: carry the place card's block from tools/place-card-v1.mjs into a page, between the line that opens
# "const placeCardOf = (host) => {" and the line "// end of the place card (tools/place-card-v1.mjs)", at the
# page's own indent. python3 carry-place-card.py <reader dir> <page> <indent>
import sys, re
reader, page, indent = sys.argv[1], sys.argv[2], sys.argv[3]
HEAD = "const placeCardOf = (host) => {"
END = "// end of the place card (tools/place-card-v1.mjs)"
mod = open(f"{reader}/tools/place-card-v1.mjs", encoding="utf-8").read().split("\n")
a = next(i for i, l in enumerate(mod) if l.strip() in (HEAD, "export " + HEAD))
z = next(i for i, l in enumerate(mod) if l.strip() == END)
block = [mod[a].replace("export ", "", 1)] + mod[a + 1:z + 1]
block = [(indent + l) if l.strip() else l for l in block]
p = f"{reader}/{page}"
src = open(p, encoding="utf-8").read().split("\n")
pa = [i for i, l in enumerate(src) if l.strip() == HEAD]
pz = [i for i, l in enumerate(src) if l.strip() == END]
if len(pa) != 1 or len(pz) != 1 or pz[0] < pa[0]:
    sys.exit(f"{page}: the block's two lines are not there once each ({pa}, {pz})")
src[pa[0]:pz[0] + 1] = block
open(p, "w", encoding="utf-8").write("\n".join(src))
print(f"{page}: {len(block)} lines carried at lines {pa[0] + 1} to {pa[0] + len(block)}")
