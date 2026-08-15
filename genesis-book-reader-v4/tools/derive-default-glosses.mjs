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
// Every derived default is exactly that — the declared rule's output.
// Corrections ride as data in synthesis/gloss-overrides-genesis-1-1.js
// (never by editing reader code).
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
const RULE_ID =
  "synthesis-default-gloss-rule-v2-antiquity-primacy-1940-lastuary";
// Rule v2 · 2026-08-10: sort a word's routes by the
// oldest source year carrying them; sources after 1940 (or with no
// recorded year) form the last tier; ties break by ledger position. The
// pool is built exactly the way the reader builds selectable routes
// (choice + bundle helper routes), so the derived default always matches
// a real pill. Rule v1 (upstream_top5) is archived in the ledger rows.

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

const LASTUARY_AFTER = 1940;

const definitionMinYear = (definition) => {
  let minYear = Infinity;
  (definition?.mSources || []).forEach((source) => {
    const year = Number.parseInt(source?.sourceYear, 10);
    if (Number.isInteger(year)) minYear = Math.min(minYear, year);
  });
  return minYear;
};

hud.words.forEach((word) => {
  const cell = word.shapes?.[0]?.cells?.[0];
  const lb = cell?.lBundle;
  if (!lb) return;
  // Reader-identical pool: each choice contributes its bundle's helper
  // routes (or its own text); the route's year is the oldest source year
  // recorded for the choice's definition.
  const seen = new Map();
  (lb.choices || []).forEach((choice) => {
    const bundle = (lb.pBundles || []).find(
      (candidate) => candidate.id === choice.pBundleId,
    );
    const definition = bundle?.definitions?.find(
      (candidate) => candidate.id === choice.definitionId,
    );
    const year = definitionMinYear(definition);
    const ledger = Number.isInteger(choice.firstLedgerPosition)
      ? choice.firstLedgerPosition
      : 9e9;
    const helpers = bundle?.helperRoutes?.length
      ? bundle.helperRoutes
      : [{ text: choice.text }];
    helpers.forEach((helper) => {
      const text = String(helper.text || "").trim();
      if (!text) return;
      const key = text.toLowerCase();
      const prev = seen.get(key);
      if (!prev) seen.set(key, { text, year, ledger });
      else {
        prev.year = Math.min(prev.year, year);
        prev.ledger = Math.min(prev.ledger, ledger);
      }
    });
  });
  const pool = [...seen.values()];
  if (!pool.length) return;
  const tier = (route) =>
    Number.isFinite(route.year) && route.year <= LASTUARY_AFTER ? 0 : 1;
  pool.sort(
    (a, b) =>
      tier(a) - tier(b) || a.year - b.year || a.ledger - b.ledger,
  );
  const pick = pool[0];
  const signal =
    tier(pick) === 0
      ? `antiquity_${pick.year}`
      : "lastuary_only_no_pre_1940_source";
  const legacy = LEGACY_UNATTRIBUTED[word.index] || null;
  byWordIndex[word.index] = {
    gloss: pick.text,
    signal,
    source_year: Number.isFinite(pick.year) ? pick.year : null,
    ledger_position: pick.ledger,
    status: "DERIVED_DRAFT",
  };
  ledgerRows.push({
    word_index: word.index,
    hebrew: word.hebrew,
    derived: pick.text,
    signal,
    source_year: Number.isFinite(pick.year) ? pick.year : null,
    ledger_position: pick.ledger,
    oldest_alternatives: pool
      .slice(1, 6)
      .map((route) =>
        `${route.text} (${Number.isFinite(route.year) ? route.year : "no year"})`,
      ),
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
    "DERIVED_DRAFT — rule output; corrections ride as data (overrides or targum alignment)",
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
      note: "Dispute rows (agrees_with_legacy=false) resolve by data: an override row in synthesis/gloss-overrides-genesis-1-1.js or targum-alignment validation.",
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
