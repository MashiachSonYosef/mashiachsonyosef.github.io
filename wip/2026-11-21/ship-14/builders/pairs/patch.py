#!/usr/bin/env python3
"""The pairs mends of 21 November 2026 (findings 1, 9 and 4 of the first reader's report).

usage: python3 patch.py <reader dir>

Edits <reader dir>/zone.html by exact-string replacement. Every old string must stand exactly once in the page.

  finding 1  a one-word pair asks for its ruled half under the pair's own memory keys (kqPickG, kqPick)
             and, its own edit, so does a one-word written branch beside a read branch of several words
  finding 9  a ruled written form's chip is read under the letters, as its line is (ruledMs)
             with a guard: a written branch of several words keeps the line with no chip that it has today
  finding 4  a pair's line and chip follow the source switches (paintPairs, wordBlock, licChipSwitched)

In the strings below <BS> stands for one backslash and <EM> for the em dash the page already writes, so that no
escape is typed in this file: an editor that turns a typed escape into its character cannot change what is written.
"""
import sys
from pathlib import Path

BS = chr(92)
EM = chr(0x2014)

EDITS = [
    # ---- finding 9: the chip of a ruled written form ------------------------------------------------------------
    (
        "ruledMs reads a pair's written form under its letters",
        """  const ruledMs = (k, table, word) => {
    const m = pickedByForm.get(k);
    if (!m || (!m.cut && !m.cells.size)) return null;
    const set = setRuling(m);
    if (set) { const r = mOfPick(set); return r ? [r] : null; }
""",
        """  // A PAIR'S WRITTEN FORM IS READ UNDER ITS LETTERS HERE TOO (21 November
  // 2026). Its ruling is remembered under a key of its own (kqMemKey) and its
  // cells under the letters, which is how ruledLine0 reads them. Asked under
  // the key whole, no cell was found, and the ruled line lost its chip at the
  // first repaint (Daniel 2:43 word 1; Lamentations 1:6 word 2)
  const ruledMs = (kIn, table, word) => {
    const m = pickedByForm.get(kIn);
    if (!m || (!m.cut && !m.cells.size)) return null;
    const k = String(kIn).split("<BS>u0000")[0];
    const set = setRuling(m);
    if (set) { const r = mOfPick(set); return r ? [r] : null; }
""",
    ),
    # ---- finding 1: the ruled half of a one-word pair -----------------------------------------------------------
    (
        "kqPickG asks a one-word pair's ruled half under its memory keys",
        """      const p = kqPick(regions, parts, table, word);
      const ra = latestRuled(kqMemRegions(regions, word), table);
""",
        """      // THE RULED HALF OF A ONE-WORD PAIR IS ASKED UNDER THE PAIR'S MEMORY
      // KEYS (21 November 2026), as it is where a branch has several words
      // (below). kqPick asked under the letters: a ketiv ruled on its card
      // was not found, so the next repaint gave the line back to the read
      // half (Daniel 2:43 word 1), and a ruling on a plain word spelled like
      // the ketiv (2:8) was found, and took the pair's line over
      const mem = kqMemRegions(regions, word);
      const p = kqPick(regions, parts, table, word, mem);
      const ra = latestRuled(mem, table);
""",
    ),
    # finding 9's guard: a written branch of several words keeps the line with no chip that it has today
    (
        "kqPickG asks no ruled chip for a written branch of several words",
        """    const done = (gi, extra) => ({ i: gi >= 0 ? groups[gi].idx[0] : -1, is: gi >= 0 ? groups[gi].idx : [], g: gi, text: gi >= 0 ? gParts[gi] : "",
      keys: gi >= 0 ? groups[gi].regions.map((r) => r.k) : [], rk: ruledAtom >= 0 ? kqMemKey(regions[ruledAtom], word) : (gi >= 0 ? kqMemKey(groups[gi].regions[0], word) : null), ...extra });
""",
        """    // (rk under a ruling on a word of a written branch of several words: none,
    // 21 November 2026. The line prints the branch whole, its other words'
    // readings too, and the card that makes the ruling paints it with no chip.
    // The ruled word's chip alone would name one source for all of it, and
    // since ruledMs reads a written form under its letters it would be found:
    // absent over wrong, as the line stood until then)
    const done = (gi, extra) => ({ i: gi >= 0 ? groups[gi].idx[0] : -1, is: gi >= 0 ? groups[gi].idx : [], g: gi, text: gi >= 0 ? gParts[gi] : "",
      keys: gi >= 0 ? groups[gi].regions.map((r) => r.k) : [], rk: ruledAtom >= 0 ? (gi >= 0 && groups[gi].role === "KETIV" && groups[gi].regions.length > 1 ? null : kqMemKey(regions[ruledAtom], word)) : (gi >= 0 ? kqMemKey(groups[gi].regions[0], word) : null), ...extra });
""",
    ),
    # finding 1 where a branch has several words (its own edit: the rest stands without it)
    (
        "kqPickG asks a one-word written branch under its memory key where the other branch has several words",
        """    const p = kqPick(gRegions, gParts, table, word);
    return done(p.i, { fellFrom: p.fellFrom });
""",
        """    // A WRITTEN BRANCH OF ONE WORD IS ASKED UNDER ITS MEMORY KEY HERE TOO (21
    // November 2026). Asked under its letters, a ruling on a plain word
    // spelled like it took the pair's line wherever the place's source does
    // not read the pair (Deuteronomy 33:2 word 15, with the slopes of 3:17
    // ruled and STEP's translation switched off). A branch of several words
    // keeps the key its own card remembers a whole rung under
    const p = kqPick(gRegions, gParts, table, word, gRegions.map((g, gi) => (groups[gi].regions.length === 1 ? { ...g, k: kqMemKey(g, word) } : g)));
    return done(p.i, { fellFrom: p.fellFrom });
""",
    ),
    (
        "kqPick takes the regions under their memory keys",
        """  const kqPick = (regions, parts, table, word) => {
""",
        """  // (mem: the regions under the keys their rulings are remembered by, where
  // the caller holds them: a pair's one-word halves, kqPickG)
  const kqPick = (regions, parts, table, word, mem = regions) => {
""",
    ),
    (
        "kqPick asks the ruled half under those keys",
        """    const ruledIdx = latestRuled(regions, table);
    if (ruledIdx >= 0) return { i: ruledIdx, fellFrom: null };
    const pl = kqPlace(word, regions, table);
""",
        """    const ruledIdx = latestRuled(mem, table);
    if (ruledIdx >= 0) return { i: ruledIdx, fellFrom: null };
    const pl = kqPlace(word, regions, table);
""",
    ),
    # ---- finding 4: a pair under the source switches ------------------------------------------------------------
    (
        "licChipSwitched, the chip of a pair's baked reading under the switches",
        """    return licenseChipFor(ks.map((k) => zone.gloss_m[k] || null));
  };
""",
        """    return licenseChipFor(ks.map((k) => zone.gloss_m[k] || null));
  };
  // A PAIR FOLLOWS THE SOURCE SWITCHES (21 November 2026). A pair's line reads
  // one half from the baked column, and the switches never reached it: in
  // Ruth, with STEP's translation switched off, 6 of the 12 pairs still
  // printed its words under its chip, and with Strong's forms off, 4:5 still
  // named it. So a half whose reading has every carrier switched off reads
  // its baked alternate, or nothing, as a block left alone on a ruled line
  // does (switchedReading, where the pair's halves are read), and its chip
  // names whose reading that is (switchedReadings). With no carrier of the
  // line off, the chip is made as it always was.
  const licChipSwitched = (ks) => {
    if (!ks || !ks.some((k) => carriersOff(k))) return licChipFor(ks);
    const rs = [];
    for (const k of ks) { const r = switchedReadings(k, zone.gloss[k]); if (!r) return null; rs.push(...r); }
    return rs.length ? licenseChipFor(rs) : null;
  };
""",
    ),
    (
        "paintPairs reads each half under the switches",
        """        const g = s.table ? s.table[r.k] : null;
        return g ? spanJoin(g) : "<BS>u2014";
      });
      const pick = kqPickG(s.regions, s.parts, s.table, s.word);
""",
        """        const g = s.table ? s.table[r.k] : null;
        // under the source switches (licChipSwitched)
        return g ? (s.table === zone.gloss ? switchedReading(r.k, g) : spanJoin(g)) : "<BS>u2014";
      });
      const pick = kqPickG(s.regions, s.parts, s.table, s.word);
""",
    ),
    (
        "paintPairs makes the chip under the switches",
        """        const chip = at ? licenseChipFor(at.rs) : licChipFor(pick.keys);
""",
        """        const chip = at ? licenseChipFor(at.rs) : licChipSwitched(pick.keys);
""",
    ),
    (
        "wordBlock reads a pair's halves under the switches",
        """      const g = table ? table[shownKey(r)] : null;
      return g ? spanJoin(g) : "<EM>";
    });
    // a ruling made on a joined interval spoke for the whole line
""",
        """      const g = table ? table[shownKey(r)] : null;
      // a pair's half under the source switches, in a section built after
      // the switch moved too (licChipSwitched)
      return g ? (word.kq && table === zone.gloss ? switchedReading(shownKey(r), g) : spanJoin(g)) : "<EM>";
    });
    // a ruling made on a joined interval spoke for the whole line
""",
    ),
    (
        "wordBlock makes a pair's chip under the switches",
        """      const chip = lineMoved ? licenseChipFor(lineMoved.rs) : licChipFor(ks);
      if (chip) ge.append(chip);
    } else if (line && wasRuled && heldJoint != null && table === zone.gloss) {
""",
        """      const chip = lineMoved ? licenseChipFor(lineMoved.rs) : word.kq ? licChipSwitched(ks) : licChipFor(ks);
      if (chip) ge.append(chip);
    } else if (line && wasRuled && heldJoint != null && table === zone.gloss) {
""",
    ),
]


def main():
    if len(sys.argv) != 2:
        sys.exit("usage: python3 patch.py <reader dir>")
    page = Path(sys.argv[1]) / "zone.html"
    base = page.read_bytes().decode("utf-8")
    edits = [(name, old.replace("<BS>", BS).replace("<EM>", EM), new.replace("<BS>", BS).replace("<EM>", EM)) for name, old, new in EDITS]
    # every old string stands exactly once in the page as it is handed over, before any edit
    for name, old, new in edits:
        n = base.count(old)
        assert n == 1, f"{name}: the old string stands {n} times in the page, not once"
        assert old != new, f"{name}: nothing to change"
    text = base
    for name, old, new in edits:
        assert text.count(old) == 1, f"{name}: an earlier edit moved this one's place"
        text = text.replace(old, new)
    page.write_bytes(text.encode("utf-8"))
    print(f"patched {page}: {len(EDITS)} replacements")


if __name__ == "__main__":
    main()
