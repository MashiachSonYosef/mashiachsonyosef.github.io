// Every resting line of the 40 records, live against the ship tree, each moved line put in the class that owes it,
// judged under the word's own key (the ship's zone names it) and never by a text met anywhere in the store.
// usage: node lines-compare-v2.mjs <live records dir> <live reader dir> <ship reader dir> <out.json>
// Classes, tried in order (the first that holds names the line; "also" lists every other that holds):
//   read-words     the place is one of relay v192's read-word places (ship 2)
//   (its words)    a word now under a line of its own inside a run that moved: the run's class
//   kinds-shut     a book the kinds scope: the line live drew credited a source the kinds shut whole, or under the
//                  word's key a row of a credited source printing that reading rests shut
//   kinds-rank     a book the kinds scope: under the word's key a row of another source printing the old reading
//                  rests shut (the reading lost a carrier, and with it its rank)
//   store-v188     under the word's key a row relay v188 landed prints the new line's reading (ship 4)
//   store-call5    under the word's key a row call 5 struck printed the old reading, or one it moved here prints the new
//   made-spaces    the same credit, the same words but for the spaces a made-spaces list closes
//   step-words     the ship draws STEP's own words where live drew another source's
//   unexplained    none of these: read by hand
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [LIVE, LIVE_RD, RD, OUT] = process.argv.slice(2);
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const { openRouteStore, readingKey } = await import(join(RD, "tools/gloss-store-v1.mjs"));
const { readKinds, restsOffIds } = await import(join(RD, "tools/dictionary-kinds-v1.mjs"));
const ship = openRouteStore(join(RD, "data/route-store"), { atRest: true });
const { openRouteStore: openLive } = await import(join(LIVE_RD, "tools/gloss-store-v1.mjs"));
const live = openLive(join(LIVE_RD, "data/route-store"));
const whole = (st, k) => ((st.routesWhole ? st.routesWhole(k) : st.routesFor(k)) || []);
const SHUT = new Set(restsOffIds(readKinds(join(RD, "data")).rec, ship.index.m_sources));
const SCOPE = new Set(JSON.parse(readFileSync(join(RD, "data/book-order-v1.json"), "utf8")).files || []);
const rk = (t) => readingKey(String(t || "")).replace(/\s+/gu, " ").trim();
const rec = JSON.parse(readFileSync(join(RD, "data/row-strikes-v1.json"), "utf8"));
const landed = new Set(), struck5 = new Set(), moved5 = new Set();
for (const r of rec.rounds || []) {
  const f = String((r.list && r.list.file) || "");
  for (const x of r.rows || []) {
    const id = `${x.key}\u0000${x.m}\u0000${rk(x.route)}`;
    if (/v188/u.test(f) && x.action === "land") landed.add(id);
    if (/call5/u.test(f) && x.action === "strike") struck5.add(id);
    if (/call5/u.test(f) && x.action === "re-key") moved5.add(`${x.m}\u0000${rk(x.route)}`);
  }
}
const rwPlaces = new Set();
const RW = join(RD, "data/read-words/read-words-v1/read-word-tags-v1.jsonl");
if (existsSync(RW)) for (const l of readFileSync(RW, "utf8").split("\n").filter(Boolean)) { const j = JSON.parse(l); rwPlaces.add(`${j.book} ${j.ref}`); }
const zones = new Map();
const zoneOf = (book) => {
  if (!zones.has(book)) { const b = readFileSync(join(RD, "data/zones", `${book}.bin`)); let z; try { z = JSON.parse(gunzipSync(b).toString("utf8")); } catch { z = JSON.parse(b.toString("utf8")); } zones.set(book, new Map(z.sections.map((s) => [String(s.label), s.words]))); }
  return zones.get(book);
};
const ids = (credit) => String(credit || "").split(" ").filter((x) => /^M\d+$/u.test(x));
const prints = (st, row, t) => rk(row[1]) === t || st.readingsOf(row).some((x) => rk(x) === t);
const closes = (a, b) => a !== b && a.replace(/\s+/gu, "") === b.replace(/\s+/gu, "");
const out = { books: {}, classes: {}, also: {}, moved: 0, lines: 0, unexplained: [], list: [] };
for (const f of readdirSync(LIVE).filter((x) => x.endsWith(".json.gz")).sort()) {
  const book = f.replace(/\.json\.gz$/u, "");
  const a = gz(join(LIVE, f)), b = gz(join(RD, "data/resting-lines", f));
  const secB = new Map(b.sections.map((s) => [String(s[0]), s[1]]));
  let moved = 0;
  for (const [label, units] of a.sections.map((s) => [String(s[0]), s[1]])) {
    const B = new Map((secB.get(label) || []).map((u) => [`${u[0]}:${u[1]}`, u]));
    const A = new Map(units.map((u) => [`${u[0]}:${u[1]}`, u]));
    out.lines += A.size;
    const spanCls = [];
    for (const k of [...A.keys(), ...[...B.keys()].filter((x) => !A.has(x))]) {
      const u = A.get(k) || null, v = B.get(k) || null;
      if (u && v && u[2] === v[2] && u[3] === v[3]) continue;
      moved += 1;
      const place = `${book} ${label}`;
      const at = u || v, n = Math.max(1, at[1]);
      const words = (zoneOf(book).get(label) || []).slice(at[0], at[0] + n).filter(Boolean);
      const keys = [...new Set(words.map((w) => w.k).filter(Boolean))];
      const was = u ? rk(u[2]) : null, now = v ? rk(v[2]) : null;
      const wasIds = u ? ids(u[3]) : [];
      const hold = [];
      if (rwPlaces.has(place)) hold.push("read-words");
      const under = !u && v ? spanCls.find((s) => v[0] >= s.i && v[0] < s.i + s.n) : null;
      if (under) hold.push(`${under.cls} (its words)`);
      if (SCOPE.has(book) && u) {
        let shutCredited = wasIds.some((m) => SHUT.has(m)), shutOther = false;
        for (const key of keys) for (const row of whole(ship, key)) if (ship.restsOff(row) && prints(ship, row, was)) { if (wasIds.includes(row[3])) shutCredited = true; else shutOther = true; }
        if (shutCredited) hold.push("kinds-shut"); else if (shutOther) hold.push("kinds-rank");
      }
      if (v) for (const key of keys) if (whole(ship, key).some((row) => prints(ship, row, now) && landed.has(`${key}\u0000${row[3]}\u0000${rk(row[1])}`))) { hold.push("store-v188"); break; }
      if (u) for (const key of keys) if (whole(live, key).some((row) => prints(live, row, was) && struck5.has(`${key}\u0000${row[3]}\u0000${rk(row[1])}`))) { hold.push("store-call5"); break; }
      if (v && !hold.includes("store-call5")) for (const key of keys) if (whole(ship, key).some((row) => prints(ship, row, now) && moved5.has(`${row[3]}\u0000${rk(row[1])}`))) { hold.push("store-call5"); break; }
      if (u && v && u[3] === v[3] && closes(u[2], v[2])) hold.push("made-spaces");
      if (v && /\bM4\b/u.test(v[3]) && !(u && /\bM4\b/u.test(u[3]))) hold.push("step-words");
      const cls = hold[0] || "unexplained";
      if (u && u[1] > 1) spanCls.push({ i: u[0], n: u[1], cls: cls.replace(/ \(its words\)$/u, "") });
      out.classes[cls] = (out.classes[cls] || 0) + 1;
      for (const h of hold.slice(1)) out.also[`${cls} · also ${h}`] = (out.also[`${cls} · also ${h}`] || 0) + 1;
      const row = { at: `${place} [${k}]`, keys, was: u ? [u[2], u[3]] : null, now: v ? [v[2], v[3]] : null, cls, also: hold.slice(1) };
      if (cls === "unexplained") out.unexplained.push(row);
      out.list.push(row);
    }
  }
  out.books[book] = moved; out.moved += moved;
}
writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log(`${out.lines} lines live · ${out.moved} moved · ${JSON.stringify(out.classes)}`);
console.log(`also: ${JSON.stringify(out.also)}`);
