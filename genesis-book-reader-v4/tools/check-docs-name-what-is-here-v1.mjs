#!/usr/bin/env node
// check-docs-name-what-is-here-v1
//
// A document that tells you to run a tool the tree does not carry.
//
// GUARDS: doc-currency-rule-v1-an-undated-document-names-only-what-is-here
//
// On 2026-08-24 four tools were withdrawn for being proofs of concept over a
// single verse. synthesis/LANE.md went on naming all four, one of them as a
// command to type. LANE.md is not a record of a day — it has no date in its
// name and it reads as the current description of this lane — so a reader
// following it runs into a file that is not there, and nothing anywhere said
// so. Two other undated documents named two more tools that had already been
// gone for longer than anyone remembered.
//
// The rule this stands on is the one the filenames stand on: a name may carry
// a date exactly when the thing it names is a record of that day. So a dated
// document may name a tool that has since been withdrawn — that is what a
// record of a day is for — and an undated one may not.
//
//   node tools/check-docs-name-what-is-here-v1.mjs
//
// Not covered: whether what a document says about a tool that IS here is
// true. This only asks whether the thing exists.

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const RULE_ID = "doc-currency-rule-v1-an-undated-document-names-only-what-is-here";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`  ${ok ? "ok  " : "FAIL"}  ${n}${d ? `  ·  ${d}` : ""}`); };

// A document is a record of a day when it says so — in its filename, or in
// its own opening lines. Two of the documents here carry their date in the
// first heading and nowhere else ("Pruning plan — 2026-08-11", "Corpus repair
// spec — ... (2026-08-11, rev 3)"), which is the document declaring its own
// basis, and is the form this project asks for everywhere else.
const DATE = /\d{4}-\d{2}-\d{2}/u;
const isRecordOfADay = (name, body) =>
  DATE.test(name) || DATE.test(body.split("\n").slice(0, 6).join("\n"));

const docs = [];
const walk = (dir, rel = "") => {
  for (const e of readdirSync(dir)) {
    if (e === ".git" || e === "node_modules" || e === "build" || e === "site") continue;
    const p = join(dir, e);
    const r = rel ? `${rel}/${e}` : e;
    if (statSync(p).isDirectory()) walk(p, r);
    else if (/\.md$/u.test(e)) {
      const body = readFileSync(p, "utf8");
      docs.push({ path: p, rel: r, body, dated: isRecordOfADay(e, body) });
    }
  }
};
walk(ROOT);

console.log(`${RULE_ID}\n`);
console.log(`— every path a document names, asked of the directory —`);

// The extension must end where the path ends. Without the lookahead, data/
// commentary-names-v1.json matched as data/commentary-names-v1.js and was
// reported missing — a check inventing three findings out of its own regex,
// which is the second time this month a regex has handed me a false one.
const named = /(?:tools\/[A-Za-z0-9._-]+\.(?:mjs|sh)|data\/[A-Za-z0-9._-]+\.(?:js|json|csv)|synthesis\/[A-Za-z0-9._-]+\.(?:js|json|md))(?![A-Za-z0-9])/gu;
let asked = 0, dead = 0, withdrawnAndSaidSo = 0;
const rows = [];
for (const d of docs) {
  const lines = d.body.split("\n");
  for (const m of new Set(d.body.match(named) || [])) {
    asked += 1;
    if (existsSync(join(ROOT, m))) continue;
    // A document may keep naming something that has been withdrawn, as long
    // as the line naming it says so. The work a withdrawn rule described was
    // real and the history is worth keeping; what is not allowed is a reader
    // being told to run a file that is not there.
    const at = lines.findIndex((l) => l.includes(m));
    const nearby = [lines[at - 1] || "", lines[at] || "", lines[at + 1] || ""].join(" ");
    if (/withdrawn/iu.test(nearby)) { withdrawnAndSaidSo += 1; continue; }
    dead += 1;
    rows.push({ doc: d.rel, dated: d.dated, what: m });
  }
}
const undatedDead = rows.filter((r) => !r.dated);
const datedDead = rows.filter((r) => r.dated);

check("every path an undated document names is here", undatedDead.length === 0,
  undatedDead.length
    ? undatedDead.map((r) => `${r.doc} → ${r.what}`).join(" · ")
    : `${asked} path(s) named across ${docs.length} document(s), all present`);

console.log("");
console.log(`  documents            : ${docs.length} · ${docs.filter((d) => d.dated).length} dated, ${docs.filter((d) => !d.dated).length} undated`);
console.log(`  paths named          : ${asked}`);
console.log(`  named and not here   : ${dead} · ${undatedDead.length} in an undated document, ${datedDead.length} in a record of a day`);
if (datedDead.length) {
  console.log("");
  console.log("  A record of a day may name what has since been withdrawn. These are");
  console.log("  listed rather than failed, so the number is on the page:");
  for (const r of datedDead) console.log(`    ${r.doc} → ${r.what}`);
}
console.log("");
console.log(bad ? `  ${bad} FAILED` : "  all checks passed");
process.exit(bad ? 1 : 0);
