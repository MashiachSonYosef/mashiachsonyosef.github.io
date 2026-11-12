#!/usr/bin/env node
// RUN: tree
// GUARDS: chapter-page-rule-v3-the-chapters-address-is-the-reader-opened-at-the-chapter-and-the-lines-it-draws-stand-under-it-in-plain-text-credited-and-no-ink, resting-lines-rule-v1-the-plain-list-under-a-chapter-is-a-recording-of-the-lines-the-reader-draws-as-it-opens
// LEDGER: -
// no frame letter. A check reads the pages and judges them; it is not the
// ledger for one.
//
// A CHAPTER'S ADDRESS IS THE BOOK'S OWN PAGE, OPEN AT THE CHAPTER, AND THE
// PLAIN LIST UNDER IT IS THE LINE ABOVE IT. A search for "Amos 3:7" has
// nothing to land on in a reader that is one address per book with the text
// arriving sealed, so the door writes an address per chapter of every
// stamped book (tools/build-front-door-v1.mjs): the reader itself, told in
// its head which chapter it opens at, with a plain list under the text slot
// (the porch): every verse a heading, under each the readings of its words
// with their sources numbered, in plain text a crawler reads before any
// script runs. The engine hides the list once the text is drawn; it stays on
// a page the book never reaches. The list carries no ink.
//
// WHAT V2 OF THIS CHECK HELD, AND WHAT IT MISSED. It held the list to the
// zone's baked table, oldest witness first, which is what the door printed;
// and in a browser it asked that three of one verse's readings be found
// somewhere on that verse's lines. From 6 November 2026 the reader's resting
// line is the place's own reading, then the pointing's leader, and the list
// went on printing the table: this check passed for six days while God was
// "judges" in the list and "God" on the line above it. An outside reader set
// the two side by side on 12 November. A check that holds a page to the rule
// its builder follows proves the builder follows its rule; it does not prove
// the page says what the reader says.
//
// So the list is now a recording of the reader's own lines
// (tools/resting-lines-v1.mjs), and this check holds every link of that:
//
//   P1  every stamped book has an address for every chapter its sections
//       name, the sitemap lists each one, and the book's own page names
//       every chapter address on its porch
//   P2  no chapter page carries a character of the Hebrew text
//   P3  the list is the record: on every chapter page of every stamped book
//       every verse stands as a heading, and the readings under it are, one
//       for one and in order, the lines the record keeps for that verse,
//       each credited to the source and license the record names
//   P4  the chapter page IS the reader: it names the book and the chapter in
//       its head, its canonical is its own address, and it loads the same
//       engine stylesheet and script the book's page loads
//   R1  the record is of this tree: the page it was read off and every file
//       that page asked for stand on the disk with the sha256 it names
//   L1  THE LIST IS THE LINE, in a browser, on one chapter of every stamped
//       book: the chapter's own address is opened as a first visit opens it,
//       the list is read off the page and the lines the reader draws are
//       read off the same page, and under every verse of the chapter they
//       are the same readings, one for one
//   L2  and those lines are the lines the record keeps, text and credit
//   L3  by another road: the text the browser itself renders for those lines
//       (which leaves out whatever is not displayed) holds the same
//       characters in the same order as the readings read off them
//   P5  opened in a browser, the page draws the book, lands on the chapter
//       head in view, keeps the chapter in its title and hides the list; a
//       verse heading's anchor (#v3-7) lands on that verse, marked
//   P6  and on a page the book never reaches (the bin refused by the
//       network) the list stands, readings and all
//
// A BROWSER THAT STOPS ANSWERING IS SAID AND THE PAGE READ AGAIN, NEVER
// WAITED ON. Each book's page is given a time (PAGE_STALL_MS, 120 s); past
// it the browser is closed whole and opened again and the page read once
// more; a page unread twice fails this check in words.
//
// Run: node tools/check-chapter-pages-v3.mjs   (from reader/)
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { serveTree } from "./serve-tree-v1.mjs";
import { readRecord, recordPath, whyNotOfThisTree, linesOnPage, creditedIn } from "./resting-lines-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const ROOT = join(K3, "..");
const ZONES = join(K3, "data", "zones");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const few = (a, k = 3) => a.slice(0, k).join(" | ") + (a.length > k ? ` … and ${a.length - k} more` : "");
const num = (v) => Number(v).toLocaleString("en-US");
const HEBREW = /[֐-׿]/u;
const unesc = (t) => String(t).replace(/&quot;/g, "\"").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const attr = (html, re) => { const m = html.match(re); return m ? unesc(m[1]) : null; };
const chOf = (l) => (String(l).includes(":") ? String(l).split(":")[0] : String(l));
const idOf = (label) => `v${String(label).replace(/[^0-9a-z]+/gi, "-")}`;

const stamped = [];
for (const f of readdirSync(ZONES).sort()) {
  if (!f.endsWith(".bin") || f.slice(0, -4).includes(".") || f.startsWith("fixture-")) continue;
  let z; try { z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8")); } catch { continue; }
  if (z.count_stamp) stamped.push({ slug: f.slice(0, -4), z });
}
if (!stamped.length) { console.log("SKIPPED — no stamped book on this disk"); process.exit(3); }
const sitemap = existsSync(join(ROOT, "sitemap.xml")) ? readFileSync(join(ROOT, "sitemap.xml"), "utf8") : "";

// what the record says a verse's list holds: for each line, its text and who is credited, or that it quotes Hebrew
const expectOf = (record, at) => {
  const credit = creditedIn(record, at);
  return record.sections[at][1].map(([, , text], j) => {
    const who = credit[j];
    if (HEBREW.test(String(text)) || who.some((w) => !w || HEBREW.test(w.label))) return { quotes: true };
    return { text: String(text), who: who.map((w) => `${w.label} \u00b7 ${w.license}`) };
  });
};

const p1 = [], p2 = [], p3 = [], p4 = [], r1 = [];
let pages = 0, headings = 0, readings = 0, files = 0;
const seen = new Map();
const books = [];
for (const { slug, z } of stamped) {
  const record = readRecord(recordPath(K3, slug));
  const why = whyNotOfThisTree(K3, record, seen);
  if (!why.length && record.sections.length !== (z.sections || []).length) why.push(`it holds ${record.sections.length} sections and the zone ${(z.sections || []).length}`);
  if (why.length) r1.push(`${slug}: ${few(why, 2)}`);
  else files += Object.keys(record.read_off.files).length;
  const chapters = new Map();
  (z.sections || []).forEach((sec, at) => {
    const label = String(sec.label || ""); if (!label) return;
    const ch = chOf(label);
    if (!chapters.has(ch)) chapters.set(ch, []);
    chapters.get(ch).push({ sec, at });
  });
  books.push({ slug, z, record: why.length ? null : record, chapters });
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
    // P3 — the list against the record, position by position: a reading two
    // words of one verse share from two sources is two readings, not one
    const legend = new Map([...html.matchAll(/<li value="(\d+)">([^<]*)<\/li>/g)].map((m) => [m[1], unesc(m[2])]));
    for (const { sec, at } of secs) {
      const label = String(sec.label);
      const from = html.indexOf(`<h3 id="${idOf(label)}">`);
      if (from < 0) { p3.push(`${slug}/${ch}: no heading for ${label}`); continue; }
      headings += 1;
      if (!record || why.length) continue;
      const end = html.indexOf("</article>", from);
      const block = html.slice(from, end < 0 ? undefined : end);
      const shown = [...block.matchAll(/<span>([^<]*?)(?:<sup>([\d,]+)<\/sup>)?<\/span>|<i>([^<]*)<\/i>/g)]
        .map((m) => (m[3] !== undefined ? { quotes: /quotes Hebrew/.test(m[3]), empty: !/quotes Hebrew/.test(m[3]) } : { text: unesc(m[1]), nums: m[2] ? m[2].split(",") : [] }))
        // a verse with no reading prints one sentence saying so; that sentence is not a reading
        .filter((x) => !x.empty);
      const want = expectOf(record, at);
      if (shown.length !== want.length) { p3.push(`${slug}/${ch} ${label}: ${shown.length} readings in the list, ${want.length} lines in the record`); continue; }
      for (let i = 0; i < shown.length; i += 1) {
        const s = shown[i], w = want[i];
        if (s.quotes || w.quotes) { if (!(s.quotes && w.quotes)) { p3.push(`${slug}/${ch} ${label}: reading ${i + 1} quotes Hebrew on one side only`); break; } continue; }
        readings += 1;
        if (s.text !== w.text) { p3.push(`${slug}/${ch} ${label}: reading ${i + 1} is "${s.text}" in the list and "${w.text}" on the line`); break; }
        const who = s.nums.map((n) => legend.get(n) || "");
        if (who.length !== w.who.length || who.some((x, j) => x !== w.who[j])) { p3.push(`${slug}/${ch} ${label}: "${s.text}" is credited to "${who.join(" and ").slice(0, 60)}" in the list and to "${w.who.join(" and ").slice(0, 60)}" on the line`); break; }
      }
    }
  }
}
console.log(`— ${stamped.length} stamped books · ${num(pages)} chapter pages · ${num(headings)} verse headings · ${num(readings)} readings read back —`);
check("P1  every chapter of every stamped book has its address, the sitemap lists it, and the book's page names it", p1.length === 0, few(p1));
check("P2  no chapter page carries a character of the Hebrew", p2.length === 0, few(p2));
check("R1  the record of each book's lines is of this tree: the page it was read off and every file that page asked for stand as it names them", r1.length === 0,
  r1.length ? few(r1, 2) : `${stamped.length} records · ${num(files)} file fingerprints taken again`);
check("P3  the list is the record: every verse stands as a heading and its readings are the record's lines, one for one, credited as the record credits them", p3.length === 0 && r1.length === 0,
  p3.length ? few(p3, 2) : r1.length ? "not read where no record of this tree is kept" : `${num(readings)} readings on ${num(pages)} pages`);
check("P4  the chapter page is the reader: book and chapter in its head, its own canonical, the book page's engine", p4.length === 0, few(p4));

// ── in a browser, the publication itself served from the repository root ────
const PAGE_MS = Number(process.env.PAGE_STALL_MS) || 120000;
const tree = await serveTree(ROOT);
const pw = await loadPlaywright();
let b = await pw.chromium.launch(launchOptions());
const strip = (t) => String(t).replace(/[\s+]/gu, "");

/** One chapter of one book, at its own address, as a first visit: the list
 *  read off the page, and the lines the reader draws for the chapter's
 *  verses read off the same page. */
const readChapter = async (book, ch) => {
  const secs = book.chapters.get(ch);
  const from = secs[0].at, to = secs[secs.length - 1].at + 1;
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  try {
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e && e.message)));
    await page.goto(`${tree.base}/${book.slug}/${ch}/`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForSelector("section.seg .he-text .wb", { timeout: 30000 });
    const list = await page.evaluate(() => [...document.querySelectorAll("#porch article.pv")].map((a) => ({
      id: (a.querySelector("h3") || {}).id || "",
      items: [...a.querySelectorAll(".r > span, .r > i")].map((x) => { if (x.tagName === "I") return /quotes Hebrew/.test(x.textContent) ? null : undefined; const c = x.cloneNode(true); c.querySelectorAll("sup").forEach((s) => s.remove()); return c.textContent; }).filter((x) => x !== undefined),
    })));
    const got = await linesOnPage(page, { from, to, seen: true });
    return { list, got, errors, from };
  } finally { await ctx.close(); }
};

const l1 = [], l2 = [], l3 = [], unread = [], stalled = [];
let chaptersRead = 0, versesRead = 0, linesRead = 0;
for (const book of books) {
  if (!book.record) continue;
  const chs = [...book.chapters.keys()];
  const ch = chs[Math.floor(chs.length / 2)];
  let r = null, why = "";
  for (let attempt = 0; attempt < 2 && !r; attempt += 1) {
    let timer = null;
    const late = new Promise((_, no) => { timer = setTimeout(() => no(new Error("STALLED")), PAGE_MS); });
    try { r = await Promise.race([readChapter(book, ch), late]); }
    catch (e) {
      why = String((e && e.message) || e).split("\n")[0];
      if (why === "STALLED") { stalled.push(`${book.slug}/${ch}`); await Promise.race([b.close(), new Promise((q) => setTimeout(q, 5000))]).catch(() => {}); b = await pw.chromium.launch(launchOptions()); }
      else attempt = 2;
    } finally { clearTimeout(timer); }
  }
  if (!r) { unread.push(`${book.slug}/${ch}: ${why === "STALLED" ? "the browser stopped answering twice" : why}`); continue; }
  if (r.errors.length) { unread.push(`${book.slug}/${ch}: the page threw while it drew: ${r.errors[0]}`); continue; }
  chaptersRead += 1;
  const listById = new Map(r.list.map((a) => [a.id, a.items]));
  for (const s of r.got.sections) {
    const label = String(book.z.sections[s.i].label);
    versesRead += 1; linesRead += s.units.length;
    // L1 — the list on the page against the lines on the page
    const credit = creditedIn(book.record, s.i);
    const drawn = s.units.map(([, , text], j) => (HEBREW.test(text) || (credit[j] || []).some((w) => !w || HEBREW.test(w.label)) ? null : text));
    const listed = listById.get(idOf(label));
    if (!listed) l1.push(`${book.slug} ${label}: the list has no such verse`);
    else if (listed.length !== drawn.length || listed.some((t, i) => t !== drawn[i])) {
      const i = listed.findIndex((t, x) => t !== drawn[x]);
      l1.push(`${book.slug} ${label}: ${listed.length !== drawn.length ? `${listed.length} readings in the list, ${drawn.length} lines drawn` : `reading ${i + 1} is "${listed[i]}" in the list and "${drawn[i]}" on the line`}`);
    }
    // L2 — the lines on the page against the record
    if (JSON.stringify(s.units) !== JSON.stringify(book.record.sections[s.i][1])) {
      const kept = book.record.sections[s.i][1];
      const i = s.units.findIndex((u, x) => JSON.stringify(u) !== JSON.stringify(kept[x]));
      l2.push(`${book.slug} ${label}: ${s.units.length !== kept.length ? `${s.units.length} lines drawn, ${kept.length} kept` : `line ${i + 1} is drawn ${JSON.stringify(s.units[i])} and kept ${JSON.stringify(kept[i])}`}`);
    }
    // L3 — the browser's own rendering of those lines against what was read off them
    if (strip(s.seen) !== strip(s.units.map((u) => u[2]).join(""))) l3.push(`${book.slug} ${label}: rendered "${String(s.seen).trim().slice(0, 70)}", read "${s.units.map((u) => u[2]).join(" · ").slice(0, 70)}"`);
  }
}
check("    every chapter asked for was read: a page the browser stops answering on twice running is not passed over", unread.length === 0,
  unread.length ? few(unread, 2) : `${chaptersRead} chapters, one of every book with a record${stalled.length ? ` · the browser stopped answering and was opened again for ${stalled.join(", ")}` : ""}`);
check("L1  the list is the line: under every verse of the chapter the list's readings are the lines the reader draws, one for one", l1.length === 0 && chaptersRead > 0,
  l1.length ? few(l1, 2) : `${num(versesRead)} verses · ${num(linesRead)} lines on ${chaptersRead} chapter pages`);
check("L2  and those lines are the lines the record keeps, text and credit", l2.length === 0 && chaptersRead > 0, l2.length ? few(l2, 2) : `${num(linesRead)} lines`);
check("L3  by another road: the text the browser itself renders for those lines holds the readings' characters in their order", l3.length === 0 && chaptersRead > 0, l3.length ? few(l3, 2) : `${num(versesRead)} verses`);

// P5, P6 — one page, landed on and then refused its book. A chapter past the
// first, so landing on it is a scroll and not the top of the page by
// accident; the first book that has one.
const pick = books.find((x) => x.chapters.size > 2) || books[0];
{
  const chs = [...pick.chapters.keys()];
  const ch = chs[Math.min(2, chs.length - 1)];
  const { sec } = pick.chapters.get(ch)[0];
  const label = String(sec.label);
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  page.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await page.goto(`${tree.base}/${pick.slug}/${ch}/`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForSelector("section.seg .he-text .wb", { timeout: 30000 });
  await page.waitForTimeout(800);
  const landed = await page.evaluate(([lbl, node]) => {
    const secEl = [...document.querySelectorAll("section.seg")].find((s) => ((s.querySelector(".vnum") || {}).textContent || "").trim() === lbl);
    const nh = document.getElementById(`n${node}`);
    const topOf = (el) => (el ? Math.round(el.getBoundingClientRect().top) : null);
    const porch = document.getElementById("porch");
    return { title: document.title, headTop: topOf(nh), secTop: topOf(secEl), porchHidden: !!porch && porch.hidden, marked: !!document.querySelector(".vnum.at") };
  }, [label, sec.node]);
  const inView = (t) => t !== null && t >= -1 && t < 500;
  check("P5  the chapter address draws the book and lands on the chapter head, in view, marking no verse",
    (inView(landed.headTop) || inView(landed.secTop)) && !landed.marked,
    `${pick.slug} ${ch} · chapter head at ${landed.headTop}px · first verse at ${landed.secTop}px · marked ${landed.marked}`);
  check("    the title keeps the chapter once the page has drawn", landed.title.includes(`${pick.z.work} ${ch}`), landed.title);
  check("    the list stands down once the text is drawn", landed.porchHidden, `hidden ${landed.porchHidden}`);
  // a verse heading's anchor lands on the verse, marked; in a page of its own:
  // from the same address, a hash alone is a jump within the document and the
  // engine does not run again, which is the browser's rule and not the page's
  const id = idOf(label);
  const fresh = await b.newPage({ viewport: { width: 412, height: 915 } });
  fresh.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
  await fresh.goto(`${tree.base}/${pick.slug}/${ch}/#${id}`, { waitUntil: "networkidle", timeout: 60000 });
  await fresh.waitForSelector("section.seg .he-text .wb", { timeout: 30000 });
  await fresh.waitForTimeout(800);
  const anchored = await fresh.evaluate(() => {
    const at = document.querySelector(".vnum.at"); const s = at && at.closest("section.seg");
    return { marked: !!at, label: at ? at.textContent.trim() : null, top: s ? Math.round(s.getBoundingClientRect().top) : null };
  });
  check("    a verse heading's anchor lands the reader on that verse, marked and in view",
    anchored.marked && anchored.label === label && inView(anchored.top), `#${id} → marked ${anchored.marked} (${anchored.label}) · top ${anchored.top}px`);

  // P6 — the book never arrives: the list stays, with the readings the record keeps for the verse
  const kept = pick.record ? expectOf(pick.record, pick.chapters.get(ch)[0].at).filter((x) => !x.quotes).length : -1;
  const cold = await b.newPage({ viewport: { width: 412, height: 915 } });
  await cold.route(/\.bin(\?.*)?$/, (r) => r.abort());
  await cold.goto(`${tree.base}/${pick.slug}/${ch}/`, { waitUntil: "networkidle", timeout: 60000 });
  await cold.waitForTimeout(1500);
  const stood = await cold.evaluate((hid) => {
    const porch = document.getElementById("porch");
    const h = porch && porch.querySelector(`#${hid}`);
    return { porch: !!porch, hidden: !!porch && porch.hidden, heading: h ? h.textContent.trim() : null,
      readings: h ? h.parentElement.querySelectorAll(".r span").length : 0, drawn: !!document.querySelector("section.seg") };
  }, id);
  check("P6  on a page the book never reaches the list stands, readings and all",
    stood.porch && !stood.hidden && stood.heading === `${pick.z.work} ${label}` && stood.readings === kept && !stood.drawn,
    `list ${stood.porch} · hidden ${stood.hidden} · "${stood.heading}" with ${stood.readings} readings (the record keeps ${kept}) · text drawn ${stood.drawn}`);
}
await b.close();
await tree.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
