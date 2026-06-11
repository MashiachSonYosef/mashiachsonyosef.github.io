#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const args = parseArgs(process.argv.slice(2));
const date = args.date || currentDate();
const outputPath =
  args.output || `reports/agent6-repo-dirt-classification-support-${date}.json`;
const markdownPath =
  args.markdown || `reports/agent6-repo-dirt-classification-support-${date}.md`;
const sampleLimit = Number(args.sampleLimit || 8);

const root = runGit(['rev-parse', '--show-toplevel']).trim().replace(/\\/g, '/');
const branch = runGit(['branch', '--show-current']).trim();
const headShort = runGit(['rev-parse', '--short', 'HEAD']).trim();
const rawStatus = execFileSync('git', ['status', '--porcelain=v1', '-z', '--untracked-files=all'], {
  encoding: 'buffer',
  maxBuffer: 512 * 1024 * 1024,
});

const records = parseStatus(rawStatus.toString('utf8'));
const classified = classify(records, sampleLimit);
const artifact = buildArtifact(classified);

writeJson(outputPath, artifact);
writeMarkdown(markdownPath, artifact, classified.samples);

console.log(
  `Agent6 repo dirt classification written. Dirty records: ${artifact.counts.dirty_records_total}; ` +
    `tracked deletions: ${artifact.counts.tracked_deletions}; untracked: ${artifact.counts.untracked}. ` +
    `JSON: ${outputPath}; MD: ${markdownPath}`
);

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      parsed[key] = true;
    } else {
      parsed[key] = next;
      i += 1;
    }
  }
  return parsed;
}

function currentDate() {
  return new Date().toISOString().slice(0, 10);
}

function runGit(gitArgs) {
  return execFileSync('git', gitArgs, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
}

function parseStatus(statusText) {
  const parts = statusText.split('\0').filter(Boolean);
  const records = [];
  for (let i = 0; i < parts.length; i += 1) {
    const entry = parts[i];
    const xy = entry.slice(0, 2);
    const file = normalizePath(entry.slice(3));
    let original = null;
    if (xy[0] === 'R' || xy[0] === 'C') {
      original = normalizePath(parts[i + 1] || '');
      i += 1;
    }
    records.push({ xy, file, original });
  }
  return records;
}

function normalizePath(value) {
  return String(value || '').replace(/\\/g, '/');
}

function statusKind(xy) {
  if (xy === '??') return 'untracked';
  if (xy.includes('D')) return 'deleted';
  if (xy.includes('A')) return 'added';
  if (xy.includes('M')) return 'modified';
  if (/[AU]/.test(xy)) return 'unmerged';
  return 'other';
}

function pathFamily(file) {
  if (file.startsWith('reports/')) return 'reports';
  if (file.startsWith('scripts/')) return 'scripts';
  if (file.startsWith('data/control/')) return 'data/control';
  if (file.startsWith('data/public-hud/')) return 'data/public-hud';
  if (file.startsWith('data/build/')) return 'data/build';
  if (file.startsWith('data/definitions/')) return 'data/definitions';
  if (file.startsWith('data/translation-memory/')) return 'data/translation-memory';
  if (file.startsWith('tanakh/')) return 'tanakh';
  if (file.startsWith('orot/')) return 'orot';
  if (file.startsWith('hud-preview/')) return 'hud-preview';
  if (file.startsWith('assets/')) return 'assets';
  if (isSitePage(file)) return 'site-pages';
  if (isTempNoise(file)) return 'temp_noise';
  if (file.startsWith('data/')) return 'other_data';
  return file.split('/')[0] || '.';
}

function isSitePage(file) {
  return (
    file.endsWith('.html') ||
    /^(about|ari|chasidut|gra|halakhah|jewish-thought|kabbalah|library|liturgy|midrash|mishnah|musar|other|rav-kook|second-temple|talmud|targum|tosefta)\//.test(
      file
    )
  );
}

function isTempNoise(file) {
  return file === '--no-write' || file.startsWith('.tmp') || file.startsWith('tmp_');
}

function classify(records, limit) {
  const counts = {
    dirty_records_total: records.length,
    tracked_deletions: 0,
    tracked_modified: 0,
    tracked_added: 0,
    untracked: 0,
  };
  const path_family_counts = {
    'data/public-hud': 0,
    reports: 0,
    'site-pages': 0,
    scripts: 0,
    other_data: 0,
    tanakh: 0,
    'data/definitions': 0,
    'data/control': 0,
    temp_noise: 0,
    'data/translation-memory': 0,
    assets_hud_preview_orot_root: 0,
  };
  const by_family_status = {};
  const samples = {};

  for (const record of records) {
    const kind = statusKind(record.xy);
    const family = pathFamily(record.file);
    if (kind === 'untracked') counts.untracked += 1;
    if (kind === 'deleted') counts.tracked_deletions += 1;
    if (kind === 'modified') counts.tracked_modified += 1;
    if (kind === 'added') counts.tracked_added += 1;

    if (family in path_family_counts) {
      path_family_counts[family] += 1;
    } else if (['assets', 'hud-preview', 'orot', 'overlay-export.json', '.github'].includes(family)) {
      path_family_counts.assets_hud_preview_orot_root += 1;
    }

    const key = `${family}|${kind}`;
    by_family_status[key] = (by_family_status[key] || 0) + 1;
    if (!samples[key]) samples[key] = [];
    if (samples[key].length < limit) samples[key].push(record.file);
  }

  return { counts, path_family_counts, by_family_status, samples };
}

function buildArtifact(classified) {
  const { counts, path_family_counts, by_family_status } = classified;
  return {
    artifact: markdownPath.replace(/\\/g, '/'),
    date,
    agent: 'Agent 6',
    disposition: 'warn_blocking_support_docket',
    scope: 'non_destructive_repo_dirt_classification_only',
    repo: {
      workdir: root,
      branch,
      head_short: headShort,
      status_command: 'git status --porcelain=v1 -z --untracked-files=all',
    },
    counts,
    path_family_counts,
    by_family_status,
    deletion_classification: {
      'data/public-hud': {
        count: by_family_status['data/public-hud|deleted'] || 0,
        classification: 'generated_output_churn_candidate_but_p0_until_reconciled',
      },
      reports: {
        count: by_family_status['reports|deleted'] || 0,
        classification: 'provenance_docket_loss_risk_hold',
      },
      scripts: {
        count: by_family_status['scripts|deleted'] || 0,
        classification: 'validator_builder_loss_risk_hold',
      },
      deployment_runtime_support: {
        count:
          (by_family_status['.github|deleted'] || 0) +
          (by_family_status['assets|deleted'] || 0) +
          (by_family_status['site-pages|deleted'] || 0),
        classification: 'needs_owner_release_owner_review',
      },
    },
    proposed_batches: [
      { id: 'A', name: 'qa_support_docket', condition: 'owner_wants_checkpoint_only' },
      {
        id: 'B',
        name: 'evidence_reports',
        condition: 'exclude_deleted_reports_and_raw_logs_unless_explicitly_wanted',
      },
      {
        id: 'C',
        name: 'validators_and_builders',
        condition: 'only_with_matching_report_packet_and_no_orphan_deletion',
      },
      {
        id: 'D',
        name: 'control_state',
        condition: 'only_with_agent5_agent7_publication_or_queue_health_proof',
      },
      {
        id: 'E',
        name: 'runtime_public_hud_site_surface',
        condition: 'requires_agent10_changed_input_release_packet',
      },
      { id: 'F', name: 'temporary_noise', condition: 'delete_only_after_explicit_owner_approval' },
    ],
    exact_blockers: [
      {
        blocker: 'public_hud_package_truth_blocked',
        evidence: `${by_family_status['data/public-hud|deleted'] || 0} tracked deletions under data/public-hud`,
        handoff_owner: 'Agent 10',
      },
      {
        blocker: 'provenance_and_validator_recountability_blocked',
        evidence: `${by_family_status['reports|deleted'] || 0} deleted reports and ${
          by_family_status['scripts|deleted'] || 0
        } deleted scripts`,
        handoff_owner: 'Agent 5/7 plus source worker lanes',
      },
      {
        blocker: 'control_truth_blocked_if_untracked_files_are_relied_on',
        evidence: `${by_family_status['data/control|untracked'] || 0} untracked data/control files`,
        handoff_owner: 'Agent 5/7',
      },
      {
        blocker: 'runtime_public_claims_blocked',
        evidence: `${path_family_counts['site-pages']} dirty site-page records and ${path_family_counts.tanakh} dirty tanakh records`,
        handoff_owner: 'Agent 10 with Agent 4 proof after changed package',
      },
      {
        blocker: 'source_provenance_claims_blocked',
        evidence: 'untracked or modified source/lexical/translation-memory data',
        handoff_owner: 'Agent 1 then Agent 6 if QA-relevant',
      },
      {
        blocker: 'destructive_cleanup_not_authorized',
        evidence: 'classification pipeline is read-only except explicit output artifacts',
        handoff_owner: 'owner',
      },
    ],
    must_not_be_accepted: [
      'staging',
      'deletion',
      'revert',
      'cleanup_complete',
      'qa_acceptance',
      'source_provenance_acceptance',
      'license_legal_acceptance',
      'runtime_public_acceptance',
      'definition_authority',
      'answer_eligibility',
      'publication_readiness',
      'accepted_text',
      'commercial_export_authorization',
      'nc_commercial_authorization',
      'release_action',
    ],
    stop_condition: 'classification_artifact_exists_no_destructive_action_taken',
  };
}

function writeJson(targetPath, artifact) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, `${JSON.stringify(artifact, null, 2)}\n`);
}

function writeMarkdown(targetPath, artifact, samples) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  const lines = [
    `# Agent 6 Repo Dirt Classification Support - ${artifact.date}`,
    '',
    '## Disposition',
    '',
    'WARN-BLOCKING SUPPORT DOCKET.',
    '',
    'This is non-destructive repo-dirt classification only. It does not stage, delete, revert, clean, accept, publish, or clear any QA/product/source/runtime gate.',
    '',
    '## Repo Scope',
    '',
    `- Workdir: \`${artifact.repo.workdir}\``,
    `- Branch: \`${artifact.repo.branch}\``,
    `- HEAD observed: \`${artifact.repo.head_short}\``,
    `- Snapshot command basis: \`${artifact.repo.status_command}\``,
    `- Files classified: \`${artifact.counts.dirty_records_total}\` dirty status records`,
    '',
    '## Category Counts',
    '',
    '| category | count | classification |',
    '|---|---:|---|',
    `| tracked deletions | ${artifact.counts.tracked_deletions} | P0 needs-owner/release-owner review before any staging |`,
    `| modified tracked files | ${artifact.counts.tracked_modified} | needs lane packet or owner/release classification |`,
    `| added tracked files | ${artifact.counts.tracked_added} | can be batched only with matching validation/provenance |`,
    `| untracked files | ${artifact.counts.untracked} | classify before staging; do not \`git add -A\` |`,
    '',
    '## Path-Family Counts',
    '',
    '| path family | dirty records | classification |',
    '|---|---:|---|',
    `| \`data/public-hud\` | ${artifact.path_family_counts['data/public-hud']} | P0 public-runtime/generated-output churn candidate; blocks package truth until reconciled |`,
    `| \`reports\` | ${artifact.path_family_counts.reports} | support evidence plus report-deletion risk; batchable only by docket family |`,
    `| site pages | ${artifact.path_family_counts['site-pages']} | public/runtime surface dirt; release-owner packet required |`,
    `| \`scripts\` | ${artifact.path_family_counts.scripts} | validator/builder provenance dirt; batch with corresponding evidence only |`,
    `| other \`data\` | ${artifact.path_family_counts.other_data} | source/lexical/generated data; source-lane review required |`,
    `| \`tanakh\` | ${artifact.path_family_counts.tanakh} | public page/runtime dirt; release-owner packet required |`,
    `| \`data/definitions\` | ${artifact.path_family_counts['data/definitions']} | definition/workbench planning data; Agent 2/6 boundary required |`,
    `| \`data/control\` | ${artifact.path_family_counts['data/control']} | control-state dirt; Agent 7/5 publication or queue hygiene proof required |`,
    `| temp/noise | ${artifact.path_family_counts.temp_noise} | deletion candidate only with explicit owner approval |`,
    `| \`data/translation-memory\` | ${artifact.path_family_counts['data/translation-memory']} | source/provenance risk; Agent 1/6 boundary required |`,
    `| \`assets\`, \`hud-preview\`, \`orot\`, root artifacts | ${artifact.path_family_counts.assets_hud_preview_orot_root} | runtime/support dirt; exact packet required |`,
    '',
    '## Exact Blockers',
    '',
  ];
  for (const blocker of artifact.exact_blockers) {
    lines.push(`- ${blocker.blocker}: ${blocker.evidence}. Handoff owner: ${blocker.handoff_owner}.`);
  }
  lines.push('', '## Proposed Non-Destructive Batches', '');
  for (const batch of artifact.proposed_batches) {
    lines.push(`- Batch ${batch.id}: ${batch.name}; condition: ${batch.condition}.`);
  }
  lines.push('', '## Sample Paths', '');
  for (const [key, values] of Object.entries(samples).sort()) {
    if (values.length === 0) continue;
    lines.push(`### ${key}`, '');
    for (const value of values) lines.push(`- \`${value}\``);
    lines.push('');
  }
  lines.push(
    '## Stop Condition',
    '',
    'Classification artifact exists. No staging, deletion, reverting, cleanup, product acceptance, source/provenance acceptance, license/legal acceptance, runtime/public acceptance, Definition authority, answer eligibility, publication readiness, accepted text, commercial export authorization, NC commercial authorization, or release action is created by this docket.',
    ''
  );
  fs.writeFileSync(targetPath, `${lines.join('\n')}\n`);
}
