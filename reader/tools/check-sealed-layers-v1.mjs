#!/usr/bin/env node
// GUARDS: pass-through-rule-v1-a-sealed-layer-can-only-be-withheld-never-added
//
// No published zone is missing a layer the corpus lane sealed.
//
// Genesis shipped for months with no component layer: `spans: 0`, against
// 3,424 on I Kings. Not because the data was absent — every one of its 5,006
// keys had a row in the COMPspan template — but because build.sh took the
// template as an optional argument and nobody passed it. The zone recorded
// the omission in its own receipts, honestly, in a field nobody reads:
//
//     "no span slice supplied — this zone offers whole forms only"
//
// That sentence is the fault. This lane has no component boundaries of its
// own to contribute; the template is sealed upstream and passing it through
// creates nothing. So a zone without the layer is not a zone that lacked
// input — it is a zone where somebody, by omission, wrote a limit on what a
// reader may open. It was the one field in the file whose value came from a
// person rather than from a record, and a reader had no way to know.
//
// The rule that replaced it: a sealed layer can only be withheld, never
// added. Withholding is the act that needs justifying. This check is the
// version of that a build can fail on.
//
// It is deliberately narrow. It does not ask how many forms carry a component
// system — a zone whose forms genuinely have no rows in the template would
// pass with few, and that is the honest result. It asks only that the layer
// was supplied at all, because that is the difference between "the record
// says little here" and "nobody handed the record over".
//
// Run: node tools/check-sealed-layers-v1.mjs [zones-dir]

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ZONES = process.argv[2] || join(HERE, "..", "data", "zones");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

if (!existsSync(ZONES)) {
  console.log(`SKIPPED — no zones directory here (looked in "${ZONES}")`);
  process.exit(3);
}
const bins = readdirSync(ZONES).filter((f) => f.endsWith(".bin")).sort();
if (!bins.length) {
  console.log(`SKIPPED — no zones built yet in ${ZONES}`);
  process.exit(3);
}

// Every file here holds Hebrew a reader can open, whether it is a book or a
// commentary on one, so every one of them is asked the same two questions.
console.log("— every zone carries the layers the corpus lane sealed —");
let checked = 0, formsTotal = 0, instruments = 0;
for (const f of bins) {
  const z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8"));
  // A test instrument has no sealed template behind it, so it has nothing to
  // withhold. Asking it to carry a component layer asks it to invent one,
  // which is the exact act pass-through-rule-v1 exists to forbid. It says so
  // in its own file and is named here rather than passed over quietly.
  const ti = (z.emitted_from || {}).test_instrument;
  if (ti) {
    console.log(`  ${f} is a test instrument, not a work  ·  ${ti.no_component_layer_because || ti.is || "declared in the file"}`);
    instruments += 1;
    continue;
  }
  const layer = (z.emitted_from || {}).span_layer || {};
  const forms = Object.keys(z.spans || {}).length;
  checked += 1; formsTotal += forms;
  // 1 · the layer arrived
  check(`  ${f} was handed the COMPspan template`, forms > 0,
    forms > 0
      ? `${forms.toLocaleString()} forms carry a component system`
      : `withheld — ${layer.status || "the file carries no component layer and says nothing about why"}`);
  // 2 · and the file says which sealed file it came from, or it cannot be
  //     reproduced or audited by anyone downstream
  if (forms > 0) {
    const src = layer.source || {};
    check(`    and names the sealed file it came from`, !!(src.path && src.sha256),
      src.path ? `${src.path} · ${(src.sha256 || "no sha").slice(0, 16)}…`
        : "the spans are here and nothing records where they came from");
  }
}
check("  every zone in the directory was asked", checked + instruments === bins.length,
  `${checked} zones carrying ${formsTotal.toLocaleString()} component systems between them` +
  (instruments ? `, and ${instruments} test instrument${instruments === 1 ? "" : "s"} named and passed over` : ""));

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
