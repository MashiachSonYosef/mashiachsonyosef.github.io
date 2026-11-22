# Ship 17, patch 4 (22 November 2026): what the round, the gate and PIPELINE.md say of the spelling bridge, now that
# the pin lays the other places of new pieces from bridge v1.1 (relay v214). Words only: no step of the round and no
# law of the gate changes, since both read the laid places through the one reading. The paragraph of PIPELINE.md this
# replaces is the same on main and on main with ship 16, which does not touch it.
# Each replacement's old text must occur once; a replacement whose new text stands already is passed.
# Usage: python3 -I patch-17-04-docs.py <reader dir>
import io, sys
R = sys.argv[1]
report = []
def patch(rel, pairs):
    p = R + "/" + rel; s = io.open(p, encoding="utf-8").read()
    done = []
    for old, new in pairs:
        if s.count(new) == 1 and (old not in new or s.count(old) == 1): done.append("stands"); continue
        assert s.count(old) == 1, (rel, s.count(old), old[:90])
        s = s.replace(old, new); done.append("applied")
    io.open(p, "w", encoding="utf-8", newline="\n").write(s)
    report.append(f"{rel}: {done.count('applied')} applied, {done.count('stands')} standing already")

patch("tools/round-v1.sh", [("""# THE ZONES STEP BEGINS WITH THE SPELLING BRIDGE (data/spelling-bridge/, relay
# v202): tools/apply-spelling-bridge-v1.mjs gives a place our text spells
# otherwise than the Leningrad text, where STEP names our spelling, STEP's own
# words for the place as its pieces. It runs first because the line read
""", """# THE ZONES STEP BEGINS WITH THE SPELLING BRIDGE (data/spelling-bridge/, relays
# v202 and v214): tools/apply-spelling-bridge-v1.mjs gives a place our text
# spells otherwise than the Leningrad text, where the corpus lane's list cuts
# STEP's pieces onto our letters, STEP's own words for the place, as STEP
# writes them, as its pieces (since 22 November 2026, ship 17, at the other
# places of new pieces too, from bridge v1.1). It runs first because the line read
""")])

patch("tools/check-same-product-v1.mjs", [("""// switch where the place's reading does not lead the line is the old line,
// and nothing is owed. No place is named here: the pin and the zone say them.
""", """// switch where the place's reading does not lead the line is the old line,
// and nothing is owed. No place is named here: the pin and the zone say them.
// Since ship 17 (22 November 2026: bridge v1.1, relay v214) the pin lays the
// other places of new pieces too, read by the same reading
// (tools/spelling-bridge-v1.mjs, laidOf), so nothing here changes. A place
// where call 4 of relay v189 makes STEP's own reading stand is held by the pin
// and owed nothing.
""")])

patch("PIPELINE.md", [("""> projected without it. At 206
> places where our text spells a word otherwise than the Leningrad text STEP
> follows, and STEP's own spelling column names our spelling, a zone carries
> since 21 November the place's pieces: our letters as the corpus lane's
> spelling bridge cuts them, and for each piece STEP's own words for the
> place, as STEP writes them (`tools/apply-spelling-bridge-v1.mjs`, from the
> list kept in `data/spelling-bridge/`, read through
> `tools/spelling-bridge-v1.mjs`). The lattice reads STEP under the
> Leningrad spelling and gives these places nothing, so the line there was
> whatever row led under the key; with the pieces it is the place's own
> reading, as everywhere else. The pin says which of the list's classes are
> laid and why each of the others is not. The round lays the pieces first in
> its zones step, before the line is read again: that reading takes a name's
> lead from a place's pieces, and so does the lattice projection. No tag is
> written.
""", """> projected without it. At the
> places where our text spells a word otherwise than the Leningrad text STEP
> follows and the corpus lane's spelling bridge cuts STEP's pieces onto our
> letters, a zone carries the place's pieces: our letters as the bridge cuts
> them, and for each piece STEP's own words for the place, as STEP writes them
> (`tools/apply-spelling-bridge-v1.mjs`, from the lists kept in
> `data/spelling-bridge/`, read through `tools/spelling-bridge-v1.mjs`).
> Since 21 November, at the 206 places where STEP's own spelling column names
> our spelling, each piece is worded by the form row named for the place.
> Since 22 November (ship 17), at the other places of new pieces too: bridge
> v1.1 (relay v214) gives each piece its part of STEP's column as STEP writes
> it, brackets kept, and the piece is worded by that part with its ends
> trimmed. v1.1 is read only where each of its lines, its added fields taken
> off, is v1's line, and only where the marks taken off each part give v1's
> English; at the 206 each form row's part is v1.1's part byte for byte, so
> nothing laid there moves. The lattice reads STEP under the Leningrad
> spelling and gives these places nothing, so the line there was whatever row
> led under the key; with the pieces it is the place's own reading, as
> everywhere else. The pin says which of the list's kinds are laid and why
> each of the others is not; the places whose pieces carry STEP's «}+» tag
> wait for bridge v1.2 (relay v218), the places that are pairs keep a pair's
> line, and two kinds wait on call 4 of relay v189, read where call 4 itself
> is read (the audit calls' pin and the list the default picks' bake reads),
> never listed (22 November 2026): the places call 4 holds as they rest
> (STEP's words written with « | ») keep their line until the corpus lane
> says how STEP reads them, and the places where call 4 makes STEP's own
> reading stand keep it: the page asks STEP's reading before the place's
> pieces, so laid there the pieces read the place a second way beside the
> line, on its card and across words, until the page lane says how such a
> place is drawn. The rule's id and the pin's shape keep their
> versions (22 November 2026): no rule of the house asks either to move when a
> pin lays more of a list it names; the id's words name the class it was first
> laid at, and the pin names every class laid now. The round lays the pieces
> first in its zones step, before the line is read again: that reading takes a
> name's lead from a place's pieces, and so does the lattice projection. No tag
> is written.
""")])
print("\n".join(report))
