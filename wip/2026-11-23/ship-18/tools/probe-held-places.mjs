// read-only probe: the lane's places of the held keys against our commentary zones (reads a tree and the lane's list)
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [TREE, PLACES] = process.argv.slice(2);
const rows = readFileSync(PLACES, "utf8").trim().split("\n").map((l) => JSON.parse(l));
const Z = join(TREE, "data", "zones");
const byWork = new Map();
for (const f of readdirSync(Z).filter((x) => x.endsWith(".commentary.bin"))) {
  const z = JSON.parse(gunzipSync(readFileSync(join(Z, f))).toString("utf8"));
  for (const w of z.works) byWork.set(w.id, { f, z });
}
const heldKeys = new Set(rows.filter((r) => r.at_rest === "held").map((r) => `${r.m}|${r.key}|${r.route}`));
const placesOfUnit = new Map();
for (const r of rows) { const u = `${r.work}|${r.unit}|${r.key}`; (placesOfUnit.get(u) || placesOfUnit.set(u, []).get(u)).push(r); }
// every held place in a served work
for (const r of rows.filter((r) => r.at_rest === "held")) {
  const s = byWork.get(r.work);
  if (!s) { continue; }
  let hits = [];
  for (const u of Object.values(s.z.units)) for (const e of u.section || []) if (e.unit === r.unit) (e.words || []).forEach((w, i) => { if (w.k === r.key) hits.push({ i, s: w.s }); });
  const lane = placesOfUnit.get(`${r.work}|${r.unit}|${r.key}`);
  console.log(["HELD", r.route, r.work.split("/")[1], r.unit, r.form_as_written, `ours=${hits.length}`, hits.map((h) => h.i + ":" + h.s).join(" "), `lane=${lane.length}`, lane.map((x) => x.row + ":" + x.form_as_written + ":" + x.at_rest + "/" + x.m + "/" + x.route).join(" ")].join("\t"));
}
// every place in our commentary zones of a key of a held row, the verse not held by the lane
const keysHeld = new Map();
for (const r of rows.filter((r) => r.at_rest === "held")) keysHeld.set(r.key, r);
for (const [id, { f, z }] of byWork) for (const u of Object.values(z.units)) for (const e of u.section || []) (e.words || []).forEach((w, i) => {
  if (!keysHeld.has(w.k)) return;
  const lane = rows.filter((r) => r.work === id && r.unit === e.unit && r.key === w.k);
  if (lane.some((x) => x.at_rest === "held")) return;
  console.log(["OTHER", f, e.unit, i, w.s, w.k, lane.length ? lane.map((x) => x.route + ":" + x.class).join(" ") : "(no lane place)"].join("\t"));
});
