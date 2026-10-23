#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";

const compareUtf8 = (a, b) => Buffer.compare(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
const fail = (code, detail = "") => { throw new Error(detail ? `${code}:${detail}` : code); };
const exactKeys = (value, expected, code) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(code, "OBJECT");
  const actual = Object.keys(value).sort(compareUtf8);
  const wanted = [...expected].sort(compareUtf8);
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) fail(code, JSON.stringify(actual));
};
const workSetRoot = (ids) => {
  const hash = createHash("sha256");
  for (const id of [...ids].sort(compareUtf8)) hash.update(`${id}\n`);
  return hash.digest("hex");
};
const rowSequenceRoot = (rows) => {
  const hash = createHash("sha256");
  for (const row of rows) {
    const bytes = Buffer.from(JSON.stringify(row), "utf8");
    const length = Buffer.alloc(4);
    length.writeUInt32LE(bytes.length);
    hash.update(length).update(bytes);
  }
  return hash.digest("hex");
};
const EXPECTED_SOURCE = {
  contract: { path: "corpus-refinement-v1/work/oholiab-elijah-active-attribution-display-table-v3/contract-v3.json", bytes: 5744, sha256: "df440699a1d2545a1456a0d84440593ae5752214bcec7d7549fd2cae7c82e6f0" },
  table: { path: "corpus-refinement-v1/work/oholiab-elijah-active-attribution-display-table-v3/candidate/work-attribution-v3.csv", bytes: 187166, sha256: "34dc9de986b725271414d7868d240c4208ae4f3fa986f4737433d516851825e1" },
  provenance: { path: "corpus-refinement-v1/work/oholiab-elijah-active-attribution-display-table-v3/candidate/work-attribution-provenance-v3.csv", bytes: 139331, sha256: "a51d1653f944bb157d639e3b7bba8189bbea8a28f94007a2b28160153fbbe10c" },
  obligations: { path: "corpus-refinement-v1/work/oholiab-elijah-active-attribution-display-table-v3/candidate/selection-attribution-obligations-v3.csv", bytes: 199624, sha256: "86946c6aa0d913941447478d74d2b576d50b1bd8cb345c52f117e9fc6d07ba38" },
  build_receipt: { path: "corpus-refinement-v1/work/oholiab-elijah-active-attribution-display-table-v3/candidate/build-receipt-v3.json", bytes: 3410, sha256: "7b5cc57729c2efa2b3cca043f5b779c45c15036ffbec34dbd8876fbae71827fa" },
  validation: { path: "corpus-refinement-v1/work/oholiab-elijah-active-attribution-display-table-v3/validation/independent-validation-v3.json", bytes: 7847, sha256: "aa6cc6b71d9cd25a59a60a93d831f0632ccc345300a1f3d3ed7d44f2c309b644" },
  seal: { path: "corpus-refinement-v1/work/oholiab-elijah-active-attribution-display-table-v3/candidate/closed-world-seal-v3.json", bytes: 7604, sha256: "45a9ae391f3369d4f120d1ca0196e103a3030582b8e5e69e76105bee45169efc" }
};
const EXPECTED_COUNTS = { works: 318, display_ready: 315, display_held: 3, distribution_ready: 43, distribution_held: 275 };
const EXPECTED_ROOTS = {
  corrected_work_set_sha256: "a9746fca0521f8afb6be44c44e63b65afc224ea4406a27d13b312df44e51ac10",
  distribution_ready_work_set_sha256: "9cde32292b9c3d72ac8008287df5e74756dc37664e1fbbf9de9594c6ea0961bf",
  distribution_held_work_set_sha256: "9b60c83bd0fc8c7724a029b376ed10e69ec2e15c690020a975ec84417065edc9",
  row_sequence_sha256: "f01c8fdd20f7fc87c814cbea02d9acfef9d424fe54b8baf19b63dfb72b9e21b2"
};
const ROW_KEYS = ["work_id", "display_state", "distribution_state", "credit_line", "source_url", "license_link"];

export function validateWorkAttributionDisplayV3(value) {
  exactKeys(value, ["schema", "status", "candidate_only", "current_effect", "display_scope", "source", "counts", "roots", "rows"], "TOP_KEYS");
  if (value.schema !== "mishkan.oholiab.elijah_remote_work_attribution_display.v3") fail("SCHEMA");
  if (value.status !== "FINAL_CLEAR_V3_ROOT_CARD_DISPLAY_ONLY__NOT_PUBLIC_DISTRIBUTION_AUTHORITY" || value.candidate_only !== true || value.current_effect !== "NONE") fail("STATUS");
  if (value.display_scope !== "ROOT_FRONT_DOOR_WORK_CARDS_ONLY__NO_README_NO_WORK_PAGE_NO_ZONE_NO_HUD") fail("DISPLAY_SCOPE");
  if (JSON.stringify(value.source) !== JSON.stringify(EXPECTED_SOURCE)) fail("SOURCE_PINS");
  if (JSON.stringify(value.counts) !== JSON.stringify(EXPECTED_COUNTS)) fail("COUNTS_DECLARATION");
  exactKeys(value.roots, Object.keys(EXPECTED_ROOTS), "ROOT_KEYS");
  for (const [key, expected] of Object.entries(EXPECTED_ROOTS)) if (value.roots[key] !== expected) fail("ROOT_DECLARATION", key);
  if (!Array.isArray(value.rows) || value.rows.length !== EXPECTED_COUNTS.works) fail("ROW_COUNT");
  const ids = new Set();
  const readyDistribution = [];
  const heldDistribution = [];
  let displayReady = 0;
  let displayHeld = 0;
  let previous = null;
  for (const row of value.rows) {
    exactKeys(row, ROW_KEYS, "ROW_KEYS");
    if (!row.work_id || ids.has(row.work_id)) fail("WORK_ID_UNIQUE", row.work_id);
    if (previous !== null && compareUtf8(previous, row.work_id) >= 0) fail("WORK_ID_ORDER", row.work_id);
    previous = row.work_id;
    ids.add(row.work_id);
    const displayIsReady = row.display_state.startsWith("READY_");
    const displayIsHeld = row.display_state.startsWith("HOLD_");
    const distributionIsReady = row.distribution_state.startsWith("READY_");
    const distributionIsHeld = row.distribution_state.startsWith("HOLD_");
    if (displayIsReady === displayIsHeld || distributionIsReady === distributionIsHeld) fail("POSTURE", row.work_id);
    if (distributionIsReady && !displayIsReady) fail("READY_IMPLIES_DISPLAY_READY", row.work_id);
    if (displayIsReady) {
      displayReady += 1;
      if (!row.credit_line || !row.source_url) fail("DISPLAY_READY_FIELDS", row.work_id);
    } else {
      displayHeld += 1;
      if (row.credit_line || row.source_url || row.license_link) fail("DISPLAY_HOLD_CLAIM", row.work_id);
    }
    for (const [name, url] of [["source_url", row.source_url], ["license_link", row.license_link]]) {
      if (!url) continue;
      if (/[^\u0020-\u007e]/u.test(url)) fail("URL_ASCII", `${row.work_id}:${name}`);
      let parsed;
      try { parsed = new URL(url); } catch { fail("URL_PARSE", `${row.work_id}:${name}`); }
      if (!new Set(["http:", "https:"]).has(parsed.protocol) || parsed.username || parsed.password) fail("URL_SCHEME", `${row.work_id}:${name}`);
    }
    if (distributionIsReady) readyDistribution.push(row.work_id);
    else heldDistribution.push(row.work_id);
  }
  if (displayReady !== EXPECTED_COUNTS.display_ready || displayHeld !== EXPECTED_COUNTS.display_held || readyDistribution.length !== EXPECTED_COUNTS.distribution_ready || heldDistribution.length !== EXPECTED_COUNTS.distribution_held) fail("OBSERVED_COUNTS");
  if (workSetRoot(readyDistribution) !== EXPECTED_ROOTS.distribution_ready_work_set_sha256) fail("READY_WORK_SET");
  if (workSetRoot(heldDistribution) !== EXPECTED_ROOTS.distribution_held_work_set_sha256) fail("HELD_WORK_SET");
  if (rowSequenceRoot(value.rows) !== EXPECTED_ROOTS.row_sequence_sha256) fail("ROW_SEQUENCE_ROOT");
  return { works: value.rows.length, display_ready: displayReady, display_held: displayHeld, distribution_ready: readyDistribution.length, distribution_held: heldDistribution.length, row_sequence_sha256: value.roots.row_sequence_sha256 };
}

export function loadWorkAttributionDisplayV3(path) {
  const value = JSON.parse(readFileSync(path, "utf8"));
  const observed = validateWorkAttributionDisplayV3(value);
  return { value, observed };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const path = process.argv[2] || "data/work-attribution-display-v3.json";
  const { observed } = loadWorkAttributionDisplayV3(path);
  console.log(`PASS_WORK_ATTRIBUTION_DISPLAY_V3__${observed.works}_WORKS__ROOT_CARD_ONLY`);
}
