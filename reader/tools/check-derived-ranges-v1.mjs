#!/usr/bin/env node
// The derived ranges record is exactly what the atlas derives, and every
// range the build already trusts — typed or ledgered — agrees with it to
// the row. Drift between the atlas and the records is an alarm, not a
// preference.
// GUARDS: derived-work-ranges-rule-v1-the-atlas-names-every-range-so-none-is-typed
// GUARDS: fleet-rule-v1-a-work-builds-the-day-its-shards-arrive-and-not-a-day-sooner
//
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

const RECORD = join(K3, "data", "derived-work-ranges-v1.json");
if (!existsSync(RECORD)) { console.log("no derived ranges record on disk — nothing to hold to the atlas"); process.exit(3); }

// 1 · regeneration is byte-identical: the record carries nothing typed
const fresh = join(tmpdir(), `derived-ranges-check-${process.pid}.json`);
execFileSync("node", [join(HERE, "emit-derived-work-ranges-v1.mjs"), "--out", fresh], { stdio: "pipe" });
check("regenerating the record from the atlas changes nothing",
  readFileSync(RECORD, "utf8") === readFileSync(fresh, "utf8"));

const rec = JSON.parse(readFileSync(RECORD, "utf8"));
const byId = new Map(rec.works.map((w) => [w.id, w]));

// 2 · every work the build plan trusts agrees with the derivation to the row
execFileSync("node", [join(HERE, "plan-build-v1.mjs"), "--out", "build/build-plan-v1.json",
  "--tsv", "build/build-plan-v1.tsv"], { stdio: "pipe", cwd: K3 });
const plan = JSON.parse(readFileSync(join(K3, "build", "build-plan-v1.json"), "utf8"));
let agreed = 0, missing = [];
for (const w of plan.works || []) {
  const id = w.work_id || w.id;
  const d = byId.get(id);
  if (!d) { missing.push(id); continue; }
  if (d.c0_first === w.c0_first && d.c0_last === w.c0_last) agreed += 1;
  else check(`  ${id} agrees`, false, `derived ${d.c0_first}-${d.c0_last} vs plan ${w.c0_first}-${w.c0_last}`);
}
check("every planned work's range agrees with the derivation",
  agreed === (plan.works || []).length - missing.length && missing.length === 0,
  `${agreed} agree${missing.length ? ` · not in atlas: ${missing.join(", ")}` : ""}`);

// 3 · the fleet plan stages and never serves: with no mirror, nothing stages
execFileSync("node", [join(HERE, "plan-fleet-v1.mjs")], { stdio: "pipe", cwd: K3 });
const fleet = JSON.parse(readFileSync(join(K3, "build", "fleet-plan-v1.json"), "utf8"));
check("the fleet plan covers the whole derived shelf",
  fleet.works.length === rec.works.length, `${fleet.works.length} of ${rec.works.length}`);
check("with no mirror here, no work claims staged shards",
  fleet.counts.SHARDS_STAGED === 0, `${fleet.counts.SHARDS_STAGED} staged`);
check("the plan's own works stand PLANNED, owned by the ordinary build",
  fleet.counts.PLANNED === (plan.works || []).length,
  `${fleet.counts.PLANNED} of ${(plan.works || []).length}`);

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
