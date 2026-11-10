// The word places the corpus lane's lattice grades that a build's sidecars do not carry: by book, verse and surface, with why.
// node lattice-places-not-projected.mjs <lattice dir> <zones dir>
// Reads positions-<book>-v12.jsonl.gz and <book>.lattice.bin and <book>.bin for every book with a sidecar. Nothing is written.
import { createReadStream, readFileSync, readdirSync, existsSync } from "node:fs";
import { createGunzip, gunzipSync } from "node:zlib";
import { createInterface } from "node:readline";
import { join } from "node:path";
const [lattice, zones] = process.argv.slice(2);
const read = (f) => JSON.parse(gunzipSync(readFileSync(join(zones, f))).toString("utf8"));
let places = 0, missing = 0;
const surfaces = new Set(), why = {};
for (const f of readdirSync(zones).filter((x) => x.endsWith(".lattice.bin")).sort()) {
  const book = f.replace(".lattice.bin", "");
  const pos = join(lattice, `positions-${book}-v12.jsonl.gz`);
  if (!existsSync(pos)) continue;
  const side = read(f), grades = side.grades, routes = side.routes || {};
  const zone = read(`${book}.bin`);
  const inZone = new Map();   // verse label -> set of pointed surfaces the zone carries there
  for (const sec of zone.sections || []) { const s = new Set(); for (const w of sec.words || []) { if (w && w.s) s.add(w.s); for (const h of (w && Array.isArray(w.w) ? w.w : [])) if (h && h.s) s.add(h.s); } inZone.set(sec.label, s); }
  const rl = createInterface({ input: createReadStream(pos).pipe(createGunzip()), crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line) continue;
    const p = JSON.parse(line);
    if (p.c0 !== "ON") continue;
    for (const m of p.megacompspan || []) {
      if (!m.route_grades) continue;
      places += 1;
      if (grades[m.surface] && routes[m.key]) continue;
      missing += 1; surfaces.add(`${book}\u0001${m.surface}`);
      const reason = !grades[m.surface] ? (!(inZone.get(p.ref) || new Set()).has(m.surface) ? "the zone has no word so pointed in that verse" : "the zone has the word; the sidecar has no record of it") : "the sidecar has the surface but no cards for its key";
      why[reason] = (why[reason] || 0) + 1;
      if (missing <= 30) console.log(`  ${book} ${p.ref} ${m.surface} (key ${m.key}) · ${reason} · cards the lattice names here: ${JSON.stringify(m.route_grades.names_this_verse)}`);
    }
  }
}
console.log(`${places.toLocaleString("en-US")} graded word places in the lattice · ${missing} of them not carried by the sidecars · ${surfaces.size} spellings`);
console.log(JSON.stringify(why));
