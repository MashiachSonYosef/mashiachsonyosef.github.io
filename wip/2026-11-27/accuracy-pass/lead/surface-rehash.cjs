// Each of the 39 books: the served zone's words, rejoined where the zone says a word joins the next without a separator,
// one row per line, hashed; held against the rights record's restore_surface_sha256 and the zone's own walk block.
// node surface-rehash.cjs <reader dir>
const z = require('zlib'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const R = process.argv[2];
const rights = JSON.parse(fs.readFileSync(path.join(R, 'data/mam-restore-v5-rights-v1.json'), 'utf8'));
let ok = 0, n = 0;
for (const work of Object.keys(rights.works).sort()) {
  const b = work.split('/')[1];
  const zone = JSON.parse(z.gunzipSync(fs.readFileSync(path.join(R, 'data/zones', b + '.bin'))));
  const rows = []; let cur = '';
  for (const s of zone.sections) for (const w of s.words) {
    cur += w.s;
    if ((w.presentation_join || {}).join_next_without_separator) continue;
    rows.push(cur); cur = '';
  }
  if (cur) rows.push(cur);
  const got = crypto.createHash('sha256').update(rows.join('\n') + '\n', 'utf8').digest('hex');
  const want = rights.works[work].restore_surface_sha256;
  const walk = (((zone.emitted_from || {}).walk || {}).restore_oracle || {}).surface_sha256;
  n++;
  if (got === want && got === walk) ok++; else console.log('DIFFERS', b, got.slice(0, 12), 'rights', String(want).slice(0, 12), 'zone', String(walk).slice(0, 12));
}
console.log('books', n, 'whose served words hash to the rights record and the zone\'s own record:', ok);
