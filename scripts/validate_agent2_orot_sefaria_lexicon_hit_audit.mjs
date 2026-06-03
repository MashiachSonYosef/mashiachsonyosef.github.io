#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const report = process.argv[2] || 'reports/agent2-orot-sefaria-lexicon-hit-audit-2026-06-03.json';
const data = readJson(report);
const issues = [];

expect(data.artifact_type === 'agent2_orot_sefaria_lexicon_hit_audit', 'unexpected artifact_type');
expect(data.generator === 'scripts/audit_agent2_orot_sefaria_lexicon_hits.mjs', 'unexpected generator');
expect(data.boundary?.evidence_only === true, 'boundary must be evidence-only');
expect(data.boundary?.zero_emission === true, 'boundary must be zero-emission');
expect(data.boundary?.metadata_only === true, 'boundary must be metadata-only');
expect(data.boundary?.stores_definition_content === false, 'must not store definition content');
expect(data.boundary?.no_answer_rows === true, 'must not emit answer rows');
expect(data.boundary?.no_answer_candidates_emitted === true, 'must not emit answer candidates');
expect(data.boundary?.no_public_hud_mutation === true, 'must not mutate public HUD');
expect(data.boundary?.no_route_jsonl_mutation === true, 'must not mutate route JSONL');
expect(data.boundary?.no_source_custody === true, 'must not claim source custody');
expect(data.boundary?.no_definition_authority === true, 'must not claim Definition authority');
expect(data.boundary?.no_usage_as_definition === true, 'must not claim usage-as-definition');
expect(data.boundary?.no_translation_output === true, 'must not claim translation output');
expect(data.boundary?.no_accepted_gloss === true, 'must not claim accepted gloss');
expect(data.boundary?.no_qa_acceptance === true, 'must not claim QA acceptance');
expect(data.boundary?.no_publication_readiness === true, 'must not claim publication readiness');

expectSafeExistingPath(data.inputs?.queue, 'queue input');
expect(data.inputs?.queue_artifact_type === 'agent2_orot_full_answer_candidate_disambiguation_queue', 'unexpected queue artifact type');
expect(data.inputs?.top_n === 500, 'expected top_n=500');
expect(data.inputs?.selected_rows === 500, 'expected selected_rows=500');
expect(String(data.inputs?.base_url || '').includes('sefaria.org/api/words'), 'base_url must point to Sefaria words API');
expect(data.outputs?.json_report === report, 'json_report output must point to this report');
expectSafeExistingPath(data.outputs?.markdown_report, 'markdown report output');
expect(data.outputs?.answer_rows === 0, 'answer row output must be 0');
expect(data.outputs?.route_jsonl_rows === 0, 'route JSONL output must be 0');
expect(data.outputs?.public_hud_rows === 0, 'public HUD output must be 0');
expect(data.outputs?.definition_content_rows === 0, 'definition content output must be 0');

const summary = data.summary || {};
expect(summary.audited_rows === 500, 'expected 500 audited rows');
expect(summary.audited_occurrences === 8427, 'expected 8427 audited occurrences');
expect(summary.rows_with_any_hit > 0, 'expected at least one Sefaria hit');
expect(summary.occurrences_with_any_hit > 0, 'expected occurrence coverage');
expect(summary.answer_rows_emitted === 0, 'answer rows emitted must be 0');
expect(summary.accepted_definition_rows_emitted === 0, 'accepted definition rows emitted must be 0');
expect(summary.translation_output_rows_emitted === 0, 'translation output rows emitted must be 0');
expect(summary.public_hud_rows_emitted === 0, 'public HUD rows emitted must be 0');
expect(summary.route_jsonl_rows_emitted === 0, 'route JSONL rows emitted must be 0');

expect(Array.isArray(data.lexicon_summary), 'lexicon_summary must be an array');
expect(data.lexicon_summary.length > 0, 'expected lexicon summary rows');
expect(data.lexicon_summary.some((row) => row.lexicon === 'Klein Dictionary'), 'expected Klein Dictionary in lexicon summary');
expect(data.lexicon_summary.some((row) => row.lexicon === 'Jastrow Dictionary'), 'expected Jastrow Dictionary in lexicon summary');
expect(data.lexicon_summary.some((row) => String(row.lexicon).includes('BDB')), 'expected BDB-family lexicon in lexicon summary');

const rows = data.rows || [];
expect(rows.length === 500, 'expected 500 row audits');
expect(sum(rows.map((row) => row.occurrences)) === summary.audited_occurrences, 'row occurrence sum mismatch');
expect(rows.filter((row) => row.combined_hit_count > 0).length === summary.rows_with_any_hit, 'hit row count mismatch');
expect(sum(rows.filter((row) => row.combined_hit_count > 0).map((row) => row.occurrences)) === summary.occurrences_with_any_hit, 'hit occurrence count mismatch');

const tokenIds = new Set();
for (const row of rows) {
  expect(Boolean(row.queue_id), 'row missing queue_id');
  expect(Boolean(row.token_id), 'row missing token_id');
  expect(!tokenIds.has(row.token_id), `${row.token_id} duplicate token id`);
  tokenIds.add(row.token_id);
  expect(Boolean(row.surface), `${row.token_id} missing surface`);
  expect(Boolean(row.normalized), `${row.token_id} missing normalized`);
  expect(Number(row.occurrences) > 0, `${row.token_id} occurrences must be positive`);
  expect(row.emitted_answer_row_now === false, `${row.token_id} must not emit answer row`);
  expect(row.answer_eligible_now === false, `${row.token_id} must not be answer eligible now`);
  expect(['metadata_hit_only_requires_transform_contract_and_license_boundary', 'no_sefaria_metadata_hit'].includes(row.answer_transform_status), `${row.token_id} unexpected transform status`);
  expect(Array.isArray(row.query_results) && row.query_results.length >= 1, `${row.token_id} missing query results`);
  for (const queryResult of row.query_results) {
    expect(queryResult.query_kind === 'surface' || queryResult.query_kind === 'normalized', `${row.token_id} unexpected query kind`);
    expect(String(queryResult.url || '').includes('sefaria.org/api/words'), `${row.token_id} query URL must point to Sefaria words API`);
    expect(Array.isArray(queryResult.entries), `${row.token_id} query entries must be an array`);
    for (const entry of queryResult.entries) {
      expect(!Object.hasOwn(entry, 'content'), `${row.token_id} entry must not store content`);
      expect(!Object.hasOwn(entry, 'notes'), `${row.token_id} entry must not store notes text`);
      expect(!Object.hasOwn(entry, 'content_sha256'), `${row.token_id} entry must not store content hash`);
      expect(!Object.hasOwn(entry, 'notes_sha256'), `${row.token_id} entry must not store notes hash`);
      expect(Boolean(entry.headword), `${row.token_id} entry missing headword`);
      expect(Boolean(entry.parent_lexicon), `${row.token_id} entry missing parent_lexicon`);
    }
  }
}

const jsonText = fs.readFileSync(path.join(root, report), 'utf8');
for (const forbidden of [
  '"content":',
  '"notes":',
  '"definition":',
  '"definitions":',
  '"gloss":',
  '"answer_text":',
  '"accepted_text":',
]) {
  expect(!jsonText.includes(forbidden), `JSON must not contain forbidden payload key ${forbidden}`);
}

const markdown = fs.readFileSync(path.join(root, data.outputs.markdown_report), 'utf8');
for (const needle of [
  'does not store definition content',
  'emits zero answer rows',
  'Hits are not answers',
  'Definition authority',
  'Agent 8 Callback',
]) {
  expect(markdown.includes(needle), `markdown missing boundary phrase: ${needle}`);
}

if (issues.length) {
  console.error(`Agent 2 Orot Sefaria lexicon hit audit validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 2 Orot Sefaria lexicon hit audit validation passed for ${report}.`);

function expect(condition, message) {
  if (!condition) issues.push(message);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function expectSafeExistingPath(relativePath, label) {
  expect(Boolean(relativePath), `${label} is missing`);
  expect(!path.isAbsolute(relativePath || '') && !(relativePath || '').includes('..'), `${label} must be a safe relative path`);
  if (relativePath) expect(fs.existsSync(path.join(root, relativePath)), `${label} must exist: ${relativePath}`);
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}
