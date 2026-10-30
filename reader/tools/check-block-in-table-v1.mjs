// A BLOCK STANDS IN ITS WORD, ON THE CARD AND IN THE CONCORDANCE (the owner,
// 2026-10-19, at Daniel 1:1, the word read "in + year": "the hud broke when i
// selected what shouldve been 'in + sleep', it dropped the first word
// entirely ... also why would sleep be 0 other places, should it even be in
// this one then?"). The block had lit the book's gloss for its letters
// ("sleep") while the line read "year"; the table's row read the block alone;
// and its count was the whole word's, where the block's reading stands
// nowhere.
//   B1  a block of a division the line reads in pieces opens on the line's
//       own piece for it, wherever that piece is one of the block's pills
//   B2  with a block pressed, the concordance row reads the whole word: every
//       block of the division in its Hebrew, and the line's own piece for
//       every other block beside the pressed block's pill
//   B3  the row's count is the places where the block's letters stand as a
//       word and a source reads them exactly so (the dictionary store under
//       the block's letters, read here, not on the page)
//   B4  another reading pressed on the block: the line's piece follows, the
//       row reads it, and its count is that reading's under the block's
//       letters
//   B5  a reading picked from the concordance's own list reaches the line too
//       (the owner: "it also didnt push the in+sleep selection to the
//       runner"), the reading the card stands lit on included
// Words are found on the served pages, never named here (check-scope-derived
// S1). Usage: node tools/check-block-in-table-v1.mjs [url] (one page; with
// none, the first served pages until enough words are met)
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { zoneUrls } from "./zones-on-disk-v1.mjs";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  -  " + d : ""}`); };
const ARG = /^https?:/u.test(process.argv[2] || "") ? process.argv[2] : "";
const URLS = ARG ? [ARG] : zoneUrls().slice(0, 8);
const WANT = 6;            // words met before the check is satisfied
const PER_PAGE = 120;      // words looked at on a page

// the store, read in node: a key's places by the reading's words as the card
// prints them (the page's spanJoin, written again here)
const spanJoin = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\.$/u, "");
const DATA = new URL("data/", URLS[0]).href;
const ix = await (await fetch(`${DATA}dictionary-store/index.json`)).json();
const shards = new Map();
const entry = async (L) => {
  const h = createHash("sha256").update(Buffer.from(L, "utf8")).digest("hex").slice(0, 2);
  if (!shards.has(h)) {
    const r = await fetch(`${DATA}dictionary-store/shards/${h}.bin?v=${ix.store_version}`);
    shards.set(h, r.ok ? JSON.parse(gunzipSync(Buffer.from(await r.arrayBuffer())).toString("utf8")) : {});
  }
  return shards.get(h)[L] || null;
};
const storeCount = async (L, t) => {
  const v = await entry(L), at = new Set();
  // the row counts the places where the letters are the word; a place inside a longer word (kind "piece") is counted apart by the row
  for (const g of (v && v.readings) || []) if (spanJoin(g.reading) === t) for (const q of g.places) if (q.kind !== "piece") at.add(`${q.book}|${q.ref}|${q.w_page}`);
  return at.size;
};

const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
const met = [], b1 = [], b2 = [], b3 = [], b4 = [], b5 = []; let b4n = 0;
// the card and the table as they stand, for the word open
const read = (p) => p.evaluate(() => {
  const hud = document.getElementById("hud"), wb = document.querySelector("section.seg .wb.active");
  const letters = (s) => [...String(s || "").normalize("NFD")].filter((c) => { const n = c.codePointAt(0); return n >= 0x5d0 && n <= 0x5ea; }).join("");
  const pcs = wb && wb.querySelector(":scope > .g > .g-pcs");
  const tr = hud.querySelector(".dict-tab tbody tr.pick");
  const cnt = tr ? parseInt((tr.querySelector("td:last-child") || {}).textContent || "", 10) : NaN;
  return {
    blocks: [...hud.querySelectorAll(":scope > .rows .b-cell .s-pills button")].map((x) => ({ t: x.textContent.trim(), L: letters(x.textContent), on: x.getAttribute("aria-pressed") === "true" })),
    pills: [...hud.querySelectorAll(":scope > .rows .b-read .r-pills button")].map((x) => ({ t: x.textContent.trim(), on: x.getAttribute("aria-pressed") === "true" })),
    parts: pcs ? [...pcs.querySelectorAll(":scope > .g-pc")].map((x) => x.textContent.trim()) : [],
    counts: pcs ? String(pcs.dataset.counts || "").split(",").map(Number) : [],
    rowHe: tr ? (tr.querySelector("td.he") || {}).textContent || "" : "",
    rowHeParts: tr ? [...tr.querySelectorAll("td.he > span:not(.pp)")].map((x) => x.textContent.trim()) : [],
    rowPieces: tr ? [...tr.querySelectorAll(".rd-whole > .rd-piece, .rd-whole .r-pills button")].map((x) => x.textContent.trim()) : [],
    rowPill: tr ? ((tr.querySelector(".r-pills button") || {}).textContent || "").trim() : "",
    count: cnt,
  };
});
const settle = async (p) => { await p.waitForTimeout(700); await p.waitForFunction(() => { const tr = document.querySelector("#hud .dict-tab tbody tr.pick"); return !!tr; }, null, { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(500); };
for (const url of URLS) {
  if (met.length >= WANT) break;
  const p = await ctx.newPage();
  p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await p.goto(`${url}${url.includes("?") ? "&" : "?"}dict=on`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  const idx = await p.evaluate((n) => [...document.querySelectorAll(".he-text .wb:not(.mark)")].slice(0, n).map((wb, i) => (wb.querySelector(":scope > .g > .g-pcs") && !wb.closest(".wjoin") ? i : -1)).filter((i) => i >= 0), PER_PAGE);
  for (const i of idx) {
    if (met.length >= WANT) break;
    await p.evaluate((i) => { const wb = document.querySelectorAll(".he-text .wb:not(.mark)")[i]; wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w")).click(); }, i);
    await settle(p);
    let r = await read(p);
    // a division of blocks the line's pieces are, letter for letter
    if (r.blocks.length < 2 || r.parts.length !== r.blocks.length || r.counts.length !== r.blocks.length || !r.blocks.every((x, j) => [...x.L].length === r.counts[j])) { await p.keyboard.press("Escape"); await p.waitForTimeout(150); continue; }
    const tag = `${url.split("b=")[1] || url} word ${i + 1}`;
    // press each block whose line piece is one of its pills, the last such
    let done = false;
    for (let j = r.blocks.length - 1; j >= 0 && !done; j -= 1) {
      await p.evaluate((j) => document.querySelectorAll("#hud > .rows .b-cell .s-pills button")[j].click(), j);
      await settle(p);
      r = await read(p);
      const piece = spanJoin(r.parts[j] || "").toLowerCase();
      if (!r.pills.some((x) => spanJoin(x.t).toLowerCase() === piece)) continue;
      done = true; met.push(tag);
      const lit = r.pills.find((x) => x.on);
      if (!lit || spanJoin(lit.t).toLowerCase() !== piece) b1.push(`${tag} block ${j + 1}: lit "${lit && lit.t}", the line reads "${r.parts[j]}"`);
      const wantHe = r.blocks.map((x) => x.t);
      const wantPieces = r.parts.map((x, k) => (k === j ? r.rowPill : x));
      if (JSON.stringify(r.rowHeParts) !== JSON.stringify(wantHe) || JSON.stringify(r.rowPieces) !== JSON.stringify(wantPieces))
        b2.push(`${tag}: row ${JSON.stringify(r.rowHeParts.length)} blocks, reads ${JSON.stringify(r.rowPieces)}, the line ${JSON.stringify(r.parts)}`);
      const want3 = await storeCount(r.blocks[j].L, r.rowPill);
      if (r.count !== want3) b3.push(`${tag} "${r.rowPill}": the row ${r.count}, the store ${want3}`);
      // B5: the reading the card stands lit on, picked from the concordance's
      // own list, is on the line after (the owner's own path)
      {
        const litT = (r.pills.find((x) => x.on) || {}).t;
        await p.evaluate(() => { const m = document.querySelector("#hud .dict-tab tbody tr.pick .r-pills button[aria-expanded=\"false\"]"); if (m) m.click(); });
        await p.waitForTimeout(400);
        const found = litT && await p.evaluate((t) => { const x = [...document.querySelectorAll("#hud .dict-tab tr.sub.reads .opts:not(.rest) .opt .r-pills button")].find((y) => y.textContent.trim() === t); if (x) x.click(); return !!x; }, litT);
        await settle(p);
        const r5 = await read(p);
        if (!found || spanJoin(r5.parts[j] || "").toLowerCase() !== spanJoin(litT).toLowerCase()) b5.push(`${tag} "${litT}" from the list: ${found ? `the line's piece "${r5.parts[j]}"` : "not in the list"}`);
        r = r5;
      }
      // another reading of the block, one the store places if any does
      let other = null;
      for (const x of r.pills) if (!x.on && x.t !== r.rowPill) { if (await storeCount(r.blocks[j].L, x.t)) { other = x.t; break; } if (!other) other = x.t; }
      if (other) {
        b4n += 1;
        await p.evaluate((t) => { const x = [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")].find((y) => y.textContent.trim() === t); if (x) x.click(); }, other);
        await settle(p);
        const r2 = await read(p);
        const want4 = await storeCount(r.blocks[j].L, other);
        if (spanJoin(r2.parts[j] || "") !== spanJoin(other) || r2.rowPill !== other || r2.count !== want4)
          b4.push(`${tag} "${other}": the line's piece "${r2.parts[j]}", the row "${r2.rowPill}" ${r2.count}, the store ${want4}`);
      }
    }
    await p.keyboard.press("Escape"); await p.waitForTimeout(150);
  }
  await p.close();
}
await b.close();
const say = (a, ok) => (a.length ? a.slice(0, 3).join("; ") : ok);
console.log(`${met.length} words met: ${met.join(", ")}`);
check("B1 a block opens on the line's own piece for it", met.length >= 3 && !b1.length, say(b1, `${met.length} blocks lit as the line reads them`));
check("B2 with a block pressed, the concordance row reads the whole word", met.length >= 3 && !b2.length, say(b2, "every block in the Hebrew, the line's pieces beside the pill"));
check("B3 the row's count is the block's letters' places read so", met.length >= 3 && !b3.length, say(b3, "every count the store's"));
check("B4 another reading of the block: the line, the row and the count follow", met.length >= 3 && b4n > 0 && !b4.length, say(b4, b4n ? `${b4n} other readings pressed, every one followed` : "no block offered another reading to press"));
check("B5 a reading picked from the concordance's list reaches the line", met.length >= 3 && !b5.length, say(b5, "every pick reached it"));
console.log(bad ? `\n${bad} failing` : "\nall checks passed");
process.exit(bad ? 1 : 0);
