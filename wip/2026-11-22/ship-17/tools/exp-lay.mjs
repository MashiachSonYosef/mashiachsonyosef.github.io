// Experiment, 22 November 2026: lay v1.1's pieces by hand at named places of one zone, to read the page after. Undone by git.
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [R, LIST, BOOK, ...PLACES] = process.argv.slice(2);
const { writeZone } = await import(join(R, "tools/zone-post-build-v1.mjs"));
const { findBridgePlace } = await import(join(R, "tools/spelling-bridge-v1.mjs"));
const zp = join(R, "data/zones", `${BOOK}.bin`);
const zone = JSON.parse(gunzipSync(readFileSync(zp)).toString("utf8"));
const L = readFileSync(LIST, "utf8").split("\n").filter(Boolean).map((x) => JSON.parse(x));
for (const pl of PLACES) {
  const l = L.find((x) => x.book === BOOK && x.place === pl);
  const f = findBridgePlace(zone, { ref: l.ref, n: Number(pl.split(":")[2]), surface: l.lattice_v12.surface, key: l.key_ours });
  if (f.fault) { console.log(pl, f.fault); continue; }
  f.word.pg = l.pieces.map((p) => ({ k: p.consonants, g: p.english_tahot_as_written.trim(), s: "tahot", r: p.role }));
  console.log(pl, "laid at section", f.si, "entry", f.at, JSON.stringify(f.word.pg.map((x) => x.g)));
}
writeZone(zp, zone);
