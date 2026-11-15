// read-only: the same fourteen cards, the pills no Bible dictionary carries, counted by the dictionary family behind
// them and by the outside reader's call; and the whole shelf's rows by family
import { readFileSync } from "node:fs";
const [, , cardsPath, tsvPath, corpusPath, indexPath] = process.argv;
const corpus = JSON.parse(readFileSync(corpusPath, "utf8")).witnesses;
const ms = JSON.parse(readFileSync(indexPath, "utf8")).m_sources;
const cards = JSON.parse(readFileSync(cardsPath, "utf8")).cards;
const norm = (s) => String(s).replace(/\s+/g, " ").trim();
const family = (m) => { const k = (ms[m] || {}).key || ""; const l = (corpus[m] || {}).label || (ms[m] || {}).label || m;
  if (/kaikki_wiktionary_hebrew|kaikki.*english.*wiktionary|dbnary/i.test(k + l)) return "English Wiktionary (Kaikki, DBnary)";
  if (/hebrew wiktionary|hewiktionary/i.test(l + k)) return "Hebrew Wiktionary";
  if (/panlex/i.test(k + l)) return "PanLex"; if (/conceptnet/i.test(k + l)) return "ConceptNet"; if (/omegawiki/i.test(k + l)) return "OmegaWiki";
  if (/muse/i.test(k + l)) return "MUSE"; if (/wikipedia/i.test(k + l)) return "Hebrew Wikipedia titles"; if (/wikidata/i.test(k + l)) return "Wikidata";
  if (/wordnet/i.test(k + l)) return "Hebrew WordNet"; if (/aramaic/i.test(k + l)) return "Aramaic Wiktionary"; return l.slice(0, 50); };
const calls = new Map();
const lines = readFileSync(tsvPath, "utf8").split("\n").filter(Boolean); const head = lines[0].split("\t"); const col = (n) => head.indexOf(n);
for (const l of lines.slice(1)) { const f = l.split("\t"); calls.set(`${f[col("verse")]}|${f[col("form")]}|${norm(f[col("text")])}`, f[col("the reader's call")]); }
const fam = {};
for (const c of cards) for (const p of c.pills || []) {
  const toks = String(p.by || "").split(/\s+/).filter((t) => /^M\d+$/.test(t));
  const classes = toks.map((t) => (corpus[t] || {}).corpus || "NOT_IN_RECORD");
  if (!toks.length || classes.includes("BIBLICAL") || /PIECE:/.test(p.by || "")) continue;
  const call = calls.get(`${c.label}|${c.s}|${norm(p.text)}`) || "new";
  const good = call === "R" ? "right" : call === "new" ? "new" : "not right";
  for (const f of new Set(toks.map(family))) { (fam[f] ||= { right: 0, "not right": 0, new: 0 })[good] += 1; }
}
console.log("pills on the fourteen cards that no Bible dictionary carries, by the dictionary behind them (a pill two families carry counts under both):");
for (const [f, t] of Object.entries(fam).sort((a, b) => (b[1].right + b[1]["not right"]) - (a[1].right + a[1]["not right"]))) console.log(`  ${f.padEnd(40)} right ${String(t.right).padStart(3)} · not right ${String(t["not right"]).padStart(3)}${t.new ? " · new " + t.new : ""}`);
const shelf = {};
for (const [m, w] of Object.entries(corpus)) { if (w.corpus !== "UNDECLARED") continue; const f = family(m); (shelf[f] ||= { n: 0, rows: 0 }); shelf[f].n += 1; shelf[f].rows += w.rows || 0; }
console.log("\nthe shelf's general word lists (declare no body of text), by family:");
for (const [f, t] of Object.entries(shelf).sort((a, b) => b[1].rows - a[1].rows).slice(0, 16)) console.log(`  ${f.padEnd(52)} ${String(t.n).padStart(3)} tables · ${t.rows.toLocaleString("en-US").padStart(8)} rows`);
