#!/usr/bin/env node
// GUARDS: ledger-index-rule-v1-the-writer-declares-which-letter-it-is-the-ledger-for
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// The question this answers is "are you losing stuff?" — asked when it became
// clear that two lanes write into one frame and neither could say which letter
// a given piece of work updates.
//
// The rule: a tool that writes a record into data/ declares which letter of
// the frame that record is the ledger for, in a "// LEDGER:" line in its own
// header. A tool that updates no letter declares "-" and says why. What is
// refused is silence — an undeclared writer is a fact changing hands with
// nothing saying whose fact it was.
//
// This recomputes the declarations from the tool sources rather than reading
// the emitted index, because a check that reads the artifact it is judging is
// judging its own output. The index is the convenience; the sources are the
// truth.
//
// Run: node tools/check-ledger-declared-v1.mjs
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readDeclaration, LEDGER_RULE_ID } from "./emit-ledger-index-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

console.log(`— ${LEDGER_RULE_ID} —\n`);

const frameFile = join(K3, "data", "frame-record-v1.js");
if (!existsSync(frameFile)) { console.log("SKIPPED — no frame record, so no letter list to check against"); process.exit(3); }
const win = {};
new Function("window", readFileSync(frameFile, "utf8"))(win);
const KNOWN = new Set(Object.keys(((win.FRAME_RECORD_V1 || {}).owner_stated_frame_2026_08_31 || {}).letters || {}));
check("the frame record names the letters a declaration may use", KNOWN.size > 0, `${KNOWN.size} letters`);

const tools = readdirSync(join(K3, "tools")).filter((f) => f.endsWith(".mjs")).sort();
const undeclared = [], unknown = [], claimed = new Set();
let declared = 0, noLetter = 0;
for (const f of tools) {
  const src = readFileSync(join(K3, "tools", f), "utf8");
  const writes = [
    ...[...src.matchAll(/data[/\\]([a-z0-9-]+\.json)/gi)].map((m) => m[1]),
    ...[...src.matchAll(/"data"\s*,\s*"([a-z0-9-]+\.json)"/gi)].map((m) => m[1]),
  ];
  const isWriter = /writeFileSync/.test(src) && writes.length > 0;
  const d = readDeclaration(src);
  if (!d) { if (isWriter) undeclared.push(f); continue; }
  declared += 1;
  if (d.updates_no_letter) noLetter += 1;
  for (const L of d.letters) if (!KNOWN.has(L)) unknown.push(`${f} declares "${L}"`);
  for (const w of writes) claimed.add(w);
  if (!d.why) undeclared.push(`${f} (declares letters, says nothing about why)`);
}

check("every tool that writes a record declares which letter it is the ledger for",
  undeclared.length === 0,
  undeclared.length ? undeclared.slice(0, 5).join(" · ") : `${declared} declared, ${noLetter} of them "no letter" with a reason`);

check("no declaration names a letter the frame does not carry",
  unknown.length === 0,
  unknown.length ? unknown.slice(0, 4).join(" · ") : `all letters drawn from the frame's own ${KNOWN.size}`);

// The other direction. A record with no writer in this tree is not
// automatically wrong — some arrive from the corpus lane — but it must be
// visible, because a record nobody here writes is a record nobody here can
// answer for.
const records = readdirSync(join(K3, "data")).filter((f) => f.endsWith(".json")).sort();
const unclaimed = records.filter((r) => !claimed.has(r));
console.log(`\n  ${records.length} records on the shelf · ${records.length - unclaimed.length} written by a declared tool here`);
if (unclaimed.length) {
  console.log(`  ${unclaimed.length} written by nobody in this tree — they arrive from elsewhere and this`);
  console.log("  lane cannot answer for them: " + unclaimed.join(", "));
}

console.log("\n  what this does not say: it indexes THIS lane. A letter with no tool here is not");
console.log("  a letter nobody keeps — the corpus lane keeps most of them.");

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
