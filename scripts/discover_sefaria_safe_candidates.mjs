import fs from 'node:fs';
import path from 'node:path';

const ALLOWED_LICENSES = new Set([
  'Public Domain',
  'PD',
  'CC0',
  'CC-BY',
  'CC BY',
  'CC-BY 4.0',
  'CC BY 4.0',
  'CC-BY-SA',
  'CC BY-SA',
  'CC-BY-SA 4.0',
  'CC BY-SA 4.0',
]);

const DEFAULT_CATEGORIES = ['Midrash'];

function parseArgs(argv) {
  const args = {
    categories: DEFAULT_CATEGORIES,
    outputJson: 'data/catalog/sefaria-safe-candidate-probe.json',
    outputMarkdown: 'reports/sefaria-safe-candidate-report.md',
    outputConfig: 'data/catalog/sefaria-safe-candidate-imports.json',
    maxProbes: 0,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === '--categories' && next) {
      args.categories = next.split(',').map((value) => value.trim()).filter(Boolean);
      i += 1;
    } else if (arg === '--output-json' && next) {
      args.outputJson = next;
      i += 1;
    } else if (arg === '--output-md' && next) {
      args.outputMarkdown = next;
      i += 1;
    } else if (arg === '--output-config' && next) {
      args.outputConfig = next;
      i += 1;
    } else if (arg === '--max-probes' && next) {
      args.maxProbes = Number.parseInt(next, 10) || 0;
      i += 1;
    }
  }

  return args;
}

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeText(filePath, text) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, text, 'utf8');
}

function writeJson(filePath, value) {
  writeText(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function slugify(value) {
  return String(value || 'text')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'text';
}

function libraryLaneForCategories(categories) {
  const lower = (categories || []).map((category) => String(category || '').toLowerCase());
  if (lower.includes('midrash') || lower.includes('aggadah')) return 'midrash';
  if (lower.includes('tanakh')) return 'tanakh';
  if (lower.includes('targum')) return 'targum';
  if (lower.includes('tosefta')) return 'tosefta';
  if (lower.includes('mishnah')) return 'mishnah';
  if (lower.includes('kabbalah')) return 'kabbalah';
  if (lower.includes('chasidut')) return 'chasidut';
  if (lower.includes('halakhah')) return 'halakhah';
  if (lower.includes('musar')) return 'musar';
  if (lower.includes('philosophy')) return 'philosophy';
  if (lower.includes('jewish thought')) return 'jewish-thought';
  if (lower.includes('liturgy')) return 'liturgy';
  if (lower.includes('second temple')) return 'second-temple';
  return 'other';
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      'user-agent': 'HebrewSourceWorkbench/1.0 safe-candidate-discovery',
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  return response.json();
}

function flattenToc(items, inheritedCategories = []) {
  const results = [];
  for (const item of items || []) {
    if (item?.title) {
      const categories = Array.isArray(item.categories) && item.categories.length
        ? item.categories
        : inheritedCategories;
      results.push({
        title: item.title,
        he_title: item.heTitle || '',
        categories,
        category_text: categories.join(' > '),
      });
    } else if (item?.contents) {
      const nextCategories = item.category
        ? [...inheritedCategories, item.category]
        : inheritedCategories;
      results.push(...flattenToc(item.contents, nextCategories));
    }
  }
  return results;
}

function nodeChildren(node) {
  return Array.isArray(node?.nodes) ? node.nodes : [];
}

function getLeafNodes(node, titlePath = []) {
  const children = nodeChildren(node);
  if (children.length > 0) {
    return children.flatMap((child) => {
      const title = child.title || child.key || '';
      return getLeafNodes(child, [...titlePath, title].filter(Boolean));
    });
  }
  return [{
    title_path: titlePath,
    depth: Number(node?.depth || 0),
    address_types: Array.isArray(node?.addressTypes) ? node.addressTypes : [],
    lengths: Array.isArray(node?.lengths) ? node.lengths : [],
  }];
}

function firstLeaf(node) {
  return getLeafNodes(node)[0] || null;
}

function probeRefFor(title, leaf) {
  if (!leaf) return title;
  const leafRef = leaf.title_path.length ? `${title}, ${leaf.title_path.join(', ')}` : title;
  if (leaf.depth <= 1) return leafRef;
  if (leaf.address_types[0] === 'Talmud') return null;
  return `${leafRef} 1`;
}

function containsHebrew(value) {
  if (value == null) return false;
  if (typeof value === 'string') return /[\u0590-\u05ff]/u.test(value);
  if (Array.isArray(value)) return value.some((item) => containsHebrew(item));
  return false;
}

function estimateUnitCount(index) {
  let total = 0;
  let unknown = false;
  for (const leaf of getLeafNodes(index.schema)) {
    const last = leaf.lengths.at(-1);
    if (Number.isFinite(Number(last)) && Number(last) > 0) {
      total += Number(last);
    } else {
      unknown = true;
    }
  }
  if (total > 0 && unknown) return `${total}+`;
  if (total > 0) return total;
  return 'unknown';
}

function getVersionMeta(payload) {
  const license = payload?.heLicense || 'unknown';
  const versionTitle = payload?.heVersionTitle || 'unknown';
  const versionSource = payload?.heVersionSource || '';
  return { license, version_title: versionTitle, version_source: versionSource };
}

function getHebrewOnlyBlocker(report) {
  const title = `${report.work_title} ${report.version_title}`.toLowerCase();
  if (/\btranslat(?:ed|ion|or)\b/u.test(title) || /\btrans\./u.test(title)) {
    return 'Version/title indicates translation; skipped for Hebrew-only import lane';
  }
  if (/\bglick\b/u.test(title)) {
    return 'Glick edition is treated as translation-risk; skipped for Hebrew-only import lane';
  }
  if (/\blerner\b/u.test(title) || /edited by prof\./u.test(title)) {
    return 'Modern edited edition requires manual license/provenance review';
  }
  return '';
}

function isSchemaImportable(leaf) {
  if (!leaf) return false;
  return leaf.address_types[0] !== 'Talmud';
}

function buildImportEntry(report) {
  const entry = {
    work_id: report.work_id,
    work_title: report.work_title,
    he_title: report.he_title,
    work_slug: report.work_slug,
    sefaria_ref: report.sefaria_ref,
    work_type: report.categories.includes('Commentary') ? 'commentary' : 'primary_text',
    source_system: 'Sefaria API',
    source_base_url: 'https://www.sefaria.org/api/',
  };
  const onMatch = report.work_title.match(/\s+on\s+(.+)$/u);
  if (entry.work_type === 'commentary' && onMatch) {
    entry.base_work_title = onMatch[1].trim();
    entry.base_work_id = slugify(entry.base_work_title);
    entry.display_label = `Commentary on ${entry.base_work_title}`;
  }
  return entry;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = readJson('data/work-imports.json', { works: [] });
  const configuredRefs = new Set((config.works || []).map((work) => work.sefaria_ref).filter(Boolean));
  const configuredIds = new Set((config.works || []).map((work) => work.work_id).filter(Boolean));
  const importedIds = new Set(
    fs.existsSync('data/sources')
      ? fs.readdirSync('data/sources').filter((name) => name.endsWith('.json')).map((name) => path.basename(name, '.json'))
      : [],
  );

  const toc = await fetchJson('https://www.sefaria.org/api/index');
  const allWorks = flattenToc(toc);
  const categoryMatchers = args.categories.map((category) => category.toLowerCase());
  const candidates = allWorks
    .filter((work) => {
      const text = `${work.category_text} ${work.title}`.toLowerCase();
      return categoryMatchers.some((category) => text.includes(category));
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  const reports = [];
  const probeList = args.maxProbes > 0 ? candidates.slice(0, args.maxProbes) : candidates;

  for (const candidate of probeList) {
    const workId = slugify(candidate.title);
    const report = {
      work_id: workId,
      work_title: candidate.title,
      he_title: candidate.he_title,
      work_slug: `${libraryLaneForCategories(candidate.categories)}/${workId}`,
      sefaria_ref: candidate.title,
      categories: candidate.categories,
      already_configured: configuredRefs.has(candidate.title) || configuredIds.has(workId),
      already_imported: importedIds.has(workId),
      probe_ref: '',
      license: 'unknown',
      license_ok: false,
      version_title: '',
      version_source: '',
      hebrew_available: false,
      schema_importable: false,
      estimated_unit_count: 'unknown',
      importable_now: false,
      blocker: '',
    };

    try {
      const index = await fetchJson(`https://www.sefaria.org/api/index/${encodeURIComponent(candidate.title)}`);
      report.sefaria_ref = index.title || candidate.title;
      report.work_id = slugify(index.title || candidate.title);
      report.work_slug = `${libraryLaneForCategories(candidate.categories)}/${report.work_id}`;
      report.estimated_unit_count = estimateUnitCount(index);
      const leaf = firstLeaf(index.schema);
      report.schema_importable = isSchemaImportable(leaf);
      report.probe_ref = probeRefFor(index.title || candidate.title, leaf) || '';
      if (!report.probe_ref) {
        report.blocker = 'Talmud-addressed schema needs importer support';
      } else {
        const payload = await fetchJson(`https://www.sefaria.org/api/texts/${encodeURIComponent(report.probe_ref)}?context=0&commentary=0`);
        const meta = getVersionMeta(payload);
        report.license = meta.license;
        report.license_ok = ALLOWED_LICENSES.has(String(meta.license || '').trim());
        report.version_title = meta.version_title;
        report.version_source = meta.version_source;
        report.hebrew_available = containsHebrew(payload?.he);
      }

      if (!report.hebrew_available) {
        report.blocker ||= 'No Hebrew probe text found';
      } else if (!report.license_ok) {
        report.blocker ||= `License is ${report.license}`;
      } else if (!report.schema_importable) {
        report.blocker ||= 'Schema is not supported by importer';
      } else {
        report.blocker ||= getHebrewOnlyBlocker(report);
      }
      report.importable_now = Boolean(report.hebrew_available && report.license_ok && report.schema_importable && !report.already_imported && !report.blocker);
    } catch (error) {
      report.blocker = error instanceof Error ? error.message : String(error);
    }

    reports.push(report);
    process.stderr.write('.');
  }
  process.stderr.write('\n');

  const importable = reports
    .filter((report) => report.importable_now && !report.already_configured)
    .map(buildImportEntry);
  const result = {
    generated_at: new Date().toISOString(),
    source: 'Sefaria API',
    categories: args.categories,
    scanned: reports.length,
    importable_now: reports.filter((report) => report.importable_now).length,
    importable_not_configured: importable.length,
    already_imported: reports.filter((report) => report.already_imported).length,
    candidates: reports,
    import_entries: importable,
  };

  writeJson(args.outputJson, result);
  writeJson(args.outputConfig, { works: importable });

  const lines = [];
  lines.push('# Sefaria Safe Candidate Report', '');
  lines.push(`Generated: ${result.generated_at}`, '');
  lines.push(`Categories: ${args.categories.join(', ')}`);
  lines.push(`Scanned: ${result.scanned}`);
  lines.push(`Importable now: ${result.importable_now}`);
  lines.push(`Importable and not configured: ${result.importable_not_configured}`);
  lines.push(`Already imported: ${result.already_imported}`, '');
  lines.push('## Importable And Not Configured', '');
  lines.push('| Work | Hebrew title | License | Version | Est. units | Probe ref | Source |');
  lines.push('|---|---|---|---|---:|---|---|');
  for (const report of reports.filter((item) => item.importable_now && !item.already_configured)) {
    lines.push(`| ${mdCell(report.work_title)} | ${mdCell(report.he_title)} | ${mdCell(report.license)} | ${mdCell(report.version_title)} | ${mdCell(report.estimated_unit_count)} | ${mdCell(report.probe_ref)} | ${mdCell(report.version_source)} |`);
  }
  lines.push('', '## Blocked Or Already Covered', '');
  lines.push('| Work | License | Hebrew | Imported | Configured | Blocker |');
  lines.push('|---|---|---|---|---|---|');
  for (const report of reports.filter((item) => !item.importable_now || item.already_configured).slice(0, 250)) {
    const blocker = report.already_imported ? 'already imported' : report.already_configured ? 'already configured' : report.blocker;
    lines.push(`| ${mdCell(report.work_title)} | ${mdCell(report.license)} | ${report.hebrew_available ? 'yes' : 'no'} | ${report.already_imported ? 'yes' : 'no'} | ${report.already_configured ? 'yes' : 'no'} | ${mdCell(blocker)} |`);
  }
  writeText(args.outputMarkdown, `${lines.join('\n')}\n`);

  console.log(JSON.stringify({
    scanned: result.scanned,
    importable_now: result.importable_now,
    importable_not_configured: result.importable_not_configured,
    output_json: args.outputJson,
    output_markdown: args.outputMarkdown,
    output_config: args.outputConfig,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
