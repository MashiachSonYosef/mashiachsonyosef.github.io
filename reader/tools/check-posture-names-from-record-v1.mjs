#!/usr/bin/env node
// GUARDS: licence-posture-name-rule-v1-the-record-names-the-licence
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// data/license-postures-v1.json is a projection of tools/declarations-v1.json.
// The emitter that writes it says so in its own words:
//
//   "One projection of tools/declarations-v1.json for the pages: per posture,
//    the declared name, whether export is permitted, what attribution is owed,
//    and the obligations that ride along. The reader fetches this file; the
//    door embeds it at build time. Neither re-derives any of it from the
//    letters of the posture's key — the record names the licence, or the key
//    is printed verbatim and the export is refused, which is the record's own
//    default for the undeclared."
//
// Why this rule exists: a page once guessed a license's name from its key.
// The guess chipped a WordNet license as "CC BY" and a dual offer that
// requires attribution as "Public Domain". A license is not a description of
// anything and does not bend to being described wrongly, so the name a page
// prints must be the name the record carries, and the file the page reads
// must be the record and nothing more. A projection that invents a posture,
// drops one, or renames one is a page guessing again, one step removed.
//
// The laws this check enforces, each read off the two files and nothing else:
//
//   L0  the record declares at least one posture, so the laws below judge
//       something; a record stripped of every licence is a broken record,
//       and a projection of it is not a clean pass but an empty one
//   L1  every posture the projection emits is one the declarations declare
//   L2  every posture the declarations declare is emitted, so none is dropped
//   L3  every emitted name is the declared name, character for character
//   L4  every emitted export flag and attribution is the declared one
//   L5  every emitted obligation list is the declared one, unchanged
//   L6  the projection's undeclared block quotes the record's own defaults
//   L7  the projection names the declarations it was derived from, and that
//       path resolves to the declarations under test
//   L8  re-projecting the declarations through the emitter yields a file that
//       is byte-identical to the one on disk
//
// L8 runs the real emitter to a scratch path with the same --declarations
// string the file records in derived_from, and compares bytes. That is the
// whole rule in one law: if nothing but the declarations went in, and the
// same emitter run twice gives the same bytes, then nothing in the file was
// typed, guessed, or hand-edited after the fact.
//
// What this check does NOT prove: that the reader or the door actually
// consults this file rather than the key when it prints a chip or gates an
// export. That is check-licence-names-v1's question. This one proves the
// file they are told to consult is the record, whole and unaltered.
//
// A fixture pointed at --postures must carry a derived_from that resolves,
// from the reader root, to the file passed as --declarations; L7 says so.
//
// Run: node tools/check-posture-names-from-record-v1.mjs [--declarations tools/declarations-v1.json]
//                                                        [--postures data/license-postures-v1.json]
//                                                        [--emitter tools/emit-license-postures-v1.mjs]
//                                                        [--scratch <dir for the re-projection>]
import { readFileSync, existsSync, mkdtempSync, mkdirSync, realpathSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve, relative, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const DECL = arg("declarations", join(K3, "tools", "declarations-v1.json"));
const POSTURES = arg("postures", join(K3, "data", "license-postures-v1.json"));
const EMITTER = arg("emitter", join(K3, "tools", "emit-license-postures-v1.mjs"));
const SCRATCH = arg("scratch", "");

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

if (!existsSync(DECL)) { console.log(`SKIPPED — no declarations record at ${DECL}`); process.exit(3); }
if (!existsSync(POSTURES)) { console.log(`SKIPPED — no postures projection at ${POSTURES}; run tools/emit-license-postures-v1.mjs`); process.exit(3); }
if (!existsSync(EMITTER)) { console.log(`SKIPPED — no emitter at ${EMITTER}, so the projection cannot be re-run`); process.exit(3); }

// The two files, read once. The declarations are the record; the projection
// is what the pages are handed. Every law below is a comparison of the two.
const decl = JSON.parse(readFileSync(DECL, "utf8"));
const projBytes = readFileSync(POSTURES);
const proj = JSON.parse(projBytes.toString("utf8"));

const declared = decl.export_postures || {};
const emitted = proj.postures || {};
const declaredKeys = Object.keys(declared);
const emittedKeys = Object.keys(emitted);

console.log(`— ${declaredKeys.length} postures declared · ${emittedKeys.length} emitted · schema ${proj.schema_version || "(none)"} —\n`);

// L0 — the floor. Every law below compares two sets; two empty sets agree on
// everything and prove nothing. A record that declares no posture at all
// would have every served work named by its key and refused export, so it
// is reported as broken rather than let through as trivially consistent.
check("L0  the record declares at least one posture, so the laws below judge something",
  declaredKeys.length > 0,
  declaredKeys.length ? `${declaredKeys.length} declared — ${declaredKeys.slice(0, 4).join(", ")}${declaredKeys.length > 4 ? ", ..." : ""}`
    : "export_postures is empty, so every comparison below would pass on nothing");

// L1 — an emitted posture the record never declared is an invented license.
const invented = emittedKeys.filter((k) => !Object.prototype.hasOwnProperty.call(declared, k));
check("L1  every emitted posture is one the declarations declare",
  invented.length === 0,
  invented.length ? `${invented.length} undeclared — ${invented.slice(0, 4).join(", ")}`
    : `${emittedKeys.length} emitted, every one declared`);

// L2 — a declared posture the projection dropped would be named by its key
// on the page and refused export, silently, for a license that IS declared.
const dropped = declaredKeys.filter((k) => !Object.prototype.hasOwnProperty.call(emitted, k));
check("L2  every declared posture is emitted, so the projection drops none",
  dropped.length === 0,
  dropped.length ? `${dropped.length} dropped — ${dropped.slice(0, 4).join(", ")}`
    : `${declaredKeys.length} declared, every one projected`);

// The postures both files hold, compared field by field.
const shared = emittedKeys.filter((k) => Object.prototype.hasOwnProperty.call(declared, k));

// L3 — the name. The one field a page prints, and the one that was guessed.
const renamed = [];
for (const k of shared) {
  const want = declared[k].name, got = emitted[k].name;
  const declaredIsName = typeof want === "string" && want.length > 0;
  if (!declaredIsName || got !== want)
    renamed.push(`${k}: emitted ${JSON.stringify(got)} vs declared ${JSON.stringify(want)}`);
}
check("L3  every emitted name is the declared name, character for character",
  renamed.length === 0,
  renamed.length ? `${renamed.length} differ — ${renamed.slice(0, 3).join(" · ")}`
    : `${shared.length} names, none differs from the record`);

// L4 — export permission and attribution owed. The export gate reads these.
const regated = [];
for (const k of shared) {
  const d = declared[k], e = emitted[k];
  if (e.export !== d.export) regated.push(`${k}: export ${JSON.stringify(e.export)} vs ${JSON.stringify(d.export)}`);
  else if (e.attribution !== d.attribution) regated.push(`${k}: attribution ${JSON.stringify(e.attribution)} vs ${JSON.stringify(d.attribution)}`);
}
check("L4  every emitted export flag and attribution is the declared one",
  regated.length === 0,
  regated.length ? `${regated.length} differ — ${regated.slice(0, 3).join(" · ")}`
    : `${shared.length} postures, permission and attribution as declared`);

// L5 — the obligations that ride along. Compared as serialized JSON so that
// order, count, and wording all have to match.
const reworded = [];
for (const k of shared) {
  if (JSON.stringify(emitted[k].obligations) !== JSON.stringify(declared[k].obligations)) reworded.push(k);
}
check("L5  every emitted obligation list is the declared one, unchanged",
  reworded.length === 0,
  reworded.length ? `${reworded.length} differ — ${reworded.slice(0, 4).join(", ")}`
    : `${shared.reduce((n, k) => n + ((emitted[k].obligations || []).length), 0)} obligations carried, none altered`);

// L6 — the record's own default for the undeclared, quoted rather than
// paraphrased. A page that meets a key this file does not hold prints the key
// and refuses export; the sentence saying so must be the record's.
const defaults = decl.defaults || {};
const undeclared = proj.undeclared || {};
const defaultDrift = [];
for (const field of ["reading", "export"]) {
  if (undeclared[field] !== defaults[field]) defaultDrift.push(field);
}
check("L6  the projection's undeclared block quotes the record's own defaults",
  defaultDrift.length === 0 && typeof defaults.export === "string",
  defaultDrift.length ? `differs on ${defaultDrift.join(", ")}`
    : typeof defaults.export !== "string" ? "the record carries no export default to quote"
      : "reading and export defaults quoted verbatim");

// L7 — the projection says where it came from, and that is where it came
// from. derived_from is the --declarations string the emitter was given,
// resolved from the reader root; it must be the declarations under test.
const same = (a, b) => { try { return realpathSync(a) === realpathSync(b); } catch { return false; } };
const derivedFrom = typeof proj.derived_from === "string" ? proj.derived_from : "";
const derivedResolved = derivedFrom ? (isAbsolute(derivedFrom) ? derivedFrom : resolve(K3, derivedFrom)) : "";
const derivedIsDecl = Boolean(derivedFrom) && same(derivedResolved, DECL);
check("L7  the projection names the declarations it was derived from, and that path resolves to them",
  derivedIsDecl,
  !derivedFrom ? "derived_from is absent, so the file does not say where it came from"
    : derivedIsDecl ? `derived_from ${JSON.stringify(derivedFrom)}`
      : `derived_from ${JSON.stringify(derivedFrom)} does not resolve to ${DECL}`);

// L8 — the same emitter, the same declarations, the same bytes. Run with the
// derived_from string when L7 holds, so the only thing under test is the
// content; otherwise with the path relative to the root, which will differ
// in derived_from and say so.
let scratchDir = SCRATCH;
if (scratchDir) mkdirSync(scratchDir, { recursive: true });
else scratchDir = mkdtempSync(join(tmpdir(), "posture-reprojection-"));
const outPath = join(scratchDir, "license-postures-v1.reprojected.json");
const declArg = derivedIsDecl ? derivedFrom : relative(K3, resolve(DECL));
const run = spawnSync(process.execPath, [EMITTER, "--declarations", declArg, "--out", outPath], { cwd: K3, encoding: "utf8" });
let identical = false, byteDetail = "";
if (run.status !== 0) {
  // An uncaught throw prints a stack and ends with Node's version banner; the
  // line worth quoting is the one that carries the thrown message.
  const lines = String(run.stderr || run.stdout || "").split("\n").map((s) => s.trim()).filter(Boolean);
  const said = lines.find((l) => /\bError: /.test(l))
    || lines.find((l) => !/^Node\.js v\d/.test(l) && !/^at /.test(l))
    || "(no output)";
  byteDetail = `emitter exited ${run.status}: ${said.slice(0, 160)}`;
} else if (!existsSync(outPath)) {
  byteDetail = `emitter wrote nothing at ${outPath}`;
} else {
  const fresh = readFileSync(outPath);
  identical = fresh.equals(projBytes);
  if (identical) byteDetail = `${projBytes.length} bytes, re-projected from ${JSON.stringify(declArg)} and equal`;
  else {
    let at = 0;
    while (at < fresh.length && at < projBytes.length && fresh[at] === projBytes[at]) at += 1;
    byteDetail = `${projBytes.length} bytes on disk vs ${fresh.length} re-projected; first difference at byte ${at}` +
      (derivedIsDecl ? "" : " (derived_from differs, see L7)") + ` — re-projection left at ${outPath}`;
  }
}
check("L8  re-projecting the declarations through the emitter yields a byte-identical file",
  identical, byteDetail);

console.log("\n  what this does not say: that a chip on the page, or the export gate, reads");
console.log("  this file rather than the letters of a key. That is check-licence-names-v1's");
console.log("  question. This one says the file they are told to read is the record, whole,");
console.log("  with nothing invented, dropped, renamed, or typed in by hand.");

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
