#!/usr/bin/env node
// GUARDS: chapter-page-rule-v2-the-chapters-address-is-the-reader-opened-at-the-chapter-and-its-readings-stand-in-plain-text-credited-and-no-ink
// LEDGER: -
// no frame letter. A check reads the pages and judges them; it is not the
// ledger for one.
//
// A CHAPTER'S ADDRESS IS THE BOOK'S OWN PAGE, OPEN AT THE CHAPTER. A search
// for "Amos 3:7" has nothing to land on in a reader that is one address per
// book with the text arriving sealed, so the door writes an address per
// chapter of every stamped book (tools/build-front-door-v1.mjs) — and that
// address serves the reader itself, told in its head which chapter it opens
// at, titled for the chapter, with a porch under the text slot: every verse
// a heading, under each the readings the shelf prints for its words with
// their sources numbered, in plain text a crawler reads before any script
// runs. The engine hides the porch once the text is drawn; it stays on a
// page the book never reaches. The first cut (v1) was a separate plain page
// with a link into the reader; the owner, 2026-09-28: "its not our book page
// anymore". The porch carries no ink.
//
//   P1  every stamped book has an address for every chapter its sections
//       name, the sitemap lists each one, and the book's own page names
//       every chapter address on its porch
//   P2  no chapter page carries a character of the Hebrew text
//   P3  every section label of the book stands on its chapter's porch as a
//       heading, and every reading shown is a reading the zone bakes for a
//       word of that verse, credited to the source the zone credits
//   P4  the chapter page IS the reader: it names the book and the chapter in
//       its head, its canonical is its own address, and it loads the same
//       engine stylesheet and script the book's page loads
//   P5  opened in a browser, the page draws the book, lands on the chapter
//       head in view, keeps the chapter in its title, hides the porch, and
//       the lines under the chapter's first verse carry the porch's readings;
//       a verse heading's anchor (#v3-7) lands on that verse, marked
//   P6  and on a page the book never reaches — the bin refused by the
//       network — the porch stands, readings and all
//
// Serves the publication itself from the repository root, as
// check-clean-address-v1 does. Run: node tools/check-chapter-pages-v2.mjs
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createServer } from "node:http";
import { dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const ROOT = join(K3, "..");
const ZONES = join(K3, "data", "zones");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const HEBREW = /[֐-׿]/u;
const spanJoin = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\.$/, "");
const unesc = (t) => String(t).replace(/&quot;/g, "\"").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const attr = (html, re) => { const m = html.match(re); return m ? unesc(m[1]) : null; };

const stamped = [];
for (const f of readdirSync(ZONES)) {
  if (!f.endsWith(".bin") || f.slice(0, -4).includes(".") || f.startsWith("fixture-")) continue;
  let z; try { z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8")); } catch { continue; }
  if (z.count_stamp) stamped.push({ slug: f.slice(0, -4), z });
}
if (!stamped.length) { console.log("SKIPPED — no stamped book on this disk"); process.exit(3); }
const sitemap = existsSync(join(ROOT, "sitemap.xml")) ? readFileSync(join(ROOT, "sitemap.xml"), "utf8") : "";

const p1 = [], p2 = [], p3 = [], p4 = [];
let pages = 0, headings = 0, readings = 0;
for (const { slug, z } of stamped) {
  const chapters = new Map();
  for (const sec of z.sections || []) {
    const label = String(sec.label || ""); if (!label) continue;
    const ch = label.includes(":") ? label.split(":")[0] : label;
    if (!chapters.has(ch)) chapters.set(ch, []);
    chapters.get(ch).push(sec);
  }
  const bookFile = join(ROOT, slug, "index.html");
  const bookHtml = existsSync(bookFile) ? readFileSync(bookFile, "utf8") : "";
  const bookCss = attr(bookHtml, /<link rel="stylesheet" href="([^"]+)">/), bookJs = attr(bookHtml, /<script src="([^"]+)">/);
  if (!bookHtml.includes('<section id="porch"')) p1.push(`${slug}: the book's page carries no porch naming its chapters`);
  for (const [ch, secs] of chapters) {
    const file = join(ROOT, slug, ch, "index.html");
    if (!existsSync(file)) { p1.push(`${slug}/${ch}`); continue; }
    if (!sitemap.includes(`/${slug}/${ch}/</loc>`)) p1.push(`${slug}/${ch} (not in the sitemap)`);
    if (!bookHtml.includes(`href="/${slug}/${ch}/"`)) p1.push(`${slug}/${ch} (the book's page does not name it)`);
    pages += 1;
    const html = readFileSync(file, "utf8");
    if (HEBREW.test(html)) p2.push(`${slug}/${ch}`);
    // P4 — the head says which book and which chapter; the engine is the book page's
    if (attr(html, /<meta name="reader-book" content="([^"]*)">/) !== slug) p4.push(`${slug}/${ch}: reader-book`);
    if (attr(html, /<meta name="reader-at" content="([^"]*)">/) !== ch) p4.push(`${slug}/${ch}: reader-at`);
    const canon = attr(html, /<link rel="canonical" href="([^"]*)">/);
    if (!canon || !canon.endsWith(`/${slug}/${ch}/`) || !/^https?:\/\//.test(canon)) p4.push(`${slug}/${ch}: canonical ${canon}`);
    const title = attr(html, /<title>([^<]*)<\/title>/) || "";
    if (!title.startsWith(`${z.work} ${ch}`)) p4.push(`${slug}/${ch}: title "${title}"`);
    if (!bookCss || attr(html, /<link rel="stylesheet" href="([^"]+)">/) !== bookCss) p4.push(`${slug}/${ch}: stylesheet differs from the book page's`);
    if (!bookJs || attr(html, /<script src="([^"]+)">/) !== bookJs) p4.push(`${slug}/${ch}: script differs from the book page's`);
    if (!html.includes('<main id="text"></main>\n<section id="porch"')) p4.push(`${slug}/${ch}: the porch does not stand under the text slot`);
    for (const sec of secs) {
      const label = String(sec.label);
      const id = `v${label.replace(/[^0-9a-z]+/gi, "-")}`;
      const at = html.indexOf(`<h3 id="${id}">`);
      if (at < 0) { p3.push(`${slug}/${ch}: no heading for ${label}`); continue; }
      headings += 1;
      const end = html.indexOf("</article>", at);
      const block = html.slice(at, end < 0 ? undefined : end);
      // the page prints readings in word order; so does this walk, and the
      // two are compared position by position — a reading text shared by two
      // words of one verse from two sources is two readings, not one
      const shown = [...block.matchAll(/<span>([^<]*?)(?:<sup>(\d+)<\/sup>)?<\/span>|<i>([^<]*)<\/i>/g)]
        .map((m) => (m[3] !== undefined ? { quotes: /quotes Hebrew/.test(m[3]), empty: !/quotes Hebrew/.test(m[3]) } : { text: unesc(m[1]), num: m[2] || null }))
        // a verse the scribes wrote no word for (Joshua 21:36) prints one
        // sentence saying so; that sentence is not a reading
        .filter((x) => !x.empty);
      const baked = [];
      for (const w of sec.words || []) {
        const keys = Array.isArray(w.w) ? w.w.map((r) => r.k) : (w.k ? [w.k] : []);
        for (const k of keys) {
          const g = z.gloss[k]; if (!g) continue;
          const m = z.gloss_m ? z.gloss_m[k] : null;
          const who = m && m.m ? String(m.m) : "";
          if (HEBREW.test(String(g)) || HEBREW.test(who)) baked.push({ quotes: true });
          else baked.push({ text: spanJoin(g), who });
        }
      }
      const legend = new Map([...html.matchAll(/<li value="(\d+)">([^<]*)<\/li>/g)].map((m) => [m[1], unesc(m[2])]));
      if (shown.length !== baked.length) { p3.push(`${slug}/${ch} ${label}: ${shown.length} readings shown, ${baked.length} baked`); continue; }
      for (let i = 0; i < shown.length; i += 1) {
        const s = shown[i], bk = baked[i];
        if (s.quotes || bk.quotes) { if (!(s.quotes && bk.quotes)) { p3.push(`${slug}/${ch} ${label}: reading ${i + 1} quotes Hebrew on one side only`); break; } continue; }
        readings += 1;
        if (s.text !== bk.text) { p3.push(`${slug}/${ch} ${label}: reading ${i + 1} shows "${s.text}", the zone bakes "${bk.text}"`); break; }
        const who = s.num ? (legend.get(s.num) || "") : "";
        if (bk.who && !who.startsWith(bk.who)) { p3.push(`${slug}/${ch} ${label}: "${s.text}" credited to "${who.slice(0, 40)}" but the zone credits "${bk.who.slice(0, 40)}"`); break; }
      }
    }
  }
}
console.log(`— ${stamped.length} stamped books · ${pages.toLocaleString()} chapter pages · ${headings.toLocaleString()} verse headings · ${readings.toLocaleString()} readings read back —`);
check("P1  every chapter of every stamped book has its address, the sitemap lists it, and the book's page names it", p1.length === 0, p1.slice(0, 3).join(" | "));
check("P2  no chapter page carries a character of the Hebrew", p2.length === 0, p2.slice(0, 3).join(" | "));
check("P3  every verse stands as a heading on the porch and every reading shown is the zone's, credited as the zone credits it", p3.length === 0, p3.slice(0, 2).join(" | "));
check("P4  the chapter page is the reader: book and chapter in its head, its own canonical, the book page's engine", p4.length === 0, p4.slice(0, 3).join(" | "));

// P5, P6 — in a browser, served from the repository root
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".bin": "application/octet-stream", ".xml": "application/xml", ".txt": "text/plain" };
const srv = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let f = join(ROOT, p);
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html");
  if (!existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" }); res.end(readFileSync(f));
});
await new Promise((r) => srv.listen(0, "127.0.0.1", r));
const origin = `http://127.0.0.1:${srv.address().port}`;
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
page.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
const pick = stamped.find((s) => s.slug === "amos") || stamped[0];
// a chapter past the first, so landing on it is a scroll and not the top of
// the page by accident; and its first verse that carries a reading
const chOf = (l) => (String(l).includes(":") ? String(l).split(":")[0] : String(l));
const chs = [...new Set((pick.z.sections || []).map((s) => chOf(s.label || "")).filter(Boolean))];
const ch = chs[Math.min(2, chs.length - 1)];
const sec = (pick.z.sections || []).find((s) => chOf(s.label || "") === ch && (s.words || []).some((w) => w.k && pick.z.gloss[w.k]))
  || (pick.z.sections || []).find((s) => chOf(s.label || "") === ch);
const label = String(sec.label);
const secKeys = (sec.words || []).flatMap((w) => Array.isArray(w.w) ? w.w.map((r) => r.k) : (w.k ? [w.k] : [])).filter((k) => pick.z.gloss[k]);
const bakedLines = secKeys.map((k) => pick.z.gloss[k]).map(spanJoin);
// the porch prints a reading as a span unless it quotes Hebrew letters
const porchSpans = secKeys.filter((k) => !HEBREW.test(String(pick.z.gloss[k])) && !HEBREW.test(String((pick.z.gloss_m && pick.z.gloss_m[k] && pick.z.gloss_m[k].m) || ""))).length;
await page.goto(`${origin}/${pick.slug}/${ch}/`, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForSelector("section.seg .he-text .wb", { timeout: 30000 });
await page.waitForTimeout(800);
const landed = await page.evaluate(([lbl, node]) => {
  const secEl = [...document.querySelectorAll("section.seg")].find((s) => (s.querySelector(".vnum")?.textContent || "").trim() === lbl);
  const nh = document.getElementById(`n${node}`);
  const topOf = (el) => (el ? Math.round(el.getBoundingClientRect().top) : null);
  const porch = document.getElementById("porch");
  return {
    title: document.title,
    headTop: topOf(nh), secTop: topOf(secEl),
    porchHidden: !!porch && porch.hidden,
    marked: !!document.querySelector(".vnum.at"),
    lines: secEl ? [...secEl.querySelectorAll(".wb > .g:not(.bare)")].map((g) => (g.title || "").trim()).filter(Boolean) : [],
  };
}, [label, sec.node]);
const overlap = landed.lines.filter((l) => bakedLines.includes(l)).length;
const inView = (t) => t !== null && t >= -1 && t < 500;
check("P5  the chapter address draws the book and lands on the chapter head, in view, marking no verse",
  (inView(landed.headTop) || inView(landed.secTop)) && !landed.marked,
  `chapter head at ${landed.headTop}px · first verse at ${landed.secTop}px · marked ${landed.marked}`);
check("    the title keeps the chapter once the page has drawn", landed.title.includes(`${pick.z.work} ${ch}`), landed.title);
check("    the porch stands down once the text is drawn", landed.porchHidden, `hidden ${landed.porchHidden}`);
check("    and the lines under the chapter's first verse carry the porch's readings",
  overlap >= Math.min(3, bakedLines.length), `${overlap} of ${bakedLines.length} readings on the lines`);
// a verse heading's anchor lands on the verse, marked
// in a page of its own: from the same address, a hash alone is a jump within
// the document and the engine does not run again, which is the browser's
// rule and not the page's
const id = `v${label.replace(/[^0-9a-z]+/gi, "-")}`;
const fresh = await b.newPage({ viewport: { width: 412, height: 915 } });
fresh.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await fresh.goto(`${origin}/${pick.slug}/${ch}/#${id}`, { waitUntil: "networkidle", timeout: 60000 });
await fresh.waitForSelector("section.seg .he-text .wb", { timeout: 30000 });
await fresh.waitForTimeout(800);
const anchored = await fresh.evaluate(() => {
  const at = document.querySelector(".vnum.at"); const sec = at && at.closest("section.seg");
  return { marked: !!at, label: at ? at.textContent.trim() : null, top: sec ? Math.round(sec.getBoundingClientRect().top) : null };
});
check("    a verse heading's anchor lands the reader on that verse, marked and in view",
  anchored.marked && anchored.label === label && inView(anchored.top), `#${id} → marked ${anchored.marked} (${anchored.label}) · top ${anchored.top}px`);

// P6 — the book never arrives: the porch stays
const cold = await b.newPage({ viewport: { width: 412, height: 915 } });
await cold.route(/\.bin(\?.*)?$/, (r) => r.abort());
await cold.goto(`${origin}/${pick.slug}/${ch}/`, { waitUntil: "networkidle", timeout: 60000 });
await cold.waitForTimeout(1500);
const stood = await cold.evaluate((id) => {
  const porch = document.getElementById("porch");
  const h = porch && porch.querySelector(`#${id}`);
  return { porch: !!porch, hidden: !!porch && porch.hidden, heading: h ? h.textContent.trim() : null,
    readings: h ? h.parentElement.querySelectorAll(".r span").length : 0, drawn: !!document.querySelector("section.seg") };
}, id);
check("P6  on a page the book never reaches the porch stands, readings and all",
  stood.porch && !stood.hidden && stood.heading === `${pick.z.work} ${label}` && stood.readings === porchSpans && !stood.drawn,
  `porch ${stood.porch} · hidden ${stood.hidden} · "${stood.heading}" with ${stood.readings} readings · text drawn ${stood.drawn}`);
await b.close();
srv.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
