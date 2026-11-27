// Read-only: every name a card can carry and the label the catalog gives it; which labels two names share (a chain
// link names its source by the label's fingerprint alone, so two sources of one label are one link source); and which
// family of the record of dictionary kinds each name stands in. Writes labels.tsv beside this script.
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const S = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad";
const R = join(S, "base/reader");
const OUT = dirname(fileURLToPath(import.meta.url));
const { labelsFor } = await import(join(R, "tools/card-readings-v1.mjs"));
const labels = labelsFor(R);
const kinds = JSON.parse(readFileSync(join(R, "data/dictionary-kinds-v1.json"), "utf8"));
console.log("kinds keys", Object.keys(kinds));
const store = JSON.parse(readFileSync(join(R, "data/route-store/index.json"), "utf8"));
console.log("store keys", Object.keys(store));
const ms = store.m_sources;
console.log("m_sources", Object.keys(ms).length, JSON.stringify(Object.entries(ms)[0]).slice(0, 600));
// families
const fams = kinds.families || kinds.dictionaries || kinds.entries || null;
console.log("family sample", JSON.stringify(fams ? (Array.isArray(fams) ? fams[0] : Object.entries(fams)[0]) : Object.keys(kinds)).slice(0, 800));
console.log("rests_off", JSON.stringify(kinds.rests_off).slice(0, 1500));
const byLabel = new Map();
for (const [id, l] of labels.byId) (byLabel.get(l) || byLabel.set(l, []).get(l)).push(id);
const rows = [["id", "label", "source_key", "license", "shares_label_with"]];
for (const [id, l] of labels.byId) rows.push([id, l, (ms[id] || {}).key || (ms[id] || {}).source_key || "", (ms[id] || {}).licensePosture || "", byLabel.get(l).filter((x) => x !== id).join(" ")]);
writeFileSync(join(OUT, "labels.tsv"), rows.map((r) => r.join("\t")).join("\n") + "\n");
console.log("names", labels.byId.size, "labels", byLabel.size);
for (const [l, ids] of byLabel) if (ids.length > 1) console.log("SHARED", JSON.stringify(l), ids.join(" "));
// labels one of which another ends with after " · " (a title is read by the longest label it ends in)
for (const a of labels.known) for (const b of labels.known) if (a !== b && a.endsWith(` · ${b}`)) console.log("SUFFIX", JSON.stringify(a), "ends in", JSON.stringify(b));
