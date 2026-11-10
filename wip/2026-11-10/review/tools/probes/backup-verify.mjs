// Bins downloaded from the shelf backup, each re-hashed against the backup's own manifest, the store
// record's seal today, and (for a commentary's zone) the count of units the sidecar in the tree attached.
// Read-only. node backup-verify.mjs <reader dir> <manifest.json> <dir of downloaded bins>
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [R, MAN, DIR] = process.argv.slice(2);
const man = JSON.parse(readFileSync(MAN, "utf8")).pins;
const pins = JSON.parse(readFileSync(join(R, "data", "zone-store-v1.json"), "utf8")).pins;
const heldPath = join(R, "data", "zone-store-held-v1.json");
const held = existsSync(heldPath) ? JSON.parse(readFileSync(heldPath, "utf8")).pins : {};
const sealed = { ...held, ...pins };
let asManifest = 0, asSeal = 0, n = 0;
for (const f of readdirSync(DIR).filter((x) => x.endsWith(".bin")).sort()) {
  const b = readFileSync(join(DIR, f));
  const h = createHash("sha256").update(b).digest("hex");
  n += 1;
  const m = man[f] && man[f].sha256 === h && man[f].bytes === b.length;
  const s = sealed[f] && sealed[f].sha256 === h;
  if (m) asManifest += 1; if (s) asSeal += 1;
  const z = JSON.parse(gunzipSync(b).toString("utf8"));
  console.log(`${f.padEnd(40)} ${b.length} bytes · manifest ${m ? "exact" : "DIFFERS"} · today's seal ${s ? "exact" : "differs"} · ${(z.sections || []).length} units`);
}
console.log(`${n} bins · ${asManifest} are the manifest's bytes · ${asSeal} are today's seal`);
