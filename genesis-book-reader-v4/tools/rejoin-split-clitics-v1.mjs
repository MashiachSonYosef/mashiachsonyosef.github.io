#!/usr/bin/env node
// Synthesis lane · rejoin-rule-v1-only-what-the-store-already-attests
//
// A zone built by an older route printed the first word of the Torah as two
// occurrences — בְּ and רֵאשִׁ֖ית, side by side, each with its own reading and
// its own commentary handle. The chain does not hold it that way: the store
// attests בראשית as one form with fifteen routes. The split is the zone's, not
// the corpus's, and this puts it back.
//
// It is not allowed to guess. The one thing it may do is rejoin an adjacent
// pair, and only when every one of these holds:
//
//   1. The first occurrence is a single-letter prefix — one of ב ו כ ל מ ה ש —
//      standing as its own word. Nothing else is ever touched.
//   2. Joining the two surfaces exactly as the zone holds them, with nothing
//      inserted and nothing removed, normalises under the frame's own K rule
//      to a key THE STORE ALREADY ATTESTS. If the store does not know the
//      joined form, the pair is left alone and counted as refused. The joined
//      word is therefore never a form this tool invented — it is a form the
//      chain was already answering for.
//   3. The section's word count changes, so every commentary anchored by word
//      position in that section is re-anchored: what was on either half is now
//      on the one word, and everything after it shifts down by one. A
//      commentary left pointing at the old index would be pointing at a
//      different word, which is worse than the split it fixed.
//
// Nothing is patched in place: this reads and writes new files, and records
// what it joined and what it refused, in the file.
import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync, gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { exactK, K_RULE_ID } from "./k-normalization-v1.mjs";

const arg = (f, d = null) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
const zonePath = arg("--zone"), outZone = arg("--out-zone");
const cmPath = arg("--commentary"), outCm = arg("--out-commentary");
const storeDir = arg("--store", "data/route-store");
const stamp = arg("--stamp");
for (const [flag, v] of [["--zone", zonePath], ["--out-zone", outZone], ["--stamp", stamp]]) {
  if (!v) { console.error(`MISSING_ARG ${flag}`); process.exit(2); }
}
const read = (f) => JSON.parse(gunzipSync(readFileSync(f)).toString("utf8"));
const write = (f, o) => writeFileSync(f, gzipSync(Buffer.from(JSON.stringify(o)), { level: 9 }));

// The one-letter prefixes, named by codepoint and never typed as glyphs:
// U+05D1 bet, U+05D5 vav, U+05DB kaf, U+05DC lamed, U+05DE mem, U+05D4 he,
// U+05E9 shin. This set is asserted in this file. It is not read out of the
// ledger, which is a weakness and is said here rather than hidden: a repair
// that depends on a list somebody decided is only as good as the list. The
// tool is not called by any build stage for that reason.
const PREFIX = new Set(["\u05d1", "\u05d5", "\u05db", "\u05dc", "\u05de", "\u05d4", "\u05e9"]);
const shardCache = new Map();
const attests = (key) => {
  const sh = createHash("sha256").update(key, "utf8").digest("hex").slice(0, 2);
  if (!shardCache.has(sh)) {
    try { shardCache.set(sh, read(join(storeDir, "shards", `${sh}.bin`))); }
    catch { shardCache.set(sh, {}); }
  }
  const r = shardCache.get(sh)[key];
  return !!(r && r.length);
};

const zone = read(zonePath);
const cm = cmPath ? read(cmPath) : null;
const joined = [], refused = [];

for (const sec of zone.sections) {
  const words = sec.words;
  const shifts = [];                     // index of the word that absorbed its neighbour
  for (let i = 0; i < words.length - 1; i += 1) {
    const a = words[i], b = words[i + 1];
    if (!a || !b || !a.k || !b.k) continue;
    if (a.k.length !== 1 || !PREFIX.has(a.k) || b.k.length < 2) continue;
    if (a.held || b.held || a.w || b.w) continue;      // held or already divided: not ours
    const surface = a.s + b.s;
    const key = exactK(surface);
    if (!attests(key)) { refused.push(`${sec.label}: ${surface} → ${key} — the store does not attest it`); continue; }
    words.splice(i, 2, { s: surface, k: key });
    shifts.push(i);
    joined.push(`${sec.label}: ${a.s} + ${b.s} → ${surface} (${key})`);
    i -= 1;
  }
  // re-anchor this section's word-position commentary
  if (shifts.length && cm && cm.units && cm.units[sec.unit] && cm.units[sec.unit].words) {
    const old = cm.units[sec.unit].words;
    const moved = {};
    for (const [posStr, entries] of Object.entries(old)) {
      let pos = Number(posStr);
      for (const at of shifts) { if (pos === at + 1) pos = at; else if (pos > at + 1) pos -= 1; }
      moved[String(pos)] = (moved[String(pos)] || []).concat(entries);
    }
    cm.units[sec.unit].words = moved;
  }
}

zone.emitted_from = zone.emitted_from || {};
zone.emitted_from.rejoined = {
  rule: "rejoin-rule-v1-only-what-the-store-already-attests",
  k_rule: K_RULE_ID,
  on: stamp,
  joined: joined.length,
  refused: refused.length,
  what: joined,
  what_was_refused: refused,
  why: "the zone printed one word of the sealed text as two occurrences; the store attests it as one",
};
write(outZone, zone);
if (cm && outCm) write(outCm, cm);
console.log(`${outZone}: ${joined.length} joined, ${refused.length} refused`);
joined.forEach((x) => console.log(`  joined  ${x}`));
refused.slice(0, 5).forEach((x) => console.log(`  refused ${x}`));
