// What was found on 10 November 2026 about where the held bins' bytes stand, written into the store
// record once. emit-zone-store-v1 carries `held_off_the_door.recorded` forward untouched from then on.
// Run before the first emit under the gate. node 17-shelf-record.mjs <reader dir>
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const R = process.argv[2];
const P = join(R, "data", "zone-store-v1.json");
const rec = JSON.parse(readFileSync(P, "utf8"));
rec.held_off_the_door = {
  ...(rec.held_off_the_door || {}),
  recorded: {
    on: "2026-11-10",
    last_sealed: "3,442 of the held seals were written on 17 October 2026, when a source was struck and the whole shelf was re-projected and sealed again on the build machine (the store record of that day stands in the archived tree at commit 6a3f532e10bb6f2e6d083a14fe7f36e9adee940d). The other 6 read as they read on 28 September 2026.",
    the_backup: {
      where: "the private store, serving-lane/shelf/zones/, one object a bin, with serving-lane/shelf/MANIFEST-shelf.json",
      manifest_sha256: "0087875572b8e0ac47d4d49f658339efc593c5e95bdafc1eb0c28848b6991f05",
      written: "2026-09-28",
      objects: 3594,
      bytes: 638768175,
      holds: "every held bin by name, as it stood on 28 September 2026",
    },
    where_the_sealed_bytes_stand: "6 of the 3,448 held seals are the backup's bytes. The other 3,442 name bytes that stood on the build machine's disk and nowhere else: that machine has been reset, the backup was not written again after 28 September, and a bin the gate does not serve is in no commit. No copy of those bytes is known to this lane. The works themselves are whole in the backup as they stood on 28 September.",
    how_this_was_read: "the store's listing and the backup's manifest against these seals, and the store record at six commits of the archived tree. All 3,594 objects of the listing have the byte count the manifest gives; 21 of them (the zones the commentary sidecars were built from) were downloaded and hashed, and all 21 are the manifest's bytes. The rest were not downloaded.",
    owed: "the owner's ruling on where the shelf's other works serve from (asked 23 October 2026), and on whether the held seals are read again off the backup",
  },
};
writeFileSync(P, JSON.stringify(rec, null, 1) + "\n");
console.log("zone-store-v1.json: what is known of the held bins' bytes, recorded");
