#!/usr/bin/env node
// The front door, and the addresses it opens.
//
// The site's own root is a splash: the books that are finished, and nothing
// else clickable. Each is reached at a clean address derived from its work id —
// which is a small page that hands the reader to the one zone reader and tells
// it which address to keep. The reader rewrites its bar to that address, which
// means every path it fetches afterwards has to have been resolved before the
// rewrite, not from the bar. That is what ROOT is for, and this is the check
// that it stays that way: an address in the bar the server never served, and
// the readings still arriving.
//
// It serves its own copy of the deployed tree, because the thing under test is
// the shape of that tree — deploy-root/ over the site root, the reader under
// genesis-book-reader-v4/ — and a check that read the reader at its own path
// would never see it. It takes no URL for the same reason.
// GUARDS: title-key-rule-v1-only-what-the-store-already-attests, front-door-rule-v1-the-door-lists-what-the-zones-carry
//
import { createServer } from "node:http";
import { readFile, mkdtemp, mkdir, cp, symlink } from "node:fs/promises";
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { tmpdir } from "node:os";
import { join, dirname, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import pw from "/home/claude/.npm-global/lib/node_modules/playwright/index.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const plan = JSON.parse(readFileSync(join(K3, "build", "build-plan-v1.json"), "utf8"));
// What the masthead should say is not typed here: it is read out of the zone
// the page is about to load. A check that carries its own copy of a title is
// checking the page against me rather than against the chain.
const titleOf = (book) => {
  const z = JSON.parse(gunzipSync(readFileSync(join(K3, "data", "zones", `${book}.bin`))).toString("utf8"));
  return [z.work_he || "", z.work || ""];
};
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

const site = await mkdtemp(join(tmpdir(), "tabernacle-site-"));
await cp(join(K3, "deploy-root"), site, { recursive: true });
await mkdir(join(site, "genesis-book-reader-v4"), { recursive: true });
await cp(join(K3, "zone.html"), join(site, "genesis-book-reader-v4", "zone.html"));
await symlink(join(K3, "data"), join(site, "genesis-book-reader-v4", "data"));

const TYPES = { ".html": "text/html; charset=utf-8", ".json": "application/json" };
const srv = createServer(async (req, res) => {
  const p = normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  // What was asked of the address travels with it. Pages keeps the query
  // across the directory redirect, and a stub that dropped it would report a
  // failure the real host does not have — the harness has to be the faithful
  // part or the check is testing the harness.
  const qs = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  try {
    let file = join(site, p);
    if (!extname(p)) {
      // Pages answers a directory with its index.html; so does this.
      if (p.endsWith("/")) file = join(file, "index.html");
      else { res.writeHead(301, { Location: `${p}/${qs}` }); return res.end(); }
    }
    const body = await readFile(file);
    // shards arrive gzipped and are unpacked by the page, not the transport
    res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch { res.writeHead(404); res.end("no"); }
});
await new Promise((r) => srv.listen(0, "127.0.0.1", r));
const B = `http://127.0.0.1:${srv.address().port}`;

const b = await pw.chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });

await p.goto(`${B}/`, { waitUntil: "networkidle" });
const splash = await p.evaluate(() => ({
  title: document.title,
  links: [...document.querySelectorAll("a")].map((a) => a.getAttribute("href")),
  body: document.body.textContent.replace(/\s+/g, " "),
  offscreen: document.documentElement.scrollWidth > window.innerWidth + 1,
  // A Hebrew name never stands by itself: whatever box carries it carries the
  // English too, so a reader who cannot read it still knows what it offers.
  he: [...document.querySelectorAll('[lang="he"]')].map((e) => {
    const box = e.closest("a, h1, h2");
    return { t: e.textContent.trim(), paired: !!box && /[A-Za-z]/.test(box.textContent.replace(e.textContent, "")) };
  }),
}));
console.log("— the splash —");
check("it names the site", /Tabernacle/.test(splash.title), splash.title);
// Every way out of the front door lands on a finished book. There is more than
// one way to reach each of them now — the book itself, and the commentary
// carried on it, which opens inside that book because that is where a
// commentary is read. What must not appear is a destination that is not a
// finished book.
{
  // The finished books used to be typed here — two of them, while a third
  // published work a reader could open sat off the door entirely. The list is
  // the plan's now, same as the door's own, so this check and the page it
  // checks cannot disagree about what is published by each carrying a copy.
  const FINISHED = plan.works.map((w) => `/${w.published_as}`);
  // A destination is the address, not what is asked of it: /genesis and
  // /genesis?c=open are the same book, opened two ways. What must not appear
  // is a place that is not a finished book.
  const dest = (h) => String(h).split("?")[0];
  const stray = splash.links.filter((h) => !FINISHED.includes(dest(h)));
  check("every way off it lands on a finished book",
    stray.length === 0 && FINISHED.every((f) => splash.links.map(dest).includes(f)),
    `${splash.links.length} links · ${splash.links.join(" ")}${stray.length ? ` · stray: ${stray.join(" ")}` : ""}`);
  // The door is built from the zones, so what it offers is what is there. A
  // commentary the zones carry and the door does not mention is the fault this
  // whole generator exists to make impossible.
  check("and the commentary is offered, not left off",
    /Commentary on Genesis/.test(splash.body || "") && /Commentary on I Kings/.test(splash.body || ""),
    (splash.body || "").match(/Commentary on [A-Za-z ]+/g)?.join(" · ") || "none offered");
}
check("it does not run off the side", !splash.offscreen);
// Two kinds of text are allowed on our own surfaces: text from the chain,
// carrying its record, and plain English of ours that says what a thing is.
// Hebrew we typed is neither, and the site's own name was the worst place for
// it — the one string on the page with nothing behind it, at the top.
const framed = await p.evaluate(() => {
  const labOf = (e) => (e.closest(".row")?.querySelector(".lab")?.textContent || "").trim();
  return {
    inSiteName: document.querySelectorAll("h1 [lang='he']").length,
    hebrews: [...document.querySelectorAll('[lang="he"]')].map((e) => ({ t: e.textContent.trim(), lab: labOf(e) })),
    commons: [...document.querySelectorAll("a.book .en")].map((e) => ({ t: e.textContent.trim(), lab: labOf(e) })),
    unnamed: [...document.querySelectorAll("a.book .he.none")].map((e) => e.textContent.trim()),
  };
});
check("the site's own name carries no Hebrew that nothing recorded",
  framed.inSiteName === 0, `${framed.inSiteName} found`);
// The door prints a book's own title exactly as its zone carries it — the
// ledger's word — and nothing else in Hebrew. Every Hebrew string on the door
// must be one of the zones' own titles; a work whose ledger names none shows
// the open slot in the masthead's words.
{
  const carried = new Set(plan.works.map((w) => titleOf(w.published_as)[0]).filter(Boolean));
  const strays = framed.hebrews.filter((x) => !carried.has(x.t));
  check("every Hebrew on the door is a title a zone carries, and nothing else",
    strays.length === 0,
    strays.length ? strays.map((x) => x.t).join(" · ") : `${framed.hebrews.length} titles, all carried`);
  const unnamedWorks = plan.works.filter((w) => !titleOf(w.published_as)[0]).length;
  check("and a work whose ledger names no title shows the open slot",
    framed.unnamed.length >= Math.min(unnamedWorks, 1) && framed.unnamed.every((t) => /none is recorded/.test(t)),
    `${framed.unnamed.length} slots for ${unnamedWorks} unnamed works`);
}
// The register never softens, here least of all: the English on a card is a
// forced reading of the Hebrew above it, recorded or awaited.
check("and the English beside it is labelled as the forced reading it is",
  framed.commons.length > 0 && framed.commons.every((x) => /^commonly force read as$/i.test(x.lab)),
  framed.commons.map((x) => `${x.t} under "${x.lab}"`).join(" · "));


// What the masthead should say is not typed here: it is read out of the zone
// the page is about to load. A check that carries its own copy of a title is
// checking the page against me rather than against the chain.
// The walked addresses come from the same plan as the door, not a typed list
// — every published work gets its masthead read against its own zone.
const WALK = plan.works.map((w) => [`/${w.published_as}`, ...titleOf(w.published_as)]);
for (const [href, ...expected] of WALK) {
  const [heTitle, en] = expected;
  console.log(`— ${href} —`);
  await p.goto(`${B}/`, { waitUntil: "networkidle" });
  await Promise.all([p.waitForURL(new RegExp(`\\${href}$`), { timeout: 20000 }), p.click(`a[href="${href}"]`)]);
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 25000 });
  await p.waitForTimeout(700);
  const r = await p.evaluate(() => {
    const he = document.querySelector("#workTitle .he-t"), enEl = document.querySelector("#workTitle .en-t");
    const labOf = (e2) => (e2.closest(".t-row")?.querySelector(".t-lab")?.textContent || "").trim();
    return { addr: location.pathname + location.search, title: document.title,
      he: (he.querySelector(".w") || he).textContent.trim(), en: enEl.textContent.trim(),
      heLab: labOf(he), enLab: labOf(enEl), heUnnamed: he.classList.contains("unnamed"),
      lic: (() => { const c = document.getElementById("workLic"); return c && !c.hidden ? c.textContent.trim() : ""; })(),
      titleOpens: !!document.querySelector("#workTitle .he-t .wb"),
      words: document.querySelectorAll("section.seg .he-text .wb").length,
      glossed: [...document.querySelectorAll("section.seg .he-text .wb .g")].filter((g) => g.textContent.trim()).length,
      sections: document.querySelectorAll("section.seg").length,
      // The header offers one thing: the way out. A book offers its own text;
      // the door offers the books, and a reader goes through the door.
      nav: [...document.querySelectorAll("header.top nav a")].map((a) => a.getAttribute("href")),
      navHe: document.querySelectorAll('header.top nav [lang="he"]').length,
      navLab: (document.querySelector("#home .nav-lab")?.textContent || "").trim(),
      navRight: (() => {
        const a = document.querySelector("#home a.home"), h = document.querySelector("header.top");
        if (!a || !h) return false;
        const ar = a.getBoundingClientRect(), hr = h.getBoundingClientRect();
        return hr.right - ar.right < hr.width / 3 && ar.top - hr.top < 90;
      })() };
  });
  check("  the bar keeps the clean address", r.addr === href, r.addr);
  check("  the tab names the book in both", r.title.includes(en) && (!heTitle || r.title.includes(heTitle)), r.title);
  check("  the masthead carries the book's own title, said to be the title",
    /^book title$/i.test(r.heLab) && (heTitle ? r.he === heTitle && !r.heUnnamed
      : r.heUnnamed && /ledger/i.test(r.he)), `"${r.heLab}": ${r.he}`);
  // And it is a word of the corpus, not a caption: it opens the same catalogue
  // every other word of the book opens.
  check("  and it opens like any word of the text", heTitle ? r.titleOpens : !r.titleOpens,
    r.titleOpens ? "pressable" : "not pressable");
  // The English over a book title is always a forced reading — the label never
  // softens, whether or not a record happens to carry that reading. What
  // changes is what rides beside it: the licence of the record that reads the
  // title's own form that way where one exists, and no chip where none does.
  // The honesty lives in the chip, never in dropping "force". An earlier form
  // of this check asserted the softening itself; the register rule outranks it.
  check("  and the common name, said to be a forced reading, never softened",
    /^commonly force read as$/i.test(r.enLab) && r.en === en, `"${r.enLab}": ${r.en}`);
  check("  with a licence where a record reads it that way, and none where none does",
    heTitle ? r.lic.length > 2 : !r.lic,
    `${r.enLab} · ${r.lic || "no licence"}`);
  check("  the zone still loads under the rewritten bar", r.sections > 100 && r.words > 3, `${r.sections} sections`);
  check("  and its readings came with it", r.glossed > 0, `${r.glossed} of ${r.words} words glossed`);

  // Navigation carries coordinates. A title is corpus text and belongs in the
  // masthead, out of the ledger, where it can be tapped and defined — a copy of
  // it typed into a link would be the one string on the page with nothing
  // behind it.
  check("  the header offers one way out and nothing else",
    r.nav.length === 1 && r.nav[0] === "/", r.nav.join(" ") || "nothing");
  check("  it says what it is, in plain English", /home/i.test(r.navLab), r.navLab || "unsaid");
  check("  and it sits in the corner the eye goes to", r.navRight);
  check("  the nav prints no title, only where to go", r.navHe === 0, `${r.navHe} Hebrew in the nav`);

  // The store is fetched shard by shard as words are pressed — long after the
  // bar stopped saying where the page came from.
  await p.click("section.seg .he-text .wb");
  await p.waitForTimeout(1000);
  const card = await p.evaluate(() => {
    const h = document.getElementById("hud");
    return { open: !h.hidden, readings: h.querySelectorAll(".r-pills button").length,
      lic: (h.querySelector(".d-card .d-foot")?.textContent || "").replace(/\s+/g, " ").trim().slice(0, 52) };
  });
  check("  a word still reaches the store and opens its record",
    card.open && card.readings > 0, `${card.readings} readings · ${card.lic}`);
  await p.keyboard.press("Escape");
}

console.log("— the addresses on their own —");
const A0 = `/${plan.works[plan.works.length - 1].published_as}`;
await p.goto(`${B}${A0}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb", { timeout: 25000 });
const typed = await p.evaluate(() => ({ addr: location.pathname, secs: document.querySelectorAll("section.seg").length }));
check("a clean address typed in lands on the reader and stays",
  typed.addr === A0 && typed.secs > 100, `${typed.addr} · ${typed.secs} sections`);

// A published address is a promise: every republished address in the history
// record still answers, as a redirect to where its work now lives.
{
  const histPath = join(K3, "data", "address-history-v1.json");
  if (existsSync(histPath)) {
    const hist = JSON.parse(readFileSync(histPath, "utf8"));
    const slugOfWork = new Map(plan.works.map((w) => [w.work_id, w.published_as]));
    for (const row of hist.republished || []) {
      const target = `/${slugOfWork.get(row.to_work_id)}`;
      await p.goto(`${B}/${row.from}`, { waitUntil: "networkidle" });
      await p.waitForSelector("section.seg .he-text .wb", { timeout: 25000 });
      const r2 = await p.evaluate(() => ({ addr: location.pathname, secs: document.querySelectorAll("section.seg").length }));
      check(`the republished address /${row.from} still answers, at its work's new address`,
        r2.addr === target && r2.secs > 100, `/${row.from} → ${r2.addr} · ${r2.secs} sections`);
    }
  }
}

await p.goto(`${B}/genesis-book-reader-v4/zone.html?b=genesis`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb", { timeout: 25000 });
const raw = await p.evaluate(() => ({ addr: location.pathname, secs: document.querySelectorAll("section.seg").length,
  glossed: [...document.querySelectorAll("section.seg .he-text .wb .g")].filter((g) => g.textContent.trim()).length }));
check("and the reader at its own path is untouched by any of it",
  raw.addr === "/genesis-book-reader-v4/zone.html" && raw.secs > 100 && raw.glossed > 0,
  `${raw.addr} · ${raw.secs} sections · ${raw.glossed} glossed`);

// ---- the door's commentary entries open a commentary --------------------
//
// "Commentary on Genesis" is offered on the door as its own way in. A way in
// that lands a reader at the top of a book with every commentary still shut is
// not one — they arrive at the thing they asked for and have to go find it. So
// the entry carries ?c=open, the address page carries it through, and the
// reader presses the first mark and the first work behind it.
console.log("— a commentary entry opens a commentary —");
await p.goto(`${B}/`, { waitUntil: "networkidle" });
const doorLinks = await p.evaluate(() => [...document.querySelectorAll("a.sub-book")]
  .map((a) => ({ href: a.getAttribute("href"), en: a.querySelector(".en")?.textContent || "" })));
check("the door offers a commentary entry per book that carries one",
  doorLinks.length >= 2 && doorLinks.every((l) => /\?c=open$/.test(l.href)),
  doorLinks.map((l) => l.href).join(" · ") || "none");

const wordGrain = plan.works.find((w) => w.basis === "SEALED_Y_LEDGER") || plan.works[0];
const sectionGrain = plan.works.find((w) => w.basis !== "SEALED_Y_LEDGER") || plan.works[plan.works.length - 1];
for (const [slug, shape] of [[wordGrain.published_as, "word"], [sectionGrain.published_as, "section"]]) {
  await p.goto(`${B}/${slug}?c=open`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 25000 });
  await p.waitForTimeout(2500);
  const r = await p.evaluate(() => ({
    addr: location.pathname,
    panels: document.querySelectorAll("section.seg .c-mark-slot:not(.c-choose)").length,
    inline: [...document.querySelectorAll("section.seg .c-inline")].filter((x) => !x.hidden).length,
    said: (document.querySelector(".c-how-said, .c-att")?.textContent || "").replace(/\s+/g, " ").slice(0, 60),
  }));
  const opened = shape === "word" ? r.panels : r.inline;
  check(`  ${slug} arrives with a commentary already open`, opened > 0,
    `${r.panels} panel(s), ${r.inline} in line · "${r.said}…"`);
  check(`  and the address is still the clean one`, r.addr === `/${slug}`, r.addr);
}
// and the book's own entry still opens the book, not a commentary
await p.goto(`${B}/genesis`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb", { timeout: 25000 });
await p.waitForTimeout(1200);
const shut = await p.evaluate(() => document.querySelectorAll("section.seg .c-mark-slot:not(.c-choose)").length);
check("  while the book's own entry opens the book with nothing pressed", shut === 0, `${shut} open`);

// Nothing is rewritten on a say-so that did not come from our own redirect.
await p.goto(`${B}/genesis-book-reader-v4/zone.html?b=genesis&clean=..%2F..%2Fevil`, { waitUntil: "networkidle" });
const hostile = await p.evaluate(() => location.pathname);
check("a clean= that is not one of ours is ignored",
  hostile === "/genesis-book-reader-v4/zone.html", hostile);

await p.close(); await b.close(); srv.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
