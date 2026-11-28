# Scratch, run once after refit-place-html.py: the foot's credits, the press that opens the sheet, and the
# page's opening use the block (CARD) in place of the page's old copies.
import sys
p = sys.argv[1]
L = open(p, encoding="utf-8").read().split("\n")
def at(pred, start=0):
    for i in range(start, len(L)):
        if pred(L[i]): return i
    raise SystemExit("anchor not found")
# the foot: our text's own credit line, then each source's paragraph as the card's block writes it
a = at(lambda l: l.startswith("function drawCredits"))
z = at(lambda l: l == "}", a)
body = L[a:z + 1]
keep_from = next(i for i, l in enumerate(body) if l.startswith("  // our text, as the reader credits it"))
keep_to = next(i for i, l in enumerate(body) if l.startswith("    line.lastChild.remove(); f.append(line); }"))
new = [
 "function drawCredits() {",
 '  const f = $("credits");',
 '  const link = (href, text) => { const a = el("a", "", text || href.replace(/^https?:\\/\\//, "")); a.href = href; a.rel = "noopener"; return a; };',
 '  const p = (...kids) => el("p", "", ...kids);',
 '  f.replaceChildren(el("h2", "", "Whose words these are"));',
] + body[keep_from:keep_to + 1] + [
 "  // each source, as it asks to be credited: the card's own paragraphs (the block above), so the foot and the card say the same",
 "  f.append(...CARD.credits());",
 "  f.hidden = false;",
 "}",
]
L[a:z + 1] = new
# the press: the sheet's head is the page's, its body the block's
a = at(lambda l: l.startswith("function openCard"))
z = at(lambda l: l == "}", a)
L[a:z + 1] = [
 "function openCard(wb) {",
 "  if (state.open && state.open.wb === wb) { closeCard(); return; }",
 "  const t0 = performance.now();",
 '  if (state.open) state.open.wb.classList.remove("active");',
 "  const v = DOC.verses.find((x) => x.l === wb.dataset.v), e = v.e[Number(wb.dataset.e)];",
 '  const token = { wb, verse: v.l, entry: Number(wb.dataset.e) }; state.open = token; wb.classList.add("active");',
 '  $("cWord").textContent = e.s; $("cAt").replaceChildren(el("b", "", `${DOC.title} ${v.l}`), `word ${wb.dataset.n}${e.k ? ` · ${CARD.kindWords(e.k)}` : ""}`);',
 "  // the sheet's body: what each source says at this word, then each dictionary's own entry (the block above)",
 '  CARD.draw($("cBody"), DOC, v, e, () => state.open === token);',
 '  $("card").hidden = false; document.body.classList.add("card-open");',
 "  // the word is brought into the band of the window the card leaves free; the card itself does not move",
 '  const r = wb.getBoundingClientRect(), free = window.innerHeight - $("card").getBoundingClientRect().height;',
 "  if (r.top < 6 || r.bottom > free - 6) window.scrollBy(0, r.top + r.height / 2 - free / 2);",
 "  state.times.push({ verse: v.l, entry: token.entry, ms: performance.now() - t0 });",
 "}",
]
a = at(lambda l: l.startswith("    INDEX = await getFile("))
L[a] = "    INDEX = await CARD.index();"
a = at(lambda l: l.startswith("    DOC = await getFile("))
L[a] = "    DOC = await CARD.chapter(BOOK, CH);"
open(p, "w", encoding="utf-8").write("\n".join(L))
print("ok", len(L))
