// read-only: the fourteen cards' pills, each put in ONE kind of dictionary by the best-placed dictionary that carries it
// (a Bible dictionary or the place's own reading; else a Wiktionary; else the rabbinic dictionary beside the store;
// else a word list or knowledge base), beside the outside reader's call
import { readFileSync } from "node:fs";
const [, , cardsPath, tsvPath, corpusPath, indexPath] = process.argv;
const corpus = JSON.parse(readFileSync(corpusPath, "utf8")).witnesses;
const ms = JSON.parse(readFileSync(indexPath, "utf8")).m_sources;
const cards = JSON.parse(readFileSync(cardsPath, "utf8")).cards;
const norm = (s) => String(s).replace(/\s+/g, " ").trim();
const isWikt = (m) => /wiktionary|dbnary/i.test(((ms[m] || {}).key || "") + ((corpus[m] || {}).label || ""));
const calls = new Map();
const lines = readFileSync(tsvPath, "utf8").split("\n").filter(Boolean); const head = lines[0].split("\t"); const col = (n) => head.indexOf(n);
for (const l of lines.slice(1)) { const f = l.split("\t"); calls.set(`${f[col("verse")]}|${f[col("form")]}|${norm(f[col("text")])}`, f[col("the reader's call")]); }
const T = {}; const ex = {};
for (const c of cards) for (const p of c.pills || []) {
  const toks = String(p.by || "").split(/\s+/).filter(Boolean);
  const mids = toks.filter((t) => /^M\d+$/.test(t));
  const bible = /PIECE:/.test(p.by || "") || mids.some((m) => (corpus[m] || {}).corpus === "BIBLICAL");
  const overlay = p.overlay === "jastrow" || (mids.includes("M12") && !corpus.M12);
  const aram = mids.some((m) => (corpus[m] || {}).corpus === "ARAMAIC");
  const kind = bible ? "1 Bible dictionaries" : mids.some(isWikt) && !aram ? "2 Wiktionary (English, Hebrew)" : overlay ? "3 Jastrow (rabbinic)" : aram ? "5 Aramaic Wiktionary" : "4 word lists and knowledge bases";
  const call = calls.get(`${c.label}|${c.s}|${norm(p.text)}`) || "new";
  const g = call === "R" ? "right" : call === "new" ? "not graded" : "not right";
  (T[kind] ||= { right: 0, "not right": 0, "not graded": 0, total: 0 })[g] += 1; T[kind].total += 1;
  if (!bible) (ex[kind + " · " + g] ||= []).push(`«${norm(p.text).slice(0, 34)}»`);
}
for (const k of Object.keys(T).sort()) console.log(`${k.padEnd(36)} ${String(T[k].total).padStart(4)} pills · right ${String(T[k].right).padStart(3)} · not right ${String(T[k]["not right"]).padStart(3)} · not graded ${T[k]["not graded"]}`);
for (const k of Object.keys(ex).sort()) console.log(`\n${k} (${ex[k].length}): ${ex[k].slice(0, 16).join(" ")}`);
