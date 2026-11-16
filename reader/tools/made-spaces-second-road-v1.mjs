// Synthesis lane · the counts of a made-spaces list, held on a store its receipt never read
// LEDGER: -
// no frame letter. It reads the store's index, the row-strikes record and
// two pinned lists, and writes nothing.
//
// A LIST'S COUNTS ARE THE RECEIPT'S, LESS THE ROWS THE PAGE'S OWN RECORD SAYS
// LEFT THE STORE AND THE LINES IT SAYS NEVER LANDED.
//
// Each line of a made-spaces list states how many rows serve its text (as the
// route text, as the definition text), and its relay's receipt states how
// many rows of the source hold a close. tools/apply-made-spaces-v1.mjs holds
// both to the store while the source's rows are the rows the list was read
// from: the FIRST road. Relay v188.1 (14 November 2026) reissued the lists as
// they stand once the lane's landing v188 lands, and its receipts read a
// store no page ever served: store 4d1357b26ca5 with all 4,252 of v188's
// lines in it («4d1357b26ca5+v188»). The page landed call 5 of relay v189
// first, as both letters ask, so 48 of those lines never landed and rows the
// lists counted were struck. The first road is shut for good, and without
// another the counts would only be recorded.
//
// The SECOND road opens where the pin says what store the receipt read
// (read_at: a served store's version, and the landing laid on it). Then the
// page's own records say, row by row, how this store differs from that one:
//
//   - the rows of the source that a round of the row-strikes record took off
//     the store since that version (a strike, a withholding, a re-key or a
//     retext that folded): each is in the record whole, text and all;
//   - the lines of the landing the page did not land, each named with its
//     words and its definition by tools/derive-fold-strike-landing-v1.mjs.
//
//   - the rows of the source that a round retexted since without folding
//     (relay v187's words back, ship 6): the row stays, with other words, so
//     its old texts lose it and the source's rows do not; its new words take
//     their closes from that relay's own list, which apply-made-spaces reads
//     apart.
//
// A line's counts on this store are its stated counts less those rows and
// lines whose route text (field 1) or definition text (field 2) is its text.
// A re-key that lands moves a row's key and no text, and counts for nothing.
//
// THE ROAD IS SHUT, in words, and the caller refuses or fails, where the
// records cannot say how the two stores differ: the version the receipt read
// is not in the store's history; the landing is not in the record, or did
// not land every line of the derived list; a round since that version
// restored or rejoined a row of the source, or landed one that is not the
// landing's. A retext since that folded a row into another is a row taken,
// as a strike is; one that did not is a row whose old texts lose it
// (retexted, above).
//
//   secondRoad({ data, index, readAt, listed })
//     data     the reader's data folder
//     index    the store's index
//     readAt   the pin's read_at of the relay
//     listed   the m ids whose lists that relay's receipt counts
//   -> { open: false, why }
//    | { open: true, base, landing, rounds, gone, notLanded, retexted }
//        gone       m id -> the rows taken, { key, rank, route, definition, action, list }
//        notLanded  m id -> the lines not landed, { key, rank, route, definition, line }
//        retexted   m id -> the rows that stay with other words, { key, rank, route, definition (the old texts), to_text, list }
//   fallOf(road, m, text) -> [rows fewer as the route text, rows fewer as the definition text]
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { readPinnedLines, PinFault } from "./pinned-v1.mjs";

const shut = (why) => ({ open: false, why });

export const secondRoad = ({ data, index, readAt, listed }) => {
  const mine = new Set([...listed].map(String));
  const base = readAt && readAt.base_store_version, landing = readAt && readAt.with_the_landing;
  if (!base || !landing || !landing.pin) return shut("the pin's read_at names no served store version and landing");
  // the rounds of the row-strikes record that ran after the store was the version the receipt read
  const history = index.store_version_history || [];
  const at = history.map((h) => h.now).lastIndexOf(base);
  if (at < 0 && !(history.length && history[0].was === base)) return shut(`the store's history does not hold ${base}, the version the receipt read`);
  const since = new Set(history.slice(at + 1).map((h) => h.now));
  const recordPath = join(data, "row-strikes-v1.json");
  if (!existsSync(recordPath)) return shut("the row-strikes record is not here");
  const rounds = (JSON.parse(readFileSync(recordPath, "utf8")).rounds || []).filter((r) => r.store_version && r.store_version.now !== r.store_version.was && since.has(r.store_version.now));
  // the landing: its pin, the list derived from it that the page lands, the lines it does not
  const pinPath = join(data, "made-spaces", landing.pin);
  if (!existsSync(pinPath)) return shut(`the landing's pin is not here (${landing.pin})`);
  const pin = JSON.parse(readFileSync(pinPath, "utf8"));
  const derived = pin.derived || {};
  if (pin.relay !== landing.relay || !pin.landing || pin.landing.sha256 !== landing.list_sha256 || !derived.landed || !derived.not_landed) return shut(`${landing.pin} is not the pin of relay ${landing.relay}'s landing list ${String(landing.list_sha256).slice(0, 12)} with the two lists derived from it`);
  const landedBy = rounds.filter((r) => r.list && r.list.sha256 === derived.landed.sha256);
  if (landedBy.length !== 1) return shut(`the row-strikes record holds ${landedBy.length} rounds since ${base} that landed ${derived.landed.file} (relay ${landing.relay}): the store the receipt read holds that landing`);
  const landed = (landedBy[0].counts || {}).by_action || {};
  if (landed.land !== derived.landed.lines || landed.land_already_held) return shut(`the round that landed ${derived.landed.file} landed ${landed.land} of its ${derived.landed.lines} lines (${landed.land_already_held} already held)`);
  let lines;
  try { lines = readPinnedLines(join(dirname(pinPath), derived.folder, derived.not_landed.file), derived.not_landed, `${derived.folder}/${derived.not_landed.file}`); }
  catch (e) { if (e instanceof PinFault) return shut(e.message); throw e; }
  if (lines.length + derived.landed.lines !== pin.landing.lines) return shut(`${derived.landed.lines} lines landed and ${lines.length} not landed are not the ${pin.landing.lines} lines of relay ${landing.relay}'s list`);
  const notLanded = new Map();
  for (const l of lines) if (mine.has(String(l.m))) (notLanded.get(String(l.m)) || notLanded.set(String(l.m), []).get(String(l.m))).push({ key: l.key, rank: l.rank, route: l.route, definition: l.definition, line: (l.from || {}).line ?? null });
  // every row of a listed source a round since acted on
  const gone = new Map(), retexted = new Map();
  for (const r of rounds) for (const x of r.rows || []) {
    const list = r.list ? r.list.file : "a round with no list";
    if (x.action === "rejoin") { if ((x.rows || []).some((y) => mine.has(String(y[3])))) return shut(`${list} rejoined rows of ${x.m} since ${base}, which the second road does not count`); continue; }
    const m = String(x.m);
    if (!mine.has(m)) continue;
    const where = `${list}: ${m} ${x.key} rank ${x.rank}`;
    // a retext that did not fold: the row stays, and its old texts lose it (relay v187's words back)
    if (x.action === "retext" && !x.folded_into) {
      if (!Array.isArray(x.row) || typeof x.to_text !== "string") return shut(`${where} was retexted since ${base}, and the record does not keep the row whole and the text it took`);
      (retexted.get(m) || retexted.set(m, []).get(m)).push({ key: x.key, rank: x.rank, route: String(x.row[1] ?? ""), definition: String(x.row[2] ?? ""), to_text: x.to_text, list });
      continue;
    }
    if (x.action === "restore") return shut(`${where} was restored since ${base}, which the second road does not count`);
    if (x.action === "land") { if (r !== landedBy[0]) return shut(`${where} was landed since ${base} by another list than relay ${landing.relay}'s, a row the store the receipt read never held`); continue; }
    const taken = x.action === "strike" || x.action === "withhold" || ((x.action === "re-key" || x.action === "retext") && !!x.folded_into);
    if (!taken) continue;   // a re-key that lands, a re-heading: the row stays, text and all
    (gone.get(m) || gone.set(m, []).get(m)).push({ key: x.key, rank: x.rank, route: String(x.row[1] ?? ""), definition: String(x.row[2] ?? ""), action: x.action, list });
  }
  return { open: true, base, landing: { relay: landing.relay, list: derived.landed.file, not_landed: derived.not_landed.file }, rounds: rounds.map((r) => ({ list: r.list ? r.list.file : null, ran_at: r.ran_at })), gone, notLanded, retexted };
};

/** How many fewer rows serve `text` on this store than its line states: as the route text, as the definition text. */
export const fallOf = (road, m, text) => {
  const off = [...(road.gone.get(String(m)) || []), ...(road.notLanded.get(String(m)) || []), ...((road.retexted && road.retexted.get(String(m))) || [])];
  return [off.filter((x) => x.route === text).length, off.filter((x) => x.definition === text).length];
};
