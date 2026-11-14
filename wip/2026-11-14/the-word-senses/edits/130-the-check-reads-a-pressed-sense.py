# tools/check-word-senses-v1.mjs: W3 presses each word sense its press shows and reads the record card: the record is
# lit as every pressed pill's is, no note says the reading was cut out of it where only the page's prefix differs, and
# where Jastrow serves a bracketed entry printing the sense's words under the card's key, the card prints a bracketed
# record (the review's critic, 14 November 2026: «who will?» printed bare, «[who will?,] Oh that!» behind it).
# Refused unless each text stands once.
# python3 -I 130-the-check-reads-a-pressed-sense.py <check-word-senses-v1.mjs>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:90]!r}, found {n}")
    s = s.replace(old, new)
one("""//       Nor does a blue pill on Jastrow's records alone print a word sense's words while it is held back (its""",
    """//       Each word sense shown, pressed, lights its record on the record card, says nothing was cut out of it, and
//       prints Jastrow's bracketed entry where one prints its words (the review's critic, 14 November 2026).
//       Nor does a blue pill on Jastrow's records alone print a word sense's words while it is held back (its""")
one("""// IN THE PAGE. The line under a word, by its verse""", """// the Jastrow overlay's served rows under a key, as the shard holds them
const jShards = new Map();
const jastrowRowsOf = (k) => {
  const sh = createHash("sha256").update(Buffer.from(k, "utf8")).digest("hex").slice(0, 2);
  if (!jShards.has(sh)) { const f = join(K3, "data", "overlays", "jastrow", "shards", `${sh}.bin`); jShards.set(sh, existsSync(f) ? JSON.parse(gunzipSync(readFileSync(f)).toString("utf8")) : {}); }
  return jShards.get(sh)[k] || [];
};
// IN THE PAGE. Each word sense the card shows, pressed in turn: what its record card prints
const pressSenses = (p) => p.evaluate(async () => {
  const out = [];
  for (const x of [...document.querySelectorAll("#hud > .rows .b-read .r-pills button.sense")]) {
    x.click(); await new Promise((r) => setTimeout(r, 200));
    const d = document.querySelector("#hud .d-card");
    out.push({ pill: x.textContent.trim(), key: d ? d.dataset.key || "" : "", text: d ? ((d.querySelector(".d-text") || {}).textContent || "").trim() : "", lit: !!(d && d.querySelector(".d-text .d-sense.on")), cut: !!(d && d.querySelector(".d-cut")) });
  }
  return out;
});
// IN THE PAGE. The line under a word, by its verse""")
one("""        const twinAtRest = rest.pills""", """        // each word sense shown, pressed: its record card
        for (const r of await pressSenses(p)) {
          const words = r.pill.slice(WORD_SENSE_PRINTS.length);
          const bracketedServed = jastrowRowsOf(r.key).some((x) => OWN.has(x[3]) && x[1] === words && /\\[/u.test(String(x[2] || "")));
          if (!r.lit) w3.faults.push(`${where}: pressed «${r.pill}», its record «${r.text.slice(0, 50)}» is not lit`);
          if (r.cut) w3.faults.push(`${where}: pressed «${r.pill}», the card says the reading was cut out of «${r.text.slice(0, 50)}»`);
          if (bracketedServed && !r.text.includes("[")) w3.faults.push(`${where}: pressed «${r.pill}», the card prints «${r.text.slice(0, 50)}» bare though Jastrow serves the bracketed entry`);
        }
        const twinAtRest = rest.pills""")
open(p, "w", encoding="utf-8").write(s); print("check-word-senses-v1: W3 reads a pressed word sense's record")
# (then, by hand on the same tree: the reading the card had pressed is pressed again after the word senses are read,
# so no word sense stays chosen when W3 turns the switch off, which would lay the sections again and shut the card)
