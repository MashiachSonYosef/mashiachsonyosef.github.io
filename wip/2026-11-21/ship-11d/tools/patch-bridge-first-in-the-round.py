#!/usr/bin/env python3
# Ship 11d: the spelling bridge's pieces are laid FIRST in the round's zones step. The re-gloss reads a name's lead off
# the place's pieces (tools/proper-name-v1.mjs, the piece of source tahot and role core), and the lattice projection
# reads them too (the name's lead under "only", the stems a card can ask). Laid after them, as the first build did, a
# first round left Genesis 49:10's «Shiloh» without its name's lead until a second round; the zones step run twice
# gave other bytes in four files. Usage: patch-bridge-first-in-the-round.py <reader dir>
import sys, io
R = sys.argv[1]
def patch(path, pairs):
    t = io.open(path, encoding="utf-8", newline="").read()
    for old, new in pairs:
        if t.count(old) != 1: sys.exit("REFUSED: %s holds %d of %r" % (path, t.count(old), old[:90]))
    for old, new in pairs: t = t.replace(old, new)
    io.open(path, "w", encoding="utf-8", newline="").write(t); print("patched:", path)

BLOCK = '''
  echo "── zones · where our text spells a word otherwise, STEP's own words for the place ─"
  # after the lattice and the read words, whether or not the lattice was
  # projected: a zone that carries the list's pieces is counted and left as it is
  node tools/apply-spelling-bridge-v1.mjs --stamp "$STAMP" > "$WORK/spelling-bridge.log" 2>&1 \\
    || { echo "round-v1: the spelling bridge's pieces were not laid" >&2; grep -E "^FAIL" "$WORK/spelling-bridge.log" >&2 || true; tail -2 "$WORK/spelling-bridge.log" >&2; exit 1; }
  grep -E "^  pieces:" "$WORK/spelling-bridge.log" | sed 's/^  /   /' || true
'''
FIRST = '''if has zones; then
  echo "── zones · where our text spells a word otherwise, STEP's own words for the place ─"
  # first: the line read again reads a name's lead off the place's pieces, and
  # so does the lattice projection. A zone that carries the list's pieces is
  # counted and left as it is
  node tools/apply-spelling-bridge-v1.mjs --stamp "$STAMP" > "$WORK/spelling-bridge.log" 2>&1 \\
    || { echo "round-v1: the spelling bridge's pieces were not laid" >&2; grep -E "^FAIL" "$WORK/spelling-bridge.log" >&2 || true; tail -2 "$WORK/spelling-bridge.log" >&2; exit 1; }
  grep -E "^  pieces:" "$WORK/spelling-bridge.log" | sed 's/^  /   /' || true

  echo "── zones · the witnessed columns baked, the line read again ────────────"
'''
patch(R + "/tools/round-v1.sh", [
 (BLOCK, ""),
 ('if has zones; then\n  echo "── zones · the witnessed columns baked, the line read again ────────────"\n', FIRST),
 ('''# After it, the spelling bridge (data/spelling-bridge/, relay v202):
# tools/apply-spelling-bridge-v1.mjs gives a place our text spells otherwise
# than the Leningrad text, where STEP names our spelling, STEP's own words
# for the place as its pieces. It too reads only this tree, writes nothing
# over zones that carry its work, and keeps the pieces the word's last field
# after a projection wrote the word's entry again.
''', '''#
# THE ZONES STEP BEGINS WITH THE SPELLING BRIDGE (data/spelling-bridge/, relay
# v202): tools/apply-spelling-bridge-v1.mjs gives a place our text spells
# otherwise than the Leningrad text, where STEP names our spelling, STEP's own
# words for the place as its pieces. It runs first because the line read
# again reads a name's lead off a place's pieces (tools/proper-name-v1.mjs)
# and the lattice projection reads them too. It reads only this tree, and
# over zones that carry its work it writes nothing.
'''),
])
patch(R + "/tools/apply-spelling-bridge-v1.mjs", [
 ('''// IT IS RUN BY THE ROUND, after the lattice projection and the read words
// (tools/round-v1.sh), and whenever the place's pieces are laid again. Run
// over zones that carry its work it writes nothing.
''', '''// IT IS RUN BY THE ROUND, FIRST IN ITS ZONES STEP (tools/round-v1.sh), and
// whenever the place's pieces are laid again. First, because two tools of
// that step read a place's pieces: the line read again takes a name's lead
// from the piece of STEP's that is the word's core (tools/proper-name-v1.mjs),
// and the lattice projection takes the name's lead under "only" and the stems
// a card can ask. Laid after them, a first round left Genesis 49:10's
// «Shiloh» without its name's lead until a second round. Run over zones that
// carry its work it writes nothing.
'''),
 ('''const toLay = all.filter((h) => h.carried === "none");
// the pieces are the word's last field: a projection that writes the word's entry again after them leaves them out of place
const outOfPlace = all.filter((h) => h.carried !== "none" && Object.keys(h.found.word).pop() !== "pg");
''', '''const toLay = all.filter((h) => h.carried === "none");
'''),
 ('''${n(all.length - toLay.length)} already laid, the same${outOfPlace.length ? ` (${n(outOfPlace.length)} to lay again as the word's last field)` : ""}`);''', '''${n(all.length - toLay.length)} already laid, the same`);'''),
 ('''if (!toLay.length && !stale.length && !outOfPlace.length) { console.log("nothing to write"); process.exit(0); }''', '''if (!toLay.length && !stale.length) { console.log("nothing to write"); process.exit(0); }'''),
 ('''  if (!here.some((h) => h.carried === "none" || outOfPlace.includes(h)) && !stale.some((z) => z.zone === zone)) continue;
  // the pieces, the word's last field: laid again where the zone carried them, so no earlier run shows in the bytes
  for (const { place, found } of here) { delete found.word.pg; found.word.pg = place.pieces.map((x) => ({ k: x.k, g: x.g, s: x.s, r: x.r })); }
''', '''  if (!here.some((h) => h.carried === "none") && !stale.some((z) => z.zone === zone)) continue;
  for (const { place, found, carried } of here) if (carried === "none") found.word.pg = place.pieces.map((x) => ({ k: x.k, g: x.g, s: x.s, r: x.r }));
'''),
 ('''// as STEP writes it, its source, its role), laid as the word's last field
// whatever the zone held before, so the same inputs give the same bytes. At
// a place the pin does not lay, nothing.
''', '''// as STEP writes it, its source, its role). At a place the pin does not lay,
// nothing.
'''),
])
patch(R + "/tools/check-spelling-bridge-v1.mjs", [
 ('''//       under the list's key, and carries exactly the list's pieces, the
//       word's last field
''', '''//       under the list's key, and carries exactly the list's pieces
'''),
 ('''    if (carried !== "the list's") faults.push(`${saidOf(place)}: the word carries ${carried === "none" ? "no pieces" : `other pieces (${JSON.stringify(found.word.pg)})`}`);
    else if (Object.keys(found.word).pop() !== "pg") faults.push(`${saidOf(place)}: its pieces are not the word's last field`);
''', '''    if (carried !== "the list's") faults.push(`${saidOf(place)}: the word carries ${carried === "none" ? "no pieces" : `other pieces (${JSON.stringify(found.word.pg)})`}`);
'''),
 ('''a plain word under the list's key, and carries exactly the list's pieces, the word's last field",''', '''a plain word under the list's key, and carries exactly the list's pieces",'''),
])
patch(R + "/PIPELINE.md", [
 ('''laid and why each of the others is not. The round lays the pieces after
> the read words, each time; no tag is written.
''', '''laid and why each of the others is not. The round lays the pieces first in
> its zones step, before the line is read again: that reading takes a name's
> lead from a place's pieces, and so does the lattice projection. No tag is
> written.
'''),
])
