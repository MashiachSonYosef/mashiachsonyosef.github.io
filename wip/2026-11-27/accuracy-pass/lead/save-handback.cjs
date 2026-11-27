// A helper's final report, taken from its own transcript and saved as a file, when the helper could not write the file itself.
// node save-handback.cjs <transcript.jsonl> <marker text that the report holds> <out file> [text to start from]
const fs = require('fs');
const [, , SRC, MARK, OUT, FROM] = process.argv;
let best = null;
const walk = (v) => {
  if (typeof v === 'string') { if (v.includes(MARK) && (!best || v.length >= best.length)) best = v; return; }
  if (Array.isArray(v)) { for (const x of v) walk(x); return; }
  if (v && typeof v === 'object') for (const k of Object.keys(v)) walk(v[k]);
};
for (const line of fs.readFileSync(SRC, 'utf8').split('\n')) {
  if (!line.includes(MARK.slice(0, 24))) continue;
  try { walk(JSON.parse(line)); } catch (e) { /* a line that is not one JSON value holds no report */ }
}
if (!best) { console.error('no text holding the marker was found'); process.exit(1); }
let text = best;
if (FROM) { const at = text.indexOf(FROM); if (at < 0) { console.error('the start text is not in the report'); process.exit(1); } text = text.slice(at); }
fs.writeFileSync(OUT, text.endsWith('\n') ? text : text + '\n');
console.log('saved', OUT, text.length, 'characters,', text.split('\n').length, 'lines; first line:', text.split('\n')[0].slice(0, 100));
