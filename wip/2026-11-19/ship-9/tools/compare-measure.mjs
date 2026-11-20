// Strong's «Compare» notes in the store (read-only): how many entries carry one, and how they name the other entry.
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const R = process.argv[2];
const ix = JSON.parse(readFileSync(join(R, "data/route-store/index.json"), "utf8")).m_sources;
const strong = new Set(Object.keys(ix).filter((m) => /strong/i.test(ix[m].key || "")));
const entries = new Map();   // n -> D text (first)
let rows = 0;
for (const f of readdirSync(join(R, "data/route-store/shards"))) {
  const sh = JSON.parse(gunzipSync(readFileSync(join(R, "data/route-store/shards", f))).toString("utf8"));
  for (const list of Object.values(sh)) for (const r of list) {
    if (!strong.has(r[3])) continue;
    rows += 1;
    const facts = r.length > 10 && r[10] && typeof r[10] === "object" ? r[10] : {};
    const n = (facts.n || [])[0];
    const D = String(r[2] || "");
    if (n && /\bcompare\b/i.test(D) && !entries.has(`${r[3]} ${n}`)) entries.set(`${r[3]} ${n}`, D);
  }
}
const byM = {};
let withNum = 0, withHeb = 0;
for (const [k, D] of entries) {
  const m = k.split(" ")[0]; byM[m] = (byM[m] || 0) + 1;
  const after = D.slice(D.search(/compare/i));
  if (/H\d+|\b\d{2,4}\b/.test(after)) withNum += 1;
  if (/[א-ת]/u.test(after)) withHeb += 1;
}
console.log(JSON.stringify({ strong_ids: [...strong], rows, entries_with_compare: entries.size, byM, naming_a_number: withNum, naming_a_hebrew_word: withHeb }));
const ex = [...entries].filter(([k]) => /H2396|H3169/.test(k)).concat([...entries].slice(0, 3));
for (const [k, D] of ex) console.log(k, "·", D.slice(0, 220).replace(/[֐-׿]+/gu, (w) => `[${[...w].map((c) => c.codePointAt(0).toString(16)).join(" ")}]`));
// mutual pairs in M9: n says «Compare m» and m says «Compare n»
const pairs = new Map();
for (const [k, D] of entries) {
  const [m, n] = k.split(" ");
  if (m !== "M9") continue;
  for (const x of D.matchAll(/compare\s+((?:\d+\s*(?:,|and)?\s*)+)/gi)) for (const y of x[1].match(/\d+/g) || []) pairs.set(`${n}>H${y}`, true);
}
let mutual = 0; const seen = new Set(), list = [];
for (const k of pairs.keys()) { const [a, b] = k.split(">"); if (pairs.has(`${b}>${a}`) && !seen.has(`${b}>${a}`)) { mutual += 1; seen.add(k); if (list.length < 12) list.push(`${a}~${b}`); } }
console.log(JSON.stringify({ m9_compare_links: pairs.size, mutual_pairs: mutual, sample: list }));
