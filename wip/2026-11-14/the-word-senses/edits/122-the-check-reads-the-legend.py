# tools/check-word-senses-v1.mjs: W6, the owner's legend stands in purple under a record exactly where the record of
# word senses says it holds, and nowhere else on the cards pressed. Refused unless each text stands once.
# python3 -I 122-the-check-reads-the-legend.py <check-word-senses-v1.mjs>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:90]!r}, found {n}")
    s = s.replace(old, new)
one("""//       November 2026, at Obadiah 1:3: the card held the word sense back and the line went on printing it)
""", """//       November 2026, at Obadiah 1:3: the card held the word sense back and the line went on printing it)
//   W6  the owner's legend, «brackets mean sense, not definition», stands in the page's purple under a record on the
//       record card exactly where the record of word senses says it holds (its legend: one bracket, its words a
//       word sense on the corpus lane's list), and under no other record pressed: on cards found from the legend's
//       rows, smallest works first, every pill pressed in turn with the switch at rest (the owner, 14 November
//       2026: «should it say that in purple somewhere if we are stripping the brackets»)
""")
one("""const w5 = { judged: false, ok: false, said: "" };
""", """const w5 = { judged: false, ok: false, said: "" };
const w6 = { cards: 0, pressed: 0, shown: [], quiet: 0, faults: [] };
""")
one("""check("W2  on a first visit the switch rests off", w2.said === "off" && w2.kept === null,""", """// ---- W6: the legend, on its own cards ----------------------------------------------------------------------------
const LEG = record.legend && record.legend.rows ? record.legend.rows : {};
const legendPlaces = (id, most) => {
  const z = JSON.parse(gunzipSync(readFileSync(join(K3, "data", "zones", `${id}.bin`))).toString("utf8"));
  const out = [];
  for (const sec of z.sections || []) {
    if (!VERSE.test(String(sec.label || ""))) continue;
    const words = (sec.words || []).filter((w) => !w.mark);
    words.forEach((w, i) => { if (out.length < most && w.k && LEG[w.k]) out.push({ label: String(sec.label), n: i + 1 }); });
    if (out.length >= most) break;
  }
  return out;
};
{
  const tree6 = await serveTree(K3);
  const b6 = await (await loadPlaywright()).chromium.launch(launchOptions());
  try {
    for (const { id } of works) {
      if (w6.shown.length >= 3 || w6.cards >= 24) break;
      const places = legendPlaces(id, 12);
      if (!places.length) continue;
      const ctx = await b6.newContext({ viewport: { width: 412, height: 915 } });
      try {
        const p = await ctx.newPage();
        await p.addInitScript(() => { try { if (!sessionStorage.getItem("ws-check6")) { localStorage.clear(); sessionStorage.setItem("ws-check6", "1"); } } catch { /* a first visit */ } });
        await p.goto(`${tree6.base}/zone.html?b=${id}`, { waitUntil: "networkidle", timeout: 120000 });
        await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
        for (const at of places) {
          if (w6.shown.length >= 3 || w6.cards >= 24) break;
          const rest = await openAt(p, at);
          if (!rest || !rest.open || !rest.pills.length) continue;
          w6.cards += 1;
          for (let i = 0; i < Math.min(rest.pills.length, 40); i += 1) {
            const seen = await p.evaluate(async (i) => {
              const xs = [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")];
              if (!xs[i]) return null;
              xs[i].click();
              await new Promise((r) => setTimeout(r, 120));
              const d = document.querySelector("#hud .d-card");
              const lg = d && d.querySelector(".sense-legend");
              let purple = "";
              const probe = document.createElement("i"); probe.style.color = "var(--argaman)"; document.getElementById("hud").append(probe); purple = getComputedStyle(probe).color; probe.remove();
              return { pill: xs[i].textContent.trim(), key: d ? d.dataset.key || "" : "", rows: d ? (d.dataset.rows || "").split(" ").filter(Boolean) : [], legend: lg ? lg.textContent.trim() : null, ink: lg ? getComputedStyle(lg).color : "", purple, text: ((d && d.querySelector(".d-text")) || {}).textContent || "" };
            }, i);
            if (!seen) continue;
            w6.pressed += 1;
            const want = (LEG[seen.key] || []).some(([rk, m]) => seen.rows.includes(`${rk}|${m}`));
            const where = `${id} ${at.label}:${at.n} «${seen.pill}»`;
            if (want && seen.legend === null) w6.faults.push(`${where}: its record is one the legend holds on, and the card shows no legend`);
            else if (!want && seen.legend !== null) w6.faults.push(`${where}: the card shows the legend under a record it does not hold on (${seen.key} ${seen.rows.join(" ")})`);
            else if (want && (seen.legend !== record.legend.text || seen.ink !== seen.purple)) w6.faults.push(`${where}: the legend reads «${seen.legend}» in ${seen.ink}, not «${record.legend.text}» in the page's purple ${seen.purple}`);
            else if (want) { if (w6.shown.length < 3) w6.shown.push(`${where}: «${seen.text.slice(0, 60)}» · ${seen.legend}`); }
            else w6.quiet += 1;
          }
        }
      } finally { await ctx.close(); }
    }
  } finally { await b6.close(); await tree6.close(); }
}

check("W2  on a first visit the switch rests off", w2.said === "off" && w2.kept === null,""")
one("""check("W5  a word sense pressed is held back from the line when the switch goes off, and a reading pressed beside it stays", w5.judged && w5.ok, w5.said || "no card held a word sense back, so none was pressed");
""", """check("W5  a word sense pressed is held back from the line when the switch goes off, and a reading pressed beside it stays", w5.judged && w5.ok, w5.said || "no card held a word sense back, so none was pressed");
check("W6  the owner's legend stands in purple under a record exactly where the record of word senses says it holds, and under no other record pressed",
  w6.shown.length >= 1 && w6.quiet >= 1 && !w6.faults.length,
  w6.faults.length ? `${w6.faults.length} · ${first(w6.faults)}`
    : !w6.shown.length ? `${w6.pressed} pills pressed on ${w6.cards} cards and no record the legend holds on was printed`
    : `${w6.pressed} pills pressed on ${w6.cards} cards: the legend under ${w6.shown.length} record(s) it holds on, none under the other ${w6.quiet} · ${w6.shown.join(" · ")}`);
""")
open(p, "w", encoding="utf-8").write(s); print("check-word-senses-v1: W6, the legend")
# (and then: W6 reads the printed row, data-row; it presses the pills a Jastrow record stands behind, up to 30 a card,
# and one other; up to 80 cards, 30 places a work)
# (and then: W6 opens its cards with the pointing lifted, fh.masorah "keep", the ruling's one-time forgetting marked
# done, so Jastrow's records reach the cards where the verse points the word otherwise than Jastrow's headword)
# (and then: W6's places are the words whose key holds a legend row that can print first on a card, one with no
# lower-ranked row of the same reading and source ahead of it: 4,021 of the overlay's 4,814 bracketed rows stand
# behind such a bare row, which the card prints instead)
