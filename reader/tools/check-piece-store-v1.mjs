// THE PIECE STORE SERVED (Moses, FOR-ELIJAH-v77, 2026-10-17; the owner,
// 2026-10-16: "each piece in the + sign is RMD (r pill, M license, D
// definition)"; "share the record, never share the claim"; "no default
// outside the system"): the lane's normalized piece store, records once under
// a hash id and claims apart, served per book by tools/bake-piece-store-v1.mjs
// and read by the card at one cell's own place. Every place asked of the page
// is found in the served data, never named here (check-scope-derived S1).
//   P1  data/piece-store/index.json names PIECE:TAHOT and PIECE:MACULA, each
//       CC BY 4.0, lists its books, and received what the relay states (its
//       first line: 778,083 records, 1,296,994 claims; its counts table: per
//       kind); for each kind, the claims the files serve and the claims the
//       index's rules withhold add up to the relay's, and no piece of a
//       division is withheld as a join
//   P2  the book files hold exactly the served claims; every claim's rid
//       names a record in its file; a record is [m, headword, R, year] with
//       m a named source; letters a <= b; a claim is ten short slots, its
//       only text its English slice (share the record, never the claim)
//   P3  the first word both sources divide alike, reading its first piece
//       alike: that piece reads so by PIECE:MACULA and PIECE:TAHOT, and the
//       word's whole form carries no join of the lane's; the first word
//       neither divides carries every whole-word claim at its place, and no
//       other
//   P4  the same for an undivided word in another book (its own file)
//   P5  the piece sources ride their source's chip on the sources row (one
//       chip per source key), and TAHOT switched off takes PIECE:TAHOT off
//       the card
//   P6  A CELL GETS ITS OWN PLACE'S CLAIMS AND NO OTHER (the review of
//       2026-10-17): in the first maqaf pair whose first word opens with a
//       letter the next word's suffix repeats, the first word's piece
//       carries its own claims and never the suffix's; in the first word
//       whose division opens and closes on the same letter, that letter
//       claims nothing (the card asks once per surface and cannot say which)
//       and the piece between carries exactly its own claims
//   P7  A PIECE ROW NEVER LEADS: on every card opened here, no reading the
//       store or an overlay also prints is led by a piece row (the record
//       shown, its M, its license and the line's credit are theirs)
//   P8  the export cites no piece row, after a card at the section was open
// Usage: node tools/check-piece-store-v1.mjs [url]
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl, zonesServed } from "./zones-on-disk-v1.mjs";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const DIR = "data/piece-store/";
// what the relay states it handed over: its first line ("records 778,083;
// claims 1,296,994") and its counts table ("claims, kind WHOLE_WORD |
// 608,654", DIVISION 615,724, RUN 72,616), and the 39 books of the lane's index
const RELAY = { claims: 1296994, records: 778083, books: 39, kinds: { WHOLE_WORD: 608654, DIVISION: 615724, RUN: 72616 } };
const ix = JSON.parse(readFileSync(`${DIR}index.json`, "utf8"));
const M = ix.m_sources || {};
const c = ix.counts || {};
const W = c.withheld || {};
check("P1 the two PIECE sources, CC BY 4.0", ["PIECE:TAHOT", "PIECE:MACULA"].every((m) => M[m] && M[m].licensePosture === "cc_by_4_0"), Object.keys(M).join(" "));
check("P1 the relay's claims and records received, its books listed", c.claims_received && c.claims_received.value === RELAY.claims && c.records_received && c.records_received.value === RELAY.records && Array.isArray(ix.books) && ix.books.length === RELAY.books,
  `claims ${c.claims_received && c.claims_received.value} · records ${c.records_received && c.records_received.value} · ${Array.isArray(ix.books) ? ix.books.length : "no"} books listed`);
const files = readdirSync(DIR).filter((f) => f.endsWith(".json") && f !== "index.json");
let claims = 0, badRid = 0, badRec = 0, badLetters = 0, long = 0, recs = 0;
const byKind = {};
const BOOKS = {};
for (const f of files) {
  const pb = JSON.parse(readFileSync(DIR + f, "utf8")); BOOKS[pb.book] = pb;
  for (const r of Object.values(pb.records)) { recs += 1; if (!(Array.isArray(r) && r.length === 4 && M[r[0]])) badRec += 1; }
  for (const cl of Object.values(pb.places)) for (const k of cl) {
    claims += 1; byKind[k[2]] = (byKind[k[2]] || 0) + 1;
    if (k.length !== 10) long += 1;
    if (k[7] && !pb.records[k[7]]) badRid += 1;
    if (k[4] != null && !(k[4] <= k[5])) badLetters += 1;
  }
}
const withheldOf = (kind) => Object.values(W).reduce((t, w) => t + ((w.per_kind || {})[kind] || 0), 0);
const kindsAdd = Object.entries(RELAY.kinds).map(([k, v]) => ({ k, served: byKind[k] || 0, withheld: withheldOf(k), relay: v }));
check("P1 each kind: served in the files + withheld by the index's rules = the relay's", kindsAdd.every((x) => x.served + x.withheld === x.relay) && Object.values(W).every((w) => w.why),
  kindsAdd.map((x) => `${x.k} ${x.served} + ${x.withheld} = ${x.served + x.withheld} (relay ${x.relay})`).join(" · "));
check("P1 no piece of a division is withheld as a join", Object.entries(W).filter(([k]) => /^joins_/u.test(k)).every(([, w]) => !((w.per_kind || {}).DIVISION)), Object.entries(W).map(([k, w]) => `${k} ${JSON.stringify(w.per_kind)}`).join(" · "));
check("P2 the book files, the index's served claims and records", files.length === RELAY.books && claims === c.claims.value && recs === c.records_named.value && c.records_named.value + ((c.records_not_named || {}).value || 0) === RELAY.records, `${files.length} books ${claims} claims ${recs} records (+ ${(c.records_not_named || {}).value} not named)`);
check("P2 every rid names a record in its file", badRid === 0, `${badRid} unnamed`);
check("P2 records [m, headword, R, year], m a named source", badRec === 0, `${badRec} off`);
check("P2 letters a <= b; a claim is ten short slots", badLetters === 0 && long === 0, `${badLetters} letters, ${long} long`);

// ---- the places, found in the served data ----
const letters = (s) => [...String(s || "")].filter((ch) => ch >= "\u05d0" && ch <= "\u05ea").join("");
const low = (t) => String(t).trim().toLowerCase();
const SERVED = zonesServed("data/zones").filter((bk) => BOOKS[bk]);
const zoneCache = new Map();
const zoneOf = (bk) => zoneCache.get(bk) || zoneCache.set(bk, JSON.parse(gunzipSync(readFileSync(`data/zones/${bk}.bin`)).toString("utf8"))).get(bk);
const numbered = (sec) => (sec.words || []).filter((w) => !w.mark);   // as the page numbers them
const isKq = (w) => !!(w.kq || (w.w && w.w.some((r) => r.role)));
const joinsNext = (w) => !!(w.presentation_join && w.presentation_join.join_next_without_separator);
const joinsPrev = (w) => !!(w.presentation_join && w.presentation_join.join_previous_without_separator);
const alone = (ws, i) => !isKq(ws[i]) && !joinsNext(ws[i]) && !joinsPrev(ws[i]) && !(i > 0 && joinsNext(ws[i - 1]));
const servedAt = (bk, ref, n) => (BOOKS[bk].places[`${ref}:${n}`] || []).filter((k) => k[6] && !k[9] && BOOKS[bk].records[k[7]]);
const claimsAt = (bk, ref, n, a, b, reading = "form") => servedAt(bk, ref, n).filter((k) => k[4] === a && k[5] === b && k[3] === reading).map((k) => ({ R: low(k[6]), m: BOOKS[bk].records[k[7]][0] }));
// a word's TAHOT division on the page (its pg), as letter ranges
const pgRanges = (w) => { if (!Array.isArray(w.pg) || w.pg.length < 2 || w.pg.some((x) => !x || !x.k)) return null; let a = 0; return w.pg.map((x) => { const L = letters(x.k).length; const r = [a, a + L - 1]; a += L; return r; }); };
const divides = (bk, ref, n, src, ranges) => ranges.every(([a, b]) => servedAt(bk, ref, n).some((k) => k[1] === src && k[2] === "DIVISION" && k[3] === "form" && k[4] === a && k[5] === b));
const find = (pred, books = SERVED) => {
  for (const bk of books) for (const sec of zoneOf(bk).sections || []) {
    const ws = numbered(sec);
    for (let i = 0; i < ws.length; i += 1) { const hit = pred(bk, sec.label, ws, i); if (hit) return { book: bk, ref: sec.label, n: i + 1, at: `${sec.label}:${i + 1}`, ...hit }; }
  }
  return null;
};
// A: both sources divide the word as the page does, and read its first piece alike
const A = find((bk, ref, ws, i) => {
  const w = ws[i]; if (!alone(ws, i)) return null;
  const rg = pgRanges(w); if (!rg || rg[0][0] !== 0 || rg[0][1] !== 0) return null;
  if (!divides(bk, ref, i + 1, "macula", rg) || !divides(bk, ref, i + 1, "tahot", rg)) return null;
  const first = claimsAt(bk, ref, i + 1, 0, 0);
  const mac = first.find((x) => x.m === "PIECE:MACULA"), tah = first.find((x) => x.m === "PIECE:TAHOT");
  if (!mac || !tah || mac.R !== tah.R || !mac.R) return null;
  return { cut: w.pg.map((x) => x.k).join(" + "), cell: w.pg[0].k, R: mac.R, L: letters(w.k).length };
});
// B: neither source divides the word; each reads it whole
const undivided = (books) => find((bk, ref, ws, i) => {
  const w = ws[i]; if (!alone(ws, i) || (Array.isArray(w.pg) && w.pg.length > 1)) return null;
  const L = letters(w.k).length; if (L < 2) return null;
  const whole = claimsAt(bk, ref, i + 1, 0, L - 1);
  if (!whole.some((x) => x.m === "PIECE:MACULA") || !whole.some((x) => x.m === "PIECE:TAHOT")) return null;
  if (servedAt(bk, ref, i + 1).some((k) => k[2] === "DIVISION")) return null;
  return { L };
}, books);
const B = undivided(SERVED);
const B2 = B ? undivided(SERVED.filter((bk) => bk !== B.book)) : null;
// C: a maqaf pair whose first word opens with a letter the next word's suffix repeats, read otherwise
const C = find((bk, ref, ws, i) => {
  const w = ws[i], nx = ws[i + 1]; if (!nx || !joinsNext(w) || isKq(w) || isKq(nx) || (i > 0 && joinsNext(ws[i - 1])) || joinsNext(nx)) return null;
  const rg = pgRanges(w); if (!rg || rg[0][1] !== 0) return null;
  const X = letters(w.pg[0].k); const own = claimsAt(bk, ref, i + 1, 0, 0); if (!own.length) return null;
  const NL = letters(nx.k);
  const foreign = servedAt(bk, ref, i + 2).filter((k) => k[2] === "DIVISION" && k[3] === "form" && k[4] === k[5] && k[4] > 0 && NL[k[4]] === X).map((k) => low(k[6])).filter((R) => !own.some((o) => o.R === R));
  return foreign.length ? { cut: w.pg.map((x) => x.k).join(" + "), cell: w.pg[0].k, foreign } : null;
});
// D: a word whose division opens and closes on the same letter
const D = find((bk, ref, ws, i) => {
  const w = ws[i]; if (!alone(ws, i)) return null;
  const rg = pgRanges(w); if (!rg || rg.length !== 3) return null;
  const first = w.pg[0].k, last = w.pg[2].k; if (first !== last || letters(first).length !== 1 || w.pg[1].k === first) return null;
  const mid = claimsAt(bk, ref, i + 1, rg[1][0], rg[1][1]); if (!mid.length || !claimsAt(bk, ref, i + 1, 0, 0).length) return null;
  return { cut: w.pg.map((x) => x.k).join(" + "), X: first, mid: w.pg[1].k, midA: rg[1][0], midB: rg[1][1] };
});
check("P3-P6 the served data holds every case asked of the page", !!(A && B && B2 && C && D), JSON.stringify({ A: A && `${A.book} ${A.at}`, B: B && `${B.book} ${B.at}`, B2: B2 && `${B2.book} ${B2.at}`, C: C && `${C.book} ${C.at}`, D: D && `${D.book} ${D.at}` }));

// ---- the page ----
const pw = await loadPlaywright();
const BASE = defaultZoneUrl(/^https?:/u.test(process.argv[2] || "") ? process.argv[2] : "").split("?")[0];
const b = await pw.chromium.launch(launchOptions());
const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, acceptDownloads: true });
const p = await ctx.newPage();
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
// a fresh reader on every load, unless this tab asked to keep what it set (P5)
await p.addInitScript(() => { try { if (!sessionStorage.getItem("fh.check.keep")) localStorage.clear(); } catch { /* fresh reader */ } });
const pills = () => p.evaluate(() => [...document.querySelectorAll("#hud .band.b-read button")].map((x) => ({ t: x.textContent.trim(), by: (x.dataset.by || "").split(/\s+/u).filter(Boolean) })));
const press = async (sel, t, nth = 0) => { const ok = await p.evaluate(({ sel, t, nth }) => { const xs = [...document.querySelectorAll(sel)].filter((y) => y.textContent.trim() === t); const x = xs[nth]; if (x) x.click(); return !!x; }, { sel, t, nth }); await p.waitForTimeout(1100); return ok; };
const CUT = "#hud .b-cut .s-pills button, #hud .b-chain .s-pills button", CELL = "#hud .b-cell .s-pills button";
const land = async (book, at) => {
  await p.goto(`${BASE}?b=${book}#${at}`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  const t0 = Date.now(); while (Date.now() - t0 < 15000 && !(await p.$("#hud .r-pills button"))) await p.waitForTimeout(100);
  await p.waitForTimeout(700);
};
const leads = []; let groupsSeen = 0;
const noteLead = async (where) => {
  const r = await p.evaluate(() => ({ by: window.__poolBy || [], lead: window.__poolLead || [], text: window.__pool || [] }));
  r.by.forEach((ids, i) => {
    const all = String(ids).split(" ").filter(Boolean);
    if (!all.some((id) => id.startsWith("PIECE:")) || !all.some((id) => !id.startsWith("PIECE:"))) return;
    groupsSeen += 1;
    if (String(r.lead[i] || "").startsWith("PIECE:")) leads.push(`${where} "${r.text[i]}" led by ${r.lead[i]} over ${ids}`);
  });
};
const piecePills = async () => (await pills()).filter((x) => x.by.some((id) => id.startsWith("PIECE:"))).map((x) => ({ t: low(x.t), by: x.by.filter((id) => id.startsWith("PIECE:")) }));
const samePieces = (have, want) => want.every((w) => have.some((h) => h.t === w.R && h.by.includes(w.m))) && have.every((h) => h.by.every((m) => want.some((w) => w.R === h.t && w.m === m)));
const wholeCut = async () => { const cut = await p.evaluate(() => [...document.querySelectorAll("#hud .band.b-cut button")].map((x) => x.textContent.trim())); const w = cut.find((t) => !/\+/u.test(t)); if (w) await press(CUT, w); };

if (A) {
  await land(A.book, A.at); await press(CUT, A.cut);
  const ok = await press(CELL, A.cell); await noteLead(`${A.book} ${A.at} piece`);
  const row = (await pills()).find((x) => low(x.t) === A.R);
  check(`P3 ${A.book} ${A.at}: its first piece reads "${A.R}" by PIECE:MACULA and PIECE:TAHOT`, ok && !!row && row.by.includes("PIECE:MACULA") && row.by.includes("PIECE:TAHOT"), row ? row.by.join(" ") : "no row");
  await wholeCut(); await noteLead(`${A.book} ${A.at} whole`);
  const have = await piecePills();
  check(`P3 ${A.book} ${A.at}: the divided word's whole form carries no join of the lane's`, have.length === 0 && claimsAt(A.book, A.ref, A.n, 0, A.L - 1).length === 0, `${have.length} piece pills`);
}
for (const [tag, U] of [["P3", B], ["P4", B2]]) if (U) {
  await land(U.book, U.at); await wholeCut(); await noteLead(`${U.book} ${U.at}`);
  const want = claimsAt(U.book, U.ref, U.n, 0, U.L - 1), have = await piecePills();
  check(`${tag} ${U.book} ${U.at}: an undivided word carries every whole-word claim at its place, and no other`, want.length >= 2 && samePieces(have, want), `want ${JSON.stringify(want)} · have ${JSON.stringify(have)}`);
}
if (C) {
  await land(C.book, C.at); await press(CUT, C.cut);
  const ok = await press(CELL, C.cell); await noteLead(`${C.book} ${C.at}`);
  const have = await piecePills(), want = claimsAt(C.book, C.ref, C.n, 0, 0);
  check(`P6 ${C.book} ${C.at}: in a maqaf pair the first word's piece carries its own claims, never the next word's suffix`, ok && samePieces(have, want) && !have.some((h) => C.foreign.includes(h.t)), `want ${JSON.stringify(want)} · have ${JSON.stringify(have)} · the suffix reads ${JSON.stringify(C.foreign)}`);
}
if (D) {
  await land(D.book, D.at); await press(CUT, D.cut);
  const okX = await press(CELL, D.X, 0); const x = await piecePills(); await noteLead(`${D.book} ${D.at} ${D.X}`);
  const okM = await press(CELL, D.mid, 0); const mid = await piecePills(); const want = claimsAt(D.book, D.ref, D.n, D.midA, D.midB); await noteLead(`${D.book} ${D.at} middle`);
  check(`P6 ${D.book} ${D.at}: a letter that opens and closes the division claims nothing; the piece between carries exactly its own`, okX && okM && x.length === 0 && samePieces(mid, want), `letter ${JSON.stringify(x)} · middle want ${JSON.stringify(want)} have ${JSON.stringify(mid)}`);
}
check("P7 no reading the store or an overlay also prints is led by a piece row, on any card opened here", groupsSeen > 0 && leads.length === 0, leads.slice(0, 3).join(" | ") || `${groupsSeen} shared readings, every one led by its own source`);

// P8: the export of a section, after a card at it was open
if (A) {
  await land(A.book, A.at); await press(CUT, A.cut); await press(CELL, A.cell);
  await p.keyboard.press("Escape"); await p.waitForTimeout(300);
  const sec = await p.evaluateHandle((ref) => [...document.querySelectorAll("section.seg")].find((s) => (s.querySelector(".vnum") || {}).textContent === ref), A.ref);
  const xp = sec ? await sec.$(".xp-row .xp:nth-of-type(2)") : null;
  let exported = "";
  if (xp) {
    await xp.click();
    await p.waitForFunction((el) => el && /Press again/.test((el.querySelector(".xp-note") || {}).textContent || ""), sec, { timeout: 25000 }).catch(() => {});
    const armed = await sec.$(".xp-row .xp.armed");
    const [dl] = await Promise.all([p.waitForEvent("download", { timeout: 25000 }).catch(() => null), armed ? armed.click() : Promise.resolve()]);
    if (dl) exported = readFileSync(await dl.path(), "utf8");
  }
  check(`P8 the export of ${A.book} ${A.ref} cites no piece row`, exported.length > 0 && !/PIECE:|the morphology's pieces|the aligned translation's pieces/u.test(exported), `${exported.length} bytes`);
}

// P5
if (A) {
  await land(A.book, A.at);
  const chips = await p.evaluate(() => [...document.querySelectorAll('.rail .row[data-toggle="sources"] .dfp[data-ids]')].map((x) => ({ key: x.dataset.key, ids: x.dataset.ids.split(" ") })));
  const rides = ["PIECE:TAHOT", "PIECE:MACULA"].map((m) => { const x = chips.find((y) => y.ids.includes(m)); return { m, ok: !!x && x.key === (M[m] || {}).key && x.ids.some((id) => !id.startsWith("PIECE:")), with: x ? x.ids.join(" ") : "no chip" }; });
  check("P5 each piece source rides its source's chip", rides.every((r) => r.ok), rides.map((r) => `${r.m}: ${r.with}`).join(" · "));
  const tahot = chips.find((x) => x.ids.includes("PIECE:TAHOT"));
  if (tahot) {
    await p.evaluate((ids) => { try { sessionStorage.setItem("fh.check.keep", "1"); localStorage.setItem("fh.sources.off", JSON.stringify(ids)); } catch { /* the check reads what the page keeps */ } }, tahot.ids);
    // a load, not a hash change: the same address would only move the hash
    await p.reload({ waitUntil: "networkidle" });
    await land(A.book, A.at); await press(CUT, A.cut); await press(CELL, A.cell);
    const row = (await pills()).find((x) => low(x.t) === A.R);
    check("P5 TAHOT switched off takes its piece rows off the card", !!row && !row.by.includes("PIECE:TAHOT") && row.by.includes("PIECE:MACULA"), row ? row.by.join(" ") : `no "${A.R}" pill`);
    await p.evaluate(() => { try { localStorage.setItem("fh.sources.off", "[]"); sessionStorage.removeItem("fh.check.keep"); } catch { /* as above */ } });
  }
}
await b.close();
console.log(bad ? `FAIL ${bad}` : "PASS piece-store-v1");
process.exit(bad ? 1 : 0);
