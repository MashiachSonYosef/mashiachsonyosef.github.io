// Each commentary sidecar in the tree: the bytes of the work zone it says it was built from, against the
// store record's pin for that zone today and the backup manifest's pin. Read-only.
// node sidecar-sources.mjs <reader dir> <manifest.json>
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [R, MAN] = process.argv.slice(2);
const pins = JSON.parse(readFileSync(join(R, "data", "zone-store-v1.json"), "utf8")).pins;
const man = JSON.parse(readFileSync(MAN, "utf8")).pins;
let asPin = 0, asBackup = 0, neither = 0, n = 0;
for (const f of readdirSync(join(R, "data", "zones")).filter((x) => x.endsWith(".commentary.bin")).sort()) {
  const c = JSON.parse(gunzipSync(readFileSync(join(R, "data", "zones", f))).toString("utf8"));
  const per = (((c.emitted_from || {}).alignment || {}).per_work || []);
  for (const [i, w] of ((((c.emitted_from || {}).sources || {}).works) || []).entries()) {
    n += 1;
    const name = `${w.slug}.bin`;
    const p = pins[name], m = man[name];
    const how = p && p.sha256 === w.sha256 ? "the pin" : m && m.sha256 === w.sha256 ? "the backup" : "neither";
    if (how === "the pin") asPin += 1; else if (how === "the backup") asBackup += 1; else neither += 1;
    console.log(`${f.replace(".commentary.bin", "").padEnd(14)} ${w.slug.padEnd(34)} built from ${String(w.sha256).slice(0, 12)} = ${how} · pin ${p ? p.sha256.slice(0, 12) : "none"} · backup ${m ? m.sha256.slice(0, 12) : "none"} · units ${per[i] ? per[i].commentary_units : "?"} attached ${per[i] ? per[i].attached : "?"}`);
  }
}
console.log(`${n} work zones · built from the pinned bytes ${asPin} · from the backup's bytes ${asBackup} · neither ${neither}`);
