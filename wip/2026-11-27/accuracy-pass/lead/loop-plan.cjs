// The reading loop's parts: the 39 books cut at chapter ends into parts of about TARGET words, from the resting lines' own sections.
// node loop-plan.cjs <tree> <target words> <out.tsv>
const z = require('zlib'), fs = require('fs'), path = require('path');
const BASE = process.argv[2], TARGET = Number(process.argv[3] || 4000), OUT = process.argv[4];

const dir = path.join(BASE, 'reader/data/resting-lines');
const skip = new Set(['tikkunei-zohar']);
const books = fs.readdirSync(dir).filter((f) => f.endsWith('.json.gz')).map((f) => f.replace('.json.gz', '')).filter((b) => !skip.has(b));
const parts = [];
let total = 0;
for (const b of books) {
  const j = JSON.parse(z.gunzipSync(fs.readFileSync(path.join(dir, b + '.json.gz'))));
  const perChapter = new Map();
  for (const [id, rows] of j.sections) {
    const c = Number(String(id).split(':')[0]);
    perChapter.set(c, (perChapter.get(c) || 0) + rows.reduce((n, r) => n + r[1], 0));
  }
  const chapters = [...perChapter.keys()].sort((x, y) => x - y);
  const words = chapters.reduce((n, c) => n + perChapter.get(c), 0);
  total += words;
  const nParts = Math.max(1, Math.round(words / TARGET));
  const per = words / nParts;
  let cur = { b, from: chapters[0], to: chapters[0], words: 0 }, done = 0;
  for (const c of chapters) {
    const w = perChapter.get(c);
    // close the part before this chapter when it is nearer its share without the chapter than with it
    if (cur.words > 0 && parts.filter((p) => p.b === b).length < nParts - 1 && Math.abs(done + cur.words - per * (parts.filter((p) => p.b === b).length + 1)) <= Math.abs(done + cur.words + w - per * (parts.filter((p) => p.b === b).length + 1))) {
      parts.push(cur); done += cur.words; cur = { b, from: c, to: c, words: 0 };
    }
    cur.to = c; cur.words += w;
  }
  parts.push(cur);
}
const lines = ['part\tbook\tchapters\twords'];
parts.forEach((p, i) => lines.push(`${String(i + 1).padStart(3, '0')}\t${p.b}\t${p.from}-${p.to}\t${p.words}`));
if (OUT) fs.writeFileSync(OUT, lines.join('\n') + '\n');
const ws = parts.map((p) => p.words);
console.log('books', books.length, 'words', total, 'parts', parts.length, 'smallest', Math.min(...ws), 'largest', Math.max(...ws));
