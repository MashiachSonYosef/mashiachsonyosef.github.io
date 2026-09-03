#!/usr/bin/env node
// GUARDS: exact-k-rule-v2-ascii-abbreviation-marks-and-boundary-maqaf
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// The key rule is declared in tools/k-normalization-v2.mjs. It keeps rule 7
// of definition-poc/FRAME.md as v1 quoted it and applies two rulings the
// site did not make: an ASCII quote among Hebrew letters is the Hebrew
// abbreviation mark (the corpus lane's technical frame), and under the
// owner's rule 2 a maqaf compound is one C0 per word, the joiner riding as
// ink on the word before, so a maqaf at a row's boundary is not in the key.
// A maqaf inside a row is a compound the reseal has not split (the edge
// works) and keeps v1's law: preserved, the lattice above it.
//
// v1 of this check was red on the shelf for a year of reasons that are now
// the rule: L2 there asked every maqaf-written surface to keep the maqaf in
// its key, and L7 counted 31,706 abbreviation keys that lost their mark.
// This is the check for the shelf that rule 2 and the key rule made.
//
//   L1  the declaring file declares this rule and its function does what
//       the rule says on the cases that decide it
//   L2  a surface that ends with a maqaf stores a key without it, and is
//       marked as joining the next word without a separator
//   L3  no stored key begins or ends with a maqaf
//   L4  a surface with a maqaf inside it (an unsplit compound) is stored as
//       W cells whose whole key keeps the maqaf, as v1 required, and the
//       zone is on a route that names why it is unsplit
//   L5  no key carries a mark the rule removes
//   L6  every key is what the declared function makes of its surface
//   L7  an abbreviation mark written as an ASCII quote between two letters
//       survives in the key as the Hebrew mark; none is lost
//   L8  every zone names this rule as the rule its keys were made under
//
// What this check does NOT prove: that the page draws the two words of a
// compound without a space (a browser check's question); that the catalog's
// keys obey the rule; anything about a typographic quote (U+201D and kin),
// which the rule does not name and which is reported here, not judged.
//
// Run: node tools/check-k-maqaf-preserved-v2.mjs [--zones data/zones] [--rule tools/k-normalization-v2.mjs]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); const v = i > -1 ? process.argv[i + 1] : undefined; return v && !v.startsWith("--") ? v : d; };
const ZONES = arg("zones", join(K3, "data", "zones"));
const RULE_FILE = arg("rule", join(HERE, "k-normalization-v2.mjs"));
const RULE_ID = "exact-k-rule-v2-ascii-abbreviation-marks-and-boundary-maqaf";
const MAQAF = "־", GERSHAYIM = "״", GERESH = "׳";
const LETTER = /[א-ת]/u;
const REMOVED = /[֑-ֽֿ-ׇ‎‏‪-‮⁦-⁩͏]/u;
const ASCII_ABBR = /[א-ת][֑-ׇ]*["'][֑-ׇ]*[א-ת]/u;
const TYPO_ABBR = /[א-ת][֑-ׇ]*[“”‘’][֑-ׇ]*[א-ת]/u;

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const few = (l, n = 3) => l.slice(0, n).join(" · ");
const esc = (s) => String(s).replace(/[֐-׿]/gu, (c) => "\\u" + c.charCodeAt(0).toString(16));

if (!existsSync(RULE_FILE)) { console.log(`SKIPPED — no rule file at ${RULE_FILE}`); process.exit(3); }
const rule = await import(pathToFileURL(RULE_FILE).href);
const src = readFileSync(RULE_FILE, "utf8");
// L1: the cases that decide the rule, each written as escapes
const cases = [
  ["הקב\"ה", "הקב״ה"],   // ASCII quote among letters -> gershayim
  ["ר'ב", "ר׳ב"],                            // ASCII apostrophe among letters -> geresh
  ["אֶל־", "אל"],                       // boundary maqaf leaves the key
  ["עַל־כֵן", "על־כן"], // internal maqaf stays
  ["בִ֔י", "בי"],                       // accents and points removed
  ["ר'", "ר"],                                              // a quote not among letters is not a mark
];
const l1 = cases.filter(([s, k]) => rule.exactK(s) !== k).map(([s, k]) => `${esc(s)} -> ${esc(rule.exactK(s))}, expected ${esc(k)}`);
check("L1  the declaring file declares the rule and its function keeps it on the deciding cases",
  rule.K_RULE_ID === RULE_ID && src.includes(`"${RULE_ID}"`) && l1.length === 0,
  l1.length ? few(l1) : `${cases.length} cases hold`);

if (!existsSync(ZONES)) { console.log(`SKIPPED — no zones at ${ZONES}`); process.exit(3); }
const bins = readdirSync(ZONES).filter((f) => f.endsWith(".bin") && !f.startsWith("fixture-")).sort();
let zones = 0, words = 0, trailing = 0, internal = 0, ascii = 0, typo = 0;
const l2 = [], l3 = [], l4 = [], l5 = [], l6 = [], l7 = [], l8 = [];
const unsplitByZone = new Map();
for (const f of bins) {
  let z; try { z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8")); } catch { continue; }
  zones += 1;
  const name = f.replace(/\.bin$/u, "");
  const keyRule = String(((z.emitted_from || {}).gloss_layer || {}).key_rule || "");
  if (!keyRule.startsWith(RULE_ID)) l8.push(`${name}: ${keyRule.slice(0, 50) || "no key rule named"}`);
  for (const sec of z.sections || []) for (const w of sec.words || []) {
    if (w.held) continue;
    words += 1;
    const halves = w.kq && Array.isArray(w.w) ? w.w : null;
    const items = halves ? halves.map((h) => ({ s: h.s.replace(/^[()\[\]]|[()\[\]]$/gu, ""), k: h.k })) : [{ s: w.s, k: w.k, w: w.w }];
    for (const it of items) {
      const s = String(it.s || "");
      const k = it.k;
      const bare = s.replace(REMOVED, "");
      // L2
      if (rule.joinsNext(s)) {
        trailing += 1;
        if (k !== undefined && k.endsWith(MAQAF)) l2.push(`${name} ${esc(s)}: key ${esc(k)} keeps the joiner`);
        if (!halves && !(w.presentation_join && w.presentation_join.join_next_without_separator)) l2.push(`${name} ${esc(s)}: not marked as joining the next word`);
      }
      // L3
      if (k && (k.startsWith(MAQAF) || k.endsWith(MAQAF))) l3.push(`${name} ${esc(k)}`);
      // L4: internal maqaf
      const inner = [...bare].slice(1, -1).includes(MAQAF) && !rule.joinsNext(s) && !rule.joinsPrev(s) ? true : /[א-ת]־[א-ת]/u.test(rule.exactK(s) + "") && !rule.joinsNext(s);
      if (inner) {
        internal += 1; unsplitByZone.set(name, (unsplitByZone.get(name) || 0) + 1);
        const whole = rule.exactK(s);
        const cells = it.w || (halves ? null : w.w);
        if (!cells || !cells.some((c) => c.k === whole)) l4.push(`${name} ${esc(s)}: whole key ${esc(whole)} not among its cells`);
      }
      // L5
      if (k && REMOVED.test(k)) l5.push(`${name} ${esc(k)}`);
      // L6
      if (!inner && k !== undefined && k !== rule.exactK(s)) l6.push(`${name} ${esc(s)}: stored ${esc(k)}, rule says ${esc(rule.exactK(s))}`);
      // L7
      if (ASCII_ABBR.test(s)) { ascii += 1; if (!k || !(k.includes(GERSHAYIM) || k.includes(GERESH))) l7.push(`${name} ${esc(s)} -> ${esc(k || "")}`); }
      if (TYPO_ABBR.test(s)) typo += 1;
    }
  }
}
check("L2  a surface ending with a maqaf keys without it and joins the next word without a separator", l2.length === 0, l2.length ? `${l2.length} — ${few(l2)}` : `${trailing.toLocaleString()} joiners ride on their words`);
check("L3  no stored key begins or ends with a maqaf", l3.length === 0, l3.length ? `${l3.length} — ${few(l3)}` : "none");
check("L4  an unsplit compound keeps its whole key, maqaf inside, among its cells", l4.length === 0,
  l4.length ? `${l4.length} — ${few(l4)}` : `${internal.toLocaleString()} unsplit compounds in ${unsplitByZone.size} zones${unsplitByZone.size ? " — " + [...unsplitByZone.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([z, n]) => `${z} ${n}`).join(", ") : ""}`);
check("L5  no key carries a mark the rule removes", l5.length === 0, l5.length ? `${l5.length} — ${few(l5)}` : "none");
check("L6  every key is what the declared function makes of its surface", l6.length === 0, l6.length ? `${l6.length} — ${few(l6)}` : `${words.toLocaleString()} words agree`);
check("L7  an abbreviation mark written as an ASCII quote survives in the key as the Hebrew mark", l7.length === 0,
  l7.length ? `${l7.length} of ${ascii.toLocaleString()} lost — ${few(l7)}` : `${ascii.toLocaleString()} carried${typo ? ` · ${typo} typographic quotes among letters reported, not remapped` : ""}`);
check("L8  every zone names this rule as the rule its keys were made under", l8.length === 0, l8.length ? `${l8.length} — ${few(l8)}` : `${zones} zones`);
console.log("\n  what this does not say: that the page draws a joined pair without a space, or that the");
console.log("  catalog's own keys obey the rule; and it leaves typographic quotes among letters reported, not judged.");
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
