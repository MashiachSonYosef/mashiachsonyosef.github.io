// Two builds' live lines for the same book under the same sources switched off (probes/live-lines.mjs --lines),
// set side by side word by word: how many read the same, how many read another reading, how many went bare or came
// back from bare.
// node live-lines-diff.mjs <a.json> <b.json> [--show N]
// Nothing is written. It measures; it does not judge.
import { readFileSync } from "node:fs";
const argv = process.argv.slice(2);
const i = argv.indexOf("--show"); const SHOW = i < 0 ? 10 : Number(argv.splice(i, 2)[1]);
const [A, B] = argv.map((f) => JSON.parse(readFileSync(f, "utf8")));
const mb = new Map(B.lines.map((x) => [x.at, x]));
const sum = { same: 0, sameBare: 0, other: [], toBare: [], fromBare: [], onlyA: 0, onlyB: 0 };
const seen = new Set();
for (const x of A.lines) {
  const y = mb.get(x.at); seen.add(x.at);
  if (!y) { sum.onlyA += 1; continue; }
  if (x.line === y.line) { if (x.line) sum.same += 1; else sum.sameBare += 1; continue; }
  const row = `${x.at} ${x.surface}: ${JSON.stringify(x.line)} -> ${JSON.stringify(y.line)}`;
  if (!y.line) sum.toBare.push(row); else if (!x.line) sum.fromBare.push(row); else sum.other.push(row);
}
for (const y of B.lines) if (!seen.has(y.at)) sum.onlyB += 1;
console.log(`${A.book} · sources off: ${A.off.join(" ")} · the first ${A.sections} sections, ${A.words} words · ${A.lines.length} and ${B.lines.length} lines read live`);
console.log(`  the same reading ${sum.same} · bare on both ${sum.sameBare} · another reading ${sum.other.length} · a reading on the first, bare on the second ${sum.toBare.length} · bare on the first, a reading on the second ${sum.fromBare.length} · live on one build only ${sum.onlyA} and ${sum.onlyB}`);
for (const [name, list] of [["another reading", sum.other], ["now bare", sum.toBare], ["no longer bare", sum.fromBare]]) for (const x of list.slice(0, SHOW)) console.log(`     ${name} · ${x}`);
