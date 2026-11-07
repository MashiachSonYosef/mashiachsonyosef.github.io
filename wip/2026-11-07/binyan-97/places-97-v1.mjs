// v105.4: the 97 places of Moses's ours_only pairs, checked against the zones' surfaces
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
const S = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad";
const tsv = readFileSync(`${S}/dl-moses2/corpus-lane-builds/moses-binyan-ledger-v1/said-at-split-v1/r3/stem-pairs-diff-v1.tsv`, "utf8").split("\n").filter(Boolean);
const head = tsv[0].split("\t");
const rows = tsv.slice(1).map((l) => Object.fromEntries(l.split("\t").map((v, i) => [head[i], v]))).filter((r) => r.side === "ours_only");
const MARKS = /[֑-ׇ]/gu;
const strip = (t) => String(t || "").replace(MARKS, "");
const bare = (t) => strip(t).replace(/־/gu, "");
const zones = new Map();
const zoneOf = (book) => { if (!zones.has(book)) { const p = `${S}/pt/reader/data/zones/${book}.bin`; zones.set(book, existsSync(p) ? JSON.parse(gunzipSync(readFileSync(p)).toString("utf8")) : null); } return zones.get(book); };
const places = new Map();
for (const r of rows) { const id = `${r.book} ${r.place}`; if (!places.has(id)) places.set(id, { book: r.book, place: r.place, surface: r.surface, key: r.key, pairs: 0, rows: new Set() }); const p = places.get(id); p.pairs += 1; p.rows.add(`${r.m} ${r.rank}`); }
const out = { places: places.size, pairs: rows.length, zone_missing: 0, section_missing: 0, word_index_same_surface: 0, word_index_other_surface: 0, surface_elsewhere_in_verse: 0, surface_absent_from_verse: 0, by_class: {} };
const lines = [];
for (const p of places.values()) {
  const z = zoneOf(p.book); if (!z) { out.zone_missing += 1; lines.push(`${p.book} ${p.place}: no zone`); continue; }
  const [ch, vs, wi] = p.place.split(":");
  const sec = (z.sections || []).find((s) => String(s.label) === `${ch}:${vs}`);
  if (!sec) { out.section_missing += 1; lines.push(`${p.book} ${p.place}: no section ${ch}:${vs}`); continue; }
  const words = sec.words || [];
  const w = words[Number(wi) - 1];
  const ws = w ? (w.s || (w.w && w.w.map((x) => x.s).join("־")) || "") : "";
  let cls;
  if (w && strip(ws) === strip(p.surface)) { out.word_index_same_surface += 1; cls = "same surface at the index"; }
  else if (w && bare(ws) === bare(p.surface)) { out.word_index_same_surface += 1; cls = "same letters and points at the index (maqaf aside)"; }
  else if (words.some((x) => strip(x.s || "") === strip(p.surface))) { out.surface_elsewhere_in_verse += 1; cls = "surface stands elsewhere in the verse"; }
  else if (w) { out.word_index_other_surface += 1; cls = `another surface at the index: zone «${ws}» vs place «${p.surface}»`; }
  else { out.surface_absent_from_verse += 1; cls = "no word at that index"; }
  out.by_class[cls.split(":")[0]] = (out.by_class[cls.split(":")[0]] || 0) + 1;
  lines.push(`${p.book} ${p.place} ${p.key} «${p.surface}» pairs ${p.pairs}: ${cls}${w && w.k ? ` · zone key ${w.k}` : ""}${w && w.w ? " · a joined word" : ""}${w && w.kq ? " · ketiv/qere" : ""}`);
}
console.log(JSON.stringify(out, null, 1));
for (const l of lines) console.log(l);
