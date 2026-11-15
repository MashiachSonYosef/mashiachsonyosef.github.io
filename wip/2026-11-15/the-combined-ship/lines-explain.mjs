// The lines the comparison could not put in a class, read by their word's key: what the store under that key did.
// usage: node lines-explain.mjs <compare.json> <live reader dir> <ship reader dir> <out.json>
// For each unexplained line: the zone word's key (the ship's zone); the rows under that key whose printed form is the
// line's text, live and ship; and which of ship 4's rounds touched them (v188 landed a carrier of the new line, call 5
// struck or moved a carrier of either line), else whether the rows under the key differ at all.
import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [CMP, LIVE_RD, RD, OUT] = process.argv.slice(2);
const cmp = JSON.parse(readFileSync(CMP, "utf8"));
const { openRouteStore, printedForm, readingKey } = await import(join(RD, "tools/gloss-store-v1.mjs"));
const norm = (t) => printedForm(String(t || "")).replace(/\s+/gu, " ").trim().toLowerCase();
const shipSt = openRouteStore(join(RD, "data/route-store"));
const { openRouteStore: openLive } = await import(join(LIVE_RD, "tools/gloss-store-v1.mjs"));
const liveSt = openLive(join(LIVE_RD, "data/route-store"));
const rec = JSON.parse(readFileSync(join(RD, "data/row-strikes-v1.json"), "utf8"));
const landed = new Set(), c5struck = new Set(), c5moved = new Set();
for (const r of rec.rounds || []) {
  const f = String((r.list && r.list.file) || "");
  for (const x of r.rows || []) {
    if (/v188/u.test(f) && x.action === "land") landed.add(`${x.key}\u0000${x.m}\u0000${norm(x.route)}`);
    if (/call5/u.test(f) && x.action === "strike") c5struck.add(`${x.key}\u0000${x.m}\u0000${norm(x.route)}`);
    if (/call5/u.test(f) && x.action === "re-key") c5moved.add(`${x.m}\u0000${norm(x.route)}`);
  }
}
const zones = new Map();
const zoneOf = (book) => {
  if (!zones.has(book)) { const b = readFileSync(join(RD, "data/zones", `${book}.bin`)); let z; try { z = JSON.parse(gunzipSync(b).toString("utf8")); } catch { z = JSON.parse(b.toString("utf8")); } zones.set(book, new Map(z.sections.map((s) => [String(s.label), s.words]))); }
  return zones.get(book);
};
const out = { classes: {}, lines: [] };
for (const row of cmp.unexplained) {
  const m = /^(\S+) (\S+) \[(\d+):(\d+)\]$/u.exec(row.at);
  const [book, label, i] = [m[1], m[2], Number(m[3])];
  const w = (zoneOf(book).get(label) || [])[i] || null;
  const k = w ? w.k : null;
  const was = row.was ? norm(row.was[0]) : null, now = row.now ? norm(row.now[0]) : null;
  const sR = k ? shipSt.routesFor(k) || [] : [], lR = k ? liveSt.routesFor(k) || [] : [];
  // a carrier of a line: a row that prints the line's reading (its ledger may print a part of it)
  const grp = (rows, t, st) => rows.filter((r) => norm(r[1]) === t || st.readingsOf(r).some((x) => readingKey(x) === t));
  const nowShip = now ? grp(sR, now, shipSt) : [], nowLive = now ? grp(lR, now, liveSt) : [];
  const wasShip = was ? grp(sR, was, shipSt) : [], wasLive = was ? grp(lR, was, liveSt) : [];
  const id = (r) => `${k}\u0000${r[3]}\u0000${norm(r[1])}`;
  let cls = "unread";
  if (!k) cls = "no key";
  else if (nowShip.some((r) => landed.has(id(r)))) cls = "store-v188 (a carrier of the new line)";
  else if (wasLive.some((r) => c5struck.has(id(r)))) cls = "store-call5 (a carrier of the old line struck)";
  else if (nowShip.some((r) => c5moved.has(`${r[3]}\u0000${norm(r[1])}`))) cls = "store-call5 (a carrier moved here)";
  else if (JSON.stringify(sR.map((r) => [r[1], r[3]])) === JSON.stringify(lR.map((r) => [r[1], r[3]]))) cls = "the key's rows are the same: the projection moved";
  else cls = "the key's rows differ otherwise";
  out.classes[cls] = (out.classes[cls] || 0) + 1;
  out.lines.push({ ...row, key: k, cls, carriers_now: { live: nowLive.map((r) => r[3]), ship: nowShip.map((r) => r[3]) }, carriers_was: { live: wasLive.map((r) => r[3]), ship: wasShip.map((r) => r[3]) } });
}
writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log(JSON.stringify(out.classes));
