#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { URL as NodeURL } from 'node:url';

const root = process.cwd();
const runtimePath = 'assets/js/reader-workbench.js';
const args = parseArgs(process.argv.slice(2));
const targetPath = args.targets || 'data/control/reader_workbench_expansion_targets.json';
const requestedWorkId = args['work-id'] || '';
const requiredSourceFields = ['source_name', 'source_id', 'source_url', 'license', 'license_url'];
const issues = [];

const runtimeSource = readText(runtimePath);
const targets = readJson(targetPath);
const includedTargets = (targets.targets || []).filter((item) => item.include_in_next_expansion === true || item.include_in_next_followup === true);
const target = requestedWorkId
  ? includedTargets.find((item) => item.work_id === requestedWorkId)
  : includedTargets.find((item) => item.work_id !== 'genesis');

if (!target) {
  issues.push(requestedWorkId
    ? `Reader Workbench sample target not found or not included: ${requestedWorkId}`
    : 'no non-Genesis included Reader Workbench target found');
} else {
  await validateTargetSample(target);
}

if (issues.length) {
  console.error(`Reader Workbench expansion sample validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Reader Workbench expansion sample validation passed.');
console.log(JSON.stringify({
  target_work_id: target.work_id,
  target_page: target.page_path,
  target_file: targetPath,
  source_path: target.source_path,
  publication_status: 'not_a_translation',
  source_fields_survived: requiredSourceFields,
  import_count: 1,
  export_selection_count: 1,
}, null, 2));

async function validateTargetSample(targetRow) {
  const pageHtml = readText(targetRow.page_path);
  for (const marker of ['reader-workbench.js', 'data-reader-workbench', 'data-reader-export', 'data-reader-import', 'not_a_translation']) {
    if (!pageHtml.includes(marker)) issues.push(`${targetRow.page_path}: missing Reader Workbench marker ${marker}`);
  }

  const source = readJson(targetRow.source_path);
  const unit = Array.isArray(source.units) && source.units.length ? source.units[0] : null;
  if (!unit) {
    issues.push(`${targetRow.source_path}: no source units available for export/import sample`);
    return;
  }

  const assembly = makeAssembly(targetRow, source, unit);
  const harness = createRuntimeHarness(targetRow);
  vm.runInNewContext(runtimeSource, harness.context, { filename: runtimePath });
  const api = harness.context.window.ReaderWorkbench;
  if (!api?.importStudySheetData || !api?.exportStudySheet) {
    issues.push('runtime did not expose ReaderWorkbench import/export hooks');
    return;
  }

  const imported = await api.importStudySheetData(clone(assembly));
  if (imported !== 1) issues.push(`expected non-Genesis import count 1, got ${imported}`);

  api.exportStudySheet();
  const exported = parseExportedStudySheet(harness.latestBlobText());
  if (exported.publication_status !== 'not_a_translation') issues.push('exported assembly publication_status must stay not_a_translation');
  if (exported.selection_count !== 1) issues.push(`expected one exported selection, got ${exported.selection_count}`);

  const exportedSelection = exported.selections?.[0];
  const originalSourceRow = assembly.selections[0].source_rows[0];
  const exportedSourceRow = exportedSelection?.source_rows?.[0] || {};
  for (const field of requiredSourceFields) {
    if (exportedSourceRow[field] !== originalSourceRow[field]) {
      issues.push(`export/import sample did not preserve ${field}`);
    }
  }
  if (exportedSelection?.answer_eligible !== true) issues.push('export/import sample did not preserve answer_eligible=true');
  if (exportedSelection?.answer_role !== 'answer') issues.push('export/import sample did not preserve answer_role=answer');

  harness.reset();
  const reimported = await api.importStudySheetData(exported);
  if (reimported !== 1) issues.push(`expected exported sample reimport count 1, got ${reimported}`);
}

function makeAssembly(targetRow, source, unit) {
  const now = '2026-06-01T00:00:00.000Z';
  const workPath = `/${targetRow.work_slug}/`;
  const sourceRow = {
    source_name: `${source.work_title || targetRow.work_id} source`,
    source_id: `${targetRow.source_path}#${unit.unit_id || unit.source_ref || 'unit-1'}`,
    source_url: unit.source_url || source.source_base_url || targetRow.source_path,
    license: unit.license || source.license || 'license missing',
    license_url: licenseUrl(unit.license || source.license || ''),
  };
  const selection = {
    schema_version: 1,
    artifact_type: 'gloss_selection',
    selection_id: `gs-expansion-${targetRow.work_id}`,
    work_id: workPath,
    unit_id: unit.unit_id || `${targetRow.work_id}-fixture-unit`,
    source_ref: unit.source_ref || targetRow.work_id,
    surface_occurrence_id: `${targetRow.work_id}-fixture-occurrence`,
    surface_token_id: `${targetRow.work_id}-fixture-token`,
    surface_token_key: `${targetRow.work_id}-fixture-key`,
    surface_text: 'sample token',
    normalized: 'sample-token',
    selected_card_id: `def-expansion-${targetRow.work_id}`,
    selected_definition: 'sample gloss',
    answer_eligible: true,
    answer_role: 'answer',
    confidence_percent: 91,
    source_rows: [sourceRow],
    study_status: 'draft',
    publication_status: 'not_a_translation',
    created_at: now,
    updated_at: now,
  };
  return {
    schema_version: 1,
    artifact_type: 'gloss_assembly',
    work_id: workPath,
    unit_id: selection.unit_id,
    source_ref: selection.source_ref,
    selection_ids: [selection.selection_id],
    selections: [selection],
    assembled_gloss: selection.selected_definition,
    assembly_mode: 'interlinear_gloss',
    publication_status: 'not_a_translation',
  };
}

function createRuntimeHarness(targetRow) {
  const localStorageData = new Map();
  let latestBlob = '';
  const workPath = `/${targetRow.work_slug}/`;

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
      return 'blob:reader-workbench-expansion-sample';
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
    baseURI: `http://localhost${workPath}index.html`,
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
      href: `http://localhost${workPath}`,
      pathname: workPath,
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
      throw new Error('network fetch is disabled in Reader Workbench expansion sample validator');
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

function parseExportedStudySheet(text) {
  try {
    return JSON.parse(text || '{}');
  } catch (error) {
    issues.push(`exported study sheet was not valid JSON: ${error.message}`);
    return {};
  }
}

function licenseUrl(license) {
  const clean = String(license || '').toUpperCase();
  if (clean.includes('CC-BY-SA')) return 'https://creativecommons.org/licenses/by-sa/4.0/';
  if (clean.includes('CC-BY')) return 'https://creativecommons.org/licenses/by/4.0/';
  if (clean.includes('CC0') || clean.includes('PUBLIC DOMAIN')) return 'https://creativecommons.org/publicdomain/zero/1.0/';
  return 'license-url-missing';
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function cleanRelativePath(value) {
  const clean = String(value || '').replace(/\\/g, '/').replace(/^\/+/, '');
  if (!clean || clean.includes('..')) throw new Error(`Unsafe relative path: ${value}`);
  return clean;
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith('--')) continue;
    const key = item.slice(2);
    const next = argv[index + 1];
    if (next && !next.startsWith('--')) {
      parsed[key] = next;
      index += 1;
    } else {
      parsed[key] = true;
    }
  }
  return parsed;
}
