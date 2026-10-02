#!/usr/bin/env node
// GUARDS: front-door-rule-v1-the-door-lists-what-the-zones-carry
//
// NOBODY WRITES THE SUFFIX LIST TWICE.
//
// A sidecar rides beside a book zone under the book's own slug and a suffix:
// <slug>.commentary.bin, <slug>.hoh.bin, <slug>.lattice.bin,
// <slug>.volume.bin. None of them is a work, and every tool that enumerates
// the shelf must skip all of them.
//
// The way a tool comes to skip three of four is not carelessness. It is that
// each tool kept its own copy of the list, every copy was right on the day it
// was written, and the fourth suffix arrived somewhere else. On 2026-09-14
// the gate itself was found doing this: tools/check-c0-refusals-v1.mjs named
// .commentary.bin alone, so the 39 lattice sidecars came onto the shelf as 39
// more zones for it to judge, and it counted 3,519 zones where 3,480 books
// stand. Nothing was published wrongly, because a sidecar reaches no stamp —
// but the gate had been asking a file with no C0 in it whether its C0 was
// refused, and no check said so.
//
// So the list lives in tools/zones-on-disk-v1.mjs, exported, and this check
// fails any tool that writes its own:
//
//   S1  EVERY SIDECAR ON THIS SHELF IS IN THE REGISTRY. Asked in that
//       direction, not the other: a suffix declared before its delivery
//       lands is fine and is how the hoh sidecar has stood for weeks, but a
//       suffix ON DISK that the registry does not know is a file every
//       enumeration in this tree is about to count as a book.
//   S2  no tool outside the registry EXCLUDES a sidecar by a suffix literal
//       of its own. Selecting sidecars of one kind by name is not the fault
//       and is most of what the sidecar checks do; excluding them from a
//       list of works is, because that list is the one that has to name all
//       four and is the one that named one.
//   S3  every sidecar on disk rides beside a zone that exists
//   S4  the gate judges books, not sidecars
//
// Run: node tools/check-sidecars-all-named-v1.mjs
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { SIDECAR_SUFFIXES, zonesOnDisk, baseOfSidecar } from "./zones-on-disk-v1.mjs";

const ZONES = process.env.ZONES_DIR || "data/zones";
const REGISTRY = "zones-on-disk-v1.mjs";

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const few = (l, n = 3) => l.slice(0, n).join(" · ");

const onDisk = existsSync(ZONES) ? readdirSync(ZONES) : [];
const counted = SIDECAR_SUFFIXES.map((s) => [s, onDisk.filter((f) => f.endsWith(s)).length]);
console.log(`— ${SIDECAR_SUFFIXES.length} sidecar suffix(es) in the registry · ${counted.map(([s, n]) => `${s} ${n}`).join(" · ")} —`);

// S1 -------------------------------------------------------------------------
// What IS a sidecar, asked of the directory: a .bin whose name is a zone's
// slug plus one more dotted segment. A slug never carries a dot, so the shape
// is unambiguous, and anything matching it that the registry does not know is
// the next .lattice.bin waiting to be miscounted.
const zones = new Set(zonesOnDisk(ZONES));
const known = new Set(SIDECAR_SUFFIXES);
const unregistered = new Set();
for (const f of onDisk) {
  if (!f.endsWith(".bin") || f.startsWith("fixture-")) continue;
  const m = /^(.*)(\.[^.]+\.bin)$/u.exec(f);
  if (!m || !zones.has(m[1]) || known.has(m[2])) continue;
  unregistered.add(m[2]);
}
const unlanded = counted.filter(([, n]) => n === 0).map(([s]) => s);
check("S1  every sidecar on this shelf is a suffix the registry knows",
  unregistered.size === 0,
  unregistered.size ? `${[...unregistered].join(" · ")} — on disk, in no list`
    : `${counted.reduce((t, [, n]) => t + n, 0)} sidecars in all${unlanded.length ? ` · ${unlanded.join(" and ")} declared, not yet landed` : ""}`);

// S2 -------------------------------------------------------------------------
// The fault shape is a NEGATED suffix test: !x.endsWith(".commentary.bin"),
// or a negated alternation over some of them. That is a tool saying "not a
// sidecar" while naming only the sidecars it happened to know. Asking FOR one
// kind by name — `bins.filter((f) => f.endsWith(".hoh.bin"))`, or opening
// `${slug}.commentary.bin` — is not the fault: that call means that suffix,
// and a check about the hoh sidecar has no business skipping the lattice.
const kinds = SIDECAR_SUFFIXES.map((s) => s.slice(1, -4)).join("|");
const NEG_LIT = new RegExp(`!\\s*[\\w.$()\\[\\]]+\\.endsWith\\(\\s*["'\`]\\.(${kinds})\\.bin`, "u");
const NEG_ALT = new RegExp(`!\\s*/[^/\\n]*\\\\?\\.\\((?:${kinds})(?:\\|(?:${kinds}))+\\)`, "u");
const offenders = [];
for (const f of readdirSync("tools").filter((x) => x.endsWith(".mjs") && x !== REGISTRY).sort()) {
  const src = readFileSync(join("tools", f), "utf8");
  for (const line of src.split("\n")) {
    // a comment is prose about the rule, not a use of it
    if (/^\s*(\/\/|\*)/u.test(line)) continue;
    if (NEG_LIT.test(line) || NEG_ALT.test(line)) { offenders.push(`${f}: ${line.trim().slice(0, 70)}`); break; }
  }
}
check(`S2  no tool excludes a sidecar by a suffix list of its own — they read ${REGISTRY}`,
  offenders.length === 0,
  offenders.length ? `${offenders.length} — ${few(offenders, 4)}` : "swept every tool");

// S3 -------------------------------------------------------------------------
const orphans = onDisk.filter((f) => baseOfSidecar(f)).filter((f) => !existsSync(join(ZONES, `${baseOfSidecar(f)}.bin`)));
check("S3  every sidecar rides beside a zone that exists",
  orphans.length === 0, orphans.length ? `${orphans.length} — ${few(orphans)}` : `${onDisk.filter((f) => baseOfSidecar(f)).length} accounted for`);

// S4 -------------------------------------------------------------------------
// The gate's own receipt, which is where this was found. A sidecar carries no
// C0 and the gate has nothing to ask it; if one appears in the judged list,
// some enumeration is still counting sidecars as books.
const RECEIPT = join(ZONES, "..", "serve-gate-receipt-v1.json");
if (!existsSync(RECEIPT)) {
  check("S4  the gate judges books, not sidecars", false, "no serve-gate-receipt-v1.json — no receipt is a refusal, never a pass");
} else {
  const r = JSON.parse(readFileSync(RECEIPT, "utf8"));
  const judged = [...(r.passed || []), ...(r.served || [])];
  const sidecars = judged.filter((s) => SIDECAR_SUFFIXES.some((x) => String(s).endsWith(x.replace(/\.bin$/u, ""))));
  const shelf = zonesOnDisk(ZONES).length;
  check("S4  the gate judges books, not sidecars",
    sidecars.length === 0 && r.zones_on_the_shelf === shelf,
    sidecars.length ? `${sidecars.length} sidecar(s) judged — ${few(sidecars)}`
      : `the receipt counts ${r.zones_on_the_shelf} on the shelf and the shelf holds ${shelf}`);
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
