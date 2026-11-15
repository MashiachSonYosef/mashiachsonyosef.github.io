// Synthesis lane · the corpus lane's map of pointer readings, laid together from its relays in one place
// LEDGER: -
// no frame letter. It reads the pinned map and writes nothing.
//
// THE MAP OF POINTER READINGS IS ONE MAP, LAID TOGETHER IN ONE PLACE.
//
// The corpus lane sent its map of the readings that point to another entry
// whole once (relay v175, map v1.3) and since sends only the lines that
// change (relay v191, map v1.4: 682 whole lines, each carrying `line`, its
// number in the map). The tree keeps each relay's files byte for byte in the
// lane's own folder, named in data/pointer-entries/PIN.json, one entry per
// relay. The bake of the map the card reads and the check that judges it both
// read the map through here, so the lines are never laid two ways.
//
//   pointerMap(dir) -> { lines, relays, base_sha256, changes_sha256, assembled_sha256 }
//     lines      one parsed value per line of the map, in the base's order
//     relays     per relay, in the pin's order: { relay, of, letter,
//                letter_sha256, folder, file (the map or the changes, as the
//                record names it), files (every file the pin names for it:
//                JSON parsed, JSON lines parsed, any other kept as bytes) }
//     base_sha256       the whole map the first relay sent (the owner's
//                       rulings name the map by it)
//     changes_sha256    the changed lines of each later relay, in the order laid
//     assembled_sha256  the map as laid, which the pin names (`assembled`)
//
// REFUSED (PinFault, said in words) when: a file is not the bytes its pin
// names; a changed line names a number outside the map, or one its relay
// names twice; a changed line differs from the line it replaces outside
// `form_of` (the lane changes the resolution only, and the key order stays),
// or is the same in `form_of` too; or the map so laid is not the bytes the
// pin names for it: each line one JSON value, newline-terminated, as the lane
// writes its maps.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readPinned, readPinnedLines, sha256Of, PinFault } from "./pinned-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
export const POINTER_ENTRIES_DIR = join(HERE, "..", "data", "pointer-entries");
export const POINTER_ENTRIES_HOME = "reader/data/pointer-entries";   // the same folder as a record names it

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
// a line with its resolution set aside, its keys in their order
const outsideFormOf = ({ form_of, ...rest }) => rest;
const isPinEntry = (x) => !!x && typeof x === "object" && typeof x.file === "string" && typeof x.sha256 === "string";

export const pointerMap = (dir = POINTER_ENTRIES_DIR) => {
  const pinPath = join(dir, "PIN.json");
  const pin = JSON.parse(readFileSync(pinPath, "utf8"));
  const [base, ...later] = Array.isArray(pin.relays) ? pin.relays : [];
  if (pin.schema_version !== "POINTER_ENTRIES_PIN_V2" || !base || !isPinEntry(base.map) || later.some((r) => !isPinEntry(r.changes)) || !pin.assembled)
    throw new PinFault(`the pin names no base map, a later relay with no changes, or no map as laid (${pinPath}: POINTER_ENTRIES_PIN_V2 is the first relay's map, then each later relay's changed lines)`);
  const relays = pin.relays.map((r) => {
    const files = {};
    for (const [name, entry] of Object.entries(r)) {
      if (!isPinEntry(entry)) continue;
      const args = [join(dir, r.folder, entry.file), entry, `${r.folder}/${entry.file}`];
      files[name] = "lines" in entry ? readPinnedLines(...args) : /\.json$/u.test(entry.file) ? JSON.parse(readPinned(...args).toString("utf8")) : readPinned(...args);
    }
    const own = r.map || r.changes;
    return { relay: r.relay, of: r.of, letter: r.letter, letter_sha256: r.letter_sha256 || null, folder: r.folder,
      file: { file: `${POINTER_ENTRIES_HOME}/${r.folder}/${own.file}`, bytes: own.bytes, sha256: own.sha256, lines: own.lines }, files };
  });
  const lines = relays[0].files.map.slice();
  for (const r of relays.slice(1)) {
    const named = new Set();
    for (const [at, changed] of r.files.changes.entries()) {
      const { line: n, ...now } = changed;
      const where = `${r.file.file} line ${at + 1}`;
      if (!Number.isInteger(n) || n < 1 || n > lines.length) throw new PinFault(`${where} names line ${n}, outside the map's 1 to ${lines.length}`);
      if (named.has(n)) throw new PinFault(`${where} names line ${n} a second time`);
      named.add(n);
      const was = lines[n - 1];
      if (Object.keys(was).join("\u0001") !== Object.keys(now).join("\u0001") || !same(outsideFormOf(was), outsideFormOf(now)))
        throw new PinFault(`${where} (map line ${n}, ${was.key}) differs from the line it replaces outside form_of`);
      if (same(was.form_of, now.form_of)) throw new PinFault(`${where} (map line ${n}, ${was.key}) is the line it replaces`);
      lines[n - 1] = now;
    }
  }
  const bytes = Buffer.from(lines.map((l) => JSON.stringify(l)).join("\n") + "\n", "utf8");
  const assembled_sha256 = sha256Of(bytes);
  const want = pin.assembled;
  if (lines.length !== want.lines || bytes.length !== want.bytes || assembled_sha256 !== want.sha256)
    throw new PinFault(`the map as laid is not the bytes its pin names (${lines.length} lines, ${bytes.length} bytes, ${assembled_sha256}; the pin: ${want.lines}, ${want.bytes}, ${want.sha256})`);
  return { lines, relays, base_sha256: base.map.sha256, changes_sha256: later.map((r) => r.changes.sha256), assembled_sha256 };
};
