// Synthesis lane · place-hold-rule-v1-a-row-the-corpus-lane-holds-at-a-place-rests-withheld-there-and-stands-at-every-other-place
// LEDGER: -
// no frame letter. The rule's own functions: they read the corpus lane's list
// of held places, a zone and the store, and write nothing.
//
// A ROW THE CORPUS LANE HOLDS AT A PLACE RESTS WITHHELD THERE, AND STANDS AT
// EVERY OTHER PLACE (23 November 2026, ship 18).
//
// A row of English Wiktionary's translation tables names a spelling and no
// place. Where a dictionary the corpus lane holds lists the spelling as two
// or more words (Jastrow's own entries and numbering, Wiktionary's own
// Aramaic etymologies), the row may be right as its source's own word and
// wrong at a place whose word is another word written alike: «necromancy»
// under the Targum's word for «leader» at Judges 2:18. Neither the pointing
// nor the entry gate parts them in the Targum: the commentary zones carry no
// tag and no grade of a place. The lane read every row of the translation
// tables at every place of the Targum and the Zohar and gave its resting
// call, place by place (relay v221, data/held-places/): at a place it marks
// held at rest (Jastrow cites the very verse under another of the words, the
// points printed there belong only to another of them, or the row's word is
// cited only outside the place's corpus and another word in it), the row is
// kept off that place at rest; everywhere else it stands. Its two labelled
// branches (WIDE_HOLD, and the corpus hold on a points tie) are off at rest,
// and nothing is held by them: turning one on is the lane's call.
//
// HOW THE PAGE KEEPS IT, as the names gate keeps a name's row off a word that
// is not a name (names-gate-rule-v1): a fact of the row and a fact of the
// place, both data, and a row withheld at that place only.
//
//   ON THE ZONE   the word of a held place carries ph: the rows held there,
//                 each [m, words, the lane's class], and the line the place
//                 reads without them (g: the first reading of the key's pool
//                 less those rows, in the store's own order, or null where
//                 none is left). tools/apply-held-places-v1.mjs writes it on
//                 every round, after the commentary's line is read again.
//   THE LINE      at the place, g, under every switch: a commentary's line is
//                 drawn once from its zone, and no switch repaints it (the
//                 source switches and the pointing never moved one either).
//   THE CARD      at rest («only this pointing»), the held rows never enter
//                 the word's pool there and are counted on the card, as the
//                 names gate's are; under «keep» and «the letters only» they
//                 stand, as every gate of a place lifts there.
//
// A place is found by its row (m, key and words), its work and its verse
// unit: the lane's token row is its own edition's, and our commentary may be
// another edition, so it is never read. Where the key stands more than once
// in our verse, every one is held if the lane holds every place of that row
// in the verse; else they are matched in order where the lane counts as many
// as we do, and refused where it does not.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import { readPinned, readPinnedLines, PinFault } from "./pinned-v1.mjs";

export const PLACE_HOLD_RULE_ID = "place-hold-rule-v1-a-row-the-corpus-lane-holds-at-a-place-rests-withheld-there-and-stands-at-every-other-place";
export const HELD_PLACES_HOME = "data/held-places";
export const HELD_PLACES_TOOL = "tools/apply-held-places-v1.mjs";
/** The field a held place's word carries. */
export const PLACE_HOLD_FIELD = "ph";
const SEP = "\u0001";

/** The pin and its list, every file the bytes the pin names; throws PinFault in words. */
export const readHeldPlaces = (k3) => {
  const home = join(k3, HELD_PLACES_HOME);
  const pinPath = join(home, "PIN.json");
  if (!existsSync(pinPath)) throw new PinFault(`the pin of the held places is not here (${HELD_PLACES_HOME}/PIN.json)`);
  const pin = JSON.parse(readFileSync(pinPath, "utf8"));
  if (pin.schema_version !== "HELD_PLACES_PIN_V1" || pin.rule_id !== PLACE_HOLD_RULE_ID) throw new PinFault(`${HELD_PLACES_HOME}/PIN.json is not a pin of the held places (HELD_PLACES_PIN_V1 under ${PLACE_HOLD_RULE_ID})`);
  const dir = join(home, pin.folder);
  for (const k of ["rule", "answer", "receipt", "verify_receipt", "known_misfires", "two_rows", "strike_list"]) if (pin[k]) readPinned(join(dir, pin[k].file), pin[k], `${pin.folder}/${pin[k].file}`);
  const places = readPinnedLines(join(dir, pin.places.file), pin.places, `${pin.folder}/${pin.places.file}`);
  const hr = pin.held_at_rest || {};
  if (hr.field !== "at_rest" || hr.value !== "held") throw new PinFault("the pin does not say which field and value of the list hold a place at rest");
  for (const [i, p] of places.entries()) if (!p || typeof p.m !== "string" || typeof p.key !== "string" || typeof p.route !== "string" || typeof p.work !== "string" || typeof p.unit !== "string" || typeof p.class !== "string" || typeof p.at_rest !== "string" || !Array.isArray(p.branches))
    throw new PinFault(`${pin.places.file} line ${i + 1} does not name its row, work, verse unit, class, resting call and branches`);
  const held = places.filter((p) => p[hr.field] === hr.value);
  if (held.length !== hr.places) throw new PinFault(`the list holds ${held.length} places at rest, and the pin says ${hr.places}`);
  return { pin, places, held };
};

/** The works this tree serves the lane's zones in: each commentary zone's works (its file), and the Tikkunei Zohar's book zone. */
export const servedWorks = (zonesDir) => {
  const out = new Map();
  for (const f of readdirSync(zonesDir).filter((x) => x.endsWith(".commentary.bin") && !x.startsWith("fixture-")).sort()) {
    const z = JSON.parse(gunzipSync(readFileSync(join(zonesDir, f))).toString("utf8"));
    for (const w of z.works || []) out.set(w.id, { file: f, kind: "commentary" });
  }
  if (existsSync(join(zonesDir, "tikkunei-zohar.bin"))) out.set("kabbalah/tikkunei-zohar", { file: "tikkunei-zohar.bin", kind: "book" });
  return out;
};

/** The list's places gathered by work, verse unit and key: each with the rows held there and the lane's places of those rows in the verse. */
export const heldGroups = ({ places, held }) => {
  const groups = new Map();
  for (const p of held) {
    const id = [p.work, p.unit, p.key].join(SEP);
    if (!groups.has(id)) groups.set(id, { work: p.work, unit: p.unit, key: p.key, zone: p.zone, rows: new Map() });
    const rid = [p.m, p.route].join(SEP);
    const g = groups.get(id);
    if (!g.rows.has(rid)) g.rows.set(rid, { m: p.m, route: p.route, cls: p.class, held: [], all: [] });
    const r = g.rows.get(rid);
    if (r.cls !== p.class) r.cls = [...new Set([...String(r.cls).split(" "), p.class])].sort().join(" ");
    r.held.push(p.row);
  }
  for (const p of places) {
    const g = groups.get([p.work, p.unit, p.key].join(SEP));
    const r = g && g.rows.get([p.m, p.route].join(SEP));
    if (r) r.all.push(p.row);
  }
  for (const g of groups.values()) for (const r of g.rows.values()) { r.held.sort((a, b) => a - b); r.all.sort((a, b) => a - b); }
  return groups;
};

/** The words of a commentary zone's verse unit of one work that stand under a key: plain words (no halves, no mark), in order. */
export const wordsOfKeyIn = (zone, work, unit, key) => {
  const at = Object.values(zone.units || {}).flatMap((u) => (u.section || []).map((e) => ({ e, u })));
  const workAt = (zone.works || []).findIndex((w) => w.id === work);
  const entries = at.filter(({ e }) => e && e.unit === unit && (e.work ?? 0) === workAt);
  const hits = [];
  for (const { e } of entries) (e.words || []).forEach((w, i) => { if (w && !w.mark && !Array.isArray(w.w) && w.k === key) hits.push({ entry: e, i, word: w }); });
  return { entries: entries.length, hits };
};

/** Which of our words in the verse each held row is held at: every one where the lane holds every place of the row in
 *  the verse; else by order where the lane counts as many places as we carry; else a fault in words. */
export const matchHeld = (g, hits) => {
  const out = new Map();   // index into hits -> rows held there
  for (const r of g.rows.values()) {
    let at;
    if (r.held.length === r.all.length) at = hits.map((_, j) => j);
    else if (r.all.length === hits.length) at = r.held.map((row) => r.all.indexOf(row));
    else return { fault: `the lane holds ${r.held.length} of its ${r.all.length} places of «${r.route}» in this verse, and our verse carries the key ${hits.length} times: which is which is not said` };
    for (const j of at) (out.get(j) || out.set(j, []).get(j)).push(r);
  }
  return { at: out };
};

/** Whether a store row is one of the rows held at a place (its source and its words). */
export const isHeldRow = (row, rows) => rows.some((r) => String(row[3]) === r.m && row[1] === r.route);

/** The line a held place reads: the first reading of the key's pool less the held rows, in the store's own order (oldest
 *  first: zone-gloss-rule), or null where none is left. `store` is tools/gloss-store-v1.mjs's reader, opened as the
 *  line of the zone is read (regloss-zone). */
export const lineUnderHold = (store, key, rows) => {
  const all = store.routesFor(key) || [];
  const pool = store.readingPool(all.filter((row) => !isHeldRow(row, rows)), "oldest");
  return pool.length ? pool[0].text : null;
};

/** What a held place's word carries: the rows held there, each [m, words, class], in order, and its line. */
export const placeHoldOf = (rows, g) => ({ r: [...rows].sort((a, b) => (a.m + SEP + a.route < b.m + SEP + b.route ? -1 : 1)).map((r) => [r.m, r.route, r.cls]), g });
