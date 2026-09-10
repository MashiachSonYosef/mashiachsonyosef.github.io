// check-page-agrees-with-its-record-v1
//
// WHY THIS EXISTS. On 2026-09-10 the demonstrations page printed, in one
// sentence:
//
//     Two faces, both the record's: One face. The courtyard: linen hangings
//     in daylight.
//
// Nothing was broken. The emitter carried a hardcoded lead-in, "Two faces,
// both the record's:", and concatenated the contract's own faces.rule after
// it. When the second face was dropped the record was updated and the
// hardcoded half was not, so the page stated a fact and then contradicted it
// inside the same line. Every check in the suite passed. The contract was
// right, the CSS was right, the colors were right, and the page lied.
//
// That is the failure mode this project exists to catch, turned inward: a
// page saying something about itself that its own record does not support.
// A guard for it cannot be "does the page look right" — it has to be "does
// every claim the page makes about a record appear IN that record".
//
// WHAT IS CHECKED
//
//   L1  every value the color contract declares is printed somewhere on the
//       page that claims to show the contract. A record field that no page
//       prints is a record nobody can check.
//   L2  the page prints no phrase from the RETIRED vocabulary — words that
//       described a design this edition used to have. Each retired phrase
//       names the record field that would have to say it for the phrase to
//       be legitimate, and the check consults that field rather than banning
//       the word outright, so the day a thing comes back the guard follows.
//   L3  no number-word sits immediately before a record value it could
//       contradict. This is the shape of the original bug: a hardcoded
//       "Two faces" welded to a record that says "One face".
//
// THE RULE THIS GUARDS, named here rather than only read at run time. The
// manifest credits a guard by finding the rule id in its source, so a check
// that only loads the record at run time guards it in fact and not on the
// record, and can be deleted without the manifest noticing it is gone:
//
//   color-channel-rule-v2-the-materials-are-the-ledgers-the-channels-are-the-owners-ruling-and-the-values-are-ours
//
// Run: node tools/check-page-agrees-with-its-record-v1.mjs [base-url]
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const RECORD = join(K3, "data", "color-contract-v1.json");
const BASE = (process.argv[2] || "http://127.0.0.1:8903").replace(/\/$/u, "");

let bad = 0;
const check = (what, ok, detail) => {
  if (!ok) bad += 1;
  console.log(`${ok ? "  ok" : "FAIL"}  ${what}${detail ? `  ·  ${detail}` : ""}`);
};

if (!existsSync(RECORD)) { console.log(`SKIPPED — no record at ${RECORD}`); process.exit(3); }
const CC = JSON.parse(readFileSync(RECORD, "utf8"));

// Whitespace is presentation. Compare on the words.
const flat = (s) => String(s).replace(/\s+/gu, " ").trim();
const has = (hay, needle) => flat(hay).includes(flat(needle));

const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 1180, height: 900 } });
await p.goto(`${BASE}/demonstrations/`, { waitUntil: "networkidle" });
await p.waitForTimeout(1500);
const text = await p.evaluate(() => document.body.innerText);
await b.close();

// ── L1 · every declared value reaches the page ───────────────────────────────
// Only the fields the page is meant to show. A record may hold reasoning the
// page does not print; what may not happen is a VALUE going unprinted.
const mustPrint = [];
for (const [key, d] of Object.entries(CC.channels || {})) {
  if (key === "rule" || !d || typeof d !== "object") continue;
  if (d.material) mustPrint.push([`channel ${key}: its material`, d.material]);
  if (d.reads_as) mustPrint.push([`channel ${key}: how it is borne`, d.reads_as]);
}
if (CC.channels && CC.channels.rule) mustPrint.push(["the channel rule", CC.channels.rule]);
if (CC.faces && CC.faces.rule) mustPrint.push(["the faces rule", CC.faces.rule]);

for (const [what, value] of mustPrint) {
  check(`L1  ${what} is printed where a reader can check it`, has(text, value),
    has(text, value) ? "" : `the record says "${flat(value).slice(0, 70)}…" and no page prints it`);
}

// ── L2 · retired vocabulary, consulted against the record ───────────────────
// Each entry: the phrase, and a function saying whether the record still
// licenses it. The phrase is only a fault when the record has moved on.
const RETIRED = [
  ["Two faces", () => Object.keys(CC.faces || {}).filter((k) => CC.faces[k] && CC.faces[k].base_surface).length >= 2,
    "the contract declares one face"],
  ["both the record's", () => Object.keys(CC.faces || {}).filter((k) => CC.faces[k] && CC.faces[k].base_surface).length >= 2,
    "that phrase counted two faces"],
  ["the tent is dark", () => !!(CC.faces || {}).night, "the night face was dropped"],
  ["electric_blue", () => JSON.stringify(CC.channels || {}).includes("electric_blue"),
    "reader_selection is no longer valued blue"],
];
// "a final color" was in this list on the guard's first run and it fired at
// once — on the owner's own quoted ruling, "Gold is NOT a final color". The
// phrase is legitimate prose; what was really being asked was whether the
// emitter's dead fallback could still fire. That is a question for the record,
// not for the page's words, and asking it of the words was the guard making
// the same mistake it exists to catch.
for (const [key, d] of Object.entries(CC.channels || {})) {
  if (key === "rule" || !d || typeof d !== "object") continue;
  check(`L2  channel ${key} says how it is borne, so no emitter has to guess`,
    typeof d.reads_as === "string" && d.reads_as.length > 0,
    d.reads_as ? "" : "no reads_as, so the emitter falls back to a sentence of its own");
}
for (const [phrase, licensed, why] of RETIRED) {
  const present = has(text, phrase);
  const ok = !present || licensed();
  check(`L2  "${phrase}" is not printed unless the record still says it`, ok,
    ok ? (present ? "printed, and the record backs it" : "not printed") : `printed, but ${why}`);
}

// ── L3 · the shape of the original bug ──────────────────────────────────────
// A hardcoded count welded to a record value that carries its own count. The
// page said "Two faces" and then, in the same line, the record's "One face".
const COUNTS = ["one", "two", "three", "four", "both", "either", "neither"];
const facesRule = flat((CC.faces || {}).rule || "");
const rulesOwnCount = COUNTS.find((w) => new RegExp(`^${w}\\b`, "iu").test(facesRule));
if (rulesOwnCount) {
  // find what the page puts immediately before the record's own sentence
  const at = flat(text).indexOf(facesRule);
  const before = at > 0 ? flat(text).slice(Math.max(0, at - 60), at) : "";
  const clash = COUNTS.find((w) => new RegExp(`\\b${w}\\b`, "iu").test(before) && w.toLowerCase() !== rulesOwnCount.toLowerCase());
  check("L3  no counting word is welded in front of a record that counts for itself",
    !clash, clash ? `the record opens "${rulesOwnCount}…" and the page puts "${clash}" right before it: "…${before}"` : `the record opens "${rulesOwnCount}…" and nothing counts over it`);
} else {
  console.log("  --    L3  the faces rule does not open with a count, so nothing can contradict one");
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
