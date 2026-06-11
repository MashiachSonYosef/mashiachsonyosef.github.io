#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { URL as NodeURL } from 'node:url';

const root = process.cwd();
const runtimePath = 'assets/js/reader-workbench.js';
const contractPath = 'data/definitions/gloss-selection-contract.json';
const genesisPath = 'tanakh/genesis/index.html';
const issues = [];

const runtimeSource = readText(runtimePath);
const contract = readJson(contractPath);
const genesisHtml = readText(genesisPath);

staticRuntimeChecks();
await importExportFixtureChecks();

if (issues.length) {
  console.error(`Reader Workbench runtime validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Reader Workbench runtime validation passed.');
console.log(JSON.stringify({
  import_validation: 'passed',
  evidence_only_selection: 'disabled',
  source_license_round_trip: 'passed',
  translation_memory_write_path: 'not_found',
  pilot_page: genesisPath,
}, null, 2));

function staticRuntimeChecks() {
  for (const field of contract.required_selection_fields || []) {
    if (!runtimeSource.includes(`'${field}'`)) {
      issues.push(`runtime selection contract check does not name required field: ${field}`);
    }
  }

  const requiredRuntimeMarkers = [
    'Reader Workbench import rejected: top-level publication_status must be',
    'selectionContractErrors(selection)',
    'sourceRowHasPublicFields',
    'canSaveGlossSelection',
    "selectable ? 'Definition option' : 'Evidence only'",
    'Not selectable as a gloss authority; inspect as evidence only.',
    'choose.disabled = !selectable',
    "if (selectable) choose.addEventListener('click'",
    'publication_status: PRODUCT_STATUS',
  ];
  for (const marker of requiredRuntimeMarkers) {
    if (!runtimeSource.includes(marker)) issues.push(`runtime missing marker: ${marker}`);
  }

  const forbiddenRuntimeMarkers = [
    'data/translation-memory',
    'data\\\\translation-memory',
    'accepted_translation',
    'decision_status',
  ];
  for (const marker of forbiddenRuntimeMarkers) {
    if (runtimeSource.includes(marker)) issues.push(`runtime contains forbidden publication marker: ${marker}`);
  }

  const requiredPageMarkers = [
    'data-reader-workbench',
    'data-reader-export',
    'data-reader-import',
    'reader-workbench.js',
    'reader-workbench.css',
    'not_a_translation',
  ];
  for (const marker of requiredPageMarkers) {
    if (!genesisHtml.includes(marker)) issues.push(`Genesis pilot page missing marker: ${marker}`);
  }
}

async function importExportFixtureChecks() {
  const harness = createRuntimeHarness();
  vm.runInNewContext(runtimeSource, harness.context, { filename: runtimePath });
  const api = harness.context.window.ReaderWorkbench;
  if (!api?.importStudySheetData || !api?.exportStudySheet) {
    issues.push('runtime did not expose ReaderWorkbench import/export hooks');
    return;
  }

  const validAssembly = makeAssembly();
  await expectImportPass(api, harness, 'valid assembly', validAssembly);

  harness.reset();
  await api.importStudySheetData(clone(validAssembly));
  api.exportStudySheet();
  const exported = JSON.parse(harness.latestBlobText());
  const exportedSelection = exported.selections?.[0];
  assert(exported.publication_status === 'not_a_translation', 'export publication_status must stay not_a_translation');
  assert(exported.selection_count === 1, 'export must contain exactly one valid selection');
  assert(exportedSelection?.source_rows?.[0]?.source_name === validAssembly.selections[0].source_rows[0].source_name, 'export must preserve source_name');
  assert(exportedSelection?.source_rows?.[0]?.source_id === validAssembly.selections[0].source_rows[0].source_id, 'export must preserve source_id');
  assert(exportedSelection?.source_rows?.[0]?.source_url === validAssembly.selections[0].source_rows[0].source_url, 'export must preserve source_url');
  assert(exportedSelection?.source_rows?.[0]?.license === validAssembly.selections[0].source_rows[0].license, 'export must preserve license');
  assert(exportedSelection?.source_rows?.[0]?.license_url === validAssembly.selections[0].source_rows[0].license_url, 'export must preserve license_url');
  assert(exportedSelection?.answer_eligible === true, 'export must preserve answer_eligible=true');
  assert(exportedSelection?.answer_role === 'answer', 'export must preserve answer_role=answer');

  await expectImportReject(api, harness, 'missing top-level publication_status', deleteField(clone(validAssembly), 'publication_status'), 'top-level publication_status');
  await expectImportReject(api, harness, 'wrong top-level publication_status', { ...clone(validAssembly), publication_status: 'accepted' }, 'top-level publication_status');
  await expectImportReject(api, harness, 'wrong row publication_status', mutateSelection(validAssembly, { publication_status: 'accepted' }), 'failed the gloss_selection contract');
  await expectImportReject(api, harness, 'missing required field', deleteSelectionField(validAssembly, 'surface_token_key'), 'failed the gloss_selection contract');
  await expectImportReject(api, harness, 'missing source rows', mutateSelection(validAssembly, { source_rows: [] }), 'failed the gloss_selection contract');
  await expectImportReject(api, harness, 'missing source license identity', mutateSourceRow(validAssembly, { license: '' }), 'failed the gloss_selection contract');
  await expectImportReject(api, harness, 'evidence-only row', mutateSelection(validAssembly, { answer_eligible: false, answer_role: 'evidence' }), 'failed the gloss_selection contract');
}

function makeAssembly() {
  const now = '2026-06-01T00:00:00.000Z';
  const workId = '/tanakh/genesis/';
  const selection = {
    schema_version: 1,
    artifact_type: 'gloss_selection',
    selection_id: 'gs-reader-workbench-validator',
    work_id: workId,
    unit_id: 'genesis-1-1',
    source_ref: 'Genesis 1:1',
    surface_occurrence_id: 'genesis-1-1-p0-t0',
    surface_token_id: 'genesis-1-1-p0-t0',
    surface_token_key: 'genesis-1-1-p0-t0-0',
    surface_text: 'בראשית',
    normalized: 'בראשית',
    selected_card_id: 'def-validator-1',
    selected_definition: 'beginning',
    answer_eligible: true,
    answer_role: 'answer',
    confidence_percent: 96,
    source_rows: [
      {
        source_name: 'Reader Workbench validator fixture',
        source_family: 'workspace',
        source_id: 'reader-workbench-validator-source',
        source_url: 'local:data/definitions/gloss-selection-contract.json',
        license: 'project-authored / CC0',
        license_url: 'https://creativecommons.org/publicdomain/zero/1.0/',
        fields_used: ['fixture'],
        notes: 'Validator fixture only. Creates no translation output.',
      },
    ],
    study_status: 'draft',
    publication_status: 'not_a_translation',
    created_at: now,
    updated_at: now,
  };
  return {
    schema_version: 1,
    artifact_type: 'gloss_assembly',
    work_id: workId,
    unit_id: 'genesis-1-1',
    source_ref: 'Genesis 1:1',
    source_text_hash: 'validator-fixture',
    selection_ids: [selection.selection_id],
    selections: [selection],
    assembled_gloss: 'beginning',
    assembly_mode: 'interlinear_gloss',
    publication_status: 'not_a_translation',
  };
}

async function expectImportPass(api, harness, label, data) {
  harness.reset();
  try {
    const count = await api.importStudySheetData(clone(data));
    if (count !== 1) issues.push(`${label}: expected import count 1, got ${count}`);
  } catch (error) {
    issues.push(`${label}: expected import pass, got ${error.message}`);
  }
}

async function expectImportReject(api, harness, label, data, expectedMessage) {
  harness.reset();
  try {
    await api.importStudySheetData(clone(data));
    issues.push(`${label}: expected import rejection`);
  } catch (error) {
    if (!String(error.message || '').includes(expectedMessage)) {
      issues.push(`${label}: expected rejection containing "${expectedMessage}", got "${error.message}"`);
    }
  }
}

function createRuntimeHarness() {
  const localStorageData = new Map();
  let latestBlob = '';

  const localStorage = {
    getItem: (key) => localStorageData.has(key) ? localStorageData.get(key) : null,
    setItem: (key, value) => localStorageData.set(key, String(value)),
    removeItem: (key) => localStorageData.delete(key),
    clear: () => localStorageData.clear(),
  };

  function makeElement(tag) {
    return {
      tagName: String(tag || '').toUpperCase(),
      className: '',
      textContent: '',
      dataset: {},
      style: {},
      hidden: false,
      children: [],
      append(...children) { this.children.push(...children); },
      appendChild(child) { this.children.push(child); return child; },
      remove() {},
      click() {},
      setAttribute(name, value) { this[name] = String(value); },
      addEventListener() {},
      closest() { return null; },
      querySelector() { return null; },
      querySelectorAll() { return []; },
    };
  }

  class TestURL extends NodeURL {
    static createObjectURL() {
      return 'blob:reader-workbench-validator';
    }

    static revokeObjectURL() {}
  }

  class TestBlob {
    constructor(parts) {
      latestBlob = parts.map((part) => String(part)).join('');
    }
  }

  const document = {
    readyState: 'loading',
    baseURI: 'http://localhost/tanakh/genesis/index.html',
    body: makeElement('body'),
    createElement: makeElement,
    addEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
  };
  const window = {
    document,
    localStorage,
    location: {
      href: 'http://localhost/tanakh/genesis/',
      pathname: '/tanakh/genesis/',
    },
    setTimeout,
    clearTimeout,
    requestAnimationFrame: (callback) => setTimeout(callback, 0),
    addEventListener() {},
  };
  const context = {
    console,
    document,
    window,
    location: window.location,
    localStorage,
    URL: TestURL,
    Blob: TestBlob,
    setTimeout,
    clearTimeout,
    fetch: async () => {
      throw new Error('network fetch is disabled in Reader Workbench validator');
    },
  };
  window.window = window;
  window.URL = TestURL;
  window.Blob = TestBlob;

  return {
    context,
    latestBlobText: () => latestBlob,
    reset: () => {
      localStorage.clear();
      latestBlob = '';
    },
  };
}

function mutateSelection(assembly, fields) {
  const next = clone(assembly);
  next.selections[0] = { ...next.selections[0], ...fields };
  return next;
}

function mutateSourceRow(assembly, fields) {
  const next = clone(assembly);
  next.selections[0].source_rows[0] = { ...next.selections[0].source_rows[0], ...fields };
  return next;
}

function deleteField(object, field) {
  const next = clone(object);
  delete next[field];
  return next;
}

function deleteSelectionField(assembly, field) {
  const next = clone(assembly);
  delete next.selections[0][field];
  return next;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assert(condition, message) {
  if (!condition) issues.push(message);
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}
