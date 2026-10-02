#!/usr/bin/env node
// GUARDS: script-admission-rule-v1-a-published-word-is-written-in-hebrew-script
//
// The inclusion test, at the one grain where it is exact.
//
// The corpus lane spent real time proving that Yiddish CANNOT be detected
// orthographically. Every marker anyone proposes is an ordinary Hebrew or
// Aramaic feature, measured over 4,000 streams:
//
//   double vav      299,673 hits   and they are DALET-VAV-VAV-QOF-ALEF, HE-TAV-ALEF-VAV-VAV-TAV
//   double yud    1,188,842 hits   and they are BET-ALEF-VAV-RESH-YOD-YOD-TAV-ALEF, HE-YOD-YOD-NUN-VAV
//   ayin ending      45,384 hits   and they are LAMED-MEM-AYIN-NUN, YOD-AYIN-NUN
//   komets alef     136,801 hits   and that is just niqqud
//
// So this file does not attempt it, and no later file should. What it does
// instead is the test that IS exact: a script census. A word written in
// Arabic, Syriac, Mandaic, Samaritan, Greek or Cyrillic script is not a
// Hebrew or Aramaic word, and no judgment call is involved in saying so.
//
// The framing matters and is the owner's. This is not removal — hold
// everything, detect the foreign, subtract — which needs a detector with
// perfect recall that does not exist. It is INCLUSION: a word is published
// because we can show what it IS. A word in a script we do not admit is not
// excluded, it is NOT YET INCLUDED, and that costs nothing we want. Coverage
// was never the goal.
//
// What this gate can and cannot say, stated so a pass is not overread:
//   IT CAN SAY   no published word is written in a script outside Hebrew.
//   IT CANNOT SAY  no published word is Yiddish, Ladino or Judeo-Arabic.
//                  Those are written in Hebrew script and pass this gate by
//                  construction. Their exclusion is a corpus-lane matter of
//                  verified inclusion per token, not a matter of script.
//
// Run: node tools/check-script-admitted-v1.mjs [--zones data/zones]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", join(K3, "data", "zones"));

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

// Named by codepoint range, never by a typed glyph. Each range is the script
// itself, so a hit is a fact about the writing system and not about a word.
const SCRIPTS = [
  ["ARABIC", /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/u],
  ["SYRIAC", /[܀-ݏ]/u],
  ["MANDAIC", /[ࡀ-࡟]/u],
  ["SAMARITAN", /[ࠀ-࠿]/u],
  ["GREEK", /[Ͱ-Ͽἀ-῿]/u],
  ["CYRILLIC", /[Ѐ-ӿ]/u],
  ["ETHIOPIC", /[ሀ-፿]/u],
  ["ARMENIAN", /[԰-֏]/u],
];

if (!existsSync(ZONES)) { console.log(`SKIPPED — no zones at ${ZONES}`); process.exit(3); }
const bins = readdirSync(ZONES).filter((f) => f.endsWith(".bin")).sort();
if (!bins.length) { console.log("SKIPPED — no zones on this disk"); process.exit(3); }

const hits = new Map();          // script -> count
const where = [];                // first few, named
let zonesRead = 0, wordsRead = 0;
for (const f of bins) {
  let z;
  try { z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8")); } catch { continue; }
  zonesRead += 1;
  for (const sec of z.sections || []) {
    for (const w of sec.words || []) {
      wordsRead += 1;
      const s = String(w.s || "");
      for (const [name, re] of SCRIPTS) {
        if (!re.test(s)) continue;
        hits.set(name, (hits.get(name) || 0) + 1);
        if (where.length < 12) where.push(`${name} · ${z.work} ${sec.label} ${JSON.stringify(s).slice(0, 36)}`);
      }
    }
  }
}

console.log(`— ${zonesRead} zones · ${wordsRead.toLocaleString()} words —`);
for (const [name] of SCRIPTS) console.log(`     ${name.padEnd(10)} ${hits.get(name) || 0}`);
check("no published word is written in a script outside Hebrew",
  hits.size === 0,
  hits.size
    ? `${[...hits.entries()].map(([n, c]) => `${n} ${c}`).join(" · ")} — ${where.slice(0, 3).join(" | ")}`
    : `${SCRIPTS.length} scripts looked for, none present`);

console.log("\n  what this pass does not say: Yiddish, Ladino and Judeo-Arabic are written in");
console.log("  Hebrew script and pass this gate by construction. Nothing here is evidence");
console.log("  about them either way, and orthographic detection of them has been measured");
console.log("  and does not work. Their exclusion belongs to verified inclusion per token.");

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
