// Read-only: every row of the served store and of the two overlays, counted per family of the kinds record.
// Usage: node survey-store.mjs <reader dir>  -> store-survey.json
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const R = process.argv[2];
const { factsOf } = await import(join(R, "tools", "gloss-store-v1.mjs"));
const { isPointed } = await import(join(R, "tools", "pointing-grade-v1.mjs"));
const kinds = JSON.parse(readFileSync(join(R, "data", "dictionary-kinds-v1.json"), "utf8"));
const famOfKey = new Map();
for (const f of kinds.families) for (const k of f.keys) famOfKey.set(`${f.shelf === "overlay" ? f.overlay : ""}\u0000${k}`, f);
const out = {};
const bump = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };
const survey = (dir, shelf) => {
  const index = JSON.parse(readFileSync(join(dir, "index.json"), "utf8"));
  for (const f of readdirSync(join(dir, "shards"))) {
    const body = JSON.parse(gunzipSync(readFileSync(join(dir, "shards", f))).toString("utf8"));
    for (const [k, rows] of Object.entries(body)) {
      const seen = new Set();
      for (const row of rows) {
        const src = index.m_sources[row[3]]; if (!src) continue;
        const fam = famOfKey.get(`${shelf}\u0000${src.key}`); if (!fam) { bump(out, `UNFILED ${shelf} ${src.key}`); continue; }
        const o = out[fam.id] || (out[fam.id] = { id: fam.id, family: fam.family, kind: fam.kind, shelf: fam.shelf, rows: 0, keys: 0, by_m: {}, by_source_key: {}, facts_n: 0, facts_t: 0, facts_b: 0, facts_name: 0, no_entry: 0, headwords_any: 0, headwords_pointed: 0, ledgered: 0, with_definition_text: 0, year: {}, cuts: 0, prints: 0, key_len: {} });
        o.rows += 1; if (!seen.has(fam.id)) { seen.add(fam.id); o.keys += 1; bump(o.key_len, [...k].length >= 6 ? "6+" : String([...k].length)); }
        bump(o.by_m, row[3]); bump(o.by_source_key, src.key);
        const fx = factsOf(row) || {};
        if (Array.isArray(fx.n) && fx.n.length) o.facts_n += 1;
        if (Array.isArray(fx.t) && fx.t.length) o.facts_t += 1;
        if (Array.isArray(fx.b) && fx.b.length) o.facts_b += 1;
        if (fx.name) o.facts_name += 1;
        if (!(Array.isArray(fx.n) && fx.n.length) && !(Array.isArray(fx.b) && fx.b.length)) o.no_entry += 1;
        const hw = Array.isArray(row[6]) ? row[6] : [];
        if (hw.length) o.headwords_any += 1;
        if (hw.some((h) => typeof h === "string" && isPointed(h))) o.headwords_pointed += 1;
        if (src.ledger) o.ledgered += 1;
        if (row[2] && row[2] !== row[1]) o.with_definition_text += 1;
        bump(o.year, String(row[4]));
        if (Array.isArray(row[7]) && row[7].length) o.cuts += 1;
        if (Array.isArray(row[8])) o.prints += 1;
      }
    }
  }
};
survey(join(R, "data", "route-store"), "");
survey(join(R, "data", "overlays", "jastrow"), "jastrow");
survey(join(R, "data", "overlays", "samaritan"), "samaritan");
writeFileSync("store-survey.json", JSON.stringify(out, null, 1));
for (const o of Object.values(out)) if (o.id) console.log([o.kind, o.id, o.rows, o.keys, `n=${o.facts_n}`, `t=${o.facts_t}`, `b=${o.facts_b}`, `name=${o.facts_name}`, `noentry=${o.no_entry}`, `hw=${o.headwords_any}`, `pointed=${o.headwords_pointed}`, `D=${o.with_definition_text}`, `M=${Object.keys(o.by_m).length}`].join("\t"));
