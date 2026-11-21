# Ship 12, patch 1: a pinned file may be kept gzipped (weighed as its unzipped bytes), and a landing list whose pin
# says so reads a named rank as the hole the strike left.
import io, sys, re
R = sys.argv[1]
def edit(path, pairs):
    p = R + "/" + path
    s = io.open(p, encoding="utf-8").read()
    for old, new in pairs:
        assert s.count(old) == 1, (path, old[:70], s.count(old))
        s = s.replace(old, new)
    io.open(p, "w", encoding="utf-8", newline="\n").write(s)
    print("patched", path)

# ---- pinned-v1: a file kept gzipped ------------------------------------------------------------
edit("tools/pinned-v1.mjs", [
("""//   heldToPin(bytes, lines, entry)       -> whether these bytes are the entry's
import { readFileSync, existsSync } from "node:fs";
""",
"""//   heldToPin(bytes, lines, entry)       -> whether these bytes are the entry's
//
// A LARGE LIST IS KEPT GZIPPED AND WEIGHED AS WHAT IT HOLDS (21 November
// 2026, the corpus lane's v207: three lists of 38 MB). A pin entry that says
// `stored: "gzip"` names a file kept gzipped in this tree; its `bytes` and
// `sha256` are still the list's own, the figures the lane's letter gives, so
// the file is unzipped and then weighed. The zipped bytes are not pinned:
// they are a way of keeping the list, and two zips of one list differ.
//
//   bytesToKeep(bytes, entry)            -> the bytes to write for an entry (zipped where it says so)
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync, gzipSync } from "node:zlib";
"""),
("""  if (!existsSync(path)) throw new PinFault(`${name} is named in its pin and is not here`);
  const bytes = readFileSync(path);
""",
"""  if (!existsSync(path)) throw new PinFault(`${name} is named in its pin and is not here`);
  let bytes = readFileSync(path);
  if (entry.stored !== undefined && entry.stored !== "gzip") throw new PinFault(`${name}: its pin says it is stored as "${entry.stored}", and a pinned file is kept as it is or gzipped`);
  if (entry.stored === "gzip") { try { bytes = gunzipSync(bytes); } catch (e) { throw new PinFault(`${name} is pinned as a gzipped file and does not unzip (${e.message})`); } }
"""),
("""export const heldToPin = (bytes, lines, entry) =>""",
"""export const bytesToKeep = (bytes, entry) => (entry && entry.stored === "gzip" ? gzipSync(bytes, { level: 9 }) : bytes);
export const heldToPin = (bytes, lines, entry) =>"""),
])

# ---- derive-landings-v1: the hole a strike left ---------------------------------------------------
edit("tools/derive-landings-v1.mjs", [
("""//   - a line with no rank takes the highest rank under its key plus one, in the list's order (the lane's own words
//     in v200 and v202), counting the rows this derivation has ranked before it; under a key new to the store, 1;
""",
"""//   - a line with no rank takes the highest rank under its key plus one, in the list's order (the lane's own words
//     in v200 and v202), counting the rows this derivation has ranked before it; under a key new to the store, 1;
//   - in a list whose pin says its ranks are HOLES (`a_named_rank_is: "the hole the strike left"`, the corpus lane's
//     v207: the rows of a source struck whole, back at the rank each stood at), a named rank is the hole the row
//     left when its source was struck. The struck-ranks record must hold that rank for that source under that key,
//     or the line is refused. The row lands at the hole where no row stands at that rank under the key now and no
//     line derived before it here took it; where one does (a later landing put another source's row there), it
//     lands as a line with no rank does (the lane's own words: «if a list you land before this one takes it, land
//     that line as a null rank»);
"""),
("""import { readPinned, readPinnedLines, heldToPin, sha256Of, PinFault } from "./pinned-v1.mjs";
""",
"""import { gunzipSync } from "node:zlib";
import { readPinned, readPinnedLines, heldToPin, bytesToKeep, sha256Of, PinFault } from "./pinned-v1.mjs";
"""),
("""const store = openRouteStore(STORE);

// ---- every line, proved again""",
"""const store = openRouteStore(STORE);
// a list of holes: the ranks the struck-ranks record holds, key by key, each with the source that stood there
const HOLES = L.a_named_rank_is === "the hole the strike left";
if (L.a_named_rank_is !== undefined && !HOLES) refuse(`the pin's list "${ID}" says a named rank is "${L.a_named_rank_is}", and a named rank is its record's rows' rank or "the hole the strike left"`);
const struckAt = new Map();   // key -> Set of "rank\\u0001m"
if (HOLES) {
  const sp = join(STORE, "struck-ranks-v1.json.gz");
  if (!existsSync(sp)) refuse(`"${ID}" lands at the holes a strike left, and the struck-ranks record is not here (${sp})`);
  const sr = JSON.parse(gunzipSync(readFileSync(sp)).toString("utf8"));
  if (!sr.keys || typeof sr.keys !== "object") refuse(`${sp} is not a struck-ranks record (it holds no keys)`);
  for (const [k, v] of Object.entries(sr.keys)) struckAt.set(k, new Set(v.map((x) => `${x[0]}\\u0001${x[1]}`)));
}
const takenHere = new Map();  // key -> Set of the ranks lines derived here stand at

// ---- every line, proved again"""),
("""  let rank = e.rank, rankFrom = "the list names the rank: its record's other rows stand there";
  if (rank === null) { rank = nextRank.get(e.key) + 1; nextRank.set(e.key, rank); rankFrom = "the highest rank under the key plus one, in the list's order"; }
  else if (!rows.some((r) => Number(r[0]) === rank && String(r[3]) === e.m)) refuse(`${where}: it names rank ${rank}, and no row of ${e.m} stands at that rank under its key: where it lands is not decided`);
""",
"""  let rank = e.rank, rankFrom = "the list names the rank: its record's other rows stand there";
  const here = takenHere.get(e.key) || takenHere.set(e.key, new Set()).get(e.key);
  if (HOLES && rank !== null) {
    // the hole is this source's, by the record of the strike: under the line's own key, or the key the list moved it off
    const holeKey = typeof e.from_key === "string" && e.from_key ? e.from_key : e.key;
    if (!(struckAt.get(holeKey) || new Set()).has(`${rank}\\u0001${e.m}`)) refuse(`${where}: it names rank ${rank} as the hole its row left, and the struck-ranks record holds no rank ${rank} of ${e.m} under ${holeKey}`);
    if (holeKey !== e.key) { rank = null; holesMoved += 1; }
    else if (rows.some((r) => Number(r[0]) === rank) || here.has(rank)) { rank = null; holesTaken += 1; }
    else rankFrom = "the hole the strike left: the struck-ranks record holds this rank for this source under this key, and no row stands at it";
  }
  if (rank === null) {
    rank = Math.max(nextRank.get(e.key), ...here) + 1; nextRank.set(e.key, rank);
    rankFrom = e.rank === null ? "the highest rank under the key plus one, in the list's order"
      : typeof e.from_key === "string" && e.from_key && e.from_key !== e.key ? "the hole stood under the key the list moved the row off: the highest rank under its key plus one, in the list's order"
        : "a row stands at the hole the strike left: the highest rank under the key plus one, in the list's order";
  }
  else if (!HOLES && !rows.some((r) => Number(r[0]) === rank && String(r[3]) === e.m)) refuse(`${where}: it names rank ${rank}, and no row of ${e.m} stands at that rank under its key: where it lands is not decided`);
  here.add(rank);
"""),
("""let gathered = 0;   // the lines that joined the row an earlier line of the same source made for the same words
""",
"""let gathered = 0;   // the lines that joined the row an earlier line of the same source made for the same words
let holesTaken = 0, holesMoved = 0;   // in a list of holes: the lines whose hole a row stands at now, and those the list moved off their hole's key
"""),
("""  lines_gathered_into_an_earlier_lines_row: gathered, keys: new Set(landed.map((x) => x.key)).size, keys_new_to_the_store: newKeys.size, ranked_here: landed.filter((x) => x.rank_from.startsWith("the highest")).length,
""",
"""  lines_gathered_into_an_earlier_lines_row: gathered, keys: new Set(landed.map((x) => x.key)).size, keys_new_to_the_store: newKeys.size, ranked_here: landed.filter((x) => !x.rank_from.startsWith("the list names") && !x.rank_from.startsWith("the hole the strike left")).length,
  ...(HOLES ? { at_the_hole_the_strike_left: landed.filter((x) => x.rank_from.startsWith("the hole the strike left")).length, hole_taken_now: holesTaken, moved_off_the_holes_key: holesMoved } : {}),
"""),
("""for (const [p, b] of out) writeFileSync(join(HOME, derived.folder, p.file), b);
""",
"""for (const [p, b] of out) writeFileSync(join(HOME, derived.folder, p.file), bytesToKeep(b, p));
"""),
])
