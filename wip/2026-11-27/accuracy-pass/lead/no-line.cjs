// The words the resting lines count as standing under no line: where they are and what the zone holds there.
const z = require('zlib'), fs = require('fs'), path = require('path');
const BASE = process.argv[2];
const dir = path.join(BASE, 'reader/data/resting-lines');
let shown = 0, sumWords = 0, sumNo = 0;
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json.gz'))) {
  const b = f.replace('.json.gz', '');
  if (b === 'tikkunei-zohar') continue;
  const j = JSON.parse(z.gunzipSync(fs.readFileSync(path.join(dir, f))));
  sumWords += j.counts.words; sumNo += j.counts.words_under_no_line;
  if (!j.counts.words_under_no_line) continue;
  const zone = JSON.parse(z.gunzipSync(fs.readFileSync(path.join(BASE, 'reader/data/zones', b + '.bin'))));
  if (!shown++) console.log('zone keys', Object.keys(zone), '| section keys', Object.keys(zone.sections[0]), '| entry sample', JSON.stringify((zone.sections[0].words || zone.sections[0].w || zone.sections[0].entries || [])[0]).slice(0, 300));
  j.sections.forEach(([id, rows], si) => {
    const sec = zone.sections[si];
    const list = sec.words || sec.w || sec.entries || [];
    const covered = new Set();
    for (const r of rows) for (let i = r[0]; i < r[0] + r[1]; i++) covered.add(i);
    list.forEach((e, i) => {
      if (covered.has(i)) return;
      const s = JSON.stringify(e);
      // an entry that is a mark says so; print every uncovered entry that does not look like one
      if (e && (e.mark || e.m === 1 || e.kind === 'mark')) return;
      console.log(b, id, 'entry', i, s.slice(0, 260)); (global.P = global.P || []).push({ book: b, si, e: i, id, s: e.s });
    });
  });
}
console.log('words', sumWords, 'under no line', sumNo); fs.writeFileSync('no-line-places.json', JSON.stringify(global.P || [], null, 1));
