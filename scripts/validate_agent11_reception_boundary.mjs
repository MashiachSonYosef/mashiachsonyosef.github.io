#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportPath = process.argv[2] || 'reports/agent11-reception-boundary-validation-2026-06-02.md';
const issues = [];
const warnings = [];
const checks = [];

const requiredAgent11Files = [
  'reports/agent11-definition-mixer-reception-translator-charter-2026-06-02.md',
  'reports/agent11-language-bank-2026-06-02.md',
  'reports/agent11-operating-index-2026-06-02.md',
  'reports/agent11-downstream-ask-packet-2026-06-02.md',
  'reports/agent11-oracle9-input-preferences-2026-06-02.md',
  'reports/agent11-oracle9-delegation-2026-06-02.md',
  'reports/agent11-oracle9-intake-synthesis-2026-06-02.md',
  'reports/agent11-definition-collision-packet-name-triad-2026-06-02.md',
  'reports/agent11-definition-collision-packet-peoplehood-forms-2026-06-02.md',
  'reports/agent11-definition-collision-packet-outsider-status-cluster-2026-06-02.md',
  'reports/agent11-operating-sweep-2026-06-02.md',
  'reports/agent11-reception-translation-matrix-2026-06-02.md',
  'reports/agent11-oracle9-followup-delegation-2026-06-02.md',
  'reports/agent11-oracle9-public-surface-followup-intake-2026-06-02.md',
  'reports/agent11-public-surface-reception-risk-register-2026-06-02.md',
  'reports/agent11-open-evidence-ledger-2026-06-02.md',
];

const optionalOracleFiles = [
  'reports/oracle9-agent11-reception-surveillance-2026-06-02.md',
  'reports/oracle9-agent11-public-surface-reception-followup-2026-06-02.md',
];

const requiredBoundaryPhrases = [
  'QA acceptance',
  'publication readiness',
  'accepted translation text',
  'unique semantic truth',
];

const broaderBoundaryPhrases = [
  'reviewed lexical authority',
  'route publication support',
  'usage-as-definition authority',
];

const acceptanceRiskPatterns = [
  /\bpublication ready\b/i,
  /\bready for publication\b/i,
  /\bQA[- ]?accepted\b/i,
  /\bQA passed\b/i,
  /\baccepted translation\b/i,
  /\bunique semantic truth\b/i,
  /\breviewed lexical authority\b/i,
  /\bDefinition authority\b/i,
  /\bpublic\/runtime clearance\b/i,
];

const safeBoundaryPattern = /\b(not|no|without|blocked|blocked uses|avoid|reject|must not|what must not|do not|does not|cannot|isn't|is not|not accept|not accepted|not approval|not allowed|doesn't|never|only as|counter: no)\b/i;
const boundarySectionPattern = /\b(not accepted|hard boundaries|what must not|avoid|blocked uses)\b/i;

const files = [...requiredAgent11Files, ...optionalOracleFiles.filter((file) => fs.existsSync(path.join(root, file)))];

validateRequiredFiles();
for (const file of files) validateFile(file);
validateCrossArtifactLinks();
writeReport();

if (issues.length > 0) {
  console.error(`Agent 11 reception boundary validation failed with ${issues.length} issue(s), ${warnings.length} warning(s).`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 11 reception boundary validation passed with ${warnings.length} warning(s). Report: ${reportPath}`);

function validateRequiredFiles() {
  for (const file of requiredAgent11Files) {
    const fullPath = path.join(root, file);
    if (fs.existsSync(fullPath)) {
      pass(`${file} exists`, 'present');
    } else {
      fail(`${file} exists`, 'missing required Agent 11 artifact');
    }
  }

  for (const file of optionalOracleFiles) {
    const fullPath = path.join(root, file);
    if (fs.existsSync(fullPath)) {
      pass(`${file} exists`, 'present');
    } else {
      warn(`${file} exists`, 'optional Oracle 9 surveillance packet not present');
    }
  }
}

function validateFile(file) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  const lower = text.toLowerCase();

  if (file.startsWith('reports/agent11-') && !lower.includes('not accepted')) {
    fail(file, 'missing Not Accepted section or phrase');
  } else {
    pass(`${file} not accepted boundary`, 'present');
  }

  for (const phrase of requiredBoundaryPhrases) {
    if (!lower.includes(phrase.toLowerCase())) {
      fail(file, `missing required boundary phrase: ${phrase}`);
    }
  }

  const broaderHits = broaderBoundaryPhrases.filter((phrase) => lower.includes(phrase.toLowerCase()));
  if (broaderHits.length === 0) {
    warn(file, `no broader boundary phrase found: ${broaderBoundaryPhrases.join(', ')}`);
  } else {
    pass(`${file} broader boundaries`, broaderHits.join(', '));
  }

  validatePublicationStatus(file, text);
  validateRiskyLines(file, text);

  if (/agent11-definition-collision-packet/.test(file)) {
    for (const phrase of ['Agent 6 Boundary', 'Route Evidence Snapshot', 'Translation Ladder', 'What Must Not Be Accepted']) {
      if (!text.includes(phrase)) fail(file, `collision packet missing section: ${phrase}`);
    }
  }
}

function validatePublicationStatus(file, text) {
  const statusLines = text.split(/\r?\n/).filter((line) => /Publication status:/i.test(line));
  if (statusLines.length === 0) {
    if (file.startsWith('reports/agent11-definition-collision-packet') || file.includes('language-bank') || file.includes('operating-index')) {
      fail(file, 'missing Publication status line');
    }
    return;
  }

  for (const line of statusLines) {
    if (!line.includes('blocked_no_render')) {
      fail(file, `publication status is not blocked_no_render: ${line}`);
    } else {
      pass(`${file} publication status`, 'blocked_no_render');
    }
  }
}

function validateRiskyLines(file, text) {
  const lines = text.split(/\r?\n/);
  let currentSection = '';
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const headingMatch = line.match(/^#{1,6}\s+(.+)$/);
    if (headingMatch) currentSection = headingMatch[1];

    for (const pattern of acceptanceRiskPatterns) {
      if (!pattern.test(line)) continue;
      if (isGuardedRiskLine(lines, index, currentSection)) {
        pass(`${file}:${index + 1} risky phrase guarded`, line.trim());
      } else {
        fail(file, `line ${index + 1} has unguarded high-risk phrase: ${line.trim()}`);
      }
    }
  }
}

function isGuardedRiskLine(lines, index, currentSection) {
  const context = [
    currentSection,
    findNearestTableHeader(lines, index),
    ...lines.slice(Math.max(0, index - 10), index + 1),
  ].join('\n');

  return safeBoundaryPattern.test(context) || boundarySectionPattern.test(context);
}

function findNearestTableHeader(lines, index) {
  if (!lines[index].trim().startsWith('|')) return '';

  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    const candidate = lines[cursor].trim();
    if (!candidate.startsWith('|')) return '';
    if (/\|[-:\s|]+\|/.test(candidate)) continue;
    return candidate;
  }

  return '';
}

function validateCrossArtifactLinks() {
  const operatingIndexPath = 'reports/agent11-operating-index-2026-06-02.md';
  const languageBankPath = 'reports/agent11-language-bank-2026-06-02.md';
  const downstreamAskPath = 'reports/agent11-downstream-ask-packet-2026-06-02.md';
  const operatingIndex = readText(operatingIndexPath);
  const languageBank = readText(languageBankPath);
  const downstreamAsk = readText(downstreamAskPath);

  for (const file of [
    'reports/agent11-language-bank-2026-06-02.md',
    'reports/agent11-reception-translation-matrix-2026-06-02.md',
    'reports/agent11-public-surface-reception-risk-register-2026-06-02.md',
    'reports/agent11-open-evidence-ledger-2026-06-02.md',
    'reports/oracle9-agent11-reception-surveillance-2026-06-02.md',
    'reports/oracle9-agent11-public-surface-reception-followup-2026-06-02.md',
    'reports/agent11-definition-collision-packet-outsider-status-cluster-2026-06-02.md',
  ]) {
    if (fs.existsSync(path.join(root, file)) && !operatingIndex.includes(file)) {
      fail(operatingIndexPath, `missing reference to ${file}`);
    }
  }

  for (const phrase of ['Route evidence shows layered meanings. It does not settle them.', 'product-facing', 'not publication approval']) {
    if (!languageBank.includes(phrase)) fail(languageBankPath, `missing guardrail phrase: ${phrase}`);
  }

  for (const phrase of ['Oracle 9 Reception Surveillance', 'Agent 2 Route Normalization Packet', 'Agent 6 Reception Boundary Docket']) {
    if (!downstreamAsk.includes(phrase)) fail(downstreamAskPath, `missing downstream ask: ${phrase}`);
  }
}

function readText(relativePath) {
  try {
    return fs.readFileSync(path.join(root, relativePath), 'utf8');
  } catch (error) {
    fail(relativePath, error.message);
    return '';
  }
}

function pass(name, detail) {
  checks.push({ status: 'pass', name, detail });
}

function warn(name, detail) {
  warnings.push(`${name}: ${detail}`);
  checks.push({ status: 'warn', name, detail });
}

function fail(name, detail) {
  issues.push(`${name}: ${detail}`);
  checks.push({ status: 'fail', name, detail });
}

function writeReport() {
  const lines = [
    '# Agent 11 Reception Boundary Validation',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Summary',
    '',
    `- Status: ${issues.length ? 'failed' : 'passed'}`,
    `- Files checked: ${files.length}`,
    `- Required Agent 11 files: ${requiredAgent11Files.length}`,
    `- Optional Oracle files present: ${optionalOracleFiles.filter((file) => fs.existsSync(path.join(root, file))).length}/${optionalOracleFiles.length}`,
    `- Issues: ${issues.length}`,
    `- Warnings: ${warnings.length}`,
    `- Publication boundary expected: blocked_no_render`,
    '',
    '## Checks',
    '',
    '| status | check | detail |',
    '|---|---|---|',
    ...checks.map((check) => `| ${check.status} | ${escapeCell(check.name)} | ${escapeCell(check.detail)} |`),
    '',
    '## Issues',
    '',
    ...(issues.length ? issues.map((issue) => `- ${issue}`) : ['- none']),
    '',
    '## Warnings',
    '',
    ...(warnings.length ? warnings.map((warning) => `- ${warning}`) : ['- none']),
    '',
    '## Boundary',
    '',
    'This validator checks Agent 11 reception artifacts for required non-acceptance language. It does not create QA acceptance, publication readiness, public/runtime clearance, accepted translation text, reviewed lexical authority, unique semantic truth, source/provenance custody, route publication support, or usage-as-definition authority.',
    '',
  ];

  fs.mkdirSync(path.dirname(path.join(root, reportPath)), { recursive: true });
  fs.writeFileSync(path.join(root, reportPath), `${lines.join('\n')}\n`);
}

function escapeCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}
