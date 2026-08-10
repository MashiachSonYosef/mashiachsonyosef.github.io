#!/usr/bin/env node
// Synthesis lane · derived default glosses, rule v1.
//
// The reader needs one visible gloss per base word before the reader makes
// any choice. That default must come from a declared rule, not a hand pick
// left in code. Rule v1, in order:
//   1. Among a word's deduplicated exact routes, prefer those the upstream
//      pipeline flagged selectedInTop5 (its contextual pass); take the one
//      with the earliest firstLedgerPosition. Signal name: upstream_top5.
//   2. If no route carries the flag, take the earliest-ledger route.
//      Signal name: ledger_order (arbitrary order — weakest evidence).
//
// Every derived default is a DRAFT until attested or validated. The reader
// marks derived defaults; humans attest better picks in
// synthesis/attestations-genesis-1-1.js (never by editing reader code).
// Known limits, recorded here on purpose:
//   - Function words (direct-object markers) have no contextual route in
//     the dictionaries; rule v1 will pick a homograph. Fix planned:
//     targum word-alignment disambiguation (Onkelos ית → marker).
//   - The upstream top5 flag is itself unvalidated.
//
// Rerun: node tools/derive-default-glosses.mjs

import { createRequire } from "node:module";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const require = createRequire(import.meta.url);

globalThis.window = {};
require(join(root, "data", "genesis-1-1-full-hud-2026-07-19.js"));
const hud = window.GENESIS_1_1_FULL_HUD_FIXTURE;

const GENERATED_ON = "2026-08-10";
const RULE_ID = "synthesis-default-gloss-rule-v1-top5-then-ledger";

// The seven picks previously hardcoded in reader code (V3/V4 lineage),
// preserved here as unattributed legacy picks so the dispute record is
// complete. They are not preferred by anything.
const LEGACY_UNATTRIBUTED = {
  1: "in the beginning",
  2: "cut down",
  3: "angels",
  4: "among",
  5: "sky",
  6: "and thou",
  7: "earth",
};

const byWordIndex = {};
const ledgerRows = [];

hud.words.forEach((word) => {
  const cell = word.shapes?.[0]?.cells?.[0];
  const lb = cell?.lBundle;
  if (!lb) return;
  const routes = [];
  lb.pBundles.forEach((bundle) =>
    (bundle.definitions || []).forEach((definition) =>
      (definition.exactRoutes || []).forEach((exact) => {
        routes.push({
          text: exact.text,
          top5: Boolean(exact.selectedInTop5),
          ledger: exact.firstLedgerPosition,
        });
      }),
    ),
  );
  const seen = new Map();
  routes.forEach((route) => {
    const key = route.text.toLowerCase();
    const prev = seen.get(key);
    if (!prev) seen.set(key, { ...route });
    else {
      prev.top5 = prev.top5 || route.top5;
      prev.ledger = Math.min(prev.ledger, route.ledger);
    }
  });
  const pool = [...seen.values()];
  const top5Pool = pool
    .filter((route) => route.top5)
    .sort((a, b) => a.ledger - b.ledger);
  const ledgerPool = [...pool].sort((a, b) => a.ledger - b.ledger);
  const pick = top5Pool[0] || ledgerPool[0];
  if (!pick) return;
  const signal = top5Pool[0] ? "upstream_top5" : "ledger_order";
  const legacy = LEGACY_UNATTRIBUTED[word.index] || null;
  byWordIndex[word.index] = {
    gloss: pick.text,
    signal,
    ledger_position: pick.ledger,
    status: "DERIVED_DRAFT",
  };
  ledgerRows.push({
    word_index: word.index,
    hebrew: word.hebrew,
    derived: pick.text,
    signal,
    ledger_position: pick.ledger,
    top5_pool: top5Pool.slice(0, 5).map((route) => route.text),
    legacy_unattributed_pick: legacy,
    agrees_with_legacy: legacy
      ? legacy.toLowerCase() === pick.text.toLowerCase()
      : null,
  });
});

const defaults = {
  fixture_id: `synthesis-defaults-genesis-1-1-${GENERATED_ON}`,
  ref: "Genesis 1:1",
  generated_on: GENERATED_ON,
  rule_id: RULE_ID,
  generator: "tools/derive-default-glosses.mjs",
  status:
    "DERIVED_DRAFT — every pick awaits attestation or targum-alignment validation",
  by_word_index: byWordIndex,
};

writeFileSync(
  join(root, "data", `synthesis-defaults-genesis-1-1-${GENERATED_ON}.js`),
  `window.SYNTHESIS_DEFAULT_GLOSSES = Object.freeze(${JSON.stringify(
    defaults,
    null,
    2,
  )});\n`,
);

mkdirSync(join(root, "synthesis"), { recursive: true });
writeFileSync(
  join(root, "synthesis", "ledger-genesis-1-1-defaults.json"),
  JSON.stringify(
    {
      ledger_id: `synthesis-ledger-genesis-1-1-defaults-${GENERATED_ON}`,
      rule_id: RULE_ID,
      generated_on: GENERATED_ON,
      note: "Dispute rows (agrees_with_legacy=false) await human attestation in synthesis/attestations-genesis-1-1.js or targum-alignment validation.",
      rows: ledgerRows,
    },
    null,
    2,
  ),
);

console.log("derived defaults:");
ledgerRows.forEach((row) =>
  console.log(
    ` word ${row.word_index} ${row.hebrew} → "${row.derived}" [${row.signal}]` +
      (row.agrees_with_legacy === false
        ? ` · disputes legacy "${row.legacy_unattributed_pick}"`
        : ""),
  ),
);
console.log(
  `disputes vs legacy: ${
    ledgerRows.filter((row) => row.agrees_with_legacy === false).length
  } of ${ledgerRows.length}`,
);
