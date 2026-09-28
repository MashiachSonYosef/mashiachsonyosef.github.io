#!/usr/bin/env node
// GUARDS: chapter-page-rule-v1-a-searchable-page-per-chapter-carries-the-readings-credited-and-no-ink-and-opens-the-reader-at-the-verse
// LEDGER: -
// no frame letter. A check reads the pages and judges them; it is not the
// ledger for one.
//
// THE CHAPTER PAGES ARE THE FRONT PORCH ONTO THE READER. A search for
// "Amos 3:7" has nothing to land on in a reader that is one address per book
// with the text arriving sealed, so the door writes a static page per
// chapter of every stamped book (tools/build-front-door-v1.mjs): the
// reference in the title, every verse a heading, under each the readings
// the shelf prints for its words with their sources numbered, and a link
// that opens the reader at that verse. The porch carries no ink.
//
//   P1  every stamped book has a page for every chapter its sections name,
//       and the sitemap lists each one
//   P2  no chapter page carries a character of the Hebrew text
//   P3  every section label of the book stands on its chapter page as a
//       heading, and every reading shown is a reading the zone bakes for a
//       word of that verse, credited to the source the zone credits
//   P4  a verse's link opens the reader at that verse: the reader lands with
//       the verse marked, and the words under it carry the same readings
//
// Serves the publication itself from the repository root, as
// check-clean-address-v1 does. Run: node tools/check-chapter-pages-v1.mjs
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
const unesc = (t) => String(t).replace(/&quot;/g, "\"").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

const stamped = [];
for (const f of readdirSync(ZONES)) {
  if (!f.endsWith(".bin") || f.slice(0, -4).includes(".") || f.startsWith("fixture-")) continue;
  let z; try { z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8")); } catch { continue; }
  if (z.count_stamp) stamped.push({ slug: f.slice(0, -4), z });
}
if (!stamped.length) { console.log("SKIPPED — no stamped book on this disk"); process.exit(3); }
const sitemap = existsSync(join(ROOT, "sitemap.xml")) ? readFileSync(join(ROOT, "sitemap.xml"), "utf8") : "";

const p1 = [], p2 = [], p3 = [];
let pages = 0, headings = 0, readings = 0;
for (const { slug, z } of stamped) {
  const chapters = new Map();
  for (const sec of z.sections || []) {
    const label = String(sec.label || ""); if (!label) continue;
    const ch = label.includes(":") ? label.split(":")[0] : label;
    if (!chapters.has(ch)) chapters.set(ch, []);
    chapters.get(ch).push(sec);
  }
  for (const [ch, secs] of chapters) {
    const file = join(ROOT, slug, ch, "index.html");
    if (!existsSync(file)) { p1.push(`${slug}/${ch}`); continue; }
    if (!sitemap.includes(`/${slug}/${ch}/</loc>`)) p1.push(`${slug}/${ch} (not in the sitemap)`);
    pages += 1;
    const html = readFileSync(file, "utf8");
    if (HEBREW.test(html)) p2.push(`${slug}/${ch}`);
    for (const sec of secs) {
      const label = String(sec.label);
      const id = `v${label.replace(/[^0-9a-z]+/gi, "-")}`;
      const at = html.indexOf(`<h2 id="${id}">`);
      if (at < 0) { p3.push(`${slug}/${ch}: no heading for ${label}`); continue; }
      headings += 1;
      const end = html.indexOf("<p class=\"open\">", at);
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
          else baked.push({ text: String(g), who });
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
check("P1  every chapter of every stamped book has its page, and the sitemap lists it", p1.length === 0, p1.slice(0, 3).join(" | "));
check("P2  no chapter page carries a character of the Hebrew", p2.length === 0, p2.slice(0, 3).join(" | "));
check("P3  every verse stands as a heading and every reading shown is the zone's, credited as the zone credits it", p3.length === 0, p3.slice(0, 2).join(" | "));

// P4 — the link into the reader, served from the repository root
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
const sec = (pick.z.sections || []).find((s) => String(s.label || "").includes(":") && (s.words || []).some((w) => w.k && pick.z.gloss[w.k])) || pick.z.sections[0];
const label = String(sec.label), ch = label.includes(":") ? label.split(":")[0] : label;
await page.goto(`${origin}/${pick.slug}/${ch}/`, { waitUntil: "load" });
const title = await page.title();
check("    the chapter page opens with the reference in its title", title.startsWith(`${pick.z.work} ${ch}`), title);
const href = await page.evaluate((id) => document.querySelector(`#${id} + p + p.open a, #${id} ~ p.open a`)?.getAttribute("href") || null, `v${label.replace(/[^0-9a-z]+/gi, "-")}`);
check("    and the verse carries a link into the reader at its own coordinate", href === `/${pick.slug}/?at=${encodeURIComponent(label)}`, href || "no link");
if (href) {
  await page.goto(`${origin}${href}`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForSelector("section.seg .he-text .wb", { timeout: 30000 });
  await page.waitForTimeout(800);
  const landed = await page.evaluate(() => {
    const at = document.querySelector(".vnum.at"); const sec = at && at.closest("section.seg");
    const top = sec ? Math.round(sec.getBoundingClientRect().top) : null;
    const lines = sec ? [...sec.querySelectorAll(".wb > .g:not(.bare)")].map((g) => (g.title || "").trim()).filter(Boolean) : [];
    return { marked: !!at, label: at ? at.textContent.trim() : null, top, lines };
  });
  const bakedLines = (sec.words || []).flatMap((w) => Array.isArray(w.w) ? w.w.map((r) => r.k) : (w.k ? [w.k] : [])).map((k) => pick.z.gloss[k]).filter(Boolean).map(String);
  const overlap = landed.lines.filter((l) => bakedLines.includes(l)).length;
  check("P4  the reader lands on that verse, marked and in view, and its lines carry the page's readings",
    landed.marked && landed.top !== null && landed.top >= 0 && landed.top < 400 && overlap >= Math.min(3, bakedLines.length),
    `marked ${landed.marked} (${landed.label}) · top ${landed.top}px · ${overlap} of ${bakedLines.length} readings on the lines`);
}
await b.close();
srv.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
