// Where Strong says, in his own words, that he is not sure: every entry of his dictionary the served dictionary
// store holds (the Open Scriptures edition, the provider's XML kept whole in each record's D), with the hedging
// words counted in the clause that says where a word comes from (<source>) and, apart, in what it means (<meaning>).
// The words looked for are listed below and are counted as whole words; an entry is counted once per clause.
// node strong-hedges.mjs <reader dir> <source id of the edition, e.g. M9> [--tsv out.tsv]
// Nothing is written but the table asked for. It counts; it does not judge.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const argv = process.argv.slice(2);
const ti = argv.indexOf("--tsv"); const TSV = ti >= 0 ? argv[ti + 1] : null; if (ti >= 0) argv.splice(ti, 2);
const [R, M] = argv;
const HEDGES = ["apparent", "apparently", "probably", "perhaps", "possibly", "uncertain", "doubtful", "dubious", "supposed", "seemingly", "conjectural", "unknown", "obscure"];
const dir = join(R, "data/dictionary-store/shards");
const entries = new Map();   // entry id -> { src, meaning, heads }
let recs = 0;
for (const f of readdirSync(dir).sort()) {
  let raw = readFileSync(join(dir, f));
  try { raw = gunzipSync(raw); } catch { /* served plain */ }
  const shard = JSON.parse(raw.toString("utf8"));
  for (const under of Object.values(shard)) for (const r of (under && under.records) || []) {
    if (r.m !== M) continue;
    recs += 1;
    const d = String(r.D || "");
    const id = (/<entry id="([^"]+)"/u.exec(d) || [])[1];
    if (!id || entries.has(id)) continue;
    const part = (tag) => (new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "u").exec(d) || [])[1] || "";
    const plain = (x) => x.replace(/<note>[\s\S]*?<\/note>/gu, " ").replace(/<[^>]+>/gu, "").replace(/\s+/gu, " ").trim();
    entries.set(id, { src: plain(part("source")), meaning: plain(part("meaning")), usage: plain(part("usage")), heads: r.headwords || [] });
  }
}
const has = (t, w) => new RegExp(`(^|[^a-z])${w}([^a-z]|$)`, "iu").test(t);
const count = (field) => { const by = new Map(); let any = 0; for (const e of entries.values()) { const hit = HEDGES.filter((w) => has(e[field], w)); if (hit.length) any += 1; for (const w of hit) by.set(w, (by.get(w) || 0) + 1); } return { any, by }; };
const s = count("src"), m = count("meaning"), u = count("usage");
const say = (c) => [...c.by].sort((a, b) => b[1] - a[1]).map(([w, n]) => `${w} ${n}`).join(" · ") || "none";
console.log(`${M}: ${recs} records under every key · ${entries.size} entries of the dictionary, each read once`);
console.log(`  entries with a derivation clause (<source>) at all: ${[...entries.values()].filter((e) => e.src).length}`);
console.log(`  he hedges where the word comes from in ${s.any} entries: ${say(s)}`);
console.log(`  he hedges in what it means (<meaning>) in ${m.any} entries: ${say(m)}`);
console.log(`  and in the renderings (<usage>) in ${u.any} entries: ${say(u)}`);
const eg = (field, w, n) => [...entries].filter(([, e]) => has(e[field], w)).slice(0, n).map(([id, e]) => `${id} ${e.heads[0] || ""}: ${e[field].slice(0, 110)}`);
for (const w of ["apparent", "apparently", "probably", "perhaps", "uncertain"]) for (const x of eg("src", w, 2)) console.log(`     ${w}: ${x}`);
for (const x of eg("meaning", "perhaps", 3)) console.log(`     in a meaning: ${x}`);
if (TSV) {
  const rows = [...entries].map(([id, e]) => [id, e.heads[0] || "", HEDGES.filter((w) => has(e.src, w)).join(" "), HEDGES.filter((w) => has(e.meaning, w)).join(" "), e.src, e.meaning]).filter((r) => r[2] || r[3]);
  writeFileSync(TSV, `${["entry", "headword", "hedges in the derivation", "hedges in the meaning", "the derivation clause", "the meaning"].join("\t")}\n${rows.map((r) => r.join("\t")).join("\n")}\n`);
  console.log(`table: ${TSV} (${rows.length} entries)`);
}
