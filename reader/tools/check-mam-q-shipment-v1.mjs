#!/usr/bin/env node
// The intake gate for a Q shipment: a site's delimiters must close.
//
// MAM writes a pair inside its own delimiters — round for the written form,
// square for the read — and those delimiters are how a reader tells the two
// apart. A branch whose bracket opens and never closes is not a branch: it
// is a fragment, and the rest of the reading is somewhere else. The first
// shipment carried 27 of them, every one a case where the read form is more
// than one word (one written word read as two), and the capture stopped at
// the space inside it — so the carrier was cut mid-pair, the surviving half
// kept an unclosed bracket, and a real word of scripture was left out of the
// site entirely.
//
// Nothing here judges MAM or the corpus lane. It judges a shipment against
// the one thing the shipment claims for itself: delimiters_preserved.
//
// Run: node tools/check-mam-q-shipment-v1.mjs --shipment <dir>
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const arg = (n, d = null) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
// A shipment is a thing that arrives, not a thing this tree keeps. With no
// --shipment there is nothing to judge and nothing to report — that is a skip,
// not a failure, and the suite runs this with no argument on every pass.
const DIR = arg("shipment");
if (!DIR) { console.log("SKIPPED — no --shipment given; there is no shipment on this disk to judge"); process.exit(3); }
const FILE = join(DIR, "batch1-complete-q-sites-v1.jsonl");
if (!existsSync(FILE)) { console.log(`SKIPPED — no shipment at ${FILE}`); process.exit(3); }

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

const rows = readFileSync(FILE, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
console.log(`— ${rows.length} sites —`);

// the delimiter each role is written inside, per MAM's own convention as the
// shipment itself states it
const PAIR = { KETIV: ["(", ")"], QERE: ["[", "]"] };
const balanced = (s, [o, c]) => s.includes(o) && s.includes(c) && s.indexOf(o) < s.lastIndexOf(c);

const truncated = [], leaked = [], notInCarrier = [];
for (const r of rows) {
  const p = r.presentation || {};
  const carrier = (p.exact_mam_carrier || {}).exact_presentation_text || "";
  for (const b of p.branch_selectors || []) {
    const d = PAIR[b.role];
    if (!d) continue;
    const text = b.exact_branch_presentation_text || "";
    // 1 · the branch closes its own delimiter
    if (!balanced(text, d)) truncated.push(`${r.unit_id} ${b.role} ${JSON.stringify(text)}`);
    // 2 · the lexical surface is what is INSIDE them — no delimiter survives
    const lex = b.exact_lexical_surface_inside_source_delimiters || "";
    if (/[()[\]]/.test(lex)) leaked.push(`${r.unit_id} ${b.role} ${JSON.stringify(lex)}`);
    // 3 · the branch stands inside the carrier, which is what makes Q a
    //     pointer rather than a second copy of the text
    if (text && !carrier.includes(text)) notInCarrier.push(`${r.unit_id} ${b.role}`);
  }
}

check("every branch closes the delimiter it opened",
  truncated.length === 0,
  truncated.length ? `${truncated.length} truncated — ${truncated.slice(0, 2).join(" · ")}` : "all closed");
check("no delimiter survives into the lexical surface",
  leaked.length === 0,
  leaked.length ? `${leaked.length} carry their bracket into the key — ${leaked.slice(0, 2).join(" · ")}` : "clean");
check("every branch stands inside its own carrier",
  notInCarrier.length === 0,
  notInCarrier.length ? `${notInCarrier.length} outside — ${notInCarrier.slice(0, 2).join(" · ")}` : "all inside");

// the sites the first two failures name are the same sites, and they are the
// multi-word readings; say so plainly so the repair is scoped, not hunted
const units = new Set([...truncated, ...leaked].map((s) => s.split(" ")[0]));
if (units.size) console.log(`\n  the affected sites, by unit (${units.size}):\n  ${[...units].join("\n  ")}`);

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
