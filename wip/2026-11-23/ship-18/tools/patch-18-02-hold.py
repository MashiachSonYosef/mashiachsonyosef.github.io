# Ship 18, patch 2 (23 November 2026): a row the corpus lane holds at a place (place-hold-rule-v1, relay v221).
#   - zone.html: a commentary word that carries ph draws its own line (the line without the rows held there) and its
#     card keeps those rows off under «only this pointing», counted on the card as the names gate's are; under «keep»
#     and «the letters only» they stand;
#   - tools/round-v1.sh: the zones step lays the held places right after the commentary's line is read again;
#   - PIPELINE.md: the let-go lines and the held places, said.
# Each file is patched once: a file that carries the patch's mark is said and left. Exact replacements, each asserted
# to occur once. Usage: patch-18-02-hold.py <reader>
import io, sys
R = sys.argv[1]
s = ""
def swap(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:100])
    s = s.replace(old, new)
def file(rel, mark, edits):
    global s
    p = R + "/" + rel
    s = io.open(p, encoding="utf-8").read()
    if mark in s:
        print("stands already", rel); return
    edits()
    assert mark in s, rel
    io.open(p, "w", encoding="utf-8", newline="\n").write(s)
    print("patched", rel)
RULE = "place-hold-rule-v1-a-row-the-corpus-lane-holds-at-a-place-rests-withheld-there-and-stands-at-every-other-place"

# ---- zone.html ------------------------------------------------------------------------------------------------------
def page():
    swap("""  let openName = null;                  // whether that place is a name; null where the card stands at no place of the book
""", """  let openName = null;                  // whether that place is a name; null where the card stands at no place of the book
  let openHeld = null;                  // the rows the corpus lane holds at the open word's place, where it is a commentary's word that carries them (ph)
""")
    swap("""    openName = openPlaceWord ? isNamePlace(openPlaceWord) : null;
""", """    openName = openPlaceWord ? isNamePlace(openPlaceWord) : null;
    // THE CORPUS LANE'S HOLD AT THE PLACE (""" + RULE + """;
    // relay v221, 23 November 2026). A commentary's word is no position of the book, so no gate above reads it; where
    // the lane holds rows at its place (the word's ph, laid by tools/apply-held-places-v1.mjs), its own card keeps them
    // off, under its own key (poolFor, opts.heldAt)
    openHeld = bin !== zone && word && word.ph && Array.isArray(word.ph.r) && word.ph.r.length && word.k ? { k: word.k, rows: word.ph.r } : null;
    window.__cardHeld = openHeld ? openHeld.rows.map((h) => `${h[0]} ${h[1]}`).join("|") : "";
""")
    swap("""      routes = kept; namesHeld = true;
    }
""", """      routes = kept; namesHeld = true;
    }
    // THE CORPUS LANE'S HOLD AT THE PLACE (""" + RULE + """;
    // relay v221, 23 November 2026), with the place's other gates. A row of English Wiktionary's translation tables
    // names a spelling and no place; where the corpus lane reads the word at a place of the Targum as another word
    // written alike, it holds the row there at rest. Under «only», at a commentary's word whose place the lane holds
    // rows at (opts.heldAt: the open word's ph, given by the card alone, never the key's): such a row never enters the
    // pool, and the card says how many. A row a gate above withheld is counted there and not again. Under «keep» and
    // «letters» it stands, as every gate of a place lifts there. The line, the exporter and a pool asked with no place
    // hold none back: the line at the place is the one its word carries
    let withheldHere = 0;
    if (opts.heldAt && Array.isArray(opts.heldAt.rows) && opts.heldAt.rows.length && pointingNow(W.pointed) === "only") {
      const kept = routes.filter((row) => !opts.heldAt.rows.some((h) => String(row[3]) === h[0] && row[1] === h[1]));
      withheldHere = routes.length - kept.length;
      routes = kept;
    }
""")
    swap("""pool.withheldByName = withheldByName; pool.namesHeld = namesHeld;
    pool.withheldBySense""", """pool.withheldByName = withheldByName; pool.namesHeld = namesHeld; pool.withheldHere = withheldHere;
    pool.withheldBySense""")
    swap("""to.withheldByName = from.withheldByName; to.namesHeld = from.namesHeld;
""", """to.withheldByName = from.withheldByName; to.namesHeld = from.namesHeld; to.withheldHere = from.withheldHere;
""")
    swap("""spanAt: spanPlaceOfCell(surface), ruled: picked.get(surface) || null });""",
         """spanAt: spanPlaceOfCell(surface), ruled: picked.get(surface) || null, heldAt: openHeld && surface === openHeld.k ? openHeld : null });""")
    swap("""        if (pool && (pool.withheld || pool.withheldUnpointed || pool.withheldByEntry || pool.withheldByName || pool.withheldByStem || pool.withheldBySources || pool.withheldBySense || kindsHeldN(pool))) {""",
         """        if (pool && (pool.withheld || pool.withheldUnpointed || pool.withheldByEntry || pool.withheldByName || pool.withheldHere || pool.withheldByStem || pool.withheldBySources || pool.withheldBySense || kindsHeldN(pool))) {""")
    swap("""          if (pool.withheldByName) bits.push(`${pool.withheldByName} record${pool.withheldByName === 1 ? "" : "s"} withheld as a name — their own source gives ${pool.withheldByName === 1 ? "it" : "them"} as a name, and the word here is not one`);
""", """          if (pool.withheldByName) bits.push(`${pool.withheldByName} record${pool.withheldByName === 1 ? "" : "s"} withheld as a name — their own source gives ${pool.withheldByName === 1 ? "it" : "them"} as a name, and the word here is not one`);
          if (pool.withheldHere) bits.push(`${pool.withheldHere} record${pool.withheldHere === 1 ? "" : "s"} held at this place — the corpus lane reads the word here as another word written alike`);
""")
    swap("""          const onlyShut = nK && !(pool.withheld || pool.withheldUnpointed || pool.withheldByEntry || pool.withheldByName || pool.withheldByStem || pool.withheldBySources || pool.withheldBySense);
          paintNow(saidOnce(cover.map((c, i) => textOfCell(c.surface, i))).join(" + "), onlyShut ? "every record for this block rests shut" : "every record for this block is withheld by your switches");""",
         """          const onlyShut = nK && !(pool.withheld || pool.withheldUnpointed || pool.withheldByEntry || pool.withheldByName || pool.withheldHere || pool.withheldByStem || pool.withheldBySources || pool.withheldBySense);
          const onlyHere = pool.withheldHere && !(nK || pool.withheld || pool.withheldUnpointed || pool.withheldByEntry || pool.withheldByName || pool.withheldByStem || pool.withheldBySources || pool.withheldBySense);
          paintNow(saidOnce(cover.map((c, i) => textOfCell(c.surface, i))).join(" + "), onlyShut ? "every record for this block rests shut" : onlyHere ? "every record for this word is held at this place" : "every record for this block is withheld by your switches");""")
    swap("""        pills.dataset.nameWithheld = String(pool.withheldByName || 0);
""", """        pills.dataset.nameWithheld = String(pool.withheldByName || 0);
        pills.dataset.placeHeld = String(pool.withheldHere || 0);
""")
    swap("""        if (pool.withheld || pool.withheldUnpointed || pool.withheldByEntry || pool.withheldByName || pool.withheldByStem || pool.withheldBySources || pool.withheldBySense || pool.sensesShown || kindsHeldN(pool) || pool.kindsShown) {""",
         """        if (pool.withheld || pool.withheldUnpointed || pool.withheldByEntry || pool.withheldByName || pool.withheldHere || pool.withheldByStem || pool.withheldBySources || pool.withheldBySense || pool.sensesShown || kindsHeldN(pool) || pool.kindsShown) {""")
    swap("""          if (pool.withheldByName) parts.push(Object.assign(document.createElement("span"), { className: "name-withheld", textContent: `${pool.withheldByName} given as a name by ${pool.withheldByName === 1 ? "its" : "their"} source, withheld` }));
""", """          if (pool.withheldByName) parts.push(Object.assign(document.createElement("span"), { className: "name-withheld", textContent: `${pool.withheldByName} given as a name by ${pool.withheldByName === 1 ? "its" : "their"} source, withheld` }));
          if (pool.withheldHere) parts.push(Object.assign(document.createElement("span"), { className: "place-held", textContent: `${pool.withheldHere} held at this place: the corpus lane reads the word here as another word written alike` }));
""")
    swap("""      const g = table ? table[shownKey(r)] : null;
""", """      // a commentary's word whose place the corpus lane holds rows at reads the line its word carries, the line without
      // them (""" + RULE + """), under every switch:
      // a commentary's line is drawn once, from its zone, and no switch repaints it
      const g = table ? (table !== zone.gloss && word.ph && !(regions && regions.length > 1) && r.k === word.k ? word.ph.g : table[shownKey(r)]) : null;
""")
file("zone.html", "openHeld", page)

# ---- tools/round-v1.sh --------------------------------------------------------------------------------------------
def round_():
    swap("""# THE ZONES STEP BEGINS WITH THE SPELLING BRIDGE""", """# THE COMMENTARY'S LINE READ AGAIN IS FOLLOWED BY THE PLACES THE CORPUS LANE
# HOLDS A ROW AT (data/held-places/, relay v221; ship 18, 23 November 2026):
# tools/apply-held-places-v1.mjs writes, on the word of each such place, the
# rows held there and the line the place reads without them, read from the
# same store the line was just read from. It reads only this tree, and over
# zones that carry its work it writes nothing.
#
# THE ZONES STEP BEGINS WITH THE SPELLING BRIDGE""")
    swap("""  for f in "$WORK"/commentary/*.bin; do [ -f "$f" ] && cp "$f" "data/zones/$(basename "$f")"; done
""", """  for f in "$WORK"/commentary/*.bin; do [ -f "$f" ] && cp "$f" "data/zones/$(basename "$f")"; done

  echo "── zones · a row the corpus lane holds at a place, held there ──────────"
  # right after the commentary's line is read again, from the same store: the
  # line under a hold is the key's pool less the rows held there
  node tools/apply-held-places-v1.mjs --stamp "$STAMP" > "$WORK/held-places.log" 2>&1 \\
    || { echo "round-v1: the held places were not laid" >&2; grep -E "^FAIL" "$WORK/held-places.log" >&2 || true; tail -2 "$WORK/held-places.log" >&2; exit 1; }
  grep -E "^  (holds|lines):" "$WORK/held-places.log" | sed 's/^  /   /' || true
""")
file("tools/round-v1.sh", "apply-held-places-v1", round_)

# ---- PIPELINE.md --------------------------------------------------------------------------------------------------
def doc():
    swap("""> (124 land; two wait by their line, below).""", """> (124 landed with the list; the two it held by their line land since
> 23 November 2026, below).""")
    swap("""> by its line, and counted in the record as a listed row not served.
""", """> by its line, and counted in the record as a listed row not served.
> The corpus lane's relay v221 (ship 18, 23 November 2026) found both right
> as English Wiktionary's own words and the Targum's word at their places
> another word written alike, and lets them go (`let_go` on each held line,
> by relay and why): they land in a list of the pin that RE-READS the list
> v1.1 (`re_reads`: the same rule, receipt and list, derived again on the
> store after it landed), which lands exactly the lines let go to it, while
> every line that landed before is printed by its own source and PanLex's
> stay held with their source. The record counts them as let go
> (`held_lines_let_go`), and the source record as served. A row may be held
> at a place instead (`place-hold-rule-v1`): a row of the translation tables
> names a spelling and no place, and the commentary zones carry no tag or
> grade that parts it from another word written alike. The lane's resting
> call for every row of the tables at every place of the Targum and the
> Zohar is kept byte for byte in `data/held-places/` (relay v221; the list
> gzipped). At each place it marks held at rest, found on our commentary
> zone by the row, the work, the verse unit and the key (the lane's token
> row is its own edition's), `tools/apply-held-places-v1.mjs`, in the
> round's zones step right after the commentary's line is read again, writes
> on the word the rows held there and the line the place reads without them
> (`ph`); the reader draws that line there and keeps the rows off the word's
> card under «only this pointing», counted as the names gate counts its own;
> they stand at every other place. The lane's two branches (WIDE_HOLD and the
> corpus hold on a points tie) are off at rest and hold nothing. A held
> place of a work no zone serves (Onkelos, the other Targumim, the Zohar and
> Zohar Chadash) is named in the pin as not served, with why.
> `tools/check-held-places-v1.mjs` holds every held place to the zones.
""")
file("PIPELINE.md", "place-hold-rule-v1", doc)
