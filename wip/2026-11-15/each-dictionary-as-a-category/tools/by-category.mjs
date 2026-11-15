// read-only: the outside reader's fourteen Genesis 1 verb cards as the live build serves them, each pill sorted by the
// category of the dictionaries that carry it (the shelf's own record, data/source-corpus-v1.json), beside the reader's call
import { readFileSync } from "node:fs";
const [, , cardsPath, tsvPath, corpusPath] = process.argv;
const corpus = JSON.parse(readFileSync(corpusPath, "utf8")).witnesses;
const cards = JSON.parse(readFileSync(cardsPath, "utf8")).cards;
const norm = (s) => String(s).replace(/\s+/g, " ").trim();
const calls = new Map();
const lines = readFileSync(tsvPath, "utf8").split("\n").filter(Boolean);
const head = lines[0].split("\t");
const col = (n) => head.indexOf(n);
for (const l of lines.slice(1)) { const f = l.split("\t"); calls.set(`${f[col("verse")]}|${f[col("form")]}|${norm(f[col("text")])}`, f[col("the reader's call")]); }
const NAME = { R: "right", S: "another stem", W: "another word", B: "broken", M: "bundled", U: "unsure", new: "not graded (new since 12 Nov)" };
const tally = {}; const unknown = new Map(); const examples = {};
let n = 0;
for (const c of cards) for (const p of c.pills || []) {
  n += 1;
  const toks = String(p.by || "").split(/\s+/).filter(Boolean);
  const classes = new Set();
  for (const t of toks) {
    if (/^M\d+$/.test(t)) { const w = corpus[t]; classes.add(w ? w.corpus : "NOT_IN_RECORD"); if (!w) unknown.set(t, (unknown.get(t) || 0) + 1); }
    else if (/^PIECE:/.test(t)) classes.add("PLACE");
    else { classes.add("OTHER:" + t.split(":")[0]); }
  }
  if (p.overlay) classes.add("OVERLAY");
  const hasBible = classes.has("BIBLICAL") || classes.has("PLACE");
  const kind = hasBible ? "a Bible dictionary carries it" : [...classes].every((x) => x === "UNDECLARED") && classes.size ? "only general word lists carry it" : `other (${[...classes].sort().join("+") || "none"})`;
  const call = calls.get(`${c.label}|${c.s}|${norm(p.text)}`) || "new";
  (tally[kind] ||= {})[call] = (tally[kind][call] || 0) + 1;
  if (kind.startsWith("only general")) (examples[call] ||= []).push(`${c.label} «${norm(p.text).slice(0, 40)}» ${toks.join(",")}`);
}
console.log(`${cards.length} cards · ${n} pills on the live build`);
for (const [kind, t] of Object.entries(tally)) {
  const tot = Object.values(t).reduce((a, b) => a + b, 0);
  console.log(`\n${kind}: ${tot} pills`);
  for (const [call, k] of Object.entries(t).sort((a, b) => b[1] - a[1])) console.log(`   ${NAME[call] || call}: ${k}`);
}
console.log("\nonly general word lists, examples by the reader's call:");
for (const [call, ex] of Object.entries(examples)) console.log(`  ${NAME[call] || call} (${ex.length}): ${ex.slice(0, 12).join(" · ")}`);
if (unknown.size) console.log("\nM ids not in the record:", [...unknown].map(([m, k]) => `${m}×${k}`).join(" "));
