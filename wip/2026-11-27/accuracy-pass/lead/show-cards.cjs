// Prints what the card probe read at each place: the line, the pills (with the source in each pill's title), what is held back.
// node show-cards.cjs <probe output.json> [text to look for in the pills]
const fs = require('fs');
const a = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const want = process.argv[3] ? process.argv[3].split('|') : [];
for (const p of a) {
  if (p.pageerror) { console.log('PAGE ERROR', p.book, p.pageerror); continue; }
  console.log(`\n${p.book} ${p.id} word ${p.n ?? '?'} (${p.state}) | line ${JSON.stringify(p.line)} | head ${p.head} | pills ${p.pills ? p.pills.length : '-'}${p.fault ? ' | ' + p.fault : ''}`);
  const pills = p.pills || [];
  const hit = pills.filter((x) => want.some((w) => x[0].includes(w)));
  for (const x of (want.length ? hit : pills.slice(0, 12))) console.log(`    ${x[2] ? '*' : ' '} ${JSON.stringify(x[0])}  <${x[1]}>`);
  if (want.length && !hit.length) console.log('    (no pill holds any of: ' + want.join(' | ') + ')   first pills: ' + pills.slice(0, 8).map((x) => x[0]).join(' ; '));
  if (p.held) console.log('    held: ' + p.held.slice(0, 300));
  if (p.here && p.here.length) console.log('    here: ' + p.here.join(' / ').slice(0, 300));
}
