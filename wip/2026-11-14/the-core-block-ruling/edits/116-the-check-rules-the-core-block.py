# tools/check-ruled-equals-first-paint-v1.mjs: E4, a reading pressed on the block a card opened on (core-block-rule-v1),
# no division pressed, stands on the line after the page lays the section again. Its split words pressed a division
# first, so the path every one-pill card takes since 14 November 2026 was never asked, and the reading pressed there
# went back to the baked line at the first repaint (zone.html, blockRuled). Refused unless each text stands once.
# python3 -I 116-the-check-rules-the-core-block.py <check-ruled-equals-first-paint-v1.mjs>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:90]!r}, found {n}")
    s = s.replace(old, new)
one("""//   E3  the page never scrolls sideways
""", """//   E3  the page never scrolls sideways
//   E4  a split word whose card opens on its core block (core-block-rule-v1),
//       ruled on that block with no division pressed, reads the reading pressed
//       on its line, and still reads it after the page lays the section again:
//       the reading was remembered under the block with no division, and the
//       first repaint printed the baked line back over it (found 14 November
//       2026: «in + understanding + his» back to «in + heart + his»)
""")
one("""    const out = []; let single = 0, split = 0, open = 0;
""", """    const out = []; let single = 0, split = 0, open = 0, core = 0;
""")
one("""        if (isSplit && split < 3) { split += 1; out.push({ label, i, kind: "split" }); }
""", """        if (isSplit && split < 3) { split += 1; out.push({ label, i, kind: "split" }); }
        else if (isSplit && core < 4) { core += 1; out.push({ label, i, kind: "core" }); }
""")
one("""    if (ok && t.kind !== "open") ok = await pressed("#hud .b-read .r-pills button", "const now = (document.querySelector('#hud .r-now .v') || {}).textContent || ''; const s = xs.filter((x) => !x.textContent.includes('+') && x.textContent.trim() !== now.trim()).sort((a, c) => c.textContent.length - a.textContent.length); return s[0];");
""", """    // a core word is ruled where its card opened, on a block, no division pressed; a card that did not open on a
    // block is not one (its one pill is the set's), and is let go
    if (t.kind === "core") ok = await p.evaluate(() => !!document.querySelector('#hud .b-cell .s-pills button[aria-pressed="true"]'));
    if (ok && t.kind === "core") {
      t.took = await p.evaluate(() => { const xs = [...document.querySelectorAll("#hud .b-read .r-pills button")]; const x = xs.find((y) => y.getAttribute("aria-pressed") !== "true" && !y.textContent.includes("+")); if (x) x.click(); return x ? x.textContent.trim() : null; });
      await p.waitForTimeout(900);
      ok = !!t.took;
    } else if (ok && t.kind !== "open") ok = await pressed("#hud .b-read .r-pills button", "const now = (document.querySelector('#hud .r-now .v') || {}).textContent || ''; const s = xs.filter((x) => !x.textContent.includes('+') && x.textContent.trim() !== now.trim()).sort((a, c) => c.textContent.length - a.textContent.length); return s[0];");
""")
one("""  check(`E3  ${reader}: the page never scrolls sideways`, docW1 === docW0 && docW0 === 412, `${docW0}px → ${docW1}px`);
""", """  check(`E3  ${reader}: the page never scrolls sideways`, docW1 === docW0 && docW0 === 412, `${docW0}px → ${docW1}px`);
  // E4: each core word's line read the reading pressed, and reads it after the section is laid again
  const cores = ruled.map((t, k) => ({ t, a: after[k], f: fresh[k] })).filter((x) => x.t.kind === "core");
  const lost = cores.filter((x) => !x.a || !x.f || !x.a.text.includes(x.t.took) || x.f.text !== x.a.text)
    .map((x) => `${x.t.label}#${x.t.i}: pressed «${x.t.took}», the line read «${x.a ? x.a.text : "?"}», laid again «${x.f ? x.f.text : "?"}»`);
  check(`E4  ${reader}: a reading pressed on the block a card opened on, no division pressed, stands on the line when the section is laid again`, relayed && cores.length >= 1 && !lost.length,
    !cores.length ? "no split word's card opened on a block in the first sections" : lost.length ? `${lost.length} of ${cores.length} · ${lost.slice(0, 3).join(" | ")}` : `${cores.length} words: ${cores.map((x) => `${x.t.label}#${x.t.i} «${x.a.text}»`).join(" · ")}`);
""")
open(p, "w", encoding="utf-8").write(s); print("check-ruled-equals-first-paint-v1: E4, the core block's ruling")
