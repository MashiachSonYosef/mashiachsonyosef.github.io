# tools/check-word-senses-v1.mjs: W5, a word sense the reader pressed is held back from the line under the word when
# the switch goes off, and a reading pressed on another word stays (zone.html, forgetSensePicks). Refused unless each
# text stands once.
# python3 -I 114-the-check-holds-the-line-too.py <check-word-senses-v1.mjs>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:90]!r}, found {n}")
    s = s.replace(old, new)
one("""//   W4  the reset pill puts the switch back where it rests
""", """//   W4  the reset pill puts the switch back where it rests
//   W5  a word sense the reader pressed prints on the line under the word, and is held back from it with the rest
//       when the switch goes off: the line reads what it read before the press; a reading the reader pressed on
//       another word of the verse, no word sense, stays where it was (found by the page lane's own probe, 14
//       November 2026, at Obadiah 1:3: the card held the word sense back and the line went on printing it)
""")
one("""const press = (p) => p.evaluate(() => { const b = document.querySelector("#hud .withheld-line .senses-switch"); if (b) b.click(); return !!b; });
""", """const press = (p) => p.evaluate(() => { const b = document.querySelector("#hud .withheld-line .senses-switch"); if (b) b.click(); return !!b; });
// IN THE PAGE. The line under a word, by its verse and its place among the verse's words (marks not counted), as a
// reader sees it, its license chip left off
const lineAt = (p, q) => p.evaluate(([label, n]) => {
  const sec = [...document.querySelectorAll("section.seg")].find((x) => ((x.querySelector(".vnum") || {}).textContent || "").trim() === label);
  const wb = sec ? sec.querySelectorAll(".he-text .wb:not(.mark)")[n - 1] : null;
  const g = wb ? wb.querySelector(":scope > .g") || wb.querySelector(".g") : null;
  if (!g) return null;
  const c = g.cloneNode(true); c.querySelectorAll(".g-lic").forEach((x) => x.remove());
  return c.textContent.trim();
}, [q.label, q.n]);
const openAt = async (p, q, test) => { await p.keyboard.press("Escape"); await p.waitForTimeout(150); await p.evaluate((h) => { location.hash = h; }, `${q.label}:${q.n}`); return settled(p, test); };
""")
one("""const w4 = { judged: false, ok: false, said: "" };
""", """const w4 = { judged: false, ok: false, said: "" };
const w5 = { judged: false, ok: false, said: "" };
""")
one("""          w4.said = `before the reset ${before}, the reset pill ${enabled ? "pressed" : "not pressable"}, after it ${after.said} (kept: ${after.kept})`;
        }
""", """          w4.said = `before the reset ${before}, the reset pill ${enabled ? "pressed" : "not pressable"}, after it ${after.said} (kept: ${after.kept})`;
        }
        // W5, once, after the reset: a word sense pressed, a reading pressed on a word beside it, the switch off
        if (w4.judged && !w5.judged) {
          w5.judged = true;
          const atRest = await lineAt(p, at);
          await openAt(p, at, (s) => s.open && !!s.btn);
          await press(p);
          await settled(p, (s) => s.open && !!s.btn && s.btn.pressed === "true");
          const took = await p.evaluate(() => { const x = document.querySelector("#hud > .rows .b-read .r-pills button.sense"); if (!x) return null; x.click(); return x.textContent.trim(); });
          await p.waitForTimeout(800);
          const ruled = await lineAt(p, at);
          let nb = null, nbRest = null, other = null, nbRuled = null;
          for (const n of [at.n - 1, at.n + 1]) {
            if (n < 1) continue;
            const q = { label: at.label, n };
            const rest0 = await lineAt(p, q);
            if (rest0 === null) continue;
            const s = await openAt(p, q);
            if (!s || !s.open) continue;
            other = await p.evaluate(() => { const x = [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")].find((b) => b.getAttribute("aria-pressed") !== "true" && !b.dataset.sense); if (!x) return null; x.click(); return x.textContent.trim(); });
            if (!other) continue;
            await p.waitForTimeout(800);
            nb = q; nbRest = rest0; nbRuled = await lineAt(p, q);
            break;
          }
          await openAt(p, at, (s) => s.open && !!s.btn && s.btn.pressed === "true");
          await press(p);
          await p.waitForTimeout(1500);
          const after = await lineAt(p, at), nbAfter = nb ? await lineAt(p, nb) : null;
          const said = await p.evaluate(() => window.__senses);
          const faults = [];
          if (!took) faults.push("no word sense's pill to press");
          else if (!ruled || !ruled.startsWith(WORD_SENSE_PRINTS)) faults.push(`pressed «${took}», the line read «${ruled}»`);
          if (said !== "off") faults.push(`the switch stood ${said} after its press`);
          if (after !== atRest) faults.push(`switched off, the line reads «${after}», not «${atRest}» as before the press`);
          if (!nb) faults.push("no word beside it offered another reading to press");
          else if (nbRuled === nbRest) faults.push(`pressed «${other}» at ${nb.label}:${nb.n}, its line stayed «${nbRest}»`);
          else if (nbAfter !== nbRuled) faults.push(`the switch off moved ${nb.label}:${nb.n}'s line from the reading pressed, «${nbRuled}», to «${nbAfter}»`);
          w5.ok = !faults.length;
          w5.said = faults.length ? faults.join(" · ") : `${where}: pressed «${took}», the line read it; switched off, the line reads «${after}» again · ${nb.label}:${nb.n} pressed «${other}», and it stands`;
        }
""")
one("""check("W4  the reset pill puts the switch back where it rests", w4.judged && w4.ok, w4.said || "no card held a word sense back, so the switch was never turned on to be reset");
""", """check("W4  the reset pill puts the switch back where it rests", w4.judged && w4.ok, w4.said || "no card held a word sense back, so the switch was never turned on to be reset");
check("W5  a word sense pressed is held back from the line when the switch goes off, and a reading pressed beside it stays", w5.judged && w5.ok, w5.said || "no card held a word sense back, so none was pressed");
""")
open(p, "w", encoding="utf-8").write(s); print("check-word-senses-v1: W5, the line under a pressed word sense")
