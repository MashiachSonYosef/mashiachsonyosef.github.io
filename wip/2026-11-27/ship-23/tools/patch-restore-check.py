#!/usr/bin/env python3
# Adds law L5 to tools/check-restore-serve-v1.mjs: the served words, rejoined, hash to the restore's surface hash.
# Usage: python3 patch-restore-check.py <reader dir>
import sys, io
p = sys.argv[1].rstrip('/') + '/tools/check-restore-serve-v1.mjs'
s = io.open(p, encoding='utf-8').read()

def once(old, new):
    global s
    if s.count(old) != 1:
        raise SystemExit('expected exactly one of: ' + old[:80] + ' (found %d)' % s.count(old))
    s = s.replace(old, new)

once('''//   L4  the rights: every row of the serve carries the rights record's
//       posture, the byline leads with the record's own credit line for
//       this work, and the record carries no local path
//
''', '''//   L4  the rights: every row of the serve carries the rights record's
//       posture, the byline leads with the record's own credit line for
//       this work, and the record carries no local path
//   L5  the text: the zone's own words, rejoined where a word joins the next
//       without a separator, one row to a line, hash to the surface hash the
//       zone names and to the one the rights record names for the work
//
// L5 IS L1'S CLAIM MADE AGAIN ON EVERY RUN (the footing pass, 27 November
// 2026). L1 reads a flag the serve wrote on 6 September, the day it hashed
// the restore's rows: "reproduced". Nothing since has hashed the words a
// zone holds today, so a zone whose text moved, sealed again by a round,
// passed every check in the tree. The restore's surface hash is the sha256
// of its rows' surfaces, each followed by a line end; the serve cut a row at
// its maqafs and marked every piece but the last as joining the next, so the
// rows are had back from the zone alone, and the hash with them.
//
''')
once('''import { readFileSync, existsSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
''', '''import { readFileSync, existsSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
''')
once('''const l1 = [], l2 = [], l3 = [], l4 = [];
''', '''const l1 = [], l2 = [], l3 = [], l4 = [], l5 = [];
''')
once('''  // L2 · the cut, L3 · the marks
  for (const sec of (z.sections || [])) {
''', '''  // L5 · the text: the rows the restore gave, had back from the words served
  {
    const rows = []; let row = "";
    for (const sec of (z.sections || [])) for (const w of (sec.words || [])) {
      row += String(w.s ?? "");
      if ((w.presentation_join || {}).join_next_without_separator) continue;
      rows.push(row); row = "";
    }
    if (row) rows.push(row);
    const got = createHash("sha256").update(`${rows.join("\\n")}\\n`, "utf8").digest("hex");
    const named = rights && workId && rights.works && rights.works[workId] ? rights.works[workId].restore_surface_sha256 : null;
    if (got !== ro.surface_sha256) l5.push(`${slug}: its words hash to ${got.slice(0, 12)}…, the surface hash it names is ${String(ro.surface_sha256).slice(0, 12)}…`);
    else if (named !== got) l5.push(`${slug}: its words hash to ${got.slice(0, 12)}…, the rights record names ${named ? `${String(named).slice(0, 12)}…` : "no surface hash for the work"}`);
  }
  // L2 · the cut, L3 · the marks
  for (const sec of (z.sections || [])) {
''')
once('''check(`L4  the rights: one posture from the record on every row, the record's credit leading every byline, no local path in the record`, l4.length === 0, l4.length ? `${l4.length} — ${few(l4)}` : "the record's, on every row and every page");
''', '''check(`L4  the rights: one posture from the record on every row, the record's credit leading every byline, no local path in the record`, l4.length === 0, l4.length ? `${l4.length} — ${few(l4)}` : "the record's, on every row and every page");
check(`L5  the text: every restore-route zone's words, rejoined, hash to the surface hash it names and the rights record names`, l5.length === 0, l5.length ? `${l5.length} — ${few(l5)}` : `${num(seen)} zones, hashed again from the words served`);
''')
# L4 also hashes the rights record: the serve names the record by sha256, and until now the check asked only that the name was 64 hex
once('''const rights = existsSync(RIGHTS) ? JSON.parse(readFileSync(RIGHTS, "utf8")) : null;
''', '''const rights = existsSync(RIGHTS) ? JSON.parse(readFileSync(RIGHTS, "utf8")) : null;
// the record's own bytes, hashed here: a zone names the record it was served under by this value (L4)
const RIGHTS_SHA256 = existsSync(RIGHTS) ? createHash("sha256").update(readFileSync(RIGHTS)).digest("hex") : null;
''')
once('''    if (rr.source !== "MAM_RESTORE_V5_RIGHTS_RECORD" || !HEX.test(String(rr.record_sha256))) l4.push(`${slug}: the serve does not name the rights record and its hash`);
''', '''    if (rr.source !== "MAM_RESTORE_V5_RIGHTS_RECORD" || !HEX.test(String(rr.record_sha256))) l4.push(`${slug}: the serve does not name the rights record and its hash`);
    else if (rr.record_sha256 !== RIGHTS_SHA256) l4.push(`${slug}: the rights record it names (${String(rr.record_sha256).slice(0, 12)}…) is not the record on disk (${String(RIGHTS_SHA256).slice(0, 12)}…)`);
''')
once('''//   L4  the rights: every row of the serve carries the rights record's
//       posture, the byline leads with the record's own credit line for
//       this work, and the record carries no local path
//   L5''', '''//   L4  the rights: every row of the serve carries the rights record's
//       posture, the byline leads with the record's own credit line for
//       this work, the record the serve names by sha256 is the record on
//       disk, and the record carries no local path
//   L5''')
io.open(p, 'w', encoding='utf-8').write(s)
print('patched', p)
