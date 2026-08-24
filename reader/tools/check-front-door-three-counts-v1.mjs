#!/usr/bin/env node
// GUARDS: front-door-rule-v1-the-door-lists-what-the-zones-carry
//
// The front door names three grains. Physical and named-shelf counts are C0
// rows. Rendered coverage is counted independently as one record per COMPspan
// in the built zones and must never be relabelled as C0.

import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { resolve } from "node:path";
import assert from "node:assert/strict";
import { basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { zonesOnDisk } from "./zones-on-disk-v1.mjs";

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : fallback;
};
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const TEXT_PIN_RULE = "EXACT_GIT_BLOB_BYTES__LF_ENFORCED_BY_GITATTRIBUTES_V1";
// The engine directory's name is read from where this check stands, never
// typed; the deep-equal against the bindings record holds the derivation to
// the record, so a folder rename is one move and one record edit.
const ENGINE = basename(resolve(dirname(fileURLToPath(import.meta.url)), ".."));
const TEXT_PIN_PATHS = [
  "data/corpus-atlas-v1.json",
  "data/bezelal-front-door-counts-handoff-v1.json",
  "data/front-door-three-count-bindings-v1.json",
].map((rel) => `${ENGINE}/${rel}`);
const readBytes = (path) => readFileSync(resolve(path));
const readJson = (path) => JSON.parse(readBytes(path).toString("utf8"));
const n = (value) => Number(value).toLocaleString("en-US");
const text = (html) => html.replace(/<[^>]*>/g, " ").replace(/&middot;/g, "·").replace(/\s+/g, " ").trim();
const block = (html, key) => {
  const match = html.match(new RegExp(`<p class="count" data-count="${key}">([\\s\\S]*?)<\\/p>`));
  assert(match, `missing count block ${key}`);
  return text(match[1]);
};

const htmlPath = arg("html", "../index.html");
const readmePath = arg("readme", "../README.md");
const receiptPath = arg("receipt", "../front-door-counts-receipt-v1.json");
const atlasPath = arg("atlas", "data/corpus-atlas-v1.json");
const handoffPath = arg("physical-handoff", "data/bezelal-front-door-counts-handoff-v1.json");
const bindingsPath = arg("count-bindings", "data/front-door-three-count-bindings-v1.json");
const gitattributesPath = arg("gitattributes", "../.gitattributes");

for (const path of [htmlPath, readmePath, receiptPath, atlasPath, handoffPath, bindingsPath, gitattributesPath])
  assert(existsSync(resolve(path)), `required input absent: ${path}`);

const html = readBytes(htmlPath).toString("utf8");
const readme = readBytes(readmePath).toString("utf8");
const receiptBytes = readBytes(receiptPath);
const receipt = JSON.parse(receiptBytes.toString("utf8"));
const atlasBytes = readBytes(atlasPath);
const handoffBytes = readBytes(handoffPath);
const handoff = JSON.parse(handoffBytes.toString("utf8"));
const bindingsBytes = readBytes(bindingsPath);
const bindings = JSON.parse(bindingsBytes.toString("utf8"));
const gitattributes = readBytes(gitattributesPath).toString("utf8");
const genesisV3 = bindings.inputs.genesis_clean_successor_v3;
// The candidate zone the bindings pin may be withheld from the tree. Its
// pins then stand as recorded history; the byte checks wait for the bytes,
// and the absence must be accounted: a withheld zone may not appear in the
// receipt's served set. The engine-relative path is the record's own field,
// not a prefix stripped by this check.
const genesisZonePath = genesisV3.zone.module_path;
const genesisZoneHere = existsSync(resolve(genesisZonePath));
const genesisZoneBytes = genesisZoneHere ? readBytes(genesisZonePath) : null;
const genesisZone = genesisZoneHere ? JSON.parse(gunzipSync(genesisZoneBytes).toString("utf8")) : null;

let passed = 0;
const check = (name, fn) => {
  fn();
  passed += 1;
  console.log(`  ok  ${name}`);
};

const exactLfActual = (label, bytes) => {
  assert(!bytes.includes(0x0d), `${label} contains CR bytes despite ${TEXT_PIN_RULE}`);
  return { bytes: bytes.length, sha256: sha256(bytes), byte_hash_rule: TEXT_PIN_RULE };
};

check("exact-byte text inputs are forced to LF by repository attributes", () => {
  assert.equal(bindings.exact_text_input_policy?.rule, TEXT_PIN_RULE);
  assert.equal(bindings.exact_text_input_policy?.gitattributes_path, ".gitattributes");
  assert.deepEqual(bindings.exact_text_input_policy?.paths, TEXT_PIN_PATHS);
  const lines = new Set(gitattributes.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith("#")));
  for (const path of TEXT_PIN_PATHS) assert(lines.has(`${path} text eol=lf`), `missing LF attribute for ${path}`);
  exactLfActual("count bindings", bindingsBytes);
});
check("logical atlas is its exact LF Git-blob pin", () => {
  const actual = exactLfActual("logical atlas", atlasBytes);
  assert.equal(bindings.inputs.logical_atlas.byte_hash_rule, TEXT_PIN_RULE);
  assert.equal(actual.bytes, bindings.inputs.logical_atlas.bytes);
  assert.equal(actual.sha256, bindings.inputs.logical_atlas.sha256);
});
check("physical handoff is its exact LF Git-blob pin", () => {
  const actual = exactLfActual("physical handoff", handoffBytes);
  assert.equal(bindings.inputs.physical_handoff.byte_hash_rule, TEXT_PIN_RULE);
  assert.equal(actual.bytes, bindings.inputs.physical_handoff.bytes);
  assert.equal(actual.sha256, bindings.inputs.physical_handoff.sha256);
});
check("physical atlas and logical overlay carry sealed SHA-256 pins", () => {
  for (const value of [
    bindings.inputs.physical_atlas.sha256,
    bindings.inputs.physical_atlas.closed_world_seal_sha256,
    bindings.inputs.logical_overlay.sha256,
    bindings.inputs.logical_overlay.validation_sha256,
    bindings.inputs.logical_overlay.closed_world_seal_sha256,
  ]) assert.match(value, /^[0-9a-f]{64}$/);
});
check("clean Genesis v3 authority chain carries exact pins", () => {
  assert.equal(genesisV3.grain, "ONE_RENDER_RECORD_PER_COMPSPAN");
  for (const pin of [
    genesisV3.zone,
    genesisV3.front_door_handoff,
    genesisV3.defect_provenance,
    genesisV3.validation,
    genesisV3.closed_world_seal,
  ]) {
    assert(Number.isSafeInteger(pin.bytes) && pin.bytes > 0);
    assert.match(pin.sha256, /^[0-9a-f]{64}$/);
  }
  if (genesisZoneHere) {
    assert.equal(genesisZoneBytes.length, genesisV3.zone.bytes);
    assert.equal(sha256(genesisZoneBytes), genesisV3.zone.sha256);
  } else {
    assert(
      !receipt.rendered.zones.some((zone) => zone.path === genesisV3.zone.module_path),
      "the pinned candidate zone is absent from the tree yet the receipt claims to serve it",
    );
  }
});
check("clean Genesis zone is one rendered record per canonical COMPspan", () => {
  if (!genesisZoneHere) {
    // Withheld: nothing to count. The pins above still had to hold shape,
    // and the served-set law below still refuses a receipt that serves it.
    return;
  }
  const counts = genesisV3.counts;
  const clean = genesisZone.clean_successor;
  const rows = genesisZone.sections.reduce((total, section) => total + section.words.length, 0);
  const joinedRecords = clean.presentation_join_groups
    .reduce((total, group) => total + group.canonical_successor_occurrence_ids.length, 0);
  assert.equal(rows, counts.canonical_compspan_records);
  assert.equal(rows, counts.rendered_compspan_records);
  assert.equal(genesisZone.counts.clean_compspan_successor_occurrences, counts.canonical_compspan_records);
  assert.equal(genesisZone.counts.source_orthographic_records, counts.folded_source_orthographic_records);
  assert.equal(genesisZone.counts.physical_c0_rows, counts.physical_c0_rows);
  assert.equal(clean.one_render_record_per_compspan, true);
  assert.equal(clean.rendered_records, counts.rendered_compspan_records);
  assert.equal(clean.presentation_join_groups.length, counts.presentation_join_groups);
  assert.equal(joinedRecords, counts.presentation_join_records);
  assert.equal(clean.raw_markup_rows, counts.raw_markup_records);
  assert.equal(clean.apparatus_rows_rendered_as_text, counts.apparatus_records_rendered_as_text);
  assert.equal(clean.mid_word_split_rows, counts.mid_word_split_records);
});

const physical = handoff.physical.physical_terminal_c0_rows;
const mapped = handoff.logical.physical_and_logically_mapped_rows;
const plan = handoff.logical.logical_plan_rows;
const notPhysical = handoff.logical.logical_plan_not_physical_rows;
const unmapped = handoff.logical.physically_queryable_logical_shelf_unmapped_rows;
check("physical and logical partitions close exactly", () => {
  assert.equal(physical, mapped + unmapped);
  assert.equal(plan, mapped + notPhysical);
});
check("receipt preserves every handoff count", () => {
  assert.deepEqual(receipt.counts, {
    current_physical_c0_rows: physical,
    physically_backed_c0_rows_on_named_work_unit_shelves: mapped,
    rendered_compspan_records: receipt.counts.rendered_compspan_records,
    logical_plan_c0_rows: plan,
    logical_plan_c0_rows_not_physical: notPhysical,
    physical_c0_rows_not_yet_mapped_to_named_shelf: unmapped,
  });
});
check("receipt binds every compact authority", () => {
  const bindingsActual = exactLfActual("count bindings", bindingsBytes);
  assert.deepEqual(receipt.exact_text_input_policy, bindings.exact_text_input_policy);
  assert.equal(receipt.inputs.logical_atlas.sha256, bindings.inputs.logical_atlas.sha256);
  assert.equal(receipt.inputs.logical_atlas.byte_hash_rule, TEXT_PIN_RULE);
  assert.equal(receipt.inputs.physical_handoff.sha256, bindings.inputs.physical_handoff.sha256);
  assert.equal(receipt.inputs.physical_handoff.byte_hash_rule, TEXT_PIN_RULE);
  assert.deepEqual(receipt.inputs.count_bindings, { path: bindingsPath, ...bindingsActual });
  assert.equal(receipt.inputs.physical_atlas.sha256, bindings.inputs.physical_atlas.sha256);
  assert.equal(receipt.inputs.logical_overlay.sha256, bindings.inputs.logical_overlay.sha256);
  assert.deepEqual(receipt.inputs.genesis_clean_successor_v3, genesisV3);
});

let dynamicRendered = 0;
const recomputedZones = [];
for (const pinned of receipt.rendered.zones) {
  assert.match(pinned.path, /^data\/zones\/[a-z0-9-]+\.bin$/);
  const bytes = readBytes(pinned.path);
  const zone = JSON.parse(gunzipSync(bytes).toString("utf8"));
  const rows = (zone.sections || []).reduce((total, section) => total + (section.words || []).length, 0);
  assert.equal(bytes.length, pinned.bytes, `${pinned.path} byte length`);
  assert.equal(sha256(bytes), pinned.sha256, `${pinned.path} sha256`);
  assert.equal(rows, pinned.rendered_compspan_records, `${pinned.path} rendered COMPspan records`);
  dynamicRendered += rows;
  recomputedZones.push(pinned);
}
check("rendered count is dynamically derived from pinned built zones", () => {
  assert.equal(dynamicRendered, receipt.counts.rendered_compspan_records);
  // The record's own law (grain_law.rendered_snapshot): the rendered figure
  // is recomputed from the zones on disk on every build and is never held to
  // a typed figure. The set the receipt pins is exactly the set the
  // directory carries — no more, no less.
  const onDisk = zonesOnDisk().map((slug) => `data/zones/${slug}.bin`).sort();
  const pinnedPaths = receipt.rendered.zones.map((zone) => zone.path).sort();
  assert.deepEqual(pinnedPaths, onDisk, "the receipt's served set is not the set on disk");
  assert.equal(receipt.rendered.built_zones, receipt.rendered.zones.length);
  assert.equal(receipt.rendered.compspan_records, dynamicRendered);
  assert.equal(receipt.rendered.zone_manifest_sha256, sha256(Buffer.from(JSON.stringify(recomputedZones))));
});
check("receipt marks rendered coverage as a current-zone snapshot", () => {
  assert.equal(receipt.snapshot.kind, "CURRENT_BUILT_ZONE_BYTES_AT_BUILD_TIME");
  assert.equal(receipt.snapshot.recomputed_from_zone_bytes_on_every_build, true);
  assert.equal(receipt.snapshot.future_zone_successor_behavior, "RECOMPUTE_RENDERED_COMPSPAN_RECORDS_WITHOUT_TYPED_COUNT_EDIT");
  assert.equal(receipt.snapshot.zone_manifest_sha256, receipt.rendered.zone_manifest_sha256);
});

check("three primary DOM counts use their exact grains", () => {
  assert.equal(block(html, "current-physical-c0"), `${n(physical)} current physical C0 rows`);
  assert.equal(block(html, "named-shelf-c0"), `${n(mapped)} physically backed C0 rows on named work/unit shelves`);
  const rendered = block(html, "rendered-compspan-records");
  assert.equal(rendered, `${n(dynamicRendered)} rendered COMPspan records in ${n(receipt.rendered.built_zones)} built zones`);
  assert(!/C0/i.test(rendered), "rendered count block calls COMPspan records C0");
});
check("secondary DOM disclosures are complete", () => {
  const page = text(html);
  assert(page.includes(`Logical plan: ${n(plan)} C0 rows`));
  assert(page.includes(`logical-plan C0 rows not physical: ${n(notPhysical)}`));
  assert(page.includes(`physical C0 rows not yet mapped to a named shelf: ${n(unmapped)}`));
  assert(page.includes("The rendered figure is a current-zone snapshot and a different grain"));
  assert(page.includes("It is recomputed from those zones on every build."));
});
check("DOM data pins bind the exact source hashes", () => {
  assert(html.includes(`data-text-input-byte-rule="${TEXT_PIN_RULE}"`));
  assert(html.includes(`data-logical-atlas-sha256="${bindings.inputs.logical_atlas.sha256}"`));
  assert(html.includes(`data-physical-handoff-sha256="${bindings.inputs.physical_handoff.sha256}"`));
  assert(html.includes(`data-physical-atlas-sha256="${bindings.inputs.physical_atlas.sha256}"`));
  assert(html.includes(`data-logical-overlay-sha256="${bindings.inputs.logical_overlay.sha256}"`));
  assert(html.includes(`data-genesis-clean-zone-sha256="${genesisV3.zone.sha256}"`));
  assert(html.includes(`data-genesis-clean-handoff-sha256="${genesisV3.front_door_handoff.sha256}"`));
  assert(html.includes(`data-genesis-clean-validation-sha256="${genesisV3.validation.sha256}"`));
  assert(html.includes(`data-genesis-clean-seal-sha256="${genesisV3.closed_world_seal.sha256}"`));
  assert(html.includes(`data-rendered-zone-manifest-sha256="${receipt.rendered.zone_manifest_sha256}"`));
});
check("embedded DOM receipt equals the emitted JSON receipt", () => {
  const match = html.match(/<script id="front-door-counts-receipt" type="application\/json">([\s\S]*?)<\/script>/);
  assert(match, "embedded count receipt absent");
  assert.deepEqual(JSON.parse(match[1]), receipt);
});
check("superseded rendered snapshots are forbidden from public output and generator", () => {
  const generator = readBytes("tools/build-front-door-v1.mjs").toString("utf8");
  const surface = `${html}\n${readme}\n${receiptBytes}\n${generator}`;
  for (const stale of ["46,095", "46095", "46,097", "46097"])
    assert(!surface.includes(stale), `superseded snapshot leaked: ${stale}`);
});
check("public outputs make no Genesis defect or cross-grain comparison claim", () => {
  const publicText = `${html}\n${readme}`;
  for (const forbidden of [
    "Genesis renders",
    "its old logical plan names",
    "known cross-grain red flag",
    "Genesis error",
    "Genesis defect",
    "Genesis mismatch",
  ]) assert(!publicText.includes(forbidden), `public output contains forbidden wording: ${forbidden}`);
});
check("C0 and COMPspan grains are never given the same label", () => {
  const generator = readBytes("tools/build-front-door-v1.mjs").toString("utf8");
  assert(!/C0 words/i.test(`${html}\n${readme}`));
  assert.equal(receipt.grains.rendered_compspan_records, "ONE_RECORD_PER_COMPSPAN__NOT_C0_ROWS");
  assert.equal(receipt.grains.physical_c0_rows, "C0_ROWS");
  assert.equal(receipt.grains.named_shelf_c0_rows, "C0_ROWS");
  for (const typed of [n(dynamicRendered), String(dynamicRendered)])
    assert(!generator.includes(typed), `generator typed the current rendered snapshot: ${typed}`);
});
check("existing shelf fold and live-search hooks remain", () => {
  assert(html.includes('<form id="find" role="search"'));
  assert(html.includes('oninput="sift()"'));
  const details = [...html.matchAll(/<details class="fam"([^>]*)>/g)];
  const inner = [...html.matchAll(/<details class="fold"([^>]*)>/g)];
  // How many folds the door carries is the records' business — the ledger's
  // shelves, the works seated or grouped. A count typed here went stale the
  // day a work was withheld. What holds between builds: shelves exist, and
  // nothing rests open.
  assert(details.length > 0, "the door carries no family shelf at all");
  assert(details.every((match) => !/\bopen\b/.test(match[1])), "a shelf rests open");
  assert(inner.every((match) => !/\bopen\b/.test(match[1])), "a commentary fold rests open");
});
check("the door links every zone the receipt serves", () => {
  // The rule this file guards, asserted directly: the door lists what the
  // zones carry. Every zone the receipt pins is reachable from the door.
  for (const pinned of receipt.rendered.zones) {
    const slug = pinned.path.replace(/^data\/zones\//, "").replace(/\.bin$/, "");
    assert(html.includes(`href="/${slug}"`), `the door does not link /${slug}`);
  }
});

console.log(`\nall checks passed · ${passed} assertions · ${dynamicRendered.toLocaleString("en-US")} rendered COMPspan records`);
