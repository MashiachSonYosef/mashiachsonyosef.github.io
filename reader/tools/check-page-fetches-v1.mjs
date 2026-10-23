// A BUILT PAGE FETCHES WHAT IT SHOWS (the rebuild, 2026-10-23: "same product,
// lighter weight"). A chapter page fetched the whole shelf's pin record to
// seal one book's bins, every book's overlay counts to draw one book's chips,
// and the book's BSB file before any card asked for it.
//   F1  a built chapter page's load fetches no shelf pin record, no overlay
//       counts record and no BSB file
//   F2  the page's own pins (reader-zone-pins) are the record's pins for this
//       book's bins, every one, byte for byte, and its overlay counts
//       (reader-overlay-counts) are the record's for this book
//   F3  the bin is still sealed: the page records the sha256 it hashed on
//       arrival, equal to the pin
//   F4  the first card to open fetches the book's BSB file once and carries
//       the BSB's line, as before; a second card fetches nothing more
//   F5  the reader opened by address (zone.html?b=), without the metas, still
//       fetches the records whole and shows the book
// The site is served from the checkout itself, as check-door-word-card-v1
// serves it, or the origin given; the book is the first served zone with a
// chapter page, never named here (check-scope-derived S1).
// Usage: node tools/check-page-fetches-v1.mjs [origin]
import { readFileSync, existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { join, dirname, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { zonesServed } from "./zones-on-disk-v1.mjs";
const HERE = dirname(fileURLToPath(import.meta.url)), SITE = join(HERE, "..", ".."), ENGINE = join(HERE, "..");
const TYPES = { ".html": "text/html; charset=utf-8", ".json": "application/json", ".css": "text/css", ".js": "text/javascript", ".bin": "application/octet-stream", ".woff2": "font/woff2", ".svg": "image/svg+xml" };
const srv = /^https?:/u.test(process.argv[2] || "") ? null : createServer(async (req, res) => {
  const q = normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^(\.\.[/\\])+/u, "");
  try {
    let file = join(SITE, q);
    if (!extname(q)) file = join(file, "index.html");
    const body = await readFile(file);
    res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch { res.writeHead(404); res.end("no"); }
});
if (srv) await new Promise((r) => srv.listen(0, "127.0.0.1", r));
const ORIGIN = srv ? `http://127.0.0.1:${srv.address().port}` : new URL(process.argv[2]).origin;
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  -  " + d : ""}`); };
const BOOK = zonesServed().find((z) => existsSync(join(SITE, z, "1", "index.html")));
if (!BOOK) { console.log("SKIPPED — no served zone has a built chapter page"); process.exit(3); }
const RECORD = JSON.parse(readFileSync(join(ENGINE, "data", "zone-store-v1.json"), "utf8"));
const COUNTS = (() => { try { return JSON.parse(readFileSync(join(ENGINE, "data", "overlay-book-counts-v1.json"), "utf8")); } catch { return null; } })();
const SUG_IX = (() => { try { return JSON.parse(readFileSync(join(ENGINE, "data", "source-suggested", "index.json"), "utf8")); } catch { return null; } })();
const hasBsb = !!(SUG_IX && SUG_IX.books && SUG_IX.books[BOOK]);
console.log(`the book: ${BOOK}${hasBsb ? "" : " (no BSB file laid on it)"}`);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
const p = await ctx.newPage();
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
const got = [];
p.on("response", (r) => { got.push(r.url().replace(ORIGIN, "").split("?")[0]); });
const RE = { pins: /\/data\/zone-store-v1\.json$/u, counts: /\/data\/overlay-book-counts-v1\.json$/u, bsb: new RegExp(`/data/source-suggested/${BOOK}\\.json$`, "u") };
await p.goto(`${ORIGIN}/${BOOK}/1/`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
await p.waitForTimeout(1500);
const onLoad = { pins: got.filter((u) => RE.pins.test(u)).length, counts: got.filter((u) => RE.counts.test(u)).length, bsb: got.filter((u) => RE.bsb.test(u)).length, all: got.length };
check("F1 a built chapter page's load fetches no shelf pin record, no overlay counts record and no BSB file", onLoad.pins === 0 && onLoad.counts === 0 && onLoad.bsb === 0,
  `${onLoad.all} requests on load · pin record ${onLoad.pins} · counts record ${onLoad.counts} · BSB file ${onLoad.bsb}`);
const metas = await p.evaluate(() => ({ pins: document.querySelector('meta[name="reader-zone-pins"]')?.content || "", counts: document.querySelector('meta[name="reader-overlay-counts"]')?.content || "", shas: window.__binShas || null }));
const own = metas.pins ? JSON.parse(metas.pins) : null;
const wantPins = Object.fromEntries(Object.entries(RECORD.pins || {}).filter(([n]) => n === `${BOOK}.bin` || n.startsWith(`${BOOK}.`)));
const pinsEqual = !!own && JSON.stringify(own.pins) === JSON.stringify(wantPins) && (own.base === undefined ? null : own.base) === (RECORD.base === undefined ? null : RECORD.base);
const wantCounts = COUNTS && COUNTS.books ? COUNTS.books[BOOK] || null : null;
const countsEqual = wantCounts ? metas.counts === JSON.stringify(wantCounts) : metas.counts === "";
check("F2 the page's own pins are the record's for this book's bins, and its overlay counts the record's for this book", pinsEqual && countsEqual,
  `${own ? Object.keys(own.pins).length : 0} pins on the page, ${Object.keys(wantPins).length} in the record${pinsEqual ? ", equal" : ", NOT equal"} · counts ${wantCounts ? (countsEqual ? "equal" : "NOT equal") : "none for this book"}`);
const sealed = !!(metas.shas && metas.shas[`${BOOK}.bin`] && own && own.pins[`${BOOK}.bin`] && metas.shas[`${BOOK}.bin`] === own.pins[`${BOOK}.bin`].sha256);
check("F3 the bin is still sealed: the page hashed it on arrival and the hash is the pin", sealed, `hashed ${metas.shas ? (metas.shas[`${BOOK}.bin`] || "").slice(0, 12) : "nothing"} · pin ${own && own.pins[`${BOOK}.bin`] ? own.pins[`${BOOK}.bin`].sha256.slice(0, 12) : "none"}`);
// F4: the first card and the second
const openCard = async (i) => {
  await p.evaluate((i) => { const wb = document.querySelectorAll(".he-text .wb:not(.mark)")[i]; wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w")).click(); }, i);
  await p.waitForSelector("#hud .r-pills button", { timeout: 15000 }).catch(() => {});
  if (hasBsb) await p.waitForFunction(() => !!document.querySelector("#hud .r-sug"), null, { timeout: 10000 }).catch(() => {});
  await p.waitForTimeout(400);
  const sug = await p.evaluate(() => { const s = document.querySelector("#hud .r-sug"); return s ? s.textContent.trim().slice(0, 60) : ""; });
  await p.keyboard.press("Escape"); await p.waitForTimeout(200);
  return sug;
};
const n0 = got.filter((u) => RE.bsb.test(u)).length;
const sug1 = await openCard(0);
const n1 = got.filter((u) => RE.bsb.test(u)).length;
const sug2 = await openCard(1);
const n2 = got.filter((u) => RE.bsb.test(u)).length;
check("F4 the first card fetches the book's BSB file once and carries the BSB's line; a second card fetches nothing more", hasBsb ? (n1 - n0 === 1 && n2 === n1 && (!!sug1 || !!sug2)) : (n2 === n0),
  hasBsb ? `BSB file fetched ${n1 - n0} time(s) by the first card, ${n2 - n1} by the second · first card: "${sug1 || "no BSB line"}" · second: "${sug2 || "no BSB line"}"` : "no BSB file for this book; none fetched");
// F5: the reader by address, no metas
got.length = 0;
await p.goto(`${ORIGIN}/${ENGINE.split("/").pop()}/zone.html?b=${BOOK}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 }).catch(() => {});
await p.waitForTimeout(800);
const byAddr = { pins: got.filter((u) => RE.pins.test(u)).length, counts: got.filter((u) => RE.counts.test(u)).length, words: await p.evaluate(() => document.querySelectorAll("section.seg .he-text .wb").length), meta: await p.evaluate(() => !!document.querySelector('meta[name="reader-zone-pins"]')) };
check("F5 the reader opened by address, without the metas, fetches the records whole and shows the book", !byAddr.meta && byAddr.pins === 1 && byAddr.counts === 1 && byAddr.words > 0, `metas ${byAddr.meta} · pin record ${byAddr.pins} · counts record ${byAddr.counts} · ${byAddr.words} words`);
await b.close();
if (srv) srv.close();
console.log(bad ? `\n${bad} failing` : "\nall checks passed");
process.exit(bad ? 1 : 0);
