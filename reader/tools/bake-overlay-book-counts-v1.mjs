// bake-overlay-book-counts-v1 · what each overlay dictionary gives on each book
//
// RULE: overlay-book-counts-rule-v1-a-dictionary-beside-the-store-is-counted-per-book-like-every-other
// LEDGER: -
// no frame letter. This reads the zones on disk and the overlays beside the
// store and writes one record, data/overlay-book-counts-v1.json.
//
// The owner, 2026-10-03: "samaritan just goes in as another of the 36
// dictionaries afaik, same for jastrow". The sources row draws one chip per
// dictionary a book's readings stand on, with what it carries on THAT book,
// baked per book by tools/regloss-zone.mjs into the zone itself. The overlays
// are not in the route store, so regloss never sees them; this is their half
// of the same table, counted the way the card asks them:
//
//   - a book's keys are its words' own keys (k, and each joined word's k), its
//     headword keys (h), and its name and part tokens: the key list of
//     regloss rule 3, without the maqaf runs' whole forms
//   - an overlay row counts only in a lane its own index marks ruled, as the
//     page reads it (overlayRowsFor in zone.html)
//   - carries: the book's keys where the source gives at least one row;
//     rows: those rows; y: the source's own year from the overlay's index
//
// A source that carries nothing on a book is not listed for it, so a book
// draws no chip that switches nothing.
//
// Run: node tools/bake-overlay-book-counts-v1.mjs   (from reader/)
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { zonesOnDisk } from "./zones-on-disk-v1.mjs";

const RULE = "overlay-book-counts-rule-v1-a-dictionary-beside-the-store-is-counted-per-book-like-every-other";
const OUT = "data/overlay-book-counts-v1.json";
const OVERLAY_DIR = "data/overlays";
const ZONES = "data/zones";

const overlays = {};
for (const id of readdirSync(OVERLAY_DIR).sort()) {
  const ixPath = join(OVERLAY_DIR, id, "index.json");
  if (!existsSync(ixPath)) continue;
  const ix = JSON.parse(readFileSync(ixPath, "utf8"));
  const ruled = ix.lanes ? new Set(Object.entries(ix.lanes).filter(([, l]) => l && l.standing === "ruled").map(([k]) => k)) : null;
  const rows = new Map();   // key -> rows in a ruled lane
  const dir = join(OVERLAY_DIR, id, "shards");
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".bin")).sort()) {
    const data = JSON.parse(gunzipSync(readFileSync(join(dir, f))).toString("utf8"));
    for (const [k, list] of Object.entries(data)) {
      const kept = list.filter((row) => !ruled || !row[7] || (row[7].lanes || [row[7].lane]).some((l) => ruled.has(l)));
      if (kept.length) rows.set(k, kept);
    }
  }
  overlays[id] = { ix, ruled, rows };
}

const keysOf = (zone) => {
  const keys = new Set();
  const addWord = (w) => {
    if (w.w) w.w.forEach((r) => { if (r.k) keys.add(r.k); });
    else if (w.k) keys.add(w.k);
    if (w.h) keys.add(w.h);
  };
  for (const sec of zone.sections || []) (sec.words || []).forEach(addWord);
  for (const n of zone.nodes || []) {
    (n.name_tokens || []).forEach((t) => { if (t.k) keys.add(t.k); });
    (n.part_tokens || []).forEach((t) => { if (t.k) keys.add(t.k); });
  }
  for (const u of Object.values(zone.units || {}))
    for (const e of [...(u.section || []), ...Object.values(u.words || {}).flat()])
      (e.words || []).forEach(addWord);
  return keys;
};

const books = {};
for (const slug of zonesOnDisk(ZONES)) {
  const zone = JSON.parse(gunzipSync(readFileSync(join(ZONES, `${slug}.bin`))).toString("utf8"));
  const keys = keysOf(zone);
  const book = {};
  for (const [id, o] of Object.entries(overlays)) {
    for (const k of keys) {
      const list = o.rows.get(k);
      if (!list) continue;
      const seen = new Set();
      for (const row of list) {
        const m = row[3];
        const src = o.ix.m_sources && o.ix.m_sources[m];
        if (!src) continue;
        const e = book[m] || (book[m] = { overlay: id, key: src.key, label: src.label, posture: src.licensePosture, y: src.sourceYear, carries: 0, rows: 0 });
        e.rows += 1;
        if (!seen.has(m)) { seen.add(m); e.carries += 1; }
      }
    }
  }
  if (Object.keys(book).length) books[slug] = book;
}

const record = {
  schema_version: "OVERLAY_BOOK_COUNTS_V1",
  rule_id: RULE,
  generated_by: "tools/bake-overlay-book-counts-v1.mjs",
  what_this_is: "per book, per overlay source: the keys of that book it gives a reading for (carries) and the rows behind them (rows), in the lanes its index marks ruled; the overlay half of the per-book source table regloss bakes into each zone",
  axes: "carries counts keys, rows counts overlay rows; never summed across axes",
  overlays: Object.fromEntries(Object.entries(overlays).map(([id, o]) => [id, {
    store_version: o.ix.store_version || null,
    lanes_ruled: o.ruled ? [...o.ruled].sort() : null,
    index_sha256: createHash("sha256").update(readFileSync(join(OVERLAY_DIR, id, "index.json"))).digest("hex"),
  }])),
  books,
};
writeFileSync(OUT, `${JSON.stringify(record, null, 1)}\n`);
const n = Object.keys(books).length;
const total = {};
for (const b of Object.values(books)) for (const [m, e] of Object.entries(b)) total[m] = (total[m] || 0) + e.carries;
console.log(`${OUT} · ${n} books · keys carried, summed over books per source: ${Object.entries(total).map(([m, c]) => `${m} ${c}`).join(" · ")}`);
