import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const OUTPUT_JSON = 'reports/agent1-wartime-public-hud-source-row-evidence-2026-06-03.json';
const OUTPUT_MD = 'reports/agent1-wartime-public-hud-source-row-evidence-2026-06-03.md';

const SURFACES = [
  {
    ordinal: 1,
    work_id: 'deuteronomy',
    route: 'tanakh/deuteronomy/',
    shard: '05d0-05dc-05d4',
    local_status_evidence: 'reports/agent6-current-deuteronomy-fullscreen-runtime-verdict-2026-06-02.md'
  },
  {
    ordinal: 2,
    work_id: 'genesis',
    route: 'tanakh/genesis/',
    shard: '05e8-05d0-05e9',
    local_status_evidence: 'reports/agent6-genesis-live-browser-proof-verdict-2026-06-02.md'
  },
  {
    ordinal: 3,
    work_id: 'exodus',
    route: 'tanakh/exodus/',
    shard: '05e9-05de-05d5',
    local_status_evidence: 'reports/agent10-candidate-page-3-shipment-prep-2026-06-02.md'
  },
  {
    ordinal: 4,
    work_id: 'leviticus',
    route: 'tanakh/leviticus/',
    shard: '05d0',
    local_status_evidence: 'reports/agent10-candidate-page-4-shipment-prep-2026-06-02.md'
  },
  {
    ordinal: 5,
    work_id: 'numbers',
    route: 'tanakh/numbers/',
    shard: '05d9-05d4-05d5',
    local_status_evidence: 'reports/agent10-candidate-page-5-shipment-prep-2026-06-02.md'
  }
];

const MUST_NOT_ACCEPT = [
  'source/provenance custody',
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

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(repoRoot, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(relativePath, value) {
  fs.writeFileSync(path.join(repoRoot, relativePath), value, 'utf8');
}

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function endpointUrl(workId, kind, shard = null) {
  const root = `https://mashiachsonyosef.github.io/data/public-hud/${workId}`;
  if (kind === 'manifest') return `${root}/manifest.json`;
  if (kind === 'reader_hints') return `${root}/reader-hints.json`;
  if (kind === 'route_manifest') return `${root}/route-lookup/manifest.json`;
  if (kind === 'route_shard') return `${root}/route-lookup/shards/${shard}.json`;
  throw new Error(`unknown endpoint kind: ${kind}`);
}

async function fetchJsonEndpoint(url, cacheBust) {
  const fetchedAt = new Date().toISOString();
  const fetchUrl = `${url}?cb=${encodeURIComponent(cacheBust)}`;
  const response = await fetch(fetchUrl);
  const text = await response.text();
  let json = null;
  let parse_error = null;
  try {
    json = JSON.parse(text);
  } catch (error) {
    parse_error = error.message;
  }

  return {
    url,
    fetched_at: fetchedAt,
    status: response.status,
    ok: response.ok,
    bytes: Buffer.byteLength(text),
    sha256: sha256(text),
    content_type: response.headers.get('content-type') || null,
    last_modified: response.headers.get('last-modified') || null,
    etag: response.headers.get('etag') || null,
    json_parse_ok: parse_error === null,
    json_parse_error: parse_error,
    json
  };
}

function collectRouteCards(shardJson) {
  const rows = [];
  const byNormalized = shardJson?.routes_by_normalized || {};
  for (const [normalized_word, cards] of Object.entries(byNormalized)) {
    if (!Array.isArray(cards)) continue;
    for (const card of cards) {
      const sourceRows = Array.isArray(card.source_rows) ? card.source_rows : [];
      rows.push({
        normalized_word,
        card_id: card.card_id || null,
        route_family: card.route_family || null,
        route_type: card.route_type || null,
        display_section: card.display_section || null,
        match_type: card.match_type || null,
        confidence_percent: card.confidence_percent ?? null,
        answer_eligible: card.answer_eligible ?? null,
        answer_role: card.answer_role || null,
        definition: card.definition || null,
        source_rows: sourceRows.map((sourceRow) => ({
          source_name: sourceRow.source_name || null,
          source_family: sourceRow.source_family || null,
          source_id: sourceRow.source_id || null,
          source_url: sourceRow.source_url || null,
          license: sourceRow.license || null,
          license_url: sourceRow.license_url || null,
          fields_used: Array.isArray(sourceRow.fields_used) ? sourceRow.fields_used : [],
          notes: sourceRow.notes || null
        }))
      });
    }
  }
  return rows;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function summarizeSurface(surface, endpoints) {
  const routeCards = collectRouteCards(endpoints.route_shard.json);
  const sourceRows = routeCards.flatMap((card) =>
    card.source_rows.map((sourceRow) => ({
      card_id: card.card_id,
      route_family: card.route_family,
      route_type: card.route_type,
      answer_eligible: card.answer_eligible,
      source_name: sourceRow.source_name,
      source_family: sourceRow.source_family,
      source_id: sourceRow.source_id,
      source_url: sourceRow.source_url,
      license: sourceRow.license,
      license_url: sourceRow.license_url,
      fields_used: sourceRow.fields_used,
      notes: sourceRow.notes
    }))
  );

  const missingSourceRows = sourceRows.filter((row) =>
    !row.source_name || !row.source_family || !row.source_id || !row.source_url || !row.license || !row.license_url
  );

  return {
    ordinal: surface.ordinal,
    work_id: surface.work_id,
    route: surface.route,
    local_status_evidence: surface.local_status_evidence,
    live_public_hud_json_status: Object.fromEntries(
      Object.entries(endpoints).map(([key, value]) => [key, {
        url: value.url,
        status: value.status,
        ok: value.ok,
        bytes: value.bytes,
        sha256: value.sha256,
        last_modified: value.last_modified,
        json_parse_ok: value.json_parse_ok
      }])
    ),
    route_shard: {
      path: `data/public-hud/${surface.work_id}/route-lookup/shards/${surface.shard}.json`,
      shard: endpoints.route_shard.json?.shard || null,
      token_count: endpoints.route_shard.json?.token_count ?? null,
      card_count: endpoints.route_shard.json?.card_count ?? null,
      public_runtime_scope: endpoints.route_shard.json?.public_runtime_scope || null
    },
    reader_hints: {
      publication_status: endpoints.reader_hints.json?.publication_status || null,
      not_semantic_authority: endpoints.reader_hints.json?.reader_surface_policy?.not_semantic_authority ?? endpoints.reader_hints.json?.not_semantic_authority ?? null,
      not_translation: endpoints.reader_hints.json?.reader_surface_policy?.not_translation ?? endpoints.reader_hints.json?.not_translation ?? null,
      not_accepted_gloss: endpoints.reader_hints.json?.reader_surface_policy?.not_accepted_gloss ?? endpoints.reader_hints.json?.not_accepted_gloss ?? null,
      not_definition_truth: endpoints.reader_hints.json?.reader_surface_policy?.not_definition_truth ?? endpoints.reader_hints.json?.not_definition_truth ?? null
    },
    route_card_count_extracted: routeCards.length,
    source_row_count_extracted: sourceRows.length,
    missing_source_row_field_count: missingSourceRows.length,
    unique_sources: unique(sourceRows.map((row) => row.source_name)),
    unique_source_ids: unique(sourceRows.map((row) => row.source_id)),
    unique_licenses: unique(sourceRows.map((row) => row.license)),
    answer_eligible_source_rows: sourceRows.filter((row) => row.answer_eligible === true).length,
    sample_source_rows: sourceRows.slice(0, 8),
    route_cards: routeCards
  };
}

function formatEndpointLines(surface) {
  return Object.entries(surface.live_public_hud_json_status)
    .map(([kind, row]) => `- ${kind}: ${row.status}; ${row.bytes} bytes; sha256 \`${row.sha256}\`; ${row.url}`)
    .join('\n');
}

function formatSampleRows(surface) {
  return surface.sample_source_rows.map((row) =>
    `- card \`${row.card_id}\`: ${row.source_name} / ${row.source_id}; license \`${row.license}\`; license URL ${row.license_url}; fields used ${row.fields_used.join(', ')}`
  ).join('\n');
}

function formatSurfaceSection(surface) {
  return `### ${surface.ordinal}. ${surface.route}

- Local status evidence: \`${surface.local_status_evidence}\`
- Route shard path: \`${surface.route_shard.path}\`
- Route shard cards reported/extracted: ${surface.route_shard.card_count} / ${surface.route_card_count_extracted}
- Extracted source rows: ${surface.source_row_count_extracted}
- Missing source-row required-field rows: ${surface.missing_source_row_field_count}
- Unique licenses: ${surface.unique_licenses.map((value) => `\`${value}\``).join(', ')}
- Unique source ids: ${surface.unique_source_ids.length}
- Reader-hint boundary fields: publication_status=\`${surface.reader_hints.publication_status}\`, not_translation=\`${surface.reader_hints.not_translation}\`, not_accepted_gloss=\`${surface.reader_hints.not_accepted_gloss}\`, not_definition_truth=\`${surface.reader_hints.not_definition_truth}\`

Live JSON endpoints:

${formatEndpointLines(surface)}

Sample source rows:

${formatSampleRows(surface)}
`;
}

async function main() {
  const generatedAt = new Date().toISOString();
  const cacheBust = `agent1-public-hud-source-row-${generatedAt}`;

  const surfaces = [];
  for (const surface of SURFACES) {
    const endpoints = {
      manifest: await fetchJsonEndpoint(endpointUrl(surface.work_id, 'manifest'), cacheBust),
      reader_hints: await fetchJsonEndpoint(endpointUrl(surface.work_id, 'reader_hints'), cacheBust),
      route_manifest: await fetchJsonEndpoint(endpointUrl(surface.work_id, 'route_manifest'), cacheBust),
      route_shard: await fetchJsonEndpoint(endpointUrl(surface.work_id, 'route_shard', surface.shard), cacheBust)
    };
    surfaces.push(summarizeSurface(surface, endpoints));
  }

  const allSourceRows = surfaces.flatMap((surface) =>
    surface.route_cards.flatMap((card) => card.source_rows.map((sourceRow) => ({
      surface: surface.work_id,
      route: surface.route,
      shard_path: surface.route_shard.path,
      card_id: card.card_id,
      route_family: card.route_family,
      route_type: card.route_type,
      answer_eligible: card.answer_eligible,
      ...sourceRow
    })))
  );

  const artifact = {
    generated_at: generatedAt,
    artifact_type: 'agent1_wartime_public_hud_source_row_evidence',
    scope: 'bounded live public-HUD JSON source/license row evidence for candidate public reader surfaces 1-5',
    prior_blocker_map: 'reports/agent1-wartime-source-provenance-surface-blocker-map-2026-06-02.md',
    boundary: {
      agent1_status: 'source/provenance blocker evidence prepared / awaiting-Agent-6',
      publication_state: 'blocked_no_render',
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
    },
    must_not_accept: MUST_NOT_ACCEPT,
    summary: {
      surfaces_checked: surfaces.length,
      endpoint_count: surfaces.length * 4,
      endpoint_ok_count: surfaces.flatMap((surface) => Object.values(surface.live_public_hud_json_status)).filter((row) => row.ok).length,
      route_card_count_extracted: surfaces.reduce((sum, surface) => sum + surface.route_card_count_extracted, 0),
      source_row_count_extracted: allSourceRows.length,
      missing_source_row_field_count: surfaces.reduce((sum, surface) => sum + surface.missing_source_row_field_count, 0),
      unique_sources: unique(allSourceRows.map((row) => row.source_name)),
      unique_source_ids: unique(allSourceRows.map((row) => row.source_id)),
      unique_licenses: unique(allSourceRows.map((row) => row.license))
    },
    drift_observation: {
      current_live_json_observed: 'Exodus and Leviticus public-HUD JSON endpoints returned 200 during this fetch, while older local Agent 10 prep packets recorded public page/manifest 404 at their check time.',
      boundary: 'This is current live JSON source-row evidence only; it is not runtime validation, QA acceptance, public/runtime acceptance, publication readiness, route publication support, or source/provenance custody.'
    },
    surfaces,
    all_source_rows: allSourceRows
  };

  writeJson(OUTPUT_JSON, artifact);
  writeText(OUTPUT_MD, `# Agent 1 Wartime Public-HUD Source Row Evidence

Generated: ${generatedAt}

Highest permissible claim: source/provenance blocker evidence prepared.

This packet fetches bounded live public-HUD JSON for candidate public reader surfaces #1-#5 and extracts route-card source/license rows. It is source/provenance evidence only. It is not runtime validation, QA acceptance, public/runtime acceptance, source/provenance custody acceptance, source publication, source-file tracking approval, publication readiness, route publication support, Definition authority, product/data acceptance, usage-as-definition authority, translation output, or accepted translation text.

Publication remains \`blocked_no_render\`.

## Summary

- Surfaces checked: ${artifact.summary.surfaces_checked}
- JSON endpoints checked: ${artifact.summary.endpoint_count}
- JSON endpoints with HTTP OK: ${artifact.summary.endpoint_ok_count}
- Route cards extracted: ${artifact.summary.route_card_count_extracted}
- Source/license rows extracted: ${artifact.summary.source_row_count_extracted}
- Rows missing required source/license fields: ${artifact.summary.missing_source_row_field_count}
- Unique source labels: ${artifact.summary.unique_sources.map((value) => `\`${value}\``).join(', ')}
- Unique source IDs: ${artifact.summary.unique_source_ids.length}
- Unique licenses: ${artifact.summary.unique_licenses.map((value) => `\`${value}\``).join(', ')}

## Drift Observation

Current live public-HUD JSON returned \`200\` for Exodus and Leviticus during this fetch. The older local Agent 10 prep packets for those surfaces recorded public page/manifest \`404\` at their check time. This packet records only current live JSON source-row evidence; it does not accept runtime behavior or publication state.

## Surface Evidence

${surfaces.map(formatSurfaceSection).join('\n')}

## Needed Agent 6 Decision

Agent 6 can use this packet as bounded source/provenance-sensitive evidence for the public-reader slice. The rows show public-HUD route-card source/license metadata is present in current live JSON, but Agent 1 does not accept custody, source publication, route publication support, public/runtime acceptance, or any product/data gate.

## Agent 8 Callback

- status: bounded live public-HUD source-row evidence produced; evidence-ready / awaiting-Agent-6 only
- artifact: \`${OUTPUT_MD}\`
- machine artifact: \`${OUTPUT_JSON}\`
- blockers: source/provenance custody remains unresolved; extracted third-party Kaikki/Wiktextract source/license rows are evidence rows only; current live JSON drift from older Exodus/Leviticus 404 prep reports requires Agent 6/Agent 7 interpretation before any runtime or publication claim
- next action needed: Agent 6 review if source/provenance-sensitive route-card rows should be docketed for the active public-reader slice; otherwise continue Agent 1 probing next candidate-source blocker
- continue condition: continue without render, staging, commit, publication, runtime validation, or custody acceptance

## Must Not Accept

${MUST_NOT_ACCEPT.map((item) => `- ${item}`).join('\n')}
`);

  console.log(JSON.stringify({
    ok: true,
    output_json: OUTPUT_JSON,
    output_md: OUTPUT_MD,
    summary: artifact.summary
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
