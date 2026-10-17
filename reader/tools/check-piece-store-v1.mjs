// THE PIECE STORE SERVED (Moses, FOR-ELIJAH-v77, 2026-10-17; the owner,
// 2026-10-16: "each piece in the + sign is RMD (r pill, M license, D
// definition)"): the lane's normalized piece store, records once under a hash
// id and claims apart, served per book by tools/bake-piece-store-v1.mjs.
//   P1  data/piece-store/index.json names PIECE:TAHOT and PIECE:MACULA, each
//       CC BY 4.0, and counts the relay's 1,296,994 claims received, the
//       lane's joins withheld (a whole-word claim naming two records), the
//       rest served; 771,665 records, 39 books
//   P2  the 39 book files hold exactly those claims; every claim's rid names
//       a record in its file; a record is [m, headword, R, year] with m a
//       named source; a claim's letters run a <= b; no claim carries text of
//       its own beyond its English slice (share the record, never the claim)
//   P3  Genesis 1:1:1: the piece "\u05d1" reads "in" by PIECE:MACULA and
//       PIECE:TAHOT among its sources; the divided word's whole form carries
//       no join of the lane's; an undivided word's card (1:1:3) carries every
//       served whole-word claim at the place as a row under its own source
//   P4  the same at a place in another book (the book's own file is fetched)
// Usage: node tools/check-piece-store-v1.mjs [url] [--at deuteronomy 6:4:1]
import { readFileSync, readdirSync } from "node:fs";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const argAt = process.argv.indexOf("--at");
const [BOOK2, AT2] = argAt > -1 ? [process.argv[argAt + 1], process.argv[argAt + 2]] : ["deuteronomy", "6:4:1"];
const DIR = "data/piece-store/";
const ix = JSON.parse(readFileSync(`${DIR}index.json`, "utf8"));
const M = ix.m_sources || {};
check("P1 the two PIECE sources, CC BY 4.0", ["PIECE:TAHOT", "PIECE:MACULA"].every((m) => M[m] && M[m].licensePosture === "cc_by_4_0"), Object.keys(M).join(" "));
const c = ix.counts || {};
check("P1 the relay's counts: received claims, the lane's joins withheld, the rest served", c.claims_received && c.claims_received.value === 1296994 && c.joins_not_served && c.claims && c.claims.value === c.claims_received.value - c.joins_not_served.value && c.records_named && c.records_named.value === 771665 && c.books && c.books.value === 39, `received ${c.claims_received && c.claims_received.value} joins ${c.joins_not_served && c.joins_not_served.value} served ${c.claims && c.claims.value} records ${c.records_named && c.records_named.value} books ${c.books && c.books.value}`);
const books = readdirSync(DIR).filter((f) => f.endsWith(".json") && f !== "index.json");
let claims = 0, badRid = 0, badRec = 0, badLetters = 0, long = 0, recs = 0;
const BOOKS = {};
for (const f of books) {
  const pb = JSON.parse(readFileSync(DIR + f, "utf8")); BOOKS[pb.book] = pb;
  for (const r of Object.values(pb.records)) { recs += 1; if (!(Array.isArray(r) && r.length === 4 && M[r[0]])) badRec += 1; }
  for (const cl of Object.values(pb.places)) for (const k of cl) {
    claims += 1;
    if (k.length !== 10) long += 1;
    if (k[7] && !pb.records[k[7]]) badRid += 1;
    if (k[4] != null && !(k[4] <= k[5])) badLetters += 1;
  }
}
check("P2 39 book files, the index's claims and records", books.length === 39 && claims === c.claims.value && recs === c.records_named.value, `${books.length} books ${claims} claims ${recs} records`);
check("P2 every rid names a record in its file", badRid === 0, `${badRid} unnamed`);
check("P2 records [m, headword, R, year], m a named source", badRec === 0, `${badRec} off`);
check("P2 letters a <= b; a claim is ten short slots", badLetters === 0 && long === 0, `${badLetters} letters, ${long} long`);
const letters = (s) => [...String(s || "")].filter((ch) => ch >= "\u05d0" && ch <= "\u05ea").join("");
const expectedWhole = (book, at) => (BOOKS[book].places[at] || []).filter((k) => k[2] === "WHOLE_WORD" && k[6] && !k[9]).map((k) => ({ R: k[6], m: BOOKS[book].records[k[7]][0] }));
const pw = await loadPlaywright();
const BASE = defaultZoneUrl(/^https?:/u.test(process.argv[2] || "") ? process.argv[2] : "").split("?")[0];
const b = await pw.chromium.launch(launchOptions());
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
const p = await ctx.newPage();
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.addInitScript(() => { try { localStorage.clear(); } catch { /* fresh reader */ } });
const pills = () => p.evaluate(() => [...document.querySelectorAll("#hud .band.b-read button")].map((x) => ({ t: x.textContent.trim(), by: (x.dataset.by || "").split(/\s+/u) })));
const press = async (t) => { const ok = await p.evaluate((t) => { const x = [...document.querySelectorAll("#hud .band button")].find((y) => y.textContent.trim() === t); if (x) x.click(); return !!x; }, t); await p.waitForTimeout(900); return ok; };
const land = async (book, at) => {
  await p.goto(`${BASE}?b=${book}#${at}`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  const t0 = Date.now(); while (Date.now() - t0 < 12000 && !(await p.$("#hud .r-pills button"))) await p.waitForTimeout(100);
  await p.waitForTimeout(500);
  return p.evaluate(() => { const w = document.querySelector("#hud .head .wn"); return w ? w.textContent.trim() : ""; });
};
const wholeRows = async (book, at) => {
  // the whole word's division is the one pill of the divisions band without a
  // "+"; a word the catalog never divides has no divisions band
  const cut = await p.evaluate(() => [...document.querySelectorAll("#hud .band.b-cut button")].map((x) => x.textContent.trim()));
  const whole = cut.find((t) => !/\+/u.test(t));
  if (whole) await press(whole);
  const have = await pills();
  const want = expectedWhole(book, at);
  const missing = want.filter((e) => !have.some((h) => h.t === e.R.trim() && h.by.includes(e.m)));
  return { want, missing, have: have.length };
};
await land("genesis", "1:1:1");
check("P3 Genesis 1:1:1 divides", await press("\u05d1 + \u05e8\u05d0\u05e9\u05d9\u05ea"));
check("P3 the piece \u05d1 opens", await press("\u05d1"));
const inRow = (await pills()).find((x) => x.t === "in");
check("P3 the piece reads 'in' by PIECE:MACULA and PIECE:TAHOT", !!inRow && inRow.by.includes("PIECE:MACULA") && inRow.by.includes("PIECE:TAHOT"), inRow ? inRow.by.join(" ") : "no row");
{ const r = await wholeRows("genesis", "1:1:1"); check("P3 the divided word's whole form carries no join of the lane's", r.want.length === 0 && r.missing.length === 0, `${r.want.length} whole-word claims served at 1:1:1`); }
await land("genesis", "1:1:3");
{ const r = await wholeRows("genesis", "1:1:3"); check("P3 an undivided word (1:1:3) carries every served whole-word claim", r.want.length >= 2 && r.missing.length === 0, `${r.want.length} wanted, ${r.missing.length} missing of ${r.have} rows${r.missing.length ? ": " + JSON.stringify(r.missing) : ""}`); }
await land(BOOK2, AT2);
{ const r = await wholeRows(BOOK2, AT2); check(`P4 ${BOOK2} ${AT2} carries its served whole-word claims`, r.want.length >= 1 && r.missing.length === 0, `${r.want.length} wanted, ${r.missing.length} missing of ${r.have} rows${r.missing.length ? ": " + JSON.stringify(r.missing) : ""}`); }
await b.close();
console.log(bad ? `FAIL ${bad}` : "PASS piece-store-v1");
process.exit(bad ? 1 : 0);
