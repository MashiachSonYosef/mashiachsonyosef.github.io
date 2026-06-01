import fs from 'node:fs';
import path from 'node:path';

const reportsDir = process.argv[2] || 'reports';
const staleExclusionRe = /Sources not used:\s*Kaikki/i;
const kaikkiSampleRe = /\(kaikki\)/i;

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const name of fs.readdirSync(dir)) {
    const filePath = path.join(dir, name);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walk(filePath, files);
    } else if (filePath.endsWith('.md')) {
      files.push(filePath);
    }
  }
  return files;
}

const offenders = walk(reportsDir)
  .filter((filePath) => {
    const text = fs.readFileSync(filePath, 'utf8');
    return staleExclusionRe.test(text) && kaikkiSampleRe.test(text);
  });

console.log(`Kaikki report contradiction files: ${offenders.length}`);
for (const filePath of offenders) console.log(filePath);

if (offenders.length > 0) process.exitCode = 1;
