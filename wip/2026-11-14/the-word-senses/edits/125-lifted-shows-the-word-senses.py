# tools/card-readings-v1.mjs, tools/resting-lines-v1.mjs, tools/check-chain-book-v2.mjs: the chain books' lifted state
# shows the word senses. It says "every switch that withholds a reading lifted", and the word senses switch withholds
# readings and rests off, so the lifted recording quietly dropped every word sense a reader brings up with one press
# (the review of 14 November 2026). Both recordings say where the switch stood, and the chain's check holds the
# lifted one to it. Refused unless each text stands once.
# python3 -I 125-lifted-shows-the-word-senses.py <reader dir>
import os, sys
R = sys.argv[1]
def edit(rel, pairs):
    p = os.path.join(R, rel); s = open(p, encoding="utf-8").read()
    for old, new in pairs:
        n = s.count(old)
        if n != 1: sys.exit(f"{rel}: expected one of {old[:90]!r}, found {n}")
        s = s.replace(old, new)
    open(p, "w", encoding="utf-8").write(s); print(f"{rel}: {len(pairs)} edits")
STATE_OLD = """names: window.__nonames || null, sources_off: [...(window.__sourcesOff || [])].sort() }"""
STATE_NEW = """names: window.__nonames || null, senses: window.__senses || null, sources_off: [...(window.__sourcesOff || [])].sort() }"""
edit("tools/card-readings-v1.mjs", [
    ("""    says: "lifted: every switch that withholds a reading lifted — the pointing kept whatever a source points, a source's own signs printed, every source on",
    keep: { "fh.masorah": "keep", "fh.signs": "printed", "fh.sources.off": "[]" },
    holds: { pointing: "keep", signs: "printed", sources_off: [] },""",
     """    says: "lifted: every switch that withholds a reading lifted — the pointing kept whatever a source points, a source's own signs printed, every source on, the word senses shown",
    keep: { "fh.masorah": "keep", "fh.signs": "printed", "fh.sources.off": "[]", "fh.senses": "on" },
    holds: { pointing: "keep", signs: "printed", sources_off: [], senses: "on" },"""),
    (STATE_OLD, STATE_NEW),
    ("""      if (s.pointing !== state.holds.pointing || s.signs !== state.holds.signs || off) throw new Error(`the page did not take the lifted switches: it reports the pointing ${s.pointing}, signs ${s.signs}, sources off ${JSON.stringify(s.sources_off)}`);""",
     """      if (s.pointing !== state.holds.pointing || s.signs !== state.holds.signs || s.senses !== state.holds.senses || off) throw new Error(`the page did not take the lifted switches: it reports the pointing ${s.pointing}, signs ${s.signs}, word senses ${s.senses}, sources off ${JSON.stringify(s.sources_off)}`);"""),
])
edit("tools/resting-lines-v1.mjs", [(STATE_OLD, STATE_NEW)])
edit("tools/check-chain-book-v2.mjs", [
    ("""    if (!lifted || lifted.pointing !== want.pointing || lifted.signs !== want.signs || JSON.stringify(lifted.sources_off) !== JSON.stringify(want.sources_off)) stateOff""",
     """    if (!lifted || lifted.pointing !== want.pointing || lifted.signs !== want.signs || lifted.senses !== want.senses || JSON.stringify(lifted.sources_off) !== JSON.stringify(want.sources_off)) stateOff"""),
])
