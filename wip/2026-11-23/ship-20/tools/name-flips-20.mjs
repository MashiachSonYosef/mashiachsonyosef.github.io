// Read-only measure (23 November 2026): every place of the thirty-nine books where one of ship 20's 28 name rows
// (relay v213's 22, relay v219's 6) stands under the word's key or a piece's key, with the names gate's verdict on the
// row before ship 20 (no row of them marked: it stands everywhere) and after (marked: withheld where the place is not a
// name, as the list of places laid with relay v219's addition says), and whether every other gate of the card leaves
// the row there (the entry, the pointing, the stem: as tools/check-names-gate-v1.mjs asks them), so the verdict that
// moves is the one the card shows. And the rows names v2 marks under the key of the place relay v219 adds (Ezekiel
// 27:6 word 11), withheld there before and standing after. Writes JSON to stdout.
// Usage: node name-flips-20.mjs <reader at main (its zones, sidecars and store)> <reader with ship 20 (its pin)>
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import { createHash } from "node:crypto";
const [OLD, NEW] = process.argv.slice(2);
const T = (f) => import(join(OLD, "tools", f));
const { openRouteStore, factsOf } = await T("gloss-store-v1.mjs");
const { placeEntry, placeTags, bdbEntriesAt, entryVerdict } = await T("entry-gate-v1.mjs");
const { gradeRow, heldByPointing } = await T("pointing-grade-v1.mjs");
const { isOtherStem } = await T("stem-family-v1.mjs");
const { zonesServed } = await T("zones-on-disk-v1.mjs");
const { nameRowLists, namePlaces } = await import(join(NEW, "tools", "name-lists-v1.mjs"));
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const sha16 = (t) => createHash("sha256").update(Buffer.from(String(t ?? ""), "utf8")).digest("hex").slice(0, 16);
const pin = JSON.parse(readFileSync(join(NEW, "data", "names", "PIN.json"), "utf8"));
const lists = nameRowLists(join(NEW, "data", "names"), pin);
const places = namePlaces(join(NEW, "data", "names"), pin);
const store = openRouteStore(join(OLD, "data", "route-store"));
// the 28 rows, found in main's store by key, m id and sha16 (each once: ship 20's tool proves it on its own store)
const rows = [];
for (const L of lists.slice(1)) for (const l of L.lines) {
  const found = (store.routesFor(l.k) || []).filter((r) => String(r[3]) === l.m && sha16(r[1]) === l.sha);
  if (found.length !== 1) throw new Error(`relay ${L.relay}: ${l.m} ${l.sha} found ${found.length} times`);
  rows.push({ relay: L.relay, k: l.k, m: l.m, rank: found[0][0], text: String(found[0][1]), sha: l.sha, row: found[0] });
}
// names v2's rows under the key of each place the addition adds
const added = places.additions.filter((a) => a.change === "ADDED");
const listedAt = new Map();   // book -> verse -> Set(n), as laid (after) and names v1's (before)
const mapOf = (lines) => { const m = new Map(); for (const l of lines) { const cut = l.place.lastIndexOf(":"); const v = l.place.slice(0, cut), n = Number(l.place.slice(cut + 1)); const b = m.get(l.book) || m.set(l.book, new Map()).get(l.book); (b.get(v) || b.set(v, new Set()).get(v)).add(n); } return m; };
const before = mapOf(places.v1), after = mapOf(places.laid);
const isListed = (m, book, v, n) => !!(m.get(book) && m.get(book).get(v) && m.get(book).get(v).has(n));
const byKey = new Map(); for (const r of rows) (byKey.get(r.k) || byKey.set(r.k, []).get(r.k)).push(r);
const out = { places: [], v2_at_added: [] };
for (const z of zonesServed(join(OLD, "data", "zones"))) {
  if (!existsSync(join(OLD, "data", "zones", `${z}.lattice.bin`))) continue;
  const zone = gz(join(OLD, "data", "zones", `${z}.bin`));
  const side = gz(join(OLD, "data", "zones", `${z}.lattice.bin`));
  for (const [si, sec] of (zone.sections || []).entries()) {
    const words = sec.words || [];
    let n = 0;
    for (const [e, w] of words.entries()) {
      if (w.mark) continue;
      n += 1;
      const npBefore = isListed(before, z, String(sec.label), n), npAfter = isListed(after, z, String(sec.label), n);
      if (!!w.np !== npBefore) out.places.push({ fault: `${z} ${sec.label} word ${n}: the zone's mark is not names v1's list` });
      const keys = [[w.k, "word"], ...(Array.isArray(w.pg) ? w.pg.map((p) => [p.k, "piece"]) : [])];
      const askOf = (k) => {
        const all = (store.routesFor(k) || []).filter((r) => store.index.m_sources[r[3]]);
        const tags = placeTags(w), place = tags ? placeEntry(tags) : null, facts = all.map(factsOf);
        const bdbHere = place ? bdbEntriesAt(place, facts) : null;
        const verdicts = all.map((r, i) => (place ? entryVerdict(facts[i], place, bdbHere) : "none"));
        const grades = all.map((r) => gradeRow(r, w.s)), attested = grades.includes("m");
        const gr = (side.grades || {})[w.s], rs = (side.stems || {})[k] || null;
        const otherStem = (row) => !!(rs && gr && Array.isArray(gr.st) && gr.st.length && isOtherStem(rs[`${row[3]}\u0001${row[0]}\u0001${row[1]}`], gr.st));
        return { all, left: (row) => { const i = all.indexOf(row); return i >= 0 && verdicts[i] !== "other" && (verdicts[i] === "this" || !attested || !heldByPointing(grades[i])) && !otherStem(row); }, verdictOf: (row) => verdicts[all.indexOf(row)] };
      };
      for (const [k, how] of keys) {
        const mine = byKey.get(k);
        if (mine) {
          const ask = askOf(k);
          for (const r of mine) {
            const row = ask.all.find((x) => x[0] === r.rank && String(x[3]) === r.m && sha16(x[1]) === r.sha);
            out.places.push({ book: z, label: sec.label, si, e, n, how, k, relay: r.relay, m: r.m, rank: r.rank, text: r.text, name_place_before: npBefore, name_place_after: npAfter,
              gate_before: "stands", gate_after: npAfter ? "stands" : "withheld", other_gates_leave_it: !!row && ask.left(row), entry: row ? ask.verdictOf(row) : null });
          }
        }
        // names v2's rows under the key of a place the addition adds
        if (added.some((a) => a.book === z && a.place === `${sec.label}:${n}`)) {
          const ask = askOf(k);
          for (const row of ask.all.filter((x) => (factsOf(x) || {}).name)) out.v2_at_added.push({ book: z, label: sec.label, si, e, n, how, k, m: String(row[3]), rank: row[0], text: String(row[1]), name_place_before: npBefore, name_place_after: npAfter, gate_before: npBefore ? "stands" : "withheld", gate_after: npAfter ? "stands" : "withheld", other_gates_leave_it: ask.left(row), entry: ask.verdictOf(row) });
        }
      }
    }
  }
}
console.log(JSON.stringify(out));
