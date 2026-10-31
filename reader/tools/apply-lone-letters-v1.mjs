#!/usr/bin/env node
// LEDGER: C0
// lone-letter-rule-v1-a-letter-the-print-leaves-standing-alone-is-printed-as-printed-and-marked-by-the-record-that-names-it
//
// A serve NDJSON holds one row per position of an edition. Some positions
// are one letter standing alone: the print's own citation numerals, "ibid"
// marks and severed letters. The frame's gate refuses a bare prefix letter
// as a torn word (C0.bare-prefix-letter) unless the record marks the letter.
// The corpus lane's record names each such position by its c0_numeric_id
// with the class it read for it; this tool carries that mark onto the row,
// byte for byte as the record gives it, and nothing else changes: not the
// surface, not the key, not the order. The zone builder carries letter_marks
// from a row onto its word (zone-lib carried), and the gate reads it there.
//
// Every record row must find its position, and the position's surface must
// equal the record's surface; a record row that finds no position, or two,
// or a different surface, refuses the whole run. The record is named and
// hashed into the serve's provenance so the zone's receipts carry it.
//
// Run: node tools/apply-lone-letters-v1.mjs --serve <serve ndjson> --marks <record jsonl> --out <serve ndjson>
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : null; };
const SERVE = arg("serve"), MARKS = arg("marks"), OUT = arg("out");
const die = (code, why) => { console.error(`${code}: ${why}`); process.exit(1); };
for (const [k, v] of [["serve", SERVE], ["marks", MARKS], ["out", OUT]]) if (!v) die("MISSING_ARG", `--${k}`);

export const RULE = "lone-letter-rule-v1-a-letter-the-print-leaves-standing-alone-is-printed-as-printed-and-marked-by-the-record-that-names-it";
const sha256 = (b) => createHash("sha256").update(b).digest("hex");

const marksBytes = readFileSync(MARKS);
const marks = marksBytes.toString("utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const byId = new Map();
for (const m of marks) {
  const id = Number(m.c0_numeric_id ?? m.row);
  if (!Number.isInteger(id)) die("MARK_WITHOUT_ID", JSON.stringify(m).slice(0, 120));
  if (byId.has(id)) die("MARK_TWICE", String(id));
  byId.set(id, m);
}

const lines = readFileSync(SERVE, "utf8").split("\n");
if (lines[lines.length - 1] === "") lines.pop();
const provenance = JSON.parse(lines[0]);
if (!provenance.provenance) die("NOT_A_SERVE", "line 1 carries no provenance");
const found = new Set();
let marked = 0;
const out = [lines[0]];
for (let i = 1; i < lines.length; i += 1) {
  const r = JSON.parse(lines[i]);
  const m = byId.get(Number(r.c0_numeric_id));
  if (!m) { out.push(lines[i]); continue; }
  if (found.has(m.c0_numeric_id ?? m.row)) die("POSITION_TWICE", String(r.c0_numeric_id));
  if (String(r.exact_surface_form) !== String(m.surface)) die("SURFACE_DIFFERS", `${r.c0_numeric_id}: the serve writes ${JSON.stringify(r.exact_surface_form)}, the record ${JSON.stringify(m.surface)}`);
  if (Array.isArray(r.letter_marks) && r.letter_marks.length) die("ALREADY_MARKED", String(r.c0_numeric_id));
  found.add(Number(r.c0_numeric_id));
  r.letter_marks = [{
    kind: m.mark, class: m.class, shape: m.shape, printing: m.printing,
    ...(m.gate_line ? { gate_line: m.gate_line } : {}),
    record: MARKS.split("/").pop(), rule: RULE,
  }];
  marked += 1;
  out.push(JSON.stringify(r));
}
const missing = [...byId.keys()].filter((id) => !found.has(id));
if (missing.length) die("MARK_FINDS_NO_POSITION", `${missing.length} record rows name no position (first ${missing.slice(0, 5).join(", ")})`);
provenance.provenance.letter_marks = { rule: RULE, record: MARKS.split("/").pop(), sha256: sha256(marksBytes), rows: marks.length, marked };
out[0] = JSON.stringify(provenance);
writeFileSync(OUT, out.join("\n") + "\n");
console.log(`${OUT}: ${marked.toLocaleString()} positions marked of ${lines.length - 1} rows · record ${MARKS.split("/").pop()} ${sha256(marksBytes).slice(0, 12)} · ${marks.length} record rows, every one found once`);
