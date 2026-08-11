#!/usr/bin/env node
// Synthesis lane · commentary word shards for Rashi on Genesis 1:1:1.
//
// The nested Rashi fixture (data/nested-rashi-hud-2026-07-17.js) references
// 64 per-word shard files under data/nested-rashi-hud-words/ that were never
// published in any branch. This tool generates them from the repository's own
// licensed lexical corpus (data/lexical/ on the main branch), so Rashi's words
// open the same exact L/D/M HUD as base-text words.
//
// Rule (declared before outputs were accepted):
//   RULE_ID nested-word-shards-rule-v1-exact-form-corpus-link
//   1. For each fixture word (its normalized exact_key), take the lexical
//      corpus entry whose hebrew_word equals the key, exactly. The work slice
//      (rashi-on-genesis chunk lexicons) is consulted first; when it carries
//      no entry — or its entry yields no displayable record — the global
//      source layers are consulted. No prefix stripping, no stemming, no
//      derivation is performed here.
//   2. Each dictionary record (possible_entry) with at least one English
//      strict_rendering and a resolvable license becomes a P bundle; each
//      rendering becomes one definition and one selectable route. Corpus
//      order is preserved — the corpus marks its own likely-contextual entry
//      first, and that order is the ledger order.
//   3. M source records come from the corpus's own source_rows (chunk-level
//      or entry-level); a record whose license cannot be resolved to a known
//      posture is skipped and the skip is written to the ledger. Source years
//      are S_NO_SOURCE_YEAR — the corpus records none, so none are invented.
//   4. A word with no usable record is emitted as a held shard carrying its
//      hold reason. Nothing is invented for it.
//
// Inputs (cache these from the main branch before running):
//   tools/corpus-cache/rashi-on-genesis-chunks/*.json
//   tools/corpus-cache/source-layers/*.json
//     (from data/lexical/… on https://github.com/MashiachSonYosef/
//      mashiachsonyosef.github.io main branch)
//
// Outputs:
//   data/nested-rashi-hud-words/<hash>.js   (64 files, exact fixture paths)
//   synthesis/ledger-rashi-1-1-1-word-shards.json
//
// Rerun: node tools/generate-rashi-word-shards.mjs   (deterministic)

import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  existsSync,
} from "node:fs";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

const GENERATED_ON = "2026-08-11";
const RULE_ID = "nested-word-shards-rule-v1-exact-form-corpus-link";
const GENERATOR = "tools/generate-rashi-word-shards.mjs";
const REGISTRY = "NESTED_RASHI_HUD_WORDS";
const REF = "Rashi on Genesis 1:1:1";

// ---------------------------------------------------------------- fixture
const fixtureRaw = readFileSync(
  join(root, "data", "nested-rashi-hud-2026-07-17.js"),
  "utf8",
);
const fixture = JSON.parse(
  fixtureRaw.slice(fixtureRaw.indexOf("{")).trim().replace(/;$/u, ""),
);
const wordIndex = fixture.exact_hud.word_index;

// ----------------------------------------------------------------- corpus
const chunkDir = join(here, "corpus-cache", "rashi-on-genesis-chunks");
const layerDir = join(here, "corpus-cache", "source-layers");
if (!existsSync(chunkDir) || !existsSync(layerDir)) {
  console.error(
    "Corpus cache missing. Fetch data/lexical/rashi-on-genesis-chunks/*.json " +
      "and data/lexical/source-layers/*.json from the repository main branch " +
      "into tools/corpus-cache/ first.",
  );
  process.exit(1);
}

const chunkSourceRows = {};
const workEntriesByWord = new Map();
for (const file of readdirSync(chunkDir).sort()) {
  if (!file.endsWith(".json")) continue;
  const chunk = JSON.parse(readFileSync(join(chunkDir, file), "utf8"));
  Object.assign(chunkSourceRows, chunk.source_rows || {});
  for (const entry of chunk.lexicon?.entries || []) {
    // Entry ids are globally stable across chunks (verified: zero
    // conflicting ids across all fifteen chunks); first occurrence wins.
    if (!workEntriesByWord.has(entry.hebrew_word)) {
      workEntriesByWord.set(entry.hebrew_word, entry);
    }
  }
}

const layers = [];
const layerEntriesByWord = new Map();
for (const file of readdirSync(layerDir).sort()) {
  if (!file.endsWith(".json")) continue;
  const layer = JSON.parse(readFileSync(join(layerDir, file), "utf8"));
  layers.push({ id: layer.layer_id || basename(file), license: layer.license });
  for (const entry of layer.entries || []) {
    if (!layerEntriesByWord.has(entry.hebrew_word)) {
      layerEntriesByWord.set(entry.hebrew_word, {
        ...entry,
        _layer_id: layer.layer_id || basename(file),
        _layer_license: layer.license,
      });
    }
  }
}

// --------------------------------------------------------------- licenses
// Corpus license strings → the reader's existing posture vocabulary.
// An unknown license is never guessed; the record is skipped on the ledger.
const LICENSE_POSTURES = new Map([
  ["CC0", "cc0_public_domain"],
  ["project-authored / CC0", "cc0_public_domain"],
  ["CC BY 4.0", "cc_by_4_0"],
  ["CC BY-SA 4.0", "cc_by_sa_4_0"],
  ["CC BY-SA 3.0", "cc_by_sa_3_0"],
  ["CC BY-SA 4.0 / GFDL", "cc_by_sa_gfdl"],
]);
const LICENSE_POINTERS = new Map([
  ["cc0_public_domain", "https://creativecommons.org/publicdomain/zero/1.0/"],
  ["cc_by_4_0", "https://creativecommons.org/licenses/by/4.0/"],
  ["cc_by_sa_4_0", "https://creativecommons.org/licenses/by-sa/4.0/"],
  ["cc_by_sa_3_0", "https://creativecommons.org/licenses/by-sa/3.0/"],
  ["cc_by_sa_gfdl", "https://creativecommons.org/licenses/by-sa/4.0/"],
]);

const findSourceRow = (entry, pe) => {
  // 1. The entry's own source_rows (layer entries carry them inline).
  for (const row of entry.source_rows || []) {
    if (
      row.source_family === pe.source_family &&
      String(row.source_id) === String(pe.source_id)
    ) {
      return row;
    }
  }
  // 2. Chunk-level source_rows, keyed "family|id|license".
  const prefix = `${pe.source_family}|${pe.source_id}|`;
  for (const [key, row] of Object.entries(chunkSourceRows)) {
    if (key.startsWith(prefix) || key === `${pe.source_family}|${pe.source_id}`) {
      return row;
    }
  }
  return null;
};

const resolveMSource = (entry, pe, layerLicense) => {
  const row = findSourceRow(entry, pe);
  const licenseText = row?.license || layerLicense || "";
  const posture = LICENSE_POSTURES.get(licenseText.trim());
  if (!posture) {
    return { skipped: { entry_key: pe.entry_key, license: licenseText } };
  }
  const licensePointer =
    row?.license_url || LICENSE_POINTERS.get(posture) || "";
  let externalCitation = row?.source_url || "";
  if (!externalCitation && pe.source_family === "wikidata") {
    externalCitation = `https://www.wikidata.org/wiki/Lexeme:${pe.source_id}`;
  }
  const source = {
    key: `${pe.source_family}:${pe.source_id}`,
    label: pe.source_name || row?.source_name || pe.source_family,
    licensePosture: posture,
    licensePointer,
    sourceYear: "S_NO_SOURCE_YEAR",
  };
  if (externalCitation) source.externalCitation = externalCitation;
  if (row?.fields_used) source.fieldsUsed = row.fields_used;
  if (row?.notes) source.sourceNotes = row.notes;
  return { source };
};

// ------------------------------------------------------------------ build
const shardDir = join(root, "data", "nested-rashi-hud-words");
mkdirSync(shardDir, { recursive: true });

const ledgerRows = [];
let wokenCount = 0;
let heldCount = 0;
let totalRoutes = 0;
let totalDefinitions = 0;

for (const indexEntry of wordIndex) {
  const { normalized, hebrew, script } = indexEntry;
  const hash = basename(script, ".js");
  const wordId = `NRW-${hash}`;
  const bundleId = `NRL-${hash}`;

  const buildFromEntry = (candidate) => {
    const built = {
      pBundles: [],
      choices: [],
      skips: [],
      entryKeysUsed: [],
    };
    let ledgerPosition = 0;
    for (const pe of candidate?.possible_entries || []) {
      const renderings = (pe.strict_renderings || [])
        .map((text) => String(text).trim())
        .filter(Boolean);
      if (!renderings.length) continue;
      const resolved = resolveMSource(candidate, pe, candidate?._layer_license);
      if (resolved.skipped) {
        built.skips.push(resolved.skipped);
        continue;
      }
      const pbId = `${bundleId}-PB-${String(built.pBundles.length + 1).padStart(4, "0")}`;
      const definitions = renderings.map((text, index) => {
        ledgerPosition += 1;
        const defId = `${pbId}-D-${String(index + 1).padStart(4, "0")}`;
        built.choices.push({
          id: `${pbId}-C-${String(index + 1).padStart(4, "0")}`,
          key: defId,
          text,
          firstLedgerPosition: ledgerPosition,
          sourceYears: ["S_NO_SOURCE_YEAR"],
          pBundleId: pbId,
          definitionId: defId,
        });
        return {
          id: defId,
          text,
          firstLedgerPosition: ledgerPosition,
          helperRoutes: [],
          exactRoutes: [{ text, firstLedgerPosition: ledgerPosition }],
          mSources: [resolved.source],
          lemma: pe.lemma || "",
          entryKey: pe.entry_key,
          contextRole: pe.context_role || "",
          relationLabel: pe.relation_label || "",
        };
      });
      built.pBundles.push({
        id: pbId,
        label: `${pe.lemma || candidate.hebrew_word} · ${pe.source_name}`,
        firstLedgerPosition: definitions[0].firstLedgerPosition,
        helperRoutes: [],
        definitions,
      });
      built.entryKeysUsed.push(pe.entry_key);
    }
    return built;
  };

  // Work slice first; when its entry yields nothing displayable, the
  // global layers are consulted for the same exact form.
  let matchedFrom = null;
  let entry = workEntriesByWord.get(normalized) || null;
  if (entry) matchedFrom = "work_slice_rashi_on_genesis";
  let built = buildFromEntry(entry);
  if (!built.choices.length) {
    const layerEntry = layerEntriesByWord.get(normalized) || null;
    if (layerEntry) {
      const layerBuilt = buildFromEntry(layerEntry);
      if (layerBuilt.choices.length || !entry) {
        built = {
          ...layerBuilt,
          skips: [...built.skips, ...layerBuilt.skips],
        };
        matchedFrom = entry
          ? `global_layer_${layerEntry._layer_id} (work slice unresolvable)`
          : `global_layer_${layerEntry._layer_id}`;
        entry = layerEntry;
      }
    }
  }
  const { pBundles, choices, skips, entryKeysUsed } = built;

  const provenance = {
    generated_on: GENERATED_ON,
    generator: GENERATOR,
    rule_id: RULE_ID,
    corpus: "data/lexical (main branch)",
    matched_from: matchedFrom || "no_corpus_entry",
    corpus_entry_id: entry?.entry_id || null,
    corpus_context_note: entry?.context_note || "",
  };

  let word;
  if (choices.length) {
    wokenCount += 1;
    totalRoutes += choices.length;
    totalDefinitions += pBundles.reduce(
      (sum, bundle) => sum + bundle.definitions.length,
      0,
    );
    word = {
      id: wordId,
      ref: REF,
      normalized,
      hebrew,
      provenance,
      shapes: [
        {
          id: `${wordId}:whole`,
          kind: "whole span",
          label: hebrew,
          cells: [
            {
              displayIndex: 1,
              compcellTemplateId: `${wordId}-CELL-0001`,
              surface: hebrew,
              kind: "maximal",
              spanRole: "whole span",
              kNormalizedKey: normalized,
              lBundleId: bundleId,
              matchBasis: "EXACT_NORMALIZED_FORM_CORPUS_LINK",
              lBundle: { id: bundleId, choices, pBundles },
            },
          ],
        },
      ],
    };
  } else {
    heldCount += 1;
    word = {
      id: wordId,
      ref: REF,
      normalized,
      hebrew,
      provenance,
      shapes: [],
      hold_reason: entry
        ? "The lexical corpus links no dictionary record with English renderings and a resolvable license for this exact form. No gloss has been invented."
        : "The lexical corpus carries no entry for this exact form (no prefix stripping or stemming is performed). No gloss has been invented.",
    };
  }

  const banner =
    `// Generated by ${GENERATOR} (${RULE_ID}) on ${GENERATED_ON}.\n` +
    `// Source: the repository's licensed lexical corpus (data/lexical, main branch).\n` +
    `// Word: ${normalized} · ${REF}. Regenerate with: node ${GENERATOR}\n`;
  writeFileSync(
    join(shardDir, `${hash}.js`),
    `${banner}window.${REGISTRY} = window.${REGISTRY} || {};\n` +
      `window.${REGISTRY}[${JSON.stringify(normalized)}] = ${JSON.stringify(
        word,
        null,
        1,
      )};\n`,
  );

  ledgerRows.push({
    normalized,
    hebrew,
    shard: script,
    matched_from: matchedFrom || "no_corpus_entry",
    corpus_entry_id: entry?.entry_id || null,
    dictionary_records_used: entryKeysUsed,
    route_count: choices.length,
    skipped_unresolvable_license: skips,
    status: choices.length ? "WOKEN" : "HELD",
  });
}

mkdirSync(join(root, "synthesis"), { recursive: true });
writeFileSync(
  join(root, "synthesis", "ledger-rashi-1-1-1-word-shards.json"),
  JSON.stringify(
    {
      ledger_id: `synthesis-ledger-rashi-1-1-1-word-shards-${GENERATED_ON}`,
      rule_id: RULE_ID,
      generated_on: GENERATED_ON,
      registry: REGISTRY,
      ref: REF,
      totals: {
        fixture_words: wordIndex.length,
        woken: wokenCount,
        held: heldCount,
        selectable_routes: totalRoutes,
        definitions: totalDefinitions,
      },
      known_limits: [
        "Exact-form matching only: inflected or clitic-prefixed forms the corpus itself left unmatched stay held (16 of 64). A declared clitic-stripping retry rule is roadmap work, recorded before any such output is accepted.",
        "The corpus records no source years, so every route sits in the lastuary tier of the antiquity ordering until year evidence exists.",
        "Ramban and Onkelos are not in the lexical corpus (checked all 1,401 work manifests); their words cannot be generated from this source and their comments keep the whole proof text.",
        "Form-matched homographs can lead a word's default (the same limit rule v2 records for base words), and Strong's-derived renderings arrive comma-split, so fragments like 'properly' can surface as routes. Both are upstream K-lane corpus repairs, not reader edits.",
        "The corpus's grammar-particle records (e.g. של → possessive 'of') carry the license string 'N/A - project lexical rule', which maps to no declared posture; they are skipped rather than guessed, and the form falls back to layer dictionaries.",
      ],
      rows: ledgerRows,
    },
    null,
    2,
  ),
);

console.log(
  `${wokenCount} woken · ${heldCount} held · ${totalRoutes} routes · ${totalDefinitions} definitions`,
);
ledgerRows
  .filter((row) => row.status === "HELD")
  .forEach((row) => console.log(` held: ${row.normalized} (${row.matched_from})`));
