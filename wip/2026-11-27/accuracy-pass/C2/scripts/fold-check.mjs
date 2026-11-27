// What each source says that no row under its own name serves: for every reading field of the source's file,
// is there a served row of that source with that text under the entry's letters key; if not, does another source's
// row carry the same words there (the store's fold), and does that source rest open or shut?
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const [BASE, OUT] = process.argv.slice(2);
const { openRouteStore } = await import(join(BASE, "tools/gloss-store-v1.mjs"));
const store = openRouteStore(join(BASE, "data/route-store"));
const atRest = openRouteStore(join(BASE, "data/route-store"), { atRest: true });
const letters = (s) => String(s).normalize("NFD").replace(/[^א-ת]/gu, "");
const TAG = /<[^>]+>/gu;
const ws = (s) => s.replace(/\s+/gu, " ").trim();
const unesc = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x([0-9A-Fa-f]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)));
const storeText = (raw) => ws(unesc(raw.replace(TAG, " ")));
const key = (t) => String(t).replace(/\.$/u, "").toLowerCase();
const report = {};
const ask = (name, m, k, text, c, ex) => {
  c.fields += 1;
  const rows = store.routesWhole(k) || [];
  const open = new Set((atRest.routesFor(k) || []).map((r) => `${r[3]}\u0001${r[0]}\u0001${r[1]}`));
  const mine = rows.filter((r) => String(r[3]) === m && String(r[1]) === text);
  if (mine.length) { c.served_under_its_own_name += 1; return; }
  const inMine = rows.filter((r) => String(r[3]) === m && store.readingsOf(r).some((x) => key(x) === key(text)));
  if (inMine.length) { c.served_as_a_reading_of_a_longer_row_of_its_own += 1; return; }
  const others = rows.filter((r) => String(r[3]) !== m && (String(r[1]) === text || store.readingsOf(r).some((x) => key(x) === key(text))));
  if (others.length) {
    const openOnes = others.filter((r) => open.has(`${r[3]}\u0001${r[0]}\u0001${r[1]}`));
    if (openOnes.length) { c.only_under_another_source_that_rests_open += 1; const who = String(openOnes[0][3]); c.by[who] = (c.by[who] || 0) + 1; }
    else { c.only_under_a_source_that_rests_shut += 1; const who = String(others[0][3]); c.by_shut[who] = (c.by_shut[who] || 0) + 1; if (ex.length < 300) ex.push({ k, text: text.slice(0, 120), under: who }); }
    return;
  }
  if (!rows.length) { c.no_row_at_all_under_the_key += 1; return; }
  c.not_served += 1; if (c.ex_not_served.length < 60) c.ex_not_served.push({ k, text: text.slice(0, 100) });
};
const fresh = () => ({ fields: 0, served_under_its_own_name: 0, served_as_a_reading_of_a_longer_row_of_its_own: 0, only_under_another_source_that_rests_open: 0, only_under_a_source_that_rests_shut: 0, no_row_at_all_under_the_key: 0, not_served: 0, by: {}, by_shut: {}, ex_not_served: [] });
// M9: usage, meaning and each tagged gloss, under the letters of the entry's headword
{
  const e9 = JSON.parse(readFileSync(join(OUT, "m9-entries.json"), "utf8"));
  for (const f of ["usage", "meaning", "defs"]) {
    const c = fresh(), ex = [];
    for (const e of Object.values(e9)) {
      const k = letters(e.w); if (!k) continue;
      if (f === "defs") { for (const d of new Set(e.defs.map(storeText))) ask(f, "M9", k, d, c, ex); }
      else if (e[f] != null) ask(f, "M9", k, storeText(e[f]), c, ex);
    }
    report[`openscriptures_strongs ${f}`] = { ...c, examples_shut: ex.slice(0, 40) };
  }
}
// M5: every def element, under the letters of the entry's first <w>
{
  const e5 = JSON.parse(readFileSync(join(OUT, "m5-entries.json"), "utf8"));
  const c = fresh(), ex = [];
  for (const e of Object.values(e5)) {
    const m = /<w[^>]*>([^<]*)<\/w>/u.exec(e.body); if (!m) continue;
    const k = letters(m[1]); if (!k) continue;
    for (const d of new Set(e.defs.map((x) => storeText(x.raw)))) ask("def", "M5", k, d, c, ex);
  }
  report["openscriptures_bdb_1906 def"] = { ...c, examples_shut: ex.slice(0, 40) };
}
writeFileSync(join(OUT, "fold-check.json"), JSON.stringify(report, null, 1));
for (const [k, v] of Object.entries(report)) console.log(k, JSON.stringify({ ...v, examples_shut: v.examples_shut.slice(0, 6), ex_not_served: v.ex_not_served.slice(0, 8) }));
