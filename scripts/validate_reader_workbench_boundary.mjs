#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const runtimePath = path.join(root, 'assets/js/reader-workbench.js');
const renderPath = path.join(root, 'scripts/render_site.ps1');
const runtime = fs.readFileSync(runtimePath, 'utf8');
const render = fs.readFileSync(renderPath, 'utf8');
const runtimeContractIndex = render.indexOf('data-hud-runtime-contract');
const runtimeContractBlock = runtimeContractIndex >= 0
  ? render.slice(Math.max(0, runtimeContractIndex - 2500), runtimeContractIndex + 2500)
  : '';

const requiredSelectionContractFields = [
  'selected_definition',
  'answer_eligible',
  'answer_role',
  'confidence_percent',
  'source_rows',
  'study_status',
  'publication_status',
];
const requiredSourceContractFields = ['source_name', 'source_id', 'source_url', 'license', 'license_url'];
const translationMemoryPath = /(?:data[\\/])?translation[-_]memory/i;

function loadRuntimeApi() {
  const storage = new Map();
  const context = {
    console,
    Blob,
    URL,
    location: {
      href: 'file:///reader-workbench-boundary-fixture.html',
      pathname: '/reader-workbench-boundary-fixture.html',
    },
  };
  context.window = {
    localStorage: {
      getItem: (key) => storage.get(key) || null,
      setItem: (key, value) => storage.set(key, String(value)),
    },
    addEventListener: () => {},
    requestAnimationFrame: (callback) => callback(),
    setTimeout: () => 0,
  };
  context.document = {
    readyState: 'loading',
    addEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({
      dataset: {},
      style: {},
      classList: { add: () => {} },
      append: () => {},
      appendChild: () => {},
      setAttribute: () => {},
      addEventListener: () => {},
      remove: () => {},
      click: () => {},
    }),
    body: { appendChild: () => {} },
  };
  context.window.document = context.document;
  context.window.location = context.location;
  context.window.URL = URL;
  context.window.Blob = Blob;
  vm.runInNewContext(runtime, context, { filename: runtimePath });
  return context.window.ReaderWorkbench;
}

const completeSourceRow = {
  source_name: 'Boundary Fixture',
  source_id: 'fixture:1',
  source_url: 'data/definitions/fixture.json',
  license: 'CC0',
  license_url: 'https://creativecommons.org/publicdomain/zero/1.0/',
};

const completeSelection = {
  schema_version: 1,
  artifact_type: 'gloss_selection',
  selection_id: 'fixture-selection-1',
  work_id: 'tanakh/genesis',
  unit_id: 'Genesis.1.1',
  source_ref: 'Genesis 1:1',
  surface_occurrence_id: 'fixture-occurrence-1',
  surface_token_id: 'fixture-token-1',
  surface_token_key: 'ברא',
  surface_text: 'בָּרָא',
  normalized: 'ברא',
  selected_card_id: 'fixture-card-1',
  selected_definition: 'to create',
  answer_eligible: true,
  answer_role: 'answer',
  confidence_percent: 90,
  source_rows: [completeSourceRow],
  study_status: 'draft',
  publication_status: 'not_a_translation',
  created_at: '2026-06-01T00:00:00.000Z',
  updated_at: '2026-06-01T00:00:00.000Z',
};

async function rejectsWith(label, promiseFactory, expectedText) {
  try {
    await promiseFactory();
  } catch (error) {
    return String(error && error.message || error).includes(expectedText);
  }
  console.error(`Expected Reader Workbench fixture to reject: ${label}`);
  return false;
}

async function runExecutableBoundaryChecks() {
  const api = loadRuntimeApi();
  const accepted = await api.importStudySheetData({
    schema_version: 1,
    artifact_type: 'gloss_assembly',
    publication_status: 'not_a_translation',
    selections: [completeSelection],
  });
  return [
    ['fixture accepts one valid not_a_translation selection', accepted === 1],
    ['fixture rejects missing top-level publication_status', await rejectsWith(
      'missing top-level publication_status',
      () => api.importStudySheetData({ schema_version: 1, artifact_type: 'gloss_assembly', selections: [completeSelection] }),
      'top-level publication_status must be not_a_translation',
    )],
    ['fixture rejects wrong top-level publication_status', await rejectsWith(
      'wrong top-level publication_status',
      () => api.importStudySheetData({ schema_version: 1, artifact_type: 'gloss_assembly', publication_status: 'translation', selections: [completeSelection] }),
      'top-level publication_status must be not_a_translation',
    )],
    ['fixture rejects rows missing required contract fields', await rejectsWith(
      'missing selected_definition',
      () => api.importStudySheetData({
        schema_version: 1,
        artifact_type: 'gloss_assembly',
        publication_status: 'not_a_translation',
        selections: [{ ...completeSelection, selected_definition: '' }],
      }),
      'failed the gloss_selection contract',
    )],
    ['fixture rejects rows missing source/license rows', await rejectsWith(
      'missing source_rows',
      () => api.importStudySheetData({
        schema_version: 1,
        artifact_type: 'gloss_assembly',
        publication_status: 'not_a_translation',
        selections: [{ ...completeSelection, source_rows: [] }],
      }),
      'failed the gloss_selection contract',
    )],
    ['fixture rejects source rows missing license_url', await rejectsWith(
      'missing license_url',
      () => api.importStudySheetData({
        schema_version: 1,
        artifact_type: 'gloss_assembly',
        publication_status: 'not_a_translation',
        selections: [{ ...completeSelection, source_rows: [{ ...completeSourceRow, license_url: '' }] }],
      }),
      'failed the gloss_selection contract',
    )],
    ['fixture rejects evidence-only imported selections', await rejectsWith(
      'evidence-only selection',
      () => api.importStudySheetData({
        schema_version: 1,
        artifact_type: 'gloss_assembly',
        publication_status: 'not_a_translation',
        selections: [{ ...completeSelection, answer_eligible: false, answer_role: 'evidence' }],
      }),
      'failed the gloss_selection contract',
    )],
    ['fixture keeps usage evidence out of the Definition answer slot', api.selectRouteAnswer([{
      card_id: 'usage-fixture',
      display_section: 'strict_hebrew',
      route_type: 'workbench_usage',
      usage_note: 'Observed use only.',
      answer_eligible: true,
      answer_role: 'answer',
      source_rows: [completeSourceRow],
      confidence_percent: 99,
    }]).answerState === 'none'],
    ['fixture renders definitionless usage evidence as observed usage only', api.routeRenderings({
      route_type: 'workbench_usage',
      usage_note: 'Observed use only.',
    })[0] === 'observed usage only'],
  ];
}

const checks = [
  ['runtime declares not_a_translation product status', runtime.includes("const PRODUCT_STATUS = 'not_a_translation';")],
  ['runtime validates source/license rows', runtime.includes('function sourceRowHasPublicFields') && requiredSourceContractFields.every((field) => runtime.includes(`'${field}'`)) && runtime.includes("displayLicense(row) !== 'N/A'")],
  ['runtime validates imported selection contract', runtime.includes('function selectionContractErrors') && requiredSelectionContractFields.every((field) => runtime.includes(`'${field}'`))],
  ['runtime rejects missing or wrong top-level publication_status', runtime.includes('top-level publication_status must be ${PRODUCT_STATUS}')],
  ['runtime rejects invalid imported rows', runtime.includes('failed the gloss_selection contract')],
  ['runtime blocks programmatic evidence-only saves', runtime.includes('if (!canSaveGlossSelection(card)) return null;')],
  ['runtime disables evidence-only fallback choices', runtime.includes("top.appendChild(createElement('strong', '', selectable ? 'Definition option' : 'Evidence only'))") && runtime.includes('choose.disabled = !selectable;')],
  ['runtime filters restored selections through contract', runtime.includes('if (selectionContractErrors(selection).length) return;')],
  ['runtime filters exported selections through contract', runtime.includes('&& !selectionContractErrors(selection).length')],
  ['runtime exports browser study sheets without translation-memory writes', runtime.includes("link.download = 'reader-workbench-study-sheet.json';") && !translationMemoryPath.test(runtime)],
  ['generator advertises workbench boundary markers', render.includes("'selectionContractErrors'") && render.includes("'canSaveGlossSelection'") && render.includes("'Reader Workbench import rejected'")],
  ['generator runtime contract does not reference translation-memory paths', !translationMemoryPath.test(runtimeContractBlock)],
];

checks.push(...await runExecutableBoundaryChecks());

const failures = checks.filter(([, ok]) => !ok);
if (failures.length) {
  console.error(`Reader Workbench boundary validation failed with ${failures.length} issue(s):`);
  for (const [label] of failures) console.error(`- ${label}`);
  process.exit(1);
}

console.log(`Reader Workbench boundary validation passed (${checks.length} checks).`);
