# Ship 13: check-lattice-orders-v1. The same-pool law counts the pool whole: the pills and the readings the signs
# switch has off. With the signs at rest a lattice order's leader that carries a source's own sign now keeps its
# pill (the line reads it), so the pills alone can be one more under such an order while the pool is the same pool.
import sys
p = sys.argv[1] + "/tools/check-lattice-orders-v1.mjs"
t = open(p, encoding="utf-8").read()
def swap(a, b, what):
    global t
    if t.count(a) != 1: sys.exit("patch-12: " + what + " is not where it was")
    t = t.replace(a, b)
swap("""// Leningrad codex spells otherwise. Every position is a re-order of the same
// pool: the count of readings never changes.
""", """// Leningrad codex spells otherwise. Every position is a re-order of the same
// pool: the count of readings never changes.
//
// THE POOL IS COUNTED WHOLE (21 November 2026). With the signs switch at rest
// the card offers no pill for a reading that carries a source's own sign,
// except the reading the line reads: the one the card opened on and, since
// this day, the leader a lattice order pressed over the open card moved the
// line to. Until then the line of the first word of Amos read STEP's
// "[the] words of" under "cites here" while the card's first pill said
// "Dibri", and this check, which had skipped the law wherever the lattice
// named no card for the verse, went red the day the corpus lane's later
// names landed. So the pills under such an order can be one more than at
// rest, and the count that never changes is the pills and the readings the
// signs switch has off together (the row says the second:
// dataset.signsOff).
""", "the header")
swap("""const pillsNow = () => p.evaluate(() => {
  const h = document.querySelector("#hud"); if (!h || h.hidden) return null;
  return [...h.querySelectorAll(".r-pills button")].map((x) => x.textContent.trim());
});
""", """const pillsNow = () => p.evaluate(() => {
  const h = document.querySelector("#hud"); if (!h || h.hidden) return null;
  return [...h.querySelectorAll(".r-pills button")].map((x) => x.textContent.trim());
});
// the readings the signs switch has off, as the row says them
const signsOffNow = () => p.evaluate(() => {
  const row = document.querySelector("#hud .r-pills"); if (!row || row.dataset.signsOff === undefined) return null;
  return Number(row.dataset.signsOff);
});
""", "pillsNow")
swap("""const base = await pillsNow();
check("  the card opened with its readings", !!base && base.length > 0, base ? `${base.length} readings, first "${base[0]}"` : "no card");
""", """const base = await pillsNow();
const baseOff = await signsOffNow();
check("  the card opened with its readings", !!base && base.length > 0, base ? `${base.length} readings, first "${base[0]}"` : "no card");
check("  and the row says how many readings the signs switch has off", baseOff !== null && Number.isInteger(baseOff) && baseOff >= 0, `${baseOff}`);
const whole = (base ? base.length : 0) + (baseOff || 0);
""", "the base count")
swap("""    return { loaded: true, pills, surface, graded: !!gr, first: gr && gr.o ? gr.o : null, line, tierChar };
  }, tierChar);
""", """    const row = h.querySelector(".r-pills");
    return { loaded: true, pills, off: row && row.dataset.signsOff !== undefined ? Number(row.dataset.signsOff) : null, surface, graded: !!gr, first: gr && gr.o ? gr.o : null, line, tierChar };
  }, tierChar);
""", "the order's read")
swap("""  check(`    the pool is the same pool, re-ordered`, r.pills && base && r.pills.length === base.length, `${r.pills ? r.pills.length : "?"} vs ${base.length}`);
""", """  check(`    the pool is the same pool, re-ordered`, r.pills && base && r.off !== null && r.pills.length + r.off === whole, `${r.pills ? r.pills.length : "?"} pills and ${r.off} the signs switch has off vs ${base.length} and ${baseOff}`);
  // a pill more than at rest is the line's own reading and nothing else
  check(`    and no pill is new but the one the line reads`, r.pills && base && r.pills.filter((x) => !base.includes(x)).every((x) => r.line && r.line.toLowerCase().startsWith(x.toLowerCase().slice(0, 12))), `${r.pills ? r.pills.filter((x) => !base.includes(x)).map((x) => `"${x}"`).join(" ") || "none new" : "?"}`);
""", "the same-pool law")
open(p, "w", encoding="utf-8").write(t)
print("patch-12 ok")
