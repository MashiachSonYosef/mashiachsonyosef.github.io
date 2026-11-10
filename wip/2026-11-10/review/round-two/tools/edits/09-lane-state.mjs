// The lane state says the round's day, not the clock, and says what is held off the door
// (the fifth reader's finding 10). built_at was the wall clock, so the record differed every round with
// nothing changed; the shelf block said "withheld: 0" beside a gate receipt that says 3,481 works on the shelf;
// the shelf was listed relative to wherever the tool was started from.
// node 09-lane-state.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "emit-lane-state-v1.mjs"), [
  [`// Run: node tools/emit-lane-state-v1.mjs [--out data/lane-state-v1.json]`,
   `// Run: node tools/emit-lane-state-v1.mjs --stamp YYYY-MM-DD [--out data/lane-state-v1.json]
//      (the round's day; the round passes it. Without it the record keeps the
//      day it already carries, so a run that changes nothing writes the same
//      bytes.)`],
  [`import { fileURLToPath } from "node:url";
import { zonesOnDisk, zonesServed, SIDECAR_SUFFIXES, baseOfSidecar } from "./zones-on-disk-v1.mjs";`,
   `import { fileURLToPath, pathToFileURL } from "node:url";
import { zonesOnDisk, zonesServed, SIDECAR_SUFFIXES, baseOfSidecar, ZONE_STORE_RECORD } from "./zones-on-disk-v1.mjs";`],
  [`import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";`, `import { readFileSync, writeFileSync, existsSync, readdirSync, realpathSync } from "node:fs";`],
  [`export const laneState = () => {
  const index = readJson(join(STORE, "index.json"));`,
   `// \`day\`: the round's stamp. A record of what is served carries the day of the
// round that wrote it, never the clock: the clock made this file differ on
// every round with nothing changed (in the twenty commits before 10 November
// 2026 that touched it, built_at was the only line that moved).
export const laneState = (day = null) => {
  const index = readJson(join(STORE, "index.json"));`],
  // the shelf, listed from this tree whatever directory the tool is started in
  [`  const onDisk = zonesOnDisk();
  const served = zonesServed();`,
   `  const onDisk = zonesOnDisk(ZONES);
  const served = zonesServed(ZONES);
  // what the shelf's own record says is held off the door (data/zone-store-v1.json,
  // written by tools/emit-zone-store-v1.mjs): the works built and sealed whose
  // files are not in this tree
  const storeRecord = readJson(join(ZONES, "..", ZONE_STORE_RECORD));
  const heldOff = (storeRecord && storeRecord.held_off_the_door) || null;`],
  [`    built_at: new Date().toISOString(),`,
   `    built_at: day,`],
  [`      zones_on_disk: onDisk.length,
      zones_served: served.length,
      withheld: onDisk.length - served.length,
      sidecars,`,
   `      zones_on_disk: onDisk.length,
      zones_served: served.length,
      withheld: onDisk.length - served.length,
      withheld_says: "works whose file is in this tree and which the gate does not serve",
      // read from the shelf's record, never counted here: the works the gate
      // does not serve are kept out of the published tree, so the directory
      // cannot say how many there are (until 10 November 2026 this block said
      // "withheld: 0" beside a gate receipt that counts 3,481 works)
      held_off_the_door: heldOff ? { zones: heldOff.zones ?? null, sidecars: heldOff.sidecars ?? null, record: \`reader/data/\${ZONE_STORE_RECORD}\`, says: "works built and sealed whose files are not in the published tree; the record seals them and says where their bytes stand" } : null,
      sidecars,`],
  [`      "that these numbers were true a minute ago. It is written by a build, and built_at is when",`,
   `      "that these numbers were true a minute ago. It is written by a round, and built_at is that round's day",`],
  [`if (import.meta.url === \`file://\${process.argv[1]}\`) {
  const state = laneState();
  writeFileSync(OUT, \`\${JSON.stringify(state, null, 1)}\\n\`);`,
   `// run as a program, not imported by the check: asked of the path itself (a
// path with a space or a link in it is still this file)
const startedHere = (() => { try { return !!process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href; } catch { return false; } })();
if (startedHere) {
  const given = arg("stamp", null);
  if (given !== null && !/^\\d{4}-\\d{2}-\\d{2}$/u.test(String(given))) { console.error("--stamp YYYY-MM-DD"); process.exit(2); }
  // no stamp: the day the record already carries stands (a run by hand that
  // changes nothing writes the same bytes); a record written before this
  // rule carries a clock time, and its day is kept
  const before = readJson(OUT);
  const day = given || (before && typeof before.built_at === "string" ? before.built_at.slice(0, 10) : null);
  if (!day) { console.error("no --stamp given and no record to keep the day of"); process.exit(2); }
  const state = laneState(day);
  writeFileSync(OUT, \`\${JSON.stringify(state, null, 1)}\\n\`);`],
  [`    + \`(\${(state.language_admission.routes_struck || 0).toLocaleString()} routes) · \``,
   `    + \`(\${(state.language_admission.routes_struck || 0).toLocaleString("en-US")} routes) · \``],
]);

// the check: the day is a day, and the held works are the shelf record's
edit(join(R, "tools", "check-lane-state-v1.mjs"), [
  [`check("S6  the shelf it reports is the shelf on disk",
  s.shelf.zones_on_disk === onDisk && s.shelf.zones_served === served && s.shelf.withheld === onDisk - served,
  \`\${s.shelf.zones_served} served of \${s.shelf.zones_on_disk} on disk\`);`,
   `check("S6  the shelf it reports is the shelf on disk",
  s.shelf.zones_on_disk === onDisk && s.shelf.zones_served === served && s.shelf.withheld === onDisk - served,
  \`\${s.shelf.zones_served} served of \${s.shelf.zones_on_disk} on disk\`);
// S6b · and what is held off the door is what the shelf's own record says,
// so a peer lane does not read "withheld 0" as "nothing is held"
{
  const recPath = join(ZONES, "..", "zone-store-v1.json");
  const rec = existsSync(recPath) ? JSON.parse(readFileSync(recPath, "utf8")) : null;
  const held = rec && rec.held_off_the_door ? rec.held_off_the_door : null;
  const said = s.shelf.held_off_the_door || null;
  check("S6b  the works held off the door are the shelf record's count, not a count of this directory",
    held ? !!said && said.zones === held.zones && said.sidecars === held.sidecars : said === null,
    held ? \`\${said ? said.zones : "nothing said"} held, the record says \${held.zones}\` : "the shelf's record holds nothing off the door, and the state says nothing");
}
// S6c · the day of the round, never the clock
check("S6c  built_at is the round's day, not a clock time",
  /^\\d{4}-\\d{2}-\\d{2}$/u.test(String(s.built_at || "")), String(s.built_at));`],
]);

// the round hands its day over
edit(join(R, "tools", "round-v1.sh"), [
  [`  node tools/emit-lane-state-v1.mjs > /dev/null`, `  node tools/emit-lane-state-v1.mjs --stamp "$STAMP" > /dev/null`],
]);
