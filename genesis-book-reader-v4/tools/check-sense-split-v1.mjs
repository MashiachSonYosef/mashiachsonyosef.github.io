#!/usr/bin/env node
// The rule that divides a provider's field into readings, tested on the fields
// themselves. No page, no store, no network: string in, readings out, and the
// pieces must rejoin to what they came from.
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
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
