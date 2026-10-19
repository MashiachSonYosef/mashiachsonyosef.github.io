// A WORD'S ADDRESS (the owner, 2026-10-17: "genesis 1:1:3"): book, chapter,
// verse and the word's number in the verse as written, the marks not counted.
//   W1  #1:1:3 lands on Genesis 1:1 and opens the card on its third word,
//       whose head reads 1:1:3; the clean address stays the chapter's
//   W2  a span's address (#35:19:7) opens the span's card, its head 35:19:7-8
//   W3  a word after a mark keeps its number (Numbers 10:31:7 is the word
//       after the paseq, numbered 7 on the page), and a word inside a place
//       the store names opens the place's card, its head the place's address
//   W4  the export names each record's word in this site's own words
// Usage: node tools/check-word-address-v1.mjs [url]
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  \u00b7  " + d : ""}`); };
const pw = await loadPlaywright();
const BASE = defaultZoneUrl(/^https?:/u.test(process.argv[2] || "") ? process.argv[2] : "").split("?")[0];
const b = await pw.chromium.launch(launchOptions());
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
const p = await ctx.newPage();
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.addInitScript(() => { try { localStorage.clear(); localStorage.setItem("fh.nums", "on"); } catch { /* fresh reader */ } });
const land = async (book, hash) => {
  await p.goto(`${BASE}?b=${book}#${hash}`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  const t0 = Date.now(); while (Date.now() - t0 < 12000 && !(await p.$("#hud .head .wn"))) await p.waitForTimeout(100);
  await p.waitForTimeout(300);
  return p.evaluate(() => {
    const h = document.getElementById("hud");
    const wn = h && h.querySelector(".head .wn");
    const he = h && h.querySelector(".head b");
    const active = document.querySelector("section.seg .wb.active");
    const sec = active && active.closest("section.seg");
    // a card's number is carried by the card (its --cn), drawn by its letters' box
    const num = (wb) => { const v = wb && wb.style.getPropertyValue("--cn"); return v ? JSON.parse(v) : null; };
    const cn = num(active);
    const words = sec ? [...sec.querySelectorAll(".he-text .wb:not(.mark)")] : [];
    const cns = words.map((w) => num(w) || "");
    return { head: wn ? wn.textContent.trim() : null, he: he ? he.textContent.trim() : null, verse: sec ? (sec.querySelector(".vnum") || {}).textContent : null, cn, cns, hash: location.hash, path: location.pathname + location.search, marked: !!document.querySelector(".vnum.at") };
  });
};
const alef = "\u05d0\u05dc\u05d4\u05d9\u05dd";
{
  const r = await land("genesis", "1:1:3");
  check("W1  #1:1:3 lands on Genesis 1:1 and opens its third word's card, the head 1:1:3", r.verse === "1:1" && r.head === "1:1:3 \u25c2" && [...(r.he || "")].filter((c) => c >= "\u05d0" && c <= "\u05ea").join("") === alef && r.marked, `verse ${r.verse} \u00b7 head "${r.head}" \u00b7 ${r.he} \u00b7 verse marked ${r.marked}`);
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await p.waitForTimeout(600);
  const addr = await p.evaluate(() => location.hash);
  check("    and the address is the chapter's once the reader has moved on", addr === "", `hash "${addr}"`);
}
{
  const r = await land("genesis", "35:19:7");
  check("W2  #35:19:7 opens the span's card on Bethlehem, its head 35:19:7\u20138", r.verse === "35:19" && r.head === "35:19:7\u20138 \u25c2", `verse ${r.verse} \u00b7 head "${r.head}" \u00b7 ${r.he}`);
}
{
  const r = await land("numbers", "10:31:7");
  // the seventh word stands after the paseq and is numbered 7 (the mark takes
  // none); it lies inside the place ki al-ken, so the place's card opens, 6-8
  check("W3  Numbers 10:31:7 is the word after the paseq, numbered 7 on the page, and opens the card of the place it stands in (10:31:6\u20138)", r.verse === "10:31" && r.head === "10:31:6\u20138 \u25c2" && r.cns[6] === "7" && r.cns.every((c, i) => c === String(i + 1)), `verse ${r.verse} \u00b7 head "${r.head}" \u00b7 the page numbers ${r.cns.join(" ")}`);
}
// W4: the export of Genesis 1:1 names the word each record stands for
{
  await p.goto(`${BASE}?b=genesis#v1-1`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  const text = await p.evaluate(async () => {
    const sec = [...document.querySelectorAll("section.seg")].find((s) => (s.querySelector(".vnum") || {}).textContent === "1:1");
    const btn = [...sec.querySelectorAll(".xp-row button.xp")].find((x) => x.textContent === "hebrew + english");
    let got = null;
    const save = window.__saveFileHook; // none: read the armed render instead
    btn.click();
    const t0 = Date.now(); while (Date.now() - t0 < 15000 && !btn.classList.contains("armed")) await new Promise((r) => setTimeout(r, 100));
    // the armed bundles are rendered by the second press; capture the file through the anchor the page makes
    const orig = URL.createObjectURL; const blobs = [];
    URL.createObjectURL = (bl) => { blobs.push(bl); return orig.call(URL, bl); };
    HTMLAnchorElement.prototype.click = function () { /* no download in the check */ };
    btn.click();
    await new Promise((r) => setTimeout(r, 300));
    URL.createObjectURL = orig;
    if (blobs.length) got = await blobs[0].text();
    return got;
  });
  const fors = (text || "").match(/^\s+for: Genesis 1:1:\d+$/gmu) || [];
  const recs = (text || "").match(/^\d+\. /gmu) || [];
  check("W4  the export names, under each record, the word it was cited for", !!text && recs.length > 0 && fors.length === recs.length, text ? `${recs.length} records \u00b7 ${fors.length} with a word \u00b7 ${fors.slice(0, 3).map((x) => x.trim()).join(" | ")}` : "no file came back");
}
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
