# check-line-reads-the-place-v1, after core-block-rule-v1 (the owner, 14 November 2026). P3: a card that opens on
# the core block of the source's set says the set, its line, on top, and is pressed on the line's own piece for
# that block; every other card opens pressed on its line, its line the first pill, as before. P4: a word whose
# reading here no row prints still holds it as TAHOT's own row; where the card opens on a block of the set's
# division, the check stands it on the set whole again (its division pressed) before it reads.
# Each edit is refused unless its text stands exactly once.
# python3 -I 103-the-place-check-knows-the-core-block.py <check file>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:80]!r}, found {n}")
    s = s.replace(old, new)
one("""//   P3  each card opens pressed on its line, and the line's reading is its
//       first pill
//   P4  a word whose reading here no row of the store prints still opens on
//       it, as TAHOT's own row (the page stands it up from the piece gloss)
""", """//   P3  each card opens pressed on its line, and the line's reading is its
//       first pill; a card whose line reads the source's set opens on the
//       set's core block (core-block-rule-v1, the owner, 14 November 2026),
//       the set, its line, said on top, pressed on the line's piece there
//   P4  a word whose reading here no row of the store prints still opens on
//       it, as TAHOT's own row (the page stands it up from the piece gloss);
//       a card that opens on a block of the set's division is read on the set
//       whole, its division pressed again
""")
one("""    const line = await w.evaluate((e) => { const g = e.querySelector(":scope > .g"); const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove()); return c.textContent.trim(); });
""", """    const { line, pieces } = await w.evaluate((e) => { const g = e.querySelector(":scope > .g"); const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove()); return { line: c.textContent.trim(), pieces: [...e.querySelectorAll(":scope > .g > .g-pcs > .g-pc")].map((x) => x.textContent.trim()) }; });
""")
one("""      return { pressed: drawn(document.querySelector('#hud .r-pills button[aria-pressed="true"]')?.textContent.trim()), first: drawn(document.querySelector("#hud .r-pills button")?.textContent.trim()) };
    });
    n += 1;
    if (r.pressed === line && r.first === line) same += 1; else if (diff.length < 3) diff.push(`line "${line}" · pressed "${r.pressed}" · first "${r.first}"`);
""", """      const blocks = [...document.querySelectorAll("#hud .b-cell .s-pills button")];
      const top = document.querySelector("#hud .r-piece:not(.r-sug) b")?.textContent.trim();
      return { pressed: drawn(document.querySelector('#hud .r-pills button[aria-pressed="true"]')?.textContent.trim()), first: drawn(document.querySelector("#hud .r-pills button")?.textContent.trim()),
        blockAt: blocks.length > 1 ? blocks.findIndex((x) => x.getAttribute("aria-pressed") === "true") : -1, top: top ? drawn(top) : null };
    });
    n += 1;
    if (r.blockAt >= 0) {
      // on the core block of the set: the set on top is the line, the pill pressed is the line's piece there
      onCore += 1;
      const piece = (pieces.length > r.blockAt ? pieces[r.blockAt] : line.split(" + ")[r.blockAt] || "").trim();
      if (r.top === line && String(r.pressed || "").toLowerCase() === piece.toLowerCase()) same += 1;
      else if (diff.length < 3) diff.push(`line "${line}" · on its core block, the set on top "${r.top}" · pressed "${r.pressed}", owed the line's piece "${piece}"`);
    } else if (r.pressed === line && r.first === line) same += 1; else if (diff.length < 3) diff.push(`line "${line}" · pressed "${r.pressed}" · first "${r.first}"`);
""")
one("""  let n = 0, same = 0; const diff = [];
""", """  let n = 0, same = 0, onCore = 0; const diff = [];
""")
one("""  check("P3  each card opens pressed on its line, and the line's reading is its first pill", n > 0 && same === n, `${same} of ${n}${diff.length ? ` · ${diff.join(" | ")}` : ""}`);
""", """  check("P3  each card opens pressed on its line, and the line's reading is its first pill", n > 0 && same === n, `${same} of ${n}, ${onCore} of them on the core block of their set${diff.length ? ` · ${diff.join(" | ")}` : ""}`);
""")
one("""      while (Date.now() - t0 < 12000 && !document.querySelector("#hud .r-pills button")) await new Promise((x) => setTimeout(x, 50));
      await new Promise((x) => setTimeout(x, 300));
      return { first: (window.__pool || [])[0],""", """      while (Date.now() - t0 < 12000 && !document.querySelector("#hud .r-pills button")) await new Promise((x) => setTimeout(x, 50));
      await new Promise((x) => setTimeout(x, 300));
      // a card on a block of the set's division is stood on the set whole again (core-block-rule-v1)
      { const blk = document.querySelector('#hud .b-cell .s-pills button[aria-pressed="true"]'); const cut = document.querySelector('#hud .b-cut .s-pills button[aria-pressed="true"]');
        if (blk && cut && document.querySelectorAll("#hud .b-cell .s-pills button").length > 1) { cut.click(); await new Promise((x) => setTimeout(x, 900)); } }
      return { first: (window.__pool || [])[0],""")
open(p, "w", encoding="utf-8").write(s)
print("check-line-reads-the-place-v1.mjs: 6 edits")
