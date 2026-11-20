# Ship 11: check-names-gate-v1 reads the rows' laws from the receipt of the list of rows (names v2, relay v198) and
# the places' laws from the receipt of the list of places (names v1, relay v177), each in the folder the pin gives it.
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def rep(old, new, n=1):
    global s
    assert s.count(old) == n, (s.count(old), old[:100])
    s = s.replace(old, new)
rep('''let theirs = null, places = [], rowLines = [];
{
  const faults = [];
  if (pin.schema_version !== "NAMES_PIN_V1" || !pin.place_names || !pin.name_rows || !pin.rule || !pin.receipt) faults.push("the pin names no lists, rule or receipt");
  else {
    try {
      readPinned(join(PINS, pin.folder, pin.rule.file), pin.rule, `${pin.folder}/${pin.rule.file}`);
      theirs = JSON.parse(readPinned(join(PINS, pin.folder, pin.receipt.file), pin.receipt, `${pin.folder}/${pin.receipt.file}`).toString("utf8"));
      places = readPinnedLines(join(PINS, pin.folder, pin.place_names.file), pin.place_names, `${pin.folder}/${pin.place_names.file}`);
      rowLines = readPinnedLines(join(PINS, pin.folder, pin.name_rows.file), pin.name_rows, `${pin.folder}/${pin.name_rows.file}`);
    } catch (e) { if (e instanceof PinFault) faults.push(e.message); else throw e; }
    const named = (f, p) => !!f && f.file === p.file && f.sha256 === p.sha256 && f.lines === p.lines && f.bytes === p.bytes;
    if (theirs && !named((theirs.places || {}).file, pin.place_names)) faults.push("the lane's receipt names another list of name places than the pin");
    if (theirs && !named((theirs.rows || {}).file, pin.name_rows)) faults.push("the lane's receipt names another list of name rows than the pin");
    if (theirs && (theirs.rule || {}).sha256 !== pin.rule.sha256) faults.push("the lane's receipt names another rule than the pin");
  }
  check("N1  the lists, their rule and their receipt are the bytes their pin names, and the corpus lane's receipt names both lists as the pin does", faults.length === 0,
    faults.length ? first(faults) : `relay ${pin.relay} · ${nf(pin.place_names.lines)} name places (${String(pin.place_names.sha256).slice(0, 12)}…) · ${nf(pin.name_rows.lines)} name rows (${String(pin.name_rows.sha256).slice(0, 12)}…)`);
}''', '''// THE TWO LISTS MAY COME FROM TWO RELAYS (ship 11, 20 November 2026). Names v2 (relay v198) takes the place of names
// v1's list of name rows, and «the places stay v1's» (the lane's letter). So the pin gives the list of places its own
// folder, rule and receipt where they are not the rows', and each list is held to the receipt of its own relay:
// theirs is the receipt beside the rows, theirsPlaces the one beside the places (the same file where the pin gives
// the places none of their own). The two receipts are of two shapes, read here by what each says:
//   the rows' list      names v1: rows.file          names v2: lists.name
//   the sources read    names v1: rows.m_ids_read    names v2: m_ids_read (by m id)
//   the rows by source  names v1: rows.name_rows     names v2: by_m[m].name
let theirs = null, theirsPlaces = null, places = [], rowLines = [];
const placesFolder = (pin.place_names && pin.place_names.folder) || pin.folder;
const placesRelay = (pin.place_names && pin.place_names.relay) || pin.relay;
{
  const faults = [];
  if (pin.schema_version !== "NAMES_PIN_V1" || !pin.place_names || !pin.name_rows || !pin.rule || !pin.receipt) faults.push("the pin names no lists, rule or receipt");
  else {
    const ownOfPlaces = !!(pin.place_names.rule || pin.place_names.receipt);
    if (ownOfPlaces && !(pin.place_names.rule && pin.place_names.receipt && pin.place_names.folder)) faults.push("the pin gives the list of places a rule or a receipt of its own, and not its folder, its rule and its receipt together");
    try {
      readPinned(join(PINS, pin.folder, pin.rule.file), pin.rule, `${pin.folder}/${pin.rule.file}`);
      theirs = JSON.parse(readPinned(join(PINS, pin.folder, pin.receipt.file), pin.receipt, `${pin.folder}/${pin.receipt.file}`).toString("utf8"));
      if (ownOfPlaces && pin.place_names.rule && pin.place_names.receipt) {
        readPinned(join(PINS, placesFolder, pin.place_names.rule.file), pin.place_names.rule, `${placesFolder}/${pin.place_names.rule.file}`);
        theirsPlaces = JSON.parse(readPinned(join(PINS, placesFolder, pin.place_names.receipt.file), pin.place_names.receipt, `${placesFolder}/${pin.place_names.receipt.file}`).toString("utf8"));
      } else theirsPlaces = theirs;
      places = readPinnedLines(join(PINS, placesFolder, pin.place_names.file), pin.place_names, `${placesFolder}/${pin.place_names.file}`);
      rowLines = readPinnedLines(join(PINS, pin.folder, pin.name_rows.file), pin.name_rows, `${pin.folder}/${pin.name_rows.file}`);
    } catch (e) { if (e instanceof PinFault) faults.push(e.message); else throw e; }
    const named = (f, p) => !!f && f.file === p.file && f.sha256 === p.sha256 && f.lines === p.lines && f.bytes === p.bytes;
    const rowsFileSaid = theirs ? (theirs.rows || {}).file || (theirs.lists || {}).name || null : null;
    if (theirsPlaces && !named((theirsPlaces.places || {}).file, pin.place_names)) faults.push("the lane's receipt names another list of name places than the pin");
    if (theirs && !named(rowsFileSaid, pin.name_rows)) faults.push("the lane's receipt names another list of name rows than the pin");
    if (theirs && (theirs.rule || {}).sha256 !== pin.rule.sha256) faults.push("the lane's receipt names another rule than the pin");
    if (theirsPlaces && theirsPlaces !== theirs && (theirsPlaces.rule || {}).sha256 !== pin.place_names.rule.sha256) faults.push("the lane's receipt of the places names another rule than the pin gives them");
  }
  check("N1  the lists, their rules and their receipts are the bytes their pin names, and the corpus lane's receipt of each list names it as the pin does", faults.length === 0,
    faults.length ? first(faults) : `${nf(pin.place_names.lines)} name places of relay ${placesRelay} (${String(pin.place_names.sha256).slice(0, 12)}…) · ${nf(pin.name_rows.lines)} name rows of relay ${pin.relay} (${String(pin.name_rows.sha256).slice(0, 12)}…)`);
}''')
rep('''const READ_FOR_NAMES = new Set(((theirs || {}).rows || {}).m_ids_read || []);''',
    '''const READ_FOR_NAMES = (() => { const r = ((theirs || {}).rows || {}).m_ids_read || (theirs || {}).m_ids_read || []; return new Set(Array.isArray(r) ? r : Object.keys(r)); })();''')
rep('''  const said = (theirs || {}).places || {};
  if (theirs && said.names !== places.length)''', '''  const said = (theirsPlaces || {}).places || {};
  if (theirsPlaces && said.names !== places.length)''')
rep('''  if (theirs && !same(Object.fromEntries(Object.entries(said.by || {}).sort()), Object.fromEntries(Object.entries(by).sort()))) faults.push(`by the sources that say so the list counts''',
    '''  if (theirsPlaces && !same(Object.fromEntries(Object.entries(said.by || {}).sort()), Object.fromEntries(Object.entries(by).sort()))) faults.push(`by the sources that say so the list counts''')
rep('''  const saidBy = (theirs && theirs.rows && theirs.rows.name_rows) || null;''',
    '''  const saidBy = (theirs && theirs.rows && theirs.rows.name_rows)
    || (theirs && theirs.by_m && typeof theirs.by_m === "object" ? Object.fromEntries(Object.entries(theirs.by_m).filter(([, v]) => v && v.name).map(([m, v]) => [m, v.name])) : null);''')
# N7: the addendum is of names v1, counted by names v1's receipt
rep('''  const said = (theirs && theirs.rows) || {};
  if (theirs && (!same(sorted(byKind["partly a name"])''', '''  // (the addendum is names v1's: its counts stand in names v1's receipt, the one beside the places)
  const said = (theirsPlaces && theirsPlaces.rows) || {};
  if (theirsPlaces && (!same(sorted(byKind["partly a name"])''')
open(p, "w", encoding="utf-8").write(s)
print("ok")
