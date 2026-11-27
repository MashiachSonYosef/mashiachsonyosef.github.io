// A copy of one served zone with one word's last letter doubled, to prove the new law refuses a text that moved.
// node make-bad-zone.cjs <zone.bin> <out.bin>
const z = require('zlib'), fs = require('fs');
const zone = JSON.parse(z.gunzipSync(fs.readFileSync(process.argv[2])));
const w = zone.sections[3].words.find((x) => !x.mark && !x.kq);
w.s = w.s + w.s.slice(-1);
fs.writeFileSync(process.argv[3], z.gzipSync(Buffer.from(JSON.stringify(zone), 'utf8')));
console.log('one word changed in section', zone.sections[3].unit || 3);
