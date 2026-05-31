#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const cacheDir = process.argv[2] || '.local-cache/definition-routes';
const reportPath = process.argv[3] || 'reports/definition-cache-size-audit.md';
const warningBytes = Number(process.argv[4] || 80) * 1024 * 1024 * 1024;

function walk(dir) {
  const fullDir = path.join(root, dir);
  if (!fs.existsSync(fullDir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(fullDir, { withFileTypes: true })) {
    const relativePath = path.join(dir, entry.name).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      files.push(...walk(relativePath));
    } else if (entry.isFile()) {
      const stat = fs.statSync(path.join(root, relativePath));
      files.push({ path: relativePath, bytes: stat.size });
    }
  }
  return files;
}

function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
}

const files = walk(cacheDir);
const totalBytes = files.reduce((sum, file) => sum + file.bytes, 0);
const topFiles = [...files].sort((a, b) => b.bytes - a.bytes).slice(0, 40);
const warning = totalBytes >= warningBytes;

const report = [
  '# Definition Cache Size Audit',
  '',
  `Generated from local cache directory: ${cacheDir}`,
  '',
  '## Counts',
  '',
  `- Files: ${files.length}`,
  `- Total size: ${formatBytes(totalBytes)}`,
  `- Warning threshold: ${formatBytes(warningBytes)}`,
  `- Over threshold: ${warning ? 'yes' : 'no'}`,
  '',
  '## Largest Files',
  '',
  ...topFiles.map((file) => `- ${file.path}: ${formatBytes(file.bytes)}`),
  '',
].join('\n');

fs.mkdirSync(path.dirname(path.join(root, reportPath)), { recursive: true });
fs.writeFileSync(path.join(root, reportPath), report, 'utf8');

console.log(`Definition cache size audit complete. Total: ${formatBytes(totalBytes)}. Report: ${reportPath}`);
