// The lines the comparison put under the kinds, held again word by word: under the word's own key, does the line
// live drew lose a carrier that rests shut? usage: node lines-verify-kinds.mjs <compare.json> <ship reader dir> <out.json>
// verified-source: the line live drew credited a source the kinds shut whole (and the book is one of the 39)
// verified-key:    under the word's key, a row that prints the old line's reading rests shut, and (kinds-rank) the
//                  credited source still prints that reading at rest or another of its readings now leads
// not verified:    read by hand
import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [CMP, RD, OUT] = process.argv.slice(2);
const cmp = JSON.parse(readFileSync(CMP, "utf8"));
const { openRouteStore, readingKey } = await import(join(RD, "tools/gloss-store-v1.mjs"));
const { readKinds, restsOffIds } = await import(join(RD, "tools/dictionary-kinds-v1.mjs"));
const st = openRouteStore(join(RD, "data/route-store"), { atRest: true });
const SHUT = new Set(restsOffIds(readKinds(join(RD, "data")).rec, st.index.m_sources));
const BOOKS = new Set(JSON.parse(readFileSync(join(RD, "data/book-order-v1.json"), "utf8")).files || []);
const zones = new Map();
const zoneOf = (book) => {
  if (!zones.has(book)) { const b = readFileSync(join(RD, "data/zones", `${book}.bin`)); let z; try { z = JSON.parse(gunzipSync(b).toString("utf8")); } catch { z = JSON.parse(b.toString("utf8")); } zones.set(book, new Map(z.sections.map((s) => [String(s.label), s.words]))); }
  return zones.get(book);
};
const ids = (credit) => String(credit || "").split(" ").filter((x) => /^M\d+$/u.test(x));
const out = { books_in_scope: BOOKS.size, verdicts: {}, by_class: {}, not_verified: [] };
for (const row of cmp.list.filter((r) => /^kinds/u.test(r.cls))) {
  const m = /^(\S+) (\S+) \[(\d+):(\d+)\]$/u.exec(row.at);
  const [book, label, i, n] = [m[1], m[2], Number(m[3]), Number(m[4])];
  let verdict = "not verified";
  const wasIds = row.was ? ids(row.was[1]) : [];
  if (BOOKS.size && !BOOKS.has(book)) verdict = "OUT OF SCOPE: a book the kinds leave whole";
  else if (wasIds.some((x) => SHUT.has(x))) verdict = "verified-source";
  else if (row.was) {
    const words = (zoneOf(book).get(label) || []).slice(i, i + Math.max(1, n));
    const t = readingKey(row.was[0]);
    for (const w of words) {
      const whole = (w && st.routesWhole(w.k)) || [];
      const carriers = whole.filter((r) => st.readingsOf(r).some((x) => readingKey(x) === t));
      const shut = carriers.filter((r) => st.restsOff(r));
      if (shut.length) { verdict = `verified-key (${shut.map((r) => r[3]).join(" ")} rests shut there)`; break; }
    }
  }
  const v = verdict.replace(/ \(.*$/u, "");
  out.verdicts[v] = (out.verdicts[v] || 0) + 1;
  out.by_class[`${row.cls} · ${v}`] = (out.by_class[`${row.cls} · ${v}`] || 0) + 1;
  if (!/^verified/u.test(verdict)) out.not_verified.push({ ...row, verdict });
}
writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log(JSON.stringify(out.verdicts), JSON.stringify(out.by_class));
