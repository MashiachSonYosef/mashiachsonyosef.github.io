#!/usr/bin/env node
// GUARDS: work-attachment-rule-v1-parallel-numbering-is-not-intent
//
// The record says what every work naming another work stands in. This asserts
// the record still describes the shelf, and that it has not quietly started
// claiming more than it measured.
//
// The three failures worth catching:
//
//   drift        a work appears on the shelf naming a base, and the record
//                does not know it — so the ledger describes a shelf that no
//                longer exists
//   invention    a relation typed as one of U's three when nothing said which.
//                "-on-" is written the same by a commentary and a translation,
//                so a row claiming commentary-of or translation-of must point
//                at the words that said so
//   overreach    V granted without intent shown. This is the whole ruling: a
//                commentary attaches at unit grain only when its catchwords
//                land where the attachment claims. Numbering that runs parallel
//                is not intent, and a V granted on it would be the proportional
//                pointing the owner refused
//
// Run: node tools/check-work-attachment-v1.mjs
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const REC = arg("record", join(K3, "data", "work-attachment-v1.json"));
const ZONES = arg("zones", join(K3, "data", "zones"));

if (!existsSync(REC)) { console.log(`SKIPPED — no record at ${REC}`); process.exit(3); }

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

const rec = JSON.parse(readFileSync(REC, "utf8"));
const rows = rec.pairs || [];
console.log(`— ${rec.rule_id} —`);

check("the record carries the ruling and whose it is",
  Boolean(rec.ruling && rec.ruled_by), rec.ruled_by ? "attributed" : "unattributed");

// 1 · drift — the shelf is the authority on what exists
const onShelf = existsSync(ZONES)
  ? readdirSync(ZONES).filter((f) => f.endsWith(".bin")).map((f) => f.replace(/\.bin$/, ""))
  : [];
const namesABase = onShelf.filter((id) => id.includes("-on-")).sort();
const inRecord = new Set(rows.map((r) => r.work));
const missing = namesABase.filter((id) => !inRecord.has(id));
const stale = rows.map((r) => r.work).filter((id) => !onShelf.includes(id));
check("every work on the shelf that names a base is in the record",
  missing.length === 0,
  missing.length ? `${missing.length} missing — ${missing.slice(0, 3).join(" ")}` : `${namesABase.length} works`);
check("  and the record names no work the shelf has dropped",
  stale.length === 0,
  stale.length ? `${stale.length} stale — ${stale.slice(0, 3).join(" ")}` : "none stale");

// 2 · invention — a relation is read from words or it is not read
const U_RELATIONS = ["edition-of", "translation-of", "recension-of", "commentary-of"];
const typedWithoutEvidence = rows.filter((r) => {
  const rel = r.U && r.U.relation;
  if (!rel || rel === "UNDETERMINED") return false;
  return !U_RELATIONS.includes(rel) || !String(r.U.relation_read_from || "").trim();
});
check("no relation is typed without the words that said so",
  typedWithoutEvidence.length === 0,
  typedWithoutEvidence.length
    ? typedWithoutEvidence.slice(0, 3).map((r) => `${r.work} = ${r.U.relation}`).join(" · ")
    : `${rows.filter((r) => r.U.relation !== "UNDETERMINED").length} typed, ${rows.filter((r) => r.U.relation === "UNDETERMINED").length} left undetermined`);

// 3 · overreach — V granted only on shown intent
const grantedWithoutIntent = rows.filter((r) => {
  const v = r.V || {};
  if (!v.granted) return false;
  const t = v.catchword_test || {};
  return !(t.confirm_the_claimed_unit > 0 && t.contradict_it === 0);
});
check("no V is granted without a catchword confirming the unit it claims",
  grantedWithoutIntent.length === 0,
  grantedWithoutIntent.length
    ? grantedWithoutIntent.map((r) => r.work).join(" ")
    : `${rows.filter((r) => r.V && r.V.granted).length} granted of ${rows.length}`);

// 4 · the numbering figure is recorded and carries its own worthlessness
const parallelWithoutWarning = rows.filter((r) => {
  const n = (r.V || {}).numbering_only;
  return n && !String(n.weight || "").includes("none");
});
check("  and where numbering runs parallel the record says that carries no weight",
  parallelWithoutWarning.length === 0,
  parallelWithoutWarning.length ? parallelWithoutWarning.map((r) => r.work).join(" ") : "said everywhere it applies");

// 5 · a shape verdict may not claim coverage without establishing the scheme
const coverageWithoutScheme = rows.filter((r) => {
  const s = (r.U || {}).shape || {};
  return s.coverage !== undefined && s.verdict !== "PARALLEL_BY_COUNT" && !s.label_overlap;
});
check("no coverage figure is given without the numbering having been established",
  coverageWithoutScheme.length === 0,
  coverageWithoutScheme.length
    ? coverageWithoutScheme.map((r) => r.work).join(" ")
    : "every coverage figure stands on a label check or an exact count");

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
