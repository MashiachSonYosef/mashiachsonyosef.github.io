#!/usr/bin/env node
// The rule that divides a provider's field into readings — tested on the
// fields themselves, and then on what actually shipped.
//
// The second half is the half that was missing. This file tested the module
// and passed, thirteen assertions, every day, while the store that builds the
// zones carried its own private splitter that separates on ';' and nothing
// else. A rule can be declared, and guarded, and still not be the rule the
// output was made under — and a check that only tests the module is how that
// goes unnoticed. So the last section asks the shipped zones whether the
// readings they print are single readings by this rule.
// GUARDS: sense-split-rule-v2-a-comma-outside-the-providers-parentheses-separates
//
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const { senseSplit, unbalancedAt, RULE_ID } =
  await import(join(dirname(fileURLToPath(import.meta.url)), "sense-split-v1.mjs"));
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
console.log(RULE_ID + "\n");

// the four that must stay whole — every comma is inside the provider's own notation
for (const s of [
  "(be-)love(-d, -ly, -r)",
  "(bond-, hand-)maid(-en, -servant)",
  "(be, make, bring to, cause, put to, with, a-)shamed(-d)",
  "cause to (give, give to, let, make to) drink",
]) {
  const r = senseSplit(s);
  check(`held whole: ${s.slice(0, 46)}`, r.whole && !r.damaged && r.readings[0] === s, `${r.readings.length} reading(s)`);
}

// several readings in one field, with parenthetical notation inside one of them
{
  const s = "beacon, X altogether, be(-come, accomplished, committed, like), break, cause, come (to pass), do";
  const r = senseSplit(s);
  check("a field of several readings divides at the commas outside the parentheses",
    !r.damaged && r.readings.length === 7, `${r.readings.length} readings`);
  check("  and the notation inside the parentheses is left alone",
    r.readings.includes("be(-come, accomplished, committed, like)"), r.readings[2]);
  check("  every piece is the provider's own run of characters",
    r.readings.every((p) => s.includes(p)));
  console.log("        " + r.readings.map((p) => `"${p}"`).join("  "));
}

// what is actually in the store: an inserted ")" the provider did not write
for (const s of [
  "beacon, X altogether, be(-come), accomplished, committed, like), break, cause",
  "circumcise(-ing), selves), cut down (in pieces), destroy, X must needs",
]) {
  const r = senseSplit(s);
  check(`damaged text is held whole and reported: ${s.slice(0, 38)}…`,
    r.damaged && r.whole && r.readings[0] === s, `unbalanced at character ${r.at}`);
}

check("a plain field is one reading", senseSplit("in the beginning").readings.length === 1);
check("balanced text reports no damage", unbalancedAt("a (b, c) d") === -1);
check("an opener never closed is damage", unbalancedAt("a (b, c d") >= 0);
check("a closer with nothing open is damage", unbalancedAt("a b) c") === 3);

// ---- and now the half that was missing: what actually shipped --------------
//
// One reading on display at a time is the reader's whole promise. A pill that
// holds several readings glued by a comma breaks it in the one way a reader
// cannot see: there is nothing to press, because the page believes it is
// showing one thing.
const { readFileSync, existsSync, readdirSync } = await import("node:fs");
const { gunzipSync } = await import("node:zlib");
const HERE2 = dirname(fileURLToPath(import.meta.url));
const ZONES = join(HERE2, "..", "data", "zones");
if (!existsSync(ZONES)) {
  console.log("\n  --    no zones directory here, so nothing shipped can be asked");
} else {
  const bins = readdirSync(ZONES).filter((f) => f.endsWith(".bin")).sort();
  let asked = 0, glued = 0, damaged = 0;
  const worst = [];
  for (const f of bins) {
    const z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8"));
    if ((z.emitted_from || {}).test_instrument) continue;
    for (const [k, text] of Object.entries(z.gloss || {})) {
      asked += 1;
      const r = senseSplit(String(text));
      if (r.damaged) damaged += 1;
      if (r.readings.length > 1) {
        glued += 1;
        if (worst.length < 5) worst.push(`${k} → ${JSON.stringify(text)} is ${r.readings.length}`);
      }
    }
  }
  if (!asked) {
    console.log("\n  --    no zone here carries a reading table, so nothing shipped can be asked");
  } else {
    console.log(`\n— and the readings that shipped, asked under the same rule —`);
    check("  every reading a zone prints is one reading by this rule", glued === 0,
      glued
        ? `${glued.toLocaleString()} of ${asked.toLocaleString()} hold more than one · ${worst.join(" · ")}`
        : `${asked.toLocaleString()} readings, each whole`);
    check("  and none was damaged by the split", damaged === 0,
      damaged ? `${damaged} carry a separator this rule cuts through` : "none");
  }
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
