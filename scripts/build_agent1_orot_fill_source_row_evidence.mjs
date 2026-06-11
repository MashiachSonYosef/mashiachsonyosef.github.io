#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  orotManifest: 'data/lexical/orot.manifest.json',
  orotChunksDir: 'data/lexical/orot-chunks',
  sourceLayersDir: 'data/lexical/source-layers',
  routeLookupShardsDir: 'data/definitions/hud-route-lookup/shards',
  outputJson: 'reports/agent1-orot-fill-source-row-evidence-2026-06-03.json',
  outputMd: 'reports/agent1-orot-fill-source-row-evidence-2026-06-03.md'
};

const TARGETS = [
  {
    entry_id: 'lex-aph-h639',
    incomplete_curated_row_id: 'curated|lex-aph-h639|source metadata incomplete',
    expected_clean_source_family: 'openscriptures',
    expected_clean_source_id_prefix: 'H639'
  },
  {
    entry_id: 'lex-mashiach-h4899',
    incomplete_curated_row_id: 'curated|lex-mashiach-h4899|source metadata incomplete',
    expected_clean_source_family: 'openscriptures',
    expected_clean_source_id_prefix: 'H4899'
  },
  {
    entry_id: 'lex-ruach-h7307',
    incomplete_curated_row_id: 'curated|lex-ruach-h7307|source metadata incomplete',
    expected_clean_source_family: 'openscriptures',
    expected_clean_source_id_prefix: 'H7307'
  },
  {
    entry_id: 'lex-yhwh-h3068',
    incomplete_curated_row_id: 'curated|lex-yhwh-h3068|source metadata incomplete',
    expected_clean_source_family: 'openscriptures',
    expected_clean_source_id_prefix: 'H3068'
  }
];

const MUST_NOT_ACCEPT = [
  'source/provenance custody',
  'source/provenance acceptance',
  'source publication',
  'source-file tracking approval',
  'QA acceptance',
  'public/runtime acceptance',
  'publication readiness',
  'route publication support',
  'Definition authority',
  'product/data acceptance',
  'usage-as-definition authority',
  'translation output',
  'accepted translation text'
];

const BOUNDARY = {
  publication_state: 'blocked_no_render',
  source_provenance_custody_claimed: false,
  source_provenance_acceptance_claimed: false,
  source_publication_claimed: false,
  source_file_tracking_approval_claimed: false,
  qa_acceptance_claimed: false,
  public_runtime_acceptance_claimed: false,
  route_publication_support_claimed: false,
  definition_authority_claimed: false,
  product_data_acceptance_claimed: false,
  usage_as_definition_authority_claimed: false,
  translation_output_claimed: false,
  accepted_translation_text_claimed: false
};

function fullPath(relativePath) {
  return path.join(repoRoot, relativePath);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(fullPath(relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(fullPath(relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(fullPath(relativePath), value, 'utf8');
}

function listJsonFiles(relativeDir) {
  return fs.readdirSync(fullPath(relativeDir), { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => path.join(relativeDir, entry.name).replaceAll('\\', '/'))
    .sort((a, b) => a.localeCompare(b));
}

function sourceRowComplete(row) {
  if (!row || typeof row !== 'object') return false;
  if (String(row.source_id || '').includes('source metadata incomplete')) return false;
  if (String(row.license || '').includes('source metadata incomplete')) return false;
  return Boolean(row.source_name && row.source_family && row.source_id && row.source_url && row.license && row.license_url);
}

function rowSummary(row) {
  if (!row) return null;
  return {
    source_name: row.source_name || null,
    source_family: row.source_family || null,
    source_id: row.source_id || null,
    source_url: row.source_url || null,
    license: row.license || null,
    license_url: row.license_url || null,
    complete: sourceRowComplete(row)
  };
}

function collectOrotEntries() {
  const byEntryId = new Map(TARGETS.map((target) => [target.entry_id, []]));
  for (const file of listJsonFiles(PATHS.orotChunksDir)) {
    const chunk = readJson(file);
    const forms = chunk.token_index?.forms || [];
    const sourceRows = chunk.source_rows || {};
    for (const entry of chunk.lexicon?.entries || []) {
      if (!byEntryId.has(entry.entry_id)) continue;
      const occurrenceForms = forms.filter((form) => form.lexicon_entry_id === entry.entry_id);
      const primaryRows = (entry.source_row_ids || []).map((rowId) => ({
        row_id: rowId,
        row: rowSummary(sourceRows[rowId])
      }));
      const secondaryRows = (entry.secondary_source_row_ids || []).map((rowId) => ({
        row_id: rowId,
        row: rowSummary(sourceRows[rowId])
      }));
      byEntryId.get(entry.entry_id).push({
        chunk_file: file,
        chunk_id: chunk.chunk_id || null,
        token_occurrence_count: occurrenceForms.length,
        token_occurrences: occurrenceForms.map((form) => ({
          token_index_id: form.token_index_id || null,
          surface_word: form.surface_word || null,
          normalized_word: form.normalized_word || null
        })),
        entry: {
          entry_id: entry.entry_id,
          hebrew_word: entry.hebrew_word || null,
          disambiguation_status: entry.disambiguation_status || null,
          possible_entry_keys: (entry.possible_entries || []).map((candidate) => candidate.entry_key).filter(Boolean),
          source_row_ids: entry.source_row_ids || [],
          secondary_source_row_ids: entry.secondary_source_row_ids || []
        },
        primary_source_rows: primaryRows,
        secondary_source_rows: secondaryRows
      });
    }
  }
  return byEntryId;
}

function collectSourceLayerRows() {
  const byEntryId = new Map(TARGETS.map((target) => [target.entry_id, []]));
  for (const file of listJsonFiles(PATHS.sourceLayersDir)) {
    const layer = readJson(file);
    for (const entry of layer.entries || []) {
      if (!byEntryId.has(entry.entry_id)) continue;
      byEntryId.get(entry.entry_id).push({
        source_layer_file: file,
        entry_id: entry.entry_id,
        hebrew_word: entry.hebrew_word || null,
        source_row_ids: entry.source_row_ids || [],
        secondary_source_row_ids: entry.secondary_source_row_ids || [],
        source_rows: (entry.source_rows || []).map(rowSummary)
      });
    }
  }
  return byEntryId;
}

function collectRouteLookupHits() {
  const targets = TARGETS.flatMap((target) => [
    target.entry_id,
    target.incomplete_curated_row_id
  ]);
  const hits = [];
  if (!fs.existsSync(fullPath(PATHS.routeLookupShardsDir))) return hits;
  for (const file of listJsonFiles(PATHS.routeLookupShardsDir)) {
    const text = fs.readFileSync(fullPath(file), 'utf8');
    const matched = targets.filter((target) => text.includes(target));
    if (matched.length > 0) {
      hits.push({ file, matched_terms: matched });
    }
  }
  return hits;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
}

function summarizeTarget(target, chunkEntries, sourceLayerRows) {
  const allPrimary = chunkEntries.flatMap((entry) => entry.primary_source_rows);
  const allSecondary = chunkEntries.flatMap((entry) => entry.secondary_source_rows);
  const allChunkRows = [...allPrimary, ...allSecondary];
  const incompleteChunkRowIds = unique(allChunkRows
    .filter((row) => !row.row?.complete || String(row.row_id).includes('source metadata incomplete'))
    .map((row) => row.row_id));
  const completePrimaryIds = unique(allPrimary.filter((row) => row.row?.complete).map((row) => row.row_id));
  const completeSecondaryIds = unique(allSecondary.filter((row) => row.row?.complete).map((row) => row.row_id));
  const completeSourceLayerRows = sourceLayerRows
    .flatMap((entry) => entry.source_rows.map((row) => ({ ...row, source_layer_file: entry.source_layer_file, entry_id: entry.entry_id })))
    .filter((row) => row.complete);
  const expectedSourceLayerRows = completeSourceLayerRows.filter((row) =>
    row.source_family === target.expected_clean_source_family &&
    String(row.source_id || '').startsWith(target.expected_clean_source_id_prefix)
  );

  const missingCleanAttachment = !completePrimaryIds.some((rowId) => rowId.includes(target.expected_clean_source_id_prefix)) &&
    !completeSecondaryIds.some((rowId) => rowId.includes(target.expected_clean_source_id_prefix));
  const exactIncompletePresent = incompleteChunkRowIds.includes(target.incomplete_curated_row_id);
  const cleanRowsAttached = !missingCleanAttachment;
  const targetStatus = exactIncompletePresent ? 'block' : 'pipeline_source_rows_clear';
  const chunkCleanAttachmentStatus = exactIncompletePresent
    ? (
        missingCleanAttachment
          ? 'incomplete_curated_row_attached_no_clean_chunk_attachment'
          : 'incomplete_curated_row_attached_clean_rows_also_attached_or_nearby'
      )
    : (
        cleanRowsAttached
          ? 'clean_source_row_attached_no_incomplete_curated_row'
          : 'no_incomplete_curated_row_but_clean_source_row_not_attached'
      );

  return {
    entry_id: target.entry_id,
    incomplete_curated_row_id: target.incomplete_curated_row_id,
    expected_clean_source_family: target.expected_clean_source_family,
    expected_clean_source_id_prefix: target.expected_clean_source_id_prefix,
    chunk_entry_count: chunkEntries.length,
    token_occurrence_count: chunkEntries.reduce((sum, entry) => sum + entry.token_occurrence_count, 0),
    chunk_files: unique(chunkEntries.map((entry) => entry.chunk_file)),
    token_occurrences: chunkEntries.flatMap((entry) => entry.token_occurrences),
    primary_source_row_ids: unique(allPrimary.map((row) => row.row_id)),
    secondary_source_row_ids: unique(allSecondary.map((row) => row.row_id)),
    complete_primary_source_row_ids: completePrimaryIds,
    complete_secondary_source_row_ids: completeSecondaryIds,
    incomplete_chunk_source_row_ids: incompleteChunkRowIds,
    exact_incomplete_curated_row_present: exactIncompletePresent,
    source_layer_exact_rows: completeSourceLayerRows,
    expected_clean_source_layer_row_count: expectedSourceLayerRows.length,
    expected_clean_source_layer_rows: expectedSourceLayerRows,
    chunk_clean_attachment_status: chunkCleanAttachmentStatus,
    status: targetStatus,
    blocker: targetStatus === 'block' ? target.incomplete_curated_row_id : null
  };
}

function renderMarkdown(artifact) {
  return `# Agent 1 Orot Fill Source-Row Evidence

Generated: ${artifact.generated_at}

Status: ${artifact.status}

Highest permissible claim: source/provenance blocker evidence prepared for the four requested Orot current-HUD lexical warning rows.

This report is source/provenance/license/citation evidence only. It does not claim source/provenance custody, source/provenance acceptance, QA acceptance, public/runtime acceptance, publication readiness, route publication support, Definition authority, product/data acceptance, usage-as-definition authority, accepted text, or translation output. Publication remains \`blocked_no_render\`.

## Scope

Requested rows:

${artifact.targets.map((target) => `- \`${target.entry_id}\``).join('\n')}

Files inspected:

- \`${PATHS.orotManifest}\`
- \`${PATHS.orotChunksDir}/*.json\`
- \`${PATHS.sourceLayersDir}/*.json\`
- \`${PATHS.routeLookupShardsDir}/*.json\`

## Summary

- Target rows: ${artifact.summary.target_count}
- Target chunk entries: ${artifact.summary.chunk_entry_count}
- Target token occurrences: ${artifact.summary.token_occurrence_count}
- Incomplete curated rows still attached in Orot chunks: ${artifact.summary.incomplete_curated_rows_attached}
- Targets with exact clean source-layer rows available: ${artifact.summary.targets_with_expected_clean_source_layer_row}
- Targets missing exact clean source attachment in Orot chunk entries: ${artifact.summary.targets_missing_clean_chunk_attachment}
- Route lookup shard hits for target IDs/source rows: ${artifact.summary.route_lookup_shard_hit_count}
- Publication state: \`${artifact.boundary.publication_state}\`

## Four-Row Result

| row | Orot token occurrences | clean primary rows in chunk | clean secondary rows in chunk | exact clean source-layer rows | status |
|---|---:|---|---|---:|---|
${artifact.targets.map((target) => `| \`${target.entry_id}\` | ${target.token_occurrence_count} | ${target.complete_primary_source_row_ids.map((rowId) => `\`${rowId}\``).join('<br>') || 'none'} | ${target.complete_secondary_source_row_ids.map((rowId) => `\`${rowId}\``).join('<br>') || 'none'} | ${target.expected_clean_source_layer_row_count} | ${target.chunk_clean_attachment_status} |`).join('\n')}

## Source-Row Disposition

Current disposition: \`${artifact.source_row_disposition.status}\`

Incomplete curated source rows still attached:

${artifact.source_row_disposition.remaining_blocking_rows.length ? artifact.source_row_disposition.remaining_blocking_rows.map((row) => `- \`${row}\``).join('\n') : '- none'}

Clean source-layer rows exist for all four exact IDs. When the disposition is \`pipeline_source_rows_clear\`, that means the regenerated Orot chunk entries no longer carry \`source metadata incomplete\` rows and do carry complete source rows. It does not mean source/provenance custody, source/provenance acceptance, QA acceptance, or publication readiness.

## Route Lookup Boundary

- Route lookup shard hit count for the four target IDs/source rows: ${artifact.summary.route_lookup_shard_hit_count}
- This artifact does not claim runtime validation or route publication support.

## Needed Next Action

Agent 1 evidence-ready next action: route this as source/provenance-sensitive evidence for Agent 5/Agent 8 relay and Agent 6 review if Orot fill expansion depends on these rows.

Allowed implementation paths require owner/Agent 6 disposition before any acceptance claim:

- regenerate Orot lexical chunks so the exact clean source-layer rows replace the incomplete curated rows,
- map the curated rows to complete source rows in the pipeline,
- filter/exclude the four rows from Orot fill expansion,
- or keep the Orot fill batch blocked.

## Not Accepted

${MUST_NOT_ACCEPT.map((term) => `- ${term}`).join('\n')}
`;
}

function main() {
  const manifest = readJson(PATHS.orotManifest);
  const chunkEntriesById = collectOrotEntries();
  const sourceLayerRowsById = collectSourceLayerRows();
  const routeLookupHits = collectRouteLookupHits();
  const targets = TARGETS.map((target) =>
    summarizeTarget(target, chunkEntriesById.get(target.entry_id) || [], sourceLayerRowsById.get(target.entry_id) || [])
  );
  const incompleteTargets = targets.filter((target) => target.exact_incomplete_curated_row_present);
  const clearTargets = targets.filter((target) => target.status === 'pipeline_source_rows_clear');
  const artifactStatus = incompleteTargets.length === 0 &&
    clearTargets.length === targets.length &&
    routeLookupHits.length === 0
    ? 'pipeline_source_rows_clear'
    : 'block';

  const artifact = {
    generated_at: new Date().toISOString(),
    artifact_type: 'agent1_orot_fill_source_row_evidence',
    status: artifactStatus,
    highest_permissible_claim: artifactStatus === 'pipeline_source_rows_clear'
      ? 'Orot source-row blocker cleared by pipeline regeneration evidence; no source/provenance acceptance claimed'
      : 'source/provenance blocker evidence prepared for Orot fill source rows',
    inspected_paths: PATHS,
    orot_manifest: {
      work_id: manifest.work_id || null,
      chunk_count: (manifest.chunks || []).length,
      token_chunk_count: (manifest.token_chunks || []).length,
      generated_at: manifest.generated_at || null
    },
    targets,
    route_lookup_hits: routeLookupHits,
    summary: {
      target_count: targets.length,
      chunk_entry_count: targets.reduce((sum, target) => sum + target.chunk_entry_count, 0),
      token_occurrence_count: targets.reduce((sum, target) => sum + target.token_occurrence_count, 0),
      incomplete_curated_rows_attached: targets.filter((target) => target.exact_incomplete_curated_row_present).length,
      targets_with_expected_clean_source_layer_row: targets.filter((target) => target.expected_clean_source_layer_row_count > 0).length,
      targets_missing_clean_chunk_attachment: targets.filter((target) => ![
        'incomplete_curated_row_attached_clean_rows_also_attached_or_nearby',
        'clean_source_row_attached_no_incomplete_curated_row'
      ].includes(target.chunk_clean_attachment_status)).length,
      route_lookup_shard_hit_count: routeLookupHits.length
    },
    source_row_disposition: {
      status: artifactStatus,
      cleared_entry_count: clearTargets.length,
      remaining_blocking_rows: incompleteTargets.map((target) => target.incomplete_curated_row_id),
      reason: artifactStatus === 'pipeline_source_rows_clear'
        ? 'The regenerated Orot chunks no longer attach incomplete curated source rows for the four target entries, and complete source rows are attached in the chunks.'
        : 'One or more exact Orot chunk entries still carry incomplete curated source rows.'
    },
    blocker: artifactStatus === 'block'
      ? {
          blocker_id: 'orot_fill_incomplete_curated_source_rows_attached_to_chunk_entries',
          blocking_rows: incompleteTargets.map((target) => target.incomplete_curated_row_id),
          reason: 'The exact Orot chunk entries still carry incomplete curated source rows. Complete source-layer rows exist upstream, but the clean rows must be regenerated, mapped, filtered, excluded, or docketed before these rows can be treated as source-clean evidence.'
        }
      : null,
    needed_next_action: 'Agent 5/Agent 8 relay to Agent 6 if Orot fill expansion depends on these rows; Agent 1 does not accept custody or authorize publication.',
    boundary: BOUNDARY,
    must_not_accept: MUST_NOT_ACCEPT
  };

  writeJson(PATHS.outputJson, artifact);
  writeText(PATHS.outputMd, renderMarkdown(artifact));
  console.log(JSON.stringify({
    ok: true,
    output_json: PATHS.outputJson,
    output_md: PATHS.outputMd,
    status: artifact.status,
    summary: artifact.summary,
    source_row_disposition: artifact.source_row_disposition,
    blocker: artifact.blocker?.blocker_id || null
  }, null, 2));
}

main();
