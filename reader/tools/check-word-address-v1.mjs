// A WORD'S ADDRESS (the owner, 2026-10-17: a book's name, then "1:1:3"):
// book, chapter, verse and the word's number in the verse as written, the
// marks not counted.
//   W1  #1:1:3 lands on the book's 1:1 and opens the card on its third word,
//       whose head reads 1:1:3; the clean address stays the chapter's
//   W2  a span's address (#ref:first) opens the span's card, its head
//       ref:first-last, the span read off the span store's own places
//   W3  a word after a mark keeps its number (the mark takes none), and a
//       word inside a place the store names opens the place's card, its head
//       the place's address; the word is found on the page, after its mark
//   W4  the export names each record's word in this site's own words
// The book is the first served zone, never named here (check-scope-derived
// S1); a span place and a marked word are found in the data and on the page.
// Usage: node tools/check-word-address-v1.mjs [url]
import { readFileSync, existsSync } from "node:fs";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl, zoneIdOf, zonesOnDisk } from "./zones-on-disk-v1.mjs";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  \u00B7  " + d : ""}`); };
const pw = await loadPlaywright();
const URL0 = defaultZoneUrl(/^https?:/u.test(process.argv[2] || "") ? process.argv[2] : "");
const BASE = URL0.split("?")[0];
const BOOK = zoneIdOf(URL0);
const b = await pw.chromium.launch(launchOptions());
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
const p = await ctx.newPage();
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.addInitScript(() => { try { localStorage.clear(); localStorage.setItem("fh.nums", "on"); } catch { /* fresh reader */ } });
const letters = (s) => [...String(s || "")].filter((c) => c >= "\u05D0" && c <= "\u05EA").join("");
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
    const texts = words.map((w) => (w.querySelector(":scope > .w") || w).textContent);
    // a word inside a joined card (a maqaf compound, a run) opens that card,
    // whose head is the range of its words
    const rangeOf = (wb) => { const j = wb && wb.closest(".wjoin"); const inner = j ? [...j.querySelectorAll(".wb:not(.mark)")] : []; return inner.length > 1 ? [words.indexOf(inner[0]) + 1, words.indexOf(inner[inner.length - 1]) + 1] : null; };
    return { range: rangeOf(active), head: wn ? wn.textContent.trim() : null, he: he ? he.textContent.trim() : null, verse: sec ? (sec.querySelector(".vnum") || {}).textContent : null, cn, cns, texts, hash: location.hash, path: location.pathname + location.search, marked: !!(sec && sec.querySelector(".vnum.at")) };
  });
};
{
  const r = await land(BOOK, "1:1:3");
  const third = letters(r.texts[2]);
  // the third word may stand inside a joined card: then its card is the
  // join's, the head the join's range, and the head's letters hold the word's
  const head = r.range && r.range[0] <= 3 && r.range[1] >= 3 ? `1:1:${r.range[0]}\u2013${r.range[1]} \u25C2` : "1:1:3 \u25C2";
  check(`W1  #1:1:3 lands on the book's 1:1 and opens its third word's card, the head ${head.trim()}`, r.verse === "1:1" && r.head === head && !!third && letters(r.he).includes(third) && r.marked, `verse ${r.verse} \u00B7 head "${r.head}" \u00B7 ${r.he} \u00B7 marked ${r.marked}`);
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await p.waitForTimeout(600);
  const addr = await p.evaluate(() => location.hash);
  check("    and the address is the chapter's once the reader has moved on", addr === "", `hash "${addr}"`);
}
// W2: a span the store places in this book, or in the first book that has one
{
  let span = null;
  for (const book of [BOOK, ...zonesOnDisk().filter((z) => z !== BOOK)]) {
    const f = `data/span-store/${book}.json`;
    if (!existsSync(f)) continue;
    const list = (JSON.parse(readFileSync(f, "utf8")).placesList || []).filter((q) => q.inside_of == null && !(q.overlaps || []).length && !(q.contains || []).length && q.last > q.first);
    if (list.length) { span = { book, ...list[0] }; break; }
  }
  if (span) {
    const r = await land(span.book, `${span.ref}:${span.first}`);
    check(`W2  #${span.ref}:${span.first} opens the span's card, its head ${span.ref}:${span.first}\u2013${span.last}`, r.verse === span.ref && r.head === `${span.ref}:${span.first}\u2013${span.last} \u25C2`, `verse ${r.verse} \u00B7 head "${r.head}" \u00B7 ${r.he}`);
  } else console.log("  --  W2 skipped: no span store places a span in any zone on disk");
}
// W3: a word standing after a mark, found on the page (sections build as
// the page is read, so the page is read down until one is met)
{
  await p.goto(`${BASE}?b=${BOOK}`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  let hit = null;
  for (let y = 0; y < 60000 && !hit; y += 1500) {
    await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(120);
    hit = await p.evaluate(() => {
      for (const sec of document.querySelectorAll("section.seg")) {
        const all = [...sec.querySelectorAll(".he-text .wb")];
        for (let i = 1; i < all.length; i += 1) {
          if (all[i - 1].classList.contains("mark") && !all[i].classList.contains("mark")) {
            const words = all.filter((x) => !x.classList.contains("mark"));
            const n = words.indexOf(all[i]) + 1;
            const join = all[i].closest(".wjoin");
            const inner = join ? [...join.querySelectorAll(".wb:not(.mark)")] : [];
            const range = inner.length > 1 ? [words.indexOf(inner[0]) + 1, words.indexOf(inner[inner.length - 1]) + 1] : null;
            return { label: (sec.querySelector(".vnum") || {}).textContent, n, range };
          }
        }
      }
      return null;
    });
  }
  if (hit) {
    const r = await land(BOOK, `${hit.label}:${hit.n}`);
    const head = hit.range ? `${hit.label}:${hit.range[0]}\u2013${hit.range[1]} \u25C2` : `${hit.label}:${hit.n} \u25C2`;
    check(`W3  ${hit.label}:${hit.n} is the word after a mark, numbered ${hit.n} on the page${hit.range ? `, and opens the card of the place it stands in (${hit.label}:${hit.range[0]}\u2013${hit.range[1]})` : ""}`,
      r.verse === hit.label && r.head === head && r.cns[hit.n - 1] === String(hit.n) && r.cns.every((c, i) => c === String(i + 1)),
      `verse ${r.verse} \u00B7 head "${r.head}" \u00B7 numbers ${r.cns.join(" ")}`);
  } else console.log("  --  W3 skipped: no word after a mark met in the first stretch of the page");
}
// W4: the export of the book's 1:1 names the word each record stands for
{
  await p.goto(`${BASE}?b=${BOOK}#v1-1`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  const text = await p.evaluate(async () => {
    const sec = [...document.querySelectorAll("section.seg")].find((s) => (s.querySelector(".vnum") || {}).textContent === "1:1");
    const btn = [...sec.querySelectorAll(".xp-row button.xp")].find((x) => x.textContent === "hebrew + english");
    let got = null;
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
  const fors = (text || "").match(/^\s+for: .+? 1:1:\d+$/gmu) || [];
  const recs = (text || "").match(/^\d+\. /gmu) || [];
  check("W4  the export names, under each record, the word it was cited for", !!text && recs.length > 0 && fors.length === recs.length, text ? `${recs.length} records \u00B7 ${fors.length} with a word \u00B7 ${fors.slice(0, 3).map((x) => x.trim()).join(" | ")}` : "no export produced");
}
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
