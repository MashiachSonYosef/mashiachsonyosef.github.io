#!/usr/bin/env node
// fixture-rule-v1-a-real-zone-with-its-own-commentary-hung-at-words
//
// A test instrument, never served and never deployed.
//
// The word-anchored commentary map is a Genesis shape; 1 Kings carries only
// section-level commentary. The in-line handle behaviour — one handle per
// rendered line, a chooser on the press, the verse reorganising around what
// opens — needs a zone that has both, and it needs one that does not change
// under it when the corpus does. So this makes one: 1 Kings exactly as it is,
// with each unit's own section commentary ALSO hung at word positions 0, 1 and
// 4, so several words on one line carry commentary and one line carries more
// than one unit.
//
// Nothing is invented. Every entry it hangs is an entry that unit already
// carries, copied verbatim with its work, its reference, its licence basis and
// its text; only the position it is attached at is new, and that position is
// declared in the file. It exists so a check can press something.
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync, gunzipSync } from "node:zlib";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ZONES = join(HERE, "..", "data", "zones");
const AT = [0, 1, 4];
const load = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const save = (p, o) => { writeFileSync(p, gzipSync(Buffer.from(JSON.stringify(o), "utf8"), { level: 9 })); };

// The zone it is made from is named, never assumed. This read 1kings.bin —
// withdrawn on 2026-08-23 — so the fixture maker could not run at all.
const SRC = (() => { const i = process.argv.indexOf("--from"); return i > 0 ? process.argv[i + 1] : null; })();
if (!SRC) { console.error("NO_SOURCE_NAMED — pass --from <published slug>: a fixture is made from a zone somebody named"); process.exit(2); }
const base = load(join(ZONES, `${SRC}.bin`));
// the sidecar is the named source's own, by the sidecar naming rule —
// a typed filename here outlived its address once already
const com = load(join(ZONES, `${SRC}-commentary.bin`));

const ids = Object.keys(com.units || {});
let hung = 0, units = 0, doubled = 0;
const copy = (e) => JSON.parse(JSON.stringify(e));
ids.forEach((id, n) => {
  const u = com.units[id];
  const entries = u.section || [];
  if (!entries.length) return;
  units += 1;
  u.words = u.words || {};
  // One unit's entry spread over three positions, so a rendered line can carry
  // commentary on more than one of its words — the case the per-line handle
  // exists for.
  AT.forEach((pos, i) => {
    u.words[pos] = [...(u.words[pos] || []), copy(entries[i % entries.length])];
    hung += 1;
  });
  // 1 Kings carries exactly one commentary per section, so no word here would
  // ever carry two units — and a word carrying two is the case the panel's own
  // chooser exists for. The neighbouring section's entry is hung at the first
  // position to make one. It is a stated fiction of this instrument, which is
  // why it is stated here and why this file is never served.
  const nb = com.units[ids[(n + 1) % ids.length]];
  if (nb && (nb.section || []).length) {
    u.words[AT[0]] = [...u.words[AT[0]], copy(nb.section[0])];
    hung += 1; doubled += 1;
  }
});
com.fixture = {
  rule_id: "fixture-rule-v1-a-real-zone-with-its-own-commentary-hung-at-words",
  made_from: `data/zones/${SRC}-commentary.bin`,
  hung_at_word_positions: AT,
  second_unit_at_first_position: "the neighbouring section's entry, so one word carries two units",
  entries_hung: hung,
  words_carrying_two_units: doubled,
  units_touched: units,
  never_served: "test instrument — not deployed, not linked, not part of any book",
};
base.work = `${base.work} (fixture)`;

save(join(ZONES, "fixture.bin"), base);
save(join(ZONES, "fixture-commentary.bin"), com);
console.log(`fixture.bin + fixture-commentary.bin — ${hung.toLocaleString()} entries hung at ${AT.join(", ")} across ${units.toLocaleString()} units`);
