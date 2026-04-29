import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const sourceDir = process.argv[2] || 'data/sources';

const commentaryMetadata = new Map(Object.entries({
  'aderet-eliyahu': {
    base_work_id: 'torah',
    base_work_title: 'Torah',
  },
  'beur-hagra-on-jerusalem-talmud-bikkurim': {
    base_work_id: 'jerusalem-talmud-bikkurim',
    base_work_title: 'Jerusalem Talmud Bikkurim',
  },
  'beur-hagra-on-jerusalem-talmud-challah': {
    base_work_id: 'jerusalem-talmud-challah',
    base_work_title: 'Jerusalem Talmud Challah',
  },
  'beur-hagra-on-shulchan-arukh-choshen-mishpat': {
    base_work_id: 'shulchan-arukh-choshen-mishpat',
    base_work_title: 'Shulchan Arukh, Choshen Mishpat',
  },
  'beur-hagra-on-shulchan-arukh-even-haezer': {
    base_work_id: 'shulchan-arukh-even-haezer',
    base_work_title: 'Shulchan Arukh, Even HaEzer',
  },
  'beur-hagra-on-shulchan-arukh-orach-chayim': {
    base_work_id: 'shulchan-arukh-orach-chayim',
    base_work_title: 'Shulchan Arukh, Orach Chayim',
  },
  'beur-hagra-on-shulchan-arukh-yoreh-deah': {
    base_work_id: 'shulchan-arukh-yoreh-deah',
    base_work_title: "Shulchan Arukh, Yoreh De'ah",
  },
  'beur-hagra-on-sifra-detzniuta': {
    base_work_id: 'sifra-detzniuta',
    base_work_title: 'Sifra DeTzniuta',
  },
  'gra-on-pirkei-avot': {
    base_work_id: 'pirkei-avot',
    base_work_title: 'Pirkei Avot',
  },
  'gras-nuschah-on-avot-drabbi-natan': {
    base_work_id: 'avot-drabbi-natan',
    base_work_title: "Avot D'Rabbi Natan",
  },
  'gras-nuschah-on-tractate-derekh-eretz-rabbah': {
    base_work_id: 'tractate-derekh-eretz-rabbah',
    base_work_title: 'Tractate Derekh Eretz Rabbah',
  },
  'gras-nuschah-on-tractate-derekh-eretz-zuta': {
    base_work_id: 'tractate-derekh-eretz-zuta',
    base_work_title: 'Tractate Derekh Eretz Zuta',
  },
  'gras-nuschah-on-tractate-kallah': {
    base_work_id: 'tractate-kallah',
    base_work_title: 'Tractate Kallah',
  },
  'gras-nuschah-on-tractate-semachot': {
    base_work_id: 'tractate-semachot',
    base_work_title: 'Tractate Semachot',
  },
  'gras-nuschah-on-tractate-soferim': {
    base_work_id: 'tractate-soferim',
    base_work_title: 'Tractate Soferim',
  },
  'hagra-on-sefer-yetzirah-gra-version': {
    base_work_id: 'sefer-yetzirah-gra-version',
    base_work_title: 'Sefer Yetzirah Gra Version',
  },
  'yahel-ohr-on-zohar': {
    base_work_id: 'zohar',
    base_work_title: 'Zohar',
  },
}));

const metadataKeys = [
  'work_type',
  'base_work_id',
  'base_work_title',
  'base_ref_pattern',
  'display_label',
];

function readTextFromHead(relativePath) {
  try {
    return execFileSync('git', ['show', `HEAD:${relativePath.replaceAll(path.sep, '/')}`], {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 200,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return null;
  }
}

function readJsonText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function lineFor(key, value) {
  const escaped = JSON.stringify(value);
  return `    "${key}":  ${escaped},`;
}

function upsertRootMetadata(text, metadata) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const filtered = [];
  let insideRootPrefix = true;

  for (const line of lines) {
    const rootMetadataLine = metadataKeys.some((key) => new RegExp(`^\\s+"${key}":`).test(line));
    if (insideRootPrefix && rootMetadataLine) {
      continue;
    }
    filtered.push(line);
    if (insideRootPrefix && /^\s+"outline":/.test(line)) {
      insideRootPrefix = false;
    }
    if (insideRootPrefix && /^\s+"units":/.test(line)) {
      insideRootPrefix = false;
    }
  }

  const importDateIndex = filtered.findIndex((line) => /^\s+"import_date":/.test(line));
  if (importDateIndex === -1) {
    throw new Error('Could not find root import_date field');
  }

  const metadataLines = Object.entries(metadata).map(([key, value]) => lineFor(key, value));
  filtered.splice(importDateIndex + 1, 0, ...metadataLines);
  return filtered.join('\n').replace(/\n*$/, '\n');
}

function writeJsonText(filePath, value) {
  fs.writeFileSync(filePath, value, 'utf8');
}

for (const fileName of fs.readdirSync(sourceDir).filter((name) => name.endsWith('.json')).sort()) {
  const filePath = path.join(sourceDir, fileName);
  const relativePath = path.relative(process.cwd(), filePath);
  const originalText = readTextFromHead(relativePath) || readJsonText(filePath);
  const source = JSON.parse(originalText);
  const meta = commentaryMetadata.get(source.work_id);
  const metadata = {};

  if (meta) {
    metadata.work_type = 'commentary';
    metadata.base_work_id = meta.base_work_id;
    metadata.base_work_title = meta.base_work_title;
    metadata.base_ref_pattern = meta.base_ref_pattern || `${meta.base_work_title} {sections}`;
    metadata.display_label = `Commentary on ${meta.base_work_title}`;
  } else {
    metadata.work_type = 'primary_text';
  }

  writeJsonText(filePath, upsertRootMetadata(originalText, metadata));
}

console.log(JSON.stringify({
  source_dir: sourceDir,
  commentary_works: commentaryMetadata.size,
}, null, 2));
