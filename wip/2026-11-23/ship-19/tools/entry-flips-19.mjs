// read-only (23 November 2026): every entry-gate verdict that ship 19 moves, place by place, read the way the page
// reads it (relay v212's reading 1: a place asks its word's own key, and the gate gathers BDB's entries from every row
// of that key, before the pointing and the kinds hold any back), with the core piece's key beside it (reading B).
// The places are main's zones of the books the lattice tags (their tags do not move with the entries); each key's rows
// are read from main's store (<before>) and from the sandbox's (<after>), and each row's verdict is the gate's own
// (tools/entry-gate-v1.mjs). The tags a form answers under are the page's own (zone.html tagHolder, tagsAt,
// coreTagsAt). A flip is one (place, key, row) whose verdict moves between withheld ("other") and not.
// Writes <out>.jsonl (every flip) and <out>.json (the counts).
// Usage: node entry-flips-19.mjs <before reader> <after reader> <out prefix>
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [B, A, OUT] = process.argv.slice(2);
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const { openRouteStore, factsOf } = await import(join(A, "tools", "gloss-store-v1.mjs"));
const { placeEntry, placeTags, bdbEntriesAt, entryVerdict } = await import(join(A, "tools", "entry-gate-v1.mjs"));
const { zonesServed } = await import(join(B, "tools", "zones-on-disk-v1.mjs"));
const sb = openRouteStore(join(B, "data", "route-store")), sa = openRouteStore(join(A, "data", "route-store"));
const pin = JSON.parse(readFileSync(join(A, "data", "row-entries", "PIN.json"), "utf8"));
const FAMILY = new Map([["M5", "BDB (Open Scriptures)"], ["M46", "BDB (unabridged)"]]);
for (const l of pin.lists) for (const m of Object.keys(l.sources)) FAMILY.set(m, l.name);
const family = (m) => FAMILY.get(m) || "another source";
// the page's own: which of a word's forms answers a key, and its tags there
const tagHolder = (word, key) => {
  if (!word) return null;
  if (word.tg || word.te) return word;
  const tagged = (word.w || word.kqw || []).filter((r) => r && r.tg);
  return tagged.find((r) => r.k === key) || tagged[0] || null;
};
const readWordOfSeveral = (word, r) => r !== word && r.role === "QERE" && (word.w || word.kqw || []).filter((x) => x && x.role === "QERE").length > 1;
const tagsAt = (word, key) => { const h = tagHolder(word, key); return h && key && h.k === key && !readWordOfSeveral(word, h) ? placeTags(h) : null; };
const coreTagsAt = (word, key) => {
  const h = tagHolder(word, key);
  if (h && key && h.k === key && readWordOfSeveral(word, h)) return [].concat(h.tg);
  const cores = h && Array.isArray(word.pg) ? word.pg.filter((x) => x && x.r === "core") : [];
  return h && key && cores.length === 1 && cores[0].k === key ? placeTags(h) : null;
};
const ZB = join(B, "data", "zones");
const books = zonesServed(ZB).filter((z) => existsSync(join(ZB, `${z}.lattice.bin`)));
const judged = new Map();   // key + tags -> { before, after } verdicts, by row
const judge = (key, tags) => {
  const id = `${key}\u0001${tags.join(" ")}`;
  if (judged.has(id)) return judged.get(id);
  const place = placeEntry(tags);
  if (!place) { judged.set(id, null); return null; }
  const one = (store) => {
    const rows = (store.routesFor(key) || []).filter((r) => (store.index.m_sources || {})[r[3]]);
    const facts = rows.map(factsOf), here = bdbEntriesAt(place, facts);
    return { rows, facts, here, verdicts: facts.map((f) => entryVerdict(f, place, here)) };
  };
  const before = one(sb), after = one(sa);
  // the rows of the two stores, matched by source, rank and text (the entries step moves no row; it says so here)
  const at = new Map(before.rows.map((r, i) => [`${r[3]}\u0001${r[0]}\u0001${r[1]}`, i]));
  const pairs = after.rows.map((r, j) => [at.get(`${r[3]}\u0001${r[0]}\u0001${r[1]}`), j]);
  if (pairs.some(([i]) => i === undefined) || before.rows.length !== after.rows.length) throw new Error(`the rows under ${key} are not the same rows in the two stores`);
  const out = { place, before, after, pairs };
  judged.set(id, out);
  return out;
};
const flips = [];
const T = { books: books.length, places_asked: 0, places_asked_core: 0 };
for (const z of books) {
  const zone = gz(join(ZB, `${z}.bin`));
  for (const sec of zone.sections || []) {
    for (const [e, w] of (sec.words || []).entries()) {
      if (w.mark) continue;
      const keys = [...new Set([w.k, ...(w.w || w.kqw || []).map((r) => r && r.k)].filter(Boolean))];
      const asks = keys.map((k) => ["own", k, tagsAt(w, k)]).filter((x) => x[2]);
      const cores = Array.isArray(w.pg) ? w.pg.filter((x) => x && x.r === "core") : [];
      if (cores.length === 1 && cores[0].k && !keys.includes(cores[0].k)) { const t = coreTagsAt(w, cores[0].k); if (t) asks.push(["core", cores[0].k, t]); }
      for (const [reading, k, tags] of asks) {
        if (reading === "own") T.places_asked += 1; else T.places_asked_core += 1;
        const j = judge(k, tags);
        if (!j) continue;
        for (const [i, jj] of j.pairs) {
          const v0 = j.before.verdicts[i], v1 = j.after.verdicts[jj];
          if ((v0 === "other") === (v1 === "other") && v0 === v1) continue;
          const r = j.after.rows[jj];
          flips.push({ book: z, label: sec.label, e, s: w.s, reading, key: k, tags, m: String(r[3]), family: family(String(r[3])), rank: r[0], text: String(r[1]).slice(0, 120),
            facts_before: j.before.facts[i], facts_after: j.after.facts[jj], before: v0, after: v1,
            gathered_before: [...j.before.here].sort(), gathered_after: [...j.after.here].sort() });
        }
      }
    }
  }
}
writeFileSync(`${OUT}.jsonl`, flips.map((x) => JSON.stringify(x)).join("\n") + (flips.length ? "\n" : ""));
// the counts: by reading, family and direction; places, rows and keys
const count = (list) => {
  const placeId = (x) => `${x.book} ${x.label} ${x.e}`, rowId = (x) => `${x.key}\u0001${x.m}\u0001${x.rank}`;
  return { flips: list.length, places: new Set(list.map(placeId)).size, rows: new Set(list.map(rowId)).size, keys: new Set(list.map((x) => x.key)).size };
};
const groups = {};
for (const x of flips) {
  const dir = x.before === "other" ? "withheld -> left" : x.after === "other" ? "left -> withheld" : `${x.before} -> ${x.after}`;
  const g = `${x.reading === "own" ? "reading 1 (the word's own key)" : "the core piece's key (reading B, beside)"} · ${x.family} · ${dir}`;
  (groups[g] ||= []).push(x);
}
const counts = { ...T, groups: Object.fromEntries(Object.entries(groups).sort().map(([g, list]) => [g, count(list)])) };
// BDB's own rows newly withheld at a place, on the word's own key: the headline, with its keys
const bdbNew = flips.filter((x) => x.reading === "own" && (x.m === "M5" || x.m === "M46") && x.after === "other" && x.before !== "other");
counts.bdb_rows_newly_withheld_on_the_words_own_key = { ...count(bdbNew), by_key: Object.fromEntries(Object.entries(bdbNew.reduce((a, x) => { a[x.key] = (a[x.key] || 0) + 1; return a; }, {})).sort((p, q) => q[1] - p[1])) };
const bdbBoth = flips.filter((x) => (x.m === "M5" || x.m === "M46") && x.after === "other" && x.before !== "other");
counts.bdb_rows_newly_withheld_with_the_core_pieces_keys_too = count(bdbBoth);
writeFileSync(`${OUT}.json`, JSON.stringify(counts, null, 1) + "\n");
console.log(JSON.stringify(counts, null, 1));
