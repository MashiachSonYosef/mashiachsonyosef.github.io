# Scratch, run once: reader/place.html takes the card's drawing code from the one block both pages carry.
# What leaves the page: the rules of the card's body in its style, its own copies of the small tools the card
# uses, and the functions that draw the card's body. What stays: the chapter, the list of books, the foot, the
# sheet, and the press that opens it.
import sys
p = sys.argv[1]
L = open(p, encoding="utf-8").read().split("\n")
def at(pred, start=0):
    for i in range(start, len(L)):
        if pred(L[i]): return i
    raise SystemExit("anchor not found")
# 1. the style: the card body's rules go (the block carries them)
a = at(lambda l: l.startswith("  #card h3 {"))
z = at(lambda l: l.startswith("  .c-credit {"))
L[a:z + 1] = ["  /* the look of what stands inside the sheet is the card's own, carried with the code that draws it (the block below, placeCardOf) */"]
# 2. the small tools: only what the chapter and the foot use stay here
a = at(lambda l: l.startswith("// ---------------------------------------------------------------- small tools"))
z = at(lambda l: l.startswith("// ---------------------------------------------------------------- the chapter"))
L[a:z] = [
 "// ---------------------------------------------------------------- small tools",
 'const DATA = "data/place-answers-v1/page/";',
 "const $ = (id) => document.getElementById(id);",
 "/** An element with a class and text or children. */",
 'function el(tag, cls, ...kids) { const n = document.createElement(tag); if (cls) n.className = cls; for (const k of kids) if (k !== null && k !== undefined && k !== "") n.append(k); return n; }',
 "",
 "// ---------------------------------------------------------------- the card's body",
 "// ONE RULE, ONE PLACE: the lines from the one that opens placeCardOf to the one that closes it are the",
 "// module's (tools/place-card-v1.mjs) but for \"export\", as the live reader (zone.html) carries them too, and",
 "// tools/check-place-card-one-place-v1.mjs holds the three copies line for line; nothing between them reaches",
 "// outside them. This page hands the block where its files are and takes its faults.",
 "const placeCardOf = (host) => {",
 "// end of the place card (tools/place-card-v1.mjs)",
 "",
]
# 3. the functions that drew the card's body go
a = at(lambda l: l.startswith("// ---------------------------------------------------------------- the card"), at(lambda l: l.startswith("function drawCredits")))
z = at(lambda l: l.startswith("function closeCard"))
L[a:z] = ["// ---------------------------------------------------------------- the sheet", "const CARD = placeCardOf({ data: DATA, fault: (words) => state.errors.push(words) });", "{ const st = document.createElement(\"style\"); st.textContent = CARD.style(\"#cBody\"); document.head.append(st); }", ""]
open(p, "w", encoding="utf-8").write("\n".join(L))
print("refit", len(L), "lines")
