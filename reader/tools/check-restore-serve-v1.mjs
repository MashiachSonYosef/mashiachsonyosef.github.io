#!/usr/bin/env node
// GUARDS: serve-from-restore-rule-v1-the-restore-is-the-text-the-split-is-this-lanes-the-rights-are-the-records, mam-restore-v5-rights-rule-v1-one-record-for-the-edition-the-credit-on-every-page
// LEDGER: C0 M
// the ink at its position, and the licence riding on every occurrence of it.
//
// THE RESTORE ROUTE, HELD TO ITS OWN CLAIMS. A book served from the corpus
// lane's restore v5 says four things about itself in its receipts: that the
// restore's surface hash was reproduced from the bytes; that every row was
// cut at its maqafs with the joiner riding on the piece before, a ketiv-qere
// site kept whole; that every scribal mark stands at its own position; and
// that its rights are one record's, with that record's credit printed on
// every page. This check reads the built zone and holds each claim to what
// the zone actually carries:
//
//   L1  the oracle: a 64-hex surface hash the serve says it reproduced, a
//       64-hex hash of the restore file, positional identity that says so
//   L2  the cut: no word carries a maqaf inside it (the split reached every
//       compound), every word that ends in a joiner has a word after it in
//       its verse, and every ketiv-qere site's regions stand in its own
//       surface in order and rejoin to the branches its record names
//   L3  the marks: every mark is keyless, and every sof pasuq, paseq,
//       section mark, inverted nun and brick gap in the text is its own
//       position (none is welded to a word)
//   L4  the rights: every row of the serve carries the rights record's
//       posture, the byline leads with the record's own credit line for
//       this work, and the record carries no local path
//
// Run: node tools/check-restore-serve-v1.mjs [--zones data/zones] [--rights data/mam-restore-v5-rights-v1.json]
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (name, dflt) => { const i = process.argv.indexOf(`--${name}`); return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : dflt; };
const ZONES = join(K3, arg("zones", "data/zones"));
const RIGHTS = join(K3, arg("rights", "data/mam-restore-v5-rights-v1.json"));

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const few = (l, n = 3) => l.slice(0, n).join(" · ");
const num = (x) => Number(x).toLocaleString("en-US");
const HEX = /^[0-9a-f]{64}$/u;
// codepoints escaped: a check may not type a character of the text
const MAQAF = "\u05be", PASEQ = "\u05c0", SOF = "\u05c3", NUN = "\u05c6", GAP = "\u25af";
const SECTION = /\{[\u05e1\u05e4]\}|\([\u05e1\u05e4]\)/u;
const LETTER = /[\u05d0-\u05ea]/u;
const KQ_GROUP = /\(([^()]*)\)|\[([^\[\]]*)\]/gu;
const nfc = (s) => String(s ?? "").normalize("NFC");
const bare = (t) => nfc(t).replace(/^\u05be+|\u05be+$/gu, "");

const zones = existsSync(ZONES) ? readdirSync(ZONES).filter((f) => f.endsWith(".bin") && !f.startsWith("fixture-") && !f.endsWith(".commentary.bin") && !/^[0-9a-f]{2}\.bin$/u.test(f) && f !== "w-top.bin").sort() : [];
const rights = existsSync(RIGHTS) ? JSON.parse(readFileSync(RIGHTS, "utf8")) : null;
const l1 = [], l2 = [], l3 = [], l4 = [];
let seen = 0;
for (const f of zones) {
  let z;
  try { z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8")); } catch { continue; }
  const walk = (z.emitted_from || {}).walk || {};
  const ro = walk.restore_oracle;
  if (!ro) continue;
  seen += 1;
  const slug = f.replace(/\.bin$/u, "");
  const workId = (String((z.work_receipts || {}).b_n || "").match(/work_id=(\S+)/u) || [])[1] || null;
  // L1 · the oracle
  if (!HEX.test(String(ro.surface_sha256)) || ro.surface_sha256_reproduced !== true) l1.push(`${slug}: surface hash not reproduced`);
  if (!HEX.test(String(ro.restore_gz_sha256))) l1.push(`${slug}: no hash of the restore file`);
  if (!(walk.identity && walk.identity.tier === "PROTOTYPE_POSITIONAL" && walk.identity.c0_first === 1)) l1.push(`${slug}: identity does not say it is positional from 1`);
  if (!(walk.pointer && walk.pointer.sha256 === ro.surface_sha256)) l1.push(`${slug}: the pointer is not the restore's surface hash`);
  // L2 · the cut, L3 · the marks
  for (const sec of (z.sections || [])) {
    const words = sec.words || [];
    words.forEach((w, i) => {
      const s = String(w.s ?? "");
      if (w.mark) {
        if (w.k || w.w) l3.push(`${slug} ${sec.unit}: a mark carries a key`);
        return;
      }
      if (w.kq) {
        let rest = s;
        for (const r of (w.w || [])) { const at = rest.indexOf(r.s); if (at < 0) { l2.push(`${slug} ${sec.unit}: kq region ${JSON.stringify(r.s)} not in its surface in order`); break; } rest = rest.slice(at + r.s.length); }
        const groups = [...s.matchAll(KQ_GROUP)];
        const k = groups.find((g) => g[1] !== undefined), q = groups.find((g) => g[2] !== undefined);
        if (bare(k ? k[1] : "") !== bare(w.kq.k ?? "") || bare(q ? q[2] : "") !== bare(w.kq.q ?? "")) l2.push(`${slug} ${sec.unit}: kq record does not name the branches the surface writes`);
        const inner = s.replace(KQ_GROUP, "");
        if (LETTER.test(inner)) l2.push(`${slug} ${sec.unit}: letters outside the site's groups — a word glued to the site`);
      } else {
        const inner = s.replace(/^\u05be+|\u05be+$/gu, "");
        if (inner.includes(MAQAF)) l2.push(`${slug} ${sec.unit}: a maqaf inside a word — the split did not reach it (${s.slice(0, 20)})`);
      }
      if (s.endsWith(MAQAF) && !(i + 1 < words.length && !words[i + 1].mark)) l2.push(`${slug} ${sec.unit}: a joiner with no word after it`);
      if (s.startsWith(MAQAF)) l2.push(`${slug} ${sec.unit}: a joiner at the start of a word`);
      if (LETTER.test(s) && (s.includes(PASEQ) || s.includes(SOF) || s.includes(NUN) || s.includes(GAP) || SECTION.test(s))) l3.push(`${slug} ${sec.unit}: a scribal mark welded to a word (${s.slice(0, 20)})`);
    });
  }
  // L4 · the rights
  const rw = rights && workId && rights.works && rights.works[workId];
  const per = String(((z.emitted_from || {}).license_receipts || {}).per_occurrence || "");
  const lic = (rights || {}).licence || {};
  const posture = [lic.normalized_license_class, lic.license_version, lic.reader_display_axis, lic.public_distribution_axis, lic.attribution_required, lic.noncommercial_required, lic.share_alike_required, lic.no_derivatives_required, lic.terminal_resolution_state].join(" · ");
  if (!rights) l4.push(`${slug}: no rights record`);
  else if (!rw) l4.push(`${slug}: ${workId} not in the rights record`);
  else {
    if (!per.includes(`rows: ${posture}`)) l4.push(`${slug}: the rows' posture is not the record's`);
    if (per.includes(" | ")) l4.push(`${slug}: more than one posture on the rows`);
    if (!String(z.byline || "").startsWith(rw.credit.line)) l4.push(`${slug}: the byline does not lead with the record's credit`);
    const rr = (walk.rights || {});
    if (rr.source !== "MAM_RESTORE_V5_RIGHTS_RECORD" || !HEX.test(String(rr.record_sha256))) l4.push(`${slug}: the serve does not name the rights record and its hash`);
  }
}
if (rights && /\b[A-Za-z]:[\\/](?![\\/])|\/home\/|Users[\\/]/u.test(JSON.stringify(rights))) l4.push("the rights record carries a local path");
if (!seen) { console.log("SKIPPED — no zone on disk rides the restore route; nothing to hold to its claims"); process.exit(3); }
check(`L1  the oracle: every restore-route zone names a reproduced surface hash, the restore file's hash, and positional identity`, l1.length === 0, l1.length ? `${l1.length} — ${few(l1)}` : `${num(seen)} zones`);
check(`L2  the cut: no maqaf inside a word, every joiner has a partner, every site's regions are its own surface`, l2.length === 0, l2.length ? `${l2.length} — ${few(l2)}` : "every compound cut, every site whole");
check(`L3  the marks: every mark keyless and at its own position, none welded to a word`, l3.length === 0, l3.length ? `${l3.length} — ${few(l3)}` : "each mark its own position");
check(`L4  the rights: one posture from the record on every row, the record's credit leading every byline, no local path in the record`, l4.length === 0, l4.length ? `${l4.length} — ${few(l4)}` : "the record's, on every row and every page");
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
