# tools/check-word-senses-v1.mjs: W3 asks the page which pills it drew as word senses and in what ink. A word sense
# shown says so on its pill (data-sense) and wears the page's purple (--argaman), as the owner asked on 14 November
# 2026; no other pill says so or wears it. Refused unless each text stands once.
# python3 -I 112-the-check-sees-the-purple.py <check-word-senses-v1.mjs>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:90]!r}, found {n}")
    s = s.replace(old, new)
one("""//       with a press; the press shows them, each a pill of its own that begins «word sense, not definition: » and
//       stands on Jastrow's records alone, and every other pill stays where it stood; pressed again, the card is
//       as it was
""", """//       with a press; the press shows them, each a pill of its own that begins «word sense, not definition: »,
//       stands on Jastrow's records alone, says on itself that it is a word sense and wears the page's purple
//       (the owner, 14 November 2026: «maybe instead of in blue it should be in purple»), while no other pill
//       says so or wears it, and every other pill stays where it stood; pressed again, the card is as it was
""")
one("""  const pills = [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")].map((x) => ({ t: x.textContent.trim(), by: x.dataset.by || "" }));
  const b = document.querySelector("#hud .withheld-line .senses-switch");
  return { open: !!hud && !hud.hidden, pills, btn: b ? { t: b.textContent.trim(), pressed: b.getAttribute("aria-pressed") } : null, senses: window.__senses };
""", """  const pills = [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")].map((x) => ({ t: x.textContent.trim(), by: x.dataset.by || "", sense: x.dataset.sense === "1", ink: getComputedStyle(x).color }));
  const b = document.querySelector("#hud .withheld-line .senses-switch");
  // the page's purple, as the card computes it
  let purple = "";
  if (hud) { const probe = document.createElement("i"); probe.style.color = "var(--argaman)"; hud.append(probe); purple = getComputedStyle(probe).color; probe.remove(); }
  return { open: !!hud && !hud.hidden, pills, purple, btn: b ? { t: b.textContent.trim(), pressed: b.getAttribute("aria-pressed") } : null, senses: window.__senses };
""")
one("""        const printed = rest.pills.filter((x) => x.t.startsWith(WORD_SENSE_PRINTS));
        if (printed.length) w3.printedAtRest.push(`${id} ${at.label}:${at.n}: «${printed[0].t}»`);
""", """        const printed = rest.pills.filter((x) => x.t.startsWith(WORD_SENSE_PRINTS) || x.sense || x.ink === rest.purple);
        if (printed.length) w3.printedAtRest.push(`${id} ${at.label}:${at.n}: «${printed[0].t}»${printed[0].sense ? " (marked a word sense)" : ""}${printed[0].ink === rest.purple ? " (purple)" : ""}`);
""")
one("""        if (notOwn.length) w3.faults.push(`${where}: «${notOwn[0].t}» stands on ${notOwn[0].by || "no record"}, not on Jastrow's alone`);
""", """        if (notOwn.length) w3.faults.push(`${where}: «${notOwn[0].t}» stands on ${notOwn[0].by || "no record"}, not on Jastrow's alone`);
        const notPurple = shown.filter((x) => !x.sense || x.ink !== on.purple);
        if (!on.purple || notPurple.length) w3.faults.push(`${where}: «${notPurple.length ? notPurple[0].t : ""}» ${notPurple.length && !notPurple[0].sense ? "does not say it is a word sense" : `wears ${notPurple.length ? notPurple[0].ink : "?"}, not the page's purple ${on.purple || "(none computed)"}`}`);
        const posing = on.pills.filter((x) => !x.t.startsWith(WORD_SENSE_PRINTS) && (x.sense || x.ink === on.purple));
        if (posing.length) w3.faults.push(`${where}: «${posing[0].t}» is no word sense and ${posing[0].sense ? "says it is one" : "wears the purple"}`);
""")
one("""check("W3  off, no pill prints a word sense; the card says how many it holds back, and its press shows them as word senses on Jastrow's records alone, every other pill in its place, and holds them back again",
""", """check("W3  off, no pill prints a word sense; the card says how many it holds back, and its press shows them as word senses on Jastrow's records alone, each in the page's purple, every other pill in its place and its own ink, and holds them back again",
""")
open(p, "w", encoding="utf-8").write(s); print("check-word-senses-v1: W3 sees which pills are word senses and their ink")
