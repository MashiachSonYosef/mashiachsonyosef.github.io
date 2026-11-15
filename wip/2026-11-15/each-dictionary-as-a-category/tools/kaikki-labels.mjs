// read-only: English Wiktionary's rows in the live store (as Kaikki gives them): how many carry a label in their own
// text (a leading parenthesis, or a known label word), and the commonest of each
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [, , readerDir] = process.argv;
const dir = join(readerDir, "data", "route-store");
const ix = JSON.parse(readFileSync(join(dir, "index.json"), "utf8"));
const kaikki = new Set(Object.entries(ix.m_sources).filter(([, s]) => s.key === "kaikki_wiktionary_hebrew").map(([m]) => m));
const lead = new Map(), anywhere = new Map(); let rows = 0, withLead = 0; const ex = new Map();
const WORDS = ["Biblical Hebrew", "Modern Israeli Hebrew", "Mishnaic Hebrew", "Medieval Hebrew", "Modern Hebrew", "slang", "colloquial", "informal", "archaic", "obsolete", "dated", "vulgar", "military", "computing", "Internet", "grammar", "linguistics", "Judaism", "biblical", "Kabbalah", "mathematics", "chemistry", "physics", "medicine", "anatomy", "botany", "zoology", "music", "sports", "law", "politics", "figurative", "literary", "poetic", "rare", "neologism", "abbreviation", "initialism", "acronym", "given name", "surname", "a country", "a city", "capital of", "a language", "letter of the Hebrew alphabet", "borrowed", "loanword"];
for (const f of readdirSync(join(dir, "shards"))) {
  const body = JSON.parse(gunzipSync(readFileSync(join(dir, "shards", f))).toString("utf8"));
  for (const [k, rs] of Object.entries(body)) for (const r of rs) {
    if (!kaikki.has(r[3])) continue;
    rows += 1; const t = String(r[1] ?? "");
    const m = t.match(/^\(([^)]{1,60})\)/u);
    if (m) { withLead += 1; for (const lab of m[1].split(/[,;]/u).map((x) => x.trim()).filter(Boolean)) { lead.set(lab, (lead.get(lab) || 0) + 1); if (!ex.has(lab)) ex.set(lab, `${k}: ${t.slice(0, 70)}`); } }
    for (const w of WORDS) if (t.toLowerCase().includes(w.toLowerCase())) { anywhere.set(w, (anywhere.get(w) || 0) + 1); if (!ex.has("~" + w)) ex.set("~" + w, `${k}: ${t.slice(0, 80)}`); }
  }
}
console.log(`English Wiktionary's Hebrew rows in the store: ${rows.toLocaleString("en-US")} (${[...kaikki].length} tables) · ${withLead.toLocaleString("en-US")} open with a parenthesis`);
console.log("\nleading labels (top 40):");
for (const [l, n] of [...lead].sort((a, b) => b[1] - a[1]).slice(0, 40)) console.log(`  ${String(n).padStart(6)}  ${l}   e.g. ${ex.get(l)}`);
console.log("\nlabel words anywhere in the text:");
for (const [l, n] of [...anywhere].sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(6)}  ${l}   e.g. ${ex.get("~" + l)}`);
