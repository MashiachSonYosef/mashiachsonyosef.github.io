// Two sets of exported verses (probes/export-sections.mjs), compared record by record: for every word's address, the
// record each file cites (its headword, its reading, its source and license) and what the file says is withheld.
// node export-diff.mjs <dir A> <dir B> [--show N]
// Prints how many words' records are the same, how many moved to another source, how many stayed with their source
// under another record, and the first N of each kind. Nothing is written. It measures; it does not judge.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
const argv = process.argv.slice(2);
const flag = (f, d) => { const i = argv.indexOf(f); if (i < 0) return d; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const SHOW = Number(flag("--show", "12"));
const [A, B] = argv;
// a file's records: "N. headword: ..." or "N. reading: ..." and the indented lines under it, keyed by "for:"
const records = (text) => {
  const out = new Map();
  const body = text.split("# Records, as received")[1] || "";
  let cur = null;
  for (const line of body.split("\n")) {
    const head = /^(\d+)\. (headword|reading): (.*)$/u.exec(line);
    if (head) { cur = { n: Number(head[1]), headword: "", reading: "", definition: "", for: "", source: "", license: "" }; cur[head[2]] = head[3]; continue; }
    if (/^#/u.test(line)) { cur = null; continue; }
    const f = /^ {4}(reading|definition|for|source|license): (.*)$/u.exec(line);
    if (cur && f) { cur[f[1]] = f[2]; if (f[1] === "for") out.set(f[2], cur); }
  }
  return out;
};
// what a file says it withheld, one line per word
const withheld = (text) => (text.match(/^- .*?(?:withheld|not exported|does not carry).*$/gmu) || []);
const src = (s) => s.replace(/^\[\d+\] /u, "").replace(/ · wording .*$/u, "");
const files = readdirSync(A).filter((f) => /^s\d+\.txt$/u.test(f)).sort();
const sum = { files: 0, words: 0, same: 0, moved: [], sameSourceOtherRecord: [], onlyA: [], onlyB: [], licenseMoved: 0 };
for (const f of files) {
  let a, b;
  try { a = readFileSync(join(A, f), "utf8"); b = readFileSync(join(B, f), "utf8"); } catch { continue; }
  sum.files += 1;
  const ra = records(a), rb = records(b);
  for (const [at, x] of ra) {
    sum.words += 1;
    const y = rb.get(at);
    if (!y) { sum.onlyA.push(`${at}: ${JSON.stringify(x.reading)} from ${src(x.source)}`); continue; }
    if (src(x.source) !== src(y.source)) { sum.moved.push(`${at}: ${JSON.stringify(x.reading)} from ${src(x.source)} (${x.license.split(" — ")[0]}) -> ${JSON.stringify(y.reading)} from ${src(y.source)} (${y.license.split(" — ")[0]})`); if (x.license.split(" — ")[0] !== y.license.split(" — ")[0]) sum.licenseMoved += 1; continue; }
    if (x.headword !== y.headword || x.reading !== y.reading || x.definition !== y.definition) { sum.sameSourceOtherRecord.push(`${at}: ${src(x.source)} · headword ${JSON.stringify(x.headword)} reading ${JSON.stringify(x.reading)} -> headword ${JSON.stringify(y.headword)} reading ${JSON.stringify(y.reading)}`); continue; }
    sum.same += 1;
  }
  for (const [at, y] of rb) if (!ra.has(at)) { sum.words += 1; sum.onlyB.push(`${at}: ${JSON.stringify(y.reading)} from ${src(y.source)}`); }
}
console.log(`${sum.files} verses · ${sum.words} words with a record in either set`);
console.log(`  the same record: ${sum.same}`);
const say = (name, list) => { console.log(`  ${name}: ${list.length}`); for (const x of list.slice(0, SHOW)) console.log(`     ${x}`); if (list.length > SHOW) console.log(`     and ${list.length - SHOW} more`); };
say(`another source (the license class moves at ${sum.licenseMoved})`, sum.moved);
say("the same source, another record of it", sum.sameSourceOtherRecord);
say("a record in the first set only", sum.onlyA);
say("a record in the second set only", sum.onlyB);
